import { studioFolders, studioNotes } from "./studio.data";
import type { StudioFolder, StudioNote } from "./studio.data";

type LocalizedStudioNote = Partial<Omit<StudioNote, "id" | "folderId" | "status" | "updatedAt">>;

const vietnameseFolders: Record<string, Pick<StudioFolder, "label" | "subtitle" | "groups">> = {
  "machine-bootstrap": {
    label: "Chuẩn bị máy mới",
    subtitle: "Những việc cần làm trước khi bắt đầu",
    groups: [
      {
        label: "Thiết lập công cụ AI",
        noteIds: ["ai-operating-system", "ai-driven-engineering-foundation", "antigravity-awesome-skills", "open-design"]
      },
      { label: "Thiết lập máy tính", noteIds: ["computer-baseline"] },
      { label: "Thiết lập dòng lệnh", noteIds: ["terminal-baseline"] }
    ]
  },
  "ai-learning": {
    label: "Học và làm việc cùng AI",
    subtitle: "Những chủ đề tôi sẽ tìm hiểu tiếp",
    groups: [
      {
        label: "Cách tổ chức công việc",
        noteIds: ["ai-operating-system", "ai-driven-engineering-foundation", "ai-system-engineering-roadmap"]
      },
      { label: "Multi-agent systems", noteIds: ["multi-agent-ai", "openhands", "crewai"] }
    ]
  },
  "design-tools": {
    label: "Công cụ thiết kế",
    subtitle: "Hỗ trợ AI tạo và rà soát giao diện",
    groups: [{ label: "Open Design", noteIds: ["open-design"] }]
  }
};

