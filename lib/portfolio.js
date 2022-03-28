import configs from "./config/app-config";
/* Change this file to get your personal Porfolio */

// Website related settings
const settings = {
  isSplash: true, // Change this to false if you don't want Splash screen.
};

//SEO Related settings
const seo = {
  title: "Nguyễn Lê Phong | Dom's Profile",
  description:
    "A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact.",
  og: {
    title: "Nguyễn Lê Phong | Dom's Profile",
    type: "website",
    url: "https://nguyenlephong.github.io",
  },
};

//Home Page
const greeting = {
  title: "Nguyễn Lê Phong",
  logo_name: "Nguyễn Lê Phong",
  nickname: "dom",
  subTitle:
    "A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact.",
  resumeLink: configs.app.CDN_PATH + "/CV/CV.pdf",
  portfolio_repository: "https://github.com/nguyenlephong",
};

const socialMediaLinks = [
  /* Your Social Media Link */
  // github: "https://github.com/nguyenlephong",
  // linkedin: "https://www.linkedin.com/in/nguyenlephong/",
  // gmail: "nguyenlephong1997@gmail.com",
  // gitlab: "https://gitlab.com/nguyenlephong",
  // facebook: "https://www.facebook.com/nguyenlephong",
  // twitter: "https://twitter.com/nguyenlephong",
  // instagram: "https://www.instagram.com/nguyenlephong"

  {
    name: "Github",
    link: "https://github.com/nguyenlephong",
    fontAwesomeIcon: "fa-github", // Reference https://fontawesome.com/icons/github?style=brands
    backgroundColor: "#181717", // Reference https://simpleicons.org/?q=github
  },
  {
    name: "LeetCode",
    link: "https://leetcode.com/nguyenlephong/",
    fontAwesomeIcon: "fa-old-republic", // Reference https://fontawesome.com/icons/github?style=brands
    backgroundColor: "#1DA1F2", // Reference https://simpleicons.org/?q=github
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/phong-nguyen-0107/",
    fontAwesomeIcon: "fa-linkedin-in", // Reference https://fontawesome.com/icons/linkedin-in?style=brands
    backgroundColor: "#0077B5", // Reference https://simpleicons.org/?q=linkedin
  },
  {
    name: "YouTube",
    link: "https://www.youtube.com/channel/UCVT2aPzoLT4Qj64VpDBvxuw",
    fontAwesomeIcon: "fa-youtube", // Reference https://fontawesome.com/icons/youtube?style=brands
    backgroundColor: "#FF0000", // Reference https://simpleicons.org/?q=youtube
  },
  {
    name: "Gmail",
    link: "mailto:nguyenlephong1997@gmail.com",
    fontAwesomeIcon: "fa-google", // Reference https://fontawesome.com/icons/google?style=brands
    backgroundColor: "#D14836", // Reference https://simpleicons.org/?q=gmail
  },
  {
    name: "Twitter",
    link: "https://twitter.com/nguyenlephong17",
    fontAwesomeIcon: "fa-twitter", // Reference https://fontawesome.com/icons/twitter?style=brands
    backgroundColor: "#1DA1F2", // Reference https://simpleicons.org/?q=twitter
  },
  {
    name: "Facebook",
    link: "https://www.facebook.com/NguyenLePhong0107/",
    fontAwesomeIcon: "fa-facebook-f", // Reference https://fontawesome.com/icons/facebook-f?style=brands
    backgroundColor: "#1877F2", // Reference https://simpleicons.org/?q=facebook
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/anhmap0107/",
    fontAwesomeIcon: "fa-instagram", // Reference https://fontawesome.com/icons/instagram?style=brands
    backgroundColor: "#E4405F", // Reference https://simpleicons.org/?q=instagram
  },
];

