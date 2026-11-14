import {
  studioAiSkills,
  studioFlowGroups,
  studioFlows,
  studioWorkflowChecklists
} from "./studio.data";
import type {
  StudioAiSkill,
  StudioChecklistSection,
  StudioChecklistStep,
  StudioFlow,
  StudioFlowGroup,
  StudioFlowStep,
  StudioWorkflowChecklist
} from "./studio.data";

type LocalizedSkillCopy = {
  title: string;
  summary: string;
  tags: string[];
  useWhen: string[];
  process: string[];
  output: string[];
  guardrails: string[];
};

type LocalizedChecklistCopy = {
  title: string;
  summary: string;
  whenToUse: string;
  tags: string[];
};

type LocalizedSectionCopy = {
  title: string;
  detail: string;
};

type LocalizedStepCopy = {
  label: string;
  detail?: string;
};

type LocalizedFlowGroupCopy = {
  title: string;
  subtitle: string;
  description: string;
};

type LocalizedFlowStepCopy = {
  title: string;
  detail: string;
  evidence: string;
  output: string;
};

type LocalizedFlowCopy = {
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  useWhen: string;
  outcome: string;
  officeExample: string;
  tags: string[];
  steps: Record<string, LocalizedFlowStepCopy>;
  artifacts: string[];
  cvSignals: string[];
};

