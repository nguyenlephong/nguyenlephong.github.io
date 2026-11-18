'use client'

import { createContext, useContext } from 'react'

/**
 * /admin copy in English and Vietnamese. A typed dictionary inside the admin
 * module, not the site's message catalogs, so public routes and the
 * client-message scope contracts never see it. Each language is written on its
 * own, not translated line by line.
 */
import type { AdminLocale } from './admin-locale'

export type { AdminLocale }

type Count = (n: string) => string

export interface AdminDictionary {
  brandArea: string
  signOut: string
  language: string
  theme: { label: string; light: string; system: string; dark: string }
  gate: {
    opening: string
    title: string
    claim: (posts: string) => string
    password: string
    submit: string
    wrong: string
    noCrypto: string
  }
  topology: {
    label: string
    root: (posts: string, branches: string) => string
    readsPosts: (reads: string, posts: string) => string
    posts: Count
    note: (share: string, perPost: string) => string
    nodeLabel: (title: string, reads: string, share: string, perPost: string) => string
  }
  hero: {
    unreadPill: Count
    unreadLink: string
    allRead: string
    readsLabel: Count
    claim: Count
    loadingClaim: string
    loadingLabel: string
    loadingStatus: string
    shares: (shares: string, reactions: string) => string
    lead: (category: string, share: string) => string
    source: string
    refreshingNow: string
    lastFailed: string
    loadedAt: string
    truncated: Count
    errorTitle: string
    errorNotConfigured: string
    errorRequest: string
    refresh: string
    refreshing: string
    loading: string
    tryAgain: string
    findPost: string
  }
  top: { title: string; note: (n: string) => string; empty: string; readsSuffix: string }
  reactions: { title: string; total: Count; none: string; like: string; love: string; insightful: string; clap: string }
  chart: {
    title: string
    note: string
    label: Count
    tipReads: Count
    caption: (days: string, recent: string, older: string) => string
    bandsTitle: string
    bandNone: string
    bandRange: (from: string, to: string) => string
    bandAtLeast: Count
  }
  love: {
    title: string
    note: string
    neverTitle: string
    neverMeta: Count
    neverEmpty: string
    showNewest: Count
    showAll: Count
    leastTitle: string
    leastMeta: string
    leastEmpty: string
    reads: Count
    notInCatalog: string
  }
  table: {
    title: string
    note: (published: string, unlisted: number) => string
    searchLabel: string
    searchPlaceholder: string
    noReads: string
    sort: string
    category: string
    all: string
    columns: { title: string; category: string; date: string; views: string; shares: string; reactionTotal: string }
    sortNames: { title: string; category: string; date: string; views: string; shares: string; reactionTotal: string }
    textAsc: string
    textDesc: string
    numberAsc: string
    numberDesc: string
    status: (from: string, to: string, total: string, filtered: boolean) => string
    noMatch: string
    nothing: string
    clear: string
    caption: (sort: string, page: string, pages: string) => string
    noDate: string
    pages: string
    previous: string
    next: string
    page: Count
    rows: string
  }
}