const skills = {
  data: [
    {
      title: "Data Science & AI",
      fileName: "DataScienceImg",
      skills: [
        "⚡ Experience of working with Face Recognition and NLP projects",
      ],
      softwareSkills: [
        {
          skillName: "Microsoft",
          fontAwesomeClassname: "logos-microsoft",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "AWS",
          fontAwesomeClassname: "logos-aws",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Python",
          fontAwesomeClassname: "ion-logo-python",
          style: {
            backgroundColor: "transparent",
            color: "#3776AB",
          },
        },
      ],
    },
    {
      title: "Full Stack Development",
      fileName: "FullStackImg",
      skills: [
        "⚡ Building responsive website front end using React-Redux or VueJS",
        "⚡ Developing mobile applications using Native Script, React Native and solo android apps using Java or Kotlin",
        "⚡ Creating application backend in Node, Express or Java, Spring boot",
      ],
      softwareSkills: [
        {
          skillName: "HTML5",
          fontAwesomeClassname: "simple-icons:html5",
          style: {
            color: "#E34F26",
          },
        },
        {
          skillName: "CSS3",
          fontAwesomeClassname: "fa-css3",
          style: {
            color: "#1572B6",
          },
        },
        {
          skillName: "Sass",
          fontAwesomeClassname: "simple-icons:sass",
          style: {
            color: "#CC6699",
          },
        },
        {
          skillName: "Ant Design",
          fontAwesomeClassname: "simple-icons:antdesign",
          style: {
            color: "#CC6699",
          },
        },
        {
          skillName: "JavaScript",
          fontAwesomeClassname: "simple-icons:javascript",
          style: {
            backgroundColor: "#000000",
            color: "#F7DF1E",
          },
        },
        {
          skillName: "ReactJS",
          fontAwesomeClassname: "simple-icons:react",
          style: {
            color: "#61DAFB",
          },
        },
        {
          skillName: "React Native",
          fontAwesomeClassname: "simple-icons:react",
          style: {
            color: "#61DAFB",
          },
        },
        {
          skillName: "Native Script",
          fontAwesomeClassname: "simple-icons:nativescript",
          style: {
            color: "#61DAFB",
          },
        },
        {
          skillName: "NodeJS",
          fontAwesomeClassname: "simple-icons:node-dot-js",
          style: {
            color: "#339933",
          },
        },
        {
          skillName: "Java",
          fontAwesomeClassname: "simple-icons:java",
          style: {
            color: "#339933",
          },
        },
        {
          skillName: "Spring",
          fontAwesomeClassname: "simple-icons:spring",
          style: {
            color: "#339933",
          },
        },
        {
          skillName: "Redux",
          fontAwesomeClassname: "simple-icons:redux",
          style: {
            color: "#339933",
          },
        },
        {
          skillName: "NPM",
          fontAwesomeClassname: "simple-icons:npm",
          style: {
            color: "#CB3837",
          },
        },
        {
          skillName: "Yarn",
          fontAwesomeClassname: "simple-icons:yarn",
          style: {
            color: "#2C8EBB",
          },
        },
      ],
    },
    {
      title: "Cloud Infra-Architecture",
      fileName: "CloudInfraImg",
      skills: [
        "⚡ Experience working and deployment on Linux server",
        "⚡ Hosting and maintaining websites on virtual machine instances along with integration of databases",
      ],
      softwareSkills: [
        {
          skillName: "AWS",
          fontAwesomeClassname: "simple-icons:amazonaws",
          style: {
            color: "#FF9900",
          },
        },
        {
          skillName: "Azure",
          fontAwesomeClassname: "simple-icons:microsoftazure",
          style: {
            color: "#0089D6",
          },
        },
        {
          skillName: "Firebase",
          fontAwesomeClassname: "simple-icons:firebase",
          style: {
            color: "#FFCA28",
          },
        },
        {
          skillName: "MySQL",
          fontAwesomeClassname: "simple-icons:mysql",
          style: {
            color: "#336791",
          },
        },
        {
          skillName: "Microsoft SQL Server",
          fontAwesomeClassname: "simple-icons:microsoftsqlserver",
          style: {
            color: "#336791",
          },
        },
        {
          skillName: "MongoDB",
          fontAwesomeClassname: "simple-icons:mongodb",
          style: {
            color: "#47A248",
          },
        },
        {
          skillName: "Docker",
          fontAwesomeClassname: "simple-icons:docker",
          style: {
            color: "#1488C6",
          },
        },
        {
          skillName: "NGINX",
          fontAwesomeClassname: "simple-icons:nginx",
          style: {
            color: "#326CE5",
          },
        },
      ],
    },
    {
      title: "UI/UX Design",
      fileName: "DesignImg",
      skills: [
        "⚡ Designing a highly attractive user interface for mobile and web applications",
        "⚡ Creating the flow of application functionalities to optimize user experience",
      ],
      softwareSkills: [
        {
          skillName: "Adobe XD",
          fontAwesomeClassname: "simple-icons:adobexd",
          style: {
            color: "#FF2BC2",
          },
        },
      ],
    },
  ],
};

// Education Page
const competitiveSites = {
  competitiveSites: [
    // {
    //   siteName: "HackerRank",
    //   iconifyClassname: "simple-icons:hackerrank",
    //   style: {
    //     color: "#2EC866",
    //   },
    //   profileLink: "https://www.hackerrank.com/dom",
    // },
  ],
};

