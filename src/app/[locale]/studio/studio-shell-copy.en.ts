import data from "./studio-shell-copy.en.json";
import { createStudioUiCopy } from "./studio-shell-copy";

export const englishStudioCopy = createStudioUiCopy(data, {
  workstreamCount: (count) => `${count} workstream${count === 1 ? "" : "s"}`,
  trailMore: (count) => `+${count} more`,
  skillCountLabel: (count) => `${count} skills`,
  structureDetail: (sections, steps) =>
    `${sections} sections, ${steps} nested steps, copy-ready as markdown.`
});
