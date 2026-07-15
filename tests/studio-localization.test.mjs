import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  }).outputText;
  module._compile(output, filename);
};

const data = require("../src/app/[locale]/studio/studio.data.ts");
const localizedContent = require("../src/app/[locale]/studio/studio.localized-content.ts");
const localizedDemos = require("../src/app/[locale]/studio/studio.localized-demos.ts");
const localizedWorkspace = require("../src/app/[locale]/studio/studio.localized-workspace.ts");

function flattenChecklistSteps(checklist) {
  const flattened = [];
  const visit = (sectionId, steps) => {
    for (const step of steps) {
      flattened.push({
        key: `${checklist.id}/${sectionId}/${step.id}`,
        id: step.id,
        label: step.label
      });
      if (step.children) visit(sectionId, step.children);
    }
  };

  for (const section of checklist.sections) visit(section.id, section.steps);
  return flattened;
}

test("Studio English and Vietnamese content preserve structure and contextual meaning", () => {
  const englishSkills = localizedContent.getLocalizedStudioAiSkills("en");
  const vietnameseSkills = localizedContent.getLocalizedStudioAiSkills("vi");
  assert.equal(englishSkills.length, 26);
  assert.equal(vietnameseSkills.length, englishSkills.length);
  assert.deepEqual(vietnameseSkills.map((skill) => skill.id), englishSkills.map((skill) => skill.id));

  for (const skill of englishSkills) {
    assert.equal(skill.markdown.trim().split("\n")[0], `# ${skill.title}`);
  }
  for (const skill of vietnameseSkills) {
    assert.equal(skill.markdown.trim().split("\n")[0], `# ${skill.title}`);
  }
  assert.equal(
    vietnameseSkills.find((skill) => skill.id === "design-system-ui-craft")?.title,
    "Design system và chất lượng UI"
  );

  const englishChecklists = localizedContent.getLocalizedStudioWorkflowChecklists("en");
  const vietnameseChecklists = localizedContent.getLocalizedStudioWorkflowChecklists("vi");
  assert.equal(englishChecklists.length, 14);
  assert.equal(vietnameseChecklists.length, englishChecklists.length);
  assert.deepEqual(vietnameseChecklists.map((checklist) => checklist.id), englishChecklists.map((checklist) => checklist.id));

  const englishSteps = englishChecklists.flatMap(flattenChecklistSteps);
  const vietnameseSteps = vietnameseChecklists.flatMap(flattenChecklistSteps);
  assert.equal(englishSteps.length, 215);
  assert.equal(new Set(englishSteps.map((step) => step.key)).size, englishSteps.length);
  assert.deepEqual(vietnameseSteps.map((step) => step.key), englishSteps.map((step) => step.key));

  const contextualLabels = new Map(vietnameseSteps.map((step) => [step.key, step.label]));
  assert.equal(
    contextualLabels.get("capstone-production-project/feature-set/scope"),
    "Bắt đầu bằng Modular Monolith trước khi tách service."
  );
  assert.equal(
    contextualLabels.get("release-readiness/quality/scope"),
    "Xác nhận phạm vi PR khớp với ticket và không giấu việc dọn dẹp ngoài yêu cầu."
  );
  assert.equal(
    contextualLabels.get("engineering-delivery-checklist/post-rollout/review"),
    "Nhờ AI review sau rollout, gồm kết quả, metric, vấn đề, tác động tới người dùng, technical debt, việc cần làm và bài học."
  );

  const vietnameseNotes = localizedWorkspace.getLocalizedStudioNotes("vi");
  assert.equal(vietnameseNotes.length, data.studioNotes.length);
  assert.deepEqual(vietnameseNotes.map((note) => note.id), data.studioNotes.map((note) => note.id));
  assert.equal(vietnameseNotes[0].title, "Cách tôi phối hợp các công cụ AI");

  const vietnameseFolders = localizedWorkspace.getLocalizedStudioFolders("vi");
  assert.equal(vietnameseFolders.length, data.studioFolders.length);
  assert.equal(vietnameseFolders[0].label, "Chuẩn bị máy mới");
});

test("Vietnamese React Flow demos keep technical labels and localize explanations", () => {
  const englishFlows = localizedContent.getLocalizedStudioFlows("en");
  const vietnameseFlows = localizedDemos.getLocalizedStudioDemoFlows(
    localizedContent.getLocalizedStudioFlows("vi"),
    "vi"
  );

  for (const flowId of ["react-flow-architecture-demo", "react-flow-system-blueprint"]) {
    const englishFlow = englishFlows.find((flow) => flow.id === flowId);
    const vietnameseFlow = vietnameseFlows.find((flow) => flow.id === flowId);
    assert.ok(englishFlow?.architectureDemo);
    assert.ok(vietnameseFlow?.architectureDemo);

    const englishDemo = englishFlow.architectureDemo;
    const vietnameseDemo = vietnameseFlow.architectureDemo;
    assert.deepEqual(vietnameseDemo.views.map((view) => view.id), englishDemo.views.map((view) => view.id));
    assert.deepEqual(vietnameseDemo.nodes.map((node) => node.id), englishDemo.nodes.map((node) => node.id));
    assert.deepEqual(vietnameseDemo.edges.map((edge) => edge.id), englishDemo.edges.map((edge) => edge.id));
    for (let index = 0; index < englishDemo.views.length; index += 1) {
      assert.deepEqual(
        vietnameseDemo.views[index].nodes.map((node) => node.id),
        englishDemo.views[index].nodes.map((node) => node.id)
      );
      assert.deepEqual(
        vietnameseDemo.views[index].edges.map((edge) => edge.id),
        englishDemo.views[index].edges.map((edge) => edge.id)
      );
    }

    assert.notEqual(vietnameseDemo.views[0].title, englishDemo.views[0].title);
    assert.notEqual(vietnameseDemo.views[0].description, englishDemo.views[0].description);
    assert.notEqual(vietnameseDemo.nodes[0].detail, englishDemo.nodes[0].detail);
  }

  const englishNodes = englishFlows.flatMap((flow) => flow.architectureDemo?.views.flatMap((view) => view.nodes) ?? []);
  const vietnameseNodes = vietnameseFlows.flatMap((flow) => flow.architectureDemo?.views.flatMap((view) => view.nodes) ?? []);
  const englishEdges = englishFlows.flatMap((flow) => flow.architectureDemo?.views.flatMap((view) => view.edges) ?? []);
  const vietnameseEdges = vietnameseFlows.flatMap((flow) => flow.architectureDemo?.views.flatMap((view) => view.edges) ?? []);

  assert.equal(englishNodes.find((node) => node.id === "api-gateway")?.title, "API Gateway");
  assert.equal(vietnameseNodes.find((node) => node.id === "api-gateway")?.title, "API Gateway");
  assert.equal(englishNodes.find((node) => node.id === "policy-decision")?.title, "Policy?");
  assert.equal(vietnameseNodes.find((node) => node.id === "policy-decision")?.title, "Chính sách nào?");
  assert.equal(englishNodes.find((node) => node.title === "Receipt")?.title, "Receipt");
  assert.equal(vietnameseNodes.find((node) => node.id === englishNodes.find((item) => item.title === "Receipt")?.id)?.title, "Biên nhận");
  assert.equal(englishEdges.find((edge) => edge.id === "lb-frontend")?.label, "healthy target");
  assert.equal(vietnameseEdges.find((edge) => edge.id === "lb-frontend")?.label, "đích đạt health check");
});
