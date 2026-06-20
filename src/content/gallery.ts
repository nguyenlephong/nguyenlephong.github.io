// Extracted from app.const.ts — profile content data. Re-assembled into
// `profileInfo` by app.const.ts so existing imports keep working.

import { CDN_PATH } from "@/app/app.conf";

export const gallery = {
    certificates: [
      {
        src: "/assets/photos/cert_verygood.JPG",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Very good",
        width: 320,
        height: 4
      },
      {
        src: "/assets/photos/scoreboard.jpeg",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Score board",
        width: 320,
        height: 4
      },
      {
        src: CDN_PATH + "/images/me/certificate-test.JPG",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Tester certificate",
        width: 282,
        height: 4
      },
      {
        src: "/assets/photos/ComplianceRefreshTraining.png",
        refs: "https://coursera.org/verify/78B9OXN1FMDG",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Compliance Refresh Training certificate",
        width: 320,
        height: 232
      },
      {
        src: "/assets/photos/CybersecurityRefreshTraining.png",
        refs: "https://coursera.org/verify/MO66Y2JRPCLE",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Cybersecurity Refresh Training certificate",
        width: 320,
        height: 232
      }
    ],
    activities: [
      {
        src: CDN_PATH + "/images/me/DSC_1507.JPG",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - desk working",
        width: 4,
        height: 3
      }
    ],
    awards: [
      {
        src: CDN_PATH + "/images/me/best_rookie.jpeg",
        alt: "Nguyen Le Phong - Software Engineer - Best rookie of the year",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        width: 3,
        height: 4
      },

      {
        src: CDN_PATH + "/images/me/certificate_splus.jpeg",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Splus Certificate",
        width: 4,
        height: 3
      },

      {
        src: CDN_PATH + "/images/me/award_prime.jpeg",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Award at PrimeData",
        width: 4,
        height: 3
      },
      {
        src: "/assets/photos/medal_uprace.jpeg",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - UpRace - Medal 21km, Medal 10km, Medal 5km",
        width: 3,
        height: 4
      },
      {
        src: "/assets/photos/uprace_cert.PNG",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - UpRace Certificate 323km",
        width: 420,
        height: 279
      },
      {
        src: "/assets/photos/trekking_penang_hill.jpeg",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Trekking Penang Hill - Malaysia Certificate 11km",
        width: 420,
        height: 279
      }
    ],
    projects: [
      {
        src: CDN_PATH + "/images/project/chess_games.jpg",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Chess games project",
        width: 4,
        height: 3
      },

      {
        src: CDN_PATH + "/images/project/wat_overview.png",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - Wat project at splus software",
        width: 4,
        height: 3
      },

      {
        src: CDN_PATH + "/images/me/essay-group.JPG",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - my essay",
        width: 4,
        height: 3
      },
      {
        src: CDN_PATH + "/images/me/drone.JPG",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - My team to implement essay",
        width: 4,
        height: 3
      },

      {
        src: CDN_PATH + "/images/me/drone_dev.jpeg",
        sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
        alt: "Nguyen Le Phong - Software Engineer - drone applications",
        width: 4,
        height: 3
      }
    ]
}
