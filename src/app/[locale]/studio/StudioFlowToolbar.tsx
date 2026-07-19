"use client";

import type { IconType } from "react-icons";
import {
  LuArrowUpDown,
  LuClipboardList,
  LuCopy,
  LuMaximize2,
  LuMinimize2,
  LuPlusCircle,
  LuRedo2,
  LuRotateCw,
  LuScanLine,
  LuUndo2,
  LuX
} from "react-icons/lu";
import type { StudioUiCopy } from "./studio-shell-copy";
import type {
  StudioFlowArchitectureDemo,
  StudioFlowArchitectureViewSpec
} from "./studio.data";
import type {
  StudioFlowCanvasMode,
  StudioFlowLayoutMode
} from "./studio-flow-contract";

export type StudioFlowLayoutPreset = {
  mode: StudioFlowLayoutMode;
  label: string;
  icon: IconType;
};

type StudioFlowToolbarProps = {
  demo?: StudioFlowArchitectureDemo;
  selectedView?: StudioFlowArchitectureViewSpec;
  selectedFamily: string;
  selectedFamilyViews: StudioFlowArchitectureViewSpec[];
  familyOptions: { value: string; label: string }[];
  layoutPresetOptions: StudioFlowLayoutPreset[];
  layoutMode: StudioFlowLayoutMode;
  pendingLayoutMode: StudioFlowLayoutMode;
  canvasMode: StudioFlowCanvasMode;
  historyCount: number;
  futureCount: number;
  canCopySelected: boolean;
  canPasteSelected: boolean;
  focusMode: boolean;
  isBoardFullscreen: boolean;
  copy: StudioUiCopy["flows"];
  onFamilySelect: (family: string) => void;
  onViewSelect: (viewId: string) => void;
  onApplyLayout: (mode?: StudioFlowLayoutMode) => void;
  onCanvasModeChange: (mode: StudioFlowCanvasMode) => void;
  onPendingLayoutModeChange: (mode: StudioFlowLayoutMode) => void;
  onFitBoard: () => void;
  onResetBoard: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopyNode: () => void;
  onPasteNode: () => void;
  onAddNote: () => void;
  onDeleteNode: () => void;
  onToggleFocusMode: () => void;
  onToggleFullscreen: () => void;
};