const vietnameseSkillCopies: Record<string, LocalizedSkillCopy> = {
  "code-review": {
    title: "Rà soát mã nguồn",
    summary: "Rà soát thay đổi theo đúng thứ tự: tính đúng đắn trước, sau đó đến bảo mật và quyền riêng tư, khả năng bảo trì, mức độ kiểm thử và rủi ro vận hành.",
    tags: ["Rà soát mã nguồn", "Tính đúng đắn", "Bảo mật", "Chiến lược kiểm thử"],
    useWhen: [
      "Khi rà soát pull request, phần thay đổi trên máy, mã do công cụ tạo, đợt refactor, migration hoặc bản sửa nóng trên production.",
      "Khi cần tìm lỗi có thể làm hỏng hành vi trước khi bàn đến cách trình bày mã nguồn.",
      "Khi thay đổi tác động đến mô hình xác thực, mô hình dữ liệu, sự kiện analytics, đường dẫn SEO, feature flag hoặc kế hoạch rollout."
    ],
    process: [
      "Xác nhận mục đích: đối chiếu phần thay đổi với yêu cầu, tiêu chí nghiệm thu và hành vi người dùng.",
      "Kiểm tra tính đúng đắn qua luồng điều khiển, chuyển đổi trạng thái, giá trị biên, giá trị rỗng, xử lý đồng thời, tính idempotent và các nhánh lỗi.",
      "Lập mô hình đe dọa cho thay đổi: OWASP Top 10, injection, vượt qua xác thực hoặc phân quyền, IDOR, CSRF/XSS, bí mật hệ thống, PII và cách ly tenant.",
      "Đánh giá kiến trúc qua mức độ phụ thuộc, abstraction làm rò rỉ chi tiết cài đặt, phụ thuộc vòng, khả năng tương thích API, sai lệch schema và chi phí bảo trì.",
      "Kiểm tra cấu trúc dữ liệu: array, map, set, queue, tree, index, cache và DTO phải hợp với cách truy cập, không vô tình biến thao tác tra cứu hoặc gom nhóm trong luồng xử lý chính thành O(n).",
      "Chỉ dùng design pattern khi nó thực sự làm hệ thống dễ hiểu hơn, chẳng hạn Strategy cho quy tắc có thể thay thế, Factory cho chính sách khởi tạo, Adapter cho API bên ngoài, Repository cho ranh giới lưu trữ và State Machine cho quy trình nhiều bước.",
      "Kiểm tra clean architecture: quy tắc nghiệp vụ không phụ thuộc UI, framework, giao thức truyền tải, ORM, analytics hay SDK của nhà cung cấp; chiều phụ thuộc phải hướng vào lõi.",
      "Kiểm tra ranh giới trách nhiệm: application service điều phối, domain service giữ quy tắc nghiệp vụ, repository hoặc gateway phụ trách lưu trữ và tích hợp, utility chỉ chứa phép biến đổi, kiểm tra hoặc định dạng thuần.",
      "Kiểm tra khả năng vận hành: truy vấn N+1, độ phức tạp tăng đột biến, áp lực bộ nhớ, lỗi hydration, khoảng trống observability và rủi ro rollback.",
      "Đối chiếu kiểm thử unit, integration, E2E, contract, khả năng tiếp cận và regression với đúng hành vi vừa thay đổi."
    ],
    output: [
      "Các phát hiện được xếp theo mức độ: Blocker, Major, Minor, Nit.",
      "Mỗi phát hiện nêu rõ file và dòng, bằng chứng, tác động cùng cách sửa nhỏ nhất có thể áp dụng.",
      "Ghi chú về kiến trúc và cách tổ chức mã nguồn khi thay đổi thêm service, repository, helper dùng chung, design pattern hoặc cấu trúc dữ liệu mới.",
      "Chỉ đặt câu hỏi còn mở khi câu trả lời ảnh hưởng đến tính đúng đắn, bảo mật, rollout hoặc hành vi sản phẩm.",
      "Nêu rõ rủi ro còn lại và phần chưa được kiểm chứng."
    ],
    guardrails: [
      "Không mất thời gian vào sở thích cá nhân khi hành vi, quy ước và kiểm thử đều ổn.",
      "Không chấp thuận quy tắc nghiệp vụ mới khi chưa có cách kiểm chứng đủ sức thuyết phục.",
      "Không gom logic nghiệp vụ có trạng thái vào file utility chỉ để mã trông gọn hơn; nếu có quyền sở hữu hoặc quy tắc miền thì phải tách thành service hay module rõ ràng.",
      "Không yêu cầu viết lại toàn bộ thiết kế khi cách làm hiện tại chưa tạo ra rủi ro có thể chỉ ra hoặc đo được."
    ]
  },
  "frontend-architecture": {
    title: "Kiến trúc frontend",
    summary: "Thiết kế frontend với ranh giới đường dẫn rõ ràng, biết trạng thái thuộc về đâu, đồng thời bảo đảm khả năng tiếp cận, đo lường và Core Web Vitals.",
    tags: ["Frontend", "React", "Web Vitals", "Khả năng tiếp cận"],
    useWhen: [
      "Khi thiết kế đường dẫn, dashboard, hệ thống component, biểu mẫu, bộ lọc, giao diện tìm kiếm hoặc refactor frontend.",
      "Khi UI cần quản lý URL state, server state, user preferences, form state hoặc browser-only interaction.",
      "Khi SEO, hành vi theo ngôn ngữ, analytics, khả năng tiếp cận và trải nghiệm trên thiết bị di động là tiêu chí nghiệm thu bắt buộc."
    ],
    process: [
      "Xác định ranh giới giữa đường dẫn và bố cục, cùng các trạng thái đang tải, trống, lỗi, thiếu một phần dữ liệu, thiếu quyền và không tìm thấy.",
      "Chọn cách render có chủ đích: SSR, SSG, ISR, CSR, streaming hoặc client island dựa trên độ mới của dữ liệu, SEO, quyền riêng tư và nhu cầu cá nhân hóa.",
      "Phân loại trạng thái: dữ liệu từ máy chủ, trạng thái trên URL, thiết lập cần lưu lâu dài, trạng thái toàn ứng dụng, trạng thái biểu mẫu và trạng thái tạm thời trong component.",
      "Phân chia trách nhiệm của component: lớp giao diện ngoài nên nhỏ, logic miền được tách riêng và dữ liệu không bị truyền xuyên qua các lớp không liên quan.",
      "Bảo vệ chất lượng tương tác: dùng được bằng bàn phím, quản lý focus, ngữ nghĩa ARIA, giảm chuyển động, độ tương phản và khả năng thích ứng màn hình.",
      "Lập kế hoạch hiệu năng và analytics: LCP, INP, CLS, giới hạn bundle, tên sự kiện, PageTracker và các sự kiện trong funnel."
    ],
    output: [
      "Sơ đồ đường dẫn và component, kèm ranh giới trách nhiệm.",
      "Kế hoạch quản lý state, data fetching và cache invalidation.",
      "Ma trận trạng thái UX cho lúc đang tải, trống, lỗi, bị vô hiệu hóa, thành công và trên các kích thước màn hình.",
      "Danh sách kiểm tra hiệu năng, khả năng tiếp cận và analytics.",
      "Các phần triển khai nhỏ được sắp theo mức độ rủi ro."
    ],
    guardrails: [
      "Không đưa tương tác cục bộ vào trạng thái toàn ứng dụng nếu không có lý do kiến trúc rõ ràng.",
      "Không phát hành giao diện khi chưa dùng được bằng bàn phím, trình đọc màn hình và thiết bị di động.",
      "Không đổi analytics hoặc hành vi theo ngôn ngữ hiện có khi chưa có kế hoạch chuyển đổi rõ ràng."
    ]
  },
  "backend-architecture": {
    title: "Kiến trúc backend",
    summary: "Thiết kế backend với quyền sở hữu miền rõ ràng, hợp đồng tường minh, dữ liệu bền vững và phương án xử lý được các tình huống lỗi khi vận hành.",
    tags: ["Backend", "Thiết kế API", "Hệ thống phân tán", "Độ tin cậy"],
    useWhen: [
      "Khi thiết kế API, service, tác vụ nền, webhook, luồng sự kiện, migration dữ liệu hoặc tích hợp.",
      "Khi thay đổi kéo theo database migration, message queue, rate limiting, external dependency hoặc auth/RBAC.",
      "Khi hệ thống cần SLO về độ trễ, độ bền và tính nhất quán của dữ liệu, cùng kế hoạch rollout và rollback an toàn."
    ],
    process: [
      "Mô hình hóa miền: bounded context, aggregate, invariant, quyền đọc và ghi cùng các sự kiện trong vòng đời.",
      "Chọn cấu trúc triển khai phù hợp nhu cầu vận hành: modular monolith, tách service, serverless, worker dùng queue hoặc luồng hướng sự kiện.",
      "Thiết kế contract-first: OpenAPI, gRPC, AsyncAPI, event schema, idempotency key, pagination, error taxonomy và versioning.",
      "Thiết kế lớp lưu trữ: schema, index, kế hoạch migration, thời hạn giữ dữ liệu, mã hóa, sao lưu, khôi phục và mức nhất quán cần bảo đảm.",
      "Thiết kế resilience: timeout, retry budget, exponential backoff có jitter, DLQ, circuit breaker, bulkhead, rate limiting và graceful degradation.",
      "Xác định cách vận hành: log có cấu trúc, trace, metric, cảnh báo, runbook, canary hoặc feature flag và điều kiện kích hoạt rollback."
    ],
    output: [
      "Sơ đồ miền và trách nhiệm.",
      "Hợp đồng API hoặc sự kiện kèm các tình huống lỗi.",
      "Mô hình dữ liệu và chiến lược migration.",
      "Kế hoạch chống lỗi, bảo mật và observability.",
      "Kế hoạch rollout, rollback và khôi phục sau thảm họa."
    ],
    guardrails: [
      "Ưu tiên topology đơn giản nhất vẫn giữ được invariant và đạt SLO.",
      "Không thêm xử lý bất đồng bộ khi chưa có idempotency, observability và quy tắc phát lại.",
      "Không gọi thiết kế là sẵn sàng cho production khi chưa có rollback và khôi phục dữ liệu."
    ]
  },
  "blog-content-writer": {
    title: "Viết nội dung kỹ thuật",
    summary: "Viết bài kỹ thuật có luận điểm rõ, bằng chứng vững, SEO tự nhiên và giọng điệu điềm tĩnh của người hiểu việc.",
    tags: ["Viết kỹ thuật", "SEO", "Chiến lược biên tập"],
    useWhen: [
      "Khi viết bài về kỹ thuật, bài giải thích khái niệm, postmortem kiến trúc, ghi chú sản phẩm hoặc tài liệu công khai.",
      "Khi cần biến một ý tưởng thô thành bài viết có luận điểm, mạch lập luận, ví dụ thật và điều người đọc có thể mang theo.",
      "Khi nội dung cần giữ giọng bình tĩnh, chân thực, có phân tích, không cường điệu và không mang màu sắc bán hàng."
    ],
    process: [
      "Chốt luận điểm: chọn một nhận định cụ thể mà bài viết sẽ làm sáng tỏ, thay vì chỉ nêu một chủ đề rộng.",
      "Mở từ tình huống cụ thể như một lần rà soát mã nguồn, sự cố, đánh đổi sản phẩm, yêu cầu mơ hồ, dashboard chậm hoặc một khoảnh khắc quen thuộc ở nơi làm việc.",
      "Giúp người đọc dựng được cách hiểu: giải thích thuật ngữ, ngữ cảnh, đánh đổi và giới hạn trước khi đưa ra lời khuyên.",
      "Nâng đỡ lập luận bằng sơ đồ, quy trình, đoạn mã, benchmark, tiêu chuẩn, nguồn trích dẫn hoặc tình huống lỗi sát thực tế.",
      "Sắp xếp cấu trúc rõ ràng với H1/H2/H3, từ khóa tự nhiên, liên kết nội bộ, meta title, meta description và canonical path.",
      "Khép lại bằng điều có thể áp dụng: một cách nhìn, danh sách kiểm tra, quy tắc ra quyết định hoặc câu hỏi để suy ngẫm."
    ],
    output: [
      "Metadata SEO và đề xuất slug.",
      "Dàn ý bám đúng nhu cầu của người đọc và mục đích tìm kiếm.",
      "Bản thảo hoàn chỉnh theo đúng định dạng yêu cầu.",
      "Ghi chú nguồn, ý tưởng sơ đồ và gợi ý liên kết nội bộ.",
      "Bản giới thiệu ngắn dùng trên mạng xã hội khi cần."
    ],
    guardrails: [
      "Không nhồi từ khóa hoặc thổi phồng nhận định vượt quá bằng chứng.",
      "Không bịa số liệu, trích dẫn, benchmark hay khả năng kỹ thuật.",
      "Phải giữ nguyên hành vi theo ngôn ngữ, schema nội dung, đường dẫn SEO và các điểm đo analytics hiện có."
    ]
  },
  "prompt-writing": {
    title: "Thiết kế prompt",
    summary: "Thiết kế prompt và chỉ dẫn hệ thống với vai trò rõ ràng, ngữ cảnh vừa đủ và đúng phạm vi, khả năng chống prompt injection và schema kết quả có thể kiểm chứng.",
    tags: ["Thiết kế prompt", "LLM", "Agent AI", "Đánh giá"],
    useWhen: [
      "Khi thiết kế system prompt, prompt cho tác vụ, ví dụ few-shot, chính sách cho agent, prompt trích xuất hoặc schema kết quả.",
      "Khi định nghĩa tác vụ còn mơ hồ về vai trò, mục tiêu, ngữ cảnh, giới hạn hoặc tiêu chí nghiệm thu.",
      "Khi chuỗi xử lý cần JSON Schema, các phần Markdown, diff hoặc trường dữ liệu để máy đọc ổn định."
    ],
    process: [
      "Xác định vai trò và phạm vi: chuyên môn, quyền hạn, điều không làm và ranh giới agent không được vượt qua.",
      "Viết hợp đồng cho tác vụ: mục tiêu, đầu vào, giả định, tiêu chí nghiệm thu và điều kiện thất bại.",
      "Tách rõ quy tắc hệ thống, quy tắc của developer, yêu cầu người dùng, bằng chứng truy xuất và nội dung không đáng tin bằng dấu phân cách dễ nhận biết.",
      "Đưa ra quy trình ngắn: danh sách bước cần làm và yêu cầu giải thích hoặc bằng chứng ngắn gọn, không đòi private chain-of-thought.",
      "Đặc tả schema kết quả bằng JSON Schema, các phần Markdown, bảng, diff hoặc trường có cấu trúc, kèm ví dụ.",
      "Thử prompt với các trường hợp đối nghịch: yêu cầu mơ hồ, prompt injection, thiếu ngữ cảnh, đầu vào sai định dạng và schema bị lệch."
    ],
    output: [
      "Prompt dùng cho production hoặc bộ prompt hoàn chỉnh.",
      "Danh sách biến và quy tắc làm sạch đầu vào.",
      "Schema kết quả kèm ví dụ hợp lệ và không hợp lệ.",
      "Danh sách đánh giá với tiêu chí đạt hoặc không đạt.",
      "Bản rút gọn cho nhu cầu dùng nhanh."
    ],
    guardrails: [
      "Không yêu cầu private chain-of-thought; chỉ yêu cầu phần giải thích, bước kiểm tra hoặc bằng chứng ngắn gọn.",
      "Không để nội dung không đáng tin thay đổi vai trò, công cụ, quyền truy cập dữ liệu hoặc chính sách kết quả.",
      "Không dùng từ mơ hồ như “tốt hơn” khi chưa có tiêu chí đo được."
    ]
  },
  "status-report": {
    title: "Báo cáo tiến độ và vận hành",
    summary: "Gạn bỏ chi tiết vụn để lãnh đạo thấy ngay tình trạng, tác động, điểm nghẽn, quyết định cần chốt, người phụ trách và cách đưa công việc trở lại quỹ đạo.",
    tags: ["Vận hành", "Báo cáo", "OKR", "Chuyển cấp xử lý"],
    useWhen: [
      "Khi viết báo cáo standup hằng ngày, tiến độ hằng tuần, tổng kết OKR hằng tháng, cập nhật sự cố hoặc nội dung cần chuyển lên cấp quyết định.",
      "Khi dự án chuyển sang trạng thái Yellow hoặc Red và cần quyết định từ cấp trên hay nhóm liên chức năng.",
      "Khi cần biến ticket, commit, sự cố và metric thành bản tóm tắt mà lãnh đạo có thể hành động dựa trên đó."
    ],
    process: [
      "Mở đầu theo BLUF: tình trạng hiện tại, nguyên nhân và điều đã thay đổi từ lần cập nhật trước.",
      "Tách sự kiện khỏi diễn giải: metric, phần đã bàn giao, sự cố và giả định chưa được làm rõ.",
      "Định lượng tiến độ bằng mức tiến triển của OKR, DORA metrics, burn-up hoặc burn-down, SLA/SLO, MTTR, lead time, throughput hay mức độ sử dụng.",
      "Chỉ rõ giới hạn: điểm nghẽn, người phụ trách phần phụ thuộc, hạn xử lý, xác suất, tác động và hướng giảm nhẹ.",
      "Biến mỗi quyết định thành một đề nghị cụ thể: phương án khuyến nghị, phương án dự phòng, thời hạn và hệ quả nếu không chốt.",
      "Kết bằng cam kết rõ ràng: ai phụ trách, ngày hoàn thành, bằng chứng cần có và điều kiện đổi trạng thái."
    ],
    output: [
      "Trạng thái Green, Yellow hoặc Red kèm một câu giải thích.",
      "Tiến độ thể hiện giá trị đã bàn giao, không phải danh sách hoạt động.",
      "Rủi ro và điểm nghẽn kèm mức độ, người phụ trách, bước tiếp theo và thời hạn.",
      "Các quyết định cần chốt kèm đề nghị cụ thể và phương án khuyến nghị.",
      "Trọng tâm của chu kỳ tiếp theo và dấu hiệu thành công có thể đo được."
    ],
    guardrails: [
      "Không dùng màn trình diễn tiến độ để che tin xấu.",
      "Không báo cáo vanity metric khi nó không gắn với quyết định hoặc kết quả.",
      "Không giao trách nhiệm mơ hồ cho “cả nhóm”; phải nêu vai trò hoặc người chịu trách nhiệm."
    ]
  },
  "doc-spec-tech-spec": {
    title: "Đặc tả kỹ thuật và RFC",
    summary: "Viết đặc tả đủ rõ để ra quyết định, nối mục tiêu sản phẩm với kiến trúc, NFR, mô hình đe dọa, rollout và kiểm chứng.",
    tags: ["RFC", "ADR", "Kiến trúc", "NFR"],
    useWhen: [
      "Khi viết RFC, ADR, đặc tả kỹ thuật, kế hoạch migration, thiết kế hệ thống hoặc tài liệu bàn giao triển khai.",
      "Trước tính năng có phạm vi lớn, phụ thuộc qua nhiều service, migration schema hoặc tác động đến dữ liệu production.",
      "Khi thiết kế có rủi ro về bảo mật, quyền riêng tư, hiệu năng, SEO, khả năng tiếp cận, analytics hoặc hành vi theo ngôn ngữ."
    ],
    process: [
      "Đặt vấn đề: vì sao cần làm, ai bị ảnh hưởng, cách hiện tại hỏng ở đâu và thế nào được xem là thành công.",
      "Kiểm soát phạm vi bằng mục tiêu, phần không làm, giả định, giới hạn và câu hỏi chưa có lời giải.",
      "Mô tả thiết kế đề xuất qua sơ đồ kiến trúc, mô hình dữ liệu, API hoặc sự kiện, phụ thuộc, trường hợp biên và quy tắc tương thích.",
      "So sánh ít nhất hai hướng khả thi theo chi phí, độ phức tạp, rủi ro, khả năng đảo ngược và thời gian tạo ra giá trị.",
      "Lập mô hình rủi ro: STRIDE, tác động quyền riêng tư, miền lỗi, phạm vi ảnh hưởng, rủi ro migration dữ liệu và tải vận hành.",
      "Lập kế hoạch bàn giao: các phần triển khai nhỏ, ma trận kiểm thử, observability, rollout, rollback và kiểm chứng sau phát hành."
    ],
    output: [
      "RFC hoặc ADR hoàn chỉnh, sẵn sàng để xem xét.",
      "Bảng quyết định với các phương án và khuyến nghị.",
      "Kế hoạch triển khai và cách chia ticket.",
      "Danh sách kiểm tra về kiểm thử, rollout, observability và rollback.",
      "Danh sách xác nhận theo vai trò liên quan."
    ],
    guardrails: [
      "Không biến giả định thành yêu cầu khi chưa được kiểm chứng.",
      "Không bỏ phần không làm; đây là ranh giới bảo vệ phạm vi.",
      "Không duyệt đặc tả tác động đến dữ liệu production khi chưa có chi tiết rollback và khôi phục."
    ]
  },
  "proposal-slide-pitch": {
    title: "Đề xuất và trình bày phương án",
    summary: "Xây dựng đề xuất nối đúng vấn đề, giá trị, ROI, rủi ro và bằng chứng, rồi kết lại bằng một quyết định cần chốt thật cụ thể.",
    tags: ["Đề xuất", "Chiến lược", "Giao tiếp với lãnh đạo"],
    useWhen: [
      "Khi viết đề xuất cho lãnh đạo, bản ghi nhớ chiến lược sản phẩm, đề nghị ngân sách, pitch deck hoặc phần giải thích đánh đổi giữa kỹ thuật và kinh doanh.",
      "Khi cần trình bày với C-level, người bảo trợ hoặc người giữ ngân sách để dự án được phê duyệt.",
      "Khi phải giải thích những đánh đổi kiến trúc phức tạp cho người không làm kỹ thuật."
    ],
    process: [
      "Hiểu người nghe: họ coi trọng điều gì, lo ngại điều gì, sẵn sàng cấp vốn cho gì và có quyền phê duyệt đến đâu.",
      "Làm rõ khoảng cách hiện tại qua chi phí, rủi ro, chậm trễ, tỷ lệ rời bỏ, việc thủ công, doanh thu bỏ lỡ hoặc vị thế chiến lược bị đe dọa.",
      "Nêu luận điểm trong một câu: nên làm gì và vì sao cần làm ngay lúc này.",
      "Chứng minh tính khả thi bằng benchmark, tín hiệu từ khách hàng, PoC, kết quả thẩm định kiến trúc, mô hình tài chính hoặc trường hợp tương đương.",
      "Định lượng tác động qua ROI, thời gian hoàn vốn, chi phí tránh được, thời gian chu kỳ giảm, rủi ro giảm hoặc giá trị của quyền lựa chọn.",
      "Chốt đề nghị: quyết định, ngân sách, người phụ trách, thời hạn, chỉ số thành công và phương án dự phòng nếu không được duyệt."
    ],
    output: [
      "Luận điểm một câu và phần trình bày 30 giây.",
      "Mạch kể theo từng slide hoặc cấu trúc bản ghi nhớ.",
      "Mô hình ROI và rủi ro.",
      "Ma trận trả lời các phản biện thường gặp.",
      "Đề nghị quyết định cuối cùng và kế hoạch bước tiếp theo."
    ],
    guardrails: [
      "Không dùng từ thời thượng nếu chúng không giúp người nghe ra quyết định.",
      "Không hứa quá mức về mức độ sử dụng, doanh thu, chi phí tiết kiệm hoặc ngày bàn giao.",
      "Không giấu điều cần xin quyết định; sự mơ hồ sẽ làm cuộc họp kết thúc mà không có lựa chọn nào được chốt."
    ]
  },
  "ai-operating-system": {
    title: "Hệ thống làm việc với AI",
    summary: "Thiết kế quy trình dùng agent với cách chọn model, kiểm soát ngữ cảnh, giới hạn công cụ, bám sát nguồn bằng RAG và các điểm cần con người phê duyệt.",
    tags: ["Điều phối AI", "Agent AI", "RAG", "MCP"],
    useWhen: [
      "Khi thiết kế quy trình nhiều agent, bàn làm việc AI, chuỗi RAG, cách phân việc cho Codex, Claude hoặc GPT, hay chính sách dùng công cụ MCP.",
      "Khi tác vụ cần nhiều pha: truy xuất, suy luận, viết mã, rà soát, lập kế hoạch, tổng hợp hoặc tự động hóa theo quy tắc cố định.",
      "Khi cần biến chuỗi prompt rời rạc thành quy trình vận hành có bước kiểm chứng và điểm phê duyệt."
    ],
    process: [
      "Phân loại mục đích: truy xuất, suy luận, viết mã, rà soát, lập kế hoạch, tổng hợp, thao tác trình duyệt hoặc tự động hóa theo quy tắc cố định.",
      "Chọn model theo năng lực cần có: độ dài ngữ cảnh, độ sâu suy luận, nhu cầu dùng công cụ, độ trễ, chi phí và quyền riêng tư.",
      "Đóng gói ngữ cảnh gồm file nguồn, tài liệu, giới hạn, ví dụ, định nghĩa và phần được loại trừ rõ ràng.",
      "Xác định ranh giới công cụ: quyền đọc và ghi, phạm vi filesystem, chính sách mạng, cách xử lý bí mật và điểm cần phê duyệt.",
      "Thêm lớp kiểm chứng: kiểm tra schema, chạy test, đối chiếu trích dẫn, xem diff, nhờ agent thứ hai phản biện và có phương án dự phòng xác định trước.",
      "Lưu lại quyết định, prompt, ma trận phân việc, tài liệu tạo ra và quy trình có thể dùng lại."
    ],
    output: [
      "Sơ đồ vai trò của các agent và ma trận phân việc.",
      "Mẫu chuẩn bị ngữ cảnh.",
      "Ma trận quyền dùng công cụ và các điểm phê duyệt.",
      "Kế hoạch kiểm chứng và phương án dự phòng.",
      "Bộ prompt hoặc quy trình vận hành có thể dùng lại."
    ],
    guardrails: [
      "Không để agent thay đổi trạng thái production khi chưa có phê duyệt rõ ràng và observability.",
      "Không trộn chỉ dẫn đáng tin với nội dung truy xuất chưa được tin cậy.",
      "Không chỉ chọn model vì khả năng suy luận; phải cân bằng tính đúng đắn, khả năng truy vết, quyền riêng tư và chi phí."
    ]
  },
  "daily-ai-learning-coach": {
    title: "Rèn kỹ năng AI mỗi ngày",
    summary: "Bồi đắp kỹ năng AI bằng luyện tập có chủ đích, chủ động nhớ lại, vòng phản hồi và những tài liệu có thể dùng lại.",
    tags: ["Học tập", "Luyện tập có chủ đích", "Làm việc với AI", "Phản hồi"],
    useWhen: [
      "Khi lập kế hoạch nâng kỹ năng AI hằng ngày, luyện kỹ thuật, dùng công cụ thành thạo hoặc tích lũy kiến thức dài hạn.",
      "Khi muốn cải thiện cách chia nhỏ yêu cầu trong prompt, xem diff, tổng hợp bằng RAG, phản biện kiến trúc, tạo test hoặc điều phối công cụ.",
      "Khi cần duy trì vòng học tập nhỏ, đều và gắn với việc thật thay vì mở một dự án phụ quá lớn."
    ],
    process: [
      "Chọn một kỹ năng nhỏ: chia prompt, xem diff, tổng hợp bằng RAG, phản biện kiến trúc, tạo test hoặc điều phối công cụ.",
      "Luyện trên ngữ cảnh thật như ticket đang làm, codebase, tài liệu, sự cố hoặc quyết định, thay vì chỉ theo hướng dẫn chung chung.",
      "Tạo vòng phản hồi bằng cách yêu cầu AI tìm điểm mù, phản ví dụ, trường hợp biên và phần còn thiếu kiểm chứng.",
      "Biến điều vừa học thành thẻ chủ động nhớ lại, mẫu prompt, danh sách kiểm tra, đoạn mã hoặc ghi chú quyết định.",
      "Lên lịch củng cố bằng spaced repetition và thử áp dụng sang một tác vụ khác.",
      "Đo giá trị qua thời gian tiết kiệm, chất lượng cải thiện, lỗi tránh được, quyết định rõ hơn hoặc tài liệu được dùng lại."
    ],
    output: [
      "Mục tiêu kỹ năng nhỏ trong ngày.",
      "Bài tập với đầu vào và kết quả mong đợi.",
      "Prompt lấy phản hồi và thang đánh giá.",
      "Tài liệu cần lưu lại.",
      "Ngày ôn lại và thử thách áp dụng sang việc khác."
    ],
    guardrails: [
      "Không tính việc đọc thụ động là đã hình thành kỹ năng.",
      "Không luyện năm công cụ trong cùng một buổi; mỗi lần chỉ tập trung vào một hành vi.",
      "Kiểm chứng phần giải thích của AI bằng tài liệu chính thức, mã nguồn trên máy hoặc thử nghiệm thực tế."
    ]
  },
  "notebooklm-source-of-truth": {
    title: "Rút ý có nguồn bằng NotebookLM và RAG",
    summary: "Trích xuất câu trả lời từ tài liệu đáng tin, kèm trích dẫn, kiểm tra mâu thuẫn và nêu rõ điều chưa biết.",
    tags: ["RAG", "Trích dẫn", "Nghiên cứu", "Đồ thị tri thức"],
    useWhen: [
      "Khi làm việc với tập tài liệu lớn như PRD, RFC, bài nghiên cứu, báo cáo tài chính hoặc kho tri thức.",
      "Khi mọi nhận định kỹ thuật đều cần trích dẫn để có thể kiểm tra lại.",
      "Khi cần trích xuất, tổng hợp, so sánh, dựng lại dòng thời gian hoặc phân tích phần còn thiếu."
    ],
    process: [
      "Làm sạch nguồn: loại bỏ bí mật, thông tin đăng nhập, PII và tài liệu ngoài phạm vi được phép.",
      "Truy xuất có trọng tâm theo thực thể, ngày, quyết định, metric, yêu cầu, điểm mâu thuẫn và phần phụ thuộc.",
      "Trích xuất sự kiện: trích dẫn nguyên văn hoặc diễn giải đúng điều tài liệu hỗ trợ, đồng thời giữ tham chiếu tới nguồn.",
      "Tổng hợp thận trọng: tách bằng chứng trực tiếp, phần suy luận, điểm xung đột và điều chưa biết.",
      "Tổ chức kết quả thành dòng thời gian, sơ đồ thực thể, nhật ký quyết định, ma trận yêu cầu hoặc FAQ tùy tác vụ.",
      "Chỉ ra phần còn thiếu và nguồn nào có thể giúp trả lời."
    ],
    output: [
      "Câu trả lời trực tiếp với trích dẫn cho các nhận định về sự kiện.",
      "Bảng bằng chứng gồm nhận định, nguồn, độ tin cậy, ngày và điểm cần lưu ý.",
      "Các mâu thuẫn và cảnh báo về nguồn đã cũ.",
      "Sơ đồ thực thể, dòng thời gian hoặc quyết định khi hữu ích.",
      "Điều chưa biết và nguồn nên kiểm tra tiếp."
    ],
    guardrails: [
      "Nếu nguồn không hỗ trợ nhận định, ghi rõ: tài liệu không cung cấp thông tin này.",
      "Không dùng kiến thức bên ngoài khi tác vụ không cho phép.",
      "Không hòa các nguồn mâu thuẫn thành một kết luận có vẻ chắc chắn nhưng sai."
    ]
  },
  "ai-delivery-factory": {
    title: "Làm phần mềm cùng AI và CI/CD",
    summary: "Tổ chức quá trình làm phần mềm có AI hỗ trợ, từ lúc chốt yêu cầu đến triển khai, kiểm chứng, mở PR và chuẩn bị release.",
    tags: ["Giao phần mềm với AI", "CI/CD", "Kiểm thử", "Tự động hóa"],
    useWhen: [
      "Khi agent AI hỗ trợ làm tính năng, refactor, migration, bộ test, thay đổi CI hoặc chuẩn bị release.",
      "Khi quy trình cần tách trách nhiệm giữa viết đặc tả, viết mã, rà soát và kiểm chứng.",
      "Khi agent có thể sửa file, commit, push, mở PR hoặc chỉ chuẩn bị patch tùy mức phê duyệt."
    ],
    process: [
      "Chốt phạm vi: diễn đạt lại yêu cầu, tiêu chí nghiệm thu, phần không làm, phần hệ thống bị ảnh hưởng và mức rủi ro.",
      "Chia việc thành những phần triển khai nhỏ; mỗi phần đều có bước kiểm chứng riêng.",
      "Triển khai dựa trên code hiện có: theo quy ước của dự án, giữ nguyên thay đổi không liên quan của người dùng và tránh refactor lan rộng.",
      "Kiểm chứng sớm bằng typecheck, lint, test unit, integration, E2E, kiểm tra schema, khả năng tiếp cận và bảo mật tùy phạm vi.",
      "Xem lại diff đã stage để phát hiện bí mật, file tạo ra ngoài ý muốn, các event analytics chưa được gắn và rủi ro migration.",
      "Bàn giao sạch: dùng Conventional Commit, chỉ push khi được phép, ghi rõ tác động và kết quả kiểm chứng trong PR."
    ],
    output: [
      "Kế hoạch thực hiện và tóm tắt các file đã đổi.",
      "Bằng chứng kiểm chứng kèm kết quả lệnh.",
      "Nội dung commit và bản nháp mô tả PR.",
      "Ghi chú về release, triển khai và rollback.",
      "Rủi ro còn lại hoặc ticket cần làm tiếp."
    ],
    guardrails: [
      "Không đưa bí mật, kết quả build trên máy, metadata của runtime hoặc thay đổi không liên quan của người dùng vào commit.",
      "Không dùng chính diff do agent tạo ra làm căn cứ duy nhất để tự phê duyệt.",
      "Không deploy hoặc thay đổi production khi con người chưa yêu cầu rõ ràng."
    ]
  },
  "claude-deep-review": {
    title: "Dùng Claude để phản biện sâu",
    summary: "Phản biện theo hướng đối nghịch để làm lộ giả định yếu, tình huống lỗi, chỗ mơ hồ và điểm mong manh của toàn hệ thống.",
    tags: ["Rà soát đối nghịch", "Red Team", "Kiến trúc", "Bảo mật"],
    useWhen: [
      "Khi cần phản biện sâu PR, RFC, đề xuất kiến trúc, bản tường thuật sự cố, bản ghi nhớ chiến lược hoặc kế hoạch do AI tạo.",
      "Khi thiết kế có rủi ro về xử lý đồng thời, toàn vẹn dữ liệu, điểm tấn công, giới hạn quy mô hoặc rollout chưa rõ.",
      "Khi cần một người rà soát độc lập chỉ thẳng mắt xích yếu nhất trước khi bắt tay triển khai."
    ],
    process: [
      "Phân rã hệ thống thành tác nhân, luồng dữ liệu, chuyển đổi trạng thái, phần phụ thuộc, ranh giới tin cậy và miền lỗi.",
      "Thử phá các giả định bằng đầu vào sai, tải đồng thời cao, lỗi một phần, phân vùng mạng, cache cũ, người dùng có ý đồ xấu và lỗi vận hành.",
      "Lần theo phạm vi ảnh hưởng: hỏng dữ liệu, mất khả dụng, xâm phạm quyền riêng tư, tác động khách hàng, chi phí tăng vọt và gánh nặng vận hành.",
      "So hướng đề xuất với phương án đơn giản hơn, an toàn hơn, rẻ hơn hoặc dễ rollback hơn.",
      "Viết lại câu chữ yếu, loại bỏ chỗ mơ hồ, nhận định thiếu căn cứ, phụ thuộc bị giấu và sự chắc chắn giả tạo.",
      "Đưa ra cách giảm rủi ro cụ thể gồm phần cần sửa, bước kiểm chứng và điểm cần ra quyết định."
    ],
    output: [
      "Các rủi ro nghiêm trọng cùng kịch bản khai thác hoặc sự cố cụ thể.",
      "Những giả định cần chứng minh.",
      "Các thiết kế thay thế kèm đánh đổi.",
      "Kế hoạch giảm nhẹ được xếp theo mức giảm rủi ro.",
      "Khuyến nghị Go hoặc No-Go với ngưỡng bằng chứng rõ ràng."
    ],
    guardrails: [
      "Nói thẳng nhưng dựa trên bằng chứng; phản biện công việc, không công kích người làm.",
      "Không chấp nhận kiểu kết luận “có lẽ ổn” cho bảo mật, toàn vẹn dữ liệu hoặc rollback.",
      "Không dừng ở phê bình; phải chỉ ra con đường nhỏ nhất để giảm rủi ro."
    ]
  },
  "career-ai-strategy": {
    title: "Tích lũy năng lực kỹ thuật lâu dài",
    summary: "Tạo đà phát triển nghề nghiệp bền vững bằng cách nhận việc ở tầm Staff, làm chủ AI, xây hồ sơ năng lực có bằng chứng và duy trì thói quen tích lũy theo thời gian.",
    tags: ["Chiến lược nghề nghiệp", "Staff Engineer", "Giá trị tích lũy", "Hồ sơ năng lực"],
    useWhen: [
      "Khi lập kế hoạch nghề nghiệp, lộ trình lên Staff hoặc Principal, hồ sơ thăng chức, chiến lược dùng AI hoặc lộ trình xây hồ sơ năng lực.",
      "Khi cần hệ thống hóa tác động của dự án thành bằng chứng cụ thể như ADR, postmortem, bài viết kỹ thuật, OSS, bài nói chuyện hoặc công cụ nội bộ.",
      "Khi muốn giữ nhiều lựa chọn giữa Staff IC, quản lý kỹ thuật, người sáng lập, tư vấn hoặc chuyên gia hệ thống AI."
    ],
    process: [
      "Xác định luận điểm nghề nghiệp: với tổ hợp kỹ năng hiện có, bạn có thể giải quyết vấn đề nào trên thị trường tốt hơn?",
      "Đánh giá năng lực: chiều sâu kỹ thuật, thiết kế hệ thống, cảm nhận sản phẩm, giao tiếp, lãnh đạo, khả năng làm việc với AI và phán đoán kinh doanh.",
      "Xác định tài sản tạo đòn bẩy: công cụ, tiêu chuẩn, quy trình, bài viết công khai, OSS, bài nói chuyện, hoạt động cố vấn và tài liệu kiến trúc.",
      "Chọn hai hoặc ba dự án có cơ hội tạo giá trị lớn hơn công sức bỏ ra, tác động dễ thấy và bằng chứng có thể dùng lại.",
      "Lập kế hoạch vận hành 90 ngày gồm kết quả, nhịp làm việc, tài liệu cần tạo, cách thống nhất với người liên quan và vòng phản hồi hằng tuần.",
      "Theo dõi bằng chứng: metric trước và sau, mức độ sử dụng, độ tin cậy tăng, thời gian tiết kiệm, quyết định mình đã góp phần cải thiện và người khác được hỗ trợ."
    ],
    output: [
      "Luận điểm nghề nghiệp và cách định vị bản thân.",
      "Ma trận năng lực với phần còn thiếu và bằng chứng.",
      "Lộ trình tạo đòn bẩy trong 90 ngày.",
      "Kế hoạch xây dựng hồ sơ năng lực.",
      "Chiến lược cố vấn, xây dựng uy tín chuyên môn và làm việc với các bên liên quan."
    ],
    guardrails: [
      "Không chăm chút chức danh nhiều hơn phạm vi công việc thật và kết quả tạo ra.",
      "Không nhầm việc dùng nhiều công cụ với khả năng làm việc tốt cùng AI; hãy đo chất lượng, tốc độ, phán đoán và mức đòn bẩy.",
      "Không đánh đổi chiều sâu kỹ thuật để lấy bề rộng hời hợt."
    ]
  },
  "engineering-decision-map": {
    title: "Bản đồ quyết định kiến trúc",
    summary: "Nối yêu cầu kinh doanh với invariant của miền, các phương án kiến trúc, đánh đổi, rủi ro và mức sẵn sàng vận hành.",
    tags: ["Ma trận quyết định", "Tư duy hệ thống", "Đánh đổi", "Yêu cầu"],
    useWhen: [
      "Khi yêu cầu còn mơ hồ, quyết định liên quan nhiều bộ phận hoặc kiến trúc phải cân bằng sản phẩm, dữ liệu và vận hành.",
      "Khi tính năng chạm vào miền lõi, tính nhất quán dữ liệu, tích hợp, phân quyền hoặc migration.",
      "Khi cần phân định việc AI có thể thực hiện và việc kiến trúc sư phải trực tiếp quyết định."
    ],
    process: [
      "Rút ra các invariant: điều gì luôn phải đúng với người dùng, tiền, quyền truy cập, dữ liệu và tuân thủ.",
      "Vẽ toàn bộ hệ thống: quy trình kinh doanh, đối tượng miền, hợp đồng API, nơi lưu dữ liệu, hạ tầng, vận hành và hỗ trợ.",
      "Đưa ra các phương án như CRUD, CQRS, event sourcing, quy trình dựa trên queue, modular monolith, tách service hoặc Strangler Fig.",
      "Chấm các đánh đổi theo khả năng đảo ngược, tốc độ bàn giao, tính nhất quán dữ liệu, độ phức tạp vận hành, chi phí, độ tin cậy và mức phù hợp với nhóm.",
      "Chạy FMEA để chỉ ra tình huống lỗi, phạm vi ảnh hưởng, cách phát hiện, giảm nhẹ, rollback và suy giảm có kiểm soát.",
      "Chốt quyết định: phân biệt lựa chọn dễ đảo ngược với lựa chọn khó quay lại, ghi rõ technical debt được chấp nhận và mốc kiểm chứng."
    ],
    output: [
      "Sơ đồ nối yêu cầu với kiến trúc.",
      "Ma trận quyết định có trọng số.",
      "Phương án khuyến nghị và các phương án bị loại.",
      "Sổ đăng ký rủi ro và kế hoạch giảm nhẹ.",
      "Đánh giá mức sẵn sàng vận hành và phác thảo rollout."
    ],
    guardrails: [
      "Không chọn công nghệ thú vị chỉ vì mới lạ nếu công nghệ quen thuộc đã giữ invariant đủ tốt.",
      "Không chốt quyết định khi chưa có observability và rollback.",
      "Phải nói rõ điểm thiết kế bắt đầu không chịu nổi tải hoặc độ phức tạp, không ngầm hứa khả năng mở rộng vô hạn."
    ]
  },
  "staff-engineer-ai-review-pack": {
    title: "Rà rủi ro kiến trúc",
    summary: "Rà soát thay đổi kỹ thuật rủi ro cao qua các góc nhìn độc lập: sản phẩm, kiến trúc, bảo mật, dữ liệu, SRE, QA và rollout.",
    tags: ["Staff Engineer", "Rà soát kiến trúc", "PRR", "Rà soát rủi ro"],
    useWhen: [
      "Khi rà soát thay đổi kiến trúc lớn, tích hợp nhiều hệ thống, tính năng dùng dữ liệu nhạy cảm, migration hoặc mức sẵn sàng phát hành.",
      "Khi PR hoặc RFC tác động service Tier-1, hợp đồng API, thay đổi schema, mô hình xác thực hoặc SLO.",
      "Khi cần Production Readiness Review trước lúc merge hoặc đưa vào hoạt động."
    ],
    process: [
      "Góc nhìn sản phẩm: kiểm chứng giá trị cho người dùng, nhóm rollout, tiêu chí nghiệm thu và chi phí của việc trì hoãn hoặc đơn giản hóa.",
      "Góc nhìn kiến trúc: ranh giới, mức độ phụ thuộc, khả năng tương thích, hợp đồng, khả năng mở rộng và sai lệch khỏi kiến trúc chủ đích.",
      "Góc nhìn bảo mật và quyền riêng tư: STRIDE, IAM/RBAC/ABAC, lộ dữ liệu, cách ly tenant, bí mật, mã hóa và khả năng kiểm toán.",
      "Góc nhìn dữ liệu: an toàn migration, hành vi của index và lock, backfill, tính nhất quán, thời hạn lưu giữ, sao lưu, khôi phục và đối soát.",
      "Góc nhìn SRE: tác động đến SLO, năng lực tải, cảnh báo, dashboard, runbook, gánh nặng trực on-call, miền lỗi và điều kiện rollback.",
      "Góc nhìn QA: mức phủ của test unit, integration, E2E, contract, tải, chaos, khả năng tiếp cận và kiểm thử thăm dò."
    ],
    output: [
      "Ma trận rủi ro liên chức năng.",
      "Điểm chặn bắt buộc và điều kiện phát hành.",
      "Điểm sẵn sàng production cùng khuyến nghị Go hoặc No-Go.",
      "Các xác nhận bắt buộc và người phụ trách.",
      "Lộ trình đi từ trạng thái hiện tại đến trạng thái đích."
    ],
    guardrails: [
      "Không chấp thuận viết lại theo kiểu thay toàn bộ một lần khi chưa có kế hoạch migration từng bước.",
      "Không công nhận là sẵn sàng phát hành khi thiếu SLO đo được và điều kiện rollback.",
      "Ưu tiên toàn vẹn dữ liệu, quyền riêng tư và độ tin cậy hơn vẻ ngoài của một tiến độ đẹp."
    ]
  },
  "data-resilience-observability-review": {
    title: "Resilience và Observability cho hệ thống phân tán",
    summary: "Rà soát tính toàn vẹn dữ liệu, distributed resilience, telemetry và recovery plan trước khi hệ thống chịu tải production.",
    tags: ["Dữ liệu", "Khả năng phục hồi", "Observability", "SRE"],
    useWhen: [
      "Khi thiết kế database, cache, queue, search index, event stream, third-party integration hoặc rà soát production readiness.",
      "Khi PR thay đổi schema, cách truy vấn, mô hình nhất quán, lớp cache, quy tắc của queue hoặc cách khôi phục.",
      "Khi cần chuẩn bị dashboard SLO, cảnh báo, runbook, kiểm thử khôi phục và danh sách kiểm tra trước khi vận hành."
    ],
    process: [
      "Toàn vẹn dữ liệu: ranh giới transaction, mức isolation, constraint, idempotency, khử trùng lặp, đối soát và an toàn migration.",
      "Truy vấn và lưu trữ: index, cardinality, lock, phân vùng nóng, truy cập N+1, connection pool, thời hạn lưu giữ và lưu trữ dài hạn.",
      "Hành vi cache và queue: làm mới dữ liệu, chống stampede, TTL, thứ tự, phát lại, DLQ, poison message và backpressure.",
      "Mô phỏng lỗi: phân vùng mạng, phụ thuộc phản hồi chậm, ghi dữ liệu một phần, sự kiện trùng, chuyển vùng và sự cố bên thứ ba.",
      "Telemetry: RED/USE metrics, OpenTelemetry trace, log có cấu trúc, correlation ID, dashboard, cảnh báo SLO burn và runbook.",
      "Khôi phục: phục hồi từ bản sao lưu, point-in-time recovery, RPO/RTO, script rollback và quy trình sửa dữ liệu."
    ],
    output: [
      "Đánh giá tính nhất quán và toàn vẹn dữ liệu.",
      "Ma trận tình huống lỗi kèm cách giảm nhẹ.",
      "Đặc tả telemetry và kế hoạch dashboard.",
      "Kế hoạch kiểm thử tải, chaos và khôi phục.",
      "Danh sách kiểm tra trước khi vận hành kèm điều kiện rollback hoặc khôi phục."
    ],
    guardrails: [
      "Không giả định mạng, đồng hồ, cache, queue hoặc phụ thuộc bên thứ ba luôn đáng tin cậy.",
      "Không ghi PII, bí mật, token hoặc payload nhạy cảm vào log.",
      "Không đánh thức người trực bằng cảnh báo mà họ không thể hành động."
    ]
  },
  "installed-skill-library-cartographer": {
    title: "Danh mục AI Skills đã cài",
    summary: "Kiểm kê skill đã cài, loại bản trùng, phân nhóm năng lực và biến những quy trình rải rác thành hệ thống giúp chọn đúng skill.",
    tags: ["Danh mục kỹ năng", "Điều phối agent", "Phân loại", "Quản trị"],
    useWhen: [
      "Dựa trên lần quét máy gần nhất: 14.541 file SKILL.md thô, 5.035 nội dung không trùng và 3.116 tên không trùng; mức chồng lặp lớn giữa Codex, Claude, Gemini, Antigravity CLI/IDE và các runtime agent trên máy.",
      "Khi cần tổng hợp skill từ Codex, Claude, Gemini, Antigravity, thư mục .agents, plugin, marketplace hoặc skill riêng của dự án.",
      "Khi thư viện có quá nhiều bản trùng hoặc bản cache và cần rút gọn thành hệ phân loại năng lực rõ ràng.",
      "Khi muốn cập nhật thư viện skill của Studio dựa trên dữ liệu thật thay vì cảm tính."
    ],
    process: [
      "Kiểm kê nguồn: Codex, Claude, Gemini, Antigravity CLI/IDE, thư mục .agents, skill riêng của dự án, plugin và cache marketplace.",
      "Trích xuất metadata: tên, mô tả, quy tắc kích hoạt, từ khóa miền, kết quả mong đợi và giới hạn an toàn.",
      "Gom nhóm năng lực: kỹ thuật, frontend và UI, backend và nền tảng, bảo mật, agent AI, nghiên cứu, nội dung, sản phẩm, vận hành, di động và học tập.",
      "Tìm khoảng trống: năng lực xuất hiện nhiều trong các skill đã cài nhưng còn thiếu ở thư viện Studio công khai.",
      "Tổng hợp skill đích: gộp các quy trình trùng nhau thành skill chuyên sâu, rõ ràng và không lặp.",
      "Kiểm tra mức phù hợp: mỗi skill cuối cùng phải có điều kiện kích hoạt, ngữ cảnh cần thiết, quy trình, hợp đồng kết quả và giới hạn."
    ],
    output: [
      "Tóm tắt kiểm kê: số file thô, nội dung không trùng, tên không trùng và các runtime được hỗ trợ.",
      "Hệ phân loại năng lực gắn với từng nhóm nguồn.",
      "Phân tích khoảng trống so với thư viện skill hiện tại.",
      "Đề xuất thêm, gộp hoặc bỏ skill.",
      "Bản tiếng Anh và tiếng Việt sẵn sàng đưa lên giao diện."
    ],
    guardrails: [
      "Không công khai đường dẫn trên máy, tên người dùng, token, thông tin đăng nhập hoặc chi tiết không gian làm việc riêng tư.",
      "Không làm thư viện phình ra bằng cách đưa mọi skill trùng lặp lên giao diện.",
      "Không chép nguyên nội dung marketplace hoặc cache khi chưa điều chỉnh từ ngữ và mục đích sử dụng cho phù hợp."
    ]
  },
  "ai-product-evaluation": {
    title: "Đánh giá sản phẩm AI",
    summary: "Đưa tính năng AI từ bản demo bắt mắt thành sản phẩm đáng tin bằng eval, ranh giới an toàn, kiểm soát chi phí và giá trị người dùng có thể đo được.",
    tags: ["Sản phẩm AI", "Eval", "Chất lượng LLM", "Độ tin cậy"],
    useWhen: [
      "Khi thiết kế, rà soát hoặc phát hành tính năng sản phẩm AI, agent, copilot, giao diện chat, hệ thống truy xuất hoặc quy trình dùng model.",
      "Khi cần phân biệt bản demo đẹp với hành vi đủ đáng tin trên production.",
      "Khi cần đo hallucination, độ chính xác khi gọi công cụ, độ trung thực của trích dẫn, độ trễ, lượng token tiêu thụ và tỷ lệ hoàn thành tác vụ."
    ],
    process: [
      "Xác định lời hứa của sản phẩm: AI giúp người dùng làm gì và tuyệt đối không được làm gì.",
      "Tách yêu cầu của demo khỏi production: nguồn làm căn cứ, quyền hạn, UX dự phòng, observability, giới hạn tần suất và kiểm soát lạm dụng.",
      "Xây eval gồm tác vụ chuẩn, prompt đối nghịch, bộ regression, thang đánh giá của con người và ngưỡng nghiệm thu.",
      "Đo cả chất lượng lẫn chi phí: tỷ lệ thành công, hallucination, độ chính xác khi gọi công cụ, độ trung thực của trích dẫn, độ trễ, token tiêu thụ và tác động đến hỗ trợ.",
      "Thiết kế UX tạo lòng tin: hiển thị nguồn, diễn đạt độ chắc chắn, cho phép chỉnh sửa, có nhật ký, hoàn tác, chuyển cấp và bàn giao cho con người.",
      "Lập kế hoạch rollout bằng shadow mode, allowlist, feature flag, rà soát Red Team, telemetry, quy trình xử lý sự cố và phương án quay lại model hoặc nhà cung cấp cũ."
    ],
    output: [
      "Bản mô tả tính năng AI với lời hứa, phần không làm và nhóm rủi ro.",
      "Kế hoạch đánh giá với tập dữ liệu, thang chấm, ngưỡng và người phụ trách.",
      "Danh sách kiểm tra an toàn và UX tạo lòng tin.",
      "Ngân sách chi phí, độ trễ và kế hoạch theo dõi.",
      "Kế hoạch rollout và rollback."
    ],
    guardrails: [
      "Không phát hành tính năng AI nếu eval không phản ánh tác vụ thật của người dùng.",
      "Không che độ bất định, nguồn còn thiếu hoặc giới hạn của model với người dùng.",
      "Không cấp quyền ghi cho agent khi chưa có ranh giới quyền hạn và nhật ký kiểm toán."
    ]
  },
  "agent-tools-mcp-automation": {
    title: "Công cụ AI agent, MCP và tự động hóa",
    summary: "Thiết kế agent dùng công cụ ổn định với MCP, GitHub, Slack, Gmail, Outlook, Notion, Airtable, trình duyệt và CLI trên máy.",
    tags: ["MCP", "Tự động hóa", "Tích hợp", "Dùng công cụ"],
    useWhen: [
      "Khi agent cần dùng công cụ, connector, MCP server, CLI, trình duyệt hoặc tích hợp ứng dụng để hoàn thành quy trình.",
      "Khi tác vụ có quyền đọc hoặc ghi, ranh giới tài khoản ứng dụng, schema, phân trang hoặc thay đổi trạng thái.",
      "Khi cần tự động hóa đáng tin nhưng vẫn có nhật ký kiểm toán và điểm phê duyệt."
    ],
    process: [
      "Khám phá công cụ: đọc schema và xác định đủ ID bắt buộc trước khi thực hiện.",
      "Phân loại hành động: chỉ đọc, tạo bản nháp, ghi sau khi người dùng duyệt, ghi ngay, lên lịch, phá hủy hoặc xuất bản ra bên ngoài.",
      "Chuẩn hóa đầu vào: phân giải ID, kiểm tra schema, xử lý múi giờ, làm sạch nội dung không đáng tin và giữ liên kết nguồn.",
      "Thực hiện an toàn: chỉ chạy theo lô khi các lệnh độc lập, phân trang đến khi đủ dữ liệu, lưu điểm giữa chừng cho việc dài và giữ kết quả có thể kiểm tra.",
      "Kiểm chứng kết quả: đối chiếu trạng thái trả về với trạng thái được yêu cầu, lưu liên kết hoặc tài liệu và nêu rõ lỗi một phần.",
      "Bàn giao bằng bản tóm tắt ngắn, tài liệu tạo ra, rủi ro còn lại và quyết định tiếp theo cần con người chốt."
    ],
    output: [
      "Kế hoạch dùng công cụ với ứng dụng, hành động, mức quyền và nhóm rủi ro.",
      "Đầu vào thực thi đúng schema.",
      "Tóm tắt kết quả kèm liên kết nguồn hoặc tham chiếu tài liệu.",
      "Ghi chú lỗi, retry và điểm nghẽn chưa được giải quyết.",
      "Nhật ký kiểm toán cho các hành động làm thay đổi trạng thái."
    ],
    guardrails: [
      "Không thực hiện hành động ghi hoặc phá hủy khi chưa có phê duyệt rõ ràng hay quy trình tạo bản nháp trước.",
      "Không bịa slug của công cụ, trường API, ID tài khoản, kênh, thư mục hoặc file.",
      "Không làm lộ bí mật, OAuth token, payload riêng tư hoặc dữ liệu ứng dụng không liên quan."
    ]
  },
  "product-analytics-growth": {
    title: "Phân tích sản phẩm và thử nghiệm tăng trưởng",
    summary: "Biến dữ liệu hành vi thành quyết định qua hệ thống sự kiện, funnel, cohort, thử nghiệm A/B, attribution và vòng tăng trưởng.",
    tags: ["Đo lường", "Tăng trưởng", "Thử nghiệm", "PostHog"],
    useWhen: [
      "Khi thiết kế analytics, rà soát tracking, lập kế hoạch thử nghiệm tăng trưởng, đo funnel hoặc đánh giá tính năng có hiệu quả hay không.",
      "Khi đường dẫn công khai, CTA, bộ lọc, giao diện lệnh, biểu mẫu hoặc liên kết ra ngoài cần được đo đúng.",
      "Khi cần nối metric sản phẩm với quyết định thay vì tạo một dashboard chỉ đẹp để nhìn."
    ],
    process: [
      "Xác định trước quyết định sẽ thay đổi thế nào nếu metric tăng, không đổi hoặc dữ liệu chưa đủ để kết luận.",
      "Thiết kế hệ thống sự kiện: tên sự kiện, thuộc tính, cách xác định danh tính, nơi phát sinh và phiên bản.",
      "Kiểm tra việc gắn đo lường cho lượt xem trang, lượt nhấp, biểu mẫu, bộ lọc, liên kết ra ngoài, giao diện tìm kiếm hoặc lệnh và trạng thái lỗi.",
      "Phân tích hành vi qua funnel, cohort, đường cong giữ chân, phân nhóm, điểm người dùng rời luồng, tương quan và ngữ cảnh định tính.",
      "Lập kế hoạch thử nghiệm với giả thuyết, metric chính, metric bảo vệ, cỡ mẫu, kế hoạch tăng dần tỷ lệ và điều kiện dừng.",
      "Báo cáo điều học được: điều gì thay đổi, điều gì không, độ tin cậy, quyết định tiếp theo và phần đo lường cần bổ sung."
    ],
    output: [
      "Kế hoạch tracking với sự kiện, thuộc tính, người phụ trách và nơi phát sinh.",
      "Đặc tả dashboard funnel và cohort.",
      "Bản mô tả thử nghiệm với giả thuyết, metric và ngưỡng bảo vệ.",
      "Danh sách kiểm tra chất lượng dữ liệu.",
      "Bản ghi nhớ quyết định kèm khuyến nghị."
    ],
    guardrails: [
      "Không tối ưu vanity metric khi nó không ảnh hưởng đến quyết định.",
      "Không thêm giao diện công khai khi thiếu analytics theo quy ước của sản phẩm.",
      "Không bỏ qua lựa chọn về quyền riêng tư, Do Not Track, sự đồng ý hoặc giới hạn của autocapture và session recording."
    ]
  },
  "research-market-intelligence": {
    title: "Nghiên cứu và thông tin thị trường",
    summary: "Thực hiện nghiên cứu có căn cứ từ tài liệu trên máy, nguồn web, đối thủ, khách hàng, bài nghiên cứu và tín hiệu thị trường, đồng thời nêu rõ độ tin cậy.",
    tags: ["Nghiên cứu", "Thông tin thị trường", "Bám sát nguồn", "Tổng hợp"],
    useWhen: [
      "Khi nghiên cứu thị trường, phân tích đối thủ, khám phá sản phẩm, tổng hợp hiểu biết về khách hàng hoặc rà soát tài liệu kỹ thuật.",
      "Khi cần tìm thông tin mới nhất trên web hoặc nghiên cứu chỉ dùng dữ liệu trên máy với ranh giới nguồn rõ ràng.",
      "Khi quyết định cần bảng bằng chứng thay vì ý kiến cá nhân."
    ],
    process: [
      "Đặt câu hỏi nghiên cứu quanh quyết định, phạm vi, phần không làm, giả định và độ tin cậy cần đạt.",
      "Bắt đầu từ dữ liệu trên máy: đọc tài liệu được cung cấp, ghi chú trong repo, quyết định trước đây và tài liệu nội bộ trước khi tìm bên ngoài.",
      "Thu thập bằng chứng: ưu tiên nguồn sơ cấp, đối chiếu ngày, xem động cơ của nguồn và lưu trích dẫn.",
      "Tìm mẫu hình trong hành vi người dùng, cách đối thủ định vị, jobs-to-be-done, mức sẵn lòng chi trả, rào cản sử dụng và thời điểm thị trường.",
      "Tách tín hiệu khỏi suy đoán: ghi rõ sự kiện, suy luận, tín hiệu yếu, mâu thuẫn và điều chưa biết.",
      "Khuyến nghị hành động: quyết định tiếp theo hoặc thử nghiệm nhỏ nhất có thể thu hẹp điều chưa chắc chắn."
    ],
    output: [
      "Bản tóm tắt nghiên cứu với câu hỏi, phạm vi và độ tin cậy.",
      "Bảng bằng chứng với nguồn, ngày, nhận định và điểm cần lưu ý.",
      "Bản tổng hợp về đối thủ, khách hàng và chủ đề.",
      "Điều chưa biết và sổ đăng ký rủi ro.",
      "Thử nghiệm hoặc quyết định tiếp theo được khuyến nghị."
    ],
    guardrails: [
      "Không tìm nguồn bên ngoài khi tác vụ yêu cầu chỉ dùng dữ liệu trên máy.",
      "Không biến nhận định cũ hoặc truyền lại qua người khác thành bằng chứng sơ cấp hiện tại.",
      "Không giấu phần chưa chắc chắn; phải nêu độ tin cậy và khoảng trống bằng chứng."
    ]
  },
  "security-privacy-threat-modeling": {
    title: "Bảo mật, quyền riêng tư và mô hình đe dọa",
    summary: "Rà soát các kịch bản lạm dụng, lỗi xác thực và phân quyền, nguy cơ lộ PII, rủi ro chuỗi cung ứng, thiếu sót tuân thủ và cách rollout an toàn.",
    tags: ["Bảo mật", "Quyền riêng tư", "Mô hình đe dọa", "Tuân thủ"],
    useWhen: [
      "Khi thay đổi chạm đến xác thực, phân quyền, đầu vào người dùng, dữ liệu nhạy cảm, thanh toán, tải file, tích hợp, công cụ AI hoặc hạ tầng.",
      "Khi cần rà soát luồng dữ liệu, log, thuộc tính analytics, bí mật hoặc bên thứ ba xử lý dữ liệu.",
      "Khi cần khuyến nghị Go hoặc No-Go về bảo mật trước rollout."
    ],
    process: [
      "Vẽ tài sản và ranh giới tin cậy: dữ liệu người dùng, thông tin đăng nhập, token, thanh toán, API nội bộ, ngữ cảnh model và công cụ quản trị.",
      "Chạy STRIDE và LINDDUN cho giả mạo, sửa đổi, chối bỏ, lộ thông tin, từ chối dịch vụ, nâng quyền và rủi ro quyền riêng tư.",
      "Thử các kịch bản lạm dụng: injection, XSS, CSRF, IDOR, SSRF, RCE, path traversal, prompt injection và nâng quyền.",
      "Kiểm tra quyền riêng tư: tối thiểu hóa dữ liệu, sự đồng ý, che PII, vệ sinh log, thuộc tính analytics, thời hạn giữ và xóa dữ liệu.",
      "Đánh giá chuỗi cung ứng: dependency, SCA, SAST, quét bí mật, sai lệch container hoặc IaC và quyền của CI.",
      "Xác định cách giảm nhẹ: biện pháp bắt buộc phải có, biện pháp bù, ca kiểm thử, theo dõi, giới hạn rollout và runbook xử lý sự cố."
    ],
    output: [
      "Mô hình đe dọa với tài sản, tác nhân, ranh giới và giả định.",
      "Các lỗ hổng được xếp theo mức độ nghiêm trọng.",
      "Ghi chú tác động quyền riêng tư và sơ đồ luồng dữ liệu.",
      "Phần bắt buộc sửa và test kiểm chứng.",
      "Khuyến nghị Go hoặc No-Go về bảo mật."
    ],
    guardrails: [
      "Không ghi log, sao chép hoặc công khai bí mật, token, khóa riêng hay payload nhạy cảm.",
      "Không nói chung chung “làm sạch đầu vào”; phải nêu biện pháp cụ thể và vị trí áp dụng.",
      "Không chấp thuận tính năng dùng dữ liệu nhạy cảm khi thiếu khả năng kiểm toán và rollback."
    ]
  },
  "design-system-ui-craft": {
    title: "Design system và chất lượng UI",
    summary: "Tạo giao diện chỉn chu, dễ tiếp cận và thích ứng tốt bằng design system, thư viện component, thứ bậc thị giác và trạng thái tương tác đầy đủ.",
    tags: ["Design system", "UI", "Accessibility", "Responsive"],
    useWhen: [
      "Khi xây dựng hoặc tinh chỉnh UI sản phẩm, design system, dashboard, landing page, bố cục di động, thư viện component hoặc prototype.",
      "Khi cần UI vừa đẹp vừa dễ dùng, có đủ trạng thái và giới hạn thích ứng màn hình.",
      "Khi cần nối chất lượng thiết kế với telemetry và cách triển khai."
    ],
    process: [
      "Hiểu công việc thật của người dùng: quy trình lặp lại, cách họ lướt thông tin, lượng quyết định phải đưa ra và cách phục hồi sau lỗi.",
      "Ưu tiên hệ thống hiện có: token, khoảng cách, biểu tượng, ngữ nghĩa nút, tab, menu, biểu mẫu, biểu đồ, bảng và trạng thái trống.",
      "Thiết kế đủ trạng thái: hover, focus, vô hiệu hóa, đang tải, skeleton, trống, lỗi, thành công, tràn nội dung, văn bản dài và di động.",
      "Tạo thứ bậc thị giác qua cỡ chữ, nhịp khoảng cách, độ tương phản, mật độ, cách gom nhóm, dấu hiệu tương tác và giới hạn bố cục.",
      "Kiểm chứng độ chỉn chu bằng ảnh chụp, kiểm tra trên nhiều kích thước màn hình, không chồng lấn, kích thước ổn định, điều hướng bàn phím và độ tương phản màu.",
      "Nối telemetry để đo quyết định trên UI, bộ lọc, lệnh, CTA, biểu mẫu, liên kết ra ngoài và thay đổi thiết lập."
    ],
    output: [
      "Ý tưởng UI và lý do chọn bố cục.",
      "Danh sách component và trạng thái.",
      "Danh sách kiểm tra khả năng thích ứng nhiều màn hình và khả năng tiếp cận.",
      "Ghi chú triển khai gắn với design system hiện có.",
      "Kế hoạch chụp ảnh hoặc kiểm chứng bằng trình duyệt khi cần."
    ],
    guardrails: [
      "Không làm landing page khi người dùng yêu cầu một công cụ hoặc ứng dụng.",
      "Không dùng gradient hay khối trang trí để thay cho hình ảnh thực sự liên quan đến sản phẩm.",
      "Không phát hành giao diện còn tràn chữ, chồng lấn hoặc vỡ trên thiết bị di động."
    ]
  },
  "mobile-platform-engineering": {
    title: "Kỹ thuật nền tảng di động",
    summary: "Xây dựng và rà soát ứng dụng iOS, Android, SwiftUI, Kotlin, React Native, cùng quy trình phát hành lên app store với kỷ luật về hiệu năng và release.",
    tags: ["Di động", "iOS", "Android", "SwiftUI"],
    useWhen: [
      "Khi làm iOS hoặc Android native, SwiftUI, Kotlin, React Native, đóng gói ứng dụng, phát hành lên app store hoặc rà soát UI và hiệu năng di động.",
      "Khi thay đổi trên di động cần ma trận thiết bị, khả năng tiếp cận, báo cáo crash, khai báo quyền riêng tư và rollout theo từng giai đoạn.",
      "Khi cần dung hòa UX sản phẩm với giới hạn của app store và release."
    ],
    process: [
      "Xác định ranh giới nền tảng: native hay cross-platform, logic dùng chung, quyền sở hữu UI, thiết bị hỗ trợ và nhịp release.",
      "Thiết kế hành vi theo vòng đời: khởi động, điều hướng, khôi phục trạng thái, tác vụ nền, quyền truy cập, chế độ offline và phục hồi sau lỗi.",
      "Tối ưu hiệu năng: thời gian khởi động, cuộn, bộ nhớ ảnh, số lượt tính bố cục, xử lý đồng thời, pin, mạng và cache.",
      "Kiểm chứng UI trên ma trận thiết bị, hướng màn hình, Dynamic Type, TalkBack hoặc VoiceOver, bàn phím, cử chỉ và visual regression.",
      "Làm chắc quy trình release: ký ứng dụng, provisioning, metadata app store, nhãn quyền riêng tư, theo dõi crash, rollout theo giai đoạn và rollback.",
      "Thu thập bằng chứng từ log simulator hoặc thiết bị, ảnh chụp, báo cáo test, số phiên không crash và release note."
    ],
    output: [
      "Kiến trúc nền tảng và kế hoạch release.",
      "Ma trận rủi ro UI và hiệu năng.",
      "Ma trận kiểm thử theo thiết bị và phiên bản hệ điều hành.",
      "Danh sách kiểm tra trước khi gửi lên store.",
      "Ghi chú theo dõi sau release và rollback."
    ],
    guardrails: [
      "Không xem việc chạy được trên simulator là bằng chứng đã sẵn sàng cho thiết bị thật.",
      "Không bỏ qua khả năng tiếp cận, khai báo quyền riêng tư hoặc giới hạn xét duyệt của app store.",
      "Không phát hành thay đổi di động khi chưa quan sát được crash và analytics."
    ]
  },
  "data-ml-science-workflow": {
    title: "Quy trình dữ liệu, ML và nghiên cứu",
    summary: "Xử lý bài toán dữ liệu, ML và nghiên cứu bằng notebook có thể tái lập, nguồn đáng tin, cách đánh giá rõ ràng, nguồn gốc dữ liệu đầy đủ và tư duy thống kê thận trọng.",
    tags: ["Dữ liệu", "ML", "Khoa học", "Khả năng tái lập"],
    useWhen: [
      "Khi phân tích dữ liệu, thử nghiệm ML, dùng API khoa học, làm tin sinh học, dữ liệu tài chính, địa không gian, notebook hoặc dashboard.",
      "Khi phân tích có rủi ro về tài chính, sức khỏe, khoa học, tuân thủ, quyền riêng tư hoặc tác động production.",
      "Khi cần bằng chứng và điểm cần lưu ý rõ ràng thay vì một câu trả lời trôi chảy từ model."
    ],
    process: [
      "Xác định giả thuyết hoặc quyết định: phân tích có thể và không thể chứng minh điều gì.",
      "Rà soát nguồn gốc dữ liệu: nguồn, độ mới, sai lệch lấy mẫu, chất lượng schema, giá trị thiếu, rò rỉ dữ liệu và trường nhạy cảm.",
      "Xây dựng khả năng tái lập: môi trường, seed, cách tách notebook và script, dữ liệu có phiên bản, phép biến đổi xác định và giả định.",
      "Phân tích chặt chẽ bằng baseline, khoảng tin cậy, thanh sai số, ablation, cách chia tập train và test cùng kiểm tra OOD.",
      "Kiểm chứng bằng hiểu biết miền: đối chiếu giới hạn đã biết, tài liệu nguồn và các phép kiểm tra độc lập.",
      "Trình bày giới hạn gồm độ bất định, điểm cần lưu ý, hướng đã thử nhưng thất bại, giới hạn đạo đức và thử nghiệm tiếp theo."
    ],
    output: [
      "Kế hoạch phân tích và từ điển dữ liệu.",
      "Dàn ý notebook hoặc script có thể tái lập.",
      "Các phát hiện kèm độ tin cậy và điểm cần lưu ý.",
      "Bảng đánh giá và phân tích lỗi.",
      "Khuyến nghị hoặc thử nghiệm tiếp theo."
    ],
    guardrails: [
      "Không suy ra quan hệ nhân quả từ tương quan khi chưa có chiến lược nhận diện phù hợp.",
      "Không xem kết quả của model là sự thật khi thiếu kiểm chứng và phân tích lỗi.",
      "Không để lộ dữ liệu nhạy cảm, y tế, tài chính hoặc độc quyền trong tài liệu công khai."
    ]
  }
};