const en: AdminDictionary = {
  brandArea: 'admin',
  signOut: 'Sign out',
  language: 'Language',
  theme: { label: 'Theme', light: 'Light theme', system: 'System theme', dark: 'Dark theme' },
  gate: {
    opening: 'Opening the dashboard…',
    title: 'What people read',
    claim: (posts) => `Reads, shares and reactions for all ${posts} published posts, live from Firestore.`,
    password: 'Password',
    submit: 'Open the dashboard',
    wrong: 'That password is not right. Try again.',
    noCrypto: 'This browser cannot check the password (WebCrypto needs HTTPS or localhost).',
  },
  topology: {
    label: 'Reads by category',
    root: (posts, branches) => `${posts} posts in ${branches} branches`,
    readsPosts: (reads, posts) => `${reads} reads · ${posts} posts`,
    posts: (n) => `${n} posts`,
    note: (share, perPost) => `${share} of reads, ${perPost} per post`,
    nodeLabel: (title, reads, share, perPost) =>
      `${title}: ${reads} reads, ${share} of all, ${perPost} per post. Show these posts.`,
  },
  hero: {
    unreadPill: (n) => `${n} published posts have no reader yet`,
    unreadLink: 'See them',
    allRead: 'Every published post has a reader',
    readsLabel: (n) => `${n} reads`,
    claim: (n) => `reads across ${n} published posts`,
    loadingClaim: 'reads across every published post',
    loadingLabel: 'Loading reads',
    loadingStatus: 'Reading every counter from Firestore…',
    shares: (shares, reactions) => `${shares} shares and ${reactions} reactions`,
    lead: (category, share) => `${category} carries ${share} of all reads`,
    source: 'All-time counters from Firestore.',
    refreshingNow: 'Refreshing now.',
    lastFailed: 'The last refresh failed, these are from',
    loadedAt: 'Loaded at',
    truncated: (n) => `Firestore returned the first ${n} counters only, so totals may be low.`,
    errorTitle: 'The counters did not load',
    errorNotConfigured: 'Firestore is not configured in this build, so there are no counters to read.',
    errorRequest: 'Could not read the counters from Firestore. Check the connection, then try again.',
    refresh: 'Refresh',
    refreshing: 'Refreshing',
    loading: 'Loading',
    tryAgain: 'Try again',
    findPost: 'Find a post',
  },
  top: {
    title: 'What people read most',
    note: (n) => `Top ${n} by reads, all time`,
    empty: 'Nothing has been read yet. The ten most read posts will line up here.',
    readsSuffix: 'reads',
  },
  reactions: {
    title: 'How readers react',
    total: (n) => `${n} reactions`,
    none: 'No reactions yet',
    like: 'Like',
    love: 'Love',
    insightful: 'Insightful',
    clap: 'Clap',
  },
  chart: {
    title: 'Do newer posts get read?',
    note: 'Every published post by publish date and all-time reads. Pick a dot to find it in the table.',
    label: (n) =>
      `Reads by publish date, one dot per post, ${n} posts. Use the left and right arrow keys to step through posts, Enter to show one in the table.`,
    tipReads: (n) => `${n} reads`,
    caption: (days, recent, older) =>
      `Posts from the last ${days} days (shaded) average ${recent} reads so far, older ones ${older}. Reads are all time, so older posts have had longer to collect them.`,
    bandsTitle: 'How many posts reach each band',
    bandNone: 'No reads',
    bandRange: (from, to) => `${from} to ${to}`,
    bandAtLeast: (n) => `${n} or more`,
  },
  love: {
    title: 'Posts still waiting for a reader',
    note: 'Published posts nobody has opened, and the quietest ones',
    neverTitle: 'No reader yet',
    neverMeta: (n) => `${n} posts, newest first`,
    neverEmpty: 'Every published post has at least one read.',
    showNewest: (n) => `Show the newest ${n}`,
    showAll: (n) => `Show all ${n}`,
    leastTitle: 'Fewest reads',
    leastMeta: 'among posts read at least once',
    leastEmpty: 'No post has a read yet.',
    reads: (n) => (n === '1' ? '1 read' : `${n} reads`),
    notInCatalog: 'not in the catalog',
  },
  table: {
    title: 'Every post',
    note: (published, unlisted) =>
      `${published} published posts${unlisted > 0 ? `, plus ${unlisted} counter not in the catalog` : ''}`,
    searchLabel: 'Search titles',
    searchPlaceholder: 'Search a title or slug',
    noReads: 'No reads yet',
    sort: 'Sort',
    category: 'Category',
    all: 'All',
    columns: { title: 'Post', category: 'Category', date: 'Published', views: 'Reads', shares: 'Shares', reactionTotal: 'Reactions' },
    sortNames: { title: 'Title', category: 'Category', date: 'Publish date', views: 'Reads', shares: 'Shares', reactionTotal: 'Reactions' },
    textAsc: 'A to Z',
    textDesc: 'Z to A',
    numberAsc: 'low to high',
    numberDesc: 'high to low',
    status: (from, to, total, filtered) => `${from} to ${to} of ${total}${filtered ? ' matching' : ''}`,
    noMatch: 'No post matches these filters.',
    nothing: 'Nothing here.',
    clear: 'Clear the filters',
    caption: (sort, page, pages) => `Posts, sorted by ${sort}, page ${page} of ${pages}`,
    noDate: 'none',
    pages: 'Table pages',
    previous: 'Previous',
    next: 'Next',
    page: (n) => `Page ${n}`,
    rows: 'Rows',
  },
}

