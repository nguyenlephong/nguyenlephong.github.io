import type { StudioUiCopy } from "./studio-shell-copy";

export const vietnameseStudioCopy: StudioUiCopy = {
  brand: "Studio",
  navLabel: "Studio cá nhân của Nguyễn Lê Phong",
  navItems: {
    welcome: "Bắt đầu",
    "ai-agent-setup": "AI Setup",
    "ai-skills": "AI Skills",
    "delivery-checklists": "Checklists",
    "flow-menu": "Flow",
    "flow-system-design": "System Design",
    "flow-architecture-decision": "Architecture Decision",
    "flow-incident-response": "Incident Response",
    "flow-release-readiness": "Release Readiness",
    "flow-ai-delivery": "AI-assisted Delivery",
    "flow-portfolio-story": "Portfolio Story",
    "flow-react-flow-architecture-demo": "React Flow Examples",
    "flow-react-flow-system-blueprint": "System Blueprint"
  },
  profileItems: {
    home: {
      label: "Trang chủ",
      detail: "Tổng quan hồ sơ cá nhân."
    },
    about: {
      label: "Giới thiệu",
      detail: "Kinh nghiệm và nền tảng."
    },
    gallery: {
      label: "Hình ảnh",
      detail: "Những dấu mốc và hình ảnh chọn lọc."
    },
    blog: {
      label: "Blog",
      detail: "Bài viết dài."
    },
    notes: {
      label: "Ghi chép",
      detail: "Ghi chép ngắn từ công việc và đời sống."
    },
    apps: {
      label: "Ứng dụng",
      detail: "Công cụ nhỏ và những thử nghiệm cá nhân."
    },
    resume: {
      label: "CV",
      detail: "Mở bản CV dạng PDF."
    }
  },
  profileMenuTitle: "Hồ sơ cá nhân",
  profileNavigationTitle: "Đi tới trang khác",
  profileNavigationDetail:
    "Mở các phần trong hồ sơ công khai mà không phải rời Studio.",
  openProfileHome: "Mở trang hồ sơ chính",
  findSetupNote: "Tìm trong Studio",
  search: "Tìm kiếm",
  searchPlaceholder: "Tìm một trang trong Studio...",
  commandPaletteLabel: "Tìm trang trong Studio",
  closeSearch: "Đóng tìm kiếm",
  openStudio: "Mở Studio",
  closeNavigation: "Đóng menu",
  toggleNavigation: "Ẩn/hiện menu",
  openPreferences: "Mở tùy chỉnh Studio",
  openGithubProfile: "Mở hồ sơ GitHub",
  openAccountMenu: "Mở menu tài khoản",
  routeKicker: {
    legacy: "Bản cũ",
    studio: "Studio"
  },
  routeMetricsLabel: "Tóm tắt trang",
  runtime: {
    loading: "Đang tải không gian Studio…",
    loadErrorTitle: "Không thể tải không gian làm việc",
    loadErrorDetail:
      "Không gian này chưa tải được. Điều hướng và tùy chỉnh vẫn hoạt động.",
    reload: "Tải lại Studio"
  },
  dashboard: {
    workstreamCount: (count) => `${count} luồng công việc`,
    emptyTitle: "Không có luồng công việc phù hợp",
    emptyDescription:
      "Hãy đổi từ khóa hoặc bộ lọc trạng thái để xem các luồng công việc.",
    clearFilters: "Xóa bộ lọc"
  },
  status: {
    ready: "Dùng được",
    draft: "Đang viết",
    next: "Dự kiến"
  },
  categories: {
    all: "Tất cả",
    engineering: "Kỹ thuật",
    content: "Nội dung",
    operations: "Vận hành",
    communication: "Giao tiếp",
    strategy: "Chiến lược",
    learning: "Học tập"
  },
  routes: {
    welcome: {
      title: "Bắt đầu",
      description:
        "Mục lục gọn cho các ghi chú thiết lập, hướng dẫn dùng AI, danh sách kiểm tra và sơ đồ hệ thống tôi thường dùng.",
      panels: ["Chọn nơi cần mở", "Liên kết hữu ích", "Các trang trong Studio"],
      timeline: [
        "Chọn đúng chỗ làm việc",
        "Giữ tài liệu gốc bên cạnh",
        "Kết thúc bằng một kết quả cụ thể"
      ]
    },
    "ai-agent-setup": {
      title: "AI Setup",
      description:
        "Ghi chú về vai trò của từng công cụ AI, cách nối MCP và cách chuẩn bị máy mới an toàn.",
      panels: ["Ghi chú thiết lập", "Cách phối hợp công cụ", "Lệnh cần dùng"],
      timeline: [
        "Kiểm lại thư viện hướng dẫn",
        "Lưu đúng đường cài MCP",
        "Không mang theo thông tin đăng nhập từ máy cũ"
      ]
    },
    "ai-skills": {
      title: "AI Skills",
      description:
        "Những hướng dẫn có thể dùng lại khi nghiên cứu, phản biện, viết và làm việc với mã nguồn bằng các công cụ AI.",
      panels: ["Nhóm công việc", "Nội dung Markdown", "Bản có thể sao chép"],
      timeline: [
        "Kiểm kê hướng dẫn đang có",
        "Nhìn ra phần còn thiếu",
        "Chuẩn bị bản tiếng Anh và tiếng Việt"
      ]
    },
    "delivery-checklists": {
      title: "Engineering Checklists",
      description:
        "Các bước cần kiểm từ lúc hiểu yêu cầu, sửa code, tự review đến khi release an toàn.",
      panels: ["Nhận việc", "Thực hiện thay đổi", "Release và theo dõi"],
      timeline: [
        "Làm rõ yêu cầu",
        "Review từng phần thay đổi",
        "Ghi rõ kế hoạch release và rollback"
      ]
    },
    "flow-system-design": {
      title: "System Design Flow",
      description:
        "Cách đi từ một đề bài còn mơ hồ tới kiến trúc có ranh giới rõ, biết đánh đổi gì và sẽ hỏng ở đâu.",
      panels: [
        "Đóng khung bài toán",
        "Sơ đồ khi vận hành",
        "Tình huống hỏng hóc"
      ],
      timeline: [
        "Làm rõ yêu cầu",
        "Chỉ ra nơi sở hữu dữ liệu",
        "Ghi lại hướng mở rộng về sau"
      ]
    },
    "flow-architecture-decision": {
      title: "Architecture Decision Flow",
      description:
        "Khung RFC/ADR gọn để so sánh phương án, nêu rõ đánh đổi, ngưỡng rủi ro và đường quay lui.",
      panels: ["Phạm vi quyết định", "Bảng so sánh phương án", "Ngưỡng rủi ro"],
      timeline: [
        "Liệt kê điều không được phá vỡ",
        "So sánh các phương án",
        "Hoàn tất biên bản quyết định"
      ]
    },
    "flow-incident-response": {
      title: "Incident Response Flow",
      description:
        "Các bước xác minh, giảm thiệt hại, thông báo, khôi phục và rút kinh nghiệm sau sự cố thật.",
      panels: ["Dấu hiệu", "Giảm thiệt hại", "Rút kinh nghiệm"],
      timeline: [
        "Xác nhận sự cố",
        "Khoanh vùng ảnh hưởng",
        "Giao rõ người xử lý việc còn lại"
      ]
    },
    "flow-release-readiness": {
      title: "Release Readiness Flow",
      description:
        "Cửa kiểm cuối cho scope, dữ liệu, testing, observability và rollback trước khi lên production.",
      panels: ["Phạm vi", "Bằng chứng kiểm tra", "Quyết định phát hành"],
      timeline: [
        "Rà lại scope",
        "Kiểm tra analytics và SEO",
        "Nêu rõ lúc nào phải rollback"
      ]
    },
    "flow-ai-delivery": {
      title: "AI-assisted Delivery Flow",
      description:
        "Cách dùng AI mà vẫn giữ đúng phạm vi, bảo vệ dữ liệu, kiểm thử đầy đủ và để con người chịu trách nhiệm quyết định.",
      panels: ["Đề bài", "Tài liệu cần thiết", "Kiểm chứng"],
      timeline: ["Chốt ranh giới", "Rà đúng phần thay đổi", "Chuẩn bị bàn giao"]
    },
    "flow-portfolio-story": {
      title: "Portfolio Story Flow",
      description:
        "Cách biến một việc kỹ thuật có thật thành câu chuyện cho CV, blog hoặc phỏng vấn mà không thổi phồng đóng góp.",
      panels: ["Bối cảnh", "Đánh đổi", "Kết quả"],
      timeline: [
        "Ghi đủ bối cảnh",
        "Chọn bằng chứng phù hợp",
        "Viết thành câu chuyện rõ ràng"
      ]
    },
    "flow-react-flow-architecture-demo": {
      title: "React Flow Examples",
      description:
        "Bộ ví dụ tương tác về điều hướng, gom nhóm, bố cục, bảng phác thảo và sơ đồ kiến trúc bằng React Flow.",
      panels: ["Chọn ví dụ", "Khám phá sơ đồ", "Xem từng vùng kiến trúc"],
      timeline: [
        "Chọn kiểu sơ đồ",
        "Xem các mối liên hệ",
        "Thử công cụ trên bảng"
      ]
    },
    "flow-react-flow-system-blueprint": {
      title: "System Blueprint",
      description:
        "Sơ đồ chi tiết cho DNS, edge policy, load balancing, storage, media processing, queue và các fan-out service.",
      panels: ["Sơ đồ đầy đủ", "Góc nhìn tập trung", "Thành phần khi vận hành"],
      timeline: [
        "Lần theo đường đi của yêu cầu",
        "Xem tầng chạy và lưu trữ",
        "Theo dõi xử lý media và phân phối dữ liệu"
      ]
    }
  },
  welcome: {
    eyebrow: "Bàn làm việc cá nhân",
    lead: "Tôi gom ở đây những thứ dùng thường xuyên trong công việc kỹ thuật: ghi chú thiết lập, hướng dẫn làm việc với AI, danh sách kiểm tra và sơ đồ hệ thống.",
    note: "Hãy chọn đúng trang cho việc đang làm, kiểm lại tài liệu gốc, rồi kết thúc bằng một quyết định, danh sách, sơ đồ hoặc thay đổi đã được kiểm chứng.",
    studioLinks: "Lối tắt trong Studio",
    publicLinks: "Liên kết trong hồ sơ",
    open: "Mở",
    routeCards: {
      "ai-agent-setup": {
        label: "AI Setup",
        detail:
          "Vai trò của từng công cụ, cách nối MCP và ghi chú chuẩn bị máy mới."
      },
      "ai-skills": {
        label: "AI Skills",
        detail: "Các skill dùng lại cho research, code và review."
      },
      "delivery-checklists": {
        label: "Checklists",
        detail: "Checklist từ lúc nhận task, code, review đến release."
      },
      "flow-react-flow-architecture-demo": {
        label: "React Flow Examples",
        detail:
          "Các React Flow pattern cho architecture diagram, layout, grouping và interaction."
      },
      "flow-react-flow-system-blueprint": {
        label: "System Blueprint",
        detail:
          "System map cho DNS, runtime, storage, media pipeline và fan-out."
      }
    },
    linkCards: {
      home: {
        label: "Trang chủ",
        detail: "Tổng quan hồ sơ cá nhân."
      },
      notes: {
        label: "Ghi chép",
        detail: "Những ghi chép ngắn từ công việc và đời sống."
      },
      blog: {
        label: "Blog",
        detail: "Bài viết dài hơn về kỹ thuật và trải nghiệm."
      },
      apps: {
        label: "Ứng dụng",
        detail: "Công cụ nhỏ và thử nghiệm cá nhân."
      },
      resume: {
        label: "CV",
        detail: "Mở bản CV PDF mới nhất."
      }
    }
  },
  flows: {
    emptyTitle: "Chưa có Flow nào",
    emptyDescription: "Flow đã hoàn thiện sẽ xuất hiện ở đây.",
    menu: "Flow Library",
    menuDetail:
      "Các flow dùng lại cho System Design, release lên production, AI-assisted engineering và xây portfolio.",
    groupMenuLabel: "Nhóm Flow",
    flowListLabel: "Các Flow trong Studio",
    selectedFlow: "Flow đang chọn",
    chartLabel: "Flow chart",
    chartHint:
      "Đọc từ trái sang phải. Mỗi node là một bước xử lý hoặc điểm ra quyết định, kèm evidence và output cần có.",
    chartOutcome: "Kết quả cần đạt",
    exampleFamily: "Example family",
    exampleView: "View",
    exampleSelectorLabel: "Chọn ví dụ React Flow",
    boardTools: "Board tools",
    viewNotes: "View notes",
    useWhen: "Dùng khi",
    outcome: "Kết quả",
    officeExample: "Ví dụ thực tế",
    artifacts: "Artifacts",
    cvSignals: "Portfolio evidence",
    evidence: "Evidence",
    output: "Output",
    shareFlow: "Chia sẻ Flow",
    copied: "Đã sao chép",
    openFlow: "Mở quy trình",
    enterFullscreen: "Mở toàn màn hình",
    exitFullscreen: "Thoát toàn màn hình",
    canvasMode: "Canvas mode",
    inspectMode: "Inspect",
    editMode: "Edit sandbox",
    layoutMode: "Layout",
    layoutSource: "Source",
    layoutHorizontal: "Ngang",
    layoutVertical: "Dọc",
    layoutGrid: "Lưới",
    layoutPreset: "Layout presets",
    layoutPresetSource: "Source",
    layoutPresetCompact: "Compact",
    layoutPresetWide: "Wide",
    layoutPresetTall: "Tall",
    layoutPresetGrid: "Grid",
    applyLayout: "Áp dụng layout",
    resetBoard: "Đặt lại",
    undo: "Hoàn tác",
    redo: "Làm lại",
    copyNode: "Copy node",
    pasteNode: "Paste node",
    addNote: "Thêm ghi chú",
    deleteNode: "Xóa node",
    fitBoard: "Vừa khung nhìn",
    isolate: "Isolate",
    fullGraph: "Full graph",
    upstream: "Upstream",
    current: "Đang chọn",
    downstream: "Downstream",
    trailEmpty: "Chưa có liên kết",
    trailMore: (count) => `+${count} nữa`,
    relationMap: "Relation map",
    nodeDetails: "Node details",
    edgeDetails: "Edge details",
    inspector: "Inspector",
    selectedNode: "Node đang chọn",
    selectedEdge: "Edge đang chọn",
    noSelection: "Chọn một node hoặc edge để xem chi tiết.",
    nodeCount: "Nodes",
    edgeCount: "Edges",
    groupCount: "Groups",
    hiddenCount: "Đang ẩn",
    tags: "Chủ đề của quy trình",
    details: "Thông tin quy trình",
    scratch: "Scratch",
    reviewNote: "Review note",
    temporaryAnnotation: "Ghi chú tạm trong phiên Studio này.",
    nodeLabels: {
      hub: "Hub",
      step: "Step",
      detail: "Detail",
      input: "Input",
      default: "Default",
      output: "Output",
      group: "Group",
      service: "Service",
      gateway: "Gateway",
      database: "Database",
      queue: "Queue",
      topic: "Topic",
      cache: "Cache",
      worker: "Worker",
      external: "External",
      decision: "Decision",
      risk: "Risk",
      note: "Note",
      system: "System",
      source: "Source",
      process: "Process",
      agent: "Agent",
      review: "Review",
      storage: "Storage",
      event: "Event"
    },
    familyLabels: {
      overview: "Overview",
      interaction: "Interaction",
      grouping: "Subflows & Grouping",
      layout: "Layout",
      styling: "Styling",
      whiteboard: "Whiteboard",
      architecture: "Software Architecture"
    },
    collapseGroup: "Thu gọn group",
    expandGroup: "Mở rộng group",
    boardSandbox:
      "Các chỉnh sửa chỉ tồn tại trong session này. Có thể undo hoặc reset bất cứ lúc nào; source diagram không bị thay đổi."
  },
  aiSetup: {
    addNote: "Thêm note",
    setupLibrary: "Setup notes",
    agentSetupNotes: "AI setup notes",
    agentRuntimes: "AI runtimes",
    selectedNote: "Note đang chọn",
    updated: "Cập nhật",
    setupNoteTags: "Chủ đề của ghi chú",
    commandRunbook: "Command runbook",
    commandRunbookDetail:
      "Luôn đối chiếu tài liệu mới nhất trước khi chạy trên máy mới.",
    setupCommands: "Setup commands",
    referenceLinks: "Tài liệu tham khảo",
    aiWorkflow: "AI workflow",
    aiWorkflowDetail:
      "Một đường đi đơn giản từ tài liệu gốc đến kết quả đã được kiểm chứng và có thể dùng lại.",
    setupChecklist: "Setup checklist",
    researchQueue: "Research queue"
  },
  aiSkills: {
    emptyTitle: "Chưa có AI Skill nào",
    emptyDescription: "Skill đã hoàn thiện sẽ xuất hiện ở đây.",
    copyMarkdown: "Sao chép Markdown",
    copied: "Đã sao chép",
    copy: "Sao chép",
    skillLibrary: "Skill Library",
    skillLibraryDetail:
      "Các skill có thể copy thẳng vào một phiên làm việc với AI.",
    categoriesLabel: "Nhóm công việc",
    skillCountLabel: (count) => `${count} skills`,
    selectedSkill: "Skill đang chọn",
    skillTags: "Chủ đề",
    useThisWhen: "Dùng khi",
    copyBehavior: "Nội dung được sao chép",
    copyBehaviorDetail:
      "Nút này copy toàn bộ Markdown, gồm workflow, expected output và guardrails.",
    operatingRule: "Cách dùng",
    operatingRuleDetail:
      "Hãy xem đây là điểm bắt đầu. Vẫn cần nêu rõ phạm vi, cung cấp đúng tài liệu gốc và tự chịu trách nhiệm cho quyết định cuối cùng."
  },
  checklists: {
    emptyTitle: "Chưa có checklist nào",
    emptyDescription: "Checklist đã hoàn thiện sẽ xuất hiện ở đây.",
    copyChecklist: "Copy checklist",
    copied: "Đã sao chép",
    copy: "Sao chép",
    menu: "Checklist Library",
    menuDetail: "Các checklist từ lúc nhận task đến release và rollout.",
    workflowListLabel: "Workflow checklists",
    selectedChecklist: "Checklist đang chọn",
    checklistTags: "Chủ đề",
    sections: "phần",
    steps: "bước",
    whenToUse: "Khi dùng",
    structure: "Cấu trúc",
    structureDetail: (sections, steps) =>
      `${sections} phần, ${steps} bước chi tiết, có thể sao chép dưới dạng Markdown.`,
    markdownCopy: "Bản Markdown",
    markdownUseWhen: "Dùng khi",
    detailsLabel: "Chi tiết checklist"
  },
  preferences: {
    title: "Tùy chỉnh",
    description: "Chọn giao diện, phông chữ và cách trình bày cho Studio.",
    palette: "Giao diện",
    themeMode: "Chế độ màu",
    resolvedNow: "Đang áp dụng",
    font: "Phông chữ",
    pageLayout: "Bề rộng nội dung",
    pageLayoutHelp:
      "Căn giữa dễ đọc hơn. Toàn chiều rộng cho sơ đồ và khu làm việc nhiều chỗ hơn.",
    navbarBehavior: "Thanh công cụ",
    navbarHelp:
      "Cố định để luôn thấy các nút điều khiển. Cuộn để thanh này đi cùng nội dung.",
    sidebarStyle: "Kiểu thanh bên",
    sidebarStyleHelp: "Chọn cách thanh điều hướng nằm cạnh khu làm việc.",
    collapseMode: "Cách thu gọn",
    collapseModeHelp:
      "Biểu tượng giữ lại một dải điều hướng nhỏ. Ẩn hoàn toàn sẽ cất thanh bên trên máy tính.",
    restoreDefaults: "Khôi phục cách trình bày mặc định",
    themeOptions: {
      light: "Sáng",
      system: "Hệ thống",
      dark: "Tối"
    },
    contentLayoutOptions: {
      centered: "Căn giữa",
      "full-width": "Toàn chiều rộng"
    },
    navbarStyleOptions: {
      sticky: "Cố định",
      scroll: "Cuộn theo trang"
    },
    sidebarVariantOptions: {
      inset: "Liền khối",
      sidebar: "Thanh bên",
      floating: "Tách nền"
    },
    sidebarCollapsibleOptions: {
      icon: "Thu còn biểu tượng",
      offcanvas: "Ẩn hoàn toàn"
    }
  }
};
