// Public apps listed on /apps, with copy per authored locale (en, vi). Other locales read the en copy,
// matching STATIC_PAGE_SEO_POLICY.apps. E-Slang is unlisted on purpose (private, Vietnamese-only);
// its route /apps/english keeps working but nothing public links to it.

export type AppsCopyLocale = 'en' | 'vi'
export type AppStatus = 'shipped' | 'beta' | 'wip'

export interface AppLinks {
  site?: string
  article?: string
  repo?: string
  download?: string
  docs?: string
}

export interface AppCopy {
  tagline: string
  hardware: string
  facts: string[]
}

// Ăn Gì demo: a reel of the dish lists the app really has, each landing on its live dish page.
export interface DishDemo {
  slug: string
  name: Record<AppsCopyLocale, string>
  // Fills the CTA template, e.g. "quán lẩu" / "hotpot places".
  places: Record<AppsCopyLocale, string>
}

// Wishjar demo: real lines from the Wishjar library (src/data/wishes/*.json, checked 2026-11-23).
// `text` keeps the app's {you}/{me} pronoun slots; `gloss` is the English meaning for the en page.
export interface WishDemoAudience {
  id: string
  label: Record<AppsCopyLocale, string>
  you: string
  me: string
}

export interface WishDemoLine {
  id: string
  occasion: string
  // Recipients the line suits, first one is the default; ids from WishDemo.audiences.
  audiences: string[]
  text: string
  gloss: string
}

export interface WishDemo {
  occasions: { id: string; emoji: string; label: Record<AppsCopyLocale, string> }[]
  audiences: WishDemoAudience[]
  lines: WishDemoLine[]
}

// Glance demo: a sentence whose numbered parts are clickable phrases with a canned translation.
export interface GlanceDemo {
  windowTitle: string
  parts: (string | number)[]
  phrases: { source: string; target: string }[]
}

export interface AppShowcaseItem {
  id: string
  name: string
  status: AppStatus
  version: string
  // JSON-LD operatingSystem and the meta line.
  platforms: string[]
  stack: string[]
  license?: string
  // schema.org applicationCategory for the JSON-LD.
  category: string
  // Clean public URL for the JSON-LD; links.site carries the UTM-tagged one.
  homepage?: string
  hotkeys: { keys: string[]; action: Record<AppsCopyLocale, string> }[]
  links: AppLinks
  dishes?: DishDemo[]
  wishDemo?: WishDemo
  glanceDemo?: GlanceDemo
  copy: Record<AppsCopyLocale, AppCopy>
}

export interface AppsPageCopy {
  title: string
  sub: string
  back: string
  status: Record<AppStatus, string>
  hotkeys: string
  links: Record<keyof AppLinks, string>
  labNote: string
  github: string
  dishLead: string
  spin: string
  // {places} is replaced with DishDemo.places.
  openDish: string
  glanceHint: string
  shake: string
  wishFor: string
  wishOccasion: string
  // Primary CTA under the wish card.
  openWish: string
}

export const appsPageCopy: Record<AppsCopyLocale, AppsPageCopy> = {
  en: {
    title: 'Apps I made',
    sub: 'Small tools I built to get repeated daily chores done faster, at work and at home. Each one has a demo you can try on this page.',
    back: '← Back to CV',
    status: { shipped: 'Shipped', beta: 'Beta', wip: 'In progress' },
    hotkeys: 'Shortcuts',
    links: { site: 'Open the app', article: 'Read the story', repo: 'Source', download: 'Download', docs: 'Docs' },
    labNote: 'The rest of my code is on GitHub.',
    github: 'See them on GitHub',
    dishLead: "Today we're having",
    spin: 'Spin',
    openDish: 'Find {places}',
    glanceHint: "Click an underlined phrase, or press the same shortcut you'd use on a Mac.",
    shake: 'Shake the jar',
    wishFor: 'Send to',
    wishOccasion: 'Occasion',
    openWish: 'Open this one in Wishjar',
  },
  vi: {
    title: 'Ứng dụng tôi làm',
    sub: 'Mấy công cụ nhỏ tôi tự làm để bớt việc lặp lại mỗi ngày, ở chỗ làm lẫn ở nhà. App nào cũng có bản thử ngay trên trang này.',
    back: '← Quay lại CV',
    status: { shipped: 'Đã phát hành', beta: 'Beta', wip: 'Đang làm' },
    hotkeys: 'Phím tắt',
    links: { site: 'Mở app', article: 'Đọc bài viết', repo: 'Source code', download: 'Tải về', docs: 'Hướng dẫn' },
    labNote: 'Code các dự án khác tôi để trên GitHub.',
    github: 'Xem trên GitHub',
    dishLead: 'Hôm nay ăn',
    spin: 'Quay đại',
    openDish: 'Xem {places} trên Ăn Gì',
    glanceHint: 'Bấm vào một cụm gạch chân, hoặc bấm phím tắt này y như trên Mac.',
    shake: 'Lắc hũ',
    wishFor: 'Gửi cho',
    wishOccasion: 'Dịp',
    openWish: 'Mở câu này trên Wishjar',
  },
}

