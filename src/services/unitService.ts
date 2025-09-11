import { db } from '@/firebase';
import { collection, getDocs, orderBy, query, setDoc, doc, addDoc } from 'firebase/firestore';
import { demoTests } from '@/data/demoData';
import { testConfigurations, testConfigByTestId, sampleTests as moduleSampleTests } from '@/modules/tests/config';
import { extraDemoTests } from '@/modules/tests/generated';

const UNITS_COLLECTION = 'units';

export interface UnitData {
  id?: string;
  name: string;
}

export const getUnits = async (): Promise<UnitData[]> => {
  const snap = await getDocs(query(collection(db, UNITS_COLLECTION), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as UnitData[];
};

const normalize = (u: string) => u.trim();

export const addUnit = async (unitName: string): Promise<void> => {
  const name = normalize(unitName);
  if (!name) return;
  // Use normalized name as document ID to guarantee uniqueness
  const id = name.toLowerCase();
  await setDoc(doc(db, UNITS_COLLECTION, id), { name }, { merge: true });
};

export const reloadDefaultUnits = async (): Promise<number> => {
  // Collect units from demo tests
  const fromDemo = new Set<string>();
  const collect = (u?: string) => { const v = (u || '').trim(); if (v) fromDemo.add(v); };

  (demoTests || []).forEach((t: any) => (t.fields || []).forEach((f: any) => collect(f.unit)));
  (extraDemoTests || []).forEach((t: any) => (t.fields || []).forEach((f: any) => collect(f.unit)));

  // From module configs
  (moduleSampleTests || []).forEach((meta: any) => {
    const key = (testConfigByTestId as any)[meta.id];
    const cfg = key ? (testConfigurations as any)[key] : null;
    (cfg?.fields || []).forEach((f: any) => collect(f.unit));
  });

  let count = 0;
  for (const u of fromDemo) {
    const id = u.toLowerCase();
    await setDoc(doc(db, UNITS_COLLECTION, id), { name: u }, { merge: true });
    count++;
  }
  return count;
};
