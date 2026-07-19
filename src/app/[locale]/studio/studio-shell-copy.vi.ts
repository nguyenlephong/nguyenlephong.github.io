import data from "./studio-shell-copy.vi.json";
import { createStudioUiCopy } from "./studio-shell-copy";

export const vietnameseStudioCopy = createStudioUiCopy(data, {
  workstreamCount: (count) => `${count} luồng công việc`,
  trailMore: (count) => `+${count} nữa`,
  skillCountLabel: (count) => `${count} skills`,
  structureDetail: (sections, steps) =>
    `${sections} phần, ${steps} bước chi tiết, có thể sao chép dưới dạng Markdown.`
});
