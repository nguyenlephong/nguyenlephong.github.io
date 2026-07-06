# Visual prompt package: why-taking-notes

Scope: `notes` article only, slug `why-taking-notes`.

Source read:
- `public/notes-data/posts/why-taking-notes.json`
- `public/notes-data/vi/posts/why-taking-notes.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with practical human context.
- Real desks, notebooks, loose paper, laptops, pens, plants, and ordinary routines.
- Calm, reflective, lived-in tone; tactile note work without motivational-poster energy.
- No model-rendered readable text, titles, logos, UI labels, signatures, brand marks, watermarks, or caption text inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core claim: notes are not valuable as a collection; they are valuable when they help a forgetful mind preserve context.
- Core warning: notes you never return to become a tidier kind of clutter.
- Core usefulness: a good note programs your future self and carries forward what your past self once understood.
- Core craft point: clear, expressive notes lose less information during that handoff than rushed cryptic ones.

## Final Assets

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/why-taking-notes.png` | 1200x630 | n/a |
| Lead/clutter photo | `public/assets/notes/why-taking-notes/forgotten-note-clutter.png` | 1600x900 | `blog-photo-panorama` |
| Future-self handoff photo | `public/assets/notes/why-taking-notes/future-self-handoff.png` | 1440x960 | `blog-photo-figure` |

The article is short, with one opening warning and one compact two-item explanation. Two in-article figures are enough; a third would make the note feel heavier than the text.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no notebook writing, no sticky-note words, no UI labels, no logos, no brand marks, no watermark, no signature, no wall signs, no company names, no exact author likeness, no celebrity likeness, no literal exposed brain, no sci-fi hologram, no fantasy glow, no motivational-poster style, no distorted hands, no extra fingers, no uncanny faces, no luxury/status signaling.

## OG And Lead Prompt

Primary prompt used:

Photorealistic editorial lifestyle photograph about notes as a defense against forgetting, not note hoarding. A Vietnamese or Southeast Asian adult professional sits at a modest Vietnamese apartment or compact home-office desk in soft morning light, calmly sorting a loose pile of blank clippings and blank index cards into a clearer notebook-and-laptop note system. The desk has warm wood, an open notebook, pen, paper, small plant, mug, and a laptop with only an abstract blurred note archive interface made of soft shapes and node-like dots. The posture should feel thoughtful and practical, not staged or motivational. Documentary editorial lifestyle photography, realistic human texture, natural hands, high-end magazine realism, vivid but restrained. Wide 16:9-friendly horizontal composition that can also crop to 1.91:1 for OG; keep the person, loose note pile, notebook, laptop, and pen in the central safe area; leave the lower-right corner visually calm and uncluttered for a local watermark added later. All pages, cards, laptop screens, wall details, and objects must be blank or abstract. No readable writing anywhere.

Generation:
- Lead export: `1600x900`.
- OG export: `1200x630`.
- Keep all note surfaces and screens blank or abstract.
- Leave the bottom-right corner visually calm for local watermark post-processing.

Localized copy:
- EN alt: `A Vietnamese professional sorts blank clippings beside an open notebook and a laptop with an abstract note map.`
- EN caption: `Notes stop being clutter when they return context to the person who will need it later.`
- VI alt: `Một người đi làm Việt Nam phân loại các mảnh giấy trống bên cạnh cuốn sổ mở và laptop hiển thị bản đồ ghi chú trừu tượng.`
- VI caption: `Ghi chú không còn là bừa bộn khi nó trả lại ngữ cảnh cho phiên bản sau này của bạn.`

Insertion:
- EN: after the opening paragraph about collecting notes as clutter.
- VI: after the opening paragraph about collecting notes as clutter.

## Section Prompt: Future-Self Handoff

Primary prompt used:

Photorealistic editorial lifestyle photograph about a clear note carrying context from a past self to a future self. A Vietnamese or Southeast Asian adult professional reviews a small, well-organized packet of blank note cards beside an older loose cryptic scrap pile at a quiet Vietnamese apartment workspace in late afternoon light. The person gently moves one clear blank card from the old pile toward the current notebook. The desk has a warm wooden surface, laptop with only blurred abstract card-like shapes, an old closed notebook, a current open notebook with blank pages, blank index cards, pencil, bookmark ribbon, tea cup, and a small plant. The image should suggest time handoff and reduced memory loss without using literal timelines or text. Documentary editorial lifestyle photography, realistic hands, natural human posture, high-end magazine realism, vivid but restrained, tactile and grounded. 3:2 horizontal composition for a 1440x960 crop; hands, old loose cards, current notebook, and laptop are central; keep the lower-right corner visually calm for a local watermark added later. All notebooks, cards, screens, wall details, and papers must be blank or abstract, with no readable marks.

Generation:
- Export `1440x960`.
- Keep cards, notebooks, and laptop screen blank or abstract.
- Leave the bottom-right corner visually calm for local watermark post-processing.

Localized copy:
- EN alt: `A Vietnamese professional moves a blank note card from an old paper pile toward a current notebook beside a laptop.`
- EN caption: `A clear note is a handoff across time; it carries enough context that your future self does not have to rebuild the thought from nothing.`
- VI alt: `Một người đi làm Việt Nam chuyển một thẻ ghi chú trống từ chồng giấy cũ sang cuốn sổ hiện tại bên cạnh laptop.`
- VI caption: `Một ghi chú rõ ràng là cú chuyển giao qua thời gian; nó giữ đủ ngữ cảnh để bạn của tương lai không phải dựng lại ý nghĩ từ con số không.`

Insertion:
- EN: after the two-item list explaining future-self programming and past-self handoff.
- VI: after the two-item list explaining future-self programming and past-self handoff.

## Implementation Notes

- Final assets were generated with the built-in image generation tool, then resized/cropped locally with Sharp.
- Original generated files remained outside the repo under `codex-home/generated_images/...`; only final resized/watermarked PNGs were copied into the repo.
- Add all watermarks locally after generation, not in prompts.
- Use PNG exports with final dimensions embedded in the figure snippets.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the article date, slug, tags, topic, SEO paths, analytics, engagement behavior, and unrelated files.

## Verification Checklist

- Generated files exist at the exact paths above.
- `sips` reports PNG images with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt/caption.
- Local routes load without broken images: `/en/notes/why-taking-notes`, `/vi/notes/why-taking-notes`.
- OG image resolves at `/og/notes/why-taking-notes.png`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
