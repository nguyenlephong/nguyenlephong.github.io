import {CDN_PATH} from "@/app/app.conf";

export const APP_ROUTE = {
  HOME: "/",
  ABOUT: "/about",
  GALLERY: "/gallery",
  CV: "/cv",
  CV_PDF: "/Frontend_NguyenLePhong_0985490107.pdf" || "/NguyenLePhong_0985490107_Front_end.pdf"
}

export const SEO = {
  title: "Nguyen Le Phong | Front-end Software Engineer",
  description:
    "As a front-end software engineer with over five years of experience, I specialize in designing and implementing user-friendly web applications. Proficient in HTML, CSS, JavaScript, and React, my expertise extends to optimizing website performance to accommodate a large user base. My commitment to creating visually appealing and efficient interfaces has led to successful project deliveries across diverse industries.",
  og: {
    title: "Nguyễn Lê Phong | Software Engineer",
    type: "website",
    url: "https://nguyenlephong.github.io",
  },
  title_tail: "Nguyen Le Phong | Front-end Software Engineer"
};

export const profileInfo = {
  gallery: {
    certificates: [
      
      // {
      //   src: "/assets/photos/cert.jpeg",
      //   sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      //   alt: "Nguyen Le Phong - Software Engineer - Certificate",
      //   width: 3,
      //   height: 4
      // },
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
      },
    ],
    activities: [
      
      
      // {
      //   src: CDN_PATH + "/images/me/view-0.jpg",
      //   sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      //   alt: "Nguyen Le Phong - Software Engineer - me",
      //   width: 3,
      //   height: 4,
      //   hide: true,
      // },
      // {
      //   src: CDN_PATH + "/images/me/view-1.jpg",
      //   sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      //   alt: "Nguyen Le Phong - Software Engineer - me",
      //   width: 3,
      //   height: 4,
      //   hide: true,
      // },
      // {
      //   src: CDN_PATH + "/images/me/view-2.jpg",
      //   sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      //   alt: "Nguyen Le Phong - Software Engineer - me",
      //   width: 3,
      //   height: 4,
      //   hide: true,
      // },
      
      // {
      //   src: CDN_PATH + "/images/me/standup.jpg",
      //   sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      //   alt: "Nguyen Le Phong - Software Engineer - me",
      //   width: 3,
      //   height: 4,
      //   hide: true,
      // },
      //
      // {
      //   src: CDN_PATH + "/images/me/sit-down.jpg",
      //   sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      //   alt: "Nguyen Le Phong - Software Engineer - me",
      //   width: 3,
      //   height: 4,
      //   hide: true,
      // },
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
      },
    ],
  },
  videos: [
    
    {
      id: "v0",
      title: "[Bài 01] - Giới thiệu khóa học hoàn thành dự án Frontend ReactJS - Next.JS",
      url: "https://www.youtube.com/embed/ehiiZ-JvxWc",
    },
    {
      id: "v6",
      title: "[Review] - ChatGPT Có thực sự \"ngon\" không?",
      url: "https://www.youtube.com/embed/BE4vA3JN-e8",
    },
    {
      id: "v1",
      title: "[Kỷ Niệm] - Bảo Vệ Luận Văn Tốt Nghiệp",
      url: "https://bit.ly/3jgaQAx",
    },
    {
      id: "v2",
      title:
        "[Mobile Devices Programming]- Ứng Dụng Điểm Danh Sinh Viên Nhận Diện Khuôn Mặt",
      url: "https://bit.ly/3jb5qqo",
    },
    {
      id: "v3",
      title: "Kỷ Niệm Báo Cáo Data Warehouse In Real Time",
      url: "https://bit.ly/3ftshg6",
    },
    {
      id: "v4",
      title: "Báo cáo cuối kỳ 2016-2017-Lập trình web",
      url: "https://bit.ly/3fqgE9J",
    },
    {
      id: "v5",
      title: "[Thương Mại Điện Tử ]- Báo Cáo Giữa Kỳ- CMS-WORDPRESS",
      url: "https://bit.ly/2VuDeXD",
    },
  ],
  contact: {
    email: "phongnguyen.itengineer@gmail.com",
    phone: "(+84)98-549-0107",
    github: "https://github.com/nguyenlephong",
    youtube: "https://www.youtube.com/@NguyenLePhong",
    leetcode: "https://leetcode.com/nguyenlephong/",
    linkedin: "https://www.linkedin.com/in/phongnguyen-it/",
    twitter: "https://twitter.com/nguyenlephong17",
    facebook: "https://www.facebook.com/NguyenLePhong0107/",
    instagram: "https://www.instagram.com/anhmap0107/",
    cv_pdf: "https://www.overleaf.com/read/sbqsdsgkpbzv#f46329"
  },
  about: [
    {
      id: "Skills and Experience",
      categories: "Skills and Experience",
      descriptions: [
        "Bachelor's degree in <strong>Information Technology</strong>. Degree classification: <strong>Very good</strong>. <strong>(GPA: 3.36)</strong>",
        "<strong>5+ years</strong> of experience in front-end development",
        "Strong proficiency in <strong>JavaScript, DOM, HTML5, LESS, SASS/CSS3</strong>",
        "Understanding of <strong>SEO</strong> principles.",
        "Experienced in <strong>UI/UX design, performance optimization, testing, design pattern</strong>, etc",
        `Experience with front-end frameworks such as <strong>React, Next.js</strong>`,
        "Understanding the nature of <strong>asynchronous programing</strong>",
        "Familiarity with back-end technologies such as <strong>Node.js, Java</strong>",
        "Good knowledge of data structures and algorithms.",
        "Experience with front-end build tools such as <strong>Webpack</strong>",
        "Understanding of <strong>responsive design</strong> and <strong>mobile-first</strong> development principles",
        "Excellent <strong>problem-solving</strong> and <strong>analytical skills</strong>",
        "Strong attention to detail and ability to <strong>write clean, maintainable code</strong>",
        "Experience with <strong>version control systems</strong> such as Git, GitLab, Bitbucket, SVN",
        "Passion for learning and staying up-to-date with the latest front-end development trends",
        "Ability to <strong>work independently</strong> and as part of a team",
        "<strong>Excellent verbal and written</strong> communication skills",
      ],
    },
    {
      id: "strengths",
      categories: "Strengths",
      descriptions: [
        "I am a person with <strong>high responsibility</strong> for work",
        "<strong>Easily adapt</strong> to team work environment, ability to <strong>manage</strong> with team size from 3 to 5 people",
        "Being easy to get along with, willing to help others when possible",
        "I have the ability to <strong>manage good personal time</strong>",
        "Ability to <strong>analyze problems, solve problems</strong>",
        "Endure <strong>good pressure, high patience</strong>",
        "Ability to read <strong>English</strong> documents",
      ],
    },
    {
      id: "weaknesses",
      categories: "Weaknesses",
      descriptions: [
        "Sometimes <strong>talking alone</strong> while looking for a solution to solve a task",
        "Foreign language communication (English) is <strong>not fluent</strong>",
      ],
    },
    {
      id: "hobby",
      categories: "Hobby",
      descriptions: [
        "Enjoy watching <strong>movies</strong> (movies can bring life skills enhancement lessons), singing on weekends, holidays with friends and relatives",
        "I am a <strong>technology enthusiast</strong>, <strong>applying technology</strong> in practice",
        "Enjoy reading <strong>new technology</strong> news, new applications to cut wind with friends when you have free time",
        "I also have a habit of <strong>reading books</strong>, every quarter I equip myself with new books",
      ],
    },
    {
      id: "notes",
      categories: "As a front-end software engineer, while working, I will pay attention to the following:",
      descriptions: [
        "<strong>Semantic HTML</strong>: Using HTML elements in a semantically correct way to ensure the structure and meaning of the content are clear to both humans and machines.",
        "<strong>CSS Architecture</strong>: Implementing a modular and maintainable CSS structure, such as BEM",
        "<strong>User experience</strong>: Ensure that the website or application is easy to use and provides a good user experience.",
        "<strong>Accessibility</strong>: Make sure that the website or application is accessible to users with disabilities.",
        "<strong>Cross-browser compatibility</strong>: Ensure that the website or application works on different browsers and devices.",
        "<strong>Collaboration</strong>: Good communication and collaboration with other team members, especially with back-end developers, is important for successful project outcomes.",
        "<strong>Responsive design</strong>: Make sure that the website or application is optimized for different screen sizes and devices.",
        "<strong>Performance optimization</strong>: Minimizing <strong>file sizes</strong>, optimizing <strong>images</strong>, and implementing <strong>lazy loading</strong> to improve website performance.",
        "<strong>Security</strong>: Be aware of security risks and implement measures to prevent them.",
        "<strong>Maintainability</strong>: Write <strong>clean and organized</strong> code that is easy to <strong>maintain and modify</strong> in the future.",
        "<strong>Best practices</strong>: Follow industry-standard best practices for front-end development.",
        "<strong>Testing</strong>: Regularly test your website or application to ensure that it works as expected.",
        "<strong>Continuous Integration/Continuous Deployment (CI/CD)</strong>: Automating the build, test, and deployment processes to ensure a smooth and efficient <strong>development workflow</strong>.",
        "<strong>Documentation</strong>: Writing clear and concise documentation to ensure that code is <strong>easily understandable</strong> by other developers and can be easily maintained in the future."
      ],
    },
  ],
  summary: {
    title: "Summary",
    description: [
      `Possessing a Bachelor’s degree in <b>Information Technology</b>, with a minor in <b>Software Engineering</b>, and achieving a commendable classification (<b>GPA 3.36</b>), I have cultivated over five years of dedicated experience as a front-end software engineer.` ,
      `Specializing in the design and implementation of user-friendly web applications, I bring proficiency in HTML, CSS, JavaScript, and <b>React</b>, coupled with a keen expertise in optimizing website performance to accommodate large user bases. My commitment to crafting visually engaging and efficient interfaces has consistently led to successful project deliveries across diverse industries.`,
      `<i>Here are my recent focused hard skills over the past few years:</i>`
    ],
    skills: [
      `<b>Back-end</b>: Competent in <b>Java</b> with the Spring Framework and <b>Node.js</b> with a working knowledge of the Express framework.`,
      `<b>Front-end</b>: Proficient in <b>React</b>, utilizing TypeScript, JavaScript, and the <b>Next.js</b> framework, and <b>React Native</b> with a working knowledge of the Expo platform, as well as proficiency in vanilla JavaScript`,
      `<b>Libraries</b>: Seasoned in <b>Firebase</b>, Strapi, Directus, React Flow, Webpack, <b>Redux</b>, React Query, and G2plot.`,
      `<b>Testing</b>: Skilled in <b>Jest, Cucumber, Puppeteer</b>, and Testing Library.`,
      `<b>Other</b>: In addition, familiar with <b>Micro-frontend</b> architecture, Proficiency in Responsive Design, Cross-Browser Compatibility, <b>SEO</b>, and GraphQL.`,
    ]
  },
  technical_skill: {
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
  },
  experience: [
    {
      company: "Zalo PC - VNG Corp",
      location: "VNG Campus - District 7",
      jobs: [
        {
          title: "Senior Software Engineer",
          duration: "May 2024 - Present",
          summaries: [
            "Core developer for the cross-platform <b>Zalo PC</b> (Web, macOS, Windows), serving <b>15M+ MAU</b>. Delivered key features such as dark mode, dynamic theming, and user behavior tracking. Spearheaded the development of a promotion flow and a scalable <b>design system</b> for <b>50+ developers</b>. Optimized performance, enhanced maintainability, and contributed to business growth through robust and efficient solutions.",
            "Actively maintained and improved <b>Zalo’s Android</b> mobile app, ensuring the <b>stability</b> and <b>performance</b> of critical features for nearly <b>80 million users</b>."
          ],
          key_contribution: [
            "Delivered over <b>10 features</b>, including dark mode, a download module, log tracking, and more, improving UX and engagement.",
            "Developed a <b>promotion flow</b> with integrated tracking and monitoring systems, driving activation success across <b>15M+ MAU</b>.",
            "Led the development of a scalable <b>design system</b> using Storybook, ensuring UI consistency and efficiency for <b>50+ developers</b>.",
            "Proactively supported <b>50+ client users</b>, swiftly resolving issues with <b>dedication</b> and <b>effective problem-solving</b>, earning strong positive feedback.",
            "Maintained and improved <b>5+</b> features in <b>Zalo’s Android</b> app, focusing on <b>stability</b>, <b>performance</b>, and seamless user experience for nearly <b>80 million users</b>."
          ],
          key_techs: ["ReactJs", "Node.js", "Electron", "Typescript", "Kotlin"]
        }
      ],
      jobs_bk: []
    },
    // {
    //   company: "Math99th",
    //   location: "Remote",
    //   jobs: [
    //     {
    //       title: "Senior Front-end Engineer",
    //       duration: "Oct 2023 - Present",
    //       summaries: [],
    //       key_contribution: [
    //         "Championed the architectural blueprint and construction of the front-end and server-side project base, cultivating a meticulously organized and structured codebase. Elevated code maintainability and fostered seamless collaboration among cross-functional teams.",
    //         "Developed a web application for mathematical review using Next.js and Ant Design. Integrated Mathjax for displaying mathematical expressions, ensuring a seamless and visually appealing user experience.",
    //         "Collaborated with cross-functional teams to align with user needs and optimized application performance, showcasing expertise in front-end development and a commitment to delivering innovative solutions.",
    //         "Implemented and maintained an automated email flow for customer care, triggered by specific user segments, enhancing user engagement and satisfaction.",
    //         "Monitored and collected user behavior data for analysis and statistics. Utilized insights to execute targeted marketing campaigns, resulting in improved DAU, WAU, and MAU metrics."
    //       ],
    //       key_techs: ["ReactJs", "Next.js", "Antdesign", "React Native", "Typescript", "Docker", "GCP"]
    //
    //     }
    //   ]
    //
    // },
    {
      company: "PrimeData VN",
      location: "Binh Thanh",
      jobs: [
        {
          title: "Senior Front-end Engineer",
          duration: "July 2020 - Apr. 2024",
          summaries: [
            `The company builds a so-called CDxP product. In brief, it is a data platform that tailor-made to host and process customer profiles (the keystone solution is how would you able to identify and unify your customers data from heterogeneous schemas and formats from diverged services and systems).`,
          ],
          key_contribution: [
            `Led Front-end team, delivering <b>10+ projects</b> including CDxP app, Magento & WordPress demos, JS SDKs, mobile SDKs, and more.`,
            `Managed team of <b>4 members</b>, aligning with product roadmap to satisfy multiple major partners, enhancing UI/UX and implementing advanced features like 360 profiles and campaign builders.`,
            `Developed lightweight JS SDK with full functionalities (<b><200kb, <150ms</b> load time), facilitating seamless integration across projects.`,
            `Demonstrated rapid <b>problem-solving</b>, ensuring swift feature demonstrations to impress clients and investors.`,
          ],
          key_techs: ["ReactJs", "Next.js", "Typescript", "WordPress", "SDK",  "Antdesign", "Team Leadership", "React Native", "Node.js"],
        },
      ],
      jobs_bk: [
        {
          title: "Senior Front-end Engineer",
          duration: "Mar 2022 - Apr. 2024",
          responsibilities: [
            "Strategically influenced the product roadmap by championing and executing impactful user experience enhancements.",
            "Led and motivated a cohesive team of 4 members, employing effective leadership strategies to ensure successful project completion. Emphasized teamwork, aligning individual strengths with project goals, and cultivated a culture of shared success and professional growth.",
            "Directed the development of new user-facing features, crafting reusable code and libraries to optimize application speed and scalability.",
            "Collaborated closely with designers and stakeholders to bridge the gap between design and technical implementation. Translated UI/UX wireframes into functional and visually appealing front-end components.",
            "Integrated third-party platform reports and data visualizations into the system, implementing secure authentication for external systems to uphold data security standards.",
            "Leveraged my expertise in code optimization and load time reduction, ensuring the application's efficiency and responsiveness met the highest standards."
          ],
          skills: ["ReactJs", "Next.js", "Typescript", "WordPress", "SDK",  "Antdesign", "Team Leadership"]
        },
        {
          title: "Full-stack Software Engineer",
          duration: "July 2020 - Mar 2022",
          responsibilities: [
            "Built and maintained websites for running seasonal, event-specific, or new brand branch campaigns. Implemented robust data tracking mechanisms to gather insights for customer care and marketing strategies.",
            "Designed and developed SDKs and application sets to complement the core application, providing crucial support for development, testing, and marketing teams.",
            "Led the development of the entire front-end code base from scratch for various applications, including the Customer Data Platform (CDP) app, shop app, bank app, tools, WordPress, Magento, and mobile app. Ensured comprehensive features catering to common user needs in all applications."
          ],
          skills: ["ReactJs", "Node.js", "React Native", "Java", "Typescript",  "Antdesign", "Wordpress", "Docker", "Team Leadership", "My SQL", "Firebase"]
        }
      ]
      
    },
    {
      company: "Splus-Software JSC",
      location: "Tan Binh",
      jobs: [
        {
          title: "Java Developer",
          duration: "Mar 2019 - July 2020",
          summaries: [
            `An out-sourcing company. Most projects revolve around <b>mobile and web apps</b>.`,
          ],
          key_contribution: [
            `With expertise in the <b>end-to-end software production process</b>, I <b>led a small team</b>, mastering the phases from requirements gathering to project security, laying the groundwork for future leadership roles.`,
            `Engaging in <b>8+</b> diverse projects across <b>education, food and drink, banking,</b> and <b>e-commerce</b> domains, I gained invaluable insights into both web and mobile application development.`,
            `As a project mercenary, I secured significant projects like Savyu and Bank Tool, generating over <b>$20,000</b> in revenue and earning recognition as the <b>Best Rookie of the Year</b> for my impactful contributions.`,
          ],
          key_techs: [ "Java", "Spring Framework", "ReactJs", "Next.js", "Typescript", "React Native", "My SQL", "Antdesign", "Realm DB", "Wordpress", "Node.js",]
        },
      ],
      jobs_bk: [
        {
          title: "Java Developer",
          duration: "Mar 2019 - July 2020",
          responsibilities: [
            "Delivered a diverse range of projects, including websites, mobile apps, and internal tools, for prestigious Japanese and American partners.",
            "Flourished in an outsourcing environment, honing cross-cultural communication and collaboration skills while engaging with clients from diverse backgrounds.",
            "Optimized software production processes and refined time management skills by navigating various projects and meeting tight deadlines, ensuring the timely delivery of high-quality solutions.",
            "Contributed to both front-end and back-end code development using Java, Spring, and React. Adhered rigorously to software development best practices and principles, emphasizing code quality, testing, and documentation.",
            "Demonstrated exceptional problem-solving skills and meticulous attention to detail while collaborating with a dynamic team of developers and project managers. Ensured the completion of all projects to the highest standards of quality.",
            "Served as an onsite representative for Mobivi and Synova Solutions, exhibiting stellar communication and collaboration skills with clients and internal teams. Consistently delivered high-quality projects, making significant contributions to the company's growth and success."
          ],
          skills: ["ReactJs", "Java", "Node.js", "React Native", "My SQL", "Antdesign", "Realm DB"]
        }
      ]
    },
    {
      company: "Propman Guru",
      location: "District 2",
      jobs: [
        {
          title: "Fresher Front-end Developer",
          duration: "May 2018 - Jan 2019",
          summaries: [
            `A <b>real estate-domain</b> startup. I was one of the founding engineers.`,
          ],
          key_contribution: [
            `Initiated involvement in primary web app development as a Front-end Developer. Obtained foundational web development skills, with a specialization in <b>React JS</b> and related technologies. Collaborated on responsive design projects, prioritizing enhancements for user experience.`,
          ],
          key_techs: ["ReactJs", "Javascript", "Wordpress", "Material UI"]
        },
      ],
      jobs_bk: [
        {
          title: "Fresher Front-end Developer",
          duration: "May 2018 - Jan 2019",
          responsibilities: [
            "Embarked on my professional journey as a Fresher Front-end Developer, actively contributed to the development and maintenance of the primary web app, gaining foundational skills and practical insights into web development.",
            "Delved deep into React JS, mastering associated technologies, libraries like axios, redux, middleware, ..., laying the groundwork for modern web development.",
            "Collaborated on responsive designs for property listing pages, showcasing a commitment to delivering an exceptional user experience."
          ],
          skills: ["ReactJs", "Javascript", "Wordpress", "Material UI"]
        }
      ]
    }
  ],
  projects: [
    {
      name: "Digital SAT Math",
      technologies: ["Next.js", "React", "React Native", "Antdesign", "Docker", "GCP", "Directus", "Google Ads", "Stripe"],
      duration: "Oct 2023 - Present",
      description: [],
      accomplishment: [
        `Orchestrated product development spanning UI/UX design, product engineering, and user behavior analysis, resulting in a global user base exceeding <b>10,000</b> visits and <b>3,000</b> signups within two months.`,
        `Elevated Google search rankings through strategic SEO initiatives, including proficiency in <b>parasite SEO</b> techniques. These efforts led to significant performance enhancements and effective positioning of the product in alignment with industry peers.`,
        `Demonstrated efficiency and resource optimization in front-end application development by leveraging a single Cloud Run instance with <b>1 CPU</b> and a memory limit of <b>256 MiB</b>.`,
        `Spearheaded the development of a mobile app with a <b>mobile-first</b> approach, enabling rapid deployment to app stores within <b>two days</b>. Additionally, ensured seamless <b>PWA</b> installation across all devices, enhancing accessibility and user experience.`,
        `Developed <b>monetization features</b>, including the integration of <b>Google Ads</b> and the implementation of the <b>Stripe</b> payment flow, to enhance revenue generation. `
      ]
    },
    {
      name: "CDP",
      technologies: ["React", "Next.js", "Antdesign", "React Native", "WordPress", "Docker"],
      duration: "July 2020 - Apr 2024",
      description: [],
      accomplishment: [
        `Led the architecture and implementation of the CDxP project, focusing on <b>UI/UX</b> features, which enhanced the overall user experience and increased user engagement.`,
        `Configured nested routers, maintained a <b>scalable</b> project structure and demonstrated strong knowledge of ES6, Typescript, and data types, which <b>improved code maintainability</b> and reduced code-related issues.`,
        `Effectively <b>tracked errors</b>, and enhancements, and provided support for bug fixes, ensuring the project’s <b>stability</b>, which improved system reliability and reduced system downtime.`,
        `Implemented <b>RBAC</b> hooks to verify authorization for accessing components in adaptive client configurations. Additionally, I have built over <b>20 reusable utility features</b> that can be shared across different projects thanks to their modular design.`,
        `Engineered <b>10+ advanced features</b> such as profiles, campaigns, analytics, and more.`,
        `Established robust testing flow, covering core CDP features with <b>100+ scenarios</b> and <b>1000+ test cases</b>.`,
        `Acquired domain expertise and excelled in testing methodologies, including BDD, unit testing, and <b>E2E testing</b>, which improved test coverage and reduced software bugs by <b>30%</b>.`,
        `Developed a <b>feature flag</b> for runtime toggling, enabling A/B testing and feature grouping based on customer segments, which optimized feature delivery and increased feature adoption.`,
        `<b>Documented</b> components for clarity and ease of maintenance, which improved code readability and reduced maintenance time.`,
      ]
    },
    {
      name: "Event Tracking - Web SDK",
      technologies: ["Vanilla JS", "WebSocket", "Web Worker", "Firebase"],
      duration: "May 2021 - Jan 2024",
      description: [],
      accomplishment: [
        `Successfully developed over <b>5 modules</b>, incorporating more than <b>10 advanced features</b> using <b>vanilla JS</b>. Achieved an impressive bundle size of <b><200kb and a load time of <150ms</b> (metrics measured prior to employing all optimization techniques for the bundle).`,
        `Utilized <b>web workers and service workers</b> to facilitate multitasking in the background, effectively managing complex functionalities and handling <b>multiple edge cases</b>, such as simultaneous multi-tab usage.`,
        `Additionally, designed and implemented a <b>personalized recommendation feature</b> using a <b>micro-frontend</b> architecture, specifically a carousel block showcasing products users may love, thereby enhancing user experience and engagement.`,
        `Among the various advanced features built are web pop-ups, web push notifications, <b>web component embedding</b>, WebSocket integration, and management of annoying pop-ups across multiple tabs.`,
        `Furthermore, leveraged <b>JS Closure</b> to organize module structures, enabling seamless feature export or <b>data encapsulation</b>, thereby <b>avoid conflicts</b> within the global scope.`,
      ]
    },
    {
      name: "Vietnam Australia Center",
      technologies: ["React", "Firebase", "Next.js"],
      duration: "May 2023",
      description: [],
      accomplishment: [
        `Took on the responsibility of <b>teaching</b> a <b>Front-end Project</b> course at Vietnam Australia Center.`,
        `Designed and delivered <b>engaging lectures</b>, providing hands-on guidance to students on front-end development projects.`,
        `Focused on fostering a <b>collaborative</b> learning environment, encouraging <b>teamwork</b> for <b>12 students</b>, and aligning coursework with industry best practices.`,
        `Provided personalized <b>feedback</b> and <b>mentoring</b>, supporting students in <b>overcoming challenges</b> and ensuring a comprehensive understanding of the course material.`
      ]
    },
    // {
    //   name: "SmartR.co",
    //   technologies: ["React", "Next.js", "Chart.js", "Material UI"],
    //   duration: "Aug 2022",
    //   description: [],
    //   accomplishment: [
    //     "Contributed to a project as a freelancer, focusing on developing a CMS website using Next.js and Strapi headless CMS."
    //   ]
    // },
    {
      name: "House Management - Mona House",
      technologies: ["React Native", "Realm DB", "Figma"],
      duration: "Feb 2020 - May 2020",
      description: [],
      accomplishment: [
        `Developed a comprehensive mobile application, Mona House, using <b>React Native</b> and Realm DB for efficient house management.`,
        `Specialized in creating cross-platform apps with a focus on <b>reusable components</b>, smooth animations, and seamless integration with native modules.`,
        `Demonstrated strong <b>problem-solving</b> and <b>troubleshooting</b> skills, swiftly identifying and resolving complex issues through advanced debugging tools and performance profiling.`,
        `Exhibited <b>adaptability</b> and a <b>quick learning curve</b> for new technologies, allowing seamless implementation of new frameworks, programming languages, or tools to ensure project completion.`
      ]
    },
    {
      name: "Bank tool - Mobivi",
      technologies: ["React", "Java", "Spring Boot", "MySQL", "Redux"],
      duration: "Dec 2019",
      description: [],
      accomplishment: [
        "Developed a <b>full-stack web application</b> at Mobivi, focusing on ingesting and processing data over <b>20 Excel files</b>, each containing over <b>20,000 records</b>.",
        "The application was designed to efficiently handle progressively calculated transactional data from users, <b>ensuring accurate and reliable reporting</b>."
      ]
    },
    {
      name: "Savyu - Synova Solutions",
      technologies: ["React Native", "React", "Node.js", "Firebase", "Redux"],
      duration: "May 2019",
      description: [],
      accomplishment: [
        "Played a pivotal role in the development of <b>two mobile</b> applications at Synova - one catering to merchants and the other targeting consumers.",
        "Contributed to the creation of a <b>web application</b> empowering administrators to efficiently manage user data.",
        "Demonstrated <b>proficiency in mobile app</b> development, collaborating with cross-functional teams to ensure the successful delivery of <b>intuitive</b> and <b>high-performing</b> applications."
      ]
    }
  ],
  achievements: [
    {
      title: "The degree of engineer",
      year: 2020,
      description: ["Bachelor's degree in Software Engineering, awarded with a very good classification."]
    },
    {
      title: "Certification in Software Testing",
      year: 2019,
      description: ["I was awarded a type-A certificate by GST and invited to join their project."]
    },
    {
      title: "Best Rookie Of The Year",
      year: 2019,
      description: []
    }
  ],
  education: [
    {
      school: "Nong Lam University",
      description: ["Bachelor of Information Technology, Minor in Software Engineering"],
      GPA: 3.36,
      duration: "Sep. 2015 - Dec 2019"
    }
  ],
  references: [
    {
      name: "Mr. NGO VAN KIM KHANH",
      roles: ["Co-founder & Developer & CEO, Algae", "SRE & Cloud/OnPrem Infrastructure, PrimeData VN"],
      email: "khanh.ngo@algae.vn",
      phone: "(+84) 907-709-380"
    }
  ]
}
