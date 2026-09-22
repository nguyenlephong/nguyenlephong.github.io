export type ExperienceItemType = {
  company: string;
  location: string;
  jobs: JobType[]
}

export type JobType = {
  title: string;
  duration: string;
  summaries: string[]
  key_contribution: string[]
  key_techs: string[]
  contentKey?: string
  evidence?: {
    href: string
    publisher: string
    publishedAt: string
  }
}

export type ProjectType = {
  name: string;
  technologies: string[];
  duration: string;
  description: string[];
  accomplishment: string[]
  evidence?: {
    href: string
    publisher: string
    publishedAt: string
  }
}

export type AchievementType = {
  title: string;
  year: number;
  description: string[]
}

export type EducationType = {
  school: string;
  duration: string;
  GPA: number;
  description: string[]
}

export type ReferenceType = {
  name: string;
  email: string;
  phone: string;
  roles: string[]
}

export type ContactType = {
  email: string;
  phone: string;
  github: string;
  youtube: string;
  leetcode: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  instagram: string;
}