type VietnameseSkillExpertAddendum = {
  role: string;
  heuristics: string[];
  failureModes: string[];
  gates: string[];
};

function buildVietnameseExpertAddendum({
  role,
  heuristics,
  failureModes,
  gates
}: VietnameseSkillExpertAddendum): string[] {
  return [
    "",
    "## Góc nhìn chuyên gia",
    `- ${role}`,
    ...heuristics.map((item) => `- ${item}`),
    "",
    "## Những lỗi dễ bị bỏ sót",
    ...failureModes.map((item) => `- ${item}`),
    "",
    "## Điều kiện chất lượng",
    ...gates.map((item) => `- ${item}`)
  ];
}

const vietnameseSkillExpertAddenda: Record<string, VietnameseSkillExpertAddendum> = {
  "code-review": {
    role: "Rà soát như người sẽ trực tiếp chịu trách nhiệm nếu thay đổi này gây sự cố trên production lúc 2 giờ sáng.",
    heuristics: [
      "Đọc diff qua các invariant về tiền, quyền truy cập, danh tính, dữ liệu, ngôn ngữ, SEO, analytics, cache và rollback.",
      "Lần theo cả luồng thành công lẫn luồng bị bỏ dở: nhấp hai lần, tab chứa dữ liệu cũ, retry, ghi một phần, sự kiện trùng, người dùng bị vô hiệu hóa và request hết thời gian.",
      "Xem test là bằng chứng chứ không phải bảo chứng; mock phải được đối chiếu với hợp đồng thật.",
      "Xem cách tổ chức mã nguồn trước phong cách: cấu trúc dữ liệu, design pattern, ranh giới service và việc tách helper phải phù hợp quy trình thật."
    ],
    failureModes: [
      "Race condition, stale closure, rollback của optimistic UI hoặc retry tạo tác dụng phụ trùng lặp dù test unit vẫn xanh.",
      "Một thay đổi UI nhỏ làm hỏng tracking, canonical path, khả năng tiếp cận, thứ tự focus hoặc bản dịch ở đường dẫn khác.",
      "Migration hay thay đổi schema đúng cú pháp nhưng gây lock, backfill chậm, làm hỏng khả năng đọc dữ liệu theo phiên bản cũ hoặc để lại dữ liệu không thể làm sạch khi rollback.",
      "Tên design pattern nghe hợp lý nhưng ranh giới sai: quy tắc nghiệp vụ trôi vào controller, logic lưu trữ trôi lên UI hoặc utility dùng chung bắt đầu giữ trạng thái sản phẩm."
    ],
    gates: [
      "Phát hiện mức Blocker hoặc Major phải có bằng chứng, tác động và cách sửa nhỏ nhất.",
      "Diff rủi ro cao phải có kiểm chứng cho nhánh lỗi hoặc ghi chú rõ về rủi ro còn lại.",
      "Người rà soát phải biết tín hiệu nào chứng minh production vẫn khỏe sau merge.",
      "Diff thêm service, repository, utility dùng chung, design pattern hoặc cấu trúc dữ liệu mới phải giải thích ngắn gọn trách nhiệm thuộc về đâu và vì sao chọn cách đó."
    ]
  },
  "frontend-architecture": {
    role: "Thiết kế như một kiến trúc sư frontend cấp Staff, cân bằng tốc độ làm sản phẩm, tính nhất quán của design system, khả năng tiếp cận và hiệu năng khi chạy.",
    heuristics: [
      "Chia trách nhiệm theo đường dẫn, bộ nạp dữ liệu, trạng thái URL, trạng thái tương tác, thành phần thị giác nền tảng, các điểm đo analytics và cách phục hồi sau lỗi.",
      "Mô hình hóa UI như state machine với trạng thái đang tải, trống, có một phần dữ liệu, thiếu quyền, cập nhật lạc quan, thất bại, đang thử lại, thành công và dữ liệu cũ.",
      "Dành chỗ cho trường hợp nội dung khó nhất: bản dịch dài, tập dữ liệu rỗng, mạng chậm, chế độ giảm chuyển động, chỉ dùng bàn phím và màn hình hẹp."
    ],
    failureModes: [
      "Hydration mismatch hoặc trạng thái chỉ có ở trình duyệt làm sai SEO, tương tác đầu tiên, analytics hoặc độ mới của cache.",
      "Component đẹp trong bản mẫu nhưng thiếu kích thước ổn định, khiến dữ liệu thật gây CLS, chồng lấn, cắt chữ hoặc không dùng được trên di động.",
      "Trạng thái toàn ứng dụng được thêm để chữa một vấn đề cục bộ, tạo phụ thuộc và dữ liệu cũ giữa các đường dẫn."
    ],
    gates: [
      "Cách phân loại trạng thái, ma trận theo kích thước màn hình và thứ tự focus phải rõ trước khi coi UI là hoàn tất.",
      "LCP, INP, CLS, giới hạn bundle, luồng bàn phím và PageTracker hoặc event tracking đều có người phụ trách.",
      "Không phát hành component mới khi thiếu trạng thái trống, lỗi, vô hiệu hóa, đang tải hoặc hành vi trên di động."
    ]
  },
  "backend-architecture": {
    role: "Thiết kế như một kiến trúc sư backend chịu trách nhiệm về invariant, khả năng tương thích, an toàn migration và tải vận hành.",
    heuristics: [
      "Bắt đầu từ invariant trước cấu trúc triển khai: điều gì vẫn phải đúng sau retry, message trùng, lỗi một phần, phát lại và sai sót vận hành.",
      "Chọn mô hình nhất quán có chủ đích: strong consistency, read-your-writes, monotonic read, eventual consistency hoặc compensating transaction.",
      "Giữ kiến trúc quen thuộc và đơn giản cho đến khi throughput, chi phí di chuyển dữ liệu, quyền sở hữu hoặc yêu cầu tuân thủ thực sự buộc hệ thống phức tạp hơn."
    ],
    failureModes: [
      "Luồng bất đồng bộ thiếu idempotency, DLQ, chiến lược phát lại, đối soát và observability sẽ biến lỗi phần mềm thành mất dữ liệu âm thầm.",
      "Retry không phân biệt lỗi tạm thời và lỗi vĩnh viễn có thể nhân đôi thanh toán, gửi email trùng hoặc ghi sự kiện sai thứ tự.",
      "Migration schema bỏ qua phạm vi và thời gian lock, thời gian tạo index, giới hạn tốc độ backfill, khả năng đọc dữ liệu theo phiên bản cũ và cách rollback dữ liệu."
    ],
    gates: [
      "Mỗi luồng ghi dữ liệu phải có phân quyền, khóa idempotency, kiểm tra đầu vào, tín hiệu kiểm toán và quy tắc rollback.",
      "Hợp đồng phải nêu phân trang, hệ thống lỗi, giới hạn tần suất, phiên bản và khả năng tương thích.",
      "SLO, timeout, ngân sách retry, cảnh báo và runbook phải đủ để người trực xử lý sự cố."
    ]
  },
  "blog-content-writer": {
    role: "Viết như một biên tập viên kỹ thuật giàu kinh nghiệm, coi trọng niềm tin, độ chính xác, sự bám sát nguồn và thời gian của người đọc.",
    heuristics: [
      "Thu hẹp chủ đề rộng thành một luận điểm, một nhóm người đọc, một quyết định và một cách hiểu đáng nhớ.",
      "Dùng thuật ngữ chuyên ngành khi nó giúp giải thích chính xác; làm rõ bằng ngữ cảnh, tình huống lỗi và đánh đổi.",
      "SEO theo ngữ nghĩa phải làm nội dung rõ hơn, không thay giọng tác giả bằng cách nhồi từ khóa."
    ],
    failureModes: [
      "Bài viết nghe có vẻ chuyên sâu nhưng thiếu nhận định có thể kiểm chứng, dấu vết nguồn, ví dụ vận hành hoặc đánh đổi thật.",
      "Nội dung có nhiều tiêu đề nhưng thiếu mạch kể xuyên suốt nên người đọc không biết bước tiếp theo là gì.",
      "Nhận định về hiệu năng, bảo mật, khả năng AI hoặc xu hướng thị trường vượt quá bằng chứng."
    ],
    gates: [
      "Có luận điểm rõ, hệ thống tiêu đề mạch lạc, metadata, slug và schema đúng, liên kết nội bộ hợp lý.",
      "Nhận định mạnh phải có nguồn, demo, mã nguồn, benchmark hoặc lưu ý về giới hạn làm căn cứ.",
      "Giọng viết bình tĩnh, sắc nét, không cường điệu và không bán hàng."
    ]
  },
  "prompt-writing": {
    role: "Thiết kế prompt như một interface có kiểu dữ liệu, chịu được yêu cầu mơ hồ, prompt injection, việc dùng công cụ và bước phân tích kết quả phía sau.",
    heuristics: [
      "Tách các tầng thẩm quyền: system, developer, yêu cầu người dùng, bằng chứng truy xuất, ví dụ và payload không đáng tin.",
      "Định nghĩa prompt như một hợp đồng: đầu vào, điều kiện tiên quyết, công cụ được phép, schema kết quả, cách kiểm tra, lỗi và phương án dự phòng.",
      "Dùng ví dụ để khóa đúng ý định; dùng phản ví dụ để chỉ rõ điều không được làm."
    ],
    failureModes: [
      "Prompt dài nhưng không đủ ràng buộc vì thiếu tiêu chí nghiệm thu, những điều không được phép, ví dụ schema và ca eval.",
      "Nội dung không đáng tin có thể đổi vai trò, ranh giới công cụ, chính sách an toàn, thứ tự ưu tiên nguồn hoặc định dạng kết quả.",
      "Kết quả nhìn có vẻ đúng nhưng máy không phân tích được vì schema không nói rõ trường tùy chọn, giá trị null hoặc trạng thái lỗi."
    ],
    gates: [
      "Bộ prompt phải có test đối nghịch, test đầu vào sai định dạng và kiểm tra schema.",
      "Không yêu cầu private chain-of-thought; chỉ yêu cầu giải thích, bằng chứng hoặc bước kiểm tra ngắn.",
      "Kết quả có cấu trúc phải kèm ví dụ hợp lệ, không hợp lệ và cách phục hồi khi lỗi."
    ]
  },
  "status-report": {
    role: "Viết như người vận hành đang giúp lãnh đạo hiểu rủi ro, quyết định cần chốt và cách đưa dự án trở lại quỹ đạo trong chưa đầy một phút.",
    heuristics: [
      "Tách hoạt động khỏi giá trị đã bàn giao, rủi ro đã loại bỏ, quyết định đã được tháo gỡ và tác động đến khách hàng hoặc hệ thống.",
      "Dùng chỉ báo sớm để nhận ra sai lệch trước khi metric kết quả xấu đi.",
      "Một nội dung chuyển cấp tốt phải nói rõ hệ quả nếu không có quyết định, không chỉ báo rằng đang có điểm nghẽn."
    ],
    failureModes: [
      "Trạng thái Green che giấu phạm vi phình ra, phần phụ thuộc lệch kế hoạch, nợ chất lượng hoặc điểm nghẽn chưa có người phụ trách.",
      "Metric chính xác nhưng không giúp hành động vì không gắn với quyết định hoặc ngưỡng cụ thể.",
      "Bản cập nhật kể nhiều việc đã làm nhưng không trả lời được dự án đang khỏe hay có nguy cơ."
    ],
    gates: [
      "Mỗi điểm nghẽn có người phụ trách, bước tiếp theo, hạn xử lý, tác động và ngưỡng cần chuyển cấp.",
      "Tình trạng dự án có một câu giải thích và nêu rõ thay đổi so với lần cập nhật trước.",
      "Đề nghị quyết định phải có phương án khuyến nghị, phương án dự phòng và thời hạn."
    ]
  },
  "doc-spec-tech-spec": {
    role: "Viết như người chịu trách nhiệm RFC, cần tạo được sự đồng thuận trước khi bắt đầu viết mã.",
    heuristics: [
      "Phần không làm phải rõ như phần mục tiêu; điều không được loại trừ sớm sẽ khiến phạm vi cứ phình ra.",
      "Phân loại quyết định: lựa chọn dễ đảo ngược cần tốc độ, lựa chọn khó quay lại cần bằng chứng và xác nhận.",
      "Đặc tả tốt phải nối mục tiêu sản phẩm với NFR, mô hình dữ liệu, mô hình đe dọa, rollout và kiểm chứng."
    ],
    failureModes: [
      "Đặc tả mô tả giải pháp nhưng không chứng minh vấn đề, tác động đến người dùng hoặc giới hạn vận hành.",
      "Migration, quyền riêng tư, observability, khả năng tương thích và rollback bị đẩy sang lúc triển khai, khi chi phí thay đổi đã cao.",
      "Phần phương án thay thế quá yếu khiến người xem không hiểu vì sao hướng được chọn phù hợp nhất trong các giới hạn hiện có."
    ],
    gates: [
      "Có các phương án thay thế, ma trận đánh đổi, sổ đăng ký rủi ro, ma trận kiểm thử cùng kế hoạch rollout và rollback.",
      "Mỗi câu hỏi còn mở có người phụ trách, ngày cần quyết định và tác động nếu chưa giải quyết.",
      "Thay đổi dữ liệu production phải có thứ tự migration và quy trình khôi phục."
    ]
  },
  "proposal-slide-pitch": {
    role: "Trình bày như người đề xuất trước ban lãnh đạo, biến sự mơ hồ thành một đề nghị đầu tư có thể chốt ngay.",
    heuristics: [
      "Chuyển tính năng thành giá trị kinh doanh: doanh thu, chi phí, rủi ro, thời gian chu kỳ, khả năng chống lỗi, tuân thủ hoặc lợi ích của việc giữ thêm lựa chọn.",
      "Viết cho nhiều góc nhìn cùng lúc: CFO nhìn ROI, CTO nhìn tính khả thi và rủi ro, Product nhìn mức độ sử dụng, Ops nhìn khả năng thực hiện.",
      "Nêu điều cần quyết định từ sớm; một deck giấu đề nghị sẽ buộc người liên quan tự suy diễn."
    ],
    failureModes: [
      "Đề xuất nghe thuyết phục nhưng không thể cấp vốn vì thiếu người phụ trách, ngân sách, mốc thời gian, rủi ro và metric thành công.",
      "Lợi ích kỹ thuật được kể bằng biệt ngữ khiến mỗi người liên quan hiểu thành một đề xuất khác nhau.",
      "Không chuẩn bị trước phản biện về chi phí, mức độ sử dụng, thời điểm, chi phí cơ hội và rủi ro bàn giao."
    ],
    gates: [
      "Có luận điểm một câu, đề nghị quyết định, mô hình tác động định lượng và phương án dự phòng.",
      "Ma trận phản biện bao phủ chi phí, rủi ro, thời điểm, tính khả thi, mức độ sử dụng và chi phí cơ hội.",
      "Metric thành công phải đo được sau khi phát hành, không chỉ ghi nhận phần đã bàn giao."
    ]
  },
  "ai-operating-system": {
    role: "Thiết kế như một kiến trúc sư hệ thống AI xây quy trình đáng tin, không chỉ sưu tầm prompt.",
    heuristics: [
      "Phân việc theo bản chất tác vụ: truy xuất, suy luận, viết mã, kiểm chứng, kiểm tra UI, thay đổi trạng thái và tổng hợp là những việc khác nhau.",
      "Xem ngữ cảnh như một chuỗi cung ứng: nguồn gốc, độ mới, mức tin cậy, cách nén, che dữ liệu và loại trừ đều quan trọng.",
      "Đặt lớp kiểm chứng trước khi điều phối phức tạp; nhiều agent không tự tạo ra tính đúng đắn."
    ],
    failureModes: [
      "Nhiều agent làm tăng độ trễ và mâu thuẫn nhưng không có người chịu trách nhiệm, schema hay quy tắc phân xử.",
      "Agent được cấp quyền công cụ quá rộng rồi vượt qua ranh giới quyền riêng tư, filesystem, tài khoản ứng dụng hoặc production.",
      "Memory hoặc RAG chứa nguồn cũ hay nội dung không đáng tin nhưng lại được đưa vào prompt như chỉ dẫn có thẩm quyền."
    ],
    gates: [
      "Mỗi agent có vai trò, đầu vào, công cụ, ranh giới ghi, schema kết quả và người chịu trách nhiệm kiểm chứng.",
      "Quy trình quan trọng có lượt rà soát thứ hai, phép kiểm tra xác định trước và điểm cần con người phê duyệt.",
      "Ma trận phân việc nêu rõ model nào làm việc gì, vì sao và khi nào dùng phương án dự phòng."
    ]
  },
  "daily-ai-learning-coach": {
    role: "Hướng dẫn như người thiết kế luyện tập có chủ đích để khả năng làm việc với AI tích lũy thành phán đoán tốt, không thành thói quen đổi công cụ liên tục.",
    heuristics: [
      "Mỗi lần chỉ luyện một kỹ năng nhỏ: chia tác vụ, bám nguồn, xem diff, thiết kế eval hoặc phản biện kiến trúc.",
      "Dùng retrieval practice, interleaving và spaced repetition để biến kiến thức thành phản xạ.",
      "Luyện trên tài liệu công việc thật để phản hồi có giá trị và ngữ cảnh rõ ràng."
    ],
    failureModes: [
      "Xem video, đọc thảo luận hoặc đổi công cụ liên tục nhưng không tạo ra tài liệu hay hành vi mới.",
      "Giao cả việc suy nghĩ cho AI nên tốc độ tăng nhưng cách hiểu vấn đề lại yếu đi.",
      "Học quá rộng khiến kỹ năng từ bài tập không chuyển được sang tác vụ production."
    ],
    gates: [
      "Mỗi buổi có đầu vào thật, kết quả mong đợi, prompt lấy phản hồi và tài liệu được lưu lại.",
      "Có thẻ chủ động nhớ lại hoặc danh sách kiểm tra để dùng lại trong tuần.",
      "Đo giá trị bằng lỗi tránh được, quyết định rõ hơn, thời gian tiết kiệm hoặc tài liệu được dùng lại."
    ]
  },
  "notebooklm-source-of-truth": {
    role: "Làm như một chuyên viên phân tích tri thức, bảo đảm nội dung bám sát nguồn, trích dẫn đủ cụ thể và nêu rõ điều chưa biết.",
    heuristics: [
      "Xếp hạng nguồn theo độ tin cậy, ngày, thẩm quyền, mức độ trực tiếp và khả năng xung đột.",
      "Tách nhận định, bằng chứng, suy luận và điểm cần lưu ý để tránh biến phần tổng hợp thành hallucination có gắn trích dẫn.",
      "Dùng ma trận mâu thuẫn khi nhiều tài liệu nói khác nhau về cùng thực thể, metric hoặc quyết định."
    ],
    failureModes: [
      "Trích dẫn gắn với đoạn chỉ liên quan lỏng lẻo nhưng không thực sự hỗ trợ nhận định chính.",
      "Nguồn cũ được dùng như thông tin hiện tại, nhất là chính sách, giá, hành vi API, pháp lý hoặc quyền sở hữu trong tổ chức.",
      "Bản tổng hợp trôi chảy làm mất điều chưa biết, điểm cần lưu ý và ranh giới của tập tài liệu."
    ],
    gates: [
      "Nhận định về sự kiện có nguồn, ngày và độ tin cậy; phần suy luận phải được ghi rõ.",
      "Nếu tập tài liệu không có câu trả lời, ghi rõ rằng tài liệu không cung cấp thông tin này.",
      "Tài liệu nhạy cảm phải được che dữ liệu trước khi đưa vào nội dung công khai."
    ]
  },
  "ai-delivery-factory": {
    role: "Điều phối như người dẫn dắt bàn giao, để con người vẫn làm chủ yêu cầu, rủi ro và quyết định release trong khi AI tăng tốc thực hiện.",
    heuristics: [
      "Tách vai trò: người viết đặc tả, người triển khai, người rà soát, người kiểm thử, người chịu trách nhiệm release và người theo dõi sau phát hành.",
      "Mỗi phần triển khai nhỏ phải có lệnh kiểm chứng hoặc kết quả có thể kiểm tra lại.",
      "Xem diff đã stage như một mắt xích chuỗi cung ứng: kiểm tra bí mật, file được tạo, thay đổi không liên quan, analytics và rủi ro migration."
    ],
    failureModes: [
      "Agent bàn giao nhanh nhưng thiếu tiêu chí nghiệm thu, khiến mã đúng về kỹ thuật mà sai hành vi sản phẩm.",
      "Test do AI tạo kiểm tra chi tiết triển khai thay vì hợp đồng người dùng có thể quan sát.",
      "Commit lẫn file runtime, metadata trên máy, kết quả build hoặc thay đổi không liên quan của người dùng."
    ],
    gates: [
      "Có phạm vi, phần không làm, tóm tắt file thay đổi, bằng chứng kiểm chứng và rủi ro còn lại.",
      "Commit và PR dùng Conventional Commit, đồng thời mô tả tác động, kiểm thử, triển khai và rollback.",
      "Chỉ thay đổi production hoặc deploy khi người dùng đã yêu cầu rõ ràng."
    ]
  },
  "claude-deep-review": {
    role: "Rà soát như một kiến trúc sư phản biện, tìm giả định yếu nhất trước khi nó trở thành sự cố.",
    heuristics: [
      "Phân rã tác nhân, ranh giới tin cậy, chuyển đổi trạng thái, đồ thị phụ thuộc và miền lỗi.",
      "Dùng FMEA, STRIDE, pre-mortem và tình huống phản thực để hỏi thiết kế sẽ vỡ ở đâu.",
      "So hướng đề xuất với các phương án đơn giản hơn, an toàn hơn, rẻ hơn và dễ đảo ngược hơn."
    ],
    failureModes: [
      "Phản biện nghe sắc nhưng không đưa ra biện pháp nhỏ nhất để giảm rủi ro.",
      "Chỉ nhìn mã hoặc đề xuất mà bỏ qua lỗi vận hành, cache cũ, lệch đồng hồ, phân vùng mạng và người dùng có ý đồ xấu.",
      "Những từ mơ hồ như “có lẽ”, “nên” hay “nhiều khả năng” che giấu giả định chưa được chứng minh."
    ],
    gates: [
      "Mỗi rủi ro nghiêm trọng có kịch bản lỗi, phạm vi ảnh hưởng, cách phát hiện và giảm nhẹ.",
      "Khuyến nghị Go hoặc No-Go có ngưỡng bằng chứng rõ ràng.",
      "Giả định quan trọng phải có test, metric, người phụ trách hoặc quyết định được ghi rõ."
    ]
  },
  "career-ai-strategy": {
    role: "Tư vấn như người hoạch định nghề nghiệp ở cấp Staff hoặc Principal, ưu tiên cơ hội tạo giá trị lớn và bằng chứng có thể nhìn thấy.",
    heuristics: [
      "Xác định luận điểm nghề nghiệp: vấn đề thị trường nào mình giải tốt hơn nhờ chiều sâu kỹ thuật, cảm nhận sản phẩm và khả năng làm việc với AI.",
      "Chọn hướng đầu tư mở ra nhiều cơ hội: tài liệu dùng lại được, người đọc rõ, phản hồi nhanh và tiềm năng lớn.",
      "Biến công việc thật thành bằng chứng: ADR, postmortem, công cụ, bài viết, bài nói chuyện, hoạt động cố vấn và metric trước hoặc sau."
    ],
    failureModes: [
      "Tối ưu chức danh hoặc bộ công cụ thay vì phạm vi công việc, phán đoán và kết quả.",
      "Hồ sơ năng lực có nhiều hoạt động nhưng thiếu câu chuyện về vấn đề, đánh đổi, tác động và điều đã học.",
      "Dùng AI rộng nhưng không chứng minh được chất lượng, tốc độ, công sức tiết kiệm hay quyết định tốt hơn."
    ],
    gates: [
      "Kế hoạch 90 ngày có kết quả, nhịp làm việc, tài liệu cần tạo, người liên quan và vòng phản hồi hằng tuần.",
      "Ma trận năng lực tách chiều sâu, bề rộng, giao tiếp, lãnh đạo, khả năng làm việc với AI và phán đoán kinh doanh.",
      "Mỗi tài liệu có nhóm người đọc đích và cách dùng lại."
    ]
  },
  "engineering-decision-map": {
    role: "Lập bản đồ quyết định như người tư duy hệ thống, nối yêu cầu, invariant, phương án kiến trúc và hệ quả vận hành.",
    heuristics: [
      "Rút ra invariant trước khi nghĩ giải pháp: người dùng, tiền, quyền truy cập, dữ liệu, tuân thủ và hỗ trợ.",
      "Dùng ma trận quyết định có trọng số nhưng phải nêu trọng số xuất phát từ ưu tiên kinh doanh nào.",
      "Xem khả năng đảo ngược là một tài sản: phương án dễ rollback có thể tốt hơn phương án tối ưu nhưng mong manh."
    ],
    failureModes: [
      "Quyết định bị dẫn dắt bởi công nghệ thú vị thay vì invariant và mức phù hợp với nhóm.",
      "Ma trận có điểm số nhưng thiếu ngưỡng, giả định hoặc phân tích độ nhạy.",
      "Bỏ qua quy trình hỗ trợ, xử lý sự cố và đường migration nên thiết kế chỉ đẹp trên sơ đồ."
    ],
    gates: [
      "Có sơ đồ nối yêu cầu với kiến trúc và các phương án bị loại.",
      "Sổ đăng ký rủi ro gồm cách phát hiện, giảm nhẹ, rollback và người phụ trách.",
      "Nêu rõ điểm thiết kế bắt đầu không chịu nổi tải hoặc độ phức tạp, không hứa khả năng mở rộng vô hạn."
    ]
  },
  "staff-engineer-ai-review-pack": {
    role: "Rà soát như một Staff Engineer chịu trách nhiệm về mức sẵn sàng production tại ranh giới sản phẩm, kiến trúc, bảo mật, dữ liệu, SRE và QA.",
    heuristics: [
      "Rà soát từng góc nhìn độc lập rồi tổng hợp: sản phẩm, kiến trúc, bảo mật và quyền riêng tư, dữ liệu, SRE, QA và rollout.",
      "Phân biệt điểm chặn bắt buộc, điều kiện phát hành, rủi ro được chấp nhận và món nợ cần xử lý sau.",
      "Ưu tiên thu hẹp phạm vi ảnh hưởng hơn việc làm mốc thời gian trông đẹp."
    ],
    failureModes: [
      "Danh sách PRR đầy đủ nhưng từng điều kiện phát hành lại thiếu người phụ trách hoặc bằng chứng.",
      "Bản viết lại toàn bộ một lần thiếu lộ trình Strangler, lớp tương thích, backfill, đối soát và rollback.",
      "SLO, dashboard, cảnh báo, runbook và gánh nặng trực on-call chỉ được bàn sau khi hệ thống đã vận hành."
    ],
    gates: [
      "Có ma trận rủi ro liên chức năng và khuyến nghị Go hoặc No-Go.",
      "Mỗi điều kiện phát hành có người phụ trách, tín hiệu kiểm chứng và thời hạn.",
      "Không chấp thuận khi toàn vẹn dữ liệu, quyền riêng tư hoặc rollback chưa rõ."
    ]
  },
  "data-resilience-observability-review": {
    role: "Rà soát như một kỹ sư SRE và độ tin cậy dữ liệu, luôn giả định mạng, đồng hồ, queue, cache và bên thứ ba đều có thể hỏng.",
    heuristics: [
      "Đánh giá tính nhất quán, idempotency, thứ tự, phát lại, khử trùng lặp và đối soát trước throughput.",
      "Thiết kế telemetry theo RED/USE, correlation ID, trace span, SLO burn rate và cảnh báo cho biết rõ cần làm gì.",
      "Khả năng khôi phục phải được kiểm thử qua phục hồi bản sao lưu, point-in-time recovery, sửa dữ liệu và script rollback."
    ],
    failureModes: [
      "Nhiều cảnh báo nhưng không thể hành động, gây mệt mỏi và che khuất sự cố thật.",
      "Việc làm mới cache thiếu hợp đồng rõ ràng khiến lần đọc dữ liệu cũ trở thành lỗi toàn vẹn dữ liệu.",
      "Queue chậm, poison message, phân vùng nóng hoặc sự kiện sai thứ tự không có cách phát hiện."
    ],
    gates: [
      "Có ma trận tình huống lỗi với cách phát hiện, giảm nhẹ và runbook.",
      "RPO/RTO, khôi phục bản sao lưu và điều kiện rollback hoặc khôi phục đều rõ.",
      "Không ghi PII, bí mật, token hoặc payload nhạy cảm vào log."
    ]
  },
  "installed-skill-library-cartographer": {
    role: "Làm như một kiến trúc sư phân loại, biến hàng nghìn skill cài rải rác thành bản đồ năng lực có thể sử dụng.",
    heuristics: [
      "Loại bản trùng theo hash nội dung, tên đã chuẩn hóa và nhóm nguồn vì cache hoặc plugin tạo ra rất nhiều bản sao.",
      "Giữ thông tin nguồn gốc ở mức năng lực, không công khai đường dẫn trên máy, tên người dùng hoặc chi tiết không gian làm việc riêng tư.",
      "Gộp các quy trình trùng nhau thành skill chuẩn có điều kiện kích hoạt, ngữ cảnh, quy trình, hợp đồng kết quả và giới hạn."
    ],
    failureModes: [
      "Chép nguyên nội dung marketplace hoặc cache làm thư viện phình to nhưng khả năng chọn skill vẫn kém.",
      "Dùng số lượng skill làm tín hiệu chất lượng trong khi bản trùng và phiên bản cũ chiếm phần lớn tập dữ liệu.",
      "Hệ phân loại quá rộng khiến agent AI không biết khi nào nên chọn skill nào."
    ],
    gates: [
      "Bản kiểm kê có số file thô, nội dung không trùng, tên không trùng và danh sách runtime được hỗ trợ ở dạng tổng hợp.",
      "Phân tích khoảng trống so với thư viện Studio hiện tại phải dẫn đến đề xuất thêm, gộp hoặc bỏ rõ ràng.",
      "Nội dung cuối không lộ đường dẫn, token, repo riêng tư, dữ liệu khách hàng hoặc chi tiết thừa riêng của nhà cung cấp."
    ]
  },
  "ai-product-evaluation": {
    role: "Đánh giá như người dẫn dắt sản phẩm và eval AI, đưa tính năng từ bản demo đẹp đến sản phẩm đáng tin.",
    heuristics: [
      "Xác định lời hứa sản phẩm và phần không làm trước khi chọn model; eval phải đo đúng lời hứa đó.",
      "Xây tháp eval gồm tác vụ chuẩn, prompt đối nghịch, bộ regression, thang đánh giá của con người và telemetry production.",
      "Theo dõi chất lượng và chi phí cùng lúc: tỷ lệ hoàn thành tác vụ, hallucination, độ chính xác khi gọi công cụ, mức độ trích dẫn đúng nguồn, độ trễ và token tiêu thụ."
    ],
    failureModes: [
      "Demo thành công nhờ prompt được chuẩn bị kỹ, nhưng người dùng thật đưa đầu vào lộn xộn, thiếu ngữ cảnh và nguồn mâu thuẫn.",
      "Eval quá nhỏ hoặc quá nhân tạo nên không bắt được sai lệch truy xuất, prompt injection và chất lượng giảm âm thầm.",
      "UX tạo lòng tin lại che phần chưa chắc chắn, khiến người dùng hiểu nhầm kết quả là kết luận có thẩm quyền."
    ],
    gates: [
      "Có ngưỡng nghiệm thu, metric bảo vệ, ca red-team và phương án quay lại model hoặc nhà cung cấp cũ.",
      "Hành động ghi cần ranh giới quyền, nhật ký kiểm toán, khả năng hoàn tác hoặc chuyển cấp và phê duyệt của con người khi rủi ro cao.",
      "Telemetry phải phân biệt vấn đề chất lượng, truy xuất, công cụ và việc người dùng bỏ dở."
    ]
  },
  "agent-tools-mcp-automation": {
    role: "Thiết kế như một kiến trúc sư tự động hóa, để agent dùng công cụ với schema, quyền hạn, kiểm toán và khôi phục rõ ràng.",
    heuristics: [
      "Phân giải ID bằng bước đọc trước bước ghi; tên người, kênh, thư mục hoặc tiêu đề issue chưa đủ để thay đổi trạng thái.",
      "Phân loại hành động: chỉ đọc, tạo bản nháp, ghi sau khi duyệt, ghi ngay, lên lịch, phá hủy hoặc xuất bản ra ngoài.",
      "Chỉ chạy theo lô khi các lời gọi độc lập; phải phân trang đến hết nếu người dùng cần toàn bộ kết quả."
    ],
    failureModes: [
      "Lời gọi công cụ đúng schema nhưng sai tài khoản, hộp thư, múi giờ hoặc ID đích.",
      "Quy trình dài không có điểm lưu giữa chừng nên khi lỗi một phần không thể tiếp tục hoặc kiểm toán.",
      "Agent tóm tắt kết quả nhưng không đối chiếu trạng thái trả về với trạng thái được yêu cầu."
    ],
    gates: [
      "Mọi hành động ghi hoặc phá hủy đều có phê duyệt rõ ràng hoặc đi qua bản nháp trước.",
      "Ghi chú thực thi lưu ứng dụng, hành động, mức quyền, liên kết tài liệu hoặc nguồn và trạng thái lỗi hoặc retry.",
      "Không bịa slug công cụ, trường API, ID tài khoản, kênh, thư mục hoặc file."
    ]
  },
  "product-analytics-growth": {
    role: "Làm như người dẫn dắt phân tích sản phẩm và tăng trưởng, nối việc đo lường với quyết định chứ không chỉ với dashboard.",
    heuristics: [
      "Mỗi event tồn tại vì một quyết định; nếu metric tăng hay đứng yên mà hành động vẫn không đổi thì đó là vanity metric.",
      "Thiết kế danh tính, bộ thuộc tính, nơi phát sinh và phiên bản sự kiện trước khi phân tích funnel.",
      "Thử nghiệm cần metric chính, metric bảo vệ, kiểm tra SRM, cỡ mẫu, kế hoạch tăng dần tỷ lệ và điều kiện dừng."
    ],
    failureModes: [
      "Tên sự kiện bị trôi: cùng một hành vi được theo dõi bằng nhiều tên hoặc thuộc tính khác nhau theo thời gian.",
      "Danh tính bị lẫn làm sai cohort, attribution và retention dù dashboard vẫn đẹp.",
      "Thử nghiệm A/B bị kết luận quá sớm hoặc thiếu metric bảo vệ, khiến conversion tăng nhưng chất lượng giảm."
    ],
    gates: [
      "Kế hoạch tracking có sự kiện, thuộc tính, người phụ trách, nơi phát sinh và giới hạn quyền riêng tư.",
      "Đặc tả dashboard nêu rõ quyết định, baseline, phân nhóm và độ tin cậy.",
      "Không phá Do Not Track, lựa chọn tắt autocapture hoặc session recording và quyết định đồng ý của người dùng."
    ]
  },
  "research-market-intelligence": {
    role: "Nghiên cứu như một chuyên viên phân tích biết phân biệt thứ bậc bằng chứng, động cơ của nguồn, độ mới và độ tin cậy.",
    heuristics: [
      "Bắt đầu bằng câu hỏi cần ra quyết định; nghiên cứu không phục vụ quyết định dễ biến thành tập ghi chú rời rạc.",
      "Ưu tiên nguồn sơ cấp, đối chiếu ngày, xem động cơ của tác giả và ghi rõ mức tin cậy của nguồn.",
      "Cập nhật theo Bayesian: bằng chứng mới làm độ tin cậy tăng hay giảm thế nào; nếu chưa đủ thì cần thử nghiệm gì."
    ],
    failureModes: [
      "Nhận định truyền lại hoặc đã cũ được trình bày như sự kiện thị trường hiện tại.",
      "Phân tích đối thủ chỉ liệt kê tính năng mà không xem định vị, quyền lực định giá, lợi thế tiếp cận thị trường và chi phí chuyển đổi.",
      "Bản nghiên cứu trôi chảy nhưng che mâu thuẫn, điều chưa biết và tín hiệu yếu."
    ],
    gates: [
      "Bảng bằng chứng có nguồn, ngày, nhận định, điểm cần lưu ý và độ tin cậy.",
      "Bản tổng hợp tách sự kiện, suy luận, suy đoán và thử nghiệm tiếp theo được khuyến nghị.",
      "Nhận định hiện tại hoặc có hệ quả lớn phải được kiểm chứng bằng nguồn mới và nguồn sơ cấp khi có thể."
    ]
  },
  "security-privacy-threat-modeling": {
    role: "Rà soát như một kiến trúc sư bảo mật và quyền riêng tư, xem cả động cơ lạm dụng, ranh giới tin cậy và phạm vi ảnh hưởng.",
    heuristics: [
      "Vẽ tài sản, tác nhân, luồng dữ liệu, ranh giới tin cậy và chuyển đổi đặc quyền trước khi liệt kê lỗ hổng.",
      "Chạy STRIDE cho bảo mật và LINDDUN cho quyền riêng tư; ngữ cảnh AI cũng là một phần của luồng dữ liệu cần được rà soát.",
      "Đánh giá khả năng khai thác qua điều kiện tiên quyết, năng lực kẻ tấn công, khả năng phát hiện, phạm vi ảnh hưởng và biện pháp bù."
    ],
    failureModes: [
      "Lời khuyên chung chung về làm sạch đầu vào không chỉ ra đúng sink, encoder, validator hoặc ranh giới cần xử lý.",
      "Lỗi IDOR hoặc cách ly tenant xảy ra ở lớp truy vấn dù đường dẫn đã có xác thực.",
      "Log, thuộc tính analytics, ngữ cảnh prompt hoặc công cụ hỗ trợ vô tình chứa PII hay bí mật."
    ],
    gates: [
      "Mỗi phát hiện có mức độ, vị trí bị ảnh hưởng, đường khai thác, tác động và cách sửa hoặc kiểm chứng cụ thể.",
      "Luồng dữ liệu nhạy cảm có cách tối thiểu hóa, thời hạn giữ, xóa, kiểm toán và rollback rõ ràng.",
      "Không chấp thuận AI hoặc công cụ có quyền ghi khi thiếu ranh giới quyền hạn và nhật ký kiểm toán."
    ]
  },
  "design-system-ui-craft": {
    role: "Thiết kế như người dẫn dắt chất lượng UI sản phẩm, ưu tiên quy trình thật, đủ trạng thái, khả năng tiếp cận và thứ bậc thị giác.",
    heuristics: [
      "Bắt đầu từ quy trình lặp lại, cách quét thông tin, gánh nặng ra quyết định và cách người dùng phục hồi sau lỗi.",
      "Dùng token và thư viện component hiện có trước; nếu phá quy ước phải có lý do UX rõ ràng.",
      "Thiết kế cho nội dung thật: nhãn dài, danh sách trống, dữ liệu dày, di động cùng trạng thái hover, focus, vô hiệu hóa, đang tải và lỗi."
    ],
    failureModes: [
      "UI đẹp như bản mẫu nhưng thiếu ma trận trạng thái, đường đi bằng bàn phím, quản lý focus hoặc độ tương phản đủ.",
      "Card, gradient hoặc lớp trang trí che mất công việc chính của công cụ hay dashboard.",
      "Tràn chữ, layout shift hoặc nút chỉ có biểu tượng mà thiếu tooltip làm trải nghiệm thiếu chỉn chu."
    ],
    gates: [
      "Có danh sách component, đầy đủ trạng thái và kết quả kiểm tra trên nhiều kích thước màn hình.",
      "Không còn chồng lấn, cắt chữ vô lý, focus trap không thể thoát hoặc lỗi trên di động.",
      "Tương tác quan trọng có sự kiện analytics theo quy ước hiện có."
    ]
  },
  "mobile-platform-engineering": {
    role: "Rà soát như người dẫn dắt nền tảng di động, chịu trách nhiệm về vòng đời, phân mảnh thiết bị, hiệu năng và release trên app store.",
    heuristics: [
      "Thiết kế theo vòng đời: cold start, chuyển nền hoặc trở lại, từ chối quyền, offline, deep link và khôi phục trạng thái.",
      "Ma trận thiết bị phải phản ánh phiên bản hệ điều hành, kích thước màn hình, Dynamic Type, TalkBack hoặc VoiceOver và hành vi khi thiếu bộ nhớ.",
      "Kế hoạch release gồm ký ứng dụng, provisioning, nhãn quyền riêng tư, theo dõi crash, rollout theo giai đoạn và rollback hoặc kill switch."
    ],
    failureModes: [
      "Simulator chạy tốt nhưng thiết bị thật bị lag, crash do bộ nhớ, xung đột cử chỉ hoặc lỗi ở trường hợp biên của quyền truy cập.",
      "Trạng thái mạng hoặc offline thiếu retry, backoff và cache khiến UX di động hỏng khi rời mạng ổn định.",
      "Metadata trên store hoặc khai báo quyền riêng tư không khớp hành vi, dẫn đến bị từ chối hoặc tạo rủi ro tuân thủ."
    ],
    gates: [
      "Có ma trận kiểm thử theo thiết bị và hệ điều hành, cùng bằng chứng từ thiết bị thật hoặc lý do rõ nếu chỉ dùng simulator.",
      "Theo dõi thời gian khởi động, độ mượt khi cuộn, bộ nhớ ảnh, mức dùng pin và mạng cùng tỷ lệ phiên không crash.",
      "Khả năng tiếp cận và khai báo quyền riêng tư không bị đẩy thành việc làm sau release."
    ]
  },
  "data-ml-science-workflow": {
    role: "Làm như một nhà khoa học dữ liệu và ML thận trọng về nguồn gốc dữ liệu, rò rỉ dữ liệu, độ bất định và khả năng tái lập.",
    heuristics: [
      "Xác định giả thuyết và quyết định trước khi mở notebook; một phân tích không thể chứng minh mọi thứ.",
      "Rà soát nguồn gốc dữ liệu: nguồn, giấy phép, độ mới, sai lệch lấy mẫu, dữ liệu thiếu, schema drift, rò rỉ và trường nhạy cảm.",
      "Đánh giá bằng baseline, khoảng tin cậy, calibration, ablation, phân tích lỗi và kiểm tra OOD."
    ],
    failureModes: [
      "Rò rỉ giữa tập train và test hoặc rò rỉ theo thời gian làm model trông tốt nhưng thất bại trên production.",
      "Tương quan được kể như quan hệ nhân quả dù thiếu chiến lược nhận diện hoặc thiết kế thử nghiệm.",
      "Notebook phụ thuộc trạng thái ẩn, seed không cố định và phiên bản dữ liệu không rõ nên không thể tái lập."
    ],
    gates: [
      "Có từ điển dữ liệu, môi trường có thể tái lập, seed, đầu vào có phiên bản và nhật ký giả định.",
      "Các phát hiện nêu độ bất định, điểm cần lưu ý, hướng đã thất bại và phép kiểm tra bằng hiểu biết miền.",
      "Không để lộ dữ liệu y tế, tài chính, độc quyền hoặc nhạy cảm trong tài liệu công khai."
    ]
  }
};

