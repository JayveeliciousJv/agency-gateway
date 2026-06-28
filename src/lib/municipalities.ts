// Camarines Norte municipalities grouped by congressional district.
export type District = '1st District' | '2nd District';

export const MUNICIPALITIES_BY_DISTRICT: Record<District, string[]> = {
  '1st District': ['Capalonga', 'Jose Panganiban', 'Labo', 'Paracale', 'Santa Elena'],
  '2nd District': ['Daet', 'Basud', 'Mercedes', 'San Lorenzo Ruiz', 'San Vicente', 'Talisay', 'Vinzons'],
};

export const ALL_MUNICIPALITIES: string[] = [
  ...MUNICIPALITIES_BY_DISTRICT['1st District'],
  ...MUNICIPALITIES_BY_DISTRICT['2nd District'],
];

export function getDistrictForMunicipality(name?: string): District | undefined {
  if (!name) return undefined;
  if (MUNICIPALITIES_BY_DISTRICT['1st District'].includes(name)) return '1st District';
  if (MUNICIPALITIES_BY_DISTRICT['2nd District'].includes(name)) return '2nd District';
  return undefined;
}

export const DISTRICT_COLORS: Record<District, string> = {
  '1st District': 'hsl(200, 80%, 40%)',
  '2nd District': 'hsl(38, 92%, 50%)',
};
