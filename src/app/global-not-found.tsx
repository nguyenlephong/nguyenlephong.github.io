import type { Metadata } from "next";
import { SITE_URL } from "@/app/seo.config";
import PostHogBootstrap from "@/components/analytics/PostHogBootstrap";
import NotFoundRecovery from "@/components/not-found/NotFoundRecovery";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Page not found | Nguyen Le Phong",
  description:
    "The requested page is not available. Continue to Nguyen Le Phong's localized writing, notes, or profile."
};

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://us.i.posthog.com" crossOrigin="" />
        <link
          rel="preconnect"
          href="https://us-assets.i.posthog.com"
          crossOrigin=""
        />
        <style>{`
          :root { color-scheme: light dark; }
          * { box-sizing: border-box; }
          body {
            min-height: 100vh;
            margin: 0;
            color: #20201d;
            background:
              radial-gradient(circle at 85% 12%, rgba(37, 99, 235, 0.09), transparent 28rem),
              #f7f7f4;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          a { color: inherit; }
          .not-found {
            width: min(70rem, 100%);
            min-height: 100vh;
            margin-inline: auto;
            padding: clamp(2rem, 8vw, 7rem) clamp(1rem, 5vw, 3rem);
          }
          .not-found__card,
          .not-found__languages {
            border: 1px solid #deded8;
            border-radius: 1.25rem;
            background: rgba(255, 255, 255, 0.82);
            box-shadow: 0 1.25rem 4rem rgba(42, 42, 36, 0.07);
          }
          .not-found__card { padding: clamp(1.5rem, 5vw, 4rem); }
          .not-found__eyebrow {
            margin: 0 0 1rem;
            color: #5f5f58;
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          .not-found h1 {
            max-width: 18ch;
            margin: 0;
            font-size: clamp(2.3rem, 7vw, 5.25rem);
            font-weight: 650;
            letter-spacing: -0.055em;
            line-height: 0.98;
          }
          .not-found__description {
            max-width: 46rem;
            margin: 1.5rem 0 0;
            color: #55554f;
            font-size: clamp(1rem, 2vw, 1.15rem);
            line-height: 1.7;
          }
          .not-found__actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-top: 2rem;
          }
          .not-found__actions a,
          .not-found__languages a {
            border: 1px solid #d5d5cf;
            border-radius: 999px;
            padding: 0.7rem 1rem;
            font-weight: 650;
            text-decoration: none;
          }
          .not-found__actions a:hover,
          .not-found__languages a:hover { border-color: #2563eb; }
          .not-found__actions a:focus-visible,
          .not-found__languages a:focus-visible {
            outline: 3px solid rgba(37, 99, 235, 0.38);
            outline-offset: 3px;
          }
          .not-found__actions .not-found__primary {
            border-color: #1d4ed8;
            background: #1d4ed8;
            color: #ffffff;
          }
          .not-found__languages {
            display: grid;
            grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
            gap: 2rem;
            margin-top: 1rem;
            padding: clamp(1.25rem, 4vw, 2rem);
          }
          .not-found__languages h2 { margin: 0; font-size: 1.15rem; }
          .not-found__languages p {
            max-width: 34rem;
            margin: 0.65rem 0 0;
            color: #66665f;
            line-height: 1.6;
          }
          .not-found__languages ul {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
            align-content: start;
            margin: 0;
            padding: 0;
            list-style: none;
          }
          .not-found__languages a {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.55rem 0.8rem;
            font-size: 0.9rem;
          }
          @media (max-width: 44rem) {
            .not-found__languages { grid-template-columns: 1fr; gap: 1.25rem; }
          }
          @media (prefers-color-scheme: dark) {
            body {
              color: #f3f3ef;
              background:
                radial-gradient(circle at 85% 12%, rgba(96, 165, 250, 0.11), transparent 28rem),
                #11110f;
            }
            .not-found__card,
            .not-found__languages {
              border-color: #383833;
              background: rgba(27, 27, 24, 0.88);
              box-shadow: none;
            }
            .not-found__eyebrow,
            .not-found__description,
            .not-found__languages p { color: #b6b6ae; }
            .not-found__actions a,
            .not-found__languages a { border-color: #4a4a43; }
          }
        `}</style>
      </head>
      <body>
        <PostHogBootstrap locale="en" surface="not_found" />
        <NotFoundRecovery />
      </body>
    </html>
  );
}
