import { db } from '@/firebase';
import { demoTests } from '@/data/demoData';
import { testConfigurations, testConfigByTestId, sampleTests as moduleSampleTests } from '@/modules/tests/config';
import { extraDemoTests } from '@/modules/tests/generated';
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
  writeBatch,
  setDoc
} from 'firebase/firestore';

const TESTS_COLLECTION = 'tests'; // legacy fallback

// Resolve current tenant (hospital) context from localStorage user or explicit selection
const getTenantHospitalId = (): string | null => {
  try {
    const explicit = localStorage.getItem('activeHospitalId');
    if (explicit && explicit !== 'super-admin') return explicit;
    const userRaw = localStorage.getItem('demo-user');
    if (!userRaw) return null;
    const user = JSON.parse(userRaw);
    if (user?.hospitalId && user.hospitalId !== 'super-admin') return user.hospitalId;
    return null;
  } catch {
    return null;
  }
};

const testsCollectionRef = (dbRef: typeof db, hospitalId?: string) => {
  const hid = hospitalId ?? getTenantHospitalId();
  if (hid) {
    return collection(dbRef, `hospitals/${hid}/tests`);
  }
  // Fallback to legacy top-level
  return collection(dbRef, TESTS_COLLECTION);
};

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
  protected?: boolean;
}

// Get all tests
export const getTests = async (): Promise<TestData[]> => {
  try {
    const querySnapshot = await getDocs(testsCollectionRef(db));
    const remoteTests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TestData[];

    // Build hardcoded tests from demoData.ts (already in TestData shape)
    const hardcodedFromDemo: TestData[] = (demoTests || []).map((t: any) => {
      // Enrich with config fields if available and more complete
      const cfgKey = (testConfigByTestId as any)[t.id];
      const cfg = cfgKey ? (testConfigurations as any)[cfgKey] : null;
      const demoFields = (t.fields || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        unit: f.unit || '',
        normalRange: f.normalRange || ''
      }));
      const cfgFields = cfg?.fields ? cfg.fields.map((f: any) => ({
        id: f.id,
        name: f.label,
        type: f.type,
        unit: f.unit || '',
        normalRange: f.refRange || ''
      })) : [];
      const fields = cfgFields.length > demoFields.length ? cfgFields : demoFields;
      return {
        id: t.id,
        name: t.name,
        category: t.category,
        price: Number(t.price || 0),
        description: '',
        fields,
        protected: true
      } as TestData;
    });

    // Add any extra demo tests (from generated.ts)
    const hardcodedFromExtras: TestData[] = (extraDemoTests || []).map((t: any) => {
      const cfgKey = (testConfigByTestId as any)[t.id];
      const cfg = cfgKey ? (testConfigurations as any)[cfgKey] : null;
      const extraFields = (t.fields || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        unit: f.unit || '',
        normalRange: f.normalRange || ''
      }));
      const cfgFields = cfg?.fields ? cfg.fields.map((f: any) => ({
        id: f.id,
        name: f.label,
        type: f.type,
        unit: f.unit || '',
        normalRange: f.refRange || ''
      })) : [];
      const fields = cfgFields.length > extraFields.length ? cfgFields : extraFields;
      return {
        id: t.id,
        name: t.name,
        category: t.category,
        price: Number(t.price || 0),
        description: '',
        fields,
        protected: true
      } as TestData;
    });

    // Synthesize tests from modules/tests config if not present in demo lists
    const demoIds = new Set([...hardcodedFromDemo, ...hardcodedFromExtras].map(t => t.id));
    const synthesizedFromConfig: TestData[] = (moduleSampleTests || []).map((meta: any) => {
      if (demoIds.has(meta.id)) return null;
      const cfgKey = (testConfigByTestId as any)[meta.id];
      const cfg = cfgKey ? (testConfigurations as any)[cfgKey] : null;
      const fields = cfg?.fields ? cfg.fields.map((f: any) => ({
        id: f.id,
        name: f.label,
        type: f.type,
        unit: f.unit || '',
        normalRange: f.refRange || ''
      })) : [];
      return {
        id: meta.id,
        name: meta.name,
        category: meta.category || 'General',
        price: 0,
        description: '',
        fields,
        protected: true
      } as TestData;
    }).filter(Boolean) as TestData[];

    // Merge all sources and de-duplicate by id (prefer remote > demo > synthesized)
    const byId = new Map<string, TestData>();
    const addList = (list: TestData[]) => list.forEach(t => { if (!t || !t.id) return; if (!byId.has(t.id)) byId.set(t.id, t); });
    addList(remoteTests);
    addList(hardcodedFromDemo);
    addList(hardcodedFromExtras);
    addList(synthesizedFromConfig);

    return Array.from(byId.values());
  } catch (error) {
    console.error('Error getting tests:', error);
    throw error;
  }
};

