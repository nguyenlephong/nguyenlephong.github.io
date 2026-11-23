// C4 views of Ăn Gì and Wishjar for the blog post `c4-model-an-gi-va-wishjar`.
// Facts come from the two repositories as of 2026-11-23 (angi: docs/architecture, src/lib, docker-compose.yml;
// wishjar: README, server/, scripts/). Geometry is hand-placed on a 4px grid; render.mjs draws it.

const L1 = 'L1 · System Context'
const L2 = 'L2 · Container'
const L3 = 'L3 · Component'

const angiContext = {
  id: 'c4-angi-context',
  group: 'angi',
  levelLabel: L1,
  width: 1080,
  height: 600,
  title: 'Ăn Gì · C4 L1: System Context',
  desc: {
    en: 'Three kinds of people use Ăn Gì; the app calls five outside services for drafting, nearby search, directions, maps and analytics.',
    vi: 'Có ba nhóm người dùng Ăn Gì. App gọi năm dịch vụ bên ngoài để soạn thẻ quán, tìm quán gần, chỉ đường, bản đồ và đo lường.',
  },
  caption: {
    en: 'Three kinds of users and five outside services. The paid ones are called only by the server, each with a daily cap.',
    vi: 'Ba nhóm người dùng, năm dịch vụ bên ngoài. Dịch vụ nào tốn tiền thì chỉ server gọi, và có trần mỗi ngày.',
  },
  nodes: [
    {
      id: 'visitor', kind: 'person', x: 24, y: 48, w: 216, h: 100,
      name: { en: 'Hungry visitor', vi: 'Người tìm quán ăn' },
      tag: '[Person]',
      desc: { en: ['Phone or desktop browser,', 'Vietnamese or English'], vi: ['Điện thoại hoặc máy tính,', 'tiếng Việt hoặc tiếng Anh'] },
      detail: {
        en: 'Picks a dish or presses Spin and gets one place with directions. No account needed; saved places live in the browser.',
        vi: 'Chọn món hoặc bấm Quay đại, nhận về một quán kèm đường đi. Không cần tài khoản, quán đã lưu nằm trong trình duyệt.',
      },
    },
    {
      id: 'contributor', kind: 'person', x: 24, y: 252, w: 216, h: 96,
      name: { en: 'Contributor', vi: 'Người góp quán' },
      tag: '[Person]',
      desc: { en: ['Tells the assistant about', 'a place they like'], vi: ['Kể cho trợ lý nghe về', 'một quán ruột'] },
      detail: {
        en: 'Describes a place in chat or pastes a Google Maps or TikTok link. The assistant drafts a card, the contributor checks it before sending.',
        vi: 'Kể quán qua chat hoặc dán link Google Maps, TikTok. Trợ lý soạn thẻ quán, người góp xem lại rồi mới gửi.',
      },
    },
    {
      id: 'admin', kind: 'person', x: 24, y: 452, w: 216, h: 100,
      name: { en: 'Admin (me)', vi: 'Admin (mình)' },
      tag: '[Person]',
      desc: { en: ['Reviews every submission', 'behind a login token'], vi: ['Duyệt từng quán góp,', 'đăng nhập bằng token'] },
      detail: {
        en: 'Approves or rejects each submitted place. The admin login compares a token on the server and allows 5 tries per 15 minutes; server access itself goes over Tailscale.',
        vi: 'Duyệt hoặc từ chối từng quán được góp. Đăng nhập admin so token ngay trên server, mỗi 15 phút chỉ cho thử 5 lần. Còn vào máy chủ thì đi qua Tailscale.',
      },
    },
    {
      id: 'angi', kind: 'system', focal: true, x: 392, y: 240, w: 272, h: 120, drill: 'c4-angi-containers',
      name: { en: 'Ăn Gì', vi: 'Ăn Gì' },
      tag: '[Software System]',
      desc: { en: ['Picks one place to eat,', 'every field traced to a source'], vi: ['Chọn giùm một quán ăn,', 'thông tin nào cũng có nguồn'] },
      detail: {
        en: 'A Next.js monolith with Postgres and Valkey on one VPS, reachable only through a Cloudflare tunnel.',
        vi: 'Một monolith Next.js, cùng Postgres và Valkey trên một VPS, ra internet chỉ qua Cloudflare Tunnel.',
      },
    },
    {
      id: 'claude', kind: 'external', x: 840, y: 20, w: 216, h: 96,
      name: { en: 'Claude Haiku', vi: 'Claude Haiku' },
      tag: '[External: Anthropic]',
      desc: { en: ['Drafts place cards', 'with tool use'], vi: ['Soạn thẻ quán', 'bằng tool use'] },
      detail: {
        en: 'Called from the server only, with a cached system prompt and a daily request cap. Its output is a draft that still goes through a schema check and a human.',
        vi: 'Chỉ server gọi Claude. System prompt được cache, số request mỗi ngày có trần. Thẻ quán Claude soạn chỉ là bản nháp: còn qua kiểm schema, rồi mình duyệt tay.',
      },
    },
    {
      id: 'nearby', kind: 'external', x: 840, y: 136, w: 216, h: 96,
      name: { en: 'HERE, Google Places', vi: 'HERE, Google Places' },
      tag: '[External: place search]',
      desc: { en: ['Nearby search, hard', 'daily caps per provider'], vi: ['Tìm quán gần, có trần', 'cứng mỗi ngày'] },
      detail: {
        en: 'HERE is capped at 900 calls a day and Google Places at 30. The server sends a rounded grid cell, never the exact position.',
        vi: 'HERE tối đa 900 lượt mỗi ngày, Google Places 30 lượt. Server chỉ gửi đi ô lưới đã làm tròn chứ không gửi toạ độ thật.',
      },
    },
    {
      id: 'maps', kind: 'external', x: 840, y: 252, w: 216, h: 96,
      name: { en: 'Google Maps', vi: 'Google Maps' },
      tag: '[External: directions]',
      desc: { en: ['Deep link and embed', 'for the last step'], vi: ['Deep link và embed', 'cho bước cuối'] },
      detail: {
        en: 'Ăn Gì never draws its own routes. The last step hands over to Google Maps, which people already trust for directions.',
        vi: 'Ăn Gì không tự tính đường đi. Bước cuối mở Google Maps, app chỉ đường ai cũng quen.',
      },
    },
    {
      id: 'tiles', kind: 'external', x: 840, y: 368, w: 216, h: 96,
      name: { en: 'Map tiles, weather', vi: 'Bản đồ, thời tiết' },
      tag: '[External: open data]',
      desc: { en: ['OpenFreeMap tiles,', 'Open-Meteo forecast'], vi: ['Tile OpenFreeMap,', 'dự báo Open-Meteo'] },
      detail: {
        en: 'Two free, open services. The browser loads map tiles itself, and the server asks Open-Meteo so a rainy day changes the suggestions.',
        vi: 'Hai dịch vụ mở, miễn phí. Trình duyệt tự tải tile bản đồ, còn server hỏi Open-Meteo để hôm mưa thì lời gợi ý đổi theo.',
      },
    },
    {
      id: 'posthog', kind: 'external', x: 840, y: 484, w: 216, h: 96,
      name: { en: 'PostHog', vi: 'PostHog' },
      tag: '[External: analytics]',
      desc: { en: ['Events without PII,', 'via a same-origin relay'], vi: ['Sự kiện không có PII,', 'đi qua relay cùng domain'] },
      detail: {
        en: 'Events go through /ingest on the app’s own domain and carry no personal data. Dashboards are defined as code, so they survive a reset.',
        vi: 'Sự kiện đi qua /ingest trên chính domain của app và không mang dữ liệu cá nhân. Dashboard viết bằng code nên dựng lại được bất cứ lúc nào.',
      },
    },
  ],
  edges: [
    { from: 'visitor', to: 'angi', points: [[240, 98], [300, 98], [300, 264], [392, 264]], label: { en: 'Pick a dish, spin', vi: 'Chọn món, quay đại' } },
    { from: 'contributor', to: 'angi', points: [[240, 300], [392, 300]], label: { en: 'Tell about a place', vi: 'Kể quán qua chat' } },
    { from: 'admin', to: 'angi', points: [[240, 502], [300, 502], [300, 336], [392, 336]], label: { en: 'Review each one', vi: 'Duyệt từng quán' } },
    { from: 'angi', to: 'claude', points: [[664, 256], [696, 256], [696, 68], [840, 68]], labelSegment: 3, label: { en: 'Draft a card', vi: 'Soạn thẻ quán' } },
    { from: 'angi', to: 'nearby', points: [[664, 278], [720, 278], [720, 184], [840, 184]], labelSegment: 3, label: { en: 'Find nearby', vi: 'Tìm quán gần' } },
    { from: 'angi', to: 'maps', points: [[664, 300], [840, 300]], labelShift: 24, label: { en: 'Open directions', vi: 'Mở chỉ đường' } },
    { from: 'angi', to: 'tiles', points: [[664, 322], [720, 322], [720, 416], [840, 416]], labelSegment: 3, label: { en: 'Tiles, weather', vi: 'Tile, thời tiết' } },
    { from: 'angi', to: 'posthog', points: [[664, 344], [696, 344], [696, 532], [840, 532]], labelSegment: 3, dashed: true, label: { en: 'Anonymous events', vi: 'Sự kiện ẩn danh' } },
  ],
}

