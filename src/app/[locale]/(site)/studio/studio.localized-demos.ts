import type {
  StudioFlow,
  StudioFlowArchitectureDemo,
  StudioFlowArchitectureEdgeSpec,
  StudioFlowArchitectureNodeSpec,
  StudioFlowArchitectureViewSpec
} from "./studio.data";

type LocalizedNodeCopy = {
  title: string;
  detail: string;
};

type LocalizedViewCopy = {
  title: string;
  description: string;
  notes: string[];
};

type LocalizedSectionCopy = {
  title: string;
  items: string[];
};

type LocalizedDemoCopy = {
  sections: LocalizedSectionCopy[];
  views: Record<string, LocalizedViewCopy>;
  nodes: Record<string, LocalizedNodeCopy>;
  edges: Record<string, string>;
};

const vietnameseBadgeCopies: Record<string, string> = {
  analytics: "phân tích",
  async: "bất đồng bộ",
  audit: "kiểm toán",
  base: "nền",
  blocked: "bị chặn",
  branch: "nhánh",
  "built-in": "có sẵn",
  child: "nút con",
  chunk: "phần dữ liệu",
  client: "máy khách",
  cluster: "cụm",
  cold: "lưu trữ lạnh",
  collapsed: "đã thu gọn",
  control: "kiểm soát",
  cost: "chi phí",
  custom: "tùy chỉnh",
  data: "dữ liệu",
  database: "database",
  db: "CSDL",
  decision: "quyết định",
  dispatch: "điều phối",
  done: "hoàn tất",
  edge: "lớp biên",
  event: "sự kiện",
  expanded: "đã mở rộng",
  external: "bên ngoài",
  flag: "đánh dấu",
  gate: "chốt kiểm tra",
  gateway: "cổng",
  group: "nhóm",
  guide: "căn chỉnh",
  headers: "header",
  ingest: "tiếp nhận",
  input: "đầu vào",
  job: "tác vụ",
  lasso: "vùng chọn",
  leaf: "nút lá",
  "level 2": "tầng 2",
  lock: "khóa",
  logs: "nhật ký",
  mart: "kho theo miền",
  media: "đa phương tiện",
  metrics: "chỉ số",
  model: "mô hình",
  node: "nút",
  note: "ghi chú",
  notify: "thông báo",
  ops: "vận hành",
  outbox: "outbox",
  output: "kết quả",
  owned: "thuộc sở hữu",
  panel: "bảng điều khiển",
  pay: "thanh toán",
  platform: "nền tảng",
  pod: "pod",
  policy: "chính sách",
  process: "xử lý",
  pubsub: "pub/sub",
  queue: "queue",
  raw: "dữ liệu thô",
  read: "mô hình đọc",
  "read model": "mô hình đọc",
  rectangle: "khung",
  region: "khu vực",
  release: "release",
  replica: "bản sao",
  response: "phản hồi",
  risk: "rủi ro",
  root: "gốc",
  search: "tìm kiếm",
  security: "bảo mật",
  select: "đã chọn",
  service: "dịch vụ",
  shard: "phân mảnh",
  source: "nguồn",
  state: "trạng thái",
  storage: "lưu trữ",
  "sub-flow": "luồng con",
  summary: "tóm tắt",
  table: "bảng",
  topic: "topic",
  valid: "hợp lệ",
  warehouse: "kho dữ liệu",
  worker: "tiến trình xử lý",
  zone: "vùng"
};

const architectureSectionCopies: LocalizedSectionCopy[] = [
  {
    title: "Các thành phần có sẵn",
    items: [
      "các loại nút đầu vào, mặc định, đầu ra và nút nhóm",
      "điểm nối nguồn và đích ở nhiều phía của nút",
      "nhãn, huy hiệu, dòng giải thích và sắc thái trạng thái của nút"
    ]
  },
  {
    title: "Các nhóm ví dụ React Flow",
    items: [
      "góc nhìn toàn cảnh, tương tác, gom nhóm, bố cục, kiểu trình bày, bảng vẽ và kiến trúc",
      "mẫu luồng con, mở hoặc thu nhánh, kiểm tra hợp lệ, đường căn chỉnh và chú thích",
      "chuyển góc nhìn bằng danh sách chọn ngay trong một mục Studio"
    ]
  },
  {
    title: "Các nút kiến trúc phần mềm",
    items: [
      "dịch vụ, API gateway, tiến trình xử lý và hệ thống phụ thuộc bên ngoài",
      "database, cache, queue, event topic và ghi chú telemetry",
      "quyết định, rủi ro, chốt chính sách và ranh giới rollout"
    ]
  },
  {
    title: "Quy ước đường nối",
    items: [
      "các kiểu đường nối default, straight, step, smoothstep và simplebezier",
      "hiệu ứng chuyển động cho luồng bất đồng bộ, mũi tên và nhãn đường nối",
      "màu nét khác nhau cho luồng đồng bộ, bất đồng bộ, dữ liệu, rủi ro và observability"
    ]
  },
  {
    title: "Bộ điều khiển canvas",
    items: [
      "lưới Background, Controls, MiniMap và fitView",
      "sơ đồ kiến trúc lớn nằm gọn trong khu vực Studio có giới hạn",
      "vị trí nút ổn định để chụp ảnh và trao đổi"
    ]
  }
];

