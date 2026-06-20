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
  LuGithub,
  LuLaptop,
  LuLayers,
  LuLayoutDashboard,
  LuLink,
  LuListChecks,
  LuMenu,
  LuPalette,
  LuRotateCcw,
  LuSearch,
  LuSettings2,
  LuSparkles,
  LuTerminal,
  LuX
} from "react-icons/lu";
import { ShadowIsland } from "@/components/studio-kit";
import {
  defaultStudioNoteId,
  studioCapturedAt,
  studioFolders,
  studioNotes,
  type StudioFolder,
  type StudioNote,
  type StudioNoteStatus
} from "./studio.data";
import { studioShadowStyles } from "./studio.shadow-styles";

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
    title: "Một workspace cho setup, AI và learning notes.",
    intro:
      "Trang này giữ những lệnh, checklist và nguồn tham khảo mình muốn mở lại thường xuyên khi chuyển máy, thử tool mới hoặc gom lại một workflow đang học.",
    snapshot: "Ảnh chụp",
    metrics: {
      notes: "Ghi chú",
      ready: "Sẵn sàng",
      commands: "Lệnh",
      links: "Nguồn"
    },
    searchLabel: "Tìm ghi chú Studio",
    searchPlaceholder: "Tìm setup, AI, terminal...",
    clearSearch: "Xoá tìm kiếm",
    statusFilter: "Trạng thái",
    folderNav: "Workspace",
    noFolderMatches: "Không có note khớp filter này.",
    commandMenu: "Command",
    layout: "Layout",
    source: "Source",
    updated: "Updated",
    visibleNotes: "note đang hiện",
    emptyTitle: "Không có note khớp.",
    emptyBody: "Thử đổi status hoặc tìm bằng một từ khoá khác.",
    reset: "Xoá lọc",
    sectionsTitle: "Nội dung",
    commandsTitle: "Commands",
    linksTitle: "Sources",
    checklistTitle: "Checklist",
    noCommands: "Note này chưa có command.",
    noLinks: "Note này chưa có source link.",
    noChecklist: "Note này chưa có checklist.",
    copyCommand: "Copy lệnh",
    copied: "Đã copy",
    supportTitle: "Studio Kit",
    supportBody: "Shadow DOM island dựa trên layout admin dashboard nguồn, giữ CSS tách khỏi site chính.",
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
    title: "A workspace for setup, AI, and learning notes.",
    intro:
      "This page keeps the commands, checklists, and source links I want close when I move machines, try a new tool, or return to a workflow I am studying.",
    snapshot: "Snapshot",
    metrics: {
      notes: "Notes",
      ready: "Ready",
      commands: "Commands",
      links: "Sources"
    },
    searchLabel: "Search studio notes",
    searchPlaceholder: "Search setup, AI, terminal...",
    clearSearch: "Clear search",
    statusFilter: "Status",
    folderNav: "Workspace",
    noFolderMatches: "No notes match this filter.",
    commandMenu: "Command",
    layout: "Layout",
    source: "Source",
    updated: "Updated",
    visibleNotes: "visible notes",
    emptyTitle: "No matching notes.",
    emptyBody: "Try another status or search term.",
    reset: "Reset filters",
    sectionsTitle: "Notes",
    commandsTitle: "Commands",
    linksTitle: "Sources",
    checklistTitle: "Checklist",
    noCommands: "This note does not have commands yet.",
    noLinks: "This note does not have source links yet.",
    noChecklist: "This note does not have a checklist yet.",
    copyCommand: "Copy command",
    copied: "Copied",
    supportTitle: "Studio Kit",
    supportBody: "Shadow DOM island based on the source admin dashboard layout, keeping CSS away from the public site shell.",
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

