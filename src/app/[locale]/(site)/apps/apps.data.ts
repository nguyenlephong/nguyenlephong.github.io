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
  // Per-locale overrides, e.g. the English entry point of a web app.
  links?: AppLinks
  screenshotAlt?: string
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
  visual?: 'glance'
  screenshot?: { path: string; width: number; height: number }
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
}

export const appsPageCopy: Record<AppsCopyLocale, AppsPageCopy> = {
  en: {
    title: 'Useful apps',
    sub: 'I build small tools that get repeated daily tasks done faster, at work and outside it.',
    back: '← Back to CV',
    status: { shipped: 'Shipped', beta: 'Beta', wip: 'In progress' },
    hotkeys: 'Shortcuts',
    links: { site: 'Open the app', article: 'Read the story', repo: 'Source', download: 'Download', docs: 'Docs' },
    labNote: 'The rest of my code is on GitHub.',
    github: 'See them on GitHub',
  },
  vi: {
    title: 'Ứng dụng hữu ích',
    sub: 'Tôi tự xây công cụ bổ trợ để làm nhanh những việc lặp lại mỗi ngày, trong công việc lẫn đời sống.',
    back: '← Quay lại CV',
    status: { shipped: 'Đã phát hành', beta: 'Beta', wip: 'Đang làm' },
    hotkeys: 'Phím tắt',
    links: { site: 'Mở app', article: 'Đọc bài viết', repo: 'Source code', download: 'Tải về', docs: 'Hướng dẫn' },
    labNote: 'Code các dự án khác tôi để trên GitHub.',
    github: 'Xem trên GitHub',
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
      site: `https://angiday.startup.id.vn/?${AN_GI_UTM}&utm_content=apps_card_vi`,
      article: '/blog/perspectives/an-gi-hom-nay-an-gi-o-dau',
    },
    screenshot: {
      path: '/blogs/an-gi-hom-nay-an-gi-o-dau/pick-a-place-and-get-directions.webp',
      width: 1440,
      height: 960,
    },
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
        links: { site: `https://angiday.startup.id.vn/en?${AN_GI_UTM}&utm_content=apps_card_en` },
        screenshotAlt: 'Two screens of the app: the home screen asking what to eat today, and a hotpot place with its address and a directions button.',
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
        screenshotAlt: 'Hai màn hình Ăn Gì: trang chủ hỏi hôm nay ăn gì, và một quán lẩu kèm địa chỉ, nút chỉ đường.',
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
    visual: 'glance',
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

export function appsCopyLocale(contentLocale: string): AppsCopyLocale {
  return contentLocale === 'vi' ? 'vi' : 'en'
}