const vi: AdminDictionary = {
  brandArea: 'admin',
  signOut: 'Đăng xuất',
  language: 'Ngôn ngữ',
  theme: { label: 'Giao diện', light: 'Giao diện sáng', system: 'Theo hệ thống', dark: 'Giao diện tối' },
  gate: {
    opening: 'Đang mở dashboard…',
    title: 'Mọi người đang đọc gì',
    claim: (posts) => `Lượt đọc, lượt share và reaction của ${posts} bài đã đăng, lấy thẳng từ Firestore.`,
    password: 'Mật khẩu',
    submit: 'Mở dashboard',
    wrong: 'Sai mật khẩu rồi, thử lại nhé.',
    noCrypto: 'Trình duyệt này không kiểm tra được mật khẩu (WebCrypto cần HTTPS hoặc localhost).',
  },
  topology: {
    label: 'Lượt đọc theo category',
    root: (posts, branches) => `${posts} bài, ${branches} nhánh`,
    readsPosts: (reads, posts) => `${reads} lượt đọc · ${posts} bài`,
    posts: (n) => `${n} bài`,
    note: (share, perPost) => `chiếm ${share} lượt đọc, ${perPost} lượt mỗi bài`,
    nodeLabel: (title, reads, share, perPost) =>
      `${title}: ${reads} lượt đọc, chiếm ${share}, trung bình ${perPost} mỗi bài. Xem các bài này.`,
  },
  hero: {
    unreadPill: (n) => `${n} bài đã đăng chưa có ai đọc`,
    unreadLink: 'Xem',
    allRead: 'Bài nào cũng đã có người đọc',
    readsLabel: (n) => `${n} lượt đọc`,
    claim: (n) => `lượt đọc trên ${n} bài đã đăng`,
    loadingClaim: 'lượt đọc trên tất cả bài đã đăng',
    loadingLabel: 'Đang tải lượt đọc',
    loadingStatus: 'Đang lấy số liệu từ Firestore…',
    shares: (shares, reactions) => `${shares} lượt share và ${reactions} reaction`,
    lead: (category, share) => `${category} chiếm ${share} tổng lượt đọc`,
    source: 'Số liệu cộng dồn từ trước tới nay, lấy từ Firestore.',
    refreshingNow: 'Đang làm mới.',
    lastFailed: 'Lần làm mới vừa rồi bị lỗi, đây là số liệu lúc',
    loadedAt: 'Cập nhật lúc',
    truncated: (n) => `Firestore chỉ trả về ${n} bản ghi đầu tiên nên tổng có thể bị thiếu.`,
    errorTitle: 'Không tải được số liệu',
    errorNotConfigured: 'Bản build này chưa cấu hình Firestore nên chưa có số liệu để đọc.',
    errorRequest: 'Không đọc được số liệu từ Firestore. Kiểm tra kết nối rồi thử lại.',
    refresh: 'Làm mới',
    refreshing: 'Đang làm mới',
    loading: 'Đang tải',
    tryAgain: 'Thử lại',
    findPost: 'Tìm bài',
  },
  top: {
    title: 'Bài được đọc nhiều nhất',
    note: (n) => `Top ${n} theo lượt đọc, tính từ trước tới nay`,
    empty: 'Chưa có bài nào được đọc. Khi có, mười bài đọc nhiều nhất sẽ hiện ở đây.',
    readsSuffix: 'lượt đọc',
  },
  reactions: {
    title: 'Người đọc thả reaction gì',
    total: (n) => `${n} reaction`,
    none: 'Chưa có reaction nào',
    like: 'Like',
    love: 'Love',
    insightful: 'Insightful',
    clap: 'Clap',
  },
  chart: {
    title: 'Bài mới có ai đọc không?',
    note: 'Mỗi chấm là một bài, đặt theo ngày đăng và tổng lượt đọc. Bấm vào chấm để tìm bài đó trong bảng.',
    label: (n) =>
      `Lượt đọc theo ngày đăng, mỗi chấm là một bài, có ${n} bài. Dùng phím mũi tên trái phải để đi qua từng bài, Enter để mở bài đó trong bảng.`,
    tipReads: (n) => `${n} lượt đọc`,
    caption: (days, recent, older) =>
      `Bài đăng trong ${days} ngày gần đây (vùng tô màu) có trung bình ${recent} lượt đọc, bài cũ hơn là ${older}. Đây là tổng từ trước tới nay, nên bài cũ có nhiều thời gian hơn để gom lượt đọc.`,
    bandsTitle: 'Số bài theo mức lượt đọc',
    bandNone: 'Chưa có lượt đọc',
    bandRange: (from, to) => `Từ ${from} đến ${to}`,
    bandAtLeast: (n) => `Từ ${n} trở lên`,
  },
  love: {
    title: 'Bài vẫn đang chờ người đọc',
    note: 'Bài đã đăng mà chưa ai mở, và những bài ít người đọc nhất',
    neverTitle: 'Chưa ai đọc',
    neverMeta: (n) => `${n} bài, mới nhất trước`,
    neverEmpty: 'Bài nào cũng có ít nhất một lượt đọc.',
    showNewest: (n) => `Chỉ hiện ${n} bài mới nhất`,
    showAll: (n) => `Xem cả ${n} bài`,
    leastTitle: 'Ít lượt đọc nhất',
    leastMeta: 'trong các bài đã có người đọc',
    leastEmpty: 'Chưa bài nào có lượt đọc.',
    reads: (n) => `${n} lượt đọc`,
    notInCatalog: 'không có trong catalog',
  },
  table: {
    title: 'Tất cả bài viết',
    note: (published, unlisted) =>
      `${published} bài đã đăng${unlisted > 0 ? `, thêm ${unlisted} bộ đếm không có trong catalog` : ''}`,
    searchLabel: 'Tìm bài',
    searchPlaceholder: 'Tìm theo tiêu đề hoặc slug',
    noReads: 'Chưa có lượt đọc',
    sort: 'Sắp xếp',
    category: 'Category',
    all: 'Tất cả',
    columns: { title: 'Bài viết', category: 'Category', date: 'Ngày đăng', views: 'Lượt đọc', shares: 'Share', reactionTotal: 'Reaction' },
    sortNames: { title: 'Tiêu đề', category: 'Category', date: 'Ngày đăng', views: 'Lượt đọc', shares: 'Lượt share', reactionTotal: 'Reaction' },
    textAsc: 'A đến Z',
    textDesc: 'Z đến A',
    numberAsc: 'thấp lên cao',
    numberDesc: 'cao xuống thấp',
    status: (from, to, total, filtered) => `${from} đến ${to} trong ${total} bài${filtered ? ' khớp bộ lọc' : ''}`,
    noMatch: 'Không có bài nào khớp bộ lọc.',
    nothing: 'Không có gì ở đây.',
    clear: 'Xoá bộ lọc',
    caption: (sort, page, pages) => `Danh sách bài, sắp theo ${sort}, trang ${page} trên ${pages}`,
    noDate: 'không có',
    pages: 'Phân trang',
    previous: 'Trước',
    next: 'Sau',
    page: (n) => `Trang ${n}`,
    rows: 'Số dòng',
  },
}

