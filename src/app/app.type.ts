/** One role on the career graph. Copy lives in messages `Experience.roles.<id>`. */
export type ExperienceRole = {
  id: string
  company: string
  title: string
  /** YYYY-MM */
  start: string
  /** YYYY-MM; omitted while the role is current */
  end?: string
  /** key into messages `Experience.env` */
  env: string
  location: string
  techs: string[]
  /** 2018-2020 roles render as one line in the "Earlier" group */
  earlier?: boolean
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
  }[]
  brand?: {
    href: string
    label: string
    logo: string
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