const architectureViewCopies: Record<string, LocalizedViewCopy> = {
  "feature-overview": {
    title: "Tổng quan tính năng",
    description: "Bản tóm lược các vai trò nút có sẵn, thẻ tùy chỉnh, nhãn, điểm nối, marker và công cụ hỗ trợ trên canvas.",
    notes: ["Các nút đầu vào, mặc định và đầu ra có sẵn", "Thẻ tùy chỉnh với nhiều điểm nối", "MiniMap, Controls, Background, marker và nhãn"]
  },
  "subflows-grouping": {
    title: "Luồng con và cách gom nhóm",
    description: "Thể hiện ranh giới nhóm, thứ tự đọc từ cha đến con và hệ thống lồng nhau mà không che mất các nút quan trọng bên trong.",
    notes: ["Nút nhóm dành cho ranh giới nghiệp vụ", "Đặt nút con bên trong một ranh giới nhìn thấy được", "Đường nối đi từ luồng con này sang luồng con khác"]
  },
  "layout-dagre-tree": {
    title: "Cây phân tầng kiểu Dagre",
    description: "Cây phân tầng từ trái sang phải dành cho sơ đồ phụ thuộc, cấu trúc giống sơ đồ tổ chức và các nhánh quyết định có thể lần theo.",
    notes: ["Đọc thứ bậc từ trái sang phải", "Các nút cùng cấp nằm trên những hàng riêng", "Phù hợp để giải thích quan hệ phụ thuộc trong kiến trúc"]
  },
  "expand-collapse": {
    title: "Mở rộng và thu gọn",
    description: "Mẫu cây biểu diễn nhánh đang mở và nhánh đã thu gọn bằng các trạng thái hiển thị riêng.",
    notes: ["Hữu ích với sơ đồ kiến trúc lớn", "Nhánh thu gọn giúp sơ đồ dễ đọc", "Chỉ hiện nút con khi thực sự cần"]
  },
  "validation-helper-lines": {
    title: "Kiểm tra hợp lệ và đường căn chỉnh",
    description: "Góc nhìn mô hình hóa các kết nối được phép, kết nối bị từ chối và đường hỗ trợ căn chỉnh.",
    notes: ["Đường màu xanh cho kết nối hợp lệ", "Nút rủi ro màu đỏ cho kết nối bị từ chối", "Ghi chú dẫn hướng đánh dấu hàng và khoảng cách"]
  },
  "whiteboard-annotation": {
    title: "Bảng vẽ và chú thích",
    description: "Bề mặt vẽ sơ đồ có ghi chú dán, vùng đóng khung, mũi tên chú thích và dấu hiệu rà soát theo kiểu phác thảo.",
    notes: ["Các thành phần bảng vẽ là mẫu tùy chỉnh dựng trên React Flow", "Ghi chú và khung giúp buổi rà soát thiết kế dễ theo dõi", "Nút phác thảo có thể đứng cùng nút kiến trúc thật"]
  },
  "styling-dark-turbo": {
    title: "Kiểu trình bày và giao diện",
    description: "Góc nhìn tập trung vào ngôn ngữ hình khối, màu sắc, huy hiệu, nút nét đứt, nút chấm và cách nhấn mạnh trạng thái.",
    notes: ["Nút React Flow có thể dùng CSS thuần hoặc component của design system", "Bảng sắc thái giúp mã hóa ý nghĩa nhất quán", "Hữu ích trước khi xây một bộ thành phần sơ đồ dùng lại"]
  },
  "system-design-icon-map": {
    title: "Sơ đồ thiết kế hệ thống bằng biểu tượng",
    description: "Sơ đồ gọn theo phong cách thiết kế hệ thống, trong đó mỗi nút gồm một biểu tượng, tên hệ thống ngắn và một ghi chú vận hành.",
    notes: ["Nút biểu tượng gọn cho phần thiết kế hệ thống trong phỏng vấn", "Các làn rộng giúp giảm đường nối giao nhau", "Bao quát máy khách, lớp biên, dịch vụ, dữ liệu, xử lý bất đồng bộ, hệ thống ngoài và observability"]
  },
  "layered-platform-icon-map": {
    title: "Sơ đồ nền tảng theo từng lớp",
    description: "Sơ đồ thiết kế hệ thống hướng nền tảng, dùng biểu tượng gọn và gom chúng theo ranh giới sở hữu cùng môi trường vận hành.",
    notes: ["Khung nhóm cho biết từng hệ thống nằm ở đâu", "Các lớp tách máy khách, lớp biên, dịch vụ, dữ liệu, vận hành và hệ thống phụ thuộc bên ngoài", "Hữu ích khi rà soát kiến trúc, hướng dẫn người mới và trao đổi về refactor"]
  },
  "architecture-service-map": {
    title: "Sơ đồ dịch vụ phần mềm",
    description: "Sơ đồ kiến trúc đầy đủ hơn, gồm các vùng máy khách, lớp biên, domain, dữ liệu, hệ thống bên ngoài và vận hành.",
    notes: ["Dành cho rà soát kiến trúc và hướng dẫn người mới", "Sử dụng toàn bộ hình khối kiến trúc tùy chỉnh", "Bố cục chia theo vùng để tránh nút và đường nối chồng lên nhau"]
  },
  "event-driven-architecture": {
    title: "Kiến trúc hướng sự kiện",
    description: "Các đường đi từ nơi phát sự kiện qua broker, queue, tiến trình xử lý, projection, audit và thông báo, với hiệu ứng chuyển động cho luồng bất đồng bộ.",
    notes: ["Phù hợp để giải thích fan-out bất đồng bộ", "Đường nối chuyển động giúp nhận ra luồng sự kiện", "DLQ và audit là những nút độc lập, không bị giấu đi"]
  },
  "deployment-topology": {
    title: "Cấu trúc triển khai",
    description: "Khu vực, VPC, cụm máy, dịch vụ, kho dữ liệu và hệ thống phụ thuộc tại lớp biên trong cùng một sơ đồ triển khai.",
    notes: ["Dùng nút nhóm cho ranh giới triển khai", "Các vùng rõ ràng giúp trao đổi về trách nhiệm sở hữu", "Hệ thống phụ thuộc bên ngoài nằm ngoài ranh giới vận hành"]
  },
  "data-lineage": {
    title: "Dòng dữ liệu",
    description: "Theo dõi hệ thống nguồn, bước tiếp nhận, biến đổi, lưu trữ, kho dữ liệu theo miền, BI và trách nhiệm audit.",
    notes: ["Hữu ích cho kiến trúc phân tích dữ liệu", "Tách operational database khỏi analytics warehouse và data mart", "Cho thấy ranh giới audit và quyền riêng tư"]
  }
};

const blueprintSectionCopies: LocalizedSectionCopy[] = [
  {
    title: "Canvas cỡ bản thiết kế",
    items: [
      "sơ đồ thiết kế hệ thống nhiều vùng, lấy cảm hứng từ poster kiến trúc production",
      "DNS, metadata của yêu cầu, cân bằng tải, lưu trữ, xử lý tệp đa phương tiện, queue và dịch vụ fan-out",
      "sơ đồ lớn vẫn dễ xem nhờ MiniMap, Controls, fitView, pan, zoom và chế độ toàn màn hình"
    ]
  },
  {
    title: "Khả năng nâng cao của React Flow",
    items: [
      "custom node cho gateway, service, database, cache, queue, worker, risk, note và external system",
      "nút nhóm tạo vùng trực quan mà không làm phẳng kiến trúc",
      "nhãn đường nối, mũi tên marker, luồng bất đồng bộ có chuyển động và nhiều kiểu đường nối"
    ]
  },
  {
    title: "Cách dùng khi phỏng vấn và rà soát",
    items: [
      "dùng sơ đồ đầy đủ để trao đổi về chiều sâu kiến trúc",
      "chuyển sang góc nhìn tập trung khi người xem muốn đi sâu vào DNS, vận hành, lưu trữ hoặc xử lý tệp",
      "giữ nội dung nút ngắn gọn để sơ đồ vẫn dễ dùng thay vì trở thành một poster tĩnh"
    ]
  }
];