export const ADMIN_DICTIONARIES: Record<AdminLocale, AdminDictionary> = { en, vi }

export interface AdminFormat {
  number: (value: number) => string
  /** 9,999 in full, then 12.3K (12,3K in Vietnamese). */
  compact: (value: number) => string
  percent: (share: number) => string
  date: (day: string | null) => string
  time: (date: Date) => string
  month: (time: number) => string
}

const INTL_LOCALE: Record<AdminLocale, string> = { en: 'en-GB', vi: 'vi-VN' }

export function createAdminFormat(locale: AdminLocale): AdminFormat {
  const tag = INTL_LOCALE[locale]
  const numberFormat = new Intl.NumberFormat(locale === 'en' ? 'en-US' : tag)
  const oneDecimal = new Intl.NumberFormat(locale === 'en' ? 'en-US' : tag, { maximumFractionDigits: 1 })
  const dateFormat = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  const timeFormat = new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const monthFormat = new Intl.DateTimeFormat(tag, { month: 'short', year: 'numeric', timeZone: 'UTC' })
  const number = (value: number) => numberFormat.format(value)
  return {
    number,
    compact: (value) => (value < 10_000 ? number(value) : `${oneDecimal.format(value / 1000)}K`),
    percent: (share) => (share > 0 && share < 0.01 ? '<1%' : `${Math.round(share * 100)}%`),
    date: (day) => {
      if (!day) return ''
      const date = new Date(`${day}T00:00:00Z`)
      return Number.isNaN(date.getTime()) ? day : dateFormat.format(date)
    },
    time: (date) => timeFormat.format(date),
    month: (time) => monthFormat.format(time),
  }
}

export interface AdminText {
  locale: AdminLocale
  t: AdminDictionary
  fmt: AdminFormat
  setLocale: (locale: AdminLocale) => void
}

export const AdminTextContext = createContext<AdminText>({
  locale: 'en',
  t: en,
  fmt: createAdminFormat('en'),
  setLocale: () => undefined,
})

export const useAdminText = () => useContext(AdminTextContext)
