# Visual prompt package: how-i-write-notes

Scope: `notes` article only, slug `how-i-write-notes`.

Source read:
- `content/notes-data/posts/how-i-write-notes.json`
- `content/notes-data/vi/posts/how-i-write-notes.json`
- Approved reference: commit `48ac924f16`, `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with lived-in desks, natural light, practical tools, plants, and ordinary human attention.
- No model-rendered readable text, titles, logos, UI labels, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle treatment matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core context: a few years of keeping a personal knowledge vault in Obsidian, reduced to habits that survived real use.
- Core habits: write directly into the vault, write during deliberate windows, recognize links from real-life triggers, and keep enough mental map of the vault to connect new thoughts to old ideas.
- Core image metaphor: not a dumping ground, but a calm working archive where ideas can consolidate and link.

## Final Assets

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/how-i-write-notes.png` | 1200x630 | n/a |
| Lead photo | `public/assets/notes/how-i-write-notes/knowledge-vault-desk.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/how-i-write-notes/connecting-notes-in-vault.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no article title, no typography, no UI labels, no Obsidian logo, no brand marks, no watermark, no signatures, no posters, no fake dashboards, no sticky-note words, no distorted hands, no extra fingers, no uncanny faces, no celebrity likeness, no crime-board mood, no fantasy glow, no luxury/status signaling, no stock-photo grin.

## OG And Lead Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese professional writing directly into a personal knowledge vault at a warm wooden desk, with a laptop showing only an abstract blurred dark note graph interface with no readable text, a notebook open with blank pages, a few blank index cards arranged neatly, a small plant, a mug, and soft morning apartment light. The scene should feel like a calm personal archive where ideas consolidate rather than a messy dump. Use natural skin tones, warm wood, soft greens, lived-in but tidy details, documentary editorial style, 35mm lens, f/2.8, gentle depth of field, vivid but restrained. Composition must keep the person, laptop, notebook, and cards inside the central safe area for both 16:9 and 1.91:1 crops, with a visually calm bottom-right corner for later local watermarking.

Generation:
- Lead crop: 16:9, export `1600x900`.
- OG crop: 1.91:1, export `1200x630`.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese professional writes beside a laptop showing an abstract note graph, with blank cards and plants on a warm desk.`
- EN caption: `Writing directly into the vault keeps the space practical: a place where notes can grow, link, and survive real use.`
- VI alt: `Một người làm việc Việt Nam viết bên laptop hiển thị graph ghi chú trừu tượng, cạnh thẻ trắng và cây xanh trên bàn gỗ ấm.`
- VI caption: `Viết thẳng vào vault giữ cho không gian này thực tế: nơi ghi chú có thể lớn lên, liên kết và sống sót qua cách dùng hằng ngày.`

Insertion recommendation:
- EN: after the opening paragraph and before `When to write`.
- VI: after the opening paragraph and before `Viết khi nào`.

## Section Prompt: Recognizing Connections

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese professional pausing at a desk while connecting ideas between a notebook, blank index cards, and a laptop with only an abstract blurred node-and-link graph interface. Several blank cards are arranged in clusters with thin thread or pencil lines suggesting relationships, but there must be no readable words anywhere. The moment should suggest recognizing a link between a fleeting thought and ideas already living in a personal vault. Warm late-afternoon light, modest apartment workspace, plants, practical tools, natural texture, calm focused posture, documentary editorial style, 50mm lens, f/3.2, realistic hands, shallow but useful depth of field. Composition should work at 3:2, leave the bottom-right corner visually calm for a local watermark, and avoid making the scene look like a detective board.

Generation:
- Export `1440x960`.
- Keep cards blank and abstract; the laptop graph may show nodes and lines only.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A person pauses over blank note cards connected on a desk while an abstract graph sits open on a laptop.`
- EN caption: `Recognizing connections is a habit built between writing sessions, then used when a new thought touches an old one.`
- VI alt: `Một người dừng lại trước các thẻ trắng được nối trên bàn, trong khi laptop mở graph trừu tượng.`
- VI caption: `Nhận ra kết nối là thói quen được xây giữa các phiên viết, rồi xuất hiện khi một ý nghĩ mới chạm vào ý cũ.`

Insertion recommendation:
- EN: after the `When to write` list and before `How to write`.
- VI: after the `Viết khi nào` list and before `Viết thế nào`.

## Implementation Notes

- Final repo PNGs were exported from generated source PNGs and watermarked locally with `sharp`.
- Original generated source files were left under `codex-home/generated_images/...`; only resized/watermarked final PNGs were copied into the repo.
- Do not change date, slug, tags, topic, SEO paths, analytics, or engagement behavior.
- The article is short, so two in-article images are enough; a third would crowd the page.

## Verification Checklist

- Final files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt/caption.
- Local routes to verify after integration: `/en/notes/how-i-write-notes`, `/vi/notes/how-i-write-notes`.
- Full Engineer verification: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
