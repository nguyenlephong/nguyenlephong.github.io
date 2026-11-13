// Gallery data, grouped in reading order: the strongest, sourced evidence first.
// `id` keys the localized caption in `Pages.gallery.captions`. `alt` describes the image only.
// `refs` is the public source that confirms the item; without it the card opens the full image.
// `fit: 'contain'` keeps documents whole instead of cropping them.

import { icdnAssetUrl } from "@/lib/assets/icdn";

export type GalleryPhoto = {
  id: string
  src: string
  alt: string
  width: number
  height: number
  refs?: string
  fit?: "contain"
  /** Published 480w/800w variants, filled in by the gallery page. */
  srcSet?: string
}

export type GalleryGroupId = "bonbon" | "recognition" | "education" | "outside" | "earlier"

export const gallery: Record<GalleryGroupId, GalleryPhoto[]> = {
  bonbon: [
    {
      id: "wash3000DemoDay",
      src: icdnAssetUrl("/notes/the-quiet-engineering-behind-bonbons-500k-round/tasco-foundry-wash3000-demo-day.webp"),
      alt: "Wash3000 Demo Day stage at Tasco Foundry with Tasco, VETC, GenAI Fund and the Top 10 teams",
      refs: "https://genaifund.ai/2026/09/23/genai-fund-backs-bonbon-500k/",
      width: 2048,
      height: 1368
    },
    {
      id: "bonbonPreSeed",
      src: icdnAssetUrl("/notes/the-quiet-engineering-behind-bonbons-500k-round/bonbon-500k-pre-seed-key-visual.webp"),
      alt: "Announcement graphic for the BonBon Mobility $500K pre-seed round led by Tasco with GenAI Fund",
      refs: "https://technode.global/2026/09/22/vietnams-bonbon-mobility-raises-500000-pre-seed-round-led-by-tasco-genai-fund-co-investing/",
      width: 1536,
      height: 864
    },
    {
      id: "bonbonTeam",
      src: icdnAssetUrl("/notes/the-quiet-engineering-behind-bonbons-500k-round/bonbon-founding-team.webp"),
      alt: "BonBon Mobility co-founders Nguyen Chi Dung, Vu Duy Hung and Nguyen Le Phong",
      width: 1420,
      height: 941
    }
  ],
  recognition: [
    {
      id: "bestRookie",
      src: icdnAssetUrl("/gallery/awards/best-rookie.webp"),
      alt: "Nguyen Le Phong holding the Best Rookie 2019 award at a Splus Software new year party",
      width: 4000,
      height: 6000
    },
    {
      id: "primeAward",
      src: icdnAssetUrl("/gallery/awards/primedata-award.webp"),
      alt: "PrimeData Most Valuable Employee certificate dated August 2020",
      width: 2904,
      height: 2178,
      fit: "contain"
    },
    {
      id: "splus",
      src: icdnAssetUrl("/gallery/awards/splus-certificate.webp"),
      alt: "Splus Software certificate of achievement for Best Rookie of the Year 2019",
      width: 3024,
      height: 3024,
      fit: "contain"
    }
  ],
  education: [
    {
      id: "veryGood",
      src: icdnAssetUrl("/gallery/certificates/very-good-degree.webp"),
      alt: "Framed commendation from Nong Lam University for a Very Good graduation",
      width: 1536,
      height: 2048,
      fit: "contain"
    },
    {
      id: "scoreboard",
      src: icdnAssetUrl("/gallery/certificates/scoreboard.webp"),
      alt: "Nong Lam University academic transcript",
      width: 3024,
      height: 4032,
      fit: "contain"
    },
    {
      id: "testerCertificate",
      src: icdnAssetUrl("/gallery/certificates/tester-certificate.webp"),
      alt: "Global Software Tester certificate of completion, level A, June 2019",
      width: 4032,
      height: 3024,
      fit: "contain"
    },
    {
      id: "compliance",
      src: icdnAssetUrl("/gallery/certificates/compliance-refresh-training.webp"),
      alt: "Coursera certificate for Compliance Refresh Training",
      refs: "https://coursera.org/verify/78B9OXN1FMDG",
      width: 1772,
      height: 928,
      fit: "contain"
    },
    {
      id: "cybersecurity",
      src: icdnAssetUrl("/gallery/certificates/cybersecurity-refresh-training.webp"),
      alt: "Coursera certificate for Cybersecurity Refresh Training",
      refs: "https://coursera.org/verify/MO66Y2JRPCLE",
      width: 1772,
      height: 928,
      fit: "contain"
    }
  ],
  outside: [
    {
      id: "upraceMedals",
      src: icdnAssetUrl("/gallery/awards/uprace-medals.webp"),
      alt: "UpRace 2024 finisher medals for 5 km, 10 km and 21 km",
      width: 2268,
      height: 4032
    },
    {
      id: "uprace323",
      src: icdnAssetUrl("/gallery/awards/uprace-323km-certificate.webp"),
      alt: "UpRace certificate for 323 km",
      width: 1550,
      height: 1031,
      fit: "contain"
    },
    {
      id: "penangHill",
      src: icdnAssetUrl("/gallery/awards/trekking-penang-hill.webp"),
      alt: "Penang Hill trekking certificate for 11 km, Malaysia",
      width: 1078,
      height: 728,
      fit: "contain"
    },
    {
      id: "deskWorking",
      src: icdnAssetUrl("/gallery/activities/desk-working.webp"),
      alt: "Nguyen Le Phong writing code at a desk with two monitors",
      width: 5568,
      height: 3712
    }
  ],
  earlier: [
    {
      id: "essay",
      src: icdnAssetUrl("/gallery/projects/essay-group.webp"),
      alt: "Graduation thesis defense at the Faculty of Information Technology, Nong Lam University, with a drone on show",
      width: 4032,
      height: 3024
    },
    {
      id: "teamEssay",
      src: icdnAssetUrl("/gallery/projects/drone-team.webp"),
      alt: "Two students holding a drone in front of the thesis defense banner",
      width: 4032,
      height: 3024
    },
    {
      id: "drone",
      src: icdnAssetUrl("/gallery/projects/drone-development.webp"),
      alt: "Drone frame, motors and controller board on a lab bench",
      width: 2752,
      height: 2064
    },
    {
      id: "chessProject",
      src: icdnAssetUrl("/gallery/projects/chess-games.webp"),
      alt: "Chinese chess game window with AI move hints on the board",
      width: 993,
      height: 764
    },
    {
      id: "watProject",
      src: icdnAssetUrl("/gallery/projects/wat-overview.webp"),
      alt: "WAT web form screenshot from a Splus Software client project",
      width: 2580,
      height: 1394
    }
  ]
}

export const GALLERY_GROUP_ORDER: GalleryGroupId[] = ["bonbon", "recognition", "education", "outside", "earlier"]
