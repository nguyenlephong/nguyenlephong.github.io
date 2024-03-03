import {CDN_PATH} from "@/app/app.conf";

export const APP_ROUTE = {
  HOME: "/",
  ABOUT: "/about",
  GALLERY: "/gallery",
  CV: "/cv",
  CV_PDF: "/NguyenLePhong_0985490107_Front_end.pdf"
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
  photos: [
    {
      src: CDN_PATH + "/images/me/best_rookie.jpeg",
      alt: "Nguyen Le Phong - Software Engineer - Best rookie of the year",
      sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      width: 3,
      height: 4
    },
    {
      src: CDN_PATH + "/images/me/score_board.JPG",
      sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      alt: "Nguyen Le Phong - Software Engineer - Score board",
      width: 3,
      height: 4
    },
    {
      src: CDN_PATH + "/images/me/certificate-test.JPG",
      sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      alt: "Nguyen Le Phong - Software Engineer - Tester certificate",
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
      src: CDN_PATH + "/images/me/award_prime.jpeg",
      sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
      alt: "Nguyen Le Phong - Software Engineer - Award at PrimeData",
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
    linkedin: "https://www.linkedin.com/in/phong-nguyen-0107/",
    twitter: "https://twitter.com/nguyenlephong17",
    facebook: "https://www.facebook.com/NguyenLePhong0107/",
    instagram: "https://www.instagram.com/anhmap0107/"
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
      "As a front-end software engineer with over five years of experience, I specialize in designing and implementing user-friendly web applications. Proficient in HTML, CSS, JavaScript, and React, my expertise extends to optimizing website performance to accommodate a large user base. My commitment to creating visually appealing and efficient interfaces has led to successful project deliveries across diverse industries."
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
      company: "Math99th",
      location: "Remote",
      jobs: [
        {
          title: "Senior Front-end Engineer",
          duration: "Oct 2023 - Present",
          responsibilities: [
            "Championed the architectural blueprint and construction of the front-end and server-side project base, cultivating a meticulously organized and structured codebase. Elevated code maintainability and fostered seamless collaboration among cross-functional teams.",
            "Developed a web application for mathematical review using Next.js and Ant Design. Integrated Mathjax for displaying mathematical expressions, ensuring a seamless and visually appealing user experience.",
            "Collaborated with cross-functional teams to align with user needs and optimized application performance, showcasing expertise in front-end development and a commitment to delivering innovative solutions.",
            "Implemented and maintained an automated email flow for customer care, triggered by specific user segments, enhancing user engagement and satisfaction.",
            "Monitored and collected user behavior data for analysis and statistics. Utilized insights to execute targeted marketing campaigns, resulting in improved DAU, WAU, and MAU metrics."
          ]
        }
      ]
     
    },
    {
      company: "PrimeData VN",
      location: "Binh Thanh",
      jobs: [
        {
          title: "Senior Front-end Engineer",
          duration: "Mar. 2022 - Apr. 2024",
          responsibilities: [
            "Strategically influenced the product roadmap by championing and executing impactful user experience enhancements.",
            "Led and motivated a cohesive team of 4 members, employing effective leadership strategies to ensure successful project completion. Emphasized teamwork, aligning individual strengths with project goals, and cultivated a culture of shared success and professional growth.",
            "Directed the development of new user-facing features, crafting reusable code and libraries to optimize application speed and scalability.",
            "Collaborated closely with designers and stakeholders to bridge the gap between design and technical implementation. Translated UI/UX wireframes into functional and visually appealing front-end components.",
            "Integrated third-party platform reports and data visualizations into the system, implementing secure authentication for external systems to uphold data security standards.",
            "Leveraged my expertise in code optimization and load time reduction, ensuring the application's efficiency and responsiveness met the highest standards."
          ]
        },
        {
          title: "Full-stack Software Engineer",
          duration: "July 2020 - Mar 2022",
          responsibilities: [
            "Built and maintained websites for running seasonal, event-specific, or new brand branch campaigns. Implemented robust data tracking mechanisms to gather insights for customer care and marketing strategies.",
            "Designed and developed SDKs and application sets to complement the core application, providing crucial support for development, testing, and marketing teams.",
            "Led the development of the entire front-end code base from scratch for various applications, including the Customer Data Platform (CDP) app, shop app, bank app, tools, WordPress, Magento, and mobile app. Ensured comprehensive features catering to common user needs in all applications."
          ]
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
          responsibilities: [
            "Delivered a diverse range of projects, including websites, mobile apps, and internal tools, for prestigious Japanese and American partners.",
            "Flourished in an outsourcing environment, honing cross-cultural communication and collaboration skills while engaging with clients from diverse backgrounds.",
            "Optimized software production processes and refined time management skills by navigating various projects and meeting tight deadlines, ensuring the timely delivery of high-quality solutions.",
            "Contributed to both front-end and back-end code development using Java, Spring, and React. Adhered rigorously to software development best practices and principles, emphasizing code quality, testing, and documentation.",
            "Demonstrated exceptional problem-solving skills and meticulous attention to detail while collaborating with a dynamic team of developers and project managers. Ensured the completion of all projects to the highest standards of quality.",
            "Served as an onsite representative for Mobivi and Synova Solutions, exhibiting stellar communication and collaboration skills with clients and internal teams. Consistently delivered high-quality projects, making significant contributions to the company's growth and success."
          ]
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
          responsibilities: [
            "Embarked on my professional journey as a Fresher Front-end Developer, actively contributed to the development and maintenance of the primary web app, gaining foundational skills and practical insights into web development.",
            "Delved deep into React JS, mastering associated technologies, libraries like axios, redux, middleware, ..., laying the groundwork for modern web development.",
            "Collaborated on responsive designs for property listing pages, showcasing a commitment to delivering an exceptional user experience."
          ]
        }
      ]
    }
  ],
  projects: [
    {
      name: "Digital SAT Math",
      technologies: ["Next.js", "React", "React Native", "Antdesign", "Docker", "GCP"],
      duration: "Oct 2023 - Present",
      description: [],
      accomplishment: [
        "Architected the project and implemented all the UI/UX features on the project.",
        "Utilized Brevo in conjunction with business flow to construct an email flow, creating email templates aligned with trigger automation. Optimized content for various customer segments, enhancing user interaction and driving DAU, WAU, MAU metrics.",
        "Boosted Google search rankings, optimized SEO, and improved performance, successfully positioning the product to compete with industry peers within 2 months.",
        "Integrated GA4/GTM analytics and used Posthog for data visualization, tracking, and analysis. Built target segments for campaigns and marketing efforts.",
        "Initiated the development of a proof-of-concept (POC) mobile app using React Native and Expo, laying the groundwork for a future app for the product.",
        "Integrated the Stripe payment gateway, ensuring secure and smooth financial transactions within the application. Additionally, implemented a donation feature to enhance user engagement and support."
      ]
    },
    {
      name: "CDP",
      technologies: ["React", "Next.js", "Antdesign", "React Native", "WordPress", "Docker"],
      duration: "July 2020 - Present",
      description: [],
      accomplishment: [
        "Led the architecture and implementation of the CDP project, focusing on UI/UX features.",
        "Implemented Data Visualization using G2plot Chart and Apex Chart, collaborating closely with the Design team for UI/UX enhancement.",
        "Managed large-scale data integration from multiple APIs and conducted Unit testing, E2E testing, and BDD testing.",
        "Architected and implemented UI/UX features for the CDP project, including a drag-and-drop journey campaign builder tool.",
        "Developed a feature flag for runtime toggling, enabling A/B testing and feature grouping based on customer segments.",
        "Applied Higher Order Components (HOC) for effective Role-Based Access Control (RBAC) management.",
        "Built Slash command & attribute template features, facilitating editor-supported email/channel template delivery.",
        "Implemented cron jobs to sync event data to FBE, enhancing data synchronization.",
        "Configured nested routers, maintained a scalable project structure, and demonstrated strong knowledge of ES6, Typescript, and data types.",
        "Acquired domain expertise and excelled in testing methodologies, including BDD, unit testing, and E2E testing.",
        "Documented components for clarity and ease of maintenance.",
        "Effectively tracked errors, and enhancements, and provided support for bug fixes, ensuring the project's stability."
      ]
    },
    {
      name: "Vietnam Australia Center",
      technologies: ["React", "Firebase", "Next.js"],
      duration: "May 2023",
      description: [],
      accomplishment: [
        "Took on the responsibility of teaching a Front-end Project course at Vietnam Australia Center.",
        "Designed and delivered engaging lectures, providing hands-on guidance to students on front-end development projects.",
        "Focused on fostering a collaborative learning environment, encouraging teamwork, and aligning coursework with industry best practices.",
        "Provided personalized feedback and mentoring, supporting students in overcoming challenges and ensuring a comprehensive understanding of the course material."
      ]
    },
    {
      name: "SmartR.co",
      technologies: ["React", "Next.js", "Chart.js", "Material UI"],
      duration: "Aug 2022",
      description: [],
      accomplishment: [
        "Contributed to a project as a freelancer, focusing on developing a CMS website using Next.js and Strapi headless CMS."
      ]
    },
    {
      name: "House Management - Mona House",
      technologies: ["React Native", "Realm DB"],
      duration: "Feb 2020 - May 2020",
      description: [],
      accomplishment: [
        "Developed a comprehensive mobile application, Mona House, using React Native and Realm DB for efficient house management.",
        "Specialized in creating cross-platform apps with a focus on reusable components, smooth animations, and seamless integration with native modules.",
        "Demonstrated strong problem-solving and troubleshooting skills, swiftly identifying and resolving complex issues through advanced debugging tools and performance profiling.",
        "Exhibited adaptability and a quick learning curve for new technologies, allowing seamless implementation of new frameworks, programming languages, or tools to ensure project completion."
      ]
    },
    {
      name: "Bank tool - Mobivi",
      technologies: ["React", "Java Spring Boot", "MySQL"],
      duration: "Dec 2019",
      description: [],
      accomplishment: [
        "Developed a full-stack web application at Mobivi, focusing on ingesting and processing data over 20 Excel files, each containing over 20,000 records.",
        "The application was designed to efficiently handle progressively calculated transactional data from users, ensuring accurate and reliable reporting."
      ]
    },
    {
      name: "Savyu - Synova Solutions",
      technologies: ["React Native", "React", "Node.js"],
      duration: "May 2019",
      description: [],
      accomplishment: [
        "Played a pivotal role in the development of two mobile applications at Synova - one catering to merchants and the other targeting consumers.",
        "Contributed to the creation of a web application empowering administrators to efficiently manage user data.",
        "Demonstrated proficiency in mobile app development, collaborating with cross-functional teams to ensure the successful delivery of intuitive and high-performing applications."
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