const vietnameseChecklistCopies: Record<string, LocalizedChecklistCopy> = {
  "ticket-intake-to-start": {
    title: "Từ ticket đến commit đầu tiên",
    summary: "Danh sách giúp biến một ticket thành phạm vi rõ ràng, kế hoạch vừa đủ và bước sửa đầu tiên có thể kiểm chứng.",
    whenToUse: "Dùng trước khi bắt tay vào một việc đến từ sản phẩm, hỗ trợ, thiết kế hoặc đồng đội kỹ thuật.",
    tags: ["Hạng mục", "Phạm vi", "Bắt đầu làm"]
  },
  "ai-driven-engineering-foundation-roadmap": {
    title: "Lộ trình nền tảng kỹ thuật trong thời đại AI",
    summary: "Lộ trình nhiều lớp để rèn khả năng phán đoán kỹ thuật của một kỹ sư giàu kinh nghiệm khi làm việc cùng AI.",
    whenToUse: "Dùng trước hoặc sau việc kỹ thuật, nhất là khi công việc chạm tới kiến trúc, dữ liệu, độ tin cậy hoặc rollout.",
    tags: ["Nền tảng kỹ thuật", "Kiến trúc", "Vận hành thực tế"]
  },
  "engineering-delivery-checklist": {
    title: "Danh sách kiểm tra khi giao phần mềm",
    summary: "Tám giai đoạn từ lúc nhận việc đến khi theo dõi và rút kinh nghiệm sau rollout.",
    whenToUse: "Dùng khi thay đổi có thể ảnh hưởng kiến trúc, dữ liệu, lưu lượng, người dùng, vận hành production hoặc việc bàn giao.",
    tags: ["Công việc", "Bàn giao", "Rollout"]
  },
  "senior-engineer-reflex": {
    title: "Những câu hỏi của Senior Engineer",
    summary: "Bộ câu hỏi gọn cho mọi tính năng, từ nhu cầu kinh doanh và domain đến API, dữ liệu, tính nhất quán, bảo mật, observability và rollout.",
    whenToUse: "Dùng trước khi triển khai một việc tưởng đơn giản nhưng có thể ẩn rủi ro với production, dữ liệu hoặc người dùng.",
    tags: ["Kỹ sư giàu kinh nghiệm", "Câu hỏi", "Rủi ro"]
  },
  "capstone-production-project": {
    title: "Dự án thực hành cho production",
    summary: "Bài thực hành dài hạn mô phỏng thương mại điện tử, thuê bao hoặc đặt chỗ để luyện kiến trúc, dữ liệu, chống lỗi, sự kiện và observability.",
    whenToUse: "Dùng như một phòng lab thực tế để biến kiến thức trong lộ trình thành sản phẩm và bằng chứng năng lực cụ thể.",
    tags: ["Dự án tổng kết", "Thực hành", "Hồ sơ năng lực"]
  },
  "module-creation": {
    title: "Tạo module mới",
    summary: "Danh sách kiểm tra khi thêm route, module tính năng, module dịch vụ hoặc component dùng chung mà vẫn giữ trách nhiệm rõ ràng.",
    whenToUse: "Dùng khi thêm một phần tính năng hoặc module mới có thể tái sử dụng.",
    tags: ["Mô-đun", "Kiến trúc", "Frontend", "Backend"]
  },
  "ai-system-engineering-roadmap": {
    title: "Lộ trình kỹ thuật hệ thống với AI",
    summary: "Danh sách học hằng ngày về trách nhiệm xuyên suốt SDLC, kiến trúc phân tán, hệ thống lưu trữ và cách dùng AI để rà soát kỹ thuật.",
    whenToUse: "Dùng như bản đồ học mỗi ngày khi mục tiêu là ra quyết định kỹ thuật tốt hơn, không chỉ viết code nhanh hơn.",
    tags: ["Kỹ năng AI", "Kỹ thuật hệ thống", "Hệ thống phân tán", "Lưu trữ", "SDLC"]
  },
  "release-readiness": {
    title: "Kiểm tra trước khi release",
    summary: "Danh sách giúp quyết định một thay đổi đã đủ an toàn để rời branch hay chưa.",
    whenToUse: "Dùng trước khi merge, gắn tag hoặc chuẩn bị đưa lên production.",
    tags: ["Release", "QA", "Merge"]
  },
  "rollout-plan": {
    title: "Kế hoạch rollout",
    summary: "Danh sách đưa code đã merge lên production theo từng bước, có điểm dừng và cách quay lại rõ ràng.",
    whenToUse: "Dùng cho release theo giai đoạn, feature flag, nhóm người dùng, migration hoặc thay đổi UI có tác động lớn.",
    tags: ["Rollout", "Feature flag", "Theo dõi"]
  },
  "daily-ai-learning-loop": {
    title: "Vòng học AI hằng ngày",
    summary: "Một nhịp học ngắn mỗi ngày: thử một điều hữu ích, lưu lại một sản phẩm và dành ít phút nhìn lại.",
    whenToUse: "Dùng vào đầu và cuối ngày khi muốn rèn kỹ năng AI đều đặn mà không làm ngày làm việc quá tải.",
    tags: ["Hằng ngày", "Học AI", "Thói quen"]
  },
  "weekly-ai-os-review": {
    title: "Tổng kết hệ thống làm việc với AI hằng tuần",
    summary: "Buổi nhìn lại công việc, học tập, tài chính, cuộc sống và những quy trình AI đáng giữ lại.",
    whenToUse: "Dùng cuối tuần để biến những lần dùng AI rời rạc thành cách làm có thể lặp lại.",
    tags: ["Tổng kết tuần", "Hệ thống cá nhân", "Nghề nghiệp"]
  },
  "ai-tool-routing-decision-tree": {
    title: "Cây quyết định chọn công cụ AI",
    summary: "Danh sách giúp chọn NotebookLM, GPT, Claude, Codex hoặc Antigravity trước khi bắt đầu.",
    whenToUse: "Dùng khi công việc còn mơ hồ, khá lớn hoặc dễ dẫn tới việc hỏi mọi công cụ AI cùng lúc.",
    tags: ["Chọn công cụ", "Quyết định", "Nguyên tắc an toàn"]
  },
  "ai-assisted-feature-workflow": {
    title: "Quy trình làm tính năng có AI hỗ trợ",
    summary: "Quy trình đầy đủ từ ý tưởng, đặc tả và triển khai đến rà soát, rollout rồi lưu lại kiến thức.",
    whenToUse: "Dùng cho thay đổi sản phẩm hoặc kỹ thuật đáng kể, khi nhiều công cụ AI cùng hỗ trợ nhưng người làm vẫn giữ trách nhiệm cuối cùng.",
    tags: ["Tính năng", "GPT", "Claude", "Codex", "Antigravity"]
  },
  "ninety-day-ai-skill-plan": {
    title: "Kế hoạch nâng kỹ năng AI trong 90 ngày",
    summary: "Kế hoạch theo từng giai đoạn để biến công cụ AI thành thói quen làm việc, năng lực kỹ thuật, tài sản nghề nghiệp và hệ thống cá nhân.",
    whenToUse: "Dùng như lộ trình cho một quý để hiểu AI sâu hơn và khai thác tốt bộ công cụ đang có.",
    tags: ["90 ngày", "Lộ trình", "Hiểu biết về AI"]
  }
};