function StudioAdminApp({ locale }: StudioWorkspaceProps) {
  const t = getCopy(locale);
  const initialNoteId = getInitialNoteId();
  const initialFolder = getFolderForNote(initialNoteId) ?? studioFolders[0];
  const [selectedNoteId, setSelectedNoteId] = useState(initialNoteId);
  const [activeFolderId, setActiveFolderId] = useState(initialFolder?.id ?? "");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const visibleNotes = useMemo(
    () => studioNotes.filter((note) => noteMatchesFilters(note, query, status)),
    [query, status]
  );

  const selectedFolder =
    studioFolders.find((folder) => folder.id === activeFolderId) ?? studioFolders[0];

  const selectedNote =
    visibleNotes.find((note) => note.id === selectedNoteId) ??
    visibleNotes[0] ??
    studioNotes.find((note) => note.id === selectedNoteId) ??
    studioNotes[0];

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
    setMobileSidebarOpen(false);
  };

  const selectFolder = (folder: StudioFolder) => {
    setActiveFolderId(folder.id);
    const firstVisibleNote =
      getFolderNotes(folder).find((note) => noteMatchesFilters(note, query, status)) ??
      getFolderNotes(folder)[0];
    if (firstVisibleNote) selectNote(firstVisibleNote.id, folder.id);
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

  const hasResults = visibleNotes.length > 0;

  return (
    <div className={`admin-root${mobileSidebarOpen ? " sidebar-open" : ""}`}>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close sidebar"
        onClick={() => setMobileSidebarOpen(false)}
      />
      <div className="admin-shell">
        <aside className="admin-sidebar" aria-label={t.folderNav}>
          <div className="sidebar-brand">
            <span className="brand-mark">
              <LuLayoutDashboard aria-hidden="true" />
            </span>
            <span className="brand-copy">
              <strong>Studio</strong>
              <span>{t.folderNav}</span>
            </span>
          </div>

          <label className="sidebar-search">
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
                className="icon-button"
                onClick={() => setQuery("")}
                aria-label={t.clearSearch}
              >
                <LuX aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="sidebar-scroll">
            <section className="nav-section" aria-label={t.statusFilter}>
              <div className="nav-section-title">
                <LuFilter aria-hidden="true" />
                {t.statusFilter}
              </div>
              <div className="status-segments">
                {statusOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`segment-button${option.value === status ? " is-active" : ""}`}
                    onClick={() => setStatus(option.value)}
                    aria-pressed={option.value === status}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="nav-section" aria-label={t.folderNav}>
              <div className="nav-section-title">
                <LuLayers aria-hidden="true" />
                {t.folderNav}
              </div>
              <div className="folder-list">
                {studioFolders.map((folder) => {
                  const Icon = folderIcons[folder.icon];
                  const activeFolder = folder.id === selectedFolder.id;
                  const visibleCount = getFolderNotes(folder).filter((note) =>
                    noteMatchesFilters(note, query, status)
                  ).length;

                  return (
                    <div className={`folder${activeFolder ? " is-active" : ""}`} key={folder.id}>
                      <button
                        type="button"
                        className="folder-button"
                        onClick={() => selectFolder(folder)}
                        aria-current={activeFolder ? "page" : undefined}
                        aria-expanded={activeFolder}
                      >
                        <Icon aria-hidden="true" />
                        <span className="folder-text">
                          <strong>{folder.label}</strong>
                          <span>{folder.subtitle}</span>
                        </span>
                        <span className="count-pill">{visibleCount}</span>
                        <LuChevronRight aria-hidden="true" />
                      </button>

                      {activeFolder && (
                        <div className="folder-groups">
                          {folder.groups.map((group) => {
                            const groupNotes = group.noteIds
                              .map((noteId) => studioNotes.find((item) => item.id === noteId))
                              .filter((note): note is StudioNote => Boolean(note))
                              .filter((note) => noteMatchesFilters(note, query, status));

                            return (
                              <div className="folder-group" key={group.label}>
                                <p className="folder-group-title">{group.label}</p>
                                {groupNotes.length > 0 ? (
                                  groupNotes.map((note) => (
                                    <button
                                      type="button"
                                      key={note.id}
                                      className={`note-button${
                                        note.id === selectedNote.id ? " is-active" : ""
                                      }`}
                                      onClick={() => selectNote(note.id, folder.id)}
                                      aria-current={
                                        note.id === selectedNote.id ? "true" : undefined
                                      }
                                    >
                                      <span>
                                        <strong>{note.title}</strong>
                                        <small>{note.subtitle}</small>
                                      </span>
                                      <span className={`status-pill status-${note.status}`}>
                                        {t.status[note.status]}
                                      </span>
                                    </button>
                                  ))
                                ) : (
                                  <span className="folder-text">
                                    <span>{t.noFolderMatches}</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="sidebar-footer">
            <div className="support-card">
              <strong>{t.supportTitle}</strong>
              <p>{t.supportBody}</p>
            </div>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div className="topbar-left">
              <button
                type="button"
                className="topbar-button"
                aria-label={t.commandMenu}
                onClick={() => setMobileSidebarOpen(true)}
              >
                <LuMenu aria-hidden="true" />
              </button>
              <span className="topbar-divider" aria-hidden="true" />
              <span className="topbar-search">
                <LuSearch aria-hidden="true" />
                {query || selectedNote.title}
              </span>
            </div>
            <div className="topbar-actions">
              <button type="button" className="topbar-button">
                <LuSettings2 aria-hidden="true" />
                {t.layout}
              </button>
              <a
                className="topbar-button"
                href="https://github.com/arhamkhnz/next-shadcn-admin-dashboard"
                target="_blank"
                rel="noreferrer"
              >
                <LuGithub aria-hidden="true" />
                {t.source}
              </a>
            </div>
          </header>

          <div className="admin-content">
            <section className="workspace-heading" aria-label={t.workspaceLabel}>
              <div>
                <p className="workspace-kicker">
                  <LuSparkles aria-hidden="true" /> {t.eyebrow}
                </p>
                <h1>{t.title}</h1>
                <p>{t.intro}</p>
              </div>
              <div className="snapshot-card" aria-label={`${t.snapshot} ${studioCapturedAt}`}>
                <span className="card-label">{t.snapshot}</span>
                <strong>{studioCapturedAt}</strong>
              </div>
            </section>

            <section className="metric-grid" aria-label="Studio metrics">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="metric-card" key={item.label}>
                    <span className="metric-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  </article>
                );
              })}
            </section>

            {hasResults ? (
              <section className="workspace-grid">
                <article className="content-card" aria-live="polite">
                  <header className="note-header">
                    <div>
                      <p className="workspace-kicker">
                        {selectedFolder.label} · {t.updated} {selectedNote.updatedAt}
                      </p>
                      <h2>{selectedNote.title}</h2>
                      <p>{selectedNote.summary}</p>
                    </div>
                    <span className={`status-pill status-${selectedNote.status}`}>
                      {t.status[selectedNote.status]}
                    </span>
                  </header>

                  <div className="tag-list" aria-label="Note tags">
                    {selectedNote.tags.map((tag) => (
                      <span className="tag-pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="section-list" aria-label={t.sectionsTitle}>
                    {selectedNote.sections.map((section) => (
                      <section className="note-section" key={section.heading}>
                        <h3>{section.heading}</h3>
                        <p>{section.body}</p>
                      </section>
                    ))}
                  </div>
                </article>

                <aside className="rail-stack" aria-label="Studio actions">
                  <section className="rail-card">
                    <div className="rail-heading">
                      <LuCommand aria-hidden="true" />
                      <h3>{t.commandsTitle}</h3>
                    </div>
                    {selectedNote.commands && selectedNote.commands.length > 0 ? (
                      <div className="command-list">
                        {selectedNote.commands.map((item) => (
                          <div className="command-card" key={item.command}>
                            <div>
                              <strong>{item.label}</strong>
                              {item.note && <p>{item.note}</p>}
                              <code>{item.command}</code>
                            </div>
                            <button
                              type="button"
                              className="copy-button"
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
                      <p>{t.noCommands}</p>
                    )}
                  </section>

                  <section className="rail-card">
                    <div className="rail-heading">
                      <LuExternalLink aria-hidden="true" />
                      <h3>{t.linksTitle}</h3>
                    </div>
                    {selectedNote.links && selectedNote.links.length > 0 ? (
                      <div className="link-list">
                        {selectedNote.links.map((link) => (
                          <a
                            className="link-card"
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>
                              <strong>{link.label}</strong>
                              {link.note && <small>{link.note}</small>}
                            </span>
                            <LuExternalLink aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p>{t.noLinks}</p>
                    )}
                  </section>

                  <section className="rail-card">
                    <div className="rail-heading">
                      <LuListChecks aria-hidden="true" />
                      <h3>{t.checklistTitle}</h3>
                    </div>
                    {selectedNote.checklist && selectedNote.checklist.length > 0 ? (
                      <div className="check-list">
                        {selectedNote.checklist.map((item) => (
                          <div className="check-item" key={item.label}>
                            <span className={`check-dot${item.checked ? " is-checked" : ""}`}>
                              {item.checked ? <LuCheck aria-hidden="true" /> : null}
                            </span>
                            <div>
                              <strong>{item.label}</strong>
                              {item.detail && <p>{item.detail}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{t.noChecklist}</p>
                    )}
                  </section>
                </aside>
              </section>
            ) : (
              <section className="empty-card" aria-live="polite">
                <div>
                  <LuSearch aria-hidden="true" />
                  <h2>{t.emptyTitle}</h2>
                  <p>{t.emptyBody}</p>
                  <button type="button" className="segment-button" onClick={resetFilters}>
                    <LuRotateCcw aria-hidden="true" />
                    {t.reset}
                  </button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudioWorkspace({ locale }: StudioWorkspaceProps) {
  const t = getCopy(locale);

  return (
    <ShadowIsland styles={studioShadowStyles} label={t.workspaceLabel}>
      <StudioAdminApp locale={locale} />
    </ShadowIsland>
  );
}
