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
  license: string
  // schema.org applicationCategory for the JSON-LD.
  category: string
  // Clean public URL for the JSON-LD; links.site carries the UTM-tagged one.
  homepage?: string
  hotkeys: { keys: string[]; action: Record<AppsCopyLocale, string> }[]
  links: AppLinks
  dishes?: DishDemo[]
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

export function appsCopyLocale(contentLocale: string): AppsCopyLocale {
  return contentLocale === 'vi' ? 'vi' : 'en'
}