const vietnameseSectionCopies: Record<string, LocalizedSectionCopy> = {
  understand: { title: "Hiểu yêu cầu", detail: "Xác nhận đây là vấn đề cần giải quyết, không chỉ là yêu cầu đổi giao diện hoặc sửa code." },
  prepare: { title: "Chuẩn bị trước khi làm", detail: "Làm rõ phần chưa biết trước khi đọc thêm nhiều file." },
  execute: { title: "Bắt đầu thực hiện", detail: "Giữ thay đổi đầu tiên nhỏ, rõ và dễ rà soát." },
  "code-design": { title: "Lớp 1: Nền tảng thiết kế code", detail: "Xây codebase dễ test, refactor và dễ hướng dẫn AI mà không phá vỡ kiến trúc." },
  "data-consistency": { title: "Lớp 2: Dữ liệu và tính nhất quán", detail: "Nhiều lỗi production bắt nguồn từ mô hình dữ liệu, migration, truy vấn hoặc giả định sai về tính nhất quán." },
  "distributed-resilience": { title: "Lớp 3: Hệ thống phân tán và khả năng chống lỗi", detail: "Một dependency có thể lỗi mà hệ thống không nhất thiết phải sập theo dây chuyền." },
  "events-cqrs": { title: "Lớp 4: Kiến trúc hướng sự kiện, CQRS và Event Sourcing", detail: "Chỉ dùng sự kiện khi phù hợp với domain và năng lực vận hành, không dùng chỉ vì nghe hiện đại." },
  "performance-observability": { title: "Lớp 5: Hiệu năng, cache và vận hành production", detail: "Độ tin cậy cần được đo trước rollout, không phải chờ người dùng phản ánh mới sửa." },
  intake: { title: "Giai đoạn 1: Tiếp nhận", detail: "Hiểu đúng vấn đề trước khi chọn giải pháp kỹ thuật." },
  discovery: { title: "Giai đoạn 2: Khảo sát", detail: "Vẽ lại hệ thống hiện tại trước khi thay đổi." },
  design: { title: "Giai đoạn 3: Thiết kế", detail: "So sánh các phương án và chọn thiết kế đơn giản nhất xử lý đúng rủi ro." },
  "implementation-plan": { title: "Giai đoạn 4: Kế hoạch triển khai", detail: "Chia thiết kế thành các PR nhỏ, rõ và dễ rà soát." },
  "coding-review": { title: "Giai đoạn 5: Viết code và rà soát", detail: "Giữ phần triển khai đúng ranh giới và đúng hành vi trên production." },
  "pre-rollout": { title: "Giai đoạn 6: Kiểm chứng trước rollout", detail: "Chứng minh tính năng chạy đúng cả luồng bình thường lẫn tình huống lỗi." },
  rollout: { title: "Giai đoạn 7: Rollout", detail: "Release theo từng bước nhỏ và theo dõi tác động tới người dùng." },
  "post-rollout": { title: "Giai đoạn 8: Sau rollout", detail: "Biến kết quả bàn giao thành bài học và tri thức chung của đội ngũ." },
  "business-product-domain": { title: "Kinh doanh, sản phẩm và domain", detail: "Nối phần triển khai với kết quả thật cần tạo ra." },
  "api-data-consistency": { title: "API, dữ liệu và tính nhất quán", detail: "Làm rõ contract và cách trạng thái thay đổi." },
  "resilience-security": { title: "Khả năng chống lỗi và bảo mật", detail: "Giả định dependency và người dùng có thể hành xử ngoài dự đoán." },
  "observability-rollout": { title: "Observability và rollout", detail: "Chọn tín hiệu để hệ thống tự chứng minh đang khỏe hay có vấn đề." },
  "feature-set": { title: "Phạm vi sản phẩm", detail: "Chọn domain buộc người làm phải xử lý những đánh đổi thật trên production." },
  "foundation-requirements": { title: "Yêu cầu nền tảng", detail: "Chứng minh hệ thống có ranh giới và quyết định dữ liệu rõ ràng." },
  "resilience-events": { title: "Chống lỗi và sự kiện", detail: "Luyện cách xử lý tình huống lỗi để thể hiện phán đoán của kỹ sư giàu kinh nghiệm." },
  "production-requirements": { title: "Yêu cầu cho production", detail: "Vận hành bài thực hành như một hệ thống thật, không chỉ là bản demo." },
  boundary: { title: "Định nghĩa ranh giới", detail: "Một module nên có một lý do chính để thay đổi." },
  frontend: { title: "Kiểm tra frontend", detail: "Giữ UI ổn định, dễ tiếp cận và đo lường được." },
  backend: { title: "Kiểm tra backend", detail: "Làm rõ contract trước khi chi tiết triển khai lan sang nhiều nơi." },
  verification: { title: "Kiểm chứng", detail: "Module chưa hoàn tất nếu lần thay đổi sau vẫn không thể thực hiện an toàn." },
  "sdlc-ownership": { title: "Trụ cột 1: Trách nhiệm xuyên suốt SDLC", detail: "Giữ trách nhiệm của con người rõ ràng trong khi AI tăng tốc triển khai." },
  "distributed-resilience-advanced": { title: "Trụ cột 2: Kiến trúc phân tán và chống lỗi", detail: "Học các pattern giúp hệ thống vẫn đúng khi trạng thái, thời gian và dependency trở nên phức tạp." },
  "storage-scale": { title: "Trụ cột 3: Hệ thống lưu trữ quy mô lớn", detail: "Xây trực giác về lưu trữ để cân bằng hiệu năng, tính sẵn sàng và thay đổi dữ liệu an toàn." },
  "ai-engineering-review": { title: "Trụ cột 4: Quy trình kỹ thuật chuyên nghiệp với AI", detail: "Dùng AI để phân tích, phản biện và xây chiến lược test, nhưng giữ phán đoán cuối cùng ở người làm." },
  quality: { title: "Cổng chất lượng", detail: "Xác nhận thay đổi đúng, có test và đủ rõ để rà soát." },
  risk: { title: "Risk gate", detail: "Bảo đảm release có observability và rollback rõ ràng." },
  handoff: { title: "Bàn giao", detail: "Để lại đủ ngữ cảnh cho người rà soát và người vận hành." },
  "during-rollout": { title: "Trong rollout", detail: "Đi theo từng bước nhỏ và theo dõi những tín hiệu xuất hiện sớm." },
  "after-rollout": { title: "Sau rollout", detail: "Khép lại đầy đủ thay vì dừng ngay sau khi đưa code lên." },
  "morning-orientation": { title: "Định hướng buổi sáng", detail: "Chọn một cách dùng AI phù hợp với việc thật trong ngày." },
  "workday-application": { title: "Áp dụng trong ngày làm việc", detail: "Học qua công việc thật thay vì chỉ xem công cụ." },
  "evening-review": { title: "Nhìn lại buổi tối", detail: "Khép lại bài học khi ngữ cảnh vẫn còn mới." },
  "capture-week": { title: "Ghi lại tuần vừa qua", detail: "Thu thập đủ dữ kiện để không tổng kết chỉ bằng trí nhớ." },
  "review-patterns": { title: "Tìm điều lặp lại", detail: "Tìm những tín hiệu lặp lại, không chỉ đếm việc đã xong." },
  "plan-next-week": { title: "Lên kế hoạch tuần tới", detail: "Biến phần nhìn lại thành một kế hoạch nhỏ có thể thực hiện." },
  "choose-first-tool": { title: "Chọn công cụ đầu tiên", detail: "Bắt đầu bằng công cụ khớp với điểm nghẽn chính." },
  safety: { title: "Nguyên tắc an toàn", detail: "Bảo vệ bí mật, production và quyền phán đoán của con người." },
  shape: { title: "Định hình công việc", detail: "Dùng AI để làm rõ bài toán trước khi giao phần triển khai." },
  "review-release": { title: "Rà soát và release", detail: "Tách người thực hiện khỏi bước rà soát và quyết định release." },
  "week-one": { title: "Tuần 1: thiết lập hệ thống", detail: "Tạo nơi lưu trữ và cách làm cơ bản trước khi tối ưu quy trình." },
  "days-eight-thirty": { title: "Ngày 8-30: làm việc hiệu quả hơn", detail: "Biến việc lặp lại thành cách làm có thể dùng lại." },
  "days-thirty-one-sixty": { title: "Ngày 31-60: tạo giá trị nghề nghiệp", detail: "Chuyển việc đã làm thành bằng chứng và tài sản có thể dùng lâu dài." },
  "days-sixty-one-ninety": { title: "Ngày 61-90: cuộc sống, tài chính và tương lai", detail: "Mở rộng hệ thống làm việc ra ngoài phạm vi code." }
};