// UTM tags let the app's own analytics tell visits from this page apart from the blog post and social shares.
const AN_GI_UTM = 'utm_source=nguyenlephong.github.io&utm_medium=apps_page&utm_campaign=an_gi_launch'

export const apps: AppShowcaseItem[] = [
  {
    id: 'an-gi',
    name: 'Ăn Gì',
    status: 'shipped',
    version: 'v0.1.0',
    platforms: ['Web'],
    stack: ['Next.js', 'PostgreSQL'],
    license: 'CC BY 4.0',
    category: 'LifestyleApplication',
    homepage: 'https://angiday.startup.id.vn/',
    hotkeys: [],
    links: {
      article: '/blog/perspectives/an-gi-hom-nay-an-gi-o-dau',
    },
    // Dish lists on the live app: /an/<slug> in Vietnamese, /en/eat/<slug> in English (checked 2026-11-21).
    dishes: [
      { slug: 'lau', name: { vi: 'Lẩu', en: 'Hotpot' }, places: { vi: 'quán lẩu', en: 'hotpot places' } },
      { slug: 'bun', name: { vi: 'Bún', en: 'Bún' }, places: { vi: 'quán bún', en: 'bún places' } },
      { slug: 'ca-phe', name: { vi: 'Cà phê', en: 'Coffee' }, places: { vi: 'quán cà phê', en: 'coffee places' } },
      { slug: 'hu-tieu', name: { vi: 'Hủ tiếu', en: 'Hủ tiếu' }, places: { vi: 'quán hủ tiếu', en: 'hủ tiếu places' } },
      { slug: 'an-vat', name: { vi: 'Ăn vặt', en: 'Snacks' }, places: { vi: 'quán ăn vặt', en: 'street snack places' } },
      { slug: 'mi', name: { vi: 'Mì', en: 'Noodles' }, places: { vi: 'quán mì', en: 'egg noodle places' } },
      { slug: 'com', name: { vi: 'Cơm', en: 'Rice' }, places: { vi: 'quán cơm', en: 'rice plate places' } },
      { slug: 'mon-han', name: { vi: 'Món Hàn', en: 'Korean' }, places: { vi: 'quán món Hàn', en: 'Korean places' } },
      { slug: 'chay', name: { vi: 'Chay', en: 'Vegetarian' }, places: { vi: 'quán chay', en: 'vegetarian places' } },
      { slug: 'mon-nhat', name: { vi: 'Món Nhật', en: 'Japanese' }, places: { vi: 'quán món Nhật', en: 'Japanese places' } },
      { slug: 'buffet', name: { vi: 'Buffet', en: 'Buffet' }, places: { vi: 'quán buffet', en: 'buffet places' } },
    ],
    copy: {
      en: {
        tagline: 'Saves you the daily “where do we eat” debate. Pick a dish and it gives you one place nearby, with directions.',
        hardware: 'phone and desktop browsers',
        facts: [
          'Feel like hotpot, coffee or a late-night bowl? Pick it. No idea at all? Spin and let it choose.',
          '454 places from 326 food review notes I kept, as of 17 Nov 2026. Every place shows where its details came from.',
          'In another city, turn on Near you to find places around where you are standing. The regional specialties page lists what each province is known for.',
          'No account needed, and the server does not store your location. Know a good place? Send it in. I review each one before it goes live.',
        ],
      },
      vi: {
        tagline: 'Đỡ phải hỏi nhau trưa nay ăn đâu. Chọn món đang thèm, app đưa ra một quán gần bạn kèm đường đi.',
        hardware: 'điện thoại và máy tính',
        facts: [
          'Thèm lẩu, cà phê hay đồ ăn khuya thì chọn món đó. Chưa nghĩ ra thì bấm Quay đại cho app chọn.',
          'Sổ tay có 454 quán, gom từ 326 ghi chú review ăn uống tôi lưu lại (số liệu ngày 17/11/2026). Quán nào cũng ghi rõ nguồn.',
          'Đi tỉnh khác thì bật Gần bạn, app tìm quán quanh chỗ bạn đang đứng. Trang Đặc sản vùng miền cho biết tỉnh nào nên ăn món gì.',
          'Không cần tài khoản, server không lưu vị trí của bạn. Biết quán ngon thì góp vào, tôi duyệt từng quán rồi mới lên app.',
        ],
      },
    },
  },
  {
    id: 'wishjar',
    name: 'Wishjar',
    status: 'shipped',
    version: 'v0.1.0',
    platforms: ['Web', 'PWA'],
    stack: ['TypeScript', 'Node.js', 'Claude Haiku'],
    category: 'LifestyleApplication',
    homepage: 'https://wishjar.startup.id.vn/',
    hotkeys: [],
    links: {
      article: '/blog/perspectives/wishjar-loi-chuc-hay-cho-moi-dip',
    },
    wishDemo: {
      occasions: [
        { id: 'morning', emoji: '☀️', label: { vi: 'Chào buổi sáng', en: 'Good morning' } },
        { id: 'monday', emoji: '🫠', label: { vi: 'Đầu tuần', en: 'Monday' } },
        { id: 'payday', emoji: '💸', label: { vi: 'Lương về', en: 'Payday' } },
        { id: 'flirt', emoji: '🎣', label: { vi: 'Thả thính', en: 'Flirting' } },
      ],
      // Default pronoun pairs from the app's catalog (src/catalog.ts AUDIENCES).
      audiences: [
        { id: 'colleague', label: { vi: 'Đồng nghiệp', en: 'Colleague' }, you: 'bạn', me: 'mình' },
        { id: 'crush', label: { vi: 'Crush', en: 'Crush' }, you: 'cậu', me: 'tớ' },
        { id: 'lover', label: { vi: 'Người yêu', en: 'Partner' }, you: 'em', me: 'anh' },
        { id: 'parent', label: { vi: 'Bố mẹ', en: 'Parents' }, you: 'bố mẹ', me: 'con' },
      ],
      lines: [
        {
          id: '3w5e31', occasion: 'morning', audiences: ['colleague', 'crush'],
          text: 'Mong {you} vừa ngồi xuống đã nghe câu hỏi dễ thương nhất buổi sáng: “Trưa nay ăn gì?”',
          gloss: 'Hope the first thing you hear at your desk is the sweetest question of the morning: “What’s for lunch?”',
        },
        {
          id: 'iav7v0', occasion: 'morning', audiences: ['crush', 'lover'],
          text: '{You} cứ từ từ tỉnh ngủ. Phần nhớ {you} từ sáng sớm đã có {me} làm thay rồi.',
          gloss: 'Take your time waking up. The missing-you part has been covered since early morning, by me.',
        },
        {
          id: '1podz2b', occasion: 'morning', audiences: ['colleague'],
          text: 'Mong laptop sáng nay mở lên ngoan ngoãn, không tranh thủ cập nhật đúng lúc {you} cần tỏ ra chuyên nghiệp.',
          gloss: 'May your laptop boot up nicely today, and not start an update right when you need to look professional.',
        },
        {
          id: 'z10grj', occasion: 'monday', audiences: ['parent', 'lover'],
          text: 'Đầu tuần bận mấy cũng nhớ ăn đúng bữa nha. {Me} không ở cạnh nhắc hoài được nên gửi câu này đứng canh {you}.',
          gloss: 'However busy the week starts, eat on time. I can’t be there to keep reminding you, so this message stands guard.',
        },
        {
          id: 'r8krpa', occasion: 'monday', audiences: ['colleague'],
          text: 'Mong cuộc họp của {you} hôm nay ngắn đến mức chiếc bánh quy trên bàn còn chưa kịp mềm.',
          gloss: 'May today’s meeting be so short the cookie on the table doesn’t even go soft.',
        },
        {
          id: '1cjfax3', occasion: 'monday', audiences: ['crush', 'colleague', 'lover'],
          text: '{You} thắng được cái báo thức sáng thứ Hai là đã dẫn trước cả tuần 1-0 rồi đó.',
          gloss: 'Beat the Monday alarm and you’re already 1-0 up on the whole week.',
        },
        {
          id: 'l8jv9f', occasion: 'payday', audiences: ['colleague', 'crush'],
          text: 'Lương về rồi, {you} nhớ chụp màn hình làm kỷ niệm. Vài hôm nữa mở lại còn có tư liệu chứng minh mình từng giàu.',
          gloss: 'Payday! Take a screenshot as a souvenir. In a few days it’ll be proof you were once rich.',
        },
        {
          id: 'ooiatw', occasion: 'payday', audiences: ['lover', 'crush'],
          text: 'Lương về, {me} không cần quà đâu. {You} để dành mua thứ {you} thích, thấy {you} vui là phần lời của {me} rồi.',
          gloss: 'Payday, and I don’t need a gift. Buy something you like. Seeing you happy is my share of the profit.',
        },
        {
          id: '1vkd8qg', occasion: 'payday', audiences: ['colleague', 'parent'],
          text: 'Tiền tự thưởng của {you} không cần hội đồng phê duyệt. Niềm vui nhỏ thôi mà, ký cái rẹt nha.',
          gloss: 'Treating yourself needs no board approval. It’s a small joy, just sign it off.',
        },
        {
          id: '186w0a6', occasion: 'flirt', audiences: ['crush', 'lover'],
          text: 'Điện thoại còn 5% thì cần sạc. {Me} gặp {you} năm phút là đầy pin, công nghệ này hơi bị đỉnh.',
          gloss: 'A phone at 5% needs a charger. Five minutes with you and I’m at 100%. Pretty great tech.',
        },
        {
          id: '6duexc', occasion: 'flirt', audiences: ['colleague', 'crush'],
          text: 'Hộp cơm {me} có món mặn, món xào, thiếu mỗi người ngồi đối diện. {You} bổ sung giúp cho đủ mâm nha.',
          gloss: 'My lunchbox has a main and a stir-fry, just missing someone across the table. Mind filling that seat?',
        },
        {
          id: '1o60tvz', occasion: 'flirt', audiences: ['lover', 'crush'],
          text: 'Wi-Fi yếu thì nhập lại mật khẩu. Còn tín hiệu từ {you} yếu quá, {me} phải đứng gần thêm chút mới bắt được.',
          gloss: 'Weak Wi-Fi, you re-enter the password. Your signal’s weak too, so I’ll have to stand a bit closer.',
        },
      ],
    },
    copy: {
      en: {
        tagline: 'A jar of 1,008 Vietnamese wishes, pickup lines and captions. Pick who it is for, shake, and the pronouns come out right.',
        hardware: 'phone browsers, installable as an app',
        facts: [
          '28 occasions, from good morning and payday to birthdays, weddings and Lunar New Year. Upcoming holidays, lunar ones included, sit one tap away.',
          'Vietnamese changes its words for you and I with every relationship. Pick the recipient and Wishjar fills them in. Type your own or swap them.',
          'Copy it, share it to Zalo or Messenger, or save a 1080×1350 notebook-page card. AI buttons rewrite a line three ways: funnier, shorter, sweeter, more polite or as a poem.',
          'No account. It works offline once loaded, because the whole library ships with the app. Only the AI rewrite calls a server, behind daily limits.',
        ],
      },
      vi: {
        tagline: 'Hũ 1.008 lời chúc, câu thả thính, caption tiếng Việt. Chọn gửi cho ai, lắc một cái là có câu đúng xưng hô.',
        hardware: 'điện thoại, cài được như app',
        facts: [
          '28 dịp, từ chào buổi sáng, lương về tới sinh nhật, đám cưới, Tết. Ngày lễ sắp tới, tính cả lịch âm, nằm sẵn ngay dưới hũ.',
          'Gửi crush, sếp hay bố mẹ thì mỗi người một cách xưng hô. Chọn người nhận là app điền sẵn, muốn gọi khác thì gõ lại hoặc đảo chiều.',
          'Sao chép, gửi qua Zalo, Messenger hoặc tạo ảnh 1080×1350 kiểu trang vở. Nhờ AI chỉnh cho vui hơn, ngắn hơn, ngọt hơn, lễ phép hơn hay thành thơ, mỗi lần ra ba bản.',
          'Không cần tài khoản. Tải một lần là mất mạng vẫn lắc được, vì cả thư viện nằm sẵn trong app. Chỉ phần AI chỉnh câu mới gọi server, có giới hạn mỗi ngày.',
        ],
      },
    },
  },
  {
    id: 'glance',
    name: 'Glance',
    status: 'shipped',
    version: 'v0.1.0',
    platforms: ['macOS 13+'],
    stack: ['Swift', 'SwiftUI'],
    license: 'MIT',
    category: 'UtilitiesApplication',
    hotkeys: [
      { keys: ['⌃', '⌥', 'T'], action: { en: 'Translate the selection', vi: 'Dịch đoạn đang chọn' } },
      { keys: ['⌃', '⌥', '⏎'], action: { en: 'Replace it with the translation', vi: 'Thay bằng bản dịch' } },
    ],
    links: {
      repo: 'https://github.com/nguyenlephong/glance',
      download: 'https://github.com/nguyenlephong/glance/releases',
      docs: 'https://github.com/nguyenlephong/glance#readme',
    },
    glanceDemo: {
      windowTitle: 'Mail',
      parts: ['Hi team, please ', 0, ' before Friday. The new sync ships ', 1, ', so we can ', 2, '.'],
      phrases: [
        { source: 'review the release notes', target: 'xem lại ghi chú phát hành' },
        { source: 'behind a feature flag', target: 'sau một feature flag' },
        { source: 'turn it off without a new build', target: 'tắt nó đi mà không cần build mới' },
      ],
    },
    copy: {
      en: {
        tagline: 'Select text in any Mac app and press one shortcut to read it in the other language.',
        hardware: 'Apple Silicon and Intel',
        facts: [
          'Works in Safari, Mail, Slack, VS Code and other apps. The translation shows up next to the cursor.',
          'English to Vietnamese or back. You pick the direction in Settings.',
          'Lives in the menu bar, no Dock icon. The download is under 1\u00a0MB.',
          'The text you select goes only to the translation engine (Google Translate by default). Glance has no server of its own.',
        ],
      },
      vi: {
        tagline: 'Bôi đen chữ ở app nào trên Mac, bấm một phím tắt là có bản dịch.',
        hardware: 'Apple Silicon và Intel',
        facts: [
          'Dùng được trong Safari, Mail, Slack, VS Code và các app khác. Bản dịch hiện ngay cạnh con trỏ.',
          'Dịch Anh sang Việt hoặc ngược lại, đổi chiều trong Settings.',
          'Nằm trên menu bar, không chiếm chỗ ở Dock. File tải về chưa tới 1\u00a0MB.',
          'Chữ bạn chọn chỉ đi tới engine dịch (mặc định là Google Translate). Glance không có server riêng.',
        ],
      },
    },
  },
]