const blueprintViewCopies: Record<string, LocalizedViewCopy> = {
  "blueprint-full": {
    title: "Bản thiết kế hệ thống đầy đủ",
    description: "Sơ đồ dày thông tin theo phong cách production, gom DNS, edge policy, load balancing, backend services, cache, database, media processing, queue và fan-out services trên một canvas React Flow.",
    notes: ["Canvas lớn gồm nhiều vùng", "Kết hợp nhiều hình dạng nút và ranh giới nhóm", "Đường bất đồng bộ có chuyển động, nhãn, marker, MiniMap, bộ điều khiển và chế độ toàn màn hình"]
  },
  "blueprint-dns-request": {
    title: "Từ DNS đến luồng yêu cầu",
    description: "Đi sâu vào cách một lần tra cứu domain trở thành yêu cầu tại lớp biên, đi qua kiểm tra chính sách, metadata của yêu cầu và metadata của phản hồi.",
    notes: ["Các bước truy vấn DNS resolver", "Ranh giới CDN và gateway", "Ghi chú bảo mật và observability nằm gần luồng yêu cầu"]
  },
  "blueprint-runtime": {
    title: "Vận hành và cân bằng tải",
    description: "Tập trung vào traffic từ API Gateway qua load balancer, frontend servers, CDN/Edge, backend cluster, message dispatcher và connection state.",
    notes: ["Chiến lược cân bằng tải là một phần chính của sơ đồ", "Trách nhiệm của frontend và backend được trình bày rõ", "Bảng kết nối và đường điều phối tách khỏi điểm nhận yêu cầu"]
  },
  "blueprint-storage": {
    title: "Lưu trữ, cache và phối hợp",
    description: "Xem độ ổn định khi backend ghi dữ liệu, distributed ID, lock, metadata, primary data, shard, replica, cold storage và cache policy.",
    notes: ["Cơ chế coordination nằm cạnh storage", "Lựa chọn cache không bị giấu sau database", "Metadata table hiện rõ như một thành phần routing"]
  },
  "blueprint-media-fanout": {
    title: "Tải tệp và fan-out",
    description: "Theo dõi từng raw chunk qua queue validation, processing workers, encoded media storage và các fan-out service như notification, search, analytics và payment.",
    notes: ["Xử lý tệp dựa trên queue", "Chi phí tiến trình xử lý và tín hiệu retry", "Các dịch vụ phía sau được thể hiện như những bên nhận fan-out"]
  }
};

