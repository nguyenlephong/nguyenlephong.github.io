# Visual prompt package: the-trap-of-information-consumption

Scope: `notes` article only, slug `the-trap-of-information-consumption`.

Source read:
- `public/notes-data/posts/the-trap-of-information-consumption.json`
- `public/notes-data/vi/posts/the-trap-of-information-consumption.json`
- `AI/skills/calm-content-writer/SKILL.md`
- Approved reference pattern: commit `48ac924f16`, article `cross-functional-teams`

Generation status:
- Built-in image generation was run for the visual/assets stage.
- Raw generated originals remain outside the repo at `/Users/lap16773/Pictures/multica-generated/notes/the-trap-of-information-consumption/originals/`.
- Target-sized, locally watermarked candidates are outside the repo at `/Users/lap16773/Pictures/multica-generated/notes/the-trap-of-information-consumption/candidates/`.
- No article JSON, public asset target paths, routes, analytics, commits, pushes, or implementation files were changed in this visual handoff.

Reference style:
- Photorealistic editorial/lifestyle scenes with lived-in desks, notebooks, laptops/tablets, quiet rooms, practical tools, warm light, and ordinary human attention.
- Calm, sincere, reflective, and grounded; the visual tension should feel recognizable rather than theatrical.
- No model-rendered readable text, article titles, UI labels, logos, signatures, brand marks, or watermarks.
- Site copyright mark was added only through local post-processing: `nguyenlephong.github.io`, subtle bottom-right dark translucent rounded label with low-contrast white text.
- Keep generated people generic. Do not render an exact likeness of the author or any public person.

Article read:
- Core risk: input keeps flowing and the shelf keeps filling, but nothing turns into capability.
- Symptoms: reading and collecting information can feel productive while avoiding real practice.
- Cause: novelty rewards intake; action carries vulnerability and the risk of an imperfect attempt.
- Way out: set implementation intentions, prefer just-in-time learning, reduce friction for practice, and track actions taken instead of inputs consumed.

## Asset Plan

Recommended final assets:

| Role | Candidate path | Target repo path | Size | Class |
| --- | --- | --- | ---: | --- |
| OG image | `/Users/lap16773/Pictures/multica-generated/notes/the-trap-of-information-consumption/candidates/og-the-trap-of-information-consumption.png` | `public/og/notes/the-trap-of-information-consumption.png` | 1200x630 | n/a |
| Lead/overview photo | `/Users/lap16773/Pictures/multica-generated/notes/the-trap-of-information-consumption/candidates/consumption-loop-desk.png` | `public/assets/notes/the-trap-of-information-consumption/consumption-loop-desk.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `/Users/lap16773/Pictures/multica-generated/notes/the-trap-of-information-consumption/candidates/productive-procrastination-desk.png` | `public/assets/notes/the-trap-of-information-consumption/productive-procrastination-desk.png` | 1440x960 | `blog-photo-figure` |
| Closing/action photo | `/Users/lap16773/Pictures/multica-generated/notes/the-trap-of-information-consumption/candidates/small-practice-start.png` | `public/assets/notes/the-trap-of-information-consumption/small-practice-start.png` | 1440x960 | `blog-photo-figure` |

Short-article recommendation:
- Use the lead/overview photo after the opening paragraph, before `Symptoms`.
- Use `productive-procrastination-desk.png` after the `Symptoms` list or before `Why it happens`.
- Use `small-practice-start.png` after the `Breaking the pattern` list, before the related-links `<hr>`.
- If the note feels visually crowded during implementation, keep only `consumption-loop-desk.png` and `small-practice-start.png` inline; retain `productive-procrastination-desk.png` as a section alternate.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no printed pages, no highlighted lines, no article title, no typography, no logos, no brand marks, no model-rendered watermark, no poster, no signs, no fake dashboard labels, no UI labels, no app interface, no social media feed, no company names, no exact author likeness, no celebrity likeness, no distorted hands, no extra fingers, no uncanny faces, no motivational-poster style, no fantasy glow, no luxury/status signaling, no corporate stock-photo staging.

## OG And Lead Prompt: Consumption Loop Desk

Primary prompt:

Photorealistic editorial lifestyle photograph for a reflective article about information consumption replacing action. A Vietnamese or Southeast Asian adult sits at a modest home-office desk in late afternoon light, surrounded by a tall uneven stack of CLOSED books with plain unbranded covers, a tablet showing only abstract soft color blocks with no symbols, a face-down phone, several completely BLANK loose sheets, and an untouched small practice setup: a closed blank notebook, a pencil, and a blank task card placed just out of reach. No open book pages, no printed paper, no highlighting, no handwriting. The person looks thoughtful and slightly caught in the loop of gathering more input before doing anything, not anxious or defeated. Lived-in apartment study, warm wood grain, real blank paper texture, soft curtains, small plant, cup of tea. The image should communicate the contrast between endless intake and unused capability through real objects and posture. Documentary editorial photography, natural skin texture and hands, realistic fabric, 35mm lens, f/3.2, gentle film grain, vivid but restrained colors, warm window light with soft blue-gray shadows. Wide horizontal 16:9-friendly composition that can crop to 1200x630 for Open Graph; keep person, closed book stack, tablet, blank sheets, closed notebook, pencil, and blank task card central; leave the lower-right corner visually calm for a local watermark added later. Absolutely no readable text, no pseudo-text, no letters, no numbers, no printed pages, no highlighted lines, no article title, no typography, no logos, no brand marks, no watermarks, no UI labels, no app interface, no social media feed, no exact author likeness, no celebrity likeness, no distorted hands, no extra fingers, no uncanny face, no motivational poster, no fantasy glow, no luxury/status signaling, no corporate stock-photo staging.

Generation:
- Raw original: `/Users/lap16773/Pictures/multica-generated/notes/the-trap-of-information-consumption/originals/consumption-loop-desk-source.png` (`1672x941`)
- OG export: `1200x630`
- Lead export: `1600x900`
- Bottom-right watermark already applied locally to the candidate copies.

Localized copy:
- EN alt: `A Vietnamese adult pauses at a warm desk with a stack of closed books, a tablet, blank papers, a closed notebook, and an unused pencil.`
- EN caption: `The trap is quiet: the inputs keep arriving while the first useful attempt stays just out of reach.`
- VI alt: `Một người Việt ngồi lặng bên bàn ấm với chồng sách đã đóng, tablet, giấy trống, sổ đóng và cây bút chưa dùng.`
- VI caption: `Cái bẫy diễn ra rất lặng: đầu vào cứ đến, còn lần thử hữu ích đầu tiên vẫn nằm ngoài tầm tay.`

Insertion recommendation:
- EN: after the opening paragraph ending `hard to notice from the inside.`, before `<h2 id="symptoms">`.
- VI: after the opening paragraph ending `khó nhận ra đến vậy từ bên trong.`, before `<h2 id="trieu-chung">`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/the-trap-of-information-consumption/consumption-loop-desk.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Productive Procrastination Desk

Primary prompt:

Photorealistic editorial lifestyle photograph for a reflective article about mistaking information intake for real progress. A Vietnamese or Southeast Asian adult sits at a small apartment desk in the evening with a closed laptop, a tablet showing only abstract blurred color blocks, a large stack of closed unbranded books, and many completely blank sticky notes scattered in a loose pile. In the foreground, a simple practice tool remains untouched: a blank workbook closed beside a pencil and a small practice object, such as an unbranded whiteboard eraser or folded blank paper prototype. The posture should feel like productive procrastination: surrounded by input, pausing before action, human and recognizable but not defeated. Warm desk lamp, soft window shadow, lived-in modest room, real paper texture, wood grain, cup of tea, small plant. Documentary editorial lifestyle photography, natural skin texture and hands, realistic fabric, 50mm lens, f/3.2, subtle film grain, vivid restrained colors. 3:2 composition for a 1440x960 crop; keep the closed books, blank notes, tablet, untouched practice setup, and person central; leave lower-right corner visually calm for a local watermark added later. Absolutely no readable text, no pseudo-text, no letters, no numbers, no printed pages, no highlighted lines, no article title, no typography, no logos, no brand marks, no watermarks, no UI labels, no app interface, no social media feed, no exact author likeness, no celebrity likeness, no distorted hands, no extra fingers, no uncanny face, no motivational poster, no fantasy glow, no luxury/status signaling, no corporate stock-photo staging.

Generation:
- Raw original: `/Users/lap16773/Pictures/multica-generated/notes/the-trap-of-information-consumption/originals/productive-procrastination-desk-source.png` (`1537x1023`)
- Candidate export: `1440x960`
- Bottom-right watermark already applied locally to the candidate copy.

Localized copy:
- EN alt: `A Vietnamese adult sits beside closed books, a tablet, blank sticky notes, and an untouched practice notebook at an evening desk.`
- EN caption: `Collecting more input can look productive from the outside while quietly protecting us from the risk of practice.`
- VI alt: `Một người Việt ngồi bên sách đã đóng, tablet, giấy ghi chú trống và cuốn sổ luyện tập chưa dùng trên bàn buổi tối.`
- VI caption: `Sưu tầm thêm đầu vào có thể trông rất năng suất, trong khi âm thầm che ta khỏi rủi ro của việc luyện tập.`

Insertion recommendation:
- EN: after the `Symptoms` list, before `<h2 id="why">`.
- VI: after the `Triệu chứng` list, before `<h2 id="vi-sao">`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/the-trap-of-information-consumption/productive-procrastination-desk.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Closing Prompt: Small Practice Start

Primary prompt:

Photorealistic editorial lifestyle photograph for a reflective article about breaking the pattern of consuming information by starting one small action. A Vietnamese or Southeast Asian adult at a quiet morning desk has pushed a stack of closed unbranded books to the side and is beginning a small practice session. The person's pencil is hovering just above a completely blank open notebook page, or resting beside the blank page before the first mark; no writing, no drawing, no lines, no marks on the paper. Nearby are a simple timer-like object with no numbers or labels, a blank task card, a closed tablet, and a cup. The scene should feel calm, grounded, and action-oriented: fewer inputs, lower friction, one small attempt about to begin. Natural morning window light, modest apartment workspace, warm wood grain, realistic blank paper texture, small plant, ordinary clothing. Documentary editorial lifestyle photography, natural hands and skin texture, 50mm lens, f/2.8, gentle grain, vivid but restrained colors. 3:2 composition for a 1440x960 crop; keep the hands, blank notebook, pencil, blank task card, pushed-aside closed books, and calm workspace central; lower-right corner visually calm for a local watermark added later. Absolutely no readable text, no pseudo-text, no letters, no numbers, no marks on paper, no handwriting, no drawings, no printed pages, no highlighted lines, no article title, no typography, no logos, no brand marks, no watermarks, no UI labels, no app interface, no social media feed, no exact author likeness, no celebrity likeness, no distorted hands, no extra fingers, no uncanny face, no motivational poster, no fantasy glow, no luxury/status signaling, no corporate stock-photo staging.

Generation:
- Raw original: `/Users/lap16773/Pictures/multica-generated/notes/the-trap-of-information-consumption/originals/small-practice-start-source.png` (`1536x1024`)
- Candidate export: `1440x960`
- Bottom-right watermark already applied locally to the candidate copy.

Localized copy:
- EN alt: `A Vietnamese adult begins at a quiet morning desk with a blank notebook, pencil, closed books pushed aside, and a simple unlabeled timer.`
- EN caption: `The way out begins when practice becomes easier to start than opening one more source.`
- VI alt: `Một người Việt bắt đầu bên bàn sáng yên tĩnh với sổ trống, bút chì, sách đã đẩy sang bên và chiếc hẹn giờ không nhãn.`
- VI caption: `Lối ra bắt đầu khi việc luyện tập dễ khởi động hơn mở thêm một nguồn thông tin nữa.`

Insertion recommendation:
- EN: after the `Breaking the pattern` list, before `<hr>`.
- VI: after the `Phá bẫy` list, before `<hr>`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/the-trap-of-information-consumption/small-practice-start.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes For Engineer

- Create `public/assets/notes/the-trap-of-information-consumption/` during integration.
- Copy candidate PNGs from the local handoff folder into the target repo paths above, or rerender from the prompts if Designer wants a different crop.
- The candidate PNGs are already watermarked locally. Do not ask the image model to render the watermark.
- Watermark treatment: bottom-right placement, dark translucent rounded rectangle, low-contrast white `nguyenlephong.github.io`, matching the approved `cross-functional-teams` sample.
- Preserve article date, slug, category/topic, tags, locale routes, SEO behavior, analytics, and engagement behavior.
- Insert localized figure blocks into both EN and VI JSON only after choosing the final inline image count.
- Recommended implementation default: copy the OG candidate, insert all three section candidates only if the page rhythm still feels calm; otherwise use `consumption-loop-desk.png` and `small-practice-start.png` as the two inline figures.

## Generation Blockers

- No generation blocker remains.
- One initial lead candidate was rejected because a page contained readable-looking model text.
- One practice-scene retry returned a transient image-generation server error; a subsequent synchronous retry succeeded with a blank notebook page.
- Minor review risk: this is a short note with lists, so three inline images may feel dense. Two inline images plus the OG crop is the calmer default if the Engineer wants a lighter article rhythm.

## Verification Checklist

- Candidate files exist outside repo:
  - `candidates/og-the-trap-of-information-consumption.png` (`1200x630`)
  - `candidates/consumption-loop-desk.png` (`1600x900`)
  - `candidates/productive-procrastination-desk.png` (`1440x960`)
  - `candidates/small-practice-start.png` (`1440x960`)
- `file` reports PNG with expected dimensions for all candidates.
- Visual check confirms no readable text, logos, model watermark, article title, UI labels, or obvious brand marks.
- EN and VI JSON should receive matching figure blocks with localized alt text and captions during Engineer insertion.
- Local routes to verify after insertion: `/en/notes/the-trap-of-information-consumption`, `/vi/notes/the-trap-of-information-consumption`.
- OG image should resolve at `/og/notes/the-trap-of-information-consumption.png`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
- Privacy: no private files, source screenshots, credentials, exact personal likenesses, or article data files were uploaded; only text prompts derived from the assigned article brief/content were sent to built-in image generation.
