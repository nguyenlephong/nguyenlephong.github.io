import type { StudioAiWorkflowStep } from "./StudioAiSetupFeature";

/** Shared by the interactive AI setup route and its server-rendered page. */
export const studioAiWorkflowStepsByLocale: Record<"en" | "vi", StudioAiWorkflowStep[]> = {
  en: [
    { title: "Capture", detail: "Put facts, source documents, logs, and notes into NotebookLM or a focused Project before asking for judgment.", state: "ready" },
    { title: "Clarify", detail: "Use GPT to separate goal, assumptions, constraints, decision, and next action.", state: "active" },
    { title: "Challenge", detail: "Use Claude to review weak assumptions, architecture risk, edge cases, and communication clarity.", state: "required" },
    { title: "Execute and archive", detail: "Use Codex or Antigravity for bounded work, then save the prompt, artifact, verification, and lesson.", state: "next" }
  ],
  vi: [
    { title: "Thu thập nguồn", detail: "Đưa dữ kiện, tài liệu gốc, log và ghi chú vào NotebookLM hoặc một dự án riêng trước khi nhờ AI đưa ra nhận định.", state: "ready" },
    { title: "Làm rõ bài toán", detail: "Dùng GPT để tách mục tiêu, giả định, giới hạn, quyết định cần đưa ra và việc tiếp theo.", state: "active" },
    { title: "Phản biện", detail: "Dùng Claude để soi giả định yếu, rủi ro kiến trúc, trường hợp khó và độ rõ của cách trình bày.", state: "required" },
    { title: "Thực hiện và lưu lại", detail: "Dùng Codex hoặc Antigravity cho phần việc có ranh giới rõ, rồi lưu câu lệnh, kết quả, bằng chứng kiểm tra và bài học.", state: "next" }
  ]
};