const degrees = {
  degrees: [
    {
      title: "Information Technology Industry of Nong Lam University",
      subtitle: "Software Engineering",
      logo_path: configs.app.CDN_PATH + "/images/hcm_uaf_logo.png",
      alt_name: "Nong Lam University",
      duration: "2019 - Present",
      descriptions: [
        "⚡ I received an excellent diploma (runner-up - 2019) from my esteemed principal for consistently having the best academic performance.",
        "⚡ I have studied basic software engineering subjects like DS, Algorithms, DBMS, AI etc.",
      ],
      website_link: "https://www.hcmuaf.edu.vn/",
    },
  ],
};

const certifications = {
  certifications: [
    {
      title: "Tester Certificate",
      subtitle: "FPT Software",
      logo_path: configs.app.CDN_PATH + "/images/certificate-flat.png",
      certificate_link: configs.app.CDN_PATH + "/images/me/certificate-test.JPG",
      alt_name: "FPT Software",
      color_code: "#8C151599",
    },
    {
      title: "Best Rookie Of The Year 2019",
      subtitle: "Splus Software",
      logo_path: configs.app.CDN_PATH + "/images/certificate-flat.png",
      certificate_link: configs.app.CDN_PATH + "/images/me/certificate_splus.jpeg",
      alt_name: "Splus Software",
      color_code: "#00000099",
    },
    {
      title: "Most Valuable Employee",
      subtitle: "PrimeData",
      logo_path: configs.app.CDN_PATH + "/images/certificate-flat.png",
      certificate_link: configs.app.CDN_PATH + "/images/me/award_prime.jpeg",
      alt_name: "PrimeData",
      color_code: "#0C9D5899",
    },
  ],
};

