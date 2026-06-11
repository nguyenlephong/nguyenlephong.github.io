"use client";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { APP_ROUTE } from "@/app/app.const";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { track } from "@/lib/analytics";

export default function AppHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navItems: { href: string; label: string; trackId: string }[] = [
    { href: "/#about", label: t("about"), trackId: "about" },
    { href: "/#experience", label: t("experience"), trackId: "experience" },
    { href: "/#projects", label: t("projects"), trackId: "projects" },
    { href: "/#contact", label: t("contact"), trackId: "contact" },
    { href: APP_ROUTE.GALLERY, label: t("gallery"), trackId: "gallery" },
    { href: APP_ROUTE.BLOG, label: t("blog"), trackId: "blog" },
    { href: APP_ROUTE.NOTES, label: t("notes"), trackId: "notes" }
  ];

  return (
    <>
      <header className={`app-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="app-nav-inner">
          <Link
            href={APP_ROUTE.HOME}
            className="brand"
            onClick={() => track("cv_nav_click", { target: "home" })}
          >
            <span className="brand-mark" aria-hidden="true">
              NLP
            </span>
            <span className="brand-text">Nguyen Le Phong</span>
          </Link>

          <nav className="nav-links" aria-label="Sections">
            {navItems.map((item) => (
              <Link
                key={item.trackId}
                href={item.href}
                className="nav-link"
                onClick={() => track("cv_nav_click", { target: item.trackId })}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <ThemeToggle />
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
              onClick={() => setMenuOpen((prev) => !prev)}
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
            <Link
              key={item.trackId}
              href={item.href}
              className="nav-mobile-link"
              onClick={() => {
                track("cv_nav_click", { target: item.trackId });
                setMenuOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
          <div className="nav-mobile-footer">
            <a
              href={APP_ROUTE.CV_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm nav-mobile-cta"
              onClick={() =>
                track("cv_resume_download", { source: "mobile-nav" })
              }
            >
              {t("resume")}
            </a>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="nav-mobile-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
