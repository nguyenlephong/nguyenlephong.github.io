# Visual prompt package: vocabulary-as-api-for-second-brain

Scope: `notes` article only, slug `vocabulary-as-api-for-second-brain`.

Source read:
- `public/notes-data/posts/vocabulary-as-api-for-second-brain.json`
- `public/notes-data/vi/posts/vocabulary-as-api-for-second-brain.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle imagery with practical human context.
- Real desks, blank cards, simple tools, warm light, and ordinary knowledge-work environments.
- Calm, reflective, lived-in tone; vocabulary and note-taking as concrete practice, not abstract spectacle.
- No model-rendered readable text, titles, logos, UI labels, signatures, brand marks, watermarks, or caption text inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

## Asset Plan

Final implemented assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/vocabulary-as-api-for-second-brain.png` | 1200x630 | n/a |
| Lead/vocabulary wiring photo | `public/assets/notes/vocabulary-as-api-for-second-brain/vocabulary-wiring-desk.png` | 1600x900 | `blog-photo-panorama` |
| Closing precise terms photo | `public/assets/notes/vocabulary-as-api-for-second-brain/precise-terms-thinking-dimensions.png` | 1440x960 | `blog-photo-figure` |

The note is short and conceptual, so two in-article figures are enough. The OG image uses a crop from the lead/vocabulary-wiring source.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no UI labels, no code snippets, no Obsidian logo, no app branding, no notebook writing, no sticky-note writing, no company names, no logos, no model-rendered watermark, no signatures, no wall posters, no exact author likeness, no celebrity likeness, no robot, no exposed brain, no sci-fi hologram, no mystical glow, no fantasy graph, no stock-photo corporate posing, no distorted hands, no extra fingers, no uncanny faces, no luxury/status signaling.

## OG / Lead Prompt: Vocabulary Wiring Desk

Primary prompt used:

Create a photorealistic editorial lifestyle photograph for a reflective note about vocabulary acting like an API for a personal knowledge vault. A Vietnamese or Southeast Asian adult works at a modest wooden desk in a quiet home office, one hand hovering between a laptop with a softly blurred, unreadable node graph and a spread of blank index cards connected by thin neutral thread. Some blank cards are grouped close together with small colored tabs, while a few similar blank cards sit apart, suggesting ideas that fail to meet when named inconsistently. Include a closed notebook, pencil, face-down phone, mug of tea, small plant, and practical desk clutter. The person should look calm and focused, not posed. Warm window light mixed with a desk lamp, realistic hands, paper grain, fabric texture, natural skin texture. Documentary editorial photography, 35mm lens, f/2.8, vivid but restrained color. Wide 16:9 composition that can crop safely to 1.91:1 for OG; keep the person, blank cards, thread links, and blurred laptop graph in the central safe area; lower-right corner should remain visually quiet for a local watermark. No readable text anywhere.

Generation:
- Export final in-article crop at `1600x900`.
- Export OG crop at `1200x630`.
- Cards must be blank or visually abstract.
- The graph on the laptop should be blurred/abstract enough to avoid fake UI text.
- Leave lower-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese adult organizes blank linked cards beside a blurred note graph on a laptop at a warm desk.`
- EN caption: `A second brain becomes easier to traverse when the same idea keeps the same name.`
- VI alt: `Một người Việt sắp các thẻ trống được nối với nhau bên cạnh đồ thị ghi chú được làm mờ trên laptop.`
- VI caption: `Second brain dễ đi xuyên hơn khi cùng một ý tưởng giữ được cùng một cái tên.`

Insertion:
- EN: after the first paragraph ending `rename the endpoint and all the clients break.`
- VI: after the first paragraph ending `đổi tên endpoint là mọi client gãy.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/vocabulary-as-api-for-second-brain/vocabulary-wiring-desk.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Precise Terms, Thinking Dimensions

Primary prompt used:

Create a photorealistic editorial lifestyle photograph for a note about precise vocabulary creating more dimensions to think with. On a calm desk, a Vietnamese or Southeast Asian programmer arranges several small physical structures made from blank cards and simple wooden blocks: one neat vertical stack, one orderly line, one double-ended tray-like arrangement, and one loose mixed pile. The objects should be visibly different without labels, representing distinct mental structures without rendering words. A laptop nearby is open but fully blurred with abstract color blocks only; a notebook is closed; a pencil and a few blank reference cards sit nearby. The person is comparing the structures with a thoughtful, practical posture, as if choosing the shape a problem actually wants. Natural daylight, tactile paper and wood, grounded home-office or small studio setting, documentary editorial photography, 50mm lens, f/3.2, realistic hands and materials, restrained warm-neutral palette with small blue/green accent tabs, lower-right corner quiet for local watermark. 3:2 composition. No readable text anywhere.

Generation:
- Export at `1440x960`.
- The scene should imply stack/queue/deque/list differences through shape only; no labels or symbols.
- Keep it human and concrete, not a diagram pasted into a photo.
- Avoid a sterile corporate training-table look.

Localized copy:
- EN alt: `A programmer compares several unlabeled card and block structures on a desk beside a blurred laptop.`
- EN caption: `Precise words give the mind more shapes to choose from when a problem asks for the right structure.`
- VI alt: `Một lập trình viên so sánh nhiều cấu trúc thẻ và khối gỗ không nhãn trên bàn cạnh laptop được làm mờ.`
- VI caption: `Từ ngữ chính xác cho tâm trí thêm nhiều hình dạng để chọn khi bài toán cần đúng cấu trúc.`

Insertion:
- EN: after the second paragraph ending `the more of your own graph you can actually traverse.`, immediately before `<hr>`.
- VI: after the second paragraph ending `càng đi xuyên được nhiều phần trong chính đồ thị của mình.`, immediately before `<hr>`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/vocabulary-as-api-for-second-brain/precise-terms-thinking-dimensions.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes

- Final assets were generated with the built-in image generation tool, then resized/cropped locally with Sharp.
- Original generated files remained outside the repo under the Codex generated-images directory.
- Add all watermarks locally after generation, not in prompts.
- Use PNG exports with final dimensions embedded in the figure snippets.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the article date, slug, tags, topic, SEO paths, analytics, engagement behavior, and unrelated files.
- Do not add a third in-article figure unless the article body is expanded later; the current note reads best with one figure for vocabulary wiring and one figure for precise mental structures.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sips` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt/caption.
- Local routes load without broken images: `/en/notes/vocabulary-as-api-for-second-brain`, `/vi/notes/vocabulary-as-api-for-second-brain`.
- OG image resolves at `/og/notes/vocabulary-as-api-for-second-brain.png`.
- `npm test`, `npm run typecheck`, and `npm run build:fast` pass after implementation.
- Nothing leaves local execution except the explicitly requested image-generation prompts.
