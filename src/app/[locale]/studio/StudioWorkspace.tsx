"use client";

import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  LuActivity,
  LuBookOpen,
  LuBrainCircuit,
  LuCheck,
  LuChevronRight,
  LuClipboard,
  LuCommand,
  LuExternalLink,
  LuFileText,
  LuFilter,
  LuLaptop,
  LuLayers,
  LuLink,
  LuListChecks,
  LuPalette,
  LuRotateCcw,
  LuSearch,
  LuSparkles,
  LuTerminal,
  LuX
} from "react-icons/lu";
import {
  defaultStudioNoteId,
  studioCapturedAt,
  studioFolders,
  studioNotes,
  type StudioFolder,
  type StudioNote,
  type StudioNoteStatus
} from "./studio.data";

type StudioWorkspaceProps = {
  locale: string;
};

type StatusFilter = "all" | StudioNoteStatus;

const folderIcons = {
  brain: LuBrainCircuit,
  laptop: LuLaptop,
  terminal: LuTerminal,
  palette: LuPalette,
  book: LuBookOpen
} satisfies Record<StudioFolder["icon"], IconType>;

const copy = {
  vi: {
    workspaceLabel: "Không gian ghi chú Studio",
    eyebrow: "Studio · Bàn làm việc hằng ngày",
    title: "Một bàn làm việc gọn cho setup, AI và learning notes.",
    intro:
      "Trang này giữ những lệnh, checklist và nguồn tham khảo mình muốn mở lại thường xuyên khi chuyển máy, thử tool mới hoặc gom lại một workflow đang học.",
    snapshot: "Ảnh chụp",
    metricsLabel: "Chỉ số Studio",
    metrics: {
      notes: "Ghi chú",
      ready: "Sẵn sàng",
      commands: "Lệnh",
      links: "Nguồn"
    },
    searchLabel: "Tìm ghi chú Studio",
    searchPlaceholder: "Tìm setup, AI, terminal...",
    clearSearch: "Xoá tìm kiếm",
    statusFilter: "Lọc theo trạng thái note",
    statusLabel: "Trạng thái",
    folderNav: "Thư mục Studio",
    noFolderMatches: "Không có note khớp filter này.",
    activeFolder: "Thư mục",
    noteIndex: "Danh sách note",
    visibleNotes: "đang hiện",
    emptyTitle: "Không có note khớp.",
    emptyBody: "Thử đổi status hoặc tìm bằng một từ khoá khác.",
    reset: "Xoá lọc",
    actionRail: "Hành động Studio",
    sectionsTitle: "Nội dung",
    commandsTitle: "Lệnh",
    linksTitle: "Nguồn",
    checklistTitle: "Checklist",
    noCommands: "Note này chưa có command.",
    noLinks: "Note này chưa có source link.",
    noChecklist: "Note này chưa có checklist.",
    copyCommand: "Copy lệnh",
    copied: "Đã copy",
    status: {
      all: "Tất cả",
      ready: "Sẵn sàng",
      draft: "Nháp",
      next: "Tiếp"
    }
  },
  en: {
    workspaceLabel: "Studio notes workspace",
    eyebrow: "Studio · Daily workbench",
    title: "A focused desk for setup, AI, and learning notes.",
    intro:
      "This page keeps the commands, checklists, and source links I want close when I move machines, try a new tool, or return to a workflow I am studying.",
    snapshot: "Snapshot",
    metricsLabel: "Studio metrics",
    metrics: {
      notes: "Notes",
      ready: "Ready",
      commands: "Commands",
      links: "Links"
    },
    searchLabel: "Search studio notes",
    searchPlaceholder: "Search setup, AI, terminal...",
    clearSearch: "Clear search",
    statusFilter: "Filter by note status",
    statusLabel: "Status",
    folderNav: "Studio folders",
    noFolderMatches: "No notes match this filter.",
    activeFolder: "Active folder",
    noteIndex: "Note index",
    visibleNotes: "visible",
    emptyTitle: "No matching notes.",
    emptyBody: "Try another status or search term.",
    reset: "Reset filters",
    actionRail: "Studio actions",
    sectionsTitle: "Notes",
    commandsTitle: "Commands",
    linksTitle: "Sources",
    checklistTitle: "Checklist",
    noCommands: "This note does not have commands yet.",
    noLinks: "This note does not have source links yet.",
    noChecklist: "This note does not have a checklist yet.",
    copyCommand: "Copy command",
    copied: "Copied",
    status: {
      all: "All",
      ready: "Ready",
      draft: "Draft",
      next: "Next"
    }
  }
} as const;

function getCopy(locale: string) {
  return locale === "vi" ? copy.vi : copy.en;
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values));
}

function getFolderNoteIds(folder: StudioFolder): string[] {
  return uniqueValues(folder.groups.flatMap((group) => group.noteIds));
}

