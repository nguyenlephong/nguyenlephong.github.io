import { MetadataRoute } from "next";

/**
 * Refs:
 * [robots.txt](https://www.robotstxt.org/robotstxt.html)
 * [create-robots-txt](https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt?hl=vi#useful-robots.txt-rules)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: "/private/"
      },
      {
        userAgent: "Google",
        allow: "/"
      },
      {
        userAgent: "*",
        allow: "/"
      }
    ],
    sitemap: [
      "https://nguyenlephong.github.io/sitemap.xml",
    ]
  };
}
