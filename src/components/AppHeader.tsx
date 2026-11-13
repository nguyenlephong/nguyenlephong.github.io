"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { APP_ROUTE } from "@/app/app.const";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import IntentPrefetchLink from "@/components/navigation/IntentPrefetchLink";
import GlobalSearch from "@/components/search/GlobalSearch";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { usePathname } from "@/i18n/navigation";
import { track } from "@/lib/analytics";
import type { GlobalSearchConfig } from "@/lib/content/search-index";

export default function AppHeader({ search }: { search: GlobalSearchConfig }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuState, setMenuState] = useState({ pathname, open: false });
  const menuOpen = menuState.pathname === pathname && menuState.open;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeMenu = () => {
    setMenuState({ pathname, open: false });
    toggleRef.current?.focus();
  };

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

  // Open menu acts as a modal: everything outside the header, panel and backdrop
  // goes inert, and Escape from anywhere closes it and returns focus to the toggle.
  useEffect(() => {
    if (!menuOpen) return;
    const header = toggleRef.current?.closest("header");
    const keep = new Set([header, document.getElementById("mobile-nav")]);
    const muted = [...(header?.parentElement?.children ?? [])].filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement &&
        !keep.has(el) &&
        !el.classList.contains("nav-mobile-backdrop") &&
        !el.inert
    );
    muted.forEach((el) => (el.inert = true));
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      // An open language list inside the panel takes the first Escape.
      if (document.querySelector("#mobile-nav .locale-menu.is-open")) return;
      setMenuState({ pathname, open: false });
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    // The panel only exists below 1024px: crossing it (resize, tablet rotation)
    // must close the menu, or the page stays inert behind a hidden toggle.
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => {
      if (wide.matches) setMenuState({ pathname, open: false });
    };
    wide.addEventListener("change", onWide);
    return () => {
      muted.forEach((el) => (el.inert = false));
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [menuOpen, pathname]);

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
            inert={menuOpen}
            onClick={() => track("cv_nav_click", { target: "home" })}
          >
            <Image
              src="/favicon/avatar-72x72.webp"
              alt=""
              width={36}
              height={36}
              sizes="36px"
              className="brand-avatar"
            />
            <span className="brand-text">Nguyen Le Phong</span>
          </IntentPrefetchLink>

          <nav className="nav-links" aria-label={t("mainNav")}>
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
            <GlobalSearch config={search} muted={menuOpen} />
            <div className="nav-desktop-controls">
              <LocaleSwitcher placement="down" compact source="header" />
              <ThemeToggle />
            </div>
            <a
              href={APP_ROUTE.CV_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm nav-resume-btn"
              inert={menuOpen}
              onClick={() => track("cv_resume_download", { source: "nav" })}
            >
              {t("resume")}
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="nav-mobile-toggle"
              aria-label={menuOpen ? t("menuClose") : t("menuOpen")}
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
        aria-label={t("mainNav")}
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
                // Same-page hash links remount nothing, so hand focus back to the toggle.
                if (item.href.includes("#")) closeMenu();
                else setMenuState({ pathname, open: false });
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
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}