const vietnameseNotes: Record<string, LocalizedStudioNote> = {
  "ai-operating-system": {
    title: "Cách tôi phối hợp các công cụ AI",
    subtitle: "Phân vai NotebookLM, GPT, Claude, Codex và Antigravity cho việc tìm hiểu, phản biện và triển khai.",
    tags: ["Cách làm việc với AI", "NotebookLM", "GPT", "Claude", "Codex", "Antigravity", "Học mỗi ngày"],
    summary:
      "Ghi chú này nói rõ tôi giao việc gì cho từng công cụ AI, kiểm tra kết quả ở đâu và vì sao quyết định cuối cùng vẫn phải do mình chịu trách nhiệm.",
    sections: [
      {
        heading: "Nguyên tắc chung",
        body:
          "Có nhiều công cụ không giúp ích nếu tài liệu và bối cảnh bị rải khắp nơi. Tôi bắt đầu từ dữ kiện, làm rõ bài toán, chọn đúng công cụ, rà kỹ phần có rủi ro rồi lưu lại điều đáng dùng cho lần sau."
      },
      {
        heading: "Vai trò của từng công cụ",
        body:
          "Tôi dùng NotebookLM để đọc và đối chiếu tài liệu gốc; GPT để tìm hiểu và lên hướng làm; Claude để phản biện và gọt câu chữ; Codex để thay đổi code; Antigravity để làm prototype, UI flow, browser check và thử nghiệm multi-agent. Đây là cách phân vai thường dùng, không phải luật cứng."
      },
      {
        heading: "Học đều mỗi ngày",
        body:
          "Một ngày có ích nên để lại ít nhất một thứ tốt hơn hôm qua: một câu lệnh rõ hơn, danh sách kiểm tra dùng lại được, phần mã đã rà kỹ, quyết định sáng hơn hoặc ghi chú có nguồn. Tôi không cần dùng hết mọi công cụ; tôi cần lặp lại được cách chọn công cụ đúng."
      },
      {
        heading: "Hướng phát triển nghề nghiệp",
        body:
          "Tôi muốn đi sâu hơn vào kiến trúc phần mềm, cách dùng AI có trách nhiệm, dẫn dắt kỹ thuật, tư duy sản phẩm và giao tiếp rõ ràng. Những tài liệu hướng dẫn, ví dụ kiến trúc, bài viết công khai và bản thử tự động hoá nhỏ sẽ là bằng chứng thật cho quá trình đó."
      }
    ],
    commands: [
      {
        label: "Lên kế hoạch cho buổi sáng",
        command:
          "Hôm nay là [ngày]. Năng lượng hiện tại: [x]. Việc bắt buộc: [x]. Việc còn dang dở: [x]. Hãy giúp tôi chọn 3 kết quả quan trọng nhất, 1 cách làm với AI cần luyện, 1 việc nên hoãn, 1 việc cho sức khỏe hoặc nghề nghiệp, và chia thời gian thực tế trong ngày.",
        note: "Dùng trong dự án PhongOS / Life & Career."
      },
      {
        label: "Rà soát tuần mới",
        command:
          "Tình hình hiện tại của tôi: Công việc: [x]. Cuộc sống: [x]. Tài chính: [x]. Sức khỏe: [x]. Quan hệ: [x]. Học tập: [x]. Hãy làm một trang tổng hợp gồm: điều quan trọng lúc này, rủi ro, việc nên bỏ qua, quyết định cần đưa ra và hành động trong 7 ngày tới.",
        note: "Dùng vào Chủ nhật hoặc trước một tuần có nhiều việc đan xen."
      },
      {
        label: "Chọn công cụ phù hợp",
        command:
          "Tôi có việc này: [mô tả]. Hãy đề xuất thứ tự dùng NotebookLM, GPT, Claude, Codex và Antigravity. Nêu lý do, câu lệnh cho từng công cụ, giới hạn an toàn và tài liệu tôi nên lưu lại.",
        note: "Dùng khi đề bài quá rộng hoặc chưa biết nên bắt đầu bằng công cụ nào."
      }
    ],
    checklist: [
      {
        label: "Tạo các dự án riêng trong ChatGPT.",
        detail: "PhongOS, Engineering Leadership, Finance & Investment, Learning & Research, Writing / Personal Brand."
      },
      {
        label: "Tạo các sổ riêng trong NotebookLM.",
        detail: "Career Archive, Finance Library, Learning AI/Systems, Life Archive, Work Knowledge Base."
      },
      { label: "Lưu mẫu câu lệnh dùng lại cho GPT, Claude, Codex, Antigravity và NotebookLM." },
      { label: "Dành ít nhất một vòng học cùng AI trong mỗi ngày làm việc." },
      { label: "Mỗi tuần lưu lại một bài học hoặc tài liệu đáng dùng.", checked: true },
      {
        label: "Không đưa bí mật, khóa riêng, dữ liệu khách hàng hoặc dữ liệu nội bộ nhạy cảm vào công cụ AI cá nhân.",
        checked: true
      }
    ]
  },
  "ai-driven-engineering-foundation": {
    title: "Nền tảng kỹ thuật khi làm việc cùng AI",
    subtitle: "Bản đồ quyết định kỹ thuật từ lúc nhận việc đến khi hệ thống chạy thật.",
    tags: ["Nền tảng kỹ thuật", "Kiến trúc", "Dữ liệu", "Khả năng phục hồi", "Observability", "AI"],
    summary:
      "AI có thể viết mã nhanh, nhưng chất lượng kỹ thuật vẫn phụ thuộc vào câu hỏi đúng, đánh đổi rõ, tình huống hỏng được kiểm thử và người chịu trách nhiệm khi hệ thống vận hành.",
    sections: [
      {
        heading: "Vì sao phần này quan trọng",
        body:
          "Bước tiếp theo không phải là xin AI viết thêm code. Tôi cần một decision map chắc hơn: nhờ AI phân tích gì, assumption nào phải phản biện, risk nào phải có test và release thế nào để production không trở thành nơi đoán mò."
      },
      {
        heading: "Bảy lớp từ yêu cầu đến vận hành",
        body:
          "Mỗi thay đổi đáng kể nên đi qua bảy lớp: nhu cầu kinh doanh; miền nghiệp vụ hoặc tình huống sử dụng; hợp đồng API hay quy trình; dữ liệu và tính nhất quán; kiến trúc và mẫu thiết kế; triển khai và kiểm thử; cuối cùng là release, observability và vận hành."
      },
      {
        heading: "Những lớp kiến thức cần bồi đắp",
        body:
          "Tôi học dần về software design, data modeling, replication và consistency, khả năng phục hồi của distributed system, event-driven architecture với CQRS và Event Sourcing, cache, performance, observability, SRE và production operations. Mục tiêu không phải thuộc hết thuật ngữ mà là biết lúc nào từng ý tưởng có ích."
      },
      {
        heading: "Cách luyện mỗi ngày",
        body:
          "Trước khi viết mã, tôi đọc lại một lớp và tự hỏi một câu ở góc nhìn kỹ sư lâu năm. Sau khi làm xong, tôi lưu một thứ có thể dùng lại: câu lệnh tốt hơn, kế hoạch truy vấn, ADR, ca kiểm thử, rủi ro release, dashboard signal hoặc bài học ngắn."
      },
      {
        heading: "Bài tập dài hạn",
        body:
          "Tôi dùng một nền tảng thương mại điện tử, thuê bao hoặc đặt lịch làm phòng thí nghiệm lâu dài. Hệ thống bắt đầu bằng modular monolith, PostgreSQL, Redis, Outbox và queue; sau đó mới thêm Saga cho thanh toán, Circuit Breaker, mô hình đọc CQRS, Event Sourcing cho vòng đời đơn hàng, OpenTelemetry, dashboard, feature flag, zero-downtime migration, load test, runbook và ADR."
      }
    ],
    commands: [
      {
        label: "Làm rõ yêu cầu",
        command:
          "Hãy đóng vai Staff Software Engineer. Với yêu cầu này, hãy hỏi các câu quan trọng nhất trước khi triển khai. Chia câu hỏi theo: kinh doanh, sản phẩm, dữ liệu, API, bảo mật, độ tin cậy, release và observability.",
        note: "Dùng trước khi giao việc cho Codex hoặc Antigravity."
      },
      {
        label: "Ghi lại quyết định kiến trúc",
        command:
          "Hãy viết một Architecture Decision Record cho tính năng này và so sánh ít nhất 3 phương án. Với mỗi phương án, phân tích độ phức tạp, khả năng mở rộng, tính nhất quán, rủi ro vận hành, chi phí, công sức chuyển đổi, rollback strategy và khả năng bảo trì lâu dài.",
        note: "Dùng khi thay đổi chạm tới kiến trúc, dữ liệu hoặc vận hành."
      },
      {
        label: "Production readiness",
        command:
          "Hãy lập production-readiness checklist cho tính năng này, gồm test cases, failure scenarios, observability, alert, rollback, cách kiểm chứng migration, tác động tới người dùng và abort criteria.",
        note: "Dùng trước khi rollout hoặc trước vòng rà soát cuối."
      }
    ],
    checklist: [
      { label: "Đọc lại một lớp trong bản đồ trước khi bắt đầu việc kỹ thuật đáng kể." },
      {
        label: "Tự hỏi ít nhất một câu ở góc nhìn kỹ sư lâu năm trước khi triển khai.",
        detail: "Kinh doanh, sản phẩm, nghiệp vụ, API, dữ liệu, tính nhất quán, độ tin cậy, bảo mật, observability hoặc release."
      },
      { label: "Dùng AI để phân tích và phản biện trước, không chỉ để sinh mã." },
      {
        label: "Lưu một tài liệu có thể dùng lại sau mỗi việc.",
        detail: "Câu lệnh, danh sách kiểm tra, ADR, kế hoạch truy vấn, ma trận kiểm thử, runbook, ghi chú release hoặc bài học sau sự cố."
      },
      { label: "Mỗi tuần đẩy bài tập dài hạn tiến thêm một bước." }
    ]
  },
  "ai-system-engineering-roadmap": {
    title: "Lộ trình kỹ thuật hệ thống khi làm việc cùng AI",
    subtitle: "Bản đồ học về vòng đời phần mềm, hệ phân tán, lưu trữ lớn và cách dùng AI để phản biện.",
    tags: ["Nâng kỹ năng AI", "Kỹ thuật hệ thống", "SDLC", "Hệ phân tán", "Lưu trữ", "Quy trình kỹ thuật"],
    summary:
      "AI hỗ trợ viết mã, còn kỹ sư vẫn phải làm chủ quyết định kiến trúc, tình huống hỏng của hệ phân tán, đánh đổi lưu trữ và chất lượng rà soát.",
    sections: [
      {
        heading: "Chuyển trọng tâm",
        body:
          "Mục tiêu là đi từ viết cú pháp sang làm chủ cả hệ thống. AI có thể phác mã và kiểm thử, nhưng kỹ sư vẫn quyết định mô hình nghiệp vụ, hợp đồng dữ liệu, cách giữ nhất quán, release path, observability plan và mức rủi ro vận hành có thể chấp nhận."
      },
      {
        heading: "Trụ cột 1: Làm chủ vòng đời phần mềm",
        body:
          "Tôi học toàn bộ SDLC như một hệ thống quản trị: strategy và discovery; requirement và specification; architecture và design; implementation; QA; release; observability và incident response; maintenance và technical debt; rồi feedback và iteration. Thói quen quan trọng nhất là không đưa code do AI sinh ra lên production nếu tôi chưa thể giải thích nó và bảo đảm observability."
      },
      {
        heading: "Trụ cột 2: Kiến trúc phân tán và khả năng phục hồi",
        body:
          "Tôi đi sâu vào Event Sourcing, CQRS, snapshot, optimistic concurrency, thay đổi schema sự kiện, các tầng lưu trữ nóng/ấm/lạnh, trạng thái Circuit Breaker, cửa sổ đo, cách xử lý thay thế và retry với exponential backoff kèm jitter. Câu hỏi thực tế luôn là: hệ thống ra sao khi phụ thuộc bên ngoài chậm, gửi trùng, đến muộn hoặc chỉ hỏng một phần?"
      },
      {
        heading: "Trụ cột 3: Lưu trữ ở quy mô lớn",
        body:
          "Tôi rèn trực giác về lưu trữ qua B-Tree và LSM-Tree; clustered, non-clustered, composite và covering index; quy tắc leftmost prefix; index bị mất hiệu lực; sao chép đồng bộ và bất đồng bộ; quorum với Raft hoặc Multi-Paxos; logical replication; sharding; consistent hashing; virtual node; xử lý điểm nóng; 2PC và Saga."
      },
      {
        heading: "Trụ cột 4: Cách làm kỹ thuật cùng AI",
        body:
          "Tôi dùng AI trước hết như người phân tích yêu cầu, người chất vấn kiến trúc, người lên chiến lược kiểm thử và người rà soát mức sẵn sàng khi vận hành. AI cần chỉ ra điểm mơ hồ, race condition, giả định về tính nhất quán, lỗ hổng kiểm thử, thiếu sót về rollback hoặc observability trước khi được giao viết mã."
      }
    ],
    commands: [
      {
        label: "Gợi mở yêu cầu trước khi làm",
        command:
          "Hãy đóng vai Staff Software Engineer. Với yêu cầu này, hãy hỏi các câu quan trọng nhất trước khi triển khai. Chia câu hỏi theo: kinh doanh, sản phẩm, dữ liệu, API, bảo mật, độ tin cậy, release và observability.",
        note: "Dùng trước khi tách một ticket mơ hồ thành các việc cụ thể."
      },
      {
        label: "Phản biện kiến trúc",
        command:
          "Hãy phản biện thiết kế này. Tìm race condition, data consistency bug, security risk, performance bottleneck, operational assumption chưa nói ra và các failure scenario trên production.",
        note: "Dùng trước khi giao Codex hoặc Antigravity triển khai."
      },
      {
        label: "Chiến lược kiểm thử và bảo mật",
        command:
          "Hãy tạo ma trận kiểm thử cho tính năng này: unit, integration, contract, E2E, load test, bảo mật, migration, rollback và tình huống phụ thuộc bên ngoài bị hỏng. Chỉ rõ kiểm thử nào phải chặn release.",
        note: "Dùng trước khi lên kế hoạch rollout."
      }
    ],
    checklist: [
      { label: "Mỗi tuần rà lại một giai đoạn SDLC và một lớp telemetry." },
      {
        label: "Học sâu một mẫu thiết kế phân tán.",
        detail: "Event Sourcing, CQRS, Circuit Breaker, Retry, Saga, Outbox hoặc idempotent consumer."
      },
      {
        label: "Thực hành một chủ đề lưu trữ bằng bằng chứng cụ thể.",
        detail: "Kế hoạch dùng index, hành vi sao chép, đánh đổi khi sharding, consistent hashing hoặc kế hoạch truy vấn."
      },
      { label: "Dùng AI để phản biện trước khi dùng AI để viết mã." },
      { label: "Mỗi ngày lưu một tài liệu nhỏ để kiến thức tích lũy dần.", checked: true }
    ]
  },
  "antigravity-awesome-skills": {
    title: "Cài thư viện Antigravity Awesome Skills",
    subtitle: "Lệnh cài lại bộ hướng dẫn cho AI mà tôi thường dùng.",
    tags: ["Thiết lập AI", "Antigravity", "Codex", "Claude", "Gemini", "Thư viện hướng dẫn"],
    summary:
      "Đây không phải danh sách mọi hướng dẫn đã cài. Nó là tờ ghi nhanh khi đổi máy: chạy lệnh nào, nguồn chính ở đâu và cần nhờ AI khôi phục những gì.",
    sections: [
      {
        heading: "Thư viện này mang lại gì",
        body:
          "Antigravity Awesome Skills là thư viện các tệp SKILL.md có thể cài đặt cho trợ lý lập trình AI. Tôi dùng nó như nguồn hướng dẫn thống nhất, thay vì nhớ bằng đầu hoặc viết lại câu lệnh riêng cho từng lần."
      },
      {
        heading: "Tác giả và nguồn chính",
        body:
          "Tác giả trên GitHub là sickn33. Kho mã là nguồn cần đối chiếu trước tiên; trang danh mục phù hợp khi chỉ cần tìm nhanh hoặc chia sẻ liên kết."
      },
      {
        heading: "Nhờ AI hỗ trợ khi đổi máy",
        body:
          "Khi nhận ghi chú này trên máy mới, AI phải mở kho GitHub, đọc README mới nhất rồi chọn đúng lệnh cài cho công cụ đích. Tuyệt đối không sao chép tệp chứa thông tin đăng nhập từ máy cũ."
      }
    ],
    commands: [
      { label: "Cài đặt mặc định", command: "npx antigravity-awesome-skills", note: "Lệnh đầu tiên cần nhớ." },
      {
        label: "Cài cho Antigravity CLI",
        command: "npx antigravity-awesome-skills --agy",
        note: "Dùng khi cần các lệnh kỹ năng của Antigravity CLI trong ~/.gemini/antigravity-cli/skills."
      },
      {
        label: "Ví dụ cài bản gọn",
        command: "npx antigravity-awesome-skills --path .agents/skills --category development,backend --risk safe,none",
        note: "Dùng khi bản cài đầy đủ khiến công cụ phải nạp quá nhiều hướng dẫn."
      },
      {
        label: "Cài plugin cho Claude Code",
        command: "/plugin marketplace add sickn33/antigravity-awesome-skills && /plugin install antigravity-awesome-skills",
        note: "Cách cài được nêu trong tài liệu bắt đầu của dự án."
      }
    ],
    links: [
      {
        label: "Kho mã GitHub",
        href: "https://github.com/sickn33/antigravity-awesome-skills",
        note: "Nguồn chính của dự án."
      },
      {
        label: "Hướng dẫn bắt đầu",
        href: "https://github.com/sickn33/antigravity-awesome-skills/blob/main/docs/users/getting-started.md",
        note: "Cách cài cho từng công cụ."
      },
      {
        label: "Danh mục trực tuyến",
        href: "https://sickn33.github.io/antigravity-awesome-skills",
        note: "Trang tìm và xem nhanh."
      }
    ],
    checklist: [
      { label: "Mở kho mã và xác nhận lệnh cài mới nhất.", checked: true },
      {
        label: "Chạy bộ cài cho đúng công cụ AI.",
        detail: "Antigravity, Claude Code, Codex, Gemini, Cursor hoặc công cụ được hỗ trợ khác."
      },
      { label: "Khởi động lại công cụ hoặc CLI sau khi cài.", detail: "Nhiều công cụ chỉ nhận hướng dẫn mới khi khởi động." },
      { label: "Không chuyển credential file hoặc OAuth cache.", checked: true }
    ]
  },
  "open-design": {
    title: "Open Design",
    subtitle: "Không gian thiết kế và cầu nối MCP cho các bản giao diện do AI hỗ trợ.",
    tags: ["Thiết kế", "MCP", "Codex", "Claude", "Gemini", "Antigravity"],
    summary:
      "Tôi lưu Open Design như một nguồn tham khảo về thiết kế và một lựa chọn kết nối MCP cho việc làm giao diện. Trước khi cài, cần kiểm tra lại lệnh và công cụ được hỗ trợ trong tài liệu mới nhất của dự án.",
    sections: [
      {
        heading: "Đây là công cụ gì",
        body:
          "Dự án giới thiệu Open Design như một workspace mã nguồn mở, ưu tiên chạy trên máy cá nhân để tạo design artifact cùng AI. Trong Studio, tôi quan tâm nhất đến UI prototype, design system và tài liệu có thể mang đi review."
      },
      {
        heading: "Vì sao tôi lưu công cụ này",
        body:
          "Công cụ có thể hữu ích khi AI cần dựng hoặc chỉnh một mẫu giao diện mà không tách công việc sang một quy trình thiết kế khác. Khả năng kết nối qua MCP cũng khiến nó phù hợp với nhóm ghi chú thiết lập AI."
      },
      {
        heading: "Cách thử trên máy mới",
        body:
          "Đầu tiên, kiểm tra tài liệu hiện tại của dự án; sau đó cài ứng dụng và chỉ nối MCP vào công cụ AI thật sự cần dùng. Hãy bắt đầu bằng một kết nối, kiểm chứng nó hoạt động rồi mới thêm kết nối khác."
      }
    ],
    commands: [
      { label: "Cài MCP cho Codex", command: "od mcp install codex" },
      { label: "Cài MCP cho Antigravity", command: "od mcp install antigravity" },
      { label: "Cài MCP cho Claude", command: "od mcp install claude" },
      { label: "Cài MCP cho Gemini", command: "od mcp install gemini" },
      { label: "Xem trước lệnh cài MCP", command: "od mcp install codex --print" }
    ],
    links: [
      { label: "Kho mã GitHub", href: "https://github.com/nexu-io/open-design", note: "Trang dự án mã nguồn mở." },
      { label: "Trang giới thiệu và tải ứng dụng", href: "https://open-design.ai", note: "Trang sản phẩm được liên kết từ kho mã." }
    ],
    checklist: [
      { label: "Cài hoặc mở ứng dụng Open Design trên máy." },
      { label: "Kết nối MCP với Codex.", detail: "Bắt đầu bằng lệnh od mcp install codex." },
      { label: "Chỉ kết nối MCP với Antigravity khi thật sự cần hỗ trợ thiết kế ở đó." },
      { label: "Dùng Open Design như nguồn tham khảo cho giao diện quản trị và không gian làm việc.", checked: true }
    ]
  },
  "computer-baseline": {
    title: "Thiết lập máy tính",
    subtitle: "Những việc ở mức hệ điều hành cần xong trước khi bắt đầu dự án.",
    tags: ["Thiết lập máy", "macOS", "Trình duyệt", "Bảo mật"],
    summary:
      "Ghi chú này dành cho phần ngoài dòng lệnh trên một máy kỹ thuật mới: thư mục, trình duyệt, phông chữ, đăng nhập và các nguyên tắc an toàn cơ bản.",
    sections: [
      {
        heading: "Mục tiêu",
        body:
          "Một chiếc máy mới nên sớm trở nên quen thuộc: cùng cách xếp thư mục dự án, đủ trình duyệt để kiểm thử, phông chữ dễ đọc và không vô tình đưa bí mật vào ghi chú công khai."
      }
    ],
    checklist: [
      { label: "Tạo ~/Documents/Projects và tải về các kho mã đang làm." },
      { label: "Cài đủ trình duyệt dùng cho phát triển và kiểm thử OAuth." },
      { label: "Khôi phục phông chữ dùng để viết mã và đọc lâu." },
      { label: "Đăng nhập lại từng công cụ, không sao chép tệp chứa token.", checked: true }
    ]
  },
  "terminal-baseline": {
    title: "Thiết lập dòng lệnh",
    subtitle: "Nền tảng dòng lệnh cho công việc kỹ thuật.",
    tags: ["Dòng lệnh", "Git", "Node", "Bun", "PlantUML"],
    summary:
      "Ghi chú này giữ những thứ sát với công việc hằng ngày ở cùng một chỗ: Git, GitHub CLI, Node/Bun, Java/PlantUML, lệnh release và lệnh cài các công cụ AI.",
    sections: [
      {
        heading: "Mục tiêu",
        body:
          "Trước khi mở một việc lớn, dòng lệnh phải biết đúng danh tính Git, đăng nhập được, chạy được dự án và kiểm tra được tài liệu hoặc sơ đồ."
      }
    ],
    commands: [
      { label: "Chạy ứng dụng trên máy", command: "npm run dev" },
      { label: "Kiểm tra kiểu dữ liệu", command: "npm run typecheck" },
      { label: "Kiểm tra cú pháp PlantUML", command: "java -jar plantuml.jar --check-syntax docs/diagrams/*.puml" }
    ],
    checklist: [
      { label: "Cấu hình danh tính Git và cách dùng khóa SSH." },
      { label: "Đăng nhập GitHub CLI." },
      { label: "Cài Node, npm, Bun, Java và các CLI của dự án." },
      { label: "Lưu các lệnh cài cần thiết trong Studio này." }
    ]
  },
  "multi-agent-ai": {
    title: "Multi-agent AI",
    subtitle: "Tìm hiểu cách phối hợp nhiều agent mà không đánh mất phán đoán của con người.",
    tags: ["Học về AI", "Nhiều tác nhân", "Quy trình"],
    summary:
      "Nội dung dự kiến tìm hiểu: lúc nào multi-agent giúp planning, implementation, review, testing hoặc research tốt hơn; lúc nào nó chỉ làm tăng chi phí phối hợp.",
    sections: [
      {
        heading: "Câu hỏi cần trả lời",
        body: "Khi nào multi-agent setup giúp engineering judgment tốt hơn, và khi nào chỉ cần một agent tập trung cùng test suite đủ tốt?"
      }
    ],
    checklist: [
      { label: "So sánh vai trò lập kế hoạch, triển khai, rà soát và kiểm chứng." },
      { label: "Ghi rõ tình huống hỏng trước khi thêm tự động hoá." }
    ]
  },
  openhands: {
    title: "OpenHands",
    subtitle: "Dự kiến tìm hiểu cách cài đặt, cô lập môi trường và xử lý việc dài.",
    tags: ["Học về AI", "OpenHands"],
    summary:
      "Bản đánh giá dự kiến sẽ xem cách cài, mức phù hợp với kho mã, ranh giới sandbox, khả năng xử lý việc dài và phần trùng với Codex hoặc Claude.",
    sections: [
      {
        heading: "Câu hỏi cần trả lời",
        body: "OpenHands phù hợp hơn với vai trò bạn lập trình chạy trên máy, bộ thực thi trong sandbox hay một quy trình riêng cho thay đổi dài và tự chủ hơn?"
      }
    ]
  },
  crewai: {
    title: "CrewAI",
    subtitle: "Dự kiến tìm hiểu về vai trò rõ ràng, bộ nhớ và cách bàn giao giữa các tác nhân.",
    tags: ["Học về AI", "CrewAI", "Tác nhân AI"],
    summary:
      "Bản đánh giá dự kiến tập trung vào lúc nào vai trò, bộ nhớ và bàn giao có cấu trúc đem lại lợi ích rõ hơn một đoạn script hoặc một tác nhân duy nhất.",
    sections: [
      {
        heading: "Câu hỏi cần trả lời",
        body: "Việc nào thật sự hưởng lợi từ vai trò, bộ nhớ và bàn giao giữa các tác nhân; việc nào lại chậm hơn chỉ vì thêm cấu trúc?"
      }
    ]
  }
};

export function getLocalizedStudioFolders(locale: string): StudioFolder[] {
  if (locale !== "vi") return studioFolders;

  return studioFolders.map((folder) => ({
    ...folder,
    ...(vietnameseFolders[folder.id] ?? {})
  }));
}

export function getLocalizedStudioNotes(locale: string): StudioNote[] {
  if (locale !== "vi") return studioNotes;

  return studioNotes.map((note) => ({
    ...note,
    ...(vietnameseNotes[note.id] ?? {})
  }));
}
