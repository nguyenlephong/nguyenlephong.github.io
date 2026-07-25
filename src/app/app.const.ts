import { gallery } from "@/content/gallery";
import { videos } from "@/content/media";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import {
  contact,
  technical_skill,
  achievements,
  education,
  references,
} from "@/content/profile";

export const APP_ROUTE = {
  HOME: "/",
  ABOUT: "/about",
  GALLERY: "/gallery",
  BLOG: "/blog",
  NOTES: "/notes",
  OFFLINE: "/offline",
  STUDIO: "/studio",
  APPS: "/apps",
  APPS_ENGLISH: "/apps/english",
  CV_PDF: "/SoftwareEngineer_NguyenLePhong_0985490107_NoRefs.pdf"
};

export const SEO = {
  title: "Nguyen Le Phong | Lead Software Engineer at Zalo PC",
  description:
    "Lead Software Engineer at Zalo PC with 8+ years shipping cross-platform products, PC-to-mobile message backup and restore, platform systems, secure integrations, and reliable releases.",
  og: {
    title: "Nguyễn Lê Phong | Software Engineer",
    type: "website",
    url: "https://nguyenlephong.github.io"
  },
  title_tail: "Nguyen Le Phong | Lead Software Engineer"
};

export const profileInfo = {
  gallery,
  videos,
  contact,
  technical_skill,
  experience,
  projects,
  achievements,
  education,
  references,
};
