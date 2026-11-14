import data from "./studio-shell-copy.ko.json";
import { createStudioUiCopy } from "./studio-shell-copy";

export const koreanStudioCopy = createStudioUiCopy(data, {
  trailMore: (count) => `+${count} more`,
  skillCountLabel: (count) => `${count} skills`,
  structureDetail: (sections, steps) =>
    `${sections}개 섹션, ${steps}개 중첩 단계, markdown 복사 가능.`
});