const angiContainers = {
  id: 'c4-angi-containers',
  group: 'angi',
  levelLabel: L2,
  width: 1080,
  height: 652,
  title: 'Ăn Gì · C4 L2: Container',
  desc: {
    en: 'A PWA in the browser talks over a Cloudflare tunnel to one Next.js container, backed by Postgres and Valkey on a single VPS.',
    vi: 'PWA trên trình duyệt đi qua Cloudflare Tunnel tới một container Next.js, phía sau là Postgres và Valkey trên cùng một VPS.',
  },
  caption: {
    en: 'Postgres holds what must survive, Valkey holds what can be lost, and the web container sits between them on one VPS with no public port.',
    vi: 'Postgres giữ thứ không được mất, Valkey giữ thứ mất cũng được, container web nằm giữa, cả ba trên một VPS không mở cổng public.',
  },
  zones: [
    { x: 208, y: 216, w: 248, h: 200, label: { en: 'Your browser', vi: 'Trình duyệt của bạn' } },
    { x: 728, y: 216, w: 328, h: 412, label: { en: 'VPS · Docker Compose', vi: 'VPS · Docker Compose' } },
  ],
  nodes: [
    {
      id: 'person', kind: 'person', x: 24, y: 264, w: 152, h: 96,
      name: { en: 'Visitor', vi: 'Người dùng' },
      tag: '[Person]',
      desc: { en: ['Phone or desktop'], vi: ['Điện thoại, máy tính'] },
      detail: {
        en: 'Anyone deciding where to eat. They never need an account for the core flow.',
        vi: 'Bất kỳ ai đang tính ăn ở đâu. Luồng chính không cần tài khoản.',
      },
    },
    {
      id: 'pwa', kind: 'container', x: 228, y: 252, w: 208, h: 120,
      name: { en: 'Ăn Gì PWA', vi: 'Ăn Gì PWA' },
      tag: '[Container: React 19]',
      desc: { en: ['Spin, search without accents,', 'offline copy in IndexedDB'], vi: ['Quay đại, tìm không dấu,', 'bản offline trong IndexedDB'] },
      detail: {
        en: 'The server sends the first 20 cards (about 11 to 13 KB gzip) and the rest of the data after first paint. Spin and search run on the device, so typing never waits for the network.',
        vi: 'Server gửi trước 20 thẻ quán đầu tiên (khoảng 11 đến 13 KB gzip), phần dữ liệu còn lại tới sau khi trang đã hiện. Quay đại và tìm kiếm chạy ngay trên máy, gõ phím không phải chờ mạng.',
      },
    },
    {
      id: 'edge', kind: 'external', x: 504, y: 264, w: 176, h: 96,
      name: { en: 'Cloudflare Tunnel', vi: 'Cloudflare Tunnel' },
      tag: '[Edge + cloudflared]',
      desc: { en: ['No public port', 'on the VPS'], vi: ['VPS không mở', 'cổng public nào'] },
      detail: {
        en: 'cloudflared dials out from the VPS, so the machine has no open inbound port. Cloudflare also caches /covers and resized images at the edge.',
        vi: 'cloudflared chủ động kết nối ra ngoài, nên VPS không mở cổng nào cho bên ngoài gọi vào. Cloudflare còn cache /covers và ảnh đã resize ngay ở edge.',
      },
    },
    {
      id: 'web', kind: 'container', focal: true, x: 748, y: 252, w: 288, h: 120, drill: 'c4-angi-components',
      name: { en: 'angi-web', vi: 'angi-web' },
      tag: '[Container: Next.js 16, Node 22]',
      desc: { en: ['Pages, server actions, API,', 'admin console, the Shield'], vi: ['Trang, server action, API,', 'trang admin, lớp Shield'] },
      detail: {
        en: 'Standalone Next.js build, non-root, all Linux capabilities dropped. Data lives in Postgres and most counters in Valkey; the Next cache and chat limits still live inside the container, which is what a second replica would need moved first.',
        vi: 'Bản build standalone của Next.js, chạy non-root, bỏ hết Linux capability. Dữ liệu nằm ở Postgres, phần lớn bộ đếm nằm ở Valkey. Còn cache của Next và rate limit của chat vẫn ở trong container, muốn chạy bản thứ hai thì phải dời hai thứ này ra trước.',
      },
    },
    {
      id: 'db', kind: 'store', x: 748, y: 480, w: 136, h: 116,
      name: { en: 'Postgres 16', vi: 'Postgres 16' },
      tag: '[Container]',
      desc: { en: ['Places, submissions,', 'nightly pg_dump'], vi: ['Quán, bài góp,', 'pg_dump mỗi đêm'] },
      detail: {
        en: '16 tables through Drizzle, 15 additive migrations. A nightly pg_dump keeps 14 copies; there is no replica yet.',
        vi: '16 bảng qua Drizzle, 15 migration chỉ thêm không xoá. pg_dump mỗi đêm giữ 14 bản, hiện chưa có replica.',
      },
    },
    {
      id: 'valkey', kind: 'store', x: 900, y: 480, w: 136, h: 116,
      name: { en: 'Valkey 8.1', vi: 'Valkey 8.1' },
      tag: '[Container]',
      desc: { en: ['Counters, cache,', '64 MB LRU'], vi: ['Bộ đếm, cache,', '64 MB LRU'] },
      detail: {
        en: 'No persistence on purpose: losing it only resets rate limits and the 30-minute nearby cache. Everything that matters lives in Postgres.',
        vi: 'Cố ý không lưu xuống đĩa: mất nó thì chỉ reset rate limit và cache tìm quán gần 30 phút. Thứ gì quan trọng đều nằm ở Postgres.',
      },
    },
    {
      id: 'posthog', kind: 'external', x: 24, y: 40, w: 152, h: 96,
      name: { en: 'PostHog', vi: 'PostHog' },
      tag: '[External]',
      desc: { en: ['Web vitals, events'], vi: ['Web vitals, sự kiện'] },
      detail: {
        en: 'The browser sends events to /ingest on the app, and the server forwards them. Ad blockers have less to block and no third-party cookie is involved.',
        vi: 'Trình duyệt gửi sự kiện tới /ingest của app, server chuyển tiếp sang PostHog. Adblock ít chặn hơn, và không có cookie bên thứ ba.',
      },
    },
    {
      id: 'claude', kind: 'external', x: 228, y: 40, w: 208, h: 96,
      name: { en: 'Claude Haiku', vi: 'Claude Haiku' },
      tag: '[External]',
      desc: { en: ['Contribute chat'], vi: ['Chat góp quán'] },
      detail: {
        en: 'Only the contribute chat and note translation call the model. A daily cap keeps the bill bounded even if someone loops the chat.',
        vi: 'Chỉ chat góp quán và phần dịch ghi chú mới gọi model. Số request mỗi ngày có trần, ai đó spam chat thì hoá đơn cũng không vượt.',
      },
    },
    {
      id: 'nearby', kind: 'external', x: 504, y: 40, w: 176, h: 96,
      name: { en: 'HERE, Google', vi: 'HERE, Google' },
      tag: '[External]',
      desc: { en: ['Places around a cell'], vi: ['Quán quanh ô lưới'] },
      detail: {
        en: 'The server rounds the position to a 0.01° cell (about 1.1 km), asks the provider and caches the answer per cell for 30 minutes.',
        vi: 'Server làm tròn vị trí về ô lưới 0,01° (khoảng 1,1 km), hỏi nhà cung cấp rồi cache kết quả theo ô trong 30 phút.',
      },
    },
  ],
  edges: [
    { from: 'person', to: 'pwa', points: [[176, 312], [228, 312]], label: { en: 'Uses', vi: 'Dùng' } },
    { from: 'pwa', to: 'edge', points: [[436, 312], [504, 312]], label: { en: 'HTTPS', vi: 'HTTPS' } },
    { from: 'edge', to: 'web', points: [[680, 312], [748, 312]] },
    { from: 'web', to: 'db', points: [[816, 372], [816, 480]], label: { en: 'SQL', vi: 'SQL' } },
    { from: 'web', to: 'valkey', points: [[968, 372], [968, 480]], label: { en: 'RESP', vi: 'RESP' } },
    { from: 'web', to: 'posthog', points: [[920, 252], [920, 200], [100, 200], [100, 136]], labelSegment: 3, dashed: true, label: { en: 'Events, no PII', vi: 'Sự kiện, không PII' } },
    { from: 'web', to: 'claude', points: [[968, 252], [968, 184], [332, 184], [332, 136]], labelSegment: 3, label: { en: 'Draft a card', vi: 'Soạn thẻ quán' } },
    { from: 'web', to: 'nearby', points: [[1016, 252], [1016, 168], [592, 168], [592, 136]], labelSegment: 3, label: { en: '1.1 km cell', vi: 'Ô lưới 1,1 km' } },
  ],
}

