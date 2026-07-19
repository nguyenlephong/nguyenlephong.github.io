"use client";

import { defaultStudioNoteId } from "./studio.data";
import {
  getLocalizedStudioFolders,
  getLocalizedStudioNotes
} from "./studio.localized-workspace";
import StudioAiSetupFeature, {
  type StudioAiWorkflowStep
} from "./StudioAiSetupFeature";
import type { StudioFeatureProps } from "./studio-feature-contract";
import { getLocalizedRouteDefinitions } from "./studio-shell-navigation";

const workflowSteps: StudioAiWorkflowStep[] = [
  { title: "Thu thập nguồn", detail: "Đưa dữ kiện, tài liệu gốc, log và ghi chú vào NotebookLM hoặc một dự án riêng trước khi nhờ AI đưa ra nhận định.", state: "ready" },
  { title: "Làm rõ bài toán", detail: "Dùng GPT để tách mục tiêu, giả định, giới hạn, quyết định cần đưa ra và việc tiếp theo.", state: "active" },
  { title: "Phản biện", detail: "Dùng Claude để soi giả định yếu, rủi ro kiến trúc, trường hợp khó và độ rõ của cách trình bày.", state: "required" },
  { title: "Thực hiện và lưu lại", detail: "Dùng Codex hoặc Antigravity cho phần việc có ranh giới rõ, rồi lưu câu lệnh, kết quả, bằng chứng kiểm tra và bài học.", state: "next" }
];

export default function StudioAiSetupVietnamese(props: StudioFeatureProps) {
  return (
    <StudioAiSetupFeature
      route={getLocalizedRouteDefinitions(props.copy)[props.routeId]}
      locale={props.locale}
      copy={props.copy}
      profileActions={props.profileActions}
      defaultNoteId={defaultStudioNoteId}
      localizedFolders={getLocalizedStudioFolders("vi")}
      localizedNotes={getLocalizedStudioNotes("vi")}
      localizedWorkflowSteps={workflowSteps}
    />
  );
}
