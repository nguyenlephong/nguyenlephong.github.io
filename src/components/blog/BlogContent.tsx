import {
  hasArticleWorkflowCanvas,
  localizeArticleHtmlLinks
} from "@/lib/content/article-html";
import BlogWorkflowEnhancer from "./BlogWorkflowEnhancer";

interface BlogContentProps {
  html: string;
  locale: string;
}

/**
 * Render trusted repository-authored HTML as a Server Component. Locale-aware
 * links are present in the exported document before hydration. The optional
 * canvas enhancer mounts, then requests its drawing module, only for authored
 * markup that explicitly needs it.
 */
export default function BlogContent({ html, locale }: BlogContentProps) {
  const localizedHtml = localizeArticleHtmlLinks(html, locale);
  const needsWorkflowEnhancer = hasArticleWorkflowCanvas(localizedHtml);

  return (
    <>
      <div
        className="blog-content"
        data-article-content
        dangerouslySetInnerHTML={{ __html: localizedHtml }}
      />
      {needsWorkflowEnhancer && <BlogWorkflowEnhancer locale={locale} />}
    </>
  );
}