const angiComponents = {
  id: 'c4-angi-components',
  group: 'angi',
  levelLabel: L3,
  width: 1080,
  height: 688,
  title: { en: 'Ăn Gì · C4 L3: Components in angi-web', vi: 'Ăn Gì · C4 L3: Component trong angi-web' },
  desc: {
    en: 'Page requests and data reads pass the Shield, then reach pages, server actions, the admin console or the contribute API, which share one data layer with a tagged cache.',
    vi: 'Request vào trang và lần đọc dữ liệu đi qua Shield, rồi tới trang, server action, trang admin hoặc API góp quán, tất cả dùng chung một data layer có cache gắn tag.',
  },
  caption: {
    en: 'Every page request and data read passes the Shield first, and every read goes through one data layer whose cache is flushed by tag when a place is approved.',
    vi: 'Request vào trang và lần đọc dữ liệu nào cũng qua Shield trước. Mọi lần đọc đi qua một data layer, cache của nó được làm mới theo tag khi admin duyệt quán.',
  },
  zones: [{ x: 24, y: 64, w: 1032, h: 456, label: { en: 'angi-web · Next.js 16', vi: 'angi-web · Next.js 16' } }],
  nodes: [
    {
      id: 'shield', kind: 'component', focal: true, x: 48, y: 96, w: 984, h: 88,
      name: { en: 'Shield', vi: 'Shield' },
      tag: '[Component: proxy + src/lib/shield]',
      desc: { en: ['Nonce CSP with strict-dynamic, HMAC data tokens, rate limits in Valkey, verified Googlebot and Bingbot, 24-hour bans for attack probes and scripts'], vi: ['CSP có nonce và strict-dynamic, token HMAC cho dữ liệu, rate limit trong Valkey, xác minh Googlebot và Bingbot, ban 24 giờ client dò lỗi hoặc chạy bằng script'] },
      detail: {
        en: 'Page requests and data reads pass here first. Abuse rules live in one place, so a new page gets them without anyone copying a check.',
        vi: 'Request vào trang và lần đọc dữ liệu nào cũng đi qua đây trước. Luật chống lạm dụng nằm một chỗ, nên trang mới tự có, không ai phải nhớ chép lại.',
      },
    },
    {
      id: 'actions', kind: 'component', x: 48, y: 232, w: 228, h: 104,
      name: { en: 'Server actions', vi: 'Server action' },
      tag: '[Component: app/actions]',
      desc: { en: ['Data reads, answers sealed', 'per session (AES-GCM)'], vi: ['Đọc dữ liệu, câu trả lời', 'mã hoá theo phiên (AES-GCM)'] },
      detail: {
        en: 'The old JSON endpoints now answer 410. Reads go through server actions whose payloads are sealed per session, which makes bulk scraping expensive.',
        vi: 'Các endpoint JSON cũ giờ trả 410. Dữ liệu đọc qua server action, payload được mã hoá theo phiên, nên muốn cào hàng loạt sẽ tốn công.',
      },
    },
    {
      id: 'pages', kind: 'component', x: 300, y: 232, w: 228, h: 104,
      name: { en: 'Pages and SEO', vi: 'Trang và SEO' },
      tag: '[Component: app/[lang]]',
      desc: { en: ['Hub, dish and area pages,', 'JSON-LD, sitemap, OG'], vi: ['Trang chủ, trang món, khu vực,', 'JSON-LD, sitemap, OG'] },
      detail: {
        en: 'Server components render per request in Vietnamese or English. Rules in src/lib/seo decide which landing pages are worth indexing.',
        vi: 'Server component render theo từng request, tiếng Việt hoặc tiếng Anh. Luật trong src/lib/seo quyết định trang nào đáng cho Google index.',
      },
    },
    {
      id: 'admin', kind: 'component', x: 552, y: 232, w: 228, h: 104,
      name: { en: 'Moderation', vi: 'Duyệt quán' },
      tag: '[Component: app/admin]',
      desc: { en: ['Queue, approve, reject,', 'quality checks'], vi: ['Hàng chờ, duyệt, từ chối,', 'kiểm chất lượng'] },
      detail: {
        en: 'A submitted place goes live only after this step. Approving it writes the row and flushes the places cache tag in the same action.',
        vi: 'Quán người khác gửi chỉ lên app sau bước này. Duyệt một quán là ghi vào database và làm mới cache tag places trong cùng một thao tác.',
      },
    },
    {
      id: 'contribute', kind: 'component', x: 804, y: 232, w: 228, h: 104,
      name: { en: 'Contribute API', vi: 'API góp quán' },
      tag: '[Component: app/api/chat]',
      desc: { en: ['Assistant with three tools,', 'schema-checked drafts'], vi: ['Trợ lý có ba tool,', 'bản nháp qua kiểm schema'] },
      detail: {
        en: 'Claude can only call three tools: propose a place, fix a place, suggest an idea. The prompt ignores instructions inside pasted text, and every draft is validated before a person sees it.',
        vi: 'Claude chỉ gọi được ba tool: đề xuất quán, sửa quán, góp ý tưởng. Prompt bỏ qua mọi chỉ dẫn nằm trong nội dung dán vào, bản nháp nào cũng qua kiểm schema trước khi người góp nhìn thấy.',
      },
    },
    {
      id: 'nearby', kind: 'component', x: 48, y: 384, w: 228, h: 104,
      name: { en: 'Nearby service', vi: 'Dịch vụ quán gần' },
      tag: '[Component: lib/nearby]',
      desc: { en: ['0.01° grid, daily caps,', 'provider fallback'], vi: ['Ô lưới 0,01°, trần mỗi ngày,', 'đổi nhà cung cấp khi cần'] },
      detail: {
        en: 'Rounds the position, checks the person’s own limits, then the provider’s daily cap. Results stay in a 30-minute cache per cell and never reach the database.',
        vi: 'Làm tròn vị trí, kiểm hạn mức của người dùng rồi tới trần trong ngày của nhà cung cấp. Kết quả nằm trong cache 30 phút theo ô, không bao giờ ghi vào database.',
      },
    },
    {
      id: 'data', kind: 'component', focal: true, x: 300, y: 384, w: 480, h: 104,
      name: { en: 'Data layer', vi: 'Data layer' },
      tag: '[Component: src/db + lib/data]',
      desc: { en: ['Drizzle schema, migrations on start, unstable_cache', 'tagged "places", cleaned at read time'], vi: ['Schema Drizzle, migration chạy lúc khởi động,', 'unstable_cache gắn tag "places", làm sạch lúc đọc'] },
      detail: {
        en: 'All reads share one cached, cleaned copy of the data, flushed by tag when something changes. This is also the first thing to change at scale: it loads every place into memory today.',
        vi: 'Mọi lần đọc dùng chung một bản dữ liệu đã làm sạch và cache, đổi gì thì làm mới theo tag. Khi dữ liệu lớn lên, đây là chỗ phải sửa trước: hiện nó nạp mọi quán vào bộ nhớ.',
      },
    },
    {
      id: 'here', kind: 'external', x: 48, y: 568, w: 228, h: 96,
      name: { en: 'HERE, Google Places', vi: 'HERE, Google Places' },
      tag: '[External]',
      desc: { en: ['900 and 30 calls a day'], vi: ['900 và 30 lượt mỗi ngày'] },
      detail: {
        en: 'Paid APIs sit behind hard daily caps in code, so a traffic spike degrades the nearby list instead of the budget.',
        vi: 'API trả phí có trần cứng mỗi ngày, viết trong code. Traffic tăng vọt thì danh sách quán gần bị ảnh hưởng, ngân sách thì không.',
      },
    },
    {
      id: 'valkey', kind: 'store', x: 300, y: 568, w: 180, h: 96,
      name: { en: 'Valkey', vi: 'Valkey' },
      tag: '[Container]',
      desc: { en: ['Shared counters'], vi: ['Bộ đếm dùng chung'] },
      detail: {
        en: 'Shared by the Shield and the nearby service. If Valkey is down, limits fall back to memory for that process.',
        vi: 'Shield và dịch vụ quán gần dùng chung. Valkey không chạy thì rate limit tạm chuyển sang bộ nhớ của tiến trình.',
      },
    },
    {
      id: 'postgres', kind: 'store', x: 532, y: 568, w: 216, h: 96,
      name: { en: 'Postgres', vi: 'Postgres' },
      tag: '[Container]',
      desc: { en: ['About 20 indexes'], vi: ['Khoảng 20 index'] },
      detail: {
        en: 'The only store that must survive. Partial unique indexes guard accounts; status and IP-hash indexes keep the admin queue fast.',
        vi: 'Chỗ duy nhất bắt buộc phải backup. Partial unique index giữ tài khoản không trùng, index theo trạng thái và IP hash giúp hàng chờ admin chạy nhanh.',
      },
    },
    {
      id: 'claude', kind: 'external', x: 872, y: 568, w: 184, h: 96,
      name: { en: 'Claude Haiku', vi: 'Claude Haiku' },
      tag: '[External]',
      desc: { en: ['Prompt caching on'], vi: ['Có prompt caching'] },
      detail: {
        en: 'The system prompt is cached, so each chat turn pays mostly for the new message.',
        vi: 'System prompt được cache, mỗi lượt chat chủ yếu chỉ trả tiền cho tin nhắn mới.',
      },
    },
  ],
  edges: [
    { from: 'outside', to: 'shield', points: [[540, 24], [540, 96]], labelShift: -12, label: { en: 'From the tunnel', vi: 'Từ tunnel' } },
    { from: 'shield', to: 'actions', points: [[162, 184], [162, 232]] },
    { from: 'shield', to: 'pages', points: [[414, 184], [414, 232]] },
    { from: 'shield', to: 'admin', points: [[666, 184], [666, 232]] },
    { from: 'shield', to: 'contribute', points: [[918, 184], [918, 232]] },
    { from: 'actions', to: 'nearby', points: [[162, 336], [162, 384]] },
    { from: 'actions', to: 'data', points: [[236, 336], [236, 360], [340, 360], [340, 384]] },
    { from: 'pages', to: 'data', points: [[414, 336], [414, 384]] },
    { from: 'admin', to: 'data', points: [[666, 336], [666, 384]], label: { en: 'Revalidate', vi: 'Revalidate' } },
    { from: 'contribute', to: 'data', points: [[840, 336], [840, 436], [780, 436]], labelSegment: 1, label: { en: 'Save draft', vi: 'Lưu bản nháp' } },
    { from: 'contribute', to: 'claude', points: [[964, 336], [964, 568]], label: { en: 'Tool use', vi: 'Tool use' } },
    { from: 'nearby', to: 'here', points: [[140, 488], [140, 568]], labelSide: 'left', labelShift: 16, label: { en: 'Grid cell', vi: 'Ô lưới' } },
    { from: 'nearby', to: 'valkey', points: [[232, 488], [232, 540], [360, 540], [360, 568]], labelSegment: 2, labelSide: 'below', label: { en: '30 min cache', vi: 'Cache 30 phút' } },
    { from: 'data', to: 'postgres', points: [[640, 488], [640, 568]], labelShift: 16, label: { en: 'SQL', vi: 'SQL' } },
  ],
}

