import { MetadataRoute } from "next";


export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://nguyenlephong.github.io`,
      lastModified: new Date("03/02/2024"),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `https://nguyenlephong.github.io/about`,
      lastModified: new Date("03/03/2024"),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `https://nguyenlephong.github.io/cv`,
      lastModified: new Date("03/03/2024"),
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: `https://nguyenlephong.github.io/gallery`,
      lastModified: new Date("03/03/2024"),
      changeFrequency: "daily",
      priority: 0.7
    },
  ];
}