const architectureNodeCopies: Record<string, LocalizedNodeCopy> = {
  "client-zone": {
    title: "Ranh giới máy khách",
    detail: "Vùng lớn, dễ nhận biết dành cho các ứng dụng hướng tới người dùng."
  },
  "internet-user": {
    title: "Nút đầu vào",
    detail: "Khách hàng, webhook từ đối tác, lịch chạy tự động hoặc sự kiện từ ứng dụng di động."
  },
  "web-app": {
    title: "Nút mặc định",
    detail: "Ứng dụng web, BFF, dashboard hoặc giao diện nội bộ."
  },
  "edge-zone": {
    title: "Ranh giới lớp biên và chính sách",
    detail: "Điểm tiếp nhận, kiểm soát bảo mật, định tuyến và các chốt phê duyệt."
  },
  "api-gateway": {
    title: "API Gateway",
    detail: "Tiếp nhận yêu cầu, giới hạn tần suất, bàn giao xác thực, định tuyến và chuẩn hóa yêu cầu."
  },
  "auth-service": {
    title: "Dịch vụ xác thực",
    detail: "Trao đổi token, xác định tenant và kiểm tra phiên."
  },
  "policy-decision": {
    title: "Chính sách nào?",
    detail: "Rẽ nhánh theo quyền truy cập, rollout, tuân thủ hoặc tenant."
  },
  "rate-limit-risk": {
    title: "Chốt kiểm soát rủi ro",
    detail: "Hạn chế lạm dụng, cô lập lỗi và bảo vệ các luồng quan trọng."
  },
  "ops-zone": {
    title: "Vận hành và độ tin cậy",
    detail: "Chốt release, observability, audit và cơ chế rollback."
  },
  observability: {
    title: "Ghi chú telemetry",
    detail: "Log, trace, chỉ số, người phụ trách, dashboard và đường cảnh báo."
  },
  rollback: {
    title: "Kế hoạch rollback",
    detail: "Feature flag, đường quay lại của migration và giới hạn phạm vi ảnh hưởng."
  },
  "audit-log": {
    title: "Nhật ký audit",
    detail: "Bản ghi chỉ nối thêm dành cho thao tác quản trị, tiền và quyền riêng tư."
  },
  "domain-zone": {
    title: "Các dịch vụ domain",
    detail: "Ranh giới nghiệp vụ gồm dịch vụ, luồng sự kiện, tiến trình xử lý và đường retry."
  },
  "order-service": {
    title: "Dịch vụ đơn hàng",
    detail: "Xử lý lệnh, kiểm tra hợp lệ, bảo đảm idempotency và sở hữu aggregate."
  },
  "inventory-service": {
    title: "Dịch vụ tồn kho",
    detail: "Dịch vụ ngang hàng chịu trách nhiệm giữ chỗ và hoàn lại tồn kho."
  },
  "domain-events": {
    title: "Topic sự kiện",
    detail: "Luồng pub/sub dành cho projection và các bên nhận dữ liệu phía sau."
  },
  worker: {
    title: "Tiến trình xử lý",
    detail: "Xử lý bất đồng bộ các tác động phụ và tác vụ chạy lâu."
  },
  "order-queue": {
    title: "Queue",
    detail: "Luồng lệnh có bộ đệm, giới hạn retry, DLQ và backpressure."
  },
  "data-zone": {
    title: "Lớp dữ liệu",
    detail: "Nguồn giao dịch, cache và mô hình đọc được tách biệt."
  },
  "primary-db": {
    title: "Cơ sở dữ liệu chính",
    detail: "Nơi lưu giao dịch, đóng vai trò nguồn dữ liệu chuẩn."
  },
  "redis-cache": {
    title: "Cache",
    detail: "Redis, cache CDN, cache cục bộ hoặc bảng tra cứu đã tính sẵn."
  },
  warehouse: {
    title: "Kho dữ liệu",
    detail: "Mô hình đọc, bảng BI, lakehouse hoặc kho lưu trữ audit."
  },
  "payment-provider": {
    title: "Dịch vụ SaaS bên ngoài",
    detail: "Nhà cung cấp thanh toán, API đối tác, đơn vị KYC hoặc dịch vụ đám mây."
  },
  response: {
    title: "Nút đầu ra",
    detail: "Trạng thái cuối, biên nhận, thông báo cho người dùng hoặc phản hồi công khai."
  },
  "overview-input": {
    title: "Đầu vào",
    detail: "Tác nhân khởi đầu với quy ước điểm nối theo hướng từ trái sang phải."
  },
  "overview-default": {
    title: "Mặc định",
    detail: "Nút chữ nhật đơn giản để phác nhanh một quy trình."
  },
  "overview-service": {
    title: "Nút tùy chỉnh",
    detail: "Nút React dạng component, có huy hiệu, phần mô tả và trạng thái theo giao diện."
  },
  "overview-output": {
    title: "Đầu ra",
    detail: "Trạng thái cuối, phản hồi cho người dùng, dữ liệu xuất ra hoặc tín hiệu hoàn tất."
  },
  "overview-note": {
    title: "Bảng phủ trên canvas",
    detail: "Dùng giao diện cố định nằm ngoài nút cho bộ chọn và các nút điều khiển sơ đồ."
  },
  "overview-risk": {
    title: "Trạng thái được nhấn mạnh",
    detail: "Sắc thái có thể đánh dấu lỗi, cảnh báo, phần cần rà soát hoặc trạng thái bị chặn."
  },
  "group-client": {
    title: "Nhóm máy khách",
    detail: "Ranh giới trực quan đóng vai trò như một nút cha."
  },
  "group-api": {
    title: "Nhóm API",
    detail: "Khu vực dịch vụ được lồng bên trong."
  },
  "group-mobile": {
    title: "Ứng dụng di động",
    detail: "Nút con nằm bên trong nhóm máy khách."
  },
  "group-web": {
    title: "Ứng dụng web",
    detail: "Nút con cùng cấp trong một ranh giới."
  },
  "group-gateway": {
    title: "Gateway",
    detail: "Điểm bắt đầu đi qua ranh giới nhóm."
  },
  "group-service": {
    title: "Dịch vụ hồ sơ",
    detail: "Dịch vụ nằm bên trong nhóm API."
  },
  "group-db": {
    title: "Cơ sở dữ liệu hồ sơ",
    detail: "Nơi lưu dữ liệu có thể nằm trong hoặc ngoài nhóm."
  },
  "tree-root": {
    title: "Yêu cầu gốc",
    detail: "Điểm vào duy nhất của cây bố cục."
  },
  "tree-router": {
    title: "Bộ định tuyến",
    detail: "Rẽ nhánh yêu cầu theo đường dẫn hoặc tenant."
  },
  "tree-a": {
    title: "Dịch vụ A",
    detail: "Nhánh thứ nhất ở cùng một độ sâu."
  },
  "tree-b": {
    title: "Dịch vụ B",
    detail: "Nhánh thứ hai giữ khoảng cách theo chiều ngang."
  },
  "tree-a-db": {
    title: "Cơ sở dữ liệu A",
    detail: "Nút lá nằm dưới Dịch vụ A."
  },
  "tree-a-cache": {
    title: "Cache A",
    detail: "Leaf node cùng cấp với database A."
  },
  "tree-b-worker": {
    title: "Tiến trình xử lý B",
    detail: "Nút lá bất đồng bộ nằm dưới Dịch vụ B."
  },
  "tree-b-topic": {
    title: "Topic B",
    detail: "Nút lá sự kiện nằm dưới Dịch vụ B."
  },
  "expand-root": {
    title: "Nút gốc",
    detail: "Chủ đề hoặc hệ thống chính."
  },
  "expand-open": {
    title: "Nhánh đang mở",
    detail: "Các nút con đang hiển thị bên dưới nút này."
  },
  "expand-closed": {
    title: "Nhánh đã thu gọn",
    detail: "Các nút con được thay bằng một nút tóm tắt."
  },
  "expand-child-a": {
    title: "Nút con A",
    detail: "Nút con đang hiển thị trong nhánh mở."
  },
  "expand-child-b": {
    title: "Nút con B",
    detail: "Nút con đang hiển thị trong nhánh mở."
  },
  "expand-summary": {
    title: "+ 4 nút đang ẩn",
    detail: "Nút giữ chỗ giúp canvas vẫn gọn khi nhánh được thu lại."
  },
  "expand-output": {
    title: "Nhánh đã chọn",
    detail: "Một nhánh đang được tập trung vẫn có thể đi đến kết quả cuối."
  },
  "validation-source": {
    title: "Điểm nối nguồn",
    detail: "Chỉ những đích đã được cho phép mới có thể kết nối."
  },
  "validation-service": {
    title: "Đích được phép",
    detail: "Đường kết nối hợp lệ."
  },
  "validation-risk": {
    title: "Đích bị từ chối",
    detail: "Đường nối không hợp lệ hoặc quan hệ phụ thuộc bị cấm."
  },
  "validation-db": {
    title: "Nơi lưu trữ được phép",
    detail: "Dịch vụ chịu trách nhiệm với quan hệ phụ thuộc này."
  },
  "validation-guide-x": {
    title: "Đường căn chỉnh",
    detail: "Cho biết các nút đã thẳng hàng khi được di chuyển."
  },
  "validation-output": {
    title: "Sơ đồ được chấp nhận",
    detail: "Chỉ những đường hợp lệ mới trở thành một phần của sơ đồ."
  },
  "whiteboard-frame": {
    title: "Khung rà soát",
    detail: "Vùng đóng khung dành cho một buổi làm việc chung hoặc chủ đề cần rà soát."
  },
  "whiteboard-note": {
    title: "Ghi chú dán",
    detail: "Câu hỏi còn mở, ý kiến của người rà soát hoặc lời nhắc về quyết định."
  },
  "whiteboard-service": {
    title: "Phương án đang cân nhắc",
    detail: "Nút thật vẫn hoạt động như một phần của sơ đồ."
  },
  "whiteboard-lasso": {
    title: "Vùng chọn",
    detail: "Ranh giới kiểu lasso có thể mô tả thao tác áp dụng cho nhiều nút."
  },
  "whiteboard-a": {
    title: "Nút A đã chọn",
    detail: "Nút đầu tiên trong vùng chọn."
  },
  "whiteboard-b": {
    title: "Nút B đã chọn",
    detail: "Nút thứ hai trong vùng chọn."
  },
  "whiteboard-risk": {
    title: "Đánh dấu của người rà soát",
    detail: "Mũi tên chú thích chỉ vào điểm cần lưu ý."
  },
  "whiteboard-output": {
    title: "Quyết định",
    detail: "Thay đổi được chấp thuận hoặc việc cần làm tiếp theo."
  },
  "style-source": {
    title: "Sắc thái nguồn",
    detail: "Nhóm đầu vào dùng màu xanh lam."
  },
  "style-process": {
    title: "Sắc thái xử lý",
    detail: "Dịch vụ hoặc hành động cốt lõi."
  },
  "style-event": {
    title: "Sắc thái sự kiện",
    detail: "Luồng sự kiện dùng nét chấm."
  },
  "style-storage": {
    title: "Sắc thái lưu trữ",
    detail: "Hình trụ thể hiện nơi sở hữu dữ liệu."
  },
  "style-external": {
    title: "Sắc thái bên ngoài",
    detail: "Nét đứt dành cho ranh giới của hệ thống phụ thuộc."
  },
  "style-risk": {
    title: "Sắc thái rủi ro",
    detail: "Trạng thái cần được chú ý cao."
  },
  "style-output": {
    title: "Sắc thái kết quả",
    detail: "Kết quả đã hoàn thành hoặc được chấp nhận."
  },
  "sys-users": {
    title: "Người dùng",
    detail: "Lưu lượng từ web và ứng dụng di động"
  },
  "sys-admin": {
    title: "Quản trị viên",
    detail: "Các thao tác vận hành nội bộ"
  },
  "sys-cdn": {
    title: "CDN",
    detail: "Tài nguyên tĩnh"
  },
  "sys-gateway": {
    title: "API Gateway",
    detail: "Xác thực, giới hạn tần suất và định tuyến"
  },
  "sys-auth": {
    title: "Xác thực",
    detail: "Token và tenant"
  },
  "sys-api": {
    title: "API cốt lõi",
    detail: "Lệnh và truy vấn đọc"
  },
  "sys-order": {
    title: "Đơn hàng",
    detail: "Nơi sở hữu aggregate"
  },
  "sys-inventory": {
    title: "Tồn kho",
    detail: "Trạng thái giữ chỗ"
  },
  "sys-bus": {
    title: "Bus sự kiện",
    detail: "Fan-out bất đồng bộ"
  },
  "sys-worker": {
    title: "Các tiến trình xử lý",
    detail: "Retry và tác động phụ"
  },
  "sys-postgres": {
    title: "Postgres",
    detail: "Nguồn dữ liệu chuẩn"
  },
  "sys-redis": {
    title: "Redis",
    detail: "Dữ liệu đọc thường xuyên và khóa"
  },
  "sys-warehouse": {
    title: "Kho dữ liệu",
    detail: "Mô hình đọc"
  },
  "sys-observe": {
    title: "Telemetry",
    detail: "Log, chỉ số và trace"
  },
  "sys-payment": {
    title: "API thanh toán",
    detail: "Ranh giới nhà cung cấp"
  },
  "sys-output": {
    title: "Biên nhận",
    detail: "Trạng thái người dùng nhìn thấy"
  },
  "layer-client": {
    title: "Nền tảng máy khách",
    detail: "Các điểm vào công khai và nội bộ."
  },
  "layer-edge": {
    title: "Nền tảng lớp biên",
    detail: "Ranh giới phân phối, định danh, chính sách và định tuyến."
  },
  "layer-services": {
    title: "Nền tảng dịch vụ",
    detail: "Các dịch vụ domain cùng phần thực thi bất đồng bộ."
  },
  "layer-data": {
    title: "Nền tảng dữ liệu",
    detail: "Mô hình giao dịch, cache và phân tích."
  },
  "layer-ops": {
    title: "Nền tảng vận hành",
    detail: "Telemetry, audit và cơ chế kiểm soát release."
  },
  "layer-external": {
    title: "Ranh giới bên ngoài",
    detail: "API của nhà cung cấp và kết quả người dùng nhìn thấy."
  },
  "layer-users": {
    title: "Người dùng",
    detail: "Lưu lượng từ web và ứng dụng di động"
  },
  "layer-admin": {
    title: "Quản trị viên",
    detail: "Giao diện vận hành"
  },
  "layer-cdn": {
    title: "CDN",
    detail: "Phân phối tài nguyên tĩnh"
  },
  "layer-gateway": {
    title: "Gateway",
    detail: "Giới hạn tần suất và định tuyến"
  },
  "layer-auth": {
    title: "Xác thực",
    detail: "Phiên và tenant"
  },
  "layer-api": {
    title: "API cốt lõi",
    detail: "Ranh giới nhận lệnh"
  },
  "layer-order": {
    title: "Đơn hàng",
    detail: "Nơi sở hữu aggregate"
  },
  "layer-inventory": {
    title: "Tồn kho",
    detail: "Nơi sở hữu trạng thái giữ chỗ"
  },
  "layer-bus": {
    title: "Bus sự kiện",
    detail: "Fan-out bất đồng bộ"
  },
  "layer-worker": {
    title: "Các tiến trình xử lý",
    detail: "Retry và tác động phụ"
  },
  "layer-postgres": {
    title: "Postgres",
    detail: "Nguồn dữ liệu chuẩn"
  },
  "layer-redis": {
    title: "Redis",
    detail: "Dữ liệu đọc thường xuyên và khóa"
  },
  "layer-warehouse": {
    title: "Kho dữ liệu",
    detail: "Mô hình đọc"
  },
  "layer-telemetry": {
    title: "Telemetry",
    detail: "Chỉ số và trace"
  },
  "layer-audit": {
    title: "Audit",
    detail: "Lịch sử chỉ nối thêm"
  },
  "layer-rollout": {
    title: "Rollout",
    detail: "Feature flag và rollback"
  },
  "layer-payment": {
    title: "API thanh toán",
    detail: "Hợp đồng với nhà cung cấp"
  },
  "layer-receipt": {
    title: "Biên nhận",
    detail: "Trạng thái người dùng nhìn thấy"
  },
  "eda-client": {
    title: "Yêu cầu thanh toán",
    detail: "Lệnh đi vào hệ thống đúng một lần."
  },
  "eda-command": {
    title: "Dịch vụ nhận lệnh",
    detail: "Kiểm tra hợp lệ rồi ghi lệnh."
  },
  "eda-outbox": {
    title: "Outbox",
    detail: "Bản ghi sự kiện nằm trong cùng giao dịch."
  },
  "eda-topic": {
    title: "Topic đơn hàng",
    detail: "Luồng sự kiện fan-out."
  },
  "eda-worker-a": {
    title: "Tiến trình thanh toán",
    detail: "Nhận và xử lý các sự kiện thanh toán."
  },
  "eda-worker-b": {
    title: "Tiến trình gửi email",
    detail: "Nhận và xử lý các sự kiện thông báo."
  },
  "eda-dlq": {
    title: "DLQ",
    detail: "Thông điệp lỗi cùng người chịu trách nhiệm phát lại."
  },
  "eda-provider": {
    title: "API thanh toán",
    detail: "Hệ thống phụ thuộc bên ngoài được bảo vệ bằng retry."
  },
  "eda-projection": {
    title: "Projection",
    detail: "Mô hình đọc được cập nhật từ sự kiện."
  },
  "eda-output": {
    title: "Cập nhật cho người dùng",
    detail: "Biên nhận, email hoặc trang trạng thái."
  },
  "deploy-region": {
    title: "Khu vực ap-southeast-1",
    detail: "Ranh giới cao nhất của hạ tầng đám mây hoặc trung tâm dữ liệu."
  },
  "deploy-cluster": {
    title: "Cụm Kubernetes",
    detail: "Ranh giới tài nguyên tính toán bên trong khu vực."
  },
  "deploy-edge": {
    title: "Điểm tiếp nhận",
    detail: "Bộ cân bằng tải, WAF, gateway hoặc đường định tuyến tại lớp biên."
  },
  "deploy-api": {
    title: "Pod API",
    detail: "Tải ứng dụng có thể mở rộng theo chiều ngang."
  },
  "deploy-worker": {
    title: "Pod xử lý nền",
    detail: "Tải công việc chạy nền."
  },
  "deploy-cache": {
    title: "Redis",
    detail: "Cache dùng chung trong mạng riêng."
  },
  "deploy-db": {
    title: "Cơ sở dữ liệu được quản lý",
    detail: "Dịch vụ có trạng thái do nhà cung cấp quản lý."
  },
  "deploy-observe": {
    title: "Observability",
    detail: "Log, chỉ số, trace và người phụ trách cảnh báo."
  },
  "deploy-cdn": {
    title: "CDN",
    detail: "Cache công khai và tài nguyên tĩnh."
  },
  "deploy-third-party": {
    title: "API bên thứ ba",
    detail: "Hệ thống phụ thuộc bên ngoài có giới hạn timeout."
  },
  "deploy-output": {
    title: "Release ổn định",
    detail: "Lưu lượng, cảnh báo và đường rollback đều nhìn thấy được."
  },
  "lineage-app": {
    title: "Sự kiện sản phẩm",
    detail: "Lượt nhấp, đơn hàng, phiên và sự kiện vận hành."
  },
  "lineage-db": {
    title: "Cơ sở dữ liệu vận hành",
    detail: "Hệ thống nguồn cho dữ liệu giao dịch."
  },
  "lineage-ingest": {
    title: "Tiếp nhận dữ liệu",
    detail: "Ranh giới tiếp nhận theo lô hoặc theo luồng."
  },
  "lineage-raw": {
    title: "Hồ dữ liệu thô",
    detail: "Vùng dữ liệu thô không thay đổi."
  },
  "lineage-transform": {
    title: "Tác vụ biến đổi",
    detail: "Tác vụ dbt, Spark, SQL hoặc tiến trình chạy theo lịch."
  },
  "lineage-warehouse": {
    title: "Kho dữ liệu",
    detail: "Mô hình phân tích sạch, dùng chung."
  },
  "lineage-mart": {
    title: "Kho dữ liệu theo miền",
    detail: "Các bảng chỉ số do từng đội ngũ sở hữu."
  },
  "lineage-bi": {
    title: "Dashboard BI",
    detail: "Nơi người đọc xem dữ liệu để ra quyết định."
  },
  "lineage-audit": {
    title: "Rà soát quyền riêng tư",
    detail: "Thời gian lưu giữ, quyền truy cập, PII, người phụ trách dòng dữ liệu và lịch sử audit."
  }
};