export default function StudioFlowToolbar({
  demo,
  selectedView,
  selectedFamily,
  selectedFamilyViews,
  familyOptions,
  layoutPresetOptions,
  layoutMode,
  pendingLayoutMode,
  canvasMode,
  historyCount,
  futureCount,
  canCopySelected,
  canPasteSelected,
  focusMode,
  isBoardFullscreen,
  copy,
  onFamilySelect,
  onViewSelect,
  onApplyLayout,
  onCanvasModeChange,
  onPendingLayoutModeChange,
  onFitBoard,
  onResetBoard,
  onUndo,
  onRedo,
  onCopyNode,
  onPasteNode,
  onAddNote,
  onDeleteNode,
  onToggleFocusMode,
  onToggleFullscreen
}: StudioFlowToolbarProps) {
  return (
    <div className={`flow-board-toolbar${demo && selectedView ? " has-selectors" : ""}`} aria-label={copy.boardTools}>
      {demo && selectedView && (
        <div className="flow-example-toolbar" aria-label={copy.exampleSelectorLabel}>
          <label>
            <span>{copy.exampleFamily}</span>
            <select value={selectedFamily} onChange={(event) => onFamilySelect(event.target.value)}>
              {familyOptions.map((family) => (
                <option key={family.value} value={family.value}>{family.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{copy.exampleView}</span>
            <select value={selectedView.id} onChange={(event) => onViewSelect(event.target.value)}>
              {selectedFamilyViews.map((view) => (
                <option key={view.id} value={view.id}>{view.title}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="flow-canvas-toolbar" aria-label={copy.boardTools}>
        <div className="flow-layout-presets" aria-label={copy.layoutPreset}>
          {layoutPresetOptions.map((preset) => {
            const PresetIcon = preset.icon;
            return (
              <button
                key={preset.mode}
                type="button"
                className={layoutMode === preset.mode ? "is-active" : ""}
                aria-pressed={layoutMode === preset.mode}
                title={preset.label}
                onClick={() => onApplyLayout(preset.mode)}
              >
                <PresetIcon aria-hidden="true" />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
        <label>
          <span>{copy.canvasMode}</span>
          <select value={canvasMode} onChange={(event) => onCanvasModeChange(event.target.value as StudioFlowCanvasMode)}>
            <option value="inspect">{copy.inspectMode}</option>
            <option value="edit">{copy.editMode}</option>
          </select>
        </label>
        <label>
          <span>{copy.layoutMode}</span>
          <select value={pendingLayoutMode} onChange={(event) => onPendingLayoutModeChange(event.target.value as StudioFlowLayoutMode)}>
            <option value="source">{copy.layoutSource}</option>
            <option value="compact">{copy.layoutPresetCompact}</option>
            <option value="horizontal">{copy.layoutHorizontal}</option>
            <option value="wide">{copy.layoutPresetWide}</option>
            <option value="vertical">{copy.layoutVertical}</option>
            <option value="grid">{copy.layoutGrid}</option>
          </select>
        </label>
        <button type="button" aria-label={copy.applyLayout} title={copy.applyLayout} onClick={() => onApplyLayout()}>
          <LuArrowUpDown aria-hidden="true" /><span>{copy.applyLayout}</span>
        </button>
        <button type="button" aria-label={copy.fitBoard} title={copy.fitBoard} onClick={onFitBoard}>
          <LuScanLine aria-hidden="true" /><span>{copy.fitBoard}</span>
        </button>
        <button type="button" aria-label={copy.resetBoard} title={copy.resetBoard} onClick={onResetBoard}>
          <LuRotateCw aria-hidden="true" /><span>{copy.resetBoard}</span>
        </button>
        <button type="button" aria-label={copy.undo} title={copy.undo} onClick={onUndo} disabled={historyCount === 0}>
          <LuUndo2 aria-hidden="true" /><span>{copy.undo}</span>
        </button>
        <button type="button" aria-label={copy.redo} title={copy.redo} onClick={onRedo} disabled={futureCount === 0}>
          <LuRedo2 aria-hidden="true" /><span>{copy.redo}</span>
        </button>
        <button type="button" aria-label={copy.copyNode} title={copy.copyNode} onClick={onCopyNode} disabled={!canCopySelected}>
          <LuCopy aria-hidden="true" /><span>{copy.copyNode}</span>
        </button>
        <button type="button" aria-label={copy.pasteNode} title={copy.pasteNode} onClick={onPasteNode} disabled={!canPasteSelected}>
          <LuClipboardList aria-hidden="true" /><span>{copy.pasteNode}</span>
        </button>
        <button type="button" aria-label={copy.addNote} title={copy.addNote} onClick={onAddNote}>
          <LuPlusCircle aria-hidden="true" /><span>{copy.addNote}</span>
        </button>
        <button type="button" aria-label={copy.deleteNode} title={copy.deleteNode} onClick={onDeleteNode} disabled={!canCopySelected}>
          <LuX aria-hidden="true" /><span>{copy.deleteNode}</span>
        </button>
      </div>
      <div className="flow-board-actionbar">
        <button
          type="button"
          className="flow-board-fullscreen-button"
          aria-label={focusMode ? copy.fullGraph : copy.isolate}
          disabled={!canCopySelected}
          onClick={onToggleFocusMode}
        >
          {focusMode ? <LuMaximize2 aria-hidden="true" /> : <LuMinimize2 aria-hidden="true" />}
          <span>{focusMode ? copy.fullGraph : copy.isolate}</span>
        </button>
        <button
          type="button"
          className="flow-board-fullscreen-button"
          aria-label={isBoardFullscreen ? copy.exitFullscreen : copy.enterFullscreen}
          onClick={onToggleFullscreen}
        >
          {isBoardFullscreen ? <LuMinimize2 aria-hidden="true" /> : <LuMaximize2 aria-hidden="true" />}
          <span>{isBoardFullscreen ? copy.exitFullscreen : copy.enterFullscreen}</span>
        </button>
      </div>
    </div>
  );
}