const vietnameseContextualSectionCopies: Record<string, LocalizedSectionCopy> = {
  "ticket-intake-to-start/execute": {
    title: "Bắt đầu thực hiện",
    detail: "Giữ thay đổi đầu tiên nhỏ, rõ và dễ review."
  },
  "ai-assisted-feature-workflow/execute": {
    title: "Thực hiện",
    detail: "Dùng đúng agent cho đúng loại công việc."
  },
  "engineering-delivery-checklist/pre-rollout": {
    title: "Giai đoạn 6: Kiểm chứng trước rollout",
    detail: "Chứng minh tính năng chạy đúng cả luồng bình thường lẫn tình huống lỗi."
  },
  "rollout-plan/pre-rollout": {
    title: "Trước rollout",
    detail: "Chuẩn bị môi trường, nhóm người dùng và phương án dự phòng."
  },
  "release-readiness/handoff": {
    title: "Bàn giao",
    detail: "Để lại đủ ngữ cảnh cho người review và người vận hành."
  },
  "ai-tool-routing-decision-tree/handoff": {
    title: "Bàn giao giữa các công cụ",
    detail: "Chỉ chuyển phần ngữ cảnh hữu ích, không bê nguyên cả cuộc trò chuyện."
  }
};

const vietnameseStepCopies: Record<string, LocalizedStepCopy> = {
  "read-ticket": { label: "Đọc ticket rồi diễn đạt lại mục tiêu bằng một câu." },
  "identify-user": { label: "Xác định người dùng, route, quy trình hoặc ranh giới hệ thống bị ảnh hưởng." },
  acceptance: { label: "Tách rõ tiêu chí nghiệm thu và đánh dấu phần còn thiếu." },
  impact: { label: "Kiểm tra tác động tới sản phẩm, SEO, analytics, locale, khả năng tiếp cận và quyền riêng tư." },
  "find-patterns": { label: "Tìm pattern, test, helper và ranh giới trách nhiệm gần nhất trong codebase." },
  "decide-scope": { label: "Tách phần bắt buộc khỏi việc dọn dẹp chỉ nên làm thêm." },
  "plan-verification": { label: "Chọn lệnh, ảnh chụp hoặc bước kiểm tra thủ công để chứng minh thay đổi đã đúng." },
  "note-risk": { label: "Ghi lại giả định rủi ro nhất trước khi triển khai." },
  "small-diff": { label: "Bắt đầu bằng thay đổi nhỏ nhất có thể rà soát." },
  "update-tests": { label: "Thêm hoặc sửa test tại đúng ranh giới có hành vi thay đổi." },
  "update-tracking": { label: "Cập nhật PostHog khi thêm điều hướng, CTA, bộ lọc, form, tùy chọn hoặc route mới." },
  checkpoint: { label: "Dừng lại kiểm tra nếu phạm vi hoặc mức rủi ro thay đổi." },
  principles: { label: "Học SOLID, DRY, KISS, YAGNI, hướng dependency và các pattern refactor." },
  architecture: { label: "Thực hành Clean Architecture, Hexagonal Architecture, Onion Architecture và Modular Monolith trước khi nghĩ tới microservices." },
  ddd: { label: "Học các pattern chiến thuật của DDD.", detail: "Entity, Value Object, Aggregate, Repository, Domain Service và Application Service." },
  patterns: { label: "Xây danh mục pattern theo từng hoàn cảnh.", detail: "Nhóm khởi tạo, cấu trúc, hành vi, doanh nghiệp, tích hợp, chống lỗi và bàn giao." },
  tests: { label: "Chọn đúng tầng kiểm thử.", detail: "Unit, integration, contract, E2E, property-based, migration và rollback test." },
  unit: { label: "Viết unit test cho logic thuần và các trường hợp biên của module." },
  integration: { label: "Viết integration test cho contract, persistence và điểm nối giữa các thành phần." },
  modeling: { label: "Học mô hình quan hệ, constraint, chuẩn hóa, phi chuẩn hóa, dữ liệu đa tenant, soft delete và dữ liệu theo thời gian." },
  transactions: { label: "Hiểu ACID, mức cô lập, lock, deadlock và ranh giới transaction." },
  indexes: { label: "Đánh giá index bằng số liệu thực tế.", detail: "B-tree, composite, covering, partial, expression, GIN, GiST, SP-GiST, BRIN và EXPLAIN ANALYZE." },
  migration: {
    label: "Thiết kế migration dữ liệu và cách rollback trước khi code được merge.",
    detail: "Backfill, tạo index online, CDC, audit log, backup/restore và khả năng tương thích."
  },
  replication: { label: "Học replication và tính sẵn sàng.", detail: "Primary-replica, độ trễ async, read-after-write, failover, split brain, RPO, RTO và khôi phục thảm họa." },
  timeouts: { label: "Đặt timeout trước khi thêm retry." },
  retry: { label: "Chỉ retry trong giới hạn, có exponential backoff và jitter khi thao tác đủ an toàn." },
  "circuit-breaker": { label: "Hiểu sâu Circuit Breaker.", detail: "Trạng thái closed, open, half-open, cửa sổ đo, ngưỡng chậm, fallback và phân loại lỗi." },
  bulkhead: { label: "Dùng Bulkhead, rate limiting, throttling, backpressure, fallback và graceful degradation khi thực sự cần." },
  idempotency: { label: "Thiết kế idempotency, chống trùng, distributed lock, DLQ và san tải qua queue." },
  "event-types": { label: "So sánh gọi API trực tiếp, queue, pub/sub, log stream, Event Sourcing và CDC." },
  "event-sourcing": { label: "Học sâu Event Sourcing.", detail: "Domain event, event store, aggregate stream, log chỉ ghi thêm, projection, snapshot, replay và version sự kiện." },
  cqrs: { label: "Hiểu luồng CQRS.", detail: "Command, handler, aggregate, event, projection handler, read model và query." },
  outbox: { label: "Dùng Transactional Outbox, Inbox, Idempotent Consumer, Saga, DLQ, version schema và Anti-Corruption Layer khi bài toán cần." },
  "avoid-overuse": { label: "Không dùng Event Sourcing cho CRUD đơn giản hoặc khi đội chưa đủ sức vận hành schema sự kiện và projection." },
  cache: { label: "Học cache-aside, read-through, write-through, write-behind, TTL, eviction, stampede, hot key, CDN và materialized view." },
  scale: { label: "Thực hành phân trang, xử lý theo lô, job bất đồng bộ, load test và đo độ trễ p50/p95/p99." },
  otel: { label: "Dùng OpenTelemetry đúng mục đích.", detail: "Metric, log, trace, correlation ID, distributed tracing và span." },
  slo: { label: "Học SLI, SLO, SLA, error budget, RED/USE metrics, cảnh báo, runbook, sự cố và postmortem." },
  "well-architected": { label: "Rà soát vận hành, bảo mật, độ tin cậy, hiệu năng, chi phí và tính bền vững." },
  business: { label: "Nêu vấn đề kinh doanh hoặc vấn đề của người dùng cùng chỉ số thành công." },
  scope: { label: "Làm rõ phạm vi, phần không làm, thời hạn, mức ưu tiên và nhóm người dùng bị ảnh hưởng." },
  constraints: { label: "Kiểm tra dependency, bảo mật, quyền riêng tư, pháp lý, migration dữ liệu, tương thích ngược và tác động tới lưu lượng production." },
  questions: { label: "Nhờ AI đặt câu hỏi làm rõ về kinh doanh, sản phẩm, dữ liệu, API, bảo mật, độ tin cậy, rollout và observability." },
  flow: { label: "Xác định service, route, job, API, sự kiện, kho dữ liệu, người phụ trách và pattern hiện có." },
  history: { label: "Kiểm tra sự cố, điểm nghẽn, dashboard, log và ràng buộc hệ thống cũ có liên quan." },
  "risk-register": { label: "Nhờ AI lập bản đồ dependency, thành phần bị ảnh hưởng, điểm tích hợp, rủi ro và thông tin còn thiếu." },
  adr: { label: "Tạo ADR khi quyết định ảnh hưởng kiến trúc, dữ liệu, dependency hoặc rollout." },
  options: { label: "So sánh ít nhất ba phương án về độ phức tạp, khả năng mở rộng, tính nhất quán, chi phí, migration, rollback và khả năng bảo trì." },
  "technical-decisions": { label: "Chốt đồng bộ hay bất đồng bộ, CRUD/CQRS/Event Sourcing, index, ranh giới transaction, cache, idempotency, retry, Circuit Breaker và mô hình bảo mật." },
  slice: { label: "Chia việc theo backend, database, API contract, test, observability, rollout và tài liệu." },
  compatibility: { label: "Lập kế hoạch migration, feature flag, API tương thích ngược, theo dõi, rollback và người rà soát." },
  "test-plan": { label: "Xác định các kiểm tra unit, integration, contract, E2E, tải, bảo mật, migration và rollback." },
  boundaries: { label: "Kiểm tra ranh giới kiến trúc, transaction, validation, xử lý lỗi và trách nhiệm sở hữu." },
  "side-effects": { label: "Đảm bảo retry không tạo tác dụng phụ trùng lặp và dữ liệu nhạy cảm không bị ghi log." },
  review: { label: "Nhờ AI rà soát như một Principal Engineer về tính đúng đắn, race condition, tính nhất quán, bảo mật, observability, hiệu năng, khả năng bảo trì và rủi ro rollback." },
  signals: { label: "Chuẩn bị dashboard, cảnh báo, runbook, đường rollback và cách kiểm tra tác động tới khách hàng." },
  readiness: { label: "Nhờ AI tạo danh sách sẵn sàng cho production gồm tình huống lỗi, theo dõi, điều kiện dừng, rollback và kiểm tra dữ liệu." },
  "dark-launch": { label: "Nếu có thể, deploy ở trạng thái chưa mở cho người dùng rồi bật nội bộ trước khi canary." },
  monitor: { label: "Theo dõi chỉ số thành công, tỷ lệ lỗi, độ trễ, tải DB, query plan, độ trễ queue, tỷ lệ cache hit/miss và phản hồi hỗ trợ." },
  abort: { label: "Định nghĩa điều kiện thành công, điều kiện dừng, người quyết định rollback, kế hoạch thông báo và kill switch." },
  outcome: { label: "So sánh số liệu kỳ vọng với kết quả thực tế, regression, sự cố, lần suýt lỗi và cảnh báo nhiễu." },
  docs: { label: "Cập nhật tài liệu, ADR, runbook, checklist Studio và ticket theo dõi." },
  learning: { label: "Ghi lại bài học sau rollout để công việc sau có điểm bắt đầu tốt hơn." },
  product: { label: "Luồng chính, trường hợp biên, cách hoàn tác, trạng thái chờ/lỗi và nhu cầu audit là gì?" },
  domain: { label: "Entity chính, ranh giới aggregate, chuyển trạng thái, invariant và domain event là gì?" },
  api: { label: "API đồng bộ hay bất đồng bộ; đã có idempotency, version, phân trang và tương thích ngược chưa?" },
  data: { label: "Schema, migration, index, quy mô truy vấn, thời gian lưu và rủi ro PII là gì?" },
  consistency: { label: "Cần strong consistency hay eventual consistency; có race condition hoặc sự kiện trùng không?" },
  dependency: { label: "Dependency nào có thể lỗi, phản hồi chậm hoặc chỉ hoàn tất một phần?" },
  protection: { label: "Đã có timeout, retry, Circuit Breaker, fallback, rate limit và idempotency chưa?" },
  security: { label: "Ai được phép dùng, authorization ra sao, đầu vào nào cần kiểm tra và dữ liệu nào không được ghi log?" },
  release: { label: "Đã có feature flag, canary, điều kiện dừng, đường rollback, cách hoàn tác migration và người theo dõi chưa?" },
  domains: { label: "Xây các luồng người dùng, danh mục, giỏ hàng, đơn hàng, thanh toán, tồn kho, thông báo, khuyến mãi, quản trị, audit và báo cáo." },
  evidence: { label: "Lưu ADR, sơ đồ, bằng chứng test, ghi chú rollout và postmortem vào hồ sơ năng lực." },
  postgres: { label: "Mô hình hóa bảng PostgreSQL, constraint, migration, index, query plan và quy trình backup/restore." },
  payment: { label: "Xây payment Saga có Circuit Breaker, fallback và cơ chế chống thanh toán trùng." },
  dashboard: { label: "Tạo dashboard theo dõi lượng request, lỗi, độ trễ, DB, queue, tỷ lệ cache hit, lỗi dependency và chỉ số kinh doanh." },
  rollout: { label: "Dùng feature flag, migration không downtime, load test, runbook, cảnh báo, diễn tập rollback và nhìn lại sau rollout." },
  owner: { label: "Nêu rõ module chịu trách nhiệm phần nào và phụ thuộc vào đâu." },
  inputs: { label: "Định nghĩa đầu vào, đầu ra và trạng thái không hợp lệ." },
  placement: { label: "Đặt file theo pattern đang có thay vì tự tạo một kiểu thư mục mới." },
  "public-api": { label: "Chỉ mở API công khai vừa đủ và giữ chi tiết bên trong ở chế độ riêng tư." },
  states: { label: "Bao phủ đầy đủ các trạng thái của UI." },
  loading: { label: "Trạng thái đang tải hoặc đang chờ." },
  empty: { label: "Trạng thái chưa có dữ liệu." },
  error: { label: "Trạng thái lỗi hoặc thiếu quyền." },
  mobile: { label: "Hành vi trên mobile và màn hình hẹp." },
  tokens: { label: "Dùng token, icon, khoảng cách và quy tắc card đang có." },
  tracking: { label: "Thêm event cho trang, CTA, bộ lọc, tìm kiếm, tùy chọn hoặc liên kết ra ngoài khi cần." },
  a11y: { label: "Kiểm tra nhãn, thứ tự focus, thao tác bàn phím và độ tương phản." },
  contract: { label: "Ghi rõ contract API/job và quy tắc validation." },
  auth: { label: "Kiểm tra authorization, quyền sở hữu và nhu cầu audit." },
  observability: { label: "Thêm log, metric, cảnh báo và sự kiện kinh doanh nếu hành vi người dùng thay đổi." },
  manual: { label: "Kiểm tra thủ công luồng chính và ít nhất một tình huống lỗi." },
  screenshots: { label: "Đính kèm ảnh chụp cho thay đổi UI hoặc nói rõ vì sao không cần." },
  verification: { label: "Danh sách kiểm chứng ghi rõ lệnh cần chạy và bước kiểm tra thủ công." },
  "ai-paradox": { label: "Để ý nghịch lý khi dùng AI.", detail: "Không merge code phức tạp do AI tạo nếu chưa hiểu cơ chế và hậu quả trên production." },
  "productive-friction": { label: "Giữ lại những bước chậm cần thiết.", detail: "Rà soát thủ công, cung cấp ngữ cảnh có chủ đích và dành vùng không dùng AI khi học hoặc onboarding." },
  "nine-phases": { label: "Rà soát chín giai đoạn của SDLC.", detail: "Chiến lược, yêu cầu, kiến trúc, viết code, QA, release, observability, bảo trì và cải tiến." },
  "telemetry-layers": { label: "Lập bản đồ telemetry qua tám lớp.", detail: "Edge/mạng, service, ứng dụng, dữ liệu, Kubernetes, serverless/PaaS, CI/CD và xử lý sự cố." },
  "event-sourcing-cqrs": { label: "Học Event Sourcing và CQRS như một mô hình vận hành.", detail: "Event store, aggregate stream, snapshot, projection, optimistic concurrency và dựng lại read model." },
  "schema-evolution": { label: "Thực hành thay đổi schema sự kiện.", detail: "Tolerant deserialization, upcasting, sự kiện có version và lưu trữ nóng/ấm/lạnh." },
  "retry-composition": { label: "Sắp xếp retry trước Circuit Breaker có chủ đích.", detail: "Retry trong giới hạn với backoff/jitter, rồi ghi kết quả cuối vào breaker." },
  "btree-lsm": { label: "So sánh B-Tree và LSM-Tree.", detail: "Cập nhật tại chỗ thiên về đọc so với ghi nối tiếp thiên về ghi, cùng compaction và Bloom filter." },
  "index-mastery": { label: "Rèn kỹ năng dùng index trong thực tế.", detail: "Clustered, non-clustered, composite, covering index, quy tắc tiền tố trái và lúc index mất tác dụng." },
  "replication-consensus": { label: "Học replication và consensus.", detail: "Đồng bộ, bất đồng bộ, bán đồng bộ, quorum Raft/Multi-Paxos, replication vật lý/logic và replication slot." },
  "sharding-transactions": { label: "Học sharding và transaction phân tán.", detail: "Consistent hashing, virtual node, giảm hotspot, đánh đổi của 2PC và Saga." },
  "ai-elicitation": { label: "Nhờ AI làm rõ yêu cầu trước khi triển khai.", detail: "Nhóm câu hỏi theo kinh doanh, sản phẩm, dữ liệu, API, bảo mật, độ tin cậy, rollout và observability." },
  "adversarial-review": { label: "Phản biện kiến trúc theo hướng tìm điểm vỡ.", detail: "Thách thức race condition, lỗi nhất quán, lỗ hổng bảo mật, điểm nghẽn hiệu năng và tình huống lỗi." },
  "test-security": { label: "Tạo ma trận kiểm thử và bảo mật.", detail: "Unit, integration, contract, E2E, migration, rollback, kiểm tra bảo mật tĩnh và lỗi dependency." },
  "daily-artifact": { label: "Lưu một thành quả học tập mỗi ngày.", detail: "ADR, prompt, query plan, ghi chú chống lỗi, checklist rollout, runbook hoặc bài học postmortem." },
  "feature-flag": { label: "Dùng feature flag hoặc rollout theo giai đoạn khi phạm vi ảnh hưởng lớn." },
  analytics: { label: "Xác nhận event PostHog vẫn được gửi và event mới có tên nhất quán." },
  rollback: { label: "Viết rõ các bước rollback và người có quyền quyết định." },
  summary: { label: "Phần tóm tắt PR nêu hành vi thay đổi và route bị ảnh hưởng." },
  "target": { label: "Xác định nhóm rollout: nội bộ, beta, theo tỷ lệ, tenant hoặc khu vực." },
  flag: { label: "Xác nhận giá trị mặc định của flag/config và người phụ trách kill switch." },
  baseline: { label: "Ghi số liệu gốc về chuyển đổi, tỷ lệ lỗi và phản hồi hỗ trợ." },
  comms: { label: "Chuẩn bị release note, ghi chú cho hỗ trợ và đường báo động tới người phụ trách." },
  phases: { label: "Rollout theo từng giai đoạn." },
  "phase-internal": { label: "Người dùng nội bộ hoặc nhóm dogfood." },
  "phase-beta": { label: "Một nhóm beta nhỏ." },
  "phase-percent": { label: "Mở 10%, 25%, 50%, rồi 100% nếu các tín hiệu vẫn khỏe." },
  "phase-enterprise": { label: "Chỉ mở cho tenant cụ thể khi đội hỗ trợ đã sẵn sàng." },
  observe: { label: "Theo dõi lỗi, độ trễ, chuyển đổi, event PostHog và ticket hỗ trợ." },
  pause: { label: "Tạm dừng rollout khi chạm điều kiện rollback." },
  log: { label: "Ghi mỗi lần đổi giai đoạn cùng thời điểm, người phụ trách và lý do." },
  compare: { label: "So sánh số liệu sau rollout với mốc ban đầu." },
  cleanup: { label: "Gỡ flag cũ, code tạm và những cách xử lý tạm mà đội hỗ trợ đang dùng." },
  learn: { label: "Ghi lại điều khiến cả đội bất ngờ." },
  "follow-up": { label: "Tạo ticket theo dõi cho technical debt, tài liệu và phần analytics còn thiếu." },
  energy: { label: "Ghi mức năng lượng hiện tại, việc bắt buộc và những đầu việc còn mở." },
  "top-three": { label: "Chọn ba kết quả quan trọng nhất trong ngày." },
  practice: { label: "Chọn một kỹ năng AI để luyện.", detail: "Ví dụ: chia việc cho Codex rõ hơn, nhờ Claude phản biện, tổng hợp nguồn bằng NotebookLM hoặc dùng GPT để đóng khung quyết định." },
  "time-block": { label: "Dành một khoảng thời gian nhỏ cho việc luyện tập." },
  "route-tool": { label: "Chọn đúng công cụ cho công việc trước khi viết prompt." },
  "write-prompt": { label: "Viết prompt có vai trò, mục tiêu, ngữ cảnh, kết quả mong muốn và nguyên tắc an toàn." },
  "save-artifact": { label: "Lưu lại một sản phẩm cụ thể.", detail: "Prompt, checklist, ghi chú quyết định, diff, ảnh chụp hoặc bài học." },
  "avoid-noise": { label: "Dừng lại nếu vòng làm việc với AI rộng hơn việc thật cần giải quyết." },
  done: { label: "Liệt kê việc đã xong, chưa xong và lý do." },
  "tool-signal": { label: "Ghi công cụ AI nào có ích và chỗ nào gây nhiễu." },
  "prompt-improvement": { label: "Ghi một cách cải thiện prompt cho ngày mai." },
  archive: { label: "Lưu bài học vào NotebookLM, ChatGPT Project hoặc Studio." },
  work: { label: "Tóm tắt phần đã giao, PR, điểm nghẽn, sự cố và những khoảnh khắc đáng nhớ của đội." },
  "life-finance": { label: "Ghi lại sức khỏe, năng lượng, tài chính, các mối quan hệ và việc hành chính cần chú ý." },
  sources: { label: "Đưa tài liệu và ghi chú hữu ích vào NotebookLM khi câu trả lời cần bám sát nguồn." },
  "wins-losses": { label: "Ghi điều làm tốt, điều chưa tốt và thay đổi so với tuần trước." },
  avoidance: { label: "Nêu một quyết định hoặc cuộc trò chuyện mình đang né tránh." },
  "ai-leverage": { label: "Xác định nơi AI thực sự giúp tiết kiệm công sức và nơi nó làm phát sinh việc sửa lại." },
  "hard-truth": { label: "Viết một sự thật khó chịu nhưng cần nhìn thẳng cho tuần tới." },
  priorities: { label: "Chọn năm ưu tiên cho tuần tới." },
  "one-workflow": { label: "Chọn một quy trình AI để cải thiện có chủ đích." },
  "one-artifact": { label: "Cam kết hoàn thành một sản phẩm nhìn thấy được.", detail: "Bản nháp blog, RFC, demo tự động hóa, checklist hoặc ghi chú cho hồ sơ năng lực." },
  "one-boundary": { label: "Đặt một ranh giới để bảo vệ sự tập trung và an toàn dữ liệu." },
  source: { label: "Nếu câu trả lời phải dựa trên tài liệu đã tải lên, bắt đầu bằng NotebookLM." },
  research: { label: "Nếu cần nghiên cứu web từ nhiều nguồn, bắt đầu bằng GPT Deep Research." },
  decision: { label: "Nếu cần lập chiến lược, kế hoạch hoặc phân tích đánh đổi, bắt đầu bằng GPT." },
  critique: { label: "Nếu cần phản biện sâu, rà soát kiến trúc hoặc chỉnh một nội dung nhạy cảm, bắt đầu bằng Claude." },
  repo: { label: "Nếu công việc thay đổi code trong repo, bắt đầu bằng Codex hoặc Claude Code." },
  prototype: { label: "Nếu cần kiểm tra UI trên trình duyệt hoặc làm prototype xuyên suốt, bắt đầu bằng Antigravity." },
  brief: { label: "Viết bản giao việc ngắn gồm mục tiêu, ràng buộc, nguồn, tiêu chí nghiệm thu và nguyên tắc an toàn." },
  "execute-review": { label: "Để một AI thực hiện và AI khác rà soát khi rủi ro chất lượng đáng kể." },
  artifact: { label: "Yêu cầu kết quả có thể kiểm tra được.", detail: "Diff, checklist, báo cáo, ảnh chụp, ma trận quyết định hoặc bằng chứng test." },
  redact: { label: "Che bí mật, private key, dữ liệu khách hàng và thông tin nội bộ nhạy cảm." },
  "no-destructive": { label: "Không để agent chạy lệnh phá hủy hoặc migration production khi chưa được rà soát rõ ràng." },
  "human-decision": { label: "Giữ các quyết định về y tế, pháp lý, tài chính và rủi ro production cho người có trách nhiệm." },
  "gpt-prd": { label: "Nhờ GPT soạn mô tả vấn đề, user story, tiêu chí nghiệm thu, phần không làm, rủi ro, rollout và kế hoạch test." },
  "claude-review": { label: "Nhờ Claude phản biện kiến trúc, giả định, tình huống lỗi và phạm vi nhỏ nhất đủ giá trị." },
  codex: { label: "Dùng Codex cho việc trong repo cần test, diff sạch, refactor, migration và kết quả sẵn sàng mở PR." },
  antigravity: { label: "Dùng Antigravity cho prototype nặng về UI, kiểm tra trình duyệt, ảnh chụp và sản phẩm xuyên suốt." },
  "ai-review": { label: "Dùng Claude hoặc GPT rà soát diff về tính đúng đắn, bảo mật, trường hợp biên, phần test còn thiếu và rủi ro migration." },
  "human-review": { label: "Người phụ trách xem lại các đánh đổi và đưa ra quyết định merge cuối cùng." },
  "release-note": { label: "Dùng GPT để soạn release note, cập nhật cho bên liên quan và checklist rollout." },
  projects: { label: "Tạo năm ChatGPT Project.", detail: "PhongOS, Lãnh đạo kỹ thuật, Tài chính và đầu tư, Học tập và nghiên cứu, Viết lách và thương hiệu cá nhân." },
  notebooks: { label: "Tạo năm notebook trong NotebookLM.", detail: "Hồ sơ nghề nghiệp, Thư viện tài chính, Học AI và hệ thống, Lưu trữ cuộc sống, Kho kiến thức công việc." },
  templates: { label: "Lưu mẫu prompt cho Codex, Claude, Antigravity, NotebookLM và GPT." },
  logs: { label: "Tạo decision_log, career_roadmap, finance_snapshot và thư mục cho hệ thống làm việc với AI." },
  "pr-review": { label: "Tạo cẩm nang rà soát PR." },
  incident: { label: "Tạo quy trình xử lý sự cố và viết postmortem." },
  feature: { label: "Tạo quy trình từ đặc tả tính năng đến triển khai." },
  ship: { label: "Hoàn thành một tính năng có AI hỗ trợ và một lần refactor hoặc cải thiện test." },
  portfolio: { label: "Soạn bằng chứng cho hồ sơ năng lực ở cấp Staff Engineer." },
  writing: { label: "Soạn ba bài viết kỹ thuật." },
  "internal-proposal": { label: "Viết một đề xuất nội bộ về quy trình kỹ thuật có AI hỗ trợ." },
  demo: { label: "Làm một demo tự động hóa bằng Codex hoặc Antigravity." },
  finance: { label: "Tạo dashboard tài chính và checklist đầu tư." },
  "career-strategy": { label: "Lập chiến lược nghề nghiệp ba năm với ba kịch bản." },
  "learning-roadmap": { label: "Tạo lộ trình học 12 tháng và thói quen tổng kết tuần ổn định." }
};

