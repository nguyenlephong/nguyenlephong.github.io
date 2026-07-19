"use client";

import { useState } from "react";
import { LuCheck, LuCommand, LuCopy, LuSparkles } from "react-icons/lu";
import { track } from "@/lib/analytics";
import { RouteHeading } from "./StudioRoutePrimitives";
import type { StudioRoute } from "./studio-route-contract";
import type { StudioUiCopy } from "./studio-shell-copy";
import type { StudioAiSkill } from "./studio.data";

function skillCategoryLabel(category: StudioAiSkill["category"] | "all", copy: StudioUiCopy): string {
  return copy.categories[category];
}

export default function StudioAiSkillsFeature({ route, copy, localizedSkills }: { route: StudioRoute; copy: StudioUiCopy; localizedSkills: StudioAiSkill[] }) {
  const [selectedSkillId, setSelectedSkillId] = useState(localizedSkills[0]?.id ?? "");
  const [categoryFilter, setCategoryFilter] = useState<StudioAiSkill["category"] | "all">("all");
  const [copiedSkillId, setCopiedSkillId] = useState<string | null>(null);
  const visibleSkills = localizedSkills.filter((skill) => categoryFilter === "all" || skill.category === categoryFilter);
  const selectedSkill = localizedSkills.find((skill) => skill.id === selectedSkillId) ?? visibleSkills[0] ?? localizedSkills[0];
  const categories: Array<StudioAiSkill["category"] | "all"> = [
    "all",
    "strategy",
    "learning",
    "engineering",
    "content",
    "operations",
    "communication"
  ];

  const handleCategoryFilter = (category: StudioAiSkill["category"] | "all") => {
    const nextVisibleSkills = localizedSkills.filter((skill) => category === "all" || skill.category === category);
    setCategoryFilter(category);
    if (!nextVisibleSkills.some((skill) => skill.id === selectedSkillId)) {
      setSelectedSkillId(nextVisibleSkills[0]?.id ?? selectedSkillId);
    }
    track("studio_ai_skill_filter", {
      category,
      result_count: nextVisibleSkills.length
    });
  };

  const handleSkillSelect = (skill: StudioAiSkill) => {
    setSelectedSkillId(skill.id);
    track("studio_ai_skill_select", {
      skill_id: skill.id,
      category: skill.category
    });
  };

  const copySkill = async () => {
    if (!selectedSkill) return;

    try {
      await navigator.clipboard.writeText(selectedSkill.markdown);
      setCopiedSkillId(selectedSkill.id);
      window.setTimeout(() => setCopiedSkillId(null), 1600);
      track("studio_ai_skill_copy", {
        skill_id: selectedSkill.id,
        category: selectedSkill.category,
        markdown_length: selectedSkill.markdown.length
      });
    } catch {
      track("studio_ai_skill_copy", {
        skill_id: selectedSkill.id,
        category: selectedSkill.category,
        failed: true
      });
    }
  };

  if (!selectedSkill) {
    return (
      <section className="empty-route card">
        <LuSparkles aria-hidden="true" />
        <strong>{copy.aiSkills.emptyTitle}</strong>
        <p>{copy.aiSkills.emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="route-page ai-skills-route">
      <RouteHeading route={route} copy={copy}>
        <button type="button" className="outline-button" onClick={copySkill}>
          {copiedSkillId === selectedSkill.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
          {copiedSkillId === selectedSkill.id ? copy.aiSkills.copied : copy.aiSkills.copyMarkdown}
        </button>
      </RouteHeading>

      <div className="skill-library-workbench card" data-studio-module="ai-skills">
        <aside className="skill-index-pane" aria-label={copy.aiSkills.skillLibrary}>
          <div className="ai-pane-head">
            <span><LuCommand aria-hidden="true" /></span>
            <div>
              <h2>{copy.aiSkills.skillLibrary}</h2>
              <p>{copy.aiSkills.skillLibraryDetail}</p>
            </div>
          </div>

          <div className="skill-filter-control">
            <label htmlFor="ai-skill-category-filter">{copy.aiSkills.categoriesLabel}</label>
            <select
              id="ai-skill-category-filter"
              value={categoryFilter}
              onChange={(event) => handleCategoryFilter(event.currentTarget.value as StudioAiSkill["category"] | "all")}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {skillCategoryLabel(category, copy)}
                </option>
              ))}
            </select>
            <span>{copy.aiSkills.skillCountLabel(visibleSkills.length)}</span>
          </div>

          <div className="skill-list">
            {visibleSkills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                className={`skill-list-button${selectedSkill.id === skill.id ? " is-active" : ""}`}
                onClick={() => handleSkillSelect(skill)}
              >
                <em>{skillCategoryLabel(skill.category, copy)}</em>
                <span>
                  <strong>{skill.title}</strong>
                  <small>{skill.summary}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <article className="skill-reader-pane" aria-label={copy.aiSkills.selectedSkill}>
          <div className="skill-reader-head">
            <div>
              <span className="ai-status-pill status-ready">{skillCategoryLabel(selectedSkill.category, copy)}</span>
              <h2>{selectedSkill.title}</h2>
              <div className="skill-use-case">
                <strong>{copy.aiSkills.useThisWhen}</strong>
                <p>{selectedSkill.summary}</p>
              </div>
            </div>
            <button type="button" className="outline-button" onClick={copySkill}>
              {copiedSkillId === selectedSkill.id ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
              {copiedSkillId === selectedSkill.id ? copy.aiSkills.copied : copy.aiSkills.copy}
            </button>
          </div>

          <div className="ai-tag-list" aria-label={copy.aiSkills.skillTags}>
            {selectedSkill.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <pre className="skill-markdown-preview"><code>{selectedSkill.markdown}</code></pre>
        </article>
      </div>
    </section>
  );
}
