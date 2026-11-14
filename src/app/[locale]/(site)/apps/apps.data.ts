// Public apps listed on /apps, with copy per authored locale (en, vi). Other locales read the en copy,
// matching STATIC_PAGE_SEO_POLICY.apps. E-Slang is unlisted on purpose (private, Vietnamese-only);
// its route /apps/english keeps working but nothing public links to it.

export type AppsCopyLocale = 'en' | 'vi'
export type AppStatus = 'shipped' | 'beta' | 'wip'

export interface AppCopy {
  tagline: string
  hardware: string
  facts: string[]
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
  hotkeys: { keys: string[]; action: Record<AppsCopyLocale, string> }[]
  links: { repo: string; download?: string; docs?: string }
  visual: 'glance'
  copy: Record<AppsCopyLocale, AppCopy>
}

export interface AppsPageCopy {
  title: string
  sub: string
  back: string
  status: Record<AppStatus, string>
  hotkeys: string
  links: { repo: string; download: string; docs: string }
  labNote: string
  github: string
}

export const appsPageCopy: Record<AppsCopyLocale, AppsPageCopy> = {
  en: {
    title: 'Small tools I built for my own work',
    sub: 'Each one started from a problem I kept hitting. The source is on GitHub.',
    back: '← Back to CV',
    status: { shipped: 'Shipped', beta: 'Beta', wip: 'In progress' },
    hotkeys: 'Shortcuts',
    links: { repo: 'Source', download: 'Download', docs: 'Docs' },
    labNote: 'I add an app here only after I have used it for real.',
    github: 'All repositories on GitHub',
  },
  vi: {
    title: 'Công cụ nhỏ tôi tự làm để dùng khi làm việc',
    sub: 'Mỗi công cụ bắt đầu từ một việc tôi gặp lặp lại nhiều lần. Source code để trên GitHub.',
    back: '← Quay lại CV',
    status: { shipped: 'Đã phát hành', beta: 'Beta', wip: 'Đang làm' },
    hotkeys: 'Phím tắt',
    links: { repo: 'Source code', download: 'Tải về', docs: 'Hướng dẫn' },
    labNote: 'Tôi chỉ đưa app lên đây sau khi đã dùng thật một thời gian.',
    github: 'Các repo khác trên GitHub',
  },
}

export const apps: AppShowcaseItem[] = [
  {
    id: 'glance',
    name: 'Glance',
    status: 'shipped',
    version: 'v0.1.0',
    platforms: ['macOS 13+'],
    stack: ['Swift', 'SwiftUI'],
    license: 'MIT',
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
        tagline: 'Translate selected text in any macOS app with one hotkey.',
        hardware: 'Apple Silicon and Intel',
        facts: [
          'Select text in Safari, Mail, Slack, VS Code or any other app and the translation appears next to the cursor.',
          'Translates between English and Vietnamese in both directions; the direction is set in Settings.',
          'Runs from the menu bar with no Dock icon. The download is under 1\u00a0MB.',
          'Selected text goes only to the translation engine, Google Translate by default. Glance has no server of its own.',
        ],
      },
      vi: {
        tagline: 'Dịch đoạn chữ đang chọn trong mọi app macOS chỉ với một phím tắt.',
        hardware: 'Apple Silicon và Intel',
        facts: [
          'Bôi đen chữ trong Safari, Mail, Slack, VS Code hay app nào cũng được, bản dịch hiện ngay cạnh con trỏ.',
          'Dịch hai chiều Anh và Việt, chọn chiều dịch trong phần Settings.',
          'Chạy trên menu bar, không có icon ở Dock. File tải về dưới 1\u00a0MB.',
          'Chữ đang chọn chỉ được gửi tới engine dịch, mặc định là Google Translate. Glance không có server riêng.',
        ],
      },
    },
  },
]

export function appsCopyLocale(contentLocale: string): AppsCopyLocale {
  return contentLocale === 'vi' ? 'vi' : 'en'
}