const wishjarContext = {
  id: 'c4-wishjar-context',
  group: 'wishjar',
  levelLabel: L1,
  width: 1080,
  height: 560,
  title: 'Wishjar · C4 L1: System Context',
  desc: {
    en: 'A sender uses Wishjar on the phone; the maintainer grows the library with Codex CLI; Claude rewrites, PostHog counts, messaging apps receive the wish.',
    vi: 'Người gửi dùng Wishjar trên điện thoại, người làm app nuôi thư viện bằng Codex CLI. Claude viết lại, PostHog đếm, app nhắn tin nhận lời chúc.',
  },
  caption: {
    en: 'At runtime only Claude costs money. Codex CLI writes the content ahead of time, at build time.',
    vi: 'Lúc chạy, chỉ Claude là tốn tiền. Nội dung do Codex CLI viết sẵn từ lúc build.',
  },
  nodes: [
    {
      id: 'sender', kind: 'person', x: 24, y: 220, w: 216, h: 100,
      name: { en: 'Sender', vi: 'Người gửi' },
      tag: '[Person]',
      desc: { en: ['Needs one good line', 'for a chat, right now'], vi: ['Cần một câu hay để', 'nhắn ngay bây giờ'] },
      detail: {
        en: 'Opens the app on a phone, shakes the jar, swaps pronouns if needed and shares. Favorites stay in the browser, and there is no account.',
        vi: 'Mở app trên điện thoại, lắc hũ, đổi cách xưng hô nếu cần rồi chia sẻ. Lời chúc đã lưu nằm trong trình duyệt, không có tài khoản.',
      },
    },
    {
      id: 'maintainer', kind: 'person', x: 24, y: 440, w: 216, h: 96,
      name: { en: 'Maintainer', vi: 'Người làm app' },
      tag: '[Person: me]',
      desc: { en: ['Generates, reviews, ships'], vi: ['Sinh câu, duyệt, deploy'] },
      detail: {
        en: 'Runs the generator, reads the new lines before committing them, and deploys with one script.',
        vi: 'Chạy generator, đọc từng câu mới trước khi commit, rồi deploy bằng một script.',
      },
    },
    {
      id: 'wishjar', kind: 'system', focal: true, x: 412, y: 196, w: 256, h: 148, drill: 'c4-wishjar-containers',
      name: { en: 'Wishjar', vi: 'Wishjar' },
      tag: '[Software System]',
      desc: { en: ['1,008 Vietnamese wishes,', '28 occasions, 11 audiences,', 'works offline'], vi: ['1.008 lời chúc tiếng Việt,', '28 dịp, 11 kiểu người nhận,', 'chạy được khi offline'] },
      detail: {
        en: 'A static PWA and a small Node server with exactly one endpoint that costs money.',
        vi: 'Một PWA tĩnh và một server Node nhỏ, chỉ có đúng một endpoint tốn tiền.',
      },
    },
    {
      id: 'search', kind: 'external', x: 412, y: 40, w: 256, h: 88,
      name: { en: 'Search engines', vi: 'Công cụ tìm kiếm' },
      tag: '[External]',
      desc: { en: ['Read 29 static pages'], vi: ['Đọc 29 trang tĩnh'] },
      detail: {
        en: 'The build prerenders one page per occasion under /loi-chuc/ plus an index, with sitemap.xml, canonical tags and JSON-LD.',
        vi: 'Lúc build, mỗi dịp có một trang tĩnh dưới /loi-chuc/, thêm một trang mục lục, kèm sitemap.xml, canonical và JSON-LD.',
      },
    },
    {
      id: 'codex', kind: 'external', x: 412, y: 440, w: 256, h: 96,
      name: { en: 'Codex CLI', vi: 'Codex CLI' },
      tag: '[External: build time]',
      desc: { en: ['Writes new lines from', 'a JSON schema'], vi: ['Viết câu mới theo', 'JSON schema'] },
      detail: {
        en: 'Runs on the maintainer’s machine in read-only sandbox mode. Every line is checked for pronoun slots, tone, audience and length, and near-duplicates are dropped before anything reaches the library.',
        vi: 'Chạy trên máy người làm app ở chế độ sandbox chỉ đọc. Câu nào cũng qua kiểm tra chỗ trống xưng hô, vibe, người nhận và độ dài. Câu gần trùng bị bỏ trước khi vào thư viện.',
      },
    },
    {
      id: 'claude', kind: 'external', x: 840, y: 104, w: 216, h: 96,
      name: { en: 'Claude Haiku', vi: 'Claude Haiku' },
      tag: '[External: Anthropic]',
      desc: { en: ['Three rewrites per tap'], vi: ['Ba bản viết lại mỗi lần'] },
      detail: {
        en: 'The only runtime cost. The request carries a library id, a style and a recipient, never typed text, so there is nothing for a user to inject.',
        vi: 'Chi phí duy nhất lúc chạy. Request không có chữ nào người dùng tự gõ, chỉ có ID lời chúc, kiểu chỉnh và người nhận, nên không có gì để chèn prompt.',
      },
    },
    {
      id: 'posthog', kind: 'external', x: 840, y: 224, w: 216, h: 96,
      name: { en: 'PostHog', vi: 'PostHog' },
      tag: '[External]',
      desc: { en: ['Loads after first paint'], vi: ['Tải sau khi trang hiện'] },
      detail: {
        en: 'Loaded only when a key is set, after first paint, with Do Not Track respected and session recording off.',
        vi: 'Chỉ tải khi có key, sau khi trang đã hiện, tôn trọng Do Not Track và tắt ghi lại phiên.',
      },
    },
    {
      id: 'messaging', kind: 'external', x: 840, y: 344, w: 216, h: 96,
      name: { en: 'Zalo, Messenger', vi: 'Zalo, Messenger' },
      tag: '[External]',
      desc: { en: ['Text or a 1080×1350 card'], vi: ['Chữ hoặc ảnh 1080×1350'] },
      detail: {
        en: 'Wishjar hands off through the native share sheet or the clipboard. It never needs a login to any chat app.',
        vi: 'Wishjar chuyển qua share sheet của máy hoặc clipboard, không cần đăng nhập vào app chat nào.',
      },
    },
  ],
  edges: [
    { from: 'sender', to: 'wishjar', points: [[240, 270], [412, 270]], label: { en: 'Shake, AI tweak', vi: 'Lắc hũ, nhờ AI chỉnh' } },
    { from: 'maintainer', to: 'codex', points: [[240, 488], [412, 488]], label: { en: 'pnpm generate', vi: 'pnpm generate' } },
    { from: 'maintainer', to: 'wishjar', points: [[240, 456], [320, 456], [320, 320], [412, 320]], labelSegment: 2, label: { en: 'Review, deploy', vi: 'Duyệt, deploy' } },
    { from: 'codex', to: 'wishjar', points: [[540, 440], [540, 344]], dashed: true, label: { en: 'Checked JSON', vi: 'JSON đã lọc' } },
    { from: 'search', to: 'wishjar', points: [[540, 128], [540, 196]], label: { en: 'Read /loi-chuc', vi: 'Đọc /loi-chuc' } },
    { from: 'wishjar', to: 'claude', points: [[668, 232], [720, 232], [720, 152], [840, 152]], labelSegment: 3, label: { en: '3 rewrites', vi: 'Viết lại 3 bản' } },
    { from: 'wishjar', to: 'posthog', points: [[668, 272], [840, 272]], dashed: true, label: { en: 'Anonymous events', vi: 'Sự kiện ẩn danh' } },
    { from: 'wishjar', to: 'messaging', points: [[668, 312], [720, 312], [720, 392], [840, 392]], labelSegment: 3, label: { en: 'Share sheet', vi: 'Share sheet' } },
  ],
}

