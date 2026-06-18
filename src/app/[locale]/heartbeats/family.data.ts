export type FamilyTier = 'elder' | 'parent' | 'sibling' | 'self'

export interface FamilyMember {
  name: string
  alias: string
  dob: string
  relation: string
  tier: FamilyTier
}

export const familyMembers: FamilyMember[] = [
  { name: 'Mình', alias: 'Mình', dob: '1997-07-01', relation: 'Bản thân', tier: 'self' },
  { name: 'Em', alias: 'Em', dob: '2005-06-09', relation: 'Em gái', tier: 'sibling' },
  { name: 'Ba', alias: 'Ba', dob: '1976-11-18', relation: 'Ba', tier: 'parent' },
  { name: 'Mẹ', alias: 'Mẹ', dob: '1976-02-19', relation: 'Mẹ', tier: 'parent' },
  { name: 'Cô út', alias: 'Cô út', dob: '1983-03-02', relation: 'Cô', tier: 'parent' },
  { name: 'Nội', alias: 'Nội', dob: '1939-04-20', relation: 'Bà nội', tier: 'elder' },
  { name: 'Ngoại ông', alias: 'Ngoại ông', dob: '1944-05-02', relation: 'Ông ngoại', tier: 'elder' },
  { name: 'Ngoại bà', alias: 'Ngoại bà', dob: '1946-04-02', relation: 'Bà ngoại', tier: 'elder' },
]