// Experience Page
const experience = {
  title: "Experience",
  subtitle: "Work and Freelancer",
  description:
    "I have worked with two product startups and one longtime outsourcing company. So I have a lot of experience in Frontend Development profession. Besides, I am also considered as a project mercenary of the outsourcing company. I have grown from such diverse projects. It also gives me confidence as a freelancer to receive projects from partners in my network of contacts. And I'm getting more and more experienced.",
  header_image_path: configs.app.CDN_PATH + "/images/experience.svg",
  timelines: [
    {
      title: "15 July 2020 - Present",
      cardTitle: "Fullstack Software Engineer",
      url: "https://primedata.ai",
      cardSubtitle: "PrimeData.ai",
      cardDetailedText: [
        "15 July 2020 - Present",
        "Asia Science-first Customer Data & eXperience Platform for growth marketing and digital innovation",
        "12B, Nguyen Huu Canh Street, Ward 19, Binh Thanh District, Ho Chi Minh City, Vietnam",
      ],
      media: {
        type: "IMAGE",
        source: {
          url: configs.app.CDN_PATH + "/images/prime_logo.jpeg",
        }
      }
    },
    {
      title: "01 Mar 2019 - 10 July 2020",
      cardTitle: "Java Developer",
      url: "https://splus-software.com.vn/",
      cardSubtitle: "Splus-Software JSC",
      cardDetailedText: [
        "01 Mar 2019 - 10 July 2020",
        "SPLUS-SOFTWARE strives to become a top brand in software development not only in Vietnam but also worldwide. We strive to bring benefits to customers and prosper for Vietnam. For us, quality of service and people are the core elements we must focus.",
        "08th Floor, Ha Do AirPort Building, 2 Hong Ha Street, Ward 2, Tan Binh District, Ho Chi Minh City, Vietnam",
      ],
      media: {
        type: "IMAGE",
        source: {
          url: configs.app.CDN_PATH + "/images/splus_logo.png",
        }
      }
    },
    {
      title: "01 Feb 2020 - 12 May 2020",
      cardTitle: "Freelancer Mobile App",
      url: "https://mona.media/",
      cardSubtitle: "Mona House",
      cardDetailedText: [
        "Build Mobile App Using ReactNative."],
      media: {
        type: "IMAGE",
        source: {
          url: configs.app.CDN_PATH + "/images/icon-mona.png",
        }
      }
    },
    {
      title: "May 2018 - Jan 2019",
      cardTitle: "Frontend Developer",
      url: "https://propmancapital.com/",
      cardSubtitle: "Proptech Plus - Propman Capital",
      cardDetailedText: [
        "May 2018 - Jan 2019",
        "Building a management application for the real estate industry",
        "628c Xa Lo Ha Noi Street, The Oxygen, An Phu Ward, 2 District, Ho Chi Minh City, Vietnam"
      ],
      media: {
        type: "IMAGE",
        source: {
          url: "https://scontent.fhan4-3.fna.fbcdn.net/v/t1.6435-9/148547106_261386072035787_1621323659790408972_n.jpg?_nc_cat=103&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=6yH7Uql0ARUAX_MY8al&_nc_ht=scontent.fhan4-3.fna&oh=00_AT_07b22KaEOYB5JDY3-BTmozni8VwJrSQVzBsE-3JNOfw&oe=61DB9569",
        }
      }
    }
  ],
  sections: [
    {
      title: "Work",
      experiences: [
        {
          title: "Fullstack Software Engineer",
          company: "PrimeData.ai",
          company_url: "https://primedata.ai",
          logo_path: configs.app.CDN_PATH + "/images/prime_logo.jpeg",
          duration: "15 July 2020 - Present",
          location:
            "12B, Nguyen Huu Canh Street, Ward 19, Binh Thanh District, Ho Chi Minh City, Vietnam",
          description:
            "Asia Science-first Customer Data & eXperience Platform for growth marketing and digital innovation",
          color: "#fc1f20",
        },

        {
          title: "Java Developer",
          company: "Splus-Software JSC",
          company_url: "https://splus-software.com.vn/",
          logo_path: configs.app.CDN_PATH + "/images/splus_logo.png",
          duration: "01 Mar 2019 - 10 July 2020",
          location:
            "08th Floor, Ha Do AirPort Building, 2 Hong Ha Street, Ward 2, Tan Binh District, Ho Chi Minh City, Vietnam",
          description:
            "SPLUS-SOFTWARE strives to become a top brand in software development not only in Vietnam but also worldwide. We strive to bring benefits to customers and prosper for Vietnam. For us, quality of service and people are the core elements we must focus.",
          color: "#9b1578",
        },
        {
          title: "Frontend Developer",
          company: "Proptech Plus - Propman Capital",
          company_url: "https://propmancapital.com/",
          logo_path: "https://scontent.fhan4-3.fna.fbcdn.net/v/t1.6435-9/148547106_261386072035787_1621323659790408972_n.jpg?_nc_cat=103&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=6yH7Uql0ARUAX_MY8al&_nc_ht=scontent.fhan4-3.fna&oh=00_AT_07b22KaEOYB5JDY3-BTmozni8VwJrSQVzBsE-3JNOfw&oe=61DB9569",
          duration: "May 2018 - Jan 2019",
          location:
            "628c Xa Lo Ha Noi Street, The Oxygen, An Phu Ward, 2 District, Ho Chi Minh City, Vietnam",
          description:
            "Building a management application for the real estate industry",
          color: "#0879bf",
        },
      ],
    },
    {
      title: "Freelancer",
      experiences: [
        {
          title: "Mona House",
          company: "Mona Media",
          company_url: "https://mona.media/",
          logo_path: configs.app.CDN_PATH + "/images/icon-mona.png",
          duration: "Mar 2020 - July 2020",
          location: "Q. Tân Bình, HCM",
          description: "Build Mobile App Using ReactNative.",
          color: "#D83B01",
        },
      ],
    },
  ],
};

// Projects Page
const projectsHeader = {
  title: "Projects",
  description:
    "My projects make use of a vast variety of latest technology tools. My best experience is to using ReactJS to build a website as a Single Page Application (SPA).",
  avatar_image_path: configs.app.CDN_PATH + "/images/projects_image.svg",
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Contact Me",
    profile_image_path: configs.app.CDN_PATH + "/images/dom.png",
    description:
      "I am available on almost every social media. You can message me, I will reply within 24 hours. I can help you with  ReactJS, JavaScript, ReactNative, Android, Kotlin, Java, Spring Boot, Opensource Development, AI.",
  },
  blogSection: {
    title: "Blogs",
    subtitle:
      "For individual fundamental empowerment, I like to write powerful lessons that create impact on each of the reader individually to change the core of their character.",
    link: "https://amuletstore.net",
    avatar_image_path: configs.app.CDN_PATH + "/images/blogs_image.svg",
  },
  addressSection: {
    title: "Address",
    subtitle:
      "23 - Nguyen Huu Canh - Phuong 19 - Quan Binh Thanh - TP Ho Chi Minh",
    avatar_image_path: configs.app.CDN_PATH + "/images/address_image.svg",
    location_map_link: "https://goo.gl/maps/JCq7NBV2bXmg9m6JA",
  },
  phoneSection: {
    title: "Phone Number",
    subtitle: "(+84) 098 549 0107",
  },
};

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  competitiveSites,
  degrees,
  certifications,
  experience,
  projectsHeader,
  contactPageData,
};