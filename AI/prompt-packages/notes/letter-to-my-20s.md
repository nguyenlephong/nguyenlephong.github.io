# Visual prompt package: letter-to-my-20s

Scope: `notes` article only, slug `letter-to-my-20s`.

Source read:
- `public/notes-data/posts/letter-to-my-20s.json`
- `public/notes-data/vi/posts/letter-to-my-20s.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, ordinary rooms, desks, tools, natural light, and human texture.
- No model-rendered readable text, article titles, UI labels, company names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core lived context: if the author could write back to his twenties, the note would be plain, learned slowly, and grounded in systems, imperfect attempts, ordinary days, ego, uncertainty, and character under pressure.
- Related reflection: Bronnie Ware's list of common end-of-life regrets reads like a reply from the other end of a life.
- Core visual direction: ordinary rooms and tactile objects should carry the reflection; avoid drama, status signaling, or a hospital-like scene.

## Final Assets

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/letter-to-my-20s.png` | 1200x630 | n/a |
| Lead photo | `public/assets/notes/letter-to-my-20s/quiet-letter-to-younger-self.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/letter-to-my-20s/ordinary-days-reflection.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no signs, no logos, no brand marks, no UI labels, no app screens, no model-rendered watermark, no signatures, no posters, no celebrity likeness, no exact author likeness, no distorted hands, no extra fingers, no uncanny faces, no fantasy glow, no motivational-poster style, no stock-photo smile.

## OG And Lead Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult writing a short note to their younger self at a modest home-office desk. The person sits in soft morning apartment light with one hand holding a pen above a blank notebook page. Nearby are an old personal snapshot turned partly away and intentionally too blurred to identify, blank habit cards, a closed journal, a mug, a phone face down, and a laptop screen showing only blurred abstract shapes. The scene should feel like advice learned slowly through ordinary days rather than a grand strategy. Warm Vietnamese apartment workspace, practical wood desk, lived-in but tidy, no luxury/status signaling. Documentary editorial photography, realistic skin texture, real paper grain, natural hands, natural fabric, 35mm lens, gentle depth of field. Wide 16:9-friendly composition that can also crop to 1.91:1 for OG; keep the person, notebook, hands, blank cards, and desk tools in the central safe area; leave the lower-right corner visually calm for a local watermark added later.

Generation:
- Lead crop: export `1600x900`.
- OG crop: export `1200x630`.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese adult writes in a blank notebook at a wooden desk while holding a blurred old photograph beside a laptop.`
- EN caption: `The advice I would send back is not a grand strategy, but a few plain notes written after ordinary days had done their work.`
- VI alt: `Một người Việt Nam viết trong cuốn sổ trống trên bàn gỗ, tay cầm một tấm ảnh cũ được làm mờ bên cạnh laptop.`
- VI caption: `Điều mình muốn gửi về tuổi hai mươi không phải một chiến lược lớn, mà là vài dòng mộc mạc sau khi những ngày bình thường đã âm thầm dạy mình.`

Insertion recommendation:
- EN: after the opening paragraph, before the list of lessons.
- VI: after the opening paragraph, before the list of lessons.

## Section Prompt: Ordinary Days Reflection

Primary prompt:

Respectful photorealistic editorial lifestyle photograph about later-life reflection and ordinary regrets, shown through a quiet family room scene rather than a hospital or dramatic setting. A middle-aged Vietnamese adult sits beside an older relative in a modest Vietnamese living room in soft late-afternoon light. Their hands rest near a blank photo album open on a low wooden table, with indistinct blurred photos, two tea cups, a phone face down, curtains, and a small plant nearby. The scene should suggest reviewing ordinary days and relationships calmly, without medical equipment, visible grief, or spectacle. Documentary editorial lifestyle photography, realistic skin texture, natural hands, real fabric and paper texture, 50mm lens, shallow but useful depth of field. 3:2 composition for a `1440x960` in-article crop; keep the people, hands, blank album, and tea cups in the central area; leave the lower-right corner visually calm for a local watermark added later.

Generation:
- Export `1440x960`.
- Any photos, albums, phones, background objects, or documents must be blank, blurred, or abstract only.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese adult and an older relative sit beside a photo album and tea cups in a quiet living room.`
- EN caption: `Regret often clarifies what ambition and pressure can hide while life is still moving quickly.`
- VI alt: `Một người Việt Nam ngồi cạnh người thân lớn tuổi bên album ảnh và hai tách trà trong phòng khách yên tĩnh.`
- VI caption: `Sự tiếc nuối thường làm rõ những điều tham vọng và áp lực dễ che khuất khi đời sống vẫn đang chạy nhanh.`

Insertion recommendation:
- EN: after the Bronnie Ware paragraph, before the five regrets list.
- VI: after the Bronnie Ware paragraph, before the five regrets list.

## Implementation Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated source files were left under `codex-home/generated_images/...`; only final resized/watermarked PNGs were copied into the repo.
- The article is short, so two in-article images are enough; a third image would crowd the page.
- Do not change date, slug, topic, tags, author, SEO paths, analytics, or engagement behavior.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/letter-to-my-20s`, `/vi/notes/letter-to-my-20s`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
