# Visual prompt package: be-mindful-of-what-you-put-into-your-bucket

Scope: `notes` article only, slug `be-mindful-of-what-you-put-into-your-bucket`.

Source read:
- `public/notes-data/posts/be-mindful-of-what-you-put-into-your-bucket.json`
- `public/notes-data/vi/posts/be-mindful-of-what-you-put-into-your-bucket.json`
- Approved reference: commit `48ac924f16`, `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with lived-in desks, natural light, practical tools, plants, and ordinary human attention.
- No model-rendered readable text, titles, logos, UI labels, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core metaphor: a fixed-size bucket carried through the day, filled by ideas, conversations, news, and small worries.
- Core tension: clean water nourishes the tree; murky water and too many inputs crowd out what would help.
- Core takeaway: tend the daily intake so the tree can grow.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/be-mindful-of-what-you-put-into-your-bucket.png` | 1200x630 | n/a |
| Lead/intro photo | `public/assets/notes/be-mindful-of-what-you-put-into-your-bucket/daily-bucket-beside-growing-tree.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/be-mindful-of-what-you-put-into-your-bucket/clear-water-before-noisy-inputs.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no article title, no typography, no logos, no brand marks, no watermark, no poster, no signs, no fake dashboard labels, no UI labels, no distorted hands, no extra fingers, no uncanny faces, no celebrity likeness, no fantasy, no mystical glow, no moralizing symbolism, no dramatic waste imagery, no doom-scrolling close-up, no luxury/status signaling, no stock-photo smile, no exaggerated environmental activism.

## OG And Lead Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese professional at a warm wooden desk near a city apartment window in soft morning light, a small metal bucket sits on the desk beside a healthy young potted tree, clear water visible in the bucket, a closed notebook, face-down phone, blank note cards, coffee cup, laptop with abstract blurred reflection and no readable text, quiet posture of choosing what to let into the day, calm realistic home-office atmosphere, green plants, warm wood, natural skin tones, documentary editorial style, 35mm lens, f/2.8, gentle depth of field, vivid but restrained, no text in image.

Generation:
- Lead crop: 16:9, export `1600x900`.
- OG crop: 1.91:1, export `1200x630`, keep the bucket, small tree, and person inside the central safe area.
- Leave bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese professional sits at a warm desk beside a small bucket of clear water and a young tree in soft morning light.`
- EN caption: `The bucket is limited, so the first quiet choice is what kind of water we let ourselves carry through the day.`
- VI alt: `Một người làm việc Việt Nam ngồi bên bàn gỗ ấm, cạnh chiếc xô nhỏ đựng nước trong và một cây non trong ánh sáng buổi sáng.`
- VI caption: `Chiếc xô có giới hạn, nên lựa chọn lặng lẽ đầu tiên là mình sẽ mang loại nước nào theo suốt ngày.`

Insertion recommendation:
- EN: after the first paragraph ending `the person you are slowly becoming.`, before the paragraph starting `The trouble is that not all water is clean`.
- VI: after the first paragraph ending `con người mà bạn đang chầm chậm trở thành.`, before the paragraph starting `Rắc rối ở chỗ không phải nước nào cũng sạch`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/be-mindful-of-what-you-put-into-your-bucket/daily-bucket-beside-growing-tree.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Clear Water Before Noisy Inputs

Primary prompt:

Photorealistic editorial lifestyle photograph of a quiet morning reading table beside a window, an open notebook and a single book or printed page with no readable text, a phone turned face down, a small clear glass of clean water near a healthy plant, and a second dimmer glass with cloudy sediment set farther away, a Vietnamese professional paused before choosing what to read, calm practical attention, not staged, natural window light, warm neutral room, soft greens, 50mm lens, f/3.2, realistic texture on wood and glass, no readable text in image.

Generation:
- Export `1440x960`.
- Keep the clean-water side visually brighter than the murky-water side.
- Leave bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A quiet morning table shows a face-down phone, an open notebook, a healthy plant, and clear water set apart from a murkier glass.`
- EN caption: `Not every input feels harmful in the moment, but each one leaves something behind at the bottom of the bucket.`
- VI alt: `Một bàn buổi sáng yên tĩnh có điện thoại úp xuống, sổ tay mở, cây xanh và ly nước trong đặt tách khỏi một ly nước đục hơn.`
- VI caption: `Không phải đầu vào nào cũng có vẻ hại ngay lúc đó, nhưng thứ nào cũng để lại một chút gì dưới đáy xô.`

Insertion recommendation:
- EN: after the second paragraph ending `crowded out by the cheap.`, before the paragraph starting `So the daily question`.
- VI: after the second paragraph ending `chen hết chỗ từ trước.`, before the paragraph starting `Vậy nên câu hỏi mỗi ngày`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/be-mindful-of-what-you-put-into-your-bucket/clear-water-before-noisy-inputs.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes

- The PNG assets in this handoff were rendered locally from existing local editorial base imagery plus article-specific compositing, then watermarked locally. No external image-generation service was called in this run.
- If explicit external image-generation approval is later recorded, use the prompts above to rerender fully native photoreal scenes and keep the same filenames/dimensions.
- Do not insert figures into JSON in the visual handoff phase; Engineer owns JSON insertion, route verification, commit, and push.
- Do not change date, slug, tags, category/topic, SEO paths, analytics, or engagement behavior.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON should receive matching figure blocks with localized alt/caption during Engineer insertion.
- Local routes to verify after insertion: `/en/notes/be-mindful-of-what-you-put-into-your-bucket`, `/vi/notes/be-mindful-of-what-you-put-into-your-bucket`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
