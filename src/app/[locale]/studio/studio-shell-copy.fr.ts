import data from "./studio-shell-copy.fr.json";
import { createStudioUiCopy } from "./studio-shell-copy";

export const frenchStudioCopy = createStudioUiCopy(data, {
  workstreamCount: (count) => `${count} flux de travail`,
  trailMore: (count) => `+${count} more`,
  skillCountLabel: (count) => `${count} skills`,
  structureDetail: (sections, steps) =>
    `${sections} sections, ${steps} étapes imbriquées, copiables en markdown.`
});
