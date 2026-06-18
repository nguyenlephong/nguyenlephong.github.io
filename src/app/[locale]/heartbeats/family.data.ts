export type FamilyTier = 'elder' | 'parent' | 'sibling' | 'self'

export interface FamilyMember {
  id: string
  alias: string
  dob: string
  relation: string
  tier: FamilyTier
}

export const familyMembers: FamilyMember[] = [
  { id: 'm01', alias: 'Mình', dob: '1997-07-01', relation: 'Bản thân', tier: 'self' },
  { id: 'm02', alias: 'Em', dob: '2005-06-09', relation: 'Em gái', tier: 'sibling' },
  { id: 'm03', alias: 'Ba', dob: '1976-11-18', relation: 'Ba', tier: 'parent' },
  { id: 'm04', alias: 'Mẹ', dob: '1976-02-19', relation: 'Mẹ', tier: 'parent' },
  { id: 'm05', alias: 'Cô út', dob: '1983-03-02', relation: 'Cô', tier: 'parent' },
  { id: 'm06', alias: 'Nội', dob: '1939-04-20', relation: 'Bà nội', tier: 'elder' },
  { id: 'm07', alias: 'Ngoại ông', dob: '1944-05-02', relation: 'Ông ngoại', tier: 'elder' },
  { id: 'm08', alias: 'Ngoại bà', dob: '1946-04-02', relation: 'Bà ngoại', tier: 'elder' },
]
