import { db } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const PATIENTS_COLLECTION = 'patients';

export interface PatientData {
  id?: string;
  hospitalId?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  registrationDate: Date;
  lastVisit: Date;
  balance: number;
  status: 'active' | 'inactive' | 'overdue';
  tests?: string[]; // Array of test IDs
  tags?: string[]; // Dynamic status tags like 'Billed', 'Report Printed'
  tagsHistory?: { tag: string; at: Date }[]; // History of tag applications
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

// Convert Firestore data to PatientData
const fromFirestore = (doc: any): PatientData => {
  const data = doc.data();
  return {
    id: doc.id,
    hospitalId: data.hospitalId || data.id, // backward compatibility if previously stored under 'id'
    name: data.name,
    age: data.age,
    gender: data.gender,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    registrationDate: data.registrationDate?.toDate(),
    lastVisit: data.lastVisit?.toDate(),
    balance: data.balance || 0,
    status: data.status || 'active',
    tests: data.tests || [],
    tags: data.tags || [],
    tagsHistory: (data.tagsHistory || []).map((h: any) => ({ tag: h.tag, at: h.at?.toDate ? h.at.toDate() : new Date(h.at) })),
    isDeleted: data.isDeleted || false,
    deletedAt: data.deletedAt?.toDate(),
    deletedBy: data.deletedBy
  };
};

// Convert PatientData to Firestore document
const toFirestore = (patient: PatientData) => {
  const data: any = {
    ...patient,
    registrationDate: Timestamp.fromDate(patient.registrationDate),
    lastVisit: Timestamp.fromDate(patient.lastVisit || new Date()),
  };
  
  if (patient.deletedAt) {
    data.deletedAt = Timestamp.fromDate(patient.deletedAt);
  }
  
  return data;
};

export const getPatients = async (includeDeleted: boolean = false): Promise<PatientData[]> => {
  try {
    // Use simple query to avoid composite index requirement
    const q = query(collection(db, PATIENTS_COLLECTION), orderBy('registrationDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const allPatients = querySnapshot.docs.map(doc => fromFirestore(doc));
    
    // Filter on client side to avoid composite index
    if (includeDeleted) {
      return allPatients;
    } else {
      return allPatients.filter(patient => !patient.isDeleted);
    }
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
};

export const getPatient = async (id: string): Promise<PatientData | null> => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return fromFirestore(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting patient:', error);
    throw error;
  }
};

export const addPatient = async (patient: Omit<PatientData, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), toFirestore(patient as PatientData));
    return docRef.id;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

export const updatePatient = async (id: string, patient: Partial<PatientData>): Promise<void> => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await updateDoc(docRef, toFirestore(patient as PatientData));
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// Realtime-safe helpers to manage patient's ordered tests
export const addTestToPatient = async (patientId: string, testId: string): Promise<void> => {
  if (!patientId || !testId) return;
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, patientId);
    await updateDoc(docRef, { tests: arrayUnion(testId), lastVisit: Timestamp.fromDate(new Date()) });
  } catch (error) {
    console.error('Error adding test to patient:', error);
    throw error;
  }
};

export const removeTestFromPatient = async (patientId: string, testId: string): Promise<void> => {
  if (!patientId || !testId) return;
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, patientId);
    await updateDoc(docRef, { tests: arrayRemove(testId), lastVisit: Timestamp.fromDate(new Date()) });
  } catch (error) {
    console.error('Error removing test from patient:', error);
    throw error;
  }
};

export const setPatientTests = async (patientId: string, tests: string[]): Promise<void> => {
  if (!patientId) return;
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, patientId);
    await updateDoc(docRef, { tests: tests ?? [], lastVisit: Timestamp.fromDate(new Date()) });
  } catch (error) {
    console.error('Error setting patient tests:', error);
    throw error;
  }
};

// Tag helpers
export const addPatientTag = async (patientId: string, tag: string): Promise<void> => {
  if (!patientId || !tag) return;
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, patientId);
    const now = Timestamp.fromDate(new Date());
    await updateDoc(docRef, { 
      tags: arrayUnion(tag),
      tagsHistory: arrayUnion({ tag, at: now }),
      lastVisit: now 
    });
  } catch (error) {
    console.error('Error adding patient tag:', error);
    throw error;
  }
};

