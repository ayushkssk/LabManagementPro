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
  orderBy
} from 'firebase/firestore';

const TESTS_COLLECTION = 'tests';

export interface TestData {
  id?: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    unit?: string;
    normalRange?: string;
  }>;
}

// Get all tests
export const getTests = async (): Promise<TestData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, TESTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TestData[];
  } catch (error) {
    console.error('Error getting tests:', error);
    throw error;
  }
};

// Get a single test by ID
export const getTest = async (id: string): Promise<TestData | null> => {
  try {
    const docRef = doc(db, TESTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TestData;
    }
    return null;
  } catch (error) {
    console.error('Error getting test:', error);
    throw error;
  }
};

// Add a new test
export const addTest = async (test: Omit<TestData, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, TESTS_COLLECTION), test);
    return docRef.id;
  } catch (error) {
    console.error('Error adding test:', error);
    throw error;
  }
};

// Update an existing test
export const updateTest = async (id: string, test: Partial<TestData>): Promise<void> => {
  try {
    const testRef = doc(db, TESTS_COLLECTION, id);
    await updateDoc(testRef, test);
  } catch (error) {
    console.error('Error updating test:', error);
    throw error;
  }
};

// Delete a test
export const deleteTest = async (id: string): Promise<void> => {
  try {
    const testRef = doc(db, TESTS_COLLECTION, id);
    await deleteDoc(testRef);
  } catch (error) {
    console.error('Error deleting test:', error);
    throw error;
  }
};
