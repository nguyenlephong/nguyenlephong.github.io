// MEP-91: blog locales hidden until MEP-92 re-translates them. Build verifiers read this copy;
// tests/authored-content-static-export.test.mjs keeps it equal to src/lib/blog/locale-visibility.ts.
export const HIDDEN_BLOG_LOCALES = Object.freeze(new Set(['ja', 'zh', 'ko', 'fr']))