const AN_GI_ORIGIN = 'https://angiday.startup.id.vn'

/** Live dish page on Ăn Gì for the reel's result, tagged so the app can tell demo visits apart. */
export function anGiDishUrl(slug: string, locale: AppsCopyLocale): string {
  const path = locale === 'vi' ? `/an/${slug}` : `/en/eat/${slug}`
  return `${AN_GI_ORIGIN}${path}?${AN_GI_UTM}&utm_content=apps_demo_${locale}`
}

const WISHJAR_ORIGIN = 'https://wishjar.startup.id.vn'
const WISHJAR_UTM = 'utm_source=nguyenlephong.github.io&utm_medium=apps_page&utm_campaign=wishjar_launch'

/** The same wish, recipient and occasion on live Wishjar (it reads o, a and w from the query). */
export function wishjarUrl(line: Pick<WishDemoLine, 'id' | 'occasion'>, audience: string, locale: AppsCopyLocale): string {
  const query = new URLSearchParams({ o: line.occasion, a: audience, w: line.id })
  return `${WISHJAR_ORIGIN}/?${query}&${WISHJAR_UTM}&utm_content=apps_demo_${locale}`
}

/** Fill Wishjar's {you}/{me} slots, keeping the capital letter of {You}/{Me}. Returns text and pronoun parts. */
export function personalizeWish(text: string, you: string, me: string): { text: string; pronoun: boolean }[] {
  return text.split(/(\{(?:you|me)\})/i).filter(Boolean).map((part) => {
    const match = /^\{(you|me)\}$/i.exec(part)
    if (!match) return { text: part, pronoun: false }
    const word = match[1].toLowerCase() === 'you' ? you : me
    const upper = match[1][0] === match[1][0].toUpperCase()
    return { text: upper ? word[0].toUpperCase() + word.slice(1) : word, pronoun: true }
  })
}

export function appsCopyLocale(contentLocale: string): AppsCopyLocale {
  return contentLocale === 'vi' ? 'vi' : 'en'
}
