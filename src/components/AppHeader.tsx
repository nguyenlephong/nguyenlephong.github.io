"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { APP_ROUTE } from "@/app/app.const";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import IntentPrefetchLink from "@/components/navigation/IntentPrefetchLink";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { usePathname } from "@/i18n/navigation";
import { track } from "@/lib/analytics";

export default function AppHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuState, setMenuState] = useState({ pathname, open: false });
  const menuOpen = menuState.pathname === pathname && menuState.open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Recruiter order: the two CV sections first, then the pages. Crawlers read
  // these anchors (text plus URL) as the site's main sections.
  const navItems: { href: string; label: string; trackId: string }[] = [
    { href: `${APP_ROUTE.HOME}#experience`, label: t("experience"), trackId: "experience" },
    { href: `${APP_ROUTE.HOME}#projects`, label: t("projects"), trackId: "projects" },
    { href: APP_ROUTE.ABOUT, label: t("about"), trackId: "about" },
    { href: APP_ROUTE.BLOG, label: t("blog"), trackId: "blog" },
    { href: APP_ROUTE.NOTES, label: t("notes"), trackId: "notes" },
    { href: APP_ROUTE.APPS, label: t("apps"), trackId: "apps" }
  ];
  // Hash links never count as the current page: the whole homepage would match.
  const currentPage = (href: string) =>
    !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`))
      ? ("page" as const)
      : undefined;

  return (
    <>
      <header className={`app-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="app-nav-inner">
          <IntentPrefetchLink
            href={APP_ROUTE.HOME}
            className="brand"
            onClick={() => track("cv_nav_click", { target: "home" })}
          >
            <Image
              src="/favicon/android-icon-72x72.png"
              alt=""
              width={36}
              height={36}
              sizes="36px"
              className="brand-avatar"
            />
            <span className="brand-text">Nguyen Le Phong</span>
          </IntentPrefetchLink>

          <nav className="nav-links" aria-label="Main navigation">
            {navItems.map((item) => (
              <IntentPrefetchLink
                key={item.trackId}
                href={item.href}
                className="nav-link"
                aria-current={currentPage(item.href)}
                onClick={() => track("cv_nav_click", { target: item.trackId })}
              >
                {item.label}
              </IntentPrefetchLink>
            ))}
          </nav>

          <div className="nav-actions">
            <div className="nav-desktop-controls">
              <LocaleSwitcher placement="down" compact source="header" />
              <ThemeToggle />
            </div>
            <a
              href={APP_ROUTE.CV_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm nav-resume-btn"
              onClick={() => track("cv_resume_download", { source: "nav" })}
            >
              {t("resume")}
            </a>
            <button
              className="nav-mobile-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuState({ pathname, open: !menuOpen })}
            >
              <span
                className={`hamburger${menuOpen ? " is-open" : ""}`}
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <nav
        id="mobile-nav"
        className={`nav-mobile-panel${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="nav-mobile-inner">
          {navItems.map((item) => (
            <IntentPrefetchLink
              key={item.trackId}
              href={item.href}
              className="nav-mobile-link"
              aria-current={currentPage(item.href)}
              onClick={() => {
                track("cv_nav_click", { target: item.trackId });
                setMenuState({ pathname, open: false });
              }}
            >
              {item.label}
            </IntentPrefetchLink>
          ))}
          {/* Résumé stays in the header at this width; the panel carries the controls it displaced. */}
          <div className="nav-mobile-footer">
            <LocaleSwitcher placement="down" source="mobile-nav" />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="nav-mobile-backdrop"
          onClick={() => setMenuState({ pathname, open: false })}
          aria-hidden="true"
        />
      )}
    </>
  );
}