const architectureEdgeCopies: Record<string, string> = {
  "user-web": "đường nối thẳng",
  "web-gateway": "yêu cầu smoothstep",
  "gateway-auth": "kiểm tra xác thực theo bậc",
  "gateway-policy": "quyết định mặc định",
  "gateway-risk": "nhánh rủi ro",
  "policy-order": "lệnh được cho phép",
  "order-inventory": "lời gọi đồng bộ",
  "order-db": "giao dịch",
  "order-cache": "đọc xuyên qua cache",
  "order-events": "phát sự kiện có chuyển động",
  "events-worker": "nhận bất đồng bộ",
  "worker-queue": "retry / DLQ",
  "events-warehouse": "projection",
  "order-payment": "API đối tác",
  "provider-response": "trạng thái cuối",
  "gateway-observability": "chỉ số / trace",
  "order-audit": "ghi nối tiếp vào audit",
  "rollback-audit": "bằng chứng release",
  "overview-edge-1": "smoothstep",
  "overview-edge-2": "mặc định",
  "overview-edge-3": "đường thẳng",
  "overview-edge-4": "theo bậc",
  "overview-edge-5": "simplebezier",
  "group-mobile-gateway": "lời gọi từ máy khách",
  "group-web-gateway": "cùng nhóm cha",
  "group-gateway-service": "đi qua ranh giới nhóm",
  "group-service-db": "sở hữu dữ liệu",
  "tree-root-router": "yêu cầu",
  "tree-router-a": "nhánh A",
  "tree-router-b": "nhánh B",
  "tree-a-db": "đọc / ghi",
  "tree-a-cache": "cache",
  "tree-b-worker": "tác vụ",
  "tree-b-topic": "phát sự kiện",
  "expand-root-open": "mở",
  "expand-root-closed": "đã thu gọn",
  "expand-open-a": "đang hiển thị",
  "expand-open-b": "đang hiển thị",
  "expand-closed-summary": "tóm tắt",
  "expand-a-output": "đã chọn",
  "expand-b-output": "đã chọn",
  "validation-valid": "hợp lệ",
  "validation-invalid": "bị chặn",
  "validation-service-db": "thuộc sở hữu",
  "validation-guide": "đã căn chỉnh",
  "validation-db-output": "được chấp nhận",
  "whiteboard-note-service": "nhận xét",
  "whiteboard-service-a": "so sánh",
  "whiteboard-a-b": "cùng vùng chọn",
  "whiteboard-risk-output": "đã xử lý",
  "style-1": "chính",
  "style-2": "phát sự kiện",
  "style-3": "tạo mô hình đọc",
  "style-4": "rủi ro",
  "style-5": "xử lý",
  "sys-users-cdn": "tài nguyên",
  "sys-users-gateway": "HTTPS",
  "sys-admin-gateway": "vận hành",
  "sys-gateway-auth": "token",
  "sys-gateway-api": "định tuyến",
  "sys-api-order": "lệnh",
  "sys-api-inventory": "truy vấn",
  "sys-order-bus": "sự kiện",
  "sys-bus-worker": "nhận xử lý",
  "sys-order-postgres": "ghi",
  "sys-inventory-redis": "cache",
  "sys-postgres-warehouse": "CDC",
  "sys-api-observe": "tín hiệu",
  "sys-worker-payment": "thu tiền",
  "sys-payment-output": "trạng thái",
  "sys-observe-output": "SLO",
  "layer-users-cdn": "tài nguyên",
  "layer-users-gateway": "HTTPS",
  "layer-admin-gateway": "vận hành",
  "layer-gateway-auth": "chính sách",
  "layer-auth-api": "các claim",
  "layer-gateway-api": "định tuyến",
  "layer-api-order": "lệnh",
  "layer-api-inventory": "truy vấn",
  "layer-order-bus": "sự kiện",
  "layer-bus-worker": "nhận xử lý",
  "layer-order-postgres": "ghi",
  "layer-inventory-redis": "cache",
  "layer-bus-warehouse": "tạo mô hình đọc",
  "layer-api-telemetry": "trace",
  "layer-postgres-audit": "audit",
  "layer-worker-payment": "thu tiền",
  "layer-payment-receipt": "trạng thái",
  "layer-rollout-receipt": "chốt release",
  "eda-client-command": "lệnh",
  "eda-command-outbox": "ghi sự kiện",
  "eda-outbox-topic": "chuyển tiếp",
  "eda-topic-worker-a": "nhận xử lý",
  "eda-topic-worker-b": "nhận xử lý",
  "eda-topic-dlq": "lỗi",
  "eda-worker-provider": "retry API",
  "eda-worker-projection": "cập nhật mô hình đọc",
  "eda-projection-output": "thông báo",
  "deploy-cdn-edge": "tĩnh + động",
  "deploy-edge-api": "định tuyến",
  "deploy-api-worker": "tác vụ",
  "deploy-api-cache": "cache",
  "deploy-api-db": "SQL",
  "deploy-worker-third-party": "nhà cung cấp",
  "deploy-db-observe": "tín hiệu",
  "deploy-observe-output": "chốt release",
  "lineage-app-ingest": "luồng sự kiện",
  "lineage-db-ingest": "CDC",
  "lineage-ingest-raw": "đưa vào vùng thô",
  "lineage-raw-transform": "làm sạch",
  "lineage-transform-warehouse": "công bố",
  "lineage-warehouse-mart": "tạo mô hình",
  "lineage-warehouse-bi": "phục vụ truy vấn",
  "lineage-warehouse-audit": "rà soát"
};

