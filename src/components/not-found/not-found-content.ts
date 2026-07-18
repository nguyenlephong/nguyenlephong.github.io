import type { Locale } from "@/i18n/routing";
import type { NotFoundSurface, RecoveryTarget } from "./not-found-routing";

export type NotFoundCopy = {
  metaTitle: string;
  eyebrow: string;
  title: string;
  descriptions: Record<NotFoundSurface, string>;
  recoveryLabel: string;
  actions: Record<RecoveryTarget, string>;
  languageTitle: string;
  languageDescription: string;
};

const contentByLocale: Record<Locale, NotFoundCopy> = {
  en: {
    metaTitle: "Page not found | Nguyen Le Phong",
    eyebrow: "Page not found",
    title: "This page is no longer here",
    descriptions: {
      blog: "This article may not be available in the language you chose. The blog archive is a quiet place to continue browsing.",
      notes:
        "This note may not be available in the language you chose. You can return to the notes archive and continue from there.",
      other:
        "The address may be old, incomplete, or no longer part of this site. The links below will take you somewhere useful."
    },
    recoveryLabel: "Ways to continue",
    actions: {
      home: "Go to the home page",
      blog: "Browse the blog",
      notes: "Browse the notes"
    },
    languageTitle: "Choose another language",
    languageDescription:
      "Each language link returns to a stable home page, so you can continue without another broken path."
  },
  vi: {
    metaTitle: "Không tìm thấy trang | Nguyen Le Phong",
    eyebrow: "Không tìm thấy trang",
    title: "Trang này hiện không còn ở đây",
    descriptions: {
      blog: "Bài viết này có thể chưa có ở ngôn ngữ bạn đã chọn. Bạn có thể quay lại trang blog để tiếp tục đọc.",
      notes:
        "Ghi chú này có thể chưa có ở ngôn ngữ bạn đã chọn. Trang notes sẽ giúp bạn tiếp tục từ một đường dẫn ổn định.",
      other:
        "Địa chỉ này có thể đã cũ, chưa đầy đủ hoặc không còn thuộc website. Những liên kết bên dưới sẽ đưa bạn về nơi phù hợp."
    },
    recoveryLabel: "Các hướng để tiếp tục",
    actions: {
      home: "Về trang chủ",
      blog: "Xem các bài blog",
      notes: "Xem các ghi chú"
    },
    languageTitle: "Chọn ngôn ngữ khác",
    languageDescription:
      "Mỗi lựa chọn sẽ đưa bạn về một trang chủ ổn định để tránh gặp thêm đường dẫn hỏng."
  },
  zh: {
    metaTitle: "找不到页面 | Nguyen Le Phong",
    eyebrow: "找不到页面",
    title: "这个页面目前不在这里",
    descriptions: {
      blog: "这篇文章可能还没有你所选择的语言版本。你可以回到博客归档，继续浏览其他内容。",
      notes:
        "这篇笔记可能还没有你所选择的语言版本。你可以回到笔记归档，从稳定的页面继续。",
      other:
        "这个地址可能已经过期、不完整，或不再属于本站。下面的链接可以带你回到可用的页面。"
    },
    recoveryLabel: "继续浏览",
    actions: {
      home: "返回首页",
      blog: "浏览博客",
      notes: "浏览笔记"
    },
    languageTitle: "选择其他语言",
    languageDescription:
      "每个语言链接都会返回稳定的首页，避免再次进入失效地址。"
  },
  ja: {
    metaTitle: "ページが見つかりません | Nguyen Le Phong",
    eyebrow: "ページが見つかりません",
    title: "このページは現在ここにありません",
    descriptions: {
      blog: "この記事は、選択した言語ではまだ公開されていない可能性があります。ブログ一覧から、ほかの記事を落ち着いて探せます。",
      notes:
        "このノートは、選択した言語ではまだ公開されていない可能性があります。ノート一覧の安定したページから続けられます。",
      other:
        "このアドレスは古い、不完全、または現在のサイトに存在しない可能性があります。下のリンクから利用できるページへ戻れます。"
    },
    recoveryLabel: "次に進む方法",
    actions: {
      home: "ホームへ戻る",
      blog: "ブログを見る",
      notes: "ノートを見る"
    },
    languageTitle: "別の言語を選ぶ",
    languageDescription:
      "各言語のリンクは安定したホームページへ戻るため、別の壊れたリンクを避けられます。"
  },
  ko: {
    metaTitle: "페이지를 찾을 수 없습니다 | Nguyen Le Phong",
    eyebrow: "페이지를 찾을 수 없습니다",
    title: "이 페이지는 현재 여기에 없습니다",
    descriptions: {
      blog: "이 글은 선택한 언어로 아직 제공되지 않을 수 있습니다. 블로그 목록으로 돌아가 다른 글을 천천히 살펴볼 수 있습니다.",
      notes:
        "이 노트는 선택한 언어로 아직 제공되지 않을 수 있습니다. 노트 목록의 안정적인 경로에서 계속 둘러볼 수 있습니다.",
      other:
        "주소가 오래되었거나 완전하지 않거나 현재 사이트에 없는 경로일 수 있습니다. 아래 링크에서 이용 가능한 페이지로 돌아갈 수 있습니다."
    },
    recoveryLabel: "계속 둘러보기",
    actions: {
      home: "홈으로 돌아가기",
      blog: "블로그 보기",
      notes: "노트 보기"
    },
    languageTitle: "다른 언어 선택",
    languageDescription:
      "각 언어 링크는 안정적인 홈으로 연결되어 또 다른 잘못된 경로를 피할 수 있습니다."
  },
  fr: {
    metaTitle: "Page introuvable | Nguyen Le Phong",
    eyebrow: "Page introuvable",
    title: "Cette page n’est plus disponible ici",
    descriptions: {
      blog: "Cet article n’est peut-être pas encore disponible dans la langue choisie. Les archives du blog permettent de poursuivre la lecture simplement.",
      notes:
        "Cette note n’est peut-être pas encore disponible dans la langue choisie. Vous pouvez revenir aux archives des notes et continuer depuis une page stable.",
      other:
        "Cette adresse est peut-être ancienne, incomplète ou absente du site actuel. Les liens ci-dessous vous ramèneront vers une page utile."
    },
    recoveryLabel: "Continuer la visite",
    actions: {
      home: "Revenir à l’accueil",
      blog: "Parcourir le blog",
      notes: "Parcourir les notes"
    },
    languageTitle: "Choisir une autre langue",
    languageDescription:
      "Chaque langue renvoie vers une page d’accueil stable afin d’éviter un autre lien incomplet."
  }
};

export function getNotFoundCopy(locale: Locale): NotFoundCopy {
  return contentByLocale[locale];
}
