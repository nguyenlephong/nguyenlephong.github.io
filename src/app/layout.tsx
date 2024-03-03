import type {Metadata, Viewport} from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {profileInfo, SEO} from "@/app/app.const";
import Script from "next/script";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import {Organization, WithContext} from "schema-dts";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  description: SEO.description,
  title: {
    template: "%s | " + SEO.title_tail,
    default: SEO.title
  },
  metadataBase: new URL(`https://nguyenlephong.github.io`),
  openGraph: {
    siteName: "Nguyen Le Phong - Front-end Software Engineer",
    url: `https://nguyenlephong.github.io`,
    images: [
      {
        url: "https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/dom.png",
        width: 320,
        height: 320,
        alt: "As a front-end software engineer with over five years of experience, I specialize in designing and implementing user-friendly web applications. Proficient in HTML, CSS, JavaScript, and React, my expertise extends to optimizing website performance to accommodate a large user base. My commitment to creating visually appealing and efficient interfaces has led to successful project deliveries across diverse industries."
      },
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    images: [
      "https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/dom.png"
    ]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  viewportFit: "cover",
  userScalable: true,
  initialScale: 1,
  maximumScale: 5
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
};

const jsonLD: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `https://nguyenlephong.github.io/#identity`,
  name: SEO.title,
  alternateName: `Front-end Engineer - ${SEO.description}`,
  url: "https://nguyenlephong.github.io",
  image: `https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/dom.png`,
  logo: `https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/dom.png`,
  sameAs: [
    profileInfo.contact.linkedin,
    profileInfo.contact.twitter,
    profileInfo.contact.github,
    profileInfo.contact.leetcode,
    profileInfo.contact.youtube,
    profileInfo.contact.facebook,
    profileInfo.contact.instagram,
  ],
  description: `${SEO.description} | ${SEO.title}`,
  email: profileInfo.contact.email
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    
    <head>
      <script
        key="nguyenlephong-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
    </head>
    
    {/*Global site tag (gtag.js) - Google Analytics*/}
    <Script strategy={"afterInteractive"} id={"GTM"} src="https://www.googletagmanager.com/gtag/js?id=G-RLXNC58343" />

    <Script
      strategy={"afterInteractive"} id={"adsbygoogle"}
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2196929070546836"
      crossOrigin="anonymous" />

    <Script
      id={"GTM_datalayer"}
      dangerouslySetInnerHTML={{
        __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RLXNC58343', {
              page_path: window.location.pathname,
            });
          `,
      }}
    />
    <Script
      id={"POSTHOG"}
      dangerouslySetInnerHTML={{
        __html: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_Ti11bWc5cshVoQe8AI7SuY56FMFP7Fhc9WyymdOGVSw',{api_host:'https://app.posthog.com'})`,
      }}
    />
      <body className={inter.className} suppressHydrationWarning={true}>
      <AppHeader/>
        {children}
      <AppFooter/>
      </body>
    </html>
  );
}