const blueprintNodeCopies: Record<string, LocalizedNodeCopy> = {
  "dns-zone": {
    title: "Phân giải DNS",
    detail: "Máy chủ gốc, TLD, máy chủ tên có thẩm quyền, resolver và bước tìm IP mà máy khách nhìn thấy."
  },
  "client-phone": {
    title: "Di động / Trình duyệt",
    detail: "Người dùng nhập domain và bắt đầu luồng yêu cầu."
  },
  "recursive-resolver": {
    title: "Resolver đệ quy",
    detail: "Resolver của nhà mạng hoặc dịch vụ công cộng kiểm tra cache trước khi truy vấn DNS."
  },
  "root-ns": {
    title: "Root NS",
    detail: "Trả về máy chủ tên TLD cho .com, .org hoặc một hậu tố khác."
  },
  "tld-ns": {
    title: "TLD NS",
    detail: "Chỉ resolver đến máy chủ tên có thẩm quyền."
  },
  "authoritative-ns": {
    title: "Máy chủ tên có thẩm quyền",
    detail: "Trả về bản ghi cuối, TTL và đích canonical."
  },
  "resolved-ip": {
    title: "IP đã phân giải",
    detail: "IP, CNAME, TTL, trạng thái DNSSEC và khả năng cache."
  },
  "request-zone": {
    title: "Yêu cầu từ máy khách và chính sách lớp biên",
    detail: "Metadata của yêu cầu, kiểm soát bảo mật, CDN, API gateway và thông tin phản hồi."
  },
  "request-envelope": {
    title: "Gói thông tin yêu cầu",
    detail: "Header, ID yêu cầu, khóa idempotency, token xác thực, ngôn ngữ và cách nén."
  },
  "cdn-edge": {
    title: "CDN / Lớp biên",
    detail: "TLS, cache tài nguyên tĩnh, WAF, kiểm tra bot và định tuyến theo khu vực."
  },
  "api-gateway-blueprint": {
    title: "API Gateway",
    detail: "Kiểm tra hợp lệ, bàn giao xác thực, giới hạn tần suất, định tuyến, đo mức sử dụng và loại yêu cầu trùng."
  },
  "response-envelope": {
    title: "Gói thông tin phản hồi",
    detail: "Mã 4xx/5xx, phân trang, header cache, cookie, độ trễ và mã lỗi."
  },
  "security-options": {
    title: "Các lựa chọn bảo mật",
    detail: "OAuth, quy tắc WAF, chính sách TLS, CSRF, ký yêu cầu và khoảng thời gian chống phát lại."
  },
  "observability-note": {
    title: "Dải chỉ số",
    detail: "Thời gian phản hồi, mã trạng thái lỗi, số kết nối đang hoạt động và thông báo lỗi."
  },
  "runtime-zone": {
    title: "Cân bằng tải và vận hành",
    detail: "Định tuyến đầu vào, lựa chọn cân bằng tải, máy chủ frontend, cụm backend và đường điều phối."
  },
  "load-balancer": {
    title: "Bộ cân bằng tải",
    detail: "Round robin, gán trọng số, ít kết nối nhất, hashing và kiểm tra sức khỏe."
  },
  "frontend-servers": {
    title: "Các máy chủ frontend",
    detail: "HTTP, WebSocket, SSE, short polling, API truyền luồng và phiên trực tiếp."
  },
  "edge-static": {
    title: "Các máy chủ CDN / Edge",
    detail: "Tài nguyên tĩnh toàn cầu, luồng ABR, xử lý cache miss, lấy từ origin và cache theo khu vực."
  },
  "backend-cluster": {
    title: "Cụm backend",
    detail: "Cụm dịch vụ có ranh giới microservice, tự động mở rộng và áp lực CPU hoặc bộ nhớ."
  },
  "message-dispatcher": {
    title: "Bộ điều phối thông điệp",
    detail: "Chuyển thông điệp của từng phần dữ liệu đến máy chủ frontend đang giữ kết nối hoạt động."
  },
  "balancing-controls": {
    title: "Danh sách kiểm tra cân bằng tải",
    detail: "Kiểm tra đầu vào, xác thực, hạn chế tần suất, danh sách cho phép, điều tiết luồng và kết thúc TLS."
  },
  "server-state": {
    title: "Bảng kết nối",
    detail: "Người dùng, đối tượng kết nối, máy chủ phụ trách, băng thông và topic."
  },
  "coordination-zone": {
    title: "Các cơ chế phối hợp",
    detail: "Tạo ID, khóa, xử lý đồng thời và metadata định tuyến để giữ thao tác ghi phân tán ổn định."
  },
  "distributed-id": {
    title: "ID phân tán",
    detail: "UUID, Snowflake, các biến thể tự tăng, Baidu UID và Sonyflake."
  },
  "resource-lock": {
    title: "Khóa tài nguyên",
    detail: "Redis Redlock, Chubby, Zookeeper, thời hạn lease và tranh chấp khóa."
  },
  "concurrency-note": {
    title: "Các lựa chọn xử lý đồng thời",
    detail: "Tuần tự, theo lô, optimistic, pessimistic, retry và cập nhật idempotent."
  },
  "metadata-table": {
    title: "Metadata của từng phần dữ liệu truyền",
    detail: "Khóa, checksum, timestamp, máy chủ, con trỏ đối tượng và trạng thái retry."
  },
  "data-zone-blueprint": {
    title: "Cơ sở dữ liệu và cache",
    detail: "Kho chính, shard, replica, lưu trữ lạnh, cache trong bộ nhớ và chính sách loại bỏ."
  },
  "primary-db-blueprint": {
    title: "Database",
    detail: "RDBMS, wide-column, document, key-value, graph, quadtree và time-series."
  },
  shards: {
    title: "Các shard",
    detail: "Chia theo khoảng, hash, địa lý, thư mục hoặc hash lại nút nóng."
  },
  replicas: {
    title: "Các replica",
    detail: "Quorum, hinted handoff, Merkle tree, liên vùng và tách luồng đọc ghi."
  },
  "cold-storage": {
    title: "Lưu trữ lạnh",
    detail: "Bản ghi cũ, consistent hashing, vòng hash và truy cập kho lưu trữ."
  },
  "memory-cache": {
    title: "Cache trong bộ nhớ",
    detail: "Write-through, read-through, write-around và write-back."
  },
  "distributed-cache": {
    title: "Cache phân tán",
    detail: "Cache miss hoặc hit, mức dùng đĩa và bộ nhớ, loại bỏ và vô hiệu hóa dữ liệu."
  },
  "eviction-policy": {
    title: "Chính sách loại bỏ cache",
    detail: "LRU, LFU, FIFO, MRU, ngẫu nhiên, ít dùng nhất và hết hạn theo nhu cầu."
  },
  "media-zone": {
    title: "Luồng tải và xử lý tệp đa phương tiện",
    detail: "Tải từng phần, kiểm tra checksum, đưa vào queue, xử lý và lưu tệp đã mã hóa."
  },
  "object-storage": {
    title: "Object Storage",
    detail: "Các phần dữ liệu S3 thô, tải nhiều phần, con trỏ đối tượng và nguồn checksum."
  },
  "object-chunk-note": {
    title: "Với mỗi phần dữ liệu",
    detail: "Số thông điệp, tốc độ tiêu thụ, số đang truyền, số chờ xác nhận và giới hạn queue."
  },
  "upload-queue": {
    title: "Message Queue",
    detail: "Broker, pub/sub, kiểm tra checksum, retry và backpressure."
  },
  "processing-workers": {
    title: "Các tiến trình xử lý",
    detail: "Kiểm tra checksum, chuyển mã, quét, nén, giới hạn tần suất và đẩy tệp kết quả."
  },
  "encoded-storage": {
    title: "Encoded Media Storage",
    detail: "Media đã encode theo lossless hoặc lossy, kèm object count, compression ratio và failure count."
  },
  "media-cost-note": {
    title: "Chi phí xử lý",
    detail: "Thời gian tính toán, số lần thất bại, mức dùng CPU và đĩa, dung lượng lưu trữ cùng số đối tượng."
  },
  "fanout-zone": {
    title: "Các dịch vụ fan-out phổ biến",
    detail: "Fan-out qua pub/sub đến dịch vụ thông báo, tìm kiếm, analytics, gợi ý, tính phí và hệ thống bên thứ ba."
  },
  "pubsub-queue": {
    title: "Queue Pub/Sub",
    detail: "Các topic đi qua broker, có khóa retry và nhóm consumer."
  },
  "notification-service": {
    title: "Dịch vụ thông báo",
    detail: "Kiểm soát thư rác, từ cấm, loại trùng và retry bằng khóa idempotent."
  },
  "recommendation-service": {
    title: "Dịch vụ gợi ý",
    detail: "Lọc theo nội dung và lọc cộng tác."
  },
  "log-processing": {
    title: "Xử lý log",
    detail: "Chuẩn hóa log và phát các luồng observability."
  },
  "search-service": {
    title: "Dịch vụ tìm kiếm",
    detail: "Lập chỉ mục tài liệu và phục vụ lưu lượng truy vấn."
  },
  "analytics-service": {
    title: "Dịch vụ analytics",
    detail: "Sự kiện, dashboard, cohort, chuyển đổi và cảnh báo."
  },
  "payment-charge": {
    title: "Thu tiền",
    detail: "Khóa idempotent, thẻ hết hạn, số dư không đủ và ngân hàng bên thứ ba."
  }
};