function getFolderNotes(folder: StudioFolder): StudioNote[] {
  const ids = getFolderNoteIds(folder);
  return ids
    .map((id) => studioNotes.find((note) => note.id === id))
    .filter((note): note is StudioNote => Boolean(note));
}

function noteMatchesQuery(note: StudioNote, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    note.title,
    note.subtitle,
    note.summary,
    note.status,
    note.updatedAt,
    ...note.tags,
    ...note.sections.flatMap((section) => [section.heading, section.body]),
    ...(note.commands?.flatMap((command) => [
      command.label,
      command.command,
      command.note ?? ""
    ]) ?? []),
    ...(note.links?.flatMap((link) => [link.label, link.href, link.note ?? ""]) ?? []),
    ...(note.checklist?.flatMap((item) => [item.label, item.detail ?? ""]) ?? [])
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function noteMatchesStatus(note: StudioNote, status: StatusFilter): boolean {
  return status === "all" || note.status === status;
}

function noteMatchesFilters(note: StudioNote, query: string, status: StatusFilter): boolean {
  return noteMatchesQuery(note, query) && noteMatchesStatus(note, status);
}

function getInitialNoteId(): string {
  if (typeof window === "undefined") return defaultStudioNoteId;
  const idFromHash = window.location.hash.replace("#", "");
  return studioNotes.some((note) => note.id === idFromHash)
    ? idFromHash
    : defaultStudioNoteId;
}

function getFolderForNote(noteId: string, preferredFolderId?: string): StudioFolder | undefined {
  const preferredFolder = studioFolders.find(
    (folder) => folder.id === preferredFolderId && getFolderNoteIds(folder).includes(noteId)
  );
  if (preferredFolder) return preferredFolder;

  const note = studioNotes.find((item) => item.id === noteId);
  if (note) {
    const canonicalFolder = studioFolders.find((folder) => folder.id === note.folderId);
    if (canonicalFolder) return canonicalFolder;
  }

  return studioFolders.find((folder) => getFolderNoteIds(folder).includes(noteId));
}

function writeHash(noteId: string): void {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", `#${noteId}`);
}

function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}