const wishjarContainers = {
  id: 'c4-wishjar-containers',
  group: 'wishjar',
  levelLabel: L2,
  width: 1080,
  height: 700,
  title: 'Wishjar · C4 L2: Container',
  desc: {
    en: 'The PWA and its service worker run on the phone; a Node server and a SQLite file run on the VPS; a build step bakes the library into the image.',
    vi: 'PWA và service worker chạy trên điện thoại, server Node và file SQLite chạy trên VPS. Bước build gói thư viện vào image.',
  },
  caption: {
    en: 'Reading a wish never reaches the VPS. Only the AI tweak does, and that path carries every limit.',
    vi: 'Đọc lời chúc không cần tới VPS. Chỉ nút nhờ AI chỉnh mới gọi server, và mọi giới hạn đều nằm trên đường này.',
  },
  zones: [
    { x: 208, y: 216, w: 256, h: 320, label: { en: 'Your phone', vi: 'Điện thoại của bạn' } },
    { x: 728, y: 392, w: 328, h: 296, label: { en: 'VPS · Docker Compose', vi: 'VPS · Docker Compose' } },
  ],
  nodes: [
    {
      id: 'person', kind: 'person', x: 24, y: 268, w: 152, h: 96,
      name: { en: 'Sender', vi: 'Người gửi' },
      tag: '[Person]',
      desc: { en: ['On a phone'], vi: ['Trên điện thoại'] },
      detail: { en: 'Opens Wishjar on a phone, usually right when a message needs sending.', vi: 'Mở Wishjar trên điện thoại, thường là ngay lúc cần nhắn.' },
    },
    {
      id: 'pwa', kind: 'container', x: 228, y: 252, w: 216, h: 128,
      name: { en: 'Wishjar PWA', vi: 'Wishjar PWA' },
      tag: '[Container: Vite + TS]',
      desc: { en: ['Whole library in the bundle,', 'state in the URL,', 'favorites in localStorage'], vi: ['Cả thư viện nằm trong bundle,', 'state nằm trên URL,', 'yêu thích trong localStorage'] },
      detail: {
        en: 'No UI framework. The main chunk is about 73 KB gzip with all 1,008 lines inside. Filters and the current wish live in the URL, so a shared link reopens the same card.',
        vi: 'Không dùng UI framework. Chunk chính khoảng 73 KB gzip, chứa luôn 1.008 câu. Bộ lọc và lời chúc đang xem nằm trên URL, gửi link là người nhận mở ra đúng tấm thẻ đó.',
      },
    },
    {
      id: 'sw', kind: 'container', x: 228, y: 420, w: 216, h: 100,
      name: { en: 'Service worker', vi: 'Service worker' },
      tag: '[Container: Workbox]',
      desc: { en: ['Precache, offline shell,', 'fonts kept for a year'], vi: ['Precache, chạy offline,', 'giữ font một năm'] },
      detail: {
        en: 'Precaches the app and serves it offline. /api, /loi-chuc and /healthz always go to the network.',
        vi: 'Precache toàn bộ app và phục vụ khi offline. Riêng /api, /loi-chuc và /healthz luôn đi ra mạng.',
      },
    },
    {
      id: 'edge', kind: 'external', x: 512, y: 420, w: 184, h: 100,
      name: { en: 'Cloudflare, Traefik', vi: 'Cloudflare, Traefik' },
      tag: '[Shared VPS edge]',
      desc: { en: ['30 req/s per IP,', 'burst 60'], vi: ['30 req/s mỗi IP,', 'burst 60'] },
      detail: {
        en: 'The same tunnel and Traefik that front the other *.startup.id.vn apps. Traefik adds a per-IP limit before a request reaches Node.',
        vi: 'Cùng tunnel và Traefik đang đứng trước các app *.startup.id.vn khác. Traefik chặn theo IP trước khi request tới được Node.',
      },
    },
    {
      id: 'server', kind: 'container', focal: true, x: 748, y: 420, w: 288, h: 100, drill: 'c4-wishjar-components',
      name: { en: 'wishjar-web', vi: 'wishjar-web' },
      tag: '[Container: node:http, Node 22]',
      desc: { en: ['Static files, POST /api/rewrite,', '256 MB, read-only root'], vi: ['File tĩnh, POST /api/rewrite,', '256 MB, root chỉ đọc'] },
      detail: {
        en: 'A node:http server with no web framework; its only runtime dependency is the Anthropic SDK. Every response carries security headers. The container has 256 MB of memory, half a CPU, no Linux capabilities and a read-only filesystem.',
        vi: 'Server viết bằng node:http, không dùng web framework, thư viện ngoài duy nhất là Anthropic SDK. Response nào cũng có security header. Container có 256 MB RAM, nửa CPU, bỏ hết Linux capability và filesystem chỉ đọc.',
      },
    },
    {
      id: 'sqlite', kind: 'store', x: 748, y: 572, w: 288, h: 96,
      name: { en: 'SQLite archive', vi: 'Kho SQLite' },
      tag: '[Container: node:sqlite, WAL]',
      desc: { en: ['Every fresh AI line, FTS5'], vi: ['Mọi câu AI mới, có FTS5'] },
      detail: {
        en: 'Stores each new AI rewrite with its source, style and status so good lines can be reviewed and served to others later. Lives on a named Docker volume.',
        vi: 'Lưu mỗi câu AI mới kèm nguồn, kiểu viết và trạng thái, để sau này duyệt câu hay rồi phát cho người khác. Nằm trên một Docker volume có tên.',
      },
    },
    {
      id: 'claude', kind: 'external', x: 848, y: 40, w: 208, h: 96,
      name: { en: 'Claude Haiku', vi: 'Claude Haiku' },
      tag: '[External]',
      desc: { en: ['messages.parse + schema'], vi: ['messages.parse + schema'] },
      detail: {
        en: 'Called with a JSON schema for the reply, a 25-second abort and one retry. A 429 or 529 from upstream becomes a friendly 503 Busy.',
        vi: 'Gọi kèm JSON schema cho câu trả lời, huỷ sau 25 giây, thử lại một lần. Upstream trả 429 hay 529 thì client nhận về 503 Busy.',
      },
    },
    {
      id: 'posthog', kind: 'external', x: 512, y: 40, w: 184, h: 96,
      name: { en: 'PostHog', vi: 'PostHog' },
      tag: '[External]',
      desc: { en: ['Only with a key'], vi: ['Chỉ khi có key'] },
      detail: {
        en: 'FingerprintJS (open source, in the browser) gives the visitor id. No PostHog key at build time means no analytics chunk at all.',
        vi: 'FingerprintJS (bản mã nguồn mở, chạy trên trình duyệt) tạo visitor id. Build không có key PostHog thì không có luôn chunk analytics.',
      },
    },
    {
      id: 'build', kind: 'container', x: 24, y: 584, w: 440, h: 100,
      name: { en: 'Build pipeline', vi: 'Bước build' },
      tag: '[Container: tsc, vite build, prerender]',
      desc: { en: ['Typecheck, bundle the library, write 29 SEO pages,', 'sitemap and robots, then docker build'], vi: ['Typecheck, gói thư viện, sinh 29 trang SEO,', 'sitemap, robots, rồi docker build'] },
      detail: {
        en: 'CI runs typecheck, tests and build on pushes to main and on pull requests. Deploy is rsync plus docker compose up on the VPS, then a health check.',
        vi: 'CI chạy typecheck, test và build mỗi lần push lên main và mỗi pull request. Deploy là rsync rồi docker compose up trên VPS, sau đó chờ health check.',
      },
    },
  ],
  edges: [
    { from: 'person', to: 'pwa', points: [[176, 316], [228, 316]], label: { en: 'Uses', vi: 'Dùng' } },
    { from: 'pwa', to: 'sw', points: [[336, 380], [336, 420]], label: { en: 'Fetch', vi: 'Fetch' } },
    { from: 'sw', to: 'edge', points: [[444, 470], [512, 470]], label: { en: 'HTTPS', vi: 'HTTPS' } },
    { from: 'edge', to: 'server', points: [[696, 470], [748, 470]] },
    { from: 'server', to: 'sqlite', points: [[892, 520], [892, 572]], label: { en: 'ai_wishes', vi: 'ai_wishes' } },
    { from: 'server', to: 'claude', points: [[952, 420], [952, 136]], labelSide: 'left', label: { en: 'Rewrite', vi: 'Viết lại' } },
    { from: 'pwa', to: 'posthog', points: [[444, 284], [604, 284], [604, 136]], labelSegment: 1, dashed: true, label: { en: 'Events', vi: 'Sự kiện' } },
    { from: 'build', to: 'server', points: [[464, 634], [712, 634], [712, 500], [748, 500]], labelSegment: 1, dashed: true, label: { en: 'dist/ in image', vi: 'dist/ trong image' } },
  ],
}

