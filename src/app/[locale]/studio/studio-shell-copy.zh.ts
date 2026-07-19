import data from "./studio-shell-copy.zh.json";
import { createStudioUiCopy } from "./studio-shell-copy";

export const chineseStudioCopy = createStudioUiCopy(data, {
  workstreamCount: (count) => `${count} 个工作流`,
  trailMore: (count) => `+${count} more`,
  skillCountLabel: (count) => `${count} skills`,
  structureDetail: (sections, steps) =>
    `${sections} 个部分，${steps} 个嵌套步骤，可复制为 markdown。`
});