const blueprintEdgeCopies: Record<string, string> = {
  "client-resolver": "tra cứu domain",
  "resolver-root": "máy chủ gốc?",
  "root-tld": "TLD NS",
  "tld-auth": "ANS",
  "auth-ip": "12.34.56.78",
  "ip-cdn": "kết nối",
  "request-cdn": "yêu cầu",
  "cdn-gateway": "không có trong cache gốc",
  "gateway-response": "phản hồi",
  "security-gateway": "chính sách",
  "gateway-metrics": "telemetry",
  "gateway-lb": "định tuyến",
  "lb-frontend": "đích đạt health check",
  "frontend-edge-static": "tài nguyên tĩnh / luồng",
  "frontend-backend": "lời gọi API",
  "backend-dispatcher": "điều phối",
  "dispatcher-state": "máy chủ giữ kết nối",
  "backend-id": "ID mới",
  "backend-lock": "bảo vệ thao tác ghi",
  "backend-metadata": "bản ghi phần dữ liệu",
  "backend-primary": "giao dịch",
  "primary-shards": "phân vùng",
  "primary-replicas": "tạo bản sao",
  "primary-cold": "lưu trữ",
  "backend-cache": "dữ liệu đọc thường xuyên",
  "cache-distributed": "vô hiệu hóa",
  "metadata-object": "con trỏ đối tượng",
  "object-queue": "sự kiện phần dữ liệu",
  "queue-workers": "nhận xử lý",
  "workers-storage": "tệp đã xử lý",
  "workers-cost": "chỉ số chi phí",
  "encoded-pubsub": "fan-out",
  "pubsub-notify": "thông báo",
  "pubsub-reco": "gợi ý",
  "pubsub-log": "log",
  "pubsub-search": "lập chỉ mục",
  "pubsub-analytics": "sự kiện",
  "pubsub-payment": "thu tiền"
};

