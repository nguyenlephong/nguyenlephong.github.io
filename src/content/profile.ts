// Profile content data, imported directly by the pages that render it.

// Server-only: the phone number. Email and profile links live in ./social, the
// only contact module client components may import (tests/client-profile-privacy.test.mjs).
export const contact = {
    phone: "(+84)98-549-0107",
    cv_pdf: "https://nguyenlephong.github.io/NguyenLePhong_Lead_Software_Engineer.pdf"
}

export const technical_skill = {
    title: "Technical Skills",
    languages: ["Java", "JavaScript", "TypeScript", "HTML/CSS"],
    frameworks: ["Spring Boot", "Node.js", "Next.js", "Ant Design"],
    developerTools: ["Git", "Docker", "Jenkins", "Travis CI"],
    libraries: [
      "React",
      "React Native",
      "React Flow",
      "Redux",
      "React Query",
      "G2plot"
    ],
    testing: ["Jest", "Cucumber", "Puppeteer", "Testing Library"],
    other: [
      "Responsive Design",
      "Cross-Browser Compatibility",
      "SEO",
      "GraphQL"
    ]
}

export const achievements = [
    {
      title: "The degree of engineer",
      year: 2020,
      description: [
        "Bachelor's degree in Software Engineering, awarded with a very good classification."
      ]
    },
    {
      title: "Certification in Software Testing",
      year: 2019,
      description: [
        "I was awarded a type-A certificate by GST and invited to join their project."
      ]
    },
    {
      title: "Best Rookie Of The Year",
      year: 2019,
      description: []
    }
]

export const education = [
    {
      school: "Nong Lam University",
      description: [
        "Bachelor of Information Technology, Minor in Software Engineering"
      ],
      GPA: 3.36,
      duration: "Sep. 2015 - Dec 2019"
    }
]
