export type ExperienceItemType = {
  company: string;
  location: string;
  jobs: JobType[]
  jobs_bk: {
    title: string;
    duration: string;
    responsibilities: string[]
    skills: string[]
  }[]
}

export type JobType = {
  title: string;
  duration: string;
  summaries: string[]
  key_contribution: string[]
  key_techs: string[]
}

export type ProjectType = {
  name: string;
  technologies: string[];
  duration: string;
  description: string[];
  accomplishment: string[]
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
