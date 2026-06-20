"use client";

import { useMemo, useState } from "react";
import {
  LuBookOpen,
  LuBrainCircuit,
  LuCheck,
  LuChevronRight,
  LuClipboard,
  LuExternalLink,
  LuLaptop,
  LuPalette,
  LuSearch,
  LuTerminal
} from "react-icons/lu";
import {
  defaultStudioNoteId,
  studioCapturedAt,
  studioFolders,
  studioNotes,
  type StudioFolder,
  type StudioNote
} from "./studio.data";

const folderIcons = {
  brain: LuBrainCircuit,
  laptop: LuLaptop,
  terminal: LuTerminal,
  palette: LuPalette,
  book: LuBookOpen
};

const statusLabels = {
  ready: "Ready",
  draft: "Draft",
  next: "Next"
};

function getFolderNotes(folder: StudioFolder): StudioNote[] {
  const ids = new Set(folder.groups.flatMap((group) => group.noteIds));
  return studioNotes.filter((note) => ids.has(note.id));
}

function getInitialNoteId() {
  if (typeof window === "undefined") return defaultStudioNoteId;
  const idFromHash = window.location.hash.replace("#", "");
  return studioNotes.some((note) => note.id === idFromHash)
    ? idFromHash
    : defaultStudioNoteId;
}

export default function StudioWorkspace() {
  const [selectedNoteId, setSelectedNoteId] = useState(getInitialNoteId);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const selectedNote =
    studioNotes.find((note) => note.id === selectedNoteId) ??
    studioNotes.find((note) => note.id === defaultStudioNoteId) ??
    studioNotes[0];

  const selectedFolder = useMemo(() => {
    return (
      studioFolders.find((folder) =>
        folder.groups.some((group) => group.noteIds.includes(selectedNote.id))
      ) ?? studioFolders[0]
    );
  }, [selectedNote.id]);

  const selectedFolderNotes = getFolderNotes(selectedFolder);

  const selectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    window.history.replaceState(null, "", `#${noteId}`);
  };

  const selectFolder = (folder: StudioFolder) => {
    const firstNoteId = folder.groups.flatMap((group) => group.noteIds)[0];
    if (firstNoteId) selectNote(firstNoteId);
  };

  const copyCommand = async (command: string) => {
    await navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    window.setTimeout(() => setCopiedCommand(null), 1600);
  };

  return (
    <section className="studio-admin" aria-label="Studio notes workspace">
      <aside className="studio-sidebar" aria-label="Studio folders">
        <div className="studio-sidebar__top">
          <div>
            <p className="studio-sidebar__eyebrow">Studio</p>
            <h1>Notes Admin</h1>
          </div>
          <span>{studioCapturedAt}</span>
        </div>

        <label className="studio-search">
          <LuSearch aria-hidden="true" />
          <span className="sr-only">Search studio notes</span>
          <input value="Setup, AI, terminal" readOnly />
        </label>

        <nav className="studio-folder-nav" aria-label="Studio folder navigation">
          {studioFolders.map((folder) => {
            const Icon = folderIcons[folder.icon];
            const activeFolder = folder.id === selectedFolder.id;
            return (
              <div
                className={`studio-folder${activeFolder ? " studio-folder--active" : ""}`}
                key={folder.id}
              >
                <button
                  type="button"
                  className="studio-folder__button"
                  onClick={() => selectFolder(folder)}
                  aria-expanded={activeFolder}
                >
                  <Icon aria-hidden="true" />
                  <span>
                    <strong>{folder.label}</strong>
                    <small>{folder.subtitle}</small>
                  </span>
                  <LuChevronRight aria-hidden="true" />
                </button>

                {activeFolder && (
                  <div className="studio-submenu">
                    {folder.groups.map((group) => (
                      <div className="studio-submenu__group" key={group.label}>
                        <p>{group.label}</p>
                        {group.noteIds.map((noteId) => {
                          const note = studioNotes.find((item) => item.id === noteId);
                          if (!note) return null;
                          return (
                            <button
                              type="button"
                              key={note.id}
                              className={
                                note.id === selectedNote.id
                                  ? "studio-submenu__item studio-submenu__item--active"
                                  : "studio-submenu__item"
                              }
                              onClick={() => selectNote(note.id)}
                            >
                              {note.title}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <aside className="studio-note-list" aria-label={`${selectedFolder.label} notes`}>
        <div className="studio-note-list__header">
          <span>{selectedFolder.label}</span>
          <strong>{selectedFolderNotes.length}</strong>
        </div>
        <div className="studio-note-list__items">
          {selectedFolderNotes.map((note) => (
            <button
              type="button"
              key={note.id}
              className={
                note.id === selectedNote.id
                  ? "studio-note-card studio-note-card--active"
                  : "studio-note-card"
              }
              onClick={() => selectNote(note.id)}
            >
              <span className={`studio-note-card__status studio-note-card__status--${note.status}`}>
                {statusLabels[note.status]}
              </span>
              <strong>{note.title}</strong>
              <small>{note.subtitle}</small>
              <span className="studio-note-card__date">{note.updatedAt}</span>
            </button>
          ))}
        </div>
      </aside>

      <article className="studio-note-detail" aria-live="polite">
        <header className="studio-note-detail__header">
          <div>
            <p className="studio-note-detail__folder">{selectedFolder.label}</p>
            <h2>{selectedNote.title}</h2>
            <p>{selectedNote.summary}</p>
          </div>
          <span className={`studio-note-detail__status studio-note-detail__status--${selectedNote.status}`}>
            {statusLabels[selectedNote.status]}
          </span>
        </header>

        <div className="studio-note-tags" aria-label="Note tags">
          {selectedNote.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="studio-note-body">
          {selectedNote.sections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        {selectedNote.commands && selectedNote.commands.length > 0 && (
          <section className="studio-command-panel" aria-labelledby="studio-command-title">
            <h3 id="studio-command-title">Install commands</h3>
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
                    className="studio-command__copy"
                    onClick={() => copyCommand(item.command)}
                    aria-label={`Copy ${item.label}`}
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
          </section>
        )}

        {selectedNote.links && selectedNote.links.length > 0 && (
          <section className="studio-link-panel" aria-labelledby="studio-link-title">
            <h3 id="studio-link-title">Source links</h3>
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
          </section>
        )}

        {selectedNote.checklist && selectedNote.checklist.length > 0 && (
          <section className="studio-check-panel" aria-labelledby="studio-check-title">
            <h3 id="studio-check-title">Checklist</h3>
            <ul>
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
          </section>
        )}
      </article>
    </section>
  );
}
