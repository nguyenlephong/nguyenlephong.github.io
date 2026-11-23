import {
  enhanceArticleTables,
  hasArticleDiagram,
  hasArticleWorkflowCanvas,
  localizeArticleHtmlLinks
} from "@/lib/content/article-html";
import BlogWorkflowEnhancer from "./BlogWorkflowEnhancer";

interface BlogContentProps {
  readonly html: string;
  readonly locale: string;
}

/**
 * Render trusted repository-authored HTML as a Server Component. Locale-aware
 * links are present in the exported document before hydration. The optional
 * enhancer mounts, then requests the canvas or diagram-viewer module, only for
 * authored markup that explicitly needs it.
 */
export default function BlogContent({ html, locale }: BlogContentProps) {
  const localizedHtml = enhanceArticleTables(
    localizeArticleHtmlLinks(html, locale),
    locale
  );
  const workflow = hasArticleWorkflowCanvas(localizedHtml);
  const diagram = hasArticleDiagram(localizedHtml);

  return (
    <>
      <div
        className="blog-content"
        data-article-content
        dangerouslySetInnerHTML={{ __html: localizedHtml }}
      />
      {(workflow || diagram) && (
        <BlogWorkflowEnhancer locale={locale} workflow={workflow} diagram={diagram} />
      )}
    </>
  );
}
