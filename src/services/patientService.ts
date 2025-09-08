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
  writeBatch
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
    tests: data.tests || []
  };
};

// Convert PatientData to Firestore document
const toFirestore = (patient: PatientData) => {
  return {
    ...patient,
    registrationDate: Timestamp.fromDate(patient.registrationDate),
    lastVisit: Timestamp.fromDate(patient.lastVisit || new Date()),
  };
};

export const getPatients = async (): Promise<PatientData[]> => {
  try {
    const q = query(collection(db, PATIENTS_COLLECTION), orderBy('registrationDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => fromFirestore(doc));
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

export const deletePatient = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting patient:', error);
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