export const removePatientTag = async (patientId: string, tag: string): Promise<void> => {
  if (!patientId || !tag) return;
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, patientId);
    await updateDoc(docRef, { tags: arrayRemove(tag), lastVisit: Timestamp.fromDate(new Date()) });
  } catch (error) {
    console.error('Error removing patient tag:', error);
    throw error;
  }
};

export const markPatientBilled = async (patientId: string): Promise<void> => addPatientTag(patientId, 'Billed');
export const markPatientReportPrinted = async (patientId: string): Promise<void> => addPatientTag(patientId, 'Report Printed');

// Soft delete a patient
export const softDeletePatient = async (id: string, deletedBy?: string): Promise<void> => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: Timestamp.fromDate(new Date()),
      deletedBy: deletedBy || 'system'
    });
  } catch (error) {
    console.error('Error soft deleting patient:', error);
    throw error;
  }
};

// Restore a soft-deleted patient
export const restorePatient = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await updateDoc(docRef, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null
    });
  } catch (error) {
    console.error('Error restoring patient:', error);
    throw error;
  }
};

// Permanently delete a patient (hard delete)
export const deletePatient = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

// Bulk soft delete patients
export const bulkSoftDeletePatients = async (ids: string[], deletedBy?: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const deleteData = {
      isDeleted: true,
      deletedAt: Timestamp.fromDate(new Date()),
      deletedBy: deletedBy || 'system'
    };

    ids.forEach(id => {
      const docRef = doc(db, PATIENTS_COLLECTION, id);
      batch.update(docRef, deleteData);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error bulk soft deleting patients:', error);
    throw error;
  }
};

// Bulk restore patients
export const bulkRestorePatients = async (ids: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const restoreData = {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null
    };

    ids.forEach(id => {
      const docRef = doc(db, PATIENTS_COLLECTION, id);
      batch.update(docRef, restoreData);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error bulk restoring patients:', error);
    throw error;
  }
};

// Bulk permanent delete patients
export const bulkDeletePatients = async (ids: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);

    ids.forEach(id => {
      const docRef = doc(db, PATIENTS_COLLECTION, id);
      batch.delete(docRef);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error bulk deleting patients:', error);
    throw error;
  }
};

// Get only soft-deleted patients
export const getDeletedPatients = async (): Promise<PatientData[]> => {
  try {
    // Use simple query and filter on client side to avoid index requirement
    const q = query(collection(db, PATIENTS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const allPatients = querySnapshot.docs.map(doc => fromFirestore(doc));
    
    // Filter and sort on client side
    return allPatients
      .filter(patient => patient.isDeleted)
      .sort((a, b) => {
        if (!a.deletedAt || !b.deletedAt) return 0;
        return b.deletedAt.getTime() - a.deletedAt.getTime();
      });
  } catch (error) {
    console.error('Error getting deleted patients:', error);
    throw error;
  }
};

export const searchPatients = async (searchTerm: string): Promise<PatientData[]> => {
  try {
    const patients = await getPatients();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(lowerSearchTerm) ||
      patient.phone.includes(searchTerm) ||
      patient.id?.toLowerCase().includes(lowerSearchTerm) ||
      patient.hospitalId?.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

// Danger: Bulk delete all patients for a hospital
// Uses batched writes with a limit of 500 operations per batch
export const deletePatientsByHospital = async (hospitalId: string): Promise<number> => {
  if (!hospitalId) throw new Error('hospitalId is required');
  try {
    let totalDeleted = 0;
    // Fetch in chunks to avoid very large batches
    const patientsQuery = query(collection(db, PATIENTS_COLLECTION), where('hospitalId', '==', hospitalId));
    const snapshot = await getDocs(patientsQuery);
    if (snapshot.empty) return 0;

    let batch = writeBatch(db);
    let ops = 0;
    for (const d of snapshot.docs) {
      batch.delete(d.ref);
      ops++;
      totalDeleted++;
      if (ops === 450) { // keep margin under 500
        await batch.commit();
        batch = writeBatch(db);
        ops = 0;
      }
    }
    if (ops > 0) {
      await batch.commit();
    }
    return totalDeleted;
  } catch (error) {
    console.error('Error deleting patients by hospital:', error);
    throw error;
  }
};
