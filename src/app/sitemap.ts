import { MetadataRoute } from "next";


export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://nguyenlephong.github.io`,
      lastModified: new Date("03/02/2024"),
      changeFrequency: "daily",
      priority: 1
    },
  ];
}
