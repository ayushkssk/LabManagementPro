/**
 * Generates a patient ID in the format SWT-YYMMDD-COUNT
 * @param count The current count of patients registered today
 * @returns Formatted patient ID string
 */
export function generatePatientId(count: number): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const paddedCount = String(count).padStart(2, '0');
  
  return `SWT-${year}${month}${day}-${paddedCount}`;
}

/**
 * Extracts the count from an existing patient ID
 * @param patientId The patient ID to extract count from
 * @returns The count number or 0 if invalid format
 */
export function extractCountFromPatientId(patientId: string): number {
  const match = patientId.match(/SWT-\d{6}-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
