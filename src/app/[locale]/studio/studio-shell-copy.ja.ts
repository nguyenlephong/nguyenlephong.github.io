import data from "./studio-shell-copy.ja.json";
import { createStudioUiCopy } from "./studio-shell-copy";

export const japaneseStudioCopy = createStudioUiCopy(data, {
  workstreamCount: (count) => `${count} 件のワークストリーム`,
  trailMore: (count) => `+${count} more`,
  skillCountLabel: (count) => `${count} skills`,
  structureDetail: (sections, steps) =>
    `${sections} セクション、${steps} 個のネストされたステップ。markdown としてコピーできます。`
});