const wishjarComponents = {
  id: 'c4-wishjar-components',
  group: 'wishjar',
  levelLabel: L3,
  width: 1120,
  height: 640,
  title: { en: 'Wishjar · C4 L3: Components in the Node server', vi: 'Wishjar · C4 L3: Component trong server Node' },
  desc: {
    en: 'A request is routed to static files or to the rewrite path, which runs a guard, a limiter chain, a cache, the model call, a validator and an archive.',
    vi: 'Request được chia sang file tĩnh hoặc đường viết lại. Đường này đi qua guard, chuỗi rate limit, cache, lời gọi model, bộ kiểm tra và kho lưu.',
  },
  caption: {
    en: 'Cheap checks run first and Claude runs last. Any step can turn the request away.',
    vi: 'Bước rẻ chạy trước, Claude chạy sau cùng. Bước nào cũng có quyền từ chối request.',
  },
  zones: [{ x: 24, y: 64, w: 872, h: 560, labelX: 300, label: { en: 'wishjar-web · node:http', vi: 'wishjar-web · node:http' } }],
  nodes: [
    {
      id: 'router', kind: 'component', x: 48, y: 112, w: 168, h: 100,
      name: { en: 'Router', vi: 'Router' },
      tag: '[server/index.ts]',
      desc: { en: ['CSP, HSTS, COOP', 'on every answer'], vi: ['CSP, HSTS, COOP', 'cho mọi response'] },
      detail: {
        en: 'Sets the security headers once for every response, then sends GET to static files and POST /api/rewrite to the rewrite path. Timeouts: 10 s for headers, 30 s per request.',
        vi: 'Gắn security header một lần cho mọi response, rồi chia GET sang file tĩnh, POST /api/rewrite sang đường viết lại. Timeout: 10 giây cho header, 30 giây cho mỗi request.',
      },
    },
    {
      id: 'static', kind: 'component', x: 48, y: 300, w: 168, h: 100,
      name: { en: 'Static files', vi: 'File tĩnh' },
      tag: '[server/index.ts]',
      desc: { en: ['Hashed assets cached', 'for a year'], vi: ['Asset có hash cache', 'một năm'] },
      detail: {
        en: 'Serves dist/ with a path-traversal guard. /assets/ gets immutable one-year caching, so a CDN can hold almost every byte.',
        vi: 'Phục vụ dist/ và chặn path traversal. /assets/ được cache immutable một năm, gần như mọi byte đều có thể nằm ở CDN.',
      },
    },
    {
      id: 'guard', kind: 'component', x: 264, y: 112, w: 168, h: 100,
      name: 'Request guard',
      tag: '[server/index.ts]',
      desc: { en: ['Origin allowlist,', 'JSON only'], vi: ['Origin allowlist,', 'chỉ nhận JSON'] },
      detail: {
        en: 'Other sites get 403 on preflight and on the request. A request that is not JSON is refused right here.',
        vi: 'Site khác nhận 403 ngay ở preflight lẫn request thật. Request không phải JSON bị từ chối ngay tại đây.',
      },
    },
    {
      id: 'limits', kind: 'component', focal: true, x: 480, y: 112, w: 168, h: 100,
      name: { en: 'Limiter chain', vi: 'Chuỗi rate limit' },
      tag: '[server/limits.ts]',
      desc: { en: ['IP 6/min, 60/day,', 'visitor 40/day'], vi: ['IP 6/phút, 60/ngày,', 'visitor 40/ngày'] },
      detail: {
        en: 'Per IP (IPv6 grouped by /64) per minute and per day, and per visitor per day. Only after this is the body read, capped at 1 KB. The counters live in memory today, which is why the server runs as one replica.',
        vi: 'Theo IP (IPv6 gom theo /64) mỗi phút và mỗi ngày, theo visitor mỗi ngày. Qua bước này server mới đọc body, tối đa 1 KB. Bộ đếm hiện nằm trong bộ nhớ, nên server chỉ chạy một bản.',
      },
    },
    {
      id: 'cache', kind: 'component', focal: true, x: 696, y: 112, w: 168, h: 100,
      name: { en: 'Answer cache', vi: 'Cache câu trả lời' },
      tag: '[server/limits.ts]',
      desc: { en: ['24 h, 20,000 entries,', 'shared in-flight calls'], vi: ['24 giờ, 20.000 mục,', 'gộp request trùng'] },
      detail: {
        en: 'Same wish, style and audience within 24 hours costs nothing, and identical requests arriving together share one model call. Cache hits do not count against the global cap.',
        vi: 'Cùng lời chúc, cùng kiểu viết, cùng người nhận trong 24 giờ thì không tốn đồng nào, request giống nhau tới cùng lúc thì dùng chung một lời gọi model. Cache hit không bị tính vào trần tổng.',
      },
    },
    {
      id: 'model', kind: 'component', x: 696, y: 300, w: 168, h: 100,
      name: { en: 'Model call', vi: 'Gọi Claude' },
      tag: '[server/rewrite.ts]',
      desc: { en: ['On a miss: 3,000/day', 'in total, 8 in flight'], vi: ['Khi miss: trần tổng', '3.000/ngày, 8 cùng lúc'] },
      detail: {
        en: 'Runs only on a cache miss: checks the global cap of 3,000 calls a day and at most 8 calls in flight, then builds the prompt from the library line, the style brief and the shared voice guide. max_tokens 1,200, 25-second abort, one retry.',
        vi: 'Chỉ chạy khi cache miss: kiểm trần tổng 3.000 lượt mỗi ngày và tối đa 8 lời gọi cùng lúc, rồi dựng prompt từ câu trong thư viện, mô tả kiểu viết và bộ quy tắc giọng văn dùng chung. max_tokens 1.200, huỷ sau 25 giây, thử lại một lần.',
      },
    },
    {
      id: 'validator', kind: 'component', x: 480, y: 300, w: 168, h: 100,
      name: 'Validator',
      tag: '[server/rewrite.ts]',
      desc: { en: ['Schema, 320 chars,', 'dedupe, max 3'], vi: ['Schema, 320 ký tự,', 'bỏ trùng, tối đa 3'] },
      detail: {
        en: 'Model output is parsed against the schema, then each line goes through the same token and length rules the generator applies. Anything odd is dropped, not repaired.',
        vi: 'Model trả về được parse theo schema, rồi từng câu qua đúng luật về token và độ dài mà generator dùng. Câu nào lạ thì bỏ, không cố sửa.',
      },
    },
    {
      id: 'archive', kind: 'component', x: 480, y: 480, w: 168, h: 96,
      name: { en: 'Archive store', vi: 'Kho lưu câu AI' },
      tag: '[server/store.ts]',
      desc: { en: ['Migrations by', 'user_version'], vi: ['Migration theo', 'user_version'] },
      detail: {
        en: 'Append-only migrations tracked with PRAGMA user_version. A unique fingerprint skips near-duplicates; an accent-insensitive FTS5 index is ready for search.',
        vi: 'Migration chỉ thêm, đánh dấu bằng PRAGMA user_version. Fingerprint unique bỏ câu gần trùng, còn index FTS5 không phân biệt dấu đã sẵn cho tính năng tìm kiếm.',
      },
    },
    {
      id: 'claude', kind: 'external', x: 936, y: 300, w: 160, h: 100,
      name: { en: 'Claude Haiku', vi: 'Claude Haiku' },
      tag: '[External]',
      desc: { en: ['The paid call'], vi: ['Lời gọi tốn tiền'] },
      detail: {
        en: 'Reached only after every cheaper check said yes.',
        vi: 'Chỉ tới được đây khi mọi bước rẻ hơn đều đã cho qua.',
      },
    },
    {
      id: 'sqlite', kind: 'store', x: 936, y: 480, w: 160, h: 96,
      name: { en: 'SQLite file', vi: 'File SQLite' },
      tag: '[Docker volume]',
      desc: { en: ['wishjar.db'], vi: ['wishjar.db'] },
      detail: {
        en: 'One file on one volume. Fine for an archive, and the first thing to move if the server ever runs as more than one replica.',
        vi: 'Một file trên một volume. Đủ dùng cho kho lưu, và là thứ đầu tiên phải dời đi nếu server chạy nhiều hơn một bản.',
      },
    },
  ],
  edges: [
    { from: 'outside', to: 'router', points: [[132, 24], [132, 112]], labelShift: -20, label: { en: 'From Traefik', vi: 'Từ Traefik' } },
    { from: 'router', to: 'static', points: [[132, 212], [132, 300]], label: { en: 'GET /*', vi: 'GET /*' } },
    { from: 'router', to: 'guard', points: [[216, 162], [264, 162]], label: { en: 'POST', vi: 'POST' } },
    { from: 'guard', to: 'limits', points: [[432, 162], [480, 162]] },
    { from: 'limits', to: 'cache', points: [[648, 162], [696, 162]] },
    { from: 'cache', to: 'model', points: [[780, 212], [780, 300]], label: { en: 'Miss', vi: 'Miss' } },
    { from: 'model', to: 'claude', points: [[864, 350], [936, 350]], label: { en: 'Parse', vi: 'Parse' } },
    { from: 'model', to: 'validator', points: [[696, 350], [648, 350]] },
    { from: 'validator', to: 'archive', points: [[564, 400], [564, 480]], label: { en: 'New lines', vi: 'Câu mới' } },
    { from: 'validator', to: 'cache', points: [[600, 300], [600, 256], [740, 256], [740, 212]], labelSegment: 2, label: { en: 'Keep 24 h', vi: 'Giữ 24 giờ' } },
    { from: 'archive', to: 'sqlite', points: [[648, 528], [936, 528]], label: { en: 'WAL, FTS5', vi: 'WAL, FTS5' } },
  ],
}

export const C4_SPECS = [angiContext, angiContainers, angiComponents, wishjarContext, wishjarContainers, wishjarComponents]
