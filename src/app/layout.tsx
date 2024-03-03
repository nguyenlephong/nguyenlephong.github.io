import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SEO } from "@/app/app.const";
import Script from "next/script";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