const vietnameseContextualStepCopies: Record<string, LocalizedStepCopy> = {
  "ticket-intake-to-start/understand/impact": {
    label: "Kiểm tra tác động tới sản phẩm, SEO, analytics, locale, accessibility và quyền riêng tư."
  },
  "release-readiness/handoff/impact": {
    label: "Nêu rõ tác động tới SEO, locale, analytics, nội dung và deployment."
  },
  "ticket-intake-to-start/execute/checkpoint": {
    label: "Dừng lại cập nhật tình hình nếu phạm vi hoặc mức rủi ro thay đổi."
  },
  "ai-assisted-feature-workflow/execute/checkpoint": {
    label: "Sau mỗi phần việc nhỏ, dừng lại kiểm tra trước khi mở rộng phạm vi."
  },
  "ai-driven-engineering-foundation-roadmap/code-design/principles": {
    label: "Học SOLID, DRY, KISS, YAGNI, hướng dependency và các pattern refactor."
  },
  "ninety-day-ai-skill-plan/days-sixty-one-ninety/principles": {
    label: "Viết ra nguyên tắc làm việc và ranh giới cá nhân."
  },
  "ai-driven-engineering-foundation-roadmap/code-design/architecture": {
    label: "Thực hành Clean Architecture, Hexagonal Architecture, Onion Architecture và Modular Monolith trước khi nghĩ tới microservices."
  },
  "capstone-production-project/foundation-requirements/architecture": {
    label: "Tổ chức hệ thống theo kiến trúc phân lớp hoặc hexagonal, với trách nhiệm rõ cho từng module."
  },
  "ai-driven-engineering-foundation-roadmap/code-design/tests": {
    label: "Chọn đúng tầng kiểm thử.",
    detail: "Unit, integration, contract, E2E, property-based, migration và rollback test."
  },
  "engineering-delivery-checklist/pre-rollout/tests": {
    label: "Chạy unit, integration, contract, E2E, load, security, migration dry-run và kiểm tra tương thích ngược khi cần."
  },
  "capstone-production-project/foundation-requirements/tests": {
    label: "Bổ sung unit, integration, contract, E2E, migration và rollback test."
  },
  "release-readiness/quality/tests": {
    label: "Chạy typecheck, test, lint và lệnh build phù hợp."
  },
  "ai-tool-routing-decision-tree/safety/tests": {
    label: "Mọi thay đổi code đều phải có test hoặc cách kiểm chứng phù hợp."
  },
  "ai-driven-engineering-foundation-roadmap/data-consistency/migration": {
    label: "Thiết kế migration dữ liệu và cách rollback trước khi code được merge.",
    detail: "Backfill, tạo index online, CDC, audit log, backup/restore và khả năng tương thích."
  },
  "release-readiness/risk/migration": {
    label: "Xác nhận migration và thay đổi dữ liệu vẫn tương thích ngược."
  },
  "ai-driven-engineering-foundation-roadmap/distributed-resilience/circuit-breaker": {
    label: "Học các trạng thái của Circuit Breaker.",
    detail: "Closed, open và half-open."
  },
  "ai-system-engineering-roadmap/distributed-resilience-advanced/circuit-breaker": {
    label: "Hiểu sâu Circuit Breaker.",
    detail: "Trạng thái closed, open, half-open, cửa sổ đo, ngưỡng chậm, fallback và phân loại lỗi."
  },
  "ai-driven-engineering-foundation-roadmap/events-cqrs/event-sourcing": {
    label: "Học sâu Event Sourcing.",
    detail: "Domain event, event store, aggregate stream, log chỉ ghi thêm, projection, snapshot, replay và version sự kiện."
  },
  "capstone-production-project/resilience-events/event-sourcing": {
    label: "Dùng Event Sourcing cho vòng đời đơn hàng và read model CQRS cho trang quản trị hoặc báo cáo."
  },
  "ai-driven-engineering-foundation-roadmap/events-cqrs/outbox": {
    label: "Dùng Transactional Outbox, Inbox, Idempotent Consumer, Saga, DLQ, version schema và Anti-Corruption Layer khi bài toán cần."
  },
  "capstone-production-project/resilience-events/outbox": {
    label: "Dùng Outbox, queue worker, retry, DLQ, runbook cho poison message và idempotent consumer."
  },
  "ai-driven-engineering-foundation-roadmap/performance-observability/cache": {
    label: "Học cache-aside, read-through, write-through, write-behind, TTL, eviction, stampede, hot key, CDN và materialized view."
  },
  "capstone-production-project/resilience-events/cache": {
    label: "Thêm Redis cache với cơ chế invalidation, TTL, theo dõi hit rate và cách xử lý khi cache lỗi."
  },
  "ai-driven-engineering-foundation-roadmap/performance-observability/otel": {
    label: "Dùng OpenTelemetry đúng mục đích.",
    detail: "Metric, log, trace, correlation ID, distributed tracing và span."
  },
  "capstone-production-project/production-requirements/otel": {
    label: "Gắn OpenTelemetry cho trace, metric, log và correlation ID."
  },
  "engineering-delivery-checklist/intake/business": {
    label: "Nêu vấn đề kinh doanh hoặc vấn đề của người dùng cùng chỉ số thành công."
  },
  "senior-engineer-reflex/business-product-domain/business": {
    label: "Metric kinh doanh, nhóm người dùng và thời hạn nào quan trọng trong việc này?"
  },
  "engineering-delivery-checklist/intake/scope": {
    label: "Làm rõ phạm vi, phần không làm, thời hạn, mức ưu tiên và nhóm người dùng bị ảnh hưởng."
  },
  "capstone-production-project/feature-set/scope": {
    label: "Bắt đầu bằng Modular Monolith trước khi tách service."
  },
  "release-readiness/quality/scope": {
    label: "Xác nhận phạm vi PR khớp với ticket và không giấu việc dọn dẹp ngoài yêu cầu."
  },
  "engineering-delivery-checklist/implementation-plan/slice": {
    label: "Chia việc theo backend, database, API contract, test, observability, rollout và tài liệu."
  },
  "ai-assisted-feature-workflow/shape/slice": {
    label: "Chia thành các phần việc nhỏ cho Codex hoặc Antigravity, mỗi phần có thể review độc lập."
  },
  "engineering-delivery-checklist/coding-review/review": {
    label: "Nhờ AI review như một Principal Engineer về tính đúng đắn, race condition, tính nhất quán, bảo mật, observability, hiệu năng, khả năng bảo trì và rủi ro rollback."
  },
  "engineering-delivery-checklist/post-rollout/review": {
    label: "Nhờ AI review sau rollout, gồm kết quả, metric, vấn đề, tác động tới người dùng, technical debt, việc cần làm và bài học."
  },
  "engineering-delivery-checklist/pre-rollout/signals": {
    label: "Chuẩn bị dashboard, alert, runbook, rollback path và cách kiểm tra tác động tới khách hàng."
  },
  "senior-engineer-reflex/observability-rollout/signals": {
    label: "Metric kinh doanh, metric kỹ thuật, trace, log, correlation ID, dashboard và alert nào chứng minh tính năng đang chạy đúng?"
  },
  "engineering-delivery-checklist/rollout/monitor": {
    label: "Theo dõi metric thành công, tỷ lệ lỗi, độ trễ, tải DB, query plan, độ trễ queue, tỷ lệ cache hit/miss và phản hồi hỗ trợ."
  },
  "release-readiness/handoff/monitor": {
    label: "Chốt rõ thời gian theo dõi và tín hiệu thành công."
  },
  "engineering-delivery-checklist/post-rollout/docs": {
    label: "Cập nhật tài liệu, ADR, runbook, checklist Studio và ticket theo dõi."
  },
  "module-creation/verification/docs": {
    label: "Cập nhật tài liệu, ghi chú PR và ảnh chụp khi thay đổi xuất hiện trước người dùng."
  },
  "senior-engineer-reflex/api-data-consistency/data": {
    label: "Schema, migration, index, quy mô truy vấn, thời gian lưu và rủi ro PII là gì?"
  },
  "module-creation/backend/data": {
    label: "Lập kế hoạch schema, index, migration, backfill và thời gian lưu dữ liệu."
  },
  "senior-engineer-reflex/observability-rollout/learning": {
    label: "Sau rollout cần lưu lại điều gì để công việc sau có điểm bắt đầu tốt hơn?"
  },
  "weekly-ai-os-review/capture-week/learning": {
    label: "Liệt kê công cụ AI đã dùng, prompt đã lưu và workflow được lặp lại."
  },
  "module-creation/verification/manual": {
    label: "Kiểm tra thủ công luồng chính và ít nhất một tình huống lỗi."
  },
  "release-readiness/quality/manual": {
    label: "Kiểm tra thủ công route hoặc workflow quan trọng."
  },
  "daily-ai-learning-loop/evening-review/archive": {
    label: "Lưu bài học vào NotebookLM, ChatGPT Project hoặc Studio."
  },
  "ai-tool-routing-decision-tree/handoff/archive": {
    label: "Lưu prompt cuối, sản phẩm tạo ra và bài học để dùng lại."
  },
  "ai-assisted-feature-workflow/review-release/archive": {
    label: "Lưu PRD, RFC, quyết định, bằng chứng test và ghi chú postmortem vào NotebookLM."
  }
};

const vietnameseFlowGroupCopies: Record<string, LocalizedFlowGroupCopy> = {
  architecture: {
    title: "Kiến trúc và thiết kế hệ thống",
    subtitle: "Chốt điều cần quyết định trước khi vẽ sơ đồ.",
    description:
      "Các quy trình giúp thiết kế hệ thống, rà soát kiến trúc và xử lý những quyết định khó ở ranh giới giữa module, dữ liệu, đội ngũ và vận hành."
  },
  production: {
    title: "Vận hành và phát hành",
    subtitle: "Thận trọng hơn khi hệ thống đã phục vụ người dùng thật.",
    description:
      "Các quy trình giúp xử lý sự cố, kiểm tra trước khi release, đặt chốt an toàn cho rollout và bàn giao vận hành mà không khiến mọi thay đổi trở nên nặng nề."
  },
  "ai-and-career": {
    title: "Làm phần mềm với AI và ghi lại năng lực",
    subtitle: "Biến việc đã làm thành bằng chứng có giá trị.",
    description:
      "Các quy trình giúp làm phần mềm với AI và kể lại dự án trong hồ sơ năng lực, để khả năng phán đoán kỹ thuật hiện rõ mà không biến câu chuyện thành lời quảng cáo."
  },
  "react-flow-library": {
    title: "Thư viện React Flow",
    subtitle: "So sánh từng cách biểu diễn trước khi chọn sơ đồ.",
    description:
      "Bộ ví dụ React Flow gồm các nút mặc định, hình khối kiến trúc tùy chỉnh, cách gom nhóm, bố cục, kiểm tra hợp lệ, chú thích, kiểu đường nối, nhãn, marker, MiniMap, bộ điều khiển, nền và một bản thiết kế hệ thống lớn."
  }
};

