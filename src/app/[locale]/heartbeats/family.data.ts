export type FamilyTier = 'elder' | 'parent' | 'sibling' | 'self'

export interface FamilyMember {
  id: string
  alias: string
  dob: string
  relation: string
  tier: FamilyTier
}

// NOTE: birthdates below are placeholders, not real family data. Real DOBs are
// kept private and out of this public repository; the values here only exist so
// the heartbeats visualization renders with believable ages per tier. Supply
// the real data at runtime (e.g. an untracked local file) if you want accuracy.
export const familyMembers: FamilyMember[] = [
  { id: 'm01', alias: 'Mình', dob: '1997-01-01', relation: 'Bản thân', tier: 'self' },
  { id: 'm02', alias: 'Em', dob: '2005-01-01', relation: 'Em gái', tier: 'sibling' },
  { id: 'm03', alias: 'Ba', dob: '1976-01-01', relation: 'Ba', tier: 'parent' },
  { id: 'm04', alias: 'Mẹ', dob: '1976-01-01', relation: 'Mẹ', tier: 'parent' },
  { id: 'm05', alias: 'Cô út', dob: '1983-01-01', relation: 'Cô', tier: 'parent' },
  { id: 'm06', alias: 'Nội', dob: '1939-01-01', relation: 'Bà nội', tier: 'elder' },
  { id: 'm07', alias: 'Ngoại ông', dob: '1944-01-01', relation: 'Ông ngoại', tier: 'elder' },
  { id: 'm08', alias: 'Ngoại bà', dob: '1946-01-01', relation: 'Bà ngoại', tier: 'elder' },
]
