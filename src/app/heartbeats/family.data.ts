export type FamilyTier = 'elder' | 'parent' | 'sibling' | 'self'

export interface FamilyMember {
  name: string
  alias: string
  dob: string
  relation: string
  tier: FamilyTier
}

export const familyMembers: FamilyMember[] = [
  { name: 'Nguyễn Lê Phong', alias: 'Me', dob: '1997-07-01', relation: 'Bản thân', tier: 'self' },
  { name: 'Nguyễn Thị Yến Nhi', alias: 'Em Út', dob: '2005-06-09', relation: 'Em gái', tier: 'sibling' },
  { name: 'Nguyễn Thanh Xuân', alias: 'Ba', dob: '1976-11-18', relation: 'Cha', tier: 'parent' },
  { name: 'Lê Thị Thanh Hương', alias: 'Mẹ', dob: '1976-02-19', relation: 'Mẹ', tier: 'parent' },
  { name: 'Nguyễn Thị Bích Hương', alias: 'Cô Út', dob: '1983-03-02', relation: 'Cô', tier: 'parent' },
  { name: 'Nguyễn Thị Cái', alias: 'Nội Bà', dob: '1939-04-20', relation: 'Bà nội', tier: 'elder' },
  { name: 'Lê Văn Măng', alias: 'Ngoại Ông', dob: '1944-05-02', relation: 'Ông ngoại', tier: 'elder' },
  { name: 'Nguyễn Thị Mười', alias: 'Ngoại Bà', dob: '1946-04-02', relation: 'Bà ngoại', tier: 'elder' },
]