// Get a single test by ID
export const getTest = async (id: string): Promise<TestData | null> => {
  try {
    const isValidDocId = (val: string) => !val.includes('/');
    if (isValidDocId(id)) {
      const hid = getTenantHospitalId();
      const docRef = hid ? doc(db, `hospitals/${hid}/tests`, id) : doc(db, TESTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as TestData;
      }
    }
    // Fallback: search in merged demo/extras/config catalogs
    const assembleFields = (fields: any[]) => (fields || []).map((f: any) => ({
      id: f.id,
      name: f.name || f.label,
      type: f.type || 'number',
      unit: f.unit || '',
      normalRange: f.normalRange || f.refRange || ''
    }));

    const listA: TestData[] = (demoTests || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      price: Number(t.price || 0),
      description: '',
      fields: assembleFields(t.fields),
      protected: true
    }));
    const listB: TestData[] = (extraDemoTests || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      price: Number(t.price || 0),
      description: '',
      fields: assembleFields(t.fields),
      protected: true
    }));
    const demoIds = new Set([...listA, ...listB].map(t => t.id));
    const listC: TestData[] = (moduleSampleTests || []).map((meta: any) => {
      if (demoIds.has(meta.id)) return null as any;
      const cfgKey = (testConfigByTestId as any)[meta.id];
      const cfg = cfgKey ? (testConfigurations as any)[cfgKey] : null;
      const fields = cfg?.fields ? cfg.fields.map((f: any) => ({
        id: f.id,
        name: f.label,
        type: f.type,
        unit: f.unit || '',
        normalRange: f.refRange || ''
      })) : [];
      return {
        id: meta.id,
        name: meta.name,
        category: meta.category || 'General',
        price: 0,
        description: '',
        fields,
        protected: true
      } as TestData;
    }).filter(Boolean) as TestData[];

    const fallback = [...listA, ...listB, ...listC].find(t => t.id === id) || null;
    return fallback;
  } catch (error) {
    console.error('Error getting test:', error);
    throw error;
  }
};

// Add a new test
export const addTest = async (test: Omit<TestData, 'id'>): Promise<string> => {
  try {
    const colRef = testsCollectionRef(db);
    const docRef = await addDoc(colRef, test);
    return docRef.id;
  } catch (error) {
    console.error('Error adding test:', error);
    throw error;
  }
};

// Update an existing test
export const updateTest = async (id: string, test: Partial<TestData>): Promise<void> => {
  try {
    const hid = getTenantHospitalId();
    const testRef = hid ? doc(db, `hospitals/${hid}/tests`, id) : doc(db, TESTS_COLLECTION, id);
    await updateDoc(testRef, test);
  } catch (error) {
    console.error('Error updating test:', error);
    throw error;
  }
};

// Delete a test
export const deleteTest = async (id: string): Promise<void> => {
  try {
    // Prevent deletion of protected (hardcoded) tests
    const protectedIds = new Set<string>([...
      (demoTests || []).map((t: any) => t.id),
      (extraDemoTests || []).map((t: any) => t.id),
      (moduleSampleTests || []).map((m: any) => m.id)
    ]);
    if (protectedIds.has(id)) {
      throw new Error('This test is protected and cannot be deleted. Use Reload Tests to restore defaults.');
    }
    const hid = getTenantHospitalId();
    const testRef = hid ? doc(db, `hospitals/${hid}/tests`, id) : doc(db, TESTS_COLLECTION, id);
    await deleteDoc(testRef);
  } catch (error) {
    console.error('Error deleting test:', error);
    throw error;
  }
};

// Reload default hardcoded tests into Firestore (idempotent, dedup-free)
export const reloadDefaultTests = async (): Promise<number> => {
  try {
    // Assemble the same catalog used in getTests
    const assembleFields = (fields: any[]) => (fields || []).map((f: any) => ({
      id: f.id,
      name: f.name || f.label,
      type: f.type || 'number',
      unit: f.unit || '',
      normalRange: f.normalRange || f.refRange || ''
    }));

    // demoData
    const listA = (demoTests || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      price: Number(t.price || 0),
      description: '',
      fields: assembleFields(t.fields),
      protected: true
    }));
    // extras
    const listB = (extraDemoTests || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      price: Number(t.price || 0),
      description: '',
      fields: assembleFields(t.fields),
      protected: true
    }));
    // synthesized from module configs
    const demoIds = new Set([...listA, ...listB].map(t => t.id));
    const listC = (moduleSampleTests || []).map((meta: any) => {
      if (demoIds.has(meta.id)) return null;
      const cfgKey = (testConfigByTestId as any)[meta.id];
      const cfg = cfgKey ? (testConfigurations as any)[cfgKey] : null;
      const fields = cfg?.fields ? cfg.fields.map((f: any) => ({
        id: f.id,
        name: f.label,
        type: f.type,
        unit: f.unit || '',
        normalRange: f.refRange || ''
      })) : [];
      return {
        id: meta.id,
        name: meta.name,
        category: meta.category || 'General',
        price: 0,
        description: '',
        fields,
        protected: true
      } as TestData;
    }).filter(Boolean) as TestData[];

    const catalog = [...listA, ...listB, ...listC];
    let upserted = 0;

    for (const t of catalog) {
      if (!t.id) continue;
      const hid = getTenantHospitalId();
      const ref = hid ? doc(db, `hospitals/${hid}/tests`, t.id) : doc(db, TESTS_COLLECTION, t.id);
      // set with merge to avoid overwriting custom fields; ensures no duplicates because IDs are fixed
      await setDoc(ref, t as any, { merge: true });
      upserted++;
    }

    return upserted;
  } catch (error) {
    console.error('Error reloading default tests:', error);
    throw error;
  }
};

// Assign sequential test codes to all tests
export const assignTestCodes = async (): Promise<number> => {
  try {
    const tests = await getTests();
    const batch = writeBatch(db);
    let count = 0;

    tests.forEach((test, index) => {
      if (!test.id) return;
      const hid = getTenantHospitalId();
      const testRef = hid ? doc(db, `hospitals/${hid}/tests`, test.id) : doc(db, TESTS_COLLECTION, test.id);
      batch.update(testRef, { code: `TEST-${index + 1}` });
      count++;
    });

    await batch.commit();
    return count;
  } catch (error) {
    console.error('Error assigning test codes:', error);
    throw error;
  }
};
