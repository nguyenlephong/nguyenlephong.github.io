// Extracted from app.const.ts — profile content data. Re-assembled into
// `profileInfo` by app.const.ts so existing imports keep working.

import { icdnAssetUrl } from "@/lib/assets/icdn";

export const gallery = {
    certificates: [
      {
        src: icdnAssetUrl("/gallery/certificates/very-good-degree.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Very good",
        width: 320,
        height: 4
      },
      {
        src: icdnAssetUrl("/gallery/certificates/scoreboard.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Score board",
        width: 320,
        height: 4
      },
      {
        src: icdnAssetUrl("/gallery/certificates/tester-certificate.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Tester certificate",
        width: 282,
        height: 4
      },
      {
        src: icdnAssetUrl("/gallery/certificates/compliance-refresh-training.webp"),
        refs: "https://coursera.org/verify/78B9OXN1FMDG",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Compliance Refresh Training certificate",
        width: 320,
        height: 232
      },
      {
        src: icdnAssetUrl("/gallery/certificates/cybersecurity-refresh-training.webp"),
        refs: "https://coursera.org/verify/MO66Y2JRPCLE",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Cybersecurity Refresh Training certificate",
        width: 320,
        height: 232
      }
    ],
    activities: [
      {
        src: icdnAssetUrl("/gallery/activities/desk-working.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - desk working",
        width: 4,
        height: 3
      },
      {
        src: icdnAssetUrl("/notes/the-quiet-engineering-behind-bonbons-500k-round/tasco-foundry-wash3000-demo-day.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - BonBon - Wash3000 Demo Day at Tasco Foundry with Tasco, VETC, GenAI Fund and the Top 10 teams",
        width: 2048,
        height: 1368
      }
    ],
    awards: [
      {
        src: icdnAssetUrl("/gallery/awards/best-rookie.webp"),
        alt: "Nguyen Le Phong - Software Engineer - Best rookie of the year",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        width: 3,
        height: 4
      },

      {
        src: icdnAssetUrl("/gallery/awards/splus-certificate.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Splus Certificate",
        width: 4,
        height: 3
      },

      {
        src: icdnAssetUrl("/gallery/awards/primedata-award.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Award at PrimeData",
        width: 4,
        height: 3
      },
      {
        src: icdnAssetUrl("/gallery/awards/uprace-medals.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - UpRace - Medal 21km, Medal 10km, Medal 5km",
        width: 3,
        height: 4
      },
      {
        src: icdnAssetUrl("/gallery/awards/uprace-323km-certificate.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - UpRace Certificate 323km",
        width: 420,
        height: 279
      },
      {
        src: icdnAssetUrl("/gallery/awards/trekking-penang-hill.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Trekking Penang Hill - Malaysia Certificate 11km",
        width: 420,
        height: 279
      },
      {
        src: icdnAssetUrl("/notes/the-quiet-engineering-behind-bonbons-500k-round/bonbon-500k-pre-seed-key-visual.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - BonBon, A Member of VETC - $500K pre-seed round led by Tasco and co-invested by GenAI Fund",
        width: 1536,
        height: 864
      }
    ],
    projects: [
      {
        src: icdnAssetUrl("/notes/the-quiet-engineering-behind-bonbons-500k-round/bonbon-founding-team.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - BonBon co-founders - Nguyen Chi Dung, Vu Duy Hung and Nguyen Le Phong",
        width: 1420,
        height: 941
      },

      {
        src: icdnAssetUrl("/gallery/projects/chess-games.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Chess games project",
        width: 4,
        height: 3
      },

      {
        src: icdnAssetUrl("/gallery/projects/wat-overview.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Wat project at splus software",
        width: 4,
        height: 3
      },

      {
        src: icdnAssetUrl("/gallery/projects/essay-group.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - my essay",
        width: 4,
        height: 3
      },
      {
        src: icdnAssetUrl("/gallery/projects/drone-team.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - My team to implement essay",
        width: 4,
        height: 3
      },

      {
        src: icdnAssetUrl("/gallery/projects/drone-development.webp"),
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - drone applications",
        width: 4,
        height: 3
      }
    ]
}