export default function StudioWorkspace({ locale }: StudioWorkspaceProps) {
  const t = getCopy(locale);
  const initialNoteId = getInitialNoteId();
  const initialFolder = getFolderForNote(initialNoteId) ?? studioFolders[0];
  const [selectedNoteId, setSelectedNoteId] = useState(initialNoteId);
  const [activeFolderId, setActiveFolderId] = useState(initialFolder?.id ?? "");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const visibleNotes = useMemo(
    () => studioNotes.filter((note) => noteMatchesFilters(note, query, status)),
    [query, status]
  );

  const selectedFolder =
    studioFolders.find((folder) => folder.id === activeFolderId) ?? studioFolders[0];

  const selectedFolderNotes = useMemo(() => {
    if (!selectedFolder) return [];
    return getFolderNotes(selectedFolder).filter((note) => noteMatchesFilters(note, query, status));
  }, [query, selectedFolder, status]);

  const selectedNote =
    visibleNotes.find((note) => note.id === selectedNoteId) ??
    selectedFolderNotes[0] ??
    visibleNotes[0] ??
    studioNotes.find((note) => note.id === selectedNoteId) ??
    studioNotes[0];

  const hasResults = visibleNotes.length > 0;

  const stats = useMemo(() => {
    const commandCount = studioNotes.reduce(
      (total, note) => total + (note.commands?.length ?? 0),
      0
    );
    const linkCount = studioNotes.reduce((total, note) => total + (note.links?.length ?? 0), 0);
    return [
      { label: t.metrics.notes, value: String(studioNotes.length), icon: LuFileText },
      {
        label: t.metrics.ready,
        value: String(studioNotes.filter((note) => note.status === "ready").length),
        icon: LuActivity
      },
      { label: t.metrics.commands, value: String(commandCount), icon: LuCommand },
      { label: t.metrics.links, value: String(linkCount), icon: LuLink }
    ] satisfies Array<{ label: string; value: string; icon: IconType }>;
  }, [t.metrics.commands, t.metrics.links, t.metrics.notes, t.metrics.ready]);

  const statusOptions = useMemo(
    () =>
      [
        { value: "all", label: t.status.all },
        { value: "ready", label: t.status.ready },
        { value: "draft", label: t.status.draft },
        { value: "next", label: t.status.next }
      ] satisfies Array<{ value: StatusFilter; label: string }>,
    [t.status.all, t.status.draft, t.status.next, t.status.ready]
  );

  useEffect(() => {
    const onHashChange = () => {
      const noteId = getInitialNoteId();
      const folder = getFolderForNote(noteId, activeFolderId);
      setSelectedNoteId(noteId);
      if (folder) setActiveFolderId(folder.id);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [activeFolderId]);

  if (!selectedFolder || !selectedNote) return null;

  const selectNote = (noteId: string, folderId = activeFolderId) => {
    setSelectedNoteId(noteId);
    const folder = getFolderForNote(noteId, folderId);
    if (folder) setActiveFolderId(folder.id);
    writeHash(noteId);
  };

  const selectFolder = (folder: StudioFolder) => {
    setActiveFolderId(folder.id);
    const firstVisibleNote =
      getFolderNotes(folder).find((note) => noteMatchesFilters(note, query, status)) ??
      getFolderNotes(folder)[0];
    if (firstVisibleNote) {
      setSelectedNoteId(firstVisibleNote.id);
      writeHash(firstVisibleNote.id);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
  };

  const copyCommand = async (command: string) => {
    let didCopy = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
        didCopy = true;
      }
    } catch {
      didCopy = false;
    }

    if (!didCopy) didCopy = fallbackCopy(command);
    if (!didCopy) return;

    setCopiedCommand(command);
    window.setTimeout(() => setCopiedCommand(null), 1600);
  };

  return (
    <section className="studio-workbench" aria-label={t.workspaceLabel}>
      <header className="studio-topbar">
        <div className="studio-topbar__copy">
          <p className="studio-eyebrow">
            <LuSparkles aria-hidden="true" />
            {t.eyebrow}
          </p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>

        <div className="studio-snapshot" aria-label={`${t.snapshot} ${studioCapturedAt}`}>
          <span>{t.snapshot}</span>
          <strong>{studioCapturedAt}</strong>
        </div>
      </header>

      <div className="studio-metrics" aria-label={t.metricsLabel}>
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div className="studio-metric" key={item.label}>
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          );
        })}
      </div>

      <div className="studio-shell">
        <aside className="studio-sidebar" aria-label={t.folderNav}>
          <label className="studio-search">
            <LuSearch aria-hidden="true" />
            <span className="sr-only">{t.searchLabel}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
            />
            {query && (
              <button
                type="button"
                className="studio-search__clear"
                onClick={() => setQuery("")}
                aria-label={t.clearSearch}
              >
                <LuX aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="studio-status-filter" aria-label={t.statusFilter}>
            <div className="studio-status-filter__label">
              <LuFilter aria-hidden="true" />
              <span>{t.statusLabel}</span>
            </div>
            <div className="studio-status-filter__buttons">
              {statusOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={option.value === status ? "is-active" : ""}
                  onClick={() => setStatus(option.value)}
                  aria-pressed={option.value === status}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <nav className="studio-folder-nav" aria-label={t.folderNav}>
            {studioFolders.map((folder) => {
              const Icon = folderIcons[folder.icon];
              const activeFolder = folder.id === selectedFolder.id;
              const visibleCount = getFolderNotes(folder).filter((note) =>
                noteMatchesFilters(note, query, status)
              ).length;

              return (
                <div
                  className={`studio-folder${activeFolder ? " studio-folder--active" : ""}`}
                  key={folder.id}
                >
                  <button
                    type="button"
                    className="studio-folder__button"
                    onClick={() => selectFolder(folder)}
                    aria-current={activeFolder ? "page" : undefined}
                    aria-expanded={activeFolder}
                  >
                    <Icon aria-hidden="true" />
                    <span className="studio-folder__text">
                      <strong>{folder.label}</strong>
                      <small>{folder.subtitle}</small>
                    </span>
                    <span className="studio-folder__count">{visibleCount}</span>
                    <LuChevronRight aria-hidden="true" />
                  </button>

                  {activeFolder && (
                    <div className="studio-submenu">
                      {folder.groups.map((group) => {
                        const groupNotes = group.noteIds
                          .map((noteId) => studioNotes.find((item) => item.id === noteId))
                          .filter((note): note is StudioNote => Boolean(note))
                          .filter((note) => noteMatchesFilters(note, query, status));

                        return (
                          <div className="studio-submenu__group" key={group.label}>
                            <p>{group.label}</p>
                            {groupNotes.length > 0 ? (
                              groupNotes.map((note) => (
                                <button
                                  type="button"
                                  key={note.id}
                                  className={
                                    note.id === selectedNote.id
                                      ? "studio-submenu__item studio-submenu__item--active"
                                      : "studio-submenu__item"
                                  }
                                  onClick={() => selectNote(note.id, folder.id)}
                                  aria-current={note.id === selectedNote.id ? "true" : undefined}
                                >
                                  <span>{note.title}</span>
                                  <small className={`studio-status studio-status--${note.status}`}>
                                    {t.status[note.status]}
                                  </small>
                                </button>
                              ))
                            ) : (
                              <span className="studio-submenu__empty">{t.noFolderMatches}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <aside className="studio-index" aria-label={t.noteIndex}>
          <div className="studio-index__header">
            <span>{t.activeFolder}</span>
            <strong>{selectedFolder.label}</strong>
            <small>
              {selectedFolderNotes.length} {t.visibleNotes}
            </small>
          </div>

          <div className="studio-index__items">
            {selectedFolderNotes.length > 0 ? (
              selectedFolderNotes.map((note) => (
                <button
                  type="button"
                  key={note.id}
                  className={
                    note.id === selectedNote.id
                      ? "studio-note-card studio-note-card--active"
                      : "studio-note-card"
                  }
                  onClick={() => selectNote(note.id, selectedFolder.id)}
                  aria-current={note.id === selectedNote.id ? "true" : undefined}
                >
                  <span className={`studio-status studio-status--${note.status}`}>
                    {t.status[note.status]}
                  </span>
                  <strong>{note.title}</strong>
                  <small>{note.subtitle}</small>
                  <span className="studio-note-card__date">{note.updatedAt}</span>
                </button>
              ))
            ) : (
              <div className="studio-index__empty">
                <strong>{t.emptyTitle}</strong>
                <p>{t.emptyBody}</p>
                <button type="button" onClick={resetFilters}>
                  <LuRotateCcw aria-hidden="true" />
                  {t.reset}
                </button>
              </div>
            )}
          </div>
        </aside>

        {hasResults ? (
          <article className="studio-reader" aria-live="polite">
            <header className="studio-reader__header">
              <div>
                <p className="studio-reader__folder">{selectedFolder.label}</p>
                <h2>{selectedNote.title}</h2>
                <p>{selectedNote.summary}</p>
              </div>
              <span className={`studio-status studio-status--${selectedNote.status}`}>
                {t.status[selectedNote.status]}
              </span>
            </header>

            <div className="studio-note-tags" aria-label="Note tags">
              {selectedNote.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="studio-reader__sections" aria-label={t.sectionsTitle}>
              {selectedNote.sections.map((section) => (
                <section className="studio-note-section" key={section.heading}>
                  <h3>{section.heading}</h3>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>
          </article>
        ) : (
          <section className="studio-reader studio-reader--empty" aria-live="polite">
            <div>
              <LuSearch aria-hidden="true" />
              <h2>{t.emptyTitle}</h2>
              <p>{t.emptyBody}</p>
              <button type="button" onClick={resetFilters}>
                <LuRotateCcw aria-hidden="true" />
                {t.reset}
              </button>
            </div>
          </section>
        )}

        <aside className="studio-rail" aria-label={t.actionRail}>
          <section className="studio-rail__section">
            <div className="studio-panel-heading">
              <LuCommand aria-hidden="true" />
              <h3>{t.commandsTitle}</h3>
            </div>
            {selectedNote.commands && selectedNote.commands.length > 0 ? (
              <div className="studio-command-stack">
                {selectedNote.commands.map((item) => (
                  <div className="studio-command" key={item.command}>
                    <div>
                      <strong>{item.label}</strong>
                      {item.note && <p>{item.note}</p>}
                      <code>{item.command}</code>
                    </div>
                    <button
                      type="button"
                      className="studio-icon-button"
                      onClick={() => copyCommand(item.command)}
                      aria-label={`${t.copyCommand}: ${item.label}`}
                      title={copiedCommand === item.command ? t.copied : t.copyCommand}
                    >
                      {copiedCommand === item.command ? (
                        <LuCheck aria-hidden="true" />
                      ) : (
                        <LuClipboard aria-hidden="true" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="studio-panel-empty">{t.noCommands}</p>
            )}
          </section>

          <section className="studio-rail__section">
            <div className="studio-panel-heading">
              <LuExternalLink aria-hidden="true" />
              <h3>{t.linksTitle}</h3>
            </div>
            {selectedNote.links && selectedNote.links.length > 0 ? (
              <div className="studio-link-stack">
                {selectedNote.links.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                    <span>
                      <strong>{link.label}</strong>
                      {link.note && <small>{link.note}</small>}
                    </span>
                    <LuExternalLink aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="studio-panel-empty">{t.noLinks}</p>
            )}
          </section>

          <section className="studio-rail__section">
            <div className="studio-panel-heading">
              <LuListChecks aria-hidden="true" />
              <h3>{t.checklistTitle}</h3>
            </div>
            {selectedNote.checklist && selectedNote.checklist.length > 0 ? (
              <ul className="studio-check-list">
                {selectedNote.checklist.map((item) => (
                  <li key={item.label}>
                    <span className={item.checked ? "is-checked" : ""}>
                      {item.checked ? <LuCheck aria-hidden="true" /> : null}
                    </span>
                    <div>
                      <strong>{item.label}</strong>
                      {item.detail && <p>{item.detail}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="studio-panel-empty">{t.noChecklist}</p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
