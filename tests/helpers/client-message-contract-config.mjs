const PROVIDER_DEPENDENT_NEXT_INTL_HOOKS = new Set([
  "useExtracted",
  "useFormatter",
  "useLocale",
  "useMessages",
  "useNow",
  "useTimeZone",
  "useTranslations"
]);

const RAW_PROVIDER_FILE = "src/i18n/ScopedIntlProvider.tsx";
const SCOPED_PROVIDER_MODULE = "@/i18n/ScopedIntlProvider";
const NAVIGATION_MODULE = "@/i18n/navigation";

const SCOPED_PROVIDER_PLACEMENTS = {
  "src/app/[locale]/(site)/blog/[category]/page.tsx": ["blog"],
  "src/app/[locale]/(site)/gallery/page.tsx": ["gallery"],
  "src/app/[locale]/(site)/layout.tsx": ["site"],
  "src/app/[locale]/(site)/page.tsx": ["home"],
  "src/components/blog/BlogCollectionPage.tsx": ["blog"],
  "src/components/notes/NotesCollectionPage.tsx": ["notes"]
};

const CLIENT_PROVIDER_CONSUMER_ROUTES = {
  "src/app/[locale]/(site)/blog/[category]/[slug]/page.tsx": "site",
  "src/app/[locale]/(site)/blog/[category]/page.tsx": "blog",
  "src/app/[locale]/(site)/gallery/page.tsx": "gallery",
  "src/app/[locale]/(site)/notes/[slug]/page.tsx": "site",
  "src/app/[locale]/(site)/offline/page.tsx": "site",
  "src/components/AppFooter.tsx": "site",
  "src/components/AppHeader.tsx": "site",
  "src/components/LocaleSwitcher.tsx": "site",
  "src/components/apps/AppsConsole.tsx": "site",
  "src/components/apps/english/EnglishPracticeApp.tsx": "site",
  "src/components/blog/BlogCategoryCard.tsx": "blog",
  "src/components/blog/BlogContent.tsx": "site",
  "src/components/blog/BlogExplorer.tsx": "blog",
  "src/components/blog/BlogPagination.tsx": "blog",
  "src/components/blog/BlogRelatedPosts.tsx": "site",
  "src/components/content/LocalizedArticleFallback.tsx": "site",
  "src/components/cv/ContactCTA.tsx": "home",
  "src/components/cv/Experience.tsx": "home",
  "src/components/cv/Hero.tsx": "home",
  "src/components/cv/Projects.tsx": "home",
  "src/components/cv/Summary.tsx": "home",
  "src/components/font/FontSwitcher.tsx": "site",
  "src/components/gallery/GalleryGrid.tsx": "gallery",
  "src/components/notes/NotesExplorer.tsx": "notes",
  "src/components/navigation/IntentPrefetchLink.tsx": "site",
  "src/components/offline/OfflineStatusBanner.tsx": "site",
  "src/components/reading/ReadingBackgroundSwitcher.tsx": "site",
  "src/components/theme/ThemeSync.tsx": "site",
  "src/components/thoughts/Backlinks.tsx": "thoughts",
  "src/components/thoughts/ThoughtContent.tsx": "thoughts",
  "src/components/thoughts/ThoughtGraph.tsx": "thoughts",
  "src/components/thoughts/ThoughtList.tsx": "thoughts",
  "src/components/thoughts/ThoughtsViewClient.tsx": "thoughts"
};

export {
  CLIENT_PROVIDER_CONSUMER_ROUTES,
  NAVIGATION_MODULE,
  PROVIDER_DEPENDENT_NEXT_INTL_HOOKS,
  RAW_PROVIDER_FILE,
  SCOPED_PROVIDER_MODULE,
  SCOPED_PROVIDER_PLACEMENTS
};
