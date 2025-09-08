import { LetterheadTemplate } from '@/types/letterhead';

const STORAGE_KEY = 'labmanagerpro_letterhead_templates';

export const loadTemplates = (): LetterheadTemplate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr as LetterheadTemplate[];
  } catch {
    return [];
  }
};

export const saveTemplates = (templates: LetterheadTemplate[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const createTemplate = (tpl: Omit<LetterheadTemplate, 'id' | 'createdAt' | 'updatedAt'>): LetterheadTemplate => {
  const now = new Date().toISOString();
  const t: LetterheadTemplate = {
    ...tpl,
    id: `tpl_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: now,
    updatedAt: now,
  };
  const all = loadTemplates();
  all.push(t);
  saveTemplates(all);
  return t;
};

export const updateTemplate = (id: string, updates: Partial<LetterheadTemplate>): LetterheadTemplate | null => {
  const all = loadTemplates();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  const updated: LetterheadTemplate = { ...all[idx], ...updates, updatedAt: now };
  all[idx] = updated;
  saveTemplates(all);
  return updated;
};

export const deleteTemplate = (id: string) => {
  const all = loadTemplates().filter(t => t.id !== id);
  saveTemplates(all);
};

export const getTemplate = (id: string): LetterheadTemplate | undefined => {
  return loadTemplates().find(t => t.id === id);
};