const vietnameseDemoCopies: Record<string, LocalizedDemoCopy> = {
  "react-flow-architecture-demo": {
    sections: architectureSectionCopies,
    views: architectureViewCopies,
    nodes: architectureNodeCopies,
    edges: architectureEdgeCopies
  },
  "react-flow-system-blueprint": {
    sections: blueprintSectionCopies,
    views: blueprintViewCopies,
    nodes: blueprintNodeCopies,
    edges: blueprintEdgeCopies
  }
};

function localizeNode(node: StudioFlowArchitectureNodeSpec, copy: LocalizedDemoCopy): StudioFlowArchitectureNodeSpec {
  const localized = copy.nodes[node.id];
  const translateBadge = ["blocked", "done", "risk", "summary", "valid"].includes(node.badge);
  return {
    ...node,
    title: localized?.title ?? node.title,
    detail: localized?.detail ?? node.detail,
    badge: translateBadge ? (vietnameseBadgeCopies[node.badge] ?? node.badge) : node.badge
  };
}

function localizeEdge(edge: StudioFlowArchitectureEdgeSpec, copy: LocalizedDemoCopy): StudioFlowArchitectureEdgeSpec {
  return {
    ...edge,
    label: copy.edges[edge.id] ?? edge.label
  };
}

function localizeView(view: StudioFlowArchitectureViewSpec, copy: LocalizedDemoCopy): StudioFlowArchitectureViewSpec {
  const localized = copy.views[view.id];
  return {
    ...view,
    title: localized?.title ?? view.title,
    description: localized?.description ?? view.description,
    notes: localized?.notes ?? view.notes,
    nodes: view.nodes.map((node) => localizeNode(node, copy)),
    edges: view.edges.map((edge) => localizeEdge(edge, copy))
  };
}

function localizeDemo(demo: StudioFlowArchitectureDemo, copy: LocalizedDemoCopy): StudioFlowArchitectureDemo {
  return {
    ...demo,
    sections: demo.sections.map((section, index) => ({
      ...section,
      title: copy.sections[index]?.title ?? section.title,
      items: copy.sections[index]?.items ?? section.items
    })),
    nodes: demo.nodes.map((node) => localizeNode(node, copy)),
    edges: demo.edges.map((edge) => localizeEdge(edge, copy)),
    views: demo.views.map((view) => localizeView(view, copy))
  };
}

export function getLocalizedStudioDemoFlows(flows: StudioFlow[], locale: string): StudioFlow[] {
  if (locale.toLowerCase().split("-")[0] !== "vi") return flows;

  return flows.map((flow) => {
    const copy = vietnameseDemoCopies[flow.id];
    if (!copy || !flow.architectureDemo) return flow;

    return {
      ...flow,
      architectureDemo: localizeDemo(flow.architectureDemo, copy)
    };
  });
}