const vietnameseFlowCopies: Record<string, LocalizedFlowCopy> = {
  "system-design": {
    title: "Quy trình thiết kế hệ thống",
    summary:
      "Một cách đi mạch lạc từ đề bài còn rộng đến kiến trúc rõ ràng: làm rõ yêu cầu, ước lượng tải, xác định dữ liệu, API, tình huống lỗi và các đánh đổi theo đúng thứ tự.",
    seoTitle: "Quy trình thiết kế hệ thống cho kỹ sư phần mềm giàu kinh nghiệm",
    seoDescription:
      "Quy trình thiết kế hệ thống thực tế để làm rõ yêu cầu, xác định ranh giới, mô hình hóa dữ liệu, chuẩn bị cho việc mở rộng và giải thích các đánh đổi một cách mạch lạc.",
    useWhen:
      "Dùng khi đề bài còn rộng, chẳng hạn thiết kế hệ thống thông báo, nền tảng đặt chỗ, bảng tin hoặc một quy trình nội bộ.",
    outcome:
      "Một bản trình bày có thể chia sẻ, cho thấy khả năng phán đoán của kỹ sư giàu kinh nghiệm: điều gì cần ưu tiên, điều gì có thể chờ, rủi ro nằm ở đâu và hệ thống nên phát triển theo hướng nào.",
    officeExample:
      "Quản lý sản phẩm muốn thêm quy trình tiếp nhận đối tác. Thay vì vội chọn dịch vụ hay queue, nhóm bắt đầu từ việc ai được thay đổi dữ liệu nào, bước nào cần phê duyệt và lúc nào phải rollback.",
    tags: ["Thiết kế hệ thống", "Kiến trúc", "Đánh đổi", "Phỏng vấn"],
    steps: {
      "frame-problem": {
        title: "Đóng khung bài toán",
        detail: "Nêu rõ người dùng, nhu cầu, ràng buộc và điều không làm trước khi gọi tên công nghệ.",
        evidence: "Mục tiêu kinh doanh, các bên tham gia, luồng đọc ghi, độ trễ và mức độ tin cậy mong đợi.",
        output: "Bản mô tả bài toán ngắn cùng danh sách giả định cần xác nhận."
      },
      "shape-interfaces": {
        title: "Định hình giao diện hệ thống",
        detail: "Phác API, sự kiện và thao tác của người dùng hoặc quản trị viên quanh quy trình thực tế.",
        evidence: "Mẫu yêu cầu API, tên sự kiện, khả năng xử lý lặp an toàn, quyền truy cập và cách trả lỗi.",
        output: "Ghi chú về hợp đồng API, sự kiện và các ranh giới ban đầu."
      },
      "model-data": {
        title: "Mô hình hóa dữ liệu",
        detail: "Xác định nơi sở hữu dữ liệu, quy tắc nhất quán, chỉ mục, thời gian lưu giữ và hướng migration.",
        evidence: "Thực thể chính, điều bất biến, kiểu truy vấn, trạng thái trong vòng đời và nhu cầu kiểm tra lịch sử.",
        output: "Bản phác dữ liệu kèm quy tắc nhất quán và ghi chú migration."
      },
      "design-runtime": {
        title: "Thiết kế cách hệ thống vận hành",
        detail: "Chỉ thêm dịch vụ, queue, cache, tiến trình xử lý và cổng API khi từng thành phần giải quyết một áp lực cụ thể.",
        evidence: "Ước lượng tải, số nhánh xử lý, giới hạn của hệ thống phụ thuộc, luồng quan trọng và ràng buộc khi triển khai.",
        output: "Kiến trúc vận hành giải thích rõ lý do tồn tại của từng thành phần."
      },
      "stress-failures": {
        title: "Rà soát tình huống lỗi",
        detail: "Xem xét hệ thống phụ thuộc phản hồi chậm, yêu cầu trùng, ghi dữ liệu dở dang, triển khai lỗi và đọc phải dữ liệu cũ.",
        evidence: "Timeout, giới hạn retry, DLQ, backpressure, observability và điều kiện kích hoạt rollback.",
        output: "Bảng tình huống lỗi, cách giảm thiệt hại và tín hiệu cần theo dõi."
      },
      "explain-evolution": {
        title: "Mô tả hướng mở rộng",
        detail: "Nêu rõ phiên bản đầu tiên phù hợp với hiện tại, điểm bắt đầu quá tải và bước thiết kế tiếp theo khi lưu lượng hoặc đội ngũ tăng lên.",
        evidence: "Năng lực hiện tại của đội ngũ, dự báo tăng lưu lượng, độ trưởng thành trong vận hành và giới hạn chi phí.",
        output: "Lộ trình theo phiên bản, điều kiện cần mở rộng và các phương án đã cân nhắc nhưng không chọn."
      }
    },
    artifacts: ["Mô tả bài toán", "Ghi chú API và sự kiện", "Sơ đồ sở hữu dữ liệu", "Sơ đồ vận hành", "Bảng tình huống lỗi", "Lộ trình mở rộng"],
    cvSignals: ["Khả năng phán đoán khi thiết kế hệ thống", "Tư duy backend và nền tảng", "Giải thích các đánh đổi", "Năng lực vận hành"]
  },
  "architecture-decision": {
    title: "Quy trình ra quyết định kiến trúc",
    summary:
      "Một quy trình RFC/ADR gọn để biến nhiều lựa chọn khó so sánh thành một đề xuất rõ ràng, có đánh đổi và phương án rollback.",
    seoTitle: "Quy trình ra quyết định kiến trúc bằng RFC và ADR",
    seoDescription:
      "Quy trình so sánh phương án kiến trúc, cân nhắc đánh đổi, ghi lại rủi ro và thống nhất trong đội ngũ trước khi triển khai.",
    useWhen:
      "Dùng trước khi một tính năng vượt qua ranh giới module, thay đổi nơi sở hữu dữ liệu, thêm tích hợp mới hoặc tạo ra quan hệ phụ thuộc khó gỡ bỏ.",
    outcome:
      "Một bản ghi quyết định giúp đồng đội hiểu không chỉ phương án được chọn mà cả lý do các hướng khác không phù hợp.",
    officeExample:
      "Đội ngũ đang cân nhắc có nên thêm queue để đồng bộ dữ liệu đối tác. Quy trình này làm rõ nhu cầu thật, hành vi khi có lỗi, chi phí hỗ trợ vận hành và thời điểm xử lý bất đồng bộ thực sự đem lại lợi ích.",
    tags: ["RFC", "ADR", "Rà soát kiến trúc", "Ma trận quyết định"],
    steps: {
      "name-decision": {
        title: "Gọi đúng tên quyết định",
        detail: "Viết điều cần quyết định thành một câu và thu hẹp phạm vi đến mức có thể phê duyệt.",
        evidence: "Vấn đề hiện tại, hệ thống bị ảnh hưởng, người phụ trách, thời hạn và phần không thuộc lần quyết định này.",
        output: "Phát biểu quyết định với phạm vi và điều không làm được ghi rõ."
      },
      "extract-invariants": {
        title: "Rút ra các điều bất biến",
        detail: "Liệt kê những điều luôn phải đúng đối với người dùng, tiền, quyền truy cập, dữ liệu, lịch sử thay đổi và hỗ trợ vận hành.",
        evidence: "Quy tắc nghiệp vụ, yêu cầu tuân thủ, quy trình hỗ trợ và các sự cố từng xảy ra trên production.",
        output: "Danh sách điều bất biến mà mọi phương án đều phải giữ được."
      },
      "compare-options": {
        title: "So sánh phương án thực tế",
        detail: "Đánh giá hai hoặc ba hướng có thể triển khai, không tô đẹp một phương án rồi cố ý làm các hướng còn lại trông kém thuyết phục.",
        evidence: "Chi phí thực hiện, khả năng quay lại, hiệu năng, độ tin cậy, mức phù hợp với đội ngũ và migration về sau.",
        output: "Bảng phương án với các đánh đổi được trình bày trung thực."
      },
      "risk-gates": {
        title: "Đặt các chốt an toàn",
        detail: "Chốt cách kiểm chứng, tín hiệu theo dõi, rollout và rollback trước khi bắt đầu triển khai.",
        evidence: "Test, dashboard, feature flag, script migration, runbook và xác nhận của người chịu trách nhiệm.",
        output: "Các điều kiện cần đạt trước khi thông qua và đưa thay đổi vào sử dụng."
      },
      "write-decision": {
        title: "Viết bản ghi quyết định",
        detail: "Giữ tài liệu đủ ngắn để đọc trong buổi rà soát nhưng đủ rõ để người nhận bàn giao hiểu được sau này.",
        evidence: "Phương án được chọn, hướng đã loại, phần nợ kỹ thuật chấp nhận được và điều kiện cần xem xét lại.",
        output: "Bản ADR hoặc RFC sẵn sàng để rà soát."
      }
    },
    artifacts: ["Phát biểu quyết định", "Danh sách điều bất biến", "Ma trận phương án", "Các chốt an toàn", "Bản ghi ADR hoặc RFC"],
    cvSignals: ["Dẫn dắt quyết định kiến trúc", "Làm rõ yêu cầu", "Thống nhất giữa các đội ngũ", "Quản trị rủi ro"]
  },
  "incident-response": {
    title: "Quy trình xử lý sự cố",
    summary:
      "Một trình tự rõ ràng từ dấu hiệu đầu tiên của sự cố đến việc giảm thiệt hại, rollback, cập nhật tình hình, tìm nguyên nhân gốc và theo dõi việc khắc phục.",
    seoTitle: "Quy trình xử lý sự cố production cho đội ngũ kỹ thuật",
    seoDescription:
      "Quy trình phân loại sự cố, giới hạn phạm vi ảnh hưởng, rollback, cập nhật tình hình, phân tích nguyên nhân gốc và theo dõi việc phòng ngừa tái diễn.",
    useWhen:
      "Dùng khi cảnh báo, phản hồi của khách hàng, lỗi phát sinh sau khi triển khai hoặc sự cố từ đối tác khiến đội ngũ cần một thứ tự xử lý bình tĩnh.",
    outcome:
      "Sự cố được kiểm soát, quyết định được ghi lại rõ ràng, người dùng được bảo vệ và postmortem dẫn đến những việc phòng ngừa cụ thể.",
    officeExample:
      "Sau một release, thời gian phản hồi ở bước thanh toán tăng cao và bộ phận hỗ trợ nhận nhiều phản ánh giống nhau. Quy trình này giúp đội ngũ không đoán mò bằng cách tách rõ dấu hiệu, hành động giảm thiệt hại, rollback và việc tìm nguyên nhân gốc.",
    tags: ["Sự cố", "SRE", "Rollback", "Postmortem"],
    steps: {
      "confirm-signal": {
        title: "Xác nhận dấu hiệu",
        detail: "Phân biệt sự cố thực sự ảnh hưởng đến người dùng với chỉ số nhiễu hoặc một hệ thống phụ thuộc đang chập chờn.",
        evidence: "Cảnh báo, dashboard, log, trace, phản hồi của khách hàng, mốc triển khai và nhóm người dùng bị ảnh hưởng.",
        output: "Trạng thái sự cố, mức độ nghiêm trọng và người phụ trách ban đầu."
      },
      "contain-blast-radius": {
        title: "Giới hạn phạm vi ảnh hưởng",
        detail: "Ưu tiên bảo vệ người dùng bằng feature flag, giới hạn tần suất, rollback, chuyển lưu lượng hoặc tạm tắt phần gây lỗi.",
        evidence: "Feature flag, phiên bản release, tình trạng hệ thống phụ thuộc, error budget và cách rollback an toàn.",
        output: "Hành động giảm thiệt hại cùng tác động dự kiến."
      },
      "coordinate-room": {
        title: "Điều phối nhóm xử lý",
        detail: "Phân công người điều phối, người cập nhật tình hình, người điều tra và người kiểm chứng để mọi người không làm trùng nhau.",
        evidence: "Người phụ trách, mốc thời gian, giả thuyết hiện tại, thông báo cho khách hàng và giờ cập nhật tiếp theo.",
        output: "Dòng thời gian sự cố và nhịp cập nhật chung."
      },
      "verify-recovery": {
        title: "Xác nhận hệ thống đã phục hồi",
        detail: "Không đóng sự cố chỉ vì một biểu đồ đã đẹp hơn; cần kiểm tra hành trình thật của người dùng và các queue phía sau.",
        evidence: "SLO, kiểm tra mô phỏng, lưu lượng thật, độ sâu queue, phản hồi từ bộ phận hỗ trợ và tỷ lệ lỗi sau khi phục hồi.",
        output: "Xác nhận phục hồi cùng khoảng thời gian tiếp tục theo dõi."
      },
      "write-postmortem": {
        title: "Ghi lại và theo dõi việc khắc phục",
        detail: "Biến sự cố thành việc phòng ngừa cụ thể mà không đổ lỗi cho người thực hiện lần triển khai gần nhất.",
        evidence: "Nguyên nhân gốc, yếu tố góp phần, dấu hiệu đã bị bỏ lỡ và các cách ngăn tái diễn.",
        output: "Postmortem, việc cần làm, người phụ trách và thời hạn hoàn thành."
      }
    },
    artifacts: ["Ghi chú mức độ nghiêm trọng", "Nhật ký giảm thiệt hại", "Dòng thời gian sự cố", "Danh sách kiểm tra phục hồi", "Việc cần làm sau postmortem"],
    cvSignals: ["Trách nhiệm với production", "Tư duy về độ tin cậy", "Cập nhật rõ ràng cho các bên liên quan", "Giữ bình tĩnh khi có áp lực"]
  },
  "release-readiness": {
    title: "Quy trình Release Readiness",
    summary:
      "Bộ tiêu chí giúp kiểm tra phạm vi, test, observability, độ an toàn của migration, cách cập nhật tình hình và phương án rollback trước khi release.",
    seoTitle: "Quy trình kiểm tra để rollout phần mềm an toàn",
    seoDescription:
      "Quy trình kiểm tra test, analytics, độ an toàn của migration, observability, cách cập nhật tình hình, điều kiện rollout và phương án rollback.",
    useWhen:
      "Dùng trước khi đưa một tính năng lên production, nhất là khi thay đổi bước thanh toán, xác thực, migration dữ liệu, tích hợp hoặc đường dẫn công khai.",
    outcome:
      "Một release có thể giải thích, theo dõi, tạm dừng và rollback mà không phải xử lý hậu quả theo kiểu chữa cháy.",
    officeExample:
      "Đội ngũ chuẩn bị phát hành bộ lọc mới trên dashboard có liên quan đến analytics và SEO. Quy trình này kiểm tra hành vi, tracking, trạng thái trống và rollback trước khi bấm nút triển khai.",
    tags: ["Release", "Rollout", "Kiểm thử", "Observability"],
    steps: {
      "confirm-scope": {
        title: "Xác nhận phạm vi",
        detail: "Đối chiếu release với ticket, tiêu chí nghiệm thu, điều không làm và hành vi mà người dùng thực sự nhìn thấy.",
        evidence: "Ticket, tóm tắt phần thay đổi, ảnh chụp màn hình, nội dung được sửa và đường dẫn bị ảnh hưởng.",
        output: "Phạm vi release và điều không làm được ghi rõ."
      },
      "verify-behavior": {
        title: "Kiểm chứng hành vi",
        detail: "Chọn cách kiểm tra tương xứng với rủi ro: unit test, integration test, E2E, khả năng tiếp cận, typecheck và kiểm tra nhanh bằng tay.",
        evidence: "Kết quả lệnh, mức bao phủ của test, kiểm tra trên trình duyệt và thiết bị di động cùng những điểm chưa kiểm được.",
        output: "Ghi chú kiểm chứng kèm rủi ro còn lại."
      },
      "check-data": {
        title: "Kiểm tra dữ liệu và migration",
        detail: "Rà soát thay đổi schema, backfill, chỉ mục, cache, sự kiện analytics và đường dẫn SEO.",
        evidence: "Kế hoạch migration, script rollback, khối lượng dữ liệu, tên sự kiện, URL canonical và ảnh hưởng đến sitemap.",
        output: "Danh sách kiểm tra mức sẵn sàng của dữ liệu và tracking."
      },
      "prepare-observability": {
        title: "Chuẩn bị observability",
        detail: "Đảm bảo release có những tín hiệu đủ rõ để hành động, không chỉ có biểu đồ đẹp.",
        evidence: "Dashboard, cảnh báo, log, trace, feature flag và người trực theo dõi.",
        output: "Kế hoạch theo dõi và cách chuyển cấp khi có vấn đề."
      },
      "rollout-decision": {
        title: "Chốt quyết định rollout",
        detail: "Chọn rollout theo từng giai đoạn, release ngay, tạm dừng hoặc rollback dựa trên thông tin đã kiểm chứng.",
        evidence: "Mức rủi ro, nhóm người dùng, khả năng hỗ trợ, khung giờ triển khai và độ tin cậy của phương án rollback.",
        output: "Quyết định tiếp tục hoặc tạm dừng, kèm điều kiện kích hoạt rollback."
      }
    },
    artifacts: ["Ghi chú phạm vi", "Kết quả kiểm chứng", "Danh sách kiểm tra dữ liệu và analytics", "Kế hoạch theo dõi", "Quyết định rollout"],
    cvSignals: ["Khả năng giao phần mềm từ đầu đến cuối", "Phán đoán về QA", "Hiểu biết về SEO và analytics", "Trách nhiệm với release"]
  },
  "ai-delivery": {
    title: "Quy trình AI-assisted Delivery",
    summary:
      "Cách dùng agent AI có kiểm soát khi làm phần mềm, vẫn giữ vững phạm vi, quyền riêng tư, việc kiểm thử và khả năng phán đoán của kỹ sư.",
    seoTitle: "Quy trình làm phần mềm với AI và con người rà soát",
    seoDescription:
      "Quy trình chốt phạm vi, chuẩn bị ngữ cảnh, thực hiện thay đổi, kiểm chứng hành vi và bàn giao công việc có AI hỗ trợ để sẵn sàng rà soát.",
    useWhen:
      "Dùng khi agent AI hỗ trợ viết code, rà soát, nghiên cứu, soạn tài liệu, refactor hoặc tạo test trong một codebase thật.",
    outcome:
      "Một thay đổi sẵn sàng để rà soát: AI giúp làm nhanh hơn và kiểm tra rộng hơn, còn kỹ sư vẫn chịu trách nhiệm về phạm vi, tính đúng đắn và rủi ro của release.",
    officeExample:
      "Một đồng đội đề nghị thêm tính năng mới vào Studio. Quy trình này biến yêu cầu thành ngữ cảnh có ranh giới rõ, chỉ ra phần không được chạm tới, kiểm chứng analytics và SEO rồi đọc lại diff trước khi commit.",
    tags: ["Làm phần mềm với AI", "Agent AI", "Rà soát mã nguồn", "Kiểm chứng"],
    steps: {
      "scope-task": {
        title: "Chốt phạm vi công việc",
        detail: "Chuyển yêu cầu thành tiêu chí nghiệm thu, phần hệ thống bị ảnh hưởng, điều không làm và ranh giới về quyền riêng tư.",
        evidence: "Yêu cầu của người dùng, hướng dẫn trong repository, ràng buộc tại máy, quy tắc analytics và quyền triển khai.",
        output: "Bản giao việc ngắn với ranh giới rõ ràng."
      },
      "package-context": {
        title: "Chuẩn bị ngữ cảnh",
        detail: "Cung cấp cho agent những file, ví dụ, quy ước, test và cảnh báo thực sự liên quan.",
        evidence: "Cách làm đang có, component tương tự, mô hình dữ liệu, hành vi theo ngôn ngữ và test liên quan.",
        output: "Gói ngữ cảnh cùng gợi ý triển khai vừa đủ."
      },
      "execute-small": {
        title: "Thực hiện theo từng phần nhỏ",
        detail: "Giữ phần sửa gọn, dùng cấu trúc sẵn có và kiểm chứng từng ranh giới rủi ro trước khi đi tiếp.",
        evidence: "Từng phần diff, phản hồi khi biên dịch, hành vi giao diện và việc các file ngoài phạm vi vẫn nguyên vẹn.",
        output: "Bản thay đổi tập trung, không kéo theo phần việc ngoài yêu cầu."
      },
      "verify-review": {
        title: "Kiểm chứng và rà soát",
        detail: "Chạy test, đọc diff, kiểm tra nội dung hiển thị, kết nối analytics cùng ảnh hưởng đến bảo mật và quyền riêng tư.",
        evidence: "Kết quả test, kiểm tra thủ công, danh sách file đã đổi và rủi ro còn lại.",
        output: "Bản tóm tắt kiểm chứng và ghi chú rà soát."
      },
      "handoff-clean": {
        title: "Bàn giao gọn gàng",
        detail: "Chỉ chuẩn bị commit, PR, ghi chú release hoặc triển khai khi yêu cầu của người dùng cho phép.",
        evidence: "Git status, phần diff đã stage, nội dung commit, danh sách kiểm tra PR và trạng thái phê duyệt.",
        output: "Phần bàn giao sẵn sàng cho commit, PR hoặc triển khai."
      }
    },
    artifacts: ["Bản giao việc ngắn", "Gói ngữ cảnh", "Diff tập trung", "Ghi chú kiểm chứng", "Phần bàn giao để rà soát"],
    cvSignals: ["Khả năng làm việc với AI", "Phán đoán kỹ thuật", "Ý thức về quyền riêng tư", "Cách làm và bàn giao phần mềm hiện đại"]
  },
  "portfolio-story": {
    title: "Quy trình kể lại công việc trong hồ sơ năng lực",
    summary:
      "Cách biến công việc kỹ thuật đã làm thành câu chuyện rõ ràng cho CV, bài viết hoặc buổi phỏng vấn mà không tô vẽ quá mức.",
    seoTitle: "Quy trình kể lại dự án kỹ thuật cho CV và phỏng vấn",
    seoDescription:
      "Quy trình ghi lại hoàn cảnh, hành động, đánh đổi, tác động, bằng chứng và bài học từ một dự án kỹ thuật để dùng trong hồ sơ năng lực.",
    useWhen:
      "Dùng sau một dự án, sự cố, migration, release, lần dẫn dắt đội ngũ hoặc quyết định đánh đổi đáng được lưu lại như một bằng chứng năng lực nghề nghiệp.",
    outcome:
      "Một câu chuyện có dữ kiện cụ thể, có thể chuyển thành dòng mô tả trong CV, bài viết, câu trả lời phỏng vấn hoặc case study trong hồ sơ năng lực.",
    officeExample:
      "Một lần refactor giúp giảm các yêu cầu hỗ trợ lặp lại nhưng không tạo ra con số gây chú ý. Quy trình này vẫn ghi lại tình trạng trước và sau, áp lực khi ra quyết định cùng giá trị vận hành ít người nhìn thấy.",
    tags: ["CV", "Hồ sơ năng lực", "Viết", "Nghề nghiệp"],
    steps: {
      "capture-context": {
        title: "Ghi lại hoàn cảnh",
        detail: "Nêu rõ tình hình của đội ngũ, vấn đề người dùng gặp phải, các ràng buộc và lý do công việc này quan trọng ở thời điểm đó.",
        evidence: "Ticket, ghi chú sự cố, yêu cầu của bên liên quan, chỉ số, nhóm phản hồi hỗ trợ hoặc dấu hiệu về tình trạng codebase.",
        output: "Một đoạn mô tả hoàn cảnh cụ thể, không phóng đại."
      },
      "show-actions": {
        title: "Cho thấy hành động",
        detail: "Mô tả điều tôi đã thay đổi, quyết định, phối hợp hoặc làm đơn giản hơn bằng ngôn ngữ kỹ thuật rõ ràng.",
        evidence: "Diff, ghi chú thiết kế, trao đổi trong PR, kế hoạch rollout, kết quả test hoặc lịch sử migration.",
        output: "Danh sách hành động gồm cả chi tiết kỹ thuật và cách phối hợp."
      },
      "name-tradeoffs": {
        title: "Nêu rõ các đánh đổi",
        detail: "Giải thích những ràng buộc khiến công việc này đáng chú ý: thời gian, độ tin cậy, trải nghiệm người dùng, chi phí, quyền riêng tư hoặc năng lực đội ngũ.",
        evidence: "Phương án đã loại, phần nợ kỹ thuật chấp nhận được, kế hoạch rollback hoặc điều kiện cần xem xét lại trong tương lai.",
        output: "Ghi chú về đánh đổi, cho thấy cách cân nhắc và ra quyết định."
      },
      "prove-impact": {
        title: "Chứng minh tác động",
        detail: "Dùng số liệu khi có, đồng thời ghi lại rủi ro đã giảm, việc bàn giao rõ hơn, hệ thống đáng tin cậy hơn hoặc thời gian hỗ trợ được rút ngắn.",
        evidence: "Chỉ số trước và sau, phản hồi của khách hàng, tình trạng sau triển khai, số sự cố giảm hoặc mức độ sử dụng trong đội ngũ.",
        output: "Mô tả tác động có căn cứ và nêu rõ giới hạn của kết luận."
      },
      "shape-story": {
        title: "Định hình câu chuyện",
        detail: "Biến tư liệu thô thành hình thức phù hợp cho CV, phỏng vấn, bài viết hoặc trang hồ sơ năng lực.",
        evidence: "Người đọc, từ khóa, vai trò hướng tới, liên kết kiểm chứng và giới hạn bảo mật.",
        output: "Dòng mô tả trong CV, câu trả lời theo STAR, dàn ý bài viết hoặc bản nháp case study."
      }
    },
    artifacts: ["Đoạn mô tả hoàn cảnh", "Danh sách hành động", "Ghi chú về đánh đổi", "Mô tả tác động", "Bản nháp câu chuyện"],
    cvSignals: ["Trình bày rõ tác động", "Kể lại công việc ở cấp kỹ sư giàu kinh nghiệm", "Hiểu nhu cầu kinh doanh", "Khả năng nhìn lại và rút kinh nghiệm"]
  },
  "react-flow-architecture-demo": {
    title: "Bộ ví dụ React Flow",
    summary:
      "Một canvas dạng thư viện, cho thấy @xyflow/react có thể trình bày toàn cảnh, tương tác, cách gom nhóm, bố cục, kiểu hiển thị, bảng vẽ và nhiều dạng sơ đồ kiến trúc phần mềm.",
    seoTitle: "Bộ ví dụ React Flow cho nhiều dạng sơ đồ kỹ thuật",
    seoDescription:
      "Bộ ví dụ React Flow trong Studio với các nút mặc định, hình khối kiến trúc tùy chỉnh, cách gom nhóm, bố cục, kiểm tra hợp lệ, chú thích trên bảng vẽ, kiểu đường nối, nhãn, marker, MiniMap, bộ điều khiển và nền.",
    useWhen:
      "Dùng khi cần chọn cách biểu diễn kiến trúc hệ thống, sơ đồ dịch vụ, cấu trúc liên kết nền tảng, luồng sự kiện, ranh giới triển khai hoặc tương tác trong trình sửa sơ đồ bằng React Flow.",
    outcome:
      "Một bộ mẫu trực quan về nút, đường nối, cách gom nhóm, bố cục, tương tác, bảng vẽ và các mẫu kiến trúc trong React Flow, tách biệt với sơ đồ nghiệp vụ của sản phẩm.",
    officeExample:
      "Một đội ngũ muốn chọn cách trình bày sơ đồ kỹ thuật trước khi vẽ hệ thống thật. Thư viện này cho phép so sánh toàn cảnh, luồng con, bố cục, kiểm tra hợp lệ, bảng vẽ, kiến trúc hướng sự kiện, cấu trúc liên kết và dòng dữ liệu ngay trên một canvas React Flow.",
    tags: ["React Flow", "XYFlow", "Sơ đồ kiến trúc", "Hình dạng nút", "Kiểu đường nối"],
    steps: {
      "show-node-primitives": {
        title: "Hiển thị các nút cơ bản",
        detail: "Dựng các loại nút đầu vào, mặc định, đầu ra và nút nhóm trước khi thêm bộ hình khối kiến trúc riêng.",
        evidence: "Vai trò của loại nút có sẵn, nhãn, huy hiệu, điểm nối và ranh giới nhóm.",
        output: "Một canvas nền cho thấy những thành phần cơ bản của React Flow."
      },
      "add-architecture-shapes": {
        title: "Thêm hình khối kiến trúc",
        detail: "Dùng custom node cho API gateway, service, worker, database, cache, queue, topic, external system, decision, risk và note.",
        evidence: "Thành phần kiến trúc phần mềm, ranh giới triển khai, luồng dữ liệu và rủi ro vận hành.",
        output: "Một bộ hình khối có thể dùng lại cho sơ đồ hệ thống."
      },
      "compare-edge-types": {
        title: "So sánh các kiểu đường nối",
        detail: "Hiển thị đường nối default, straight, step, smoothstep và simplebezier với nhãn, mũi tên và hiệu ứng chuyển động cho luồng bất đồng bộ.",
        evidence: "Lời gọi đồng bộ, sự kiện bất đồng bộ, đường retry, projection, observability và quan hệ rollback.",
        output: "Một quy ước đường nối giúp sơ đồ kiến trúc dễ đọc hơn."
      },
      "use-canvas-controls": {
        title: "Dùng bộ điều khiển canvas",
        detail: "Giữ Background, Controls, MiniMap, fitView, zoom và pan để sơ đồ kiến trúc lớn vẫn dễ xem xét.",
        evidence: "Kích thước sơ đồ, các vùng đã gom nhóm, mức zoom dễ đọc và vị trí ổn định.",
        output: "Một không gian sơ đồ dùng được cho cả toàn cảnh lẫn phần chi tiết."
      },
      "model-system-architecture": {
        title: "Mô hình hóa kiến trúc hệ thống",
        detail: "Đặt các vùng phía người dùng, lớp biên, domain, dữ liệu, hệ thống bên ngoài và vận hành vào cùng một câu chuyện kiến trúc.",
        evidence: "Ranh giới nghiệp vụ, nơi sở hữu dịch vụ, lưu trữ bền vững, tích hợp, tín hiệu đo lường và độ an toàn của rollout.",
        output: "Một kiến trúc tham khảo cho hệ thống thanh toán, dùng để minh họa toàn bộ bộ hình khối."
      },
      "turn-demo-into-template": {
        title: "Biến ví dụ thành mẫu dùng lại",
        detail: "Dùng bộ ví dụ làm điểm bắt đầu cho buổi rà soát kiến trúc, RFC, ADR, hướng dẫn người mới hoặc giải thích sự cố.",
        evidence: "Loại nút có thể dùng lại, quy ước đường nối, bố cục từng vùng và nội dung nêu đúng các đánh đổi kỹ thuật.",
        output: "Một mẫu kiến trúc React Flow sẵn sàng điều chỉnh cho hệ thống khác."
      }
    },
    artifacts: [
      "Bộ hình dạng nút React Flow",
      "Canvas kiến trúc phần mềm",
      "Bảng so sánh kiểu đường nối",
      "Ví dụ về nhóm và ranh giới",
      "Ví dụ MiniMap và bộ điều khiển",
      "Mẫu kiến trúc có thể dùng lại"
    ],
    cvSignals: ["Triển khai React Flow", "Trực quan hóa kiến trúc phần mềm", "Thiết kế hệ thống sơ đồ", "Trình bày kiến trúc nền tảng"]
  },
  "react-flow-system-blueprint": {
    title: "Bản thiết kế hệ thống bằng React Flow",
    summary:
      "System design map cỡ lớn bằng React Flow, thể hiện DNS, edge policy, load balancing, backend services, cache, data stores, media queue, workers và downstream services.",
    seoTitle: "Bản thiết kế hệ thống cỡ lớn bằng React Flow",
    seoDescription:
      "Bản thiết kế hệ thống lớn bằng React Flow với các vùng kiến trúc được gom nhóm, nút tùy chỉnh, đường nối có nhãn, hiệu ứng cho luồng bất đồng bộ, MiniMap, bộ điều khiển và từng góc nhìn tập trung.",
    useWhen:
      "Dùng khi cần trình bày một sơ đồ thiết kế hệ thống dày thông tin như poster kỹ thuật bằng React Flow, thay vì chỉ dùng nó cho các quy trình nhỏ.",
    outcome:
      "Một canvas kiến trúc nhiều thông tin nhưng vẫn dễ xem: có góc nhìn toàn cảnh và từng góc nhìn riêng cho DNS, vận hành, lưu trữ, xử lý tệp đa phương tiện và fan-out.",
    officeExample:
      "Một đội ngũ cần poster kiến trúc cho buổi rà soát. Bản thiết kế này vẫn cho phép tương tác, zoom và xem riêng từng vùng, thay vì đóng băng mọi thứ trong một ảnh tĩnh.",
    tags: ["React Flow", "Thiết kế hệ thống", "Bản thiết kế", "Hệ thống phân tán", "Xử lý tệp đa phương tiện"],
    steps: {
      "map-edge-entry": {
        title: "Mô tả điểm vào tại lớp biên",
        detail: "Cho thấy bước tra cứu domain, resolver, CDN, thông tin kèm theo yêu cầu, chính sách bảo mật và API gateway nối với nhau trước khi lưu lượng vào dịch vụ.",
        evidence: "Bản ghi DNS, hành vi cache tại lớp biên, header, token xác thực, chính sách WAF, ID của yêu cầu và metadata trong phản hồi.",
        output: "Luồng yêu cầu đi vào hệ thống được trình bày rõ ràng."
      },
      "show-runtime-topology": {
        title: "Mô tả cấu trúc vận hành",
        detail: "Tách load balancer, frontend servers, backend services, message dispatch và connection ownership thành các vùng dễ đọc.",
        evidence: "Chiến lược cân bằng tải, bảng kết nối, cách truyền phiên trực tiếp, máy chủ phụ trách và quy tắc định tuyến.",
        output: "Vùng vận hành giải thích lưu lượng được tiếp nhận, định tuyến và chuyển tiếp ở đâu."
      },
      "surface-coordination": {
        title: "Làm rõ cơ chế phối hợp",
        detail: "Đưa ID phân tán, khóa, cách xử lý đồng thời và bảng metadata thành những thành phần chính trên sơ đồ.",
        evidence: "Cách tạo ID, nơi cung cấp khóa, quy tắc retry, checksum, timestamp, ánh xạ máy chủ và con trỏ đến đối tượng.",
        output: "Lớp phối hợp cho thấy thao tác ghi và các phần dữ liệu truyền liên tục được giữ ổn định như thế nào."
      },
      "trace-storage-media": {
        title: "Theo dõi dữ liệu và tệp đa phương tiện",
        detail: "Nối primary database, shard, replica, cache, object storage, queue, processing worker và encoded file.",
        evidence: "Storage type, cache policy, queue depth, worker cost, checksum validation và compression output.",
        output: "Luồng dữ liệu và xử lý tệp có thể được xem xét ngay trên canvas."
      },
      "fan-out-downstream": {
        title: "Làm rõ các nhánh xử lý phía sau",
        detail: "Hiển thị downstream consumers như notification, recommendation, logging, search, analytics và payment service.",
        evidence: "Topic pub/sub, khóa idempotent, thẻ bị chặn, trạng thái dịch vụ ngừng hoạt động và hệ thống bên thứ ba phụ thuộc.",
        output: "Vùng fan-out làm rõ những tác động phát sinh thay vì giấu chúng sau một ô duy nhất."
      }
    },
    artifacts: ["Canvas bản thiết kế đầy đủ", "Góc nhìn DNS và luồng yêu cầu", "Góc nhìn vận hành và cân bằng tải", "Góc nhìn lưu trữ và phối hợp", "Góc nhìn tải tệp và fan-out"],
    cvSignals: ["Sử dụng React Flow nâng cao", "Chiều sâu trong thiết kế hệ thống", "Kiến thức về hệ thống phân tán", "Trình bày kiến trúc rõ ràng"]
  }
};

function isVietnameseLocale(locale: string): boolean {
  return locale.toLowerCase().split("-")[0] === "vi";
}

function buildVietnameseSkillMarkdown(skillId: string, skill: LocalizedSkillCopy): string {
  const sections = [
    `# ${skill.title}`,
    "",
    skill.summary,
    "",
    "## Dùng khi",
    ...skill.useWhen.map((item) => `- ${item}`),
    "",
    "## Quy trình",
    ...skill.process.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Kết quả cần có",
    ...skill.output.map((item) => `- ${item}`),
    "",
    "## Nguyên tắc an toàn",
    ...skill.guardrails.map((item) => `- ${item}`)
  ];
  const expertAddendum = vietnameseSkillExpertAddenda[skillId];

  if (expertAddendum) {
    sections.push(...buildVietnameseExpertAddendum(expertAddendum));
  }

  return sections.join("\n");
}

function localizeChecklistStep(
  step: StudioChecklistStep,
  checklistId: string,
  sectionId: string
): StudioChecklistStep {
  const contextualKey = `${checklistId}/${sectionId}/${step.id}`;
  const copy = vietnameseContextualStepCopies[contextualKey] ?? vietnameseStepCopies[step.id];
  return {
    ...step,
    label: copy?.label ?? step.label,
    detail: copy?.detail ?? step.detail,
    children: step.children?.map((child) => localizeChecklistStep(child, checklistId, sectionId))
  };
}

function localizeChecklistSection(section: StudioChecklistSection, checklistId: string): StudioChecklistSection {
  const contextualKey = `${checklistId}/${section.id}`;
  const copy = vietnameseContextualSectionCopies[contextualKey] ?? vietnameseSectionCopies[section.id];
  return {
    ...section,
    title: copy?.title ?? section.title,
    detail: copy?.detail ?? section.detail,
    steps: section.steps.map((step) => localizeChecklistStep(step, checklistId, section.id))
  };
}

function localizeFlowStep(step: StudioFlowStep, flowCopy: LocalizedFlowCopy): StudioFlowStep {
  const copy = flowCopy.steps[step.id];
  return {
    ...step,
    title: copy?.title ?? step.title,
    detail: copy?.detail ?? step.detail,
    evidence: copy?.evidence ?? step.evidence,
    output: copy?.output ?? step.output
  };
}

function localizeFlow(flow: StudioFlow): StudioFlow {
  const copy = vietnameseFlowCopies[flow.id];
  if (!copy) return flow;

  return {
    ...flow,
    title: copy.title,
    summary: copy.summary,
    seoTitle: copy.seoTitle,
    seoDescription: copy.seoDescription,
    useWhen: copy.useWhen,
    outcome: copy.outcome,
    officeExample: copy.officeExample,
    tags: copy.tags,
    steps: flow.steps.map((step) => localizeFlowStep(step, copy)),
    artifacts: copy.artifacts,
    cvSignals: copy.cvSignals
  };
}

function localizeFlowGroup(group: StudioFlowGroup): StudioFlowGroup {
  const copy = vietnameseFlowGroupCopies[group.id];
  if (!copy) return group;

  return {
    ...group,
    title: copy.title,
    subtitle: copy.subtitle,
    description: copy.description
  };
}

export function getLocalizedStudioAiSkills(locale: string): StudioAiSkill[] {
  if (!isVietnameseLocale(locale)) return studioAiSkills;

  return studioAiSkills.map((skill) => {
    const copy = vietnameseSkillCopies[skill.id];
    if (!copy) return skill;

    return {
      ...skill,
      title: copy.title,
      summary: copy.summary,
      tags: copy.tags,
      markdown: buildVietnameseSkillMarkdown(skill.id, copy)
    };
  });
}

export function getLocalizedStudioWorkflowChecklists(locale: string): StudioWorkflowChecklist[] {
  if (!isVietnameseLocale(locale)) return studioWorkflowChecklists;

  return studioWorkflowChecklists.map((checklist) => {
    const copy = vietnameseChecklistCopies[checklist.id];
    return {
      ...checklist,
      title: copy?.title ?? checklist.title,
      summary: copy?.summary ?? checklist.summary,
      whenToUse: copy?.whenToUse ?? checklist.whenToUse,
      tags: copy?.tags ?? checklist.tags,
      sections: checklist.sections.map((section) => localizeChecklistSection(section, checklist.id))
    };
  });
}

export function getLocalizedStudioFlows(locale: string): StudioFlow[] {
  if (!isVietnameseLocale(locale)) return studioFlows;
  return studioFlows.map(localizeFlow);
}

export function getLocalizedStudioFlowGroups(locale: string): StudioFlowGroup[] {
  if (!isVietnameseLocale(locale)) return studioFlowGroups;
  return studioFlowGroups.map(localizeFlowGroup);
}
