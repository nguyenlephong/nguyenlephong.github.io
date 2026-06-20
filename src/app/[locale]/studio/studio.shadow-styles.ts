export const studioShadowStyles = `
:host {
  display: block;
  min-height: 100vh;
  color-scheme: light dark;
}

* {
  box-sizing: border-box;
  min-width: 0;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.admin-root {
  --bg: #080b12;
  --surface: #0c111b;
  --surface-2: #111722;
  --surface-3: #151c28;
  --line: #263142;
  --line-strong: #354154;
  --text: #f4f7fb;
  --muted: #a4adbb;
  --subtle: #778294;
  --primary: #635bff;
  --primary-soft: rgba(99, 91, 255, 0.16);
  --teal: #10b981;
  --teal-soft: rgba(16, 185, 129, 0.13);
  --amber: #f59e0b;
  --amber-soft: rgba(245, 158, 11, 0.14);
  --rose: #fb7185;
  --rose-soft: rgba(251, 113, 133, 0.13);
  --radius: 12px;
  --radius-sm: 9px;
  min-height: 100vh;
  background:
    radial-gradient(circle at 26% -10%, rgba(99, 91, 255, 0.2), transparent 28rem),
    radial-gradient(circle at 100% 10%, rgba(16, 185, 129, 0.12), transparent 24rem),
    linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(0deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
    var(--bg);
  background-size: auto, auto, 32px 32px, 32px 32px, auto;
  color: var(--text);
  font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.admin-shell {
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar-backdrop {
  display: none;
}

.admin-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid var(--line);
  background: color-mix(in oklab, var(--surface) 94%, transparent);
  padding: 0.75rem;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 44px;
  border-radius: var(--radius-sm);
  padding: 0 0.72rem;
  color: var(--text);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid color-mix(in oklab, var(--primary) 44%, var(--line));
  border-radius: 0.7rem;
  background: var(--primary-soft);
  color: var(--text);
}

.brand-copy {
  display: grid;
  gap: 0.1rem;
}

.brand-copy strong {
  font-size: 0.92rem;
  line-height: 1.1;
}

.brand-copy span,
.nav-section-title,
.workspace-kicker,
.card-label,
.note-date {
  color: var(--subtle);
  font-family: var(--font-mono, "SFMono-Regular", Consolas, monospace);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.sidebar-search {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr) 1.7rem;
  gap: 0.55rem;
  align-items: center;
  min-height: 40px;
  margin: 0.9rem 0 0.75rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  padding: 0 0.45rem 0 0.72rem;
  color: var(--subtle);
}

.sidebar-search:focus-within {
  border-color: color-mix(in oklab, var(--primary) 58%, var(--line));
  box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.14);
}

.sidebar-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
}

.sidebar-search input::placeholder {
  color: var(--subtle);
}

.icon-button,
.topbar-button,
.segment-button,
.folder-button,
.note-button,
.copy-button {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--muted);
  transition:
    border-color 150ms ease,
    background 150ms ease,
    color 150ms ease,
    transform 150ms ease;
}

.icon-button {
  display: grid;
  place-items: center;
  width: 1.7rem;
  height: 1.7rem;
}

.topbar-button,
.segment-button {
  display: inline-grid;
  grid-auto-flow: column;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
  min-height: 2.15rem;
  padding: 0 0.75rem;
}

.icon-button:hover,
.topbar-button:hover,
.segment-button:hover,
.segment-button.is-active,
.copy-button:hover {
  border-color: color-mix(in oklab, var(--primary) 52%, var(--line));
  background: var(--primary-soft);
  color: var(--text);
}

.sidebar-scroll {
  min-height: 0;
  overflow: auto;
  padding-right: 0.15rem;
}

.nav-section {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.7rem;
}

.nav-section-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0 0.5rem;
}

.status-segments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.segment-button {
  min-height: 34px;
}

.folder-list {
  display: grid;
  gap: 0.45rem;
}

.folder {
  border: 1px solid transparent;
  border-radius: var(--radius);
}

.folder.is-active {
  border-color: var(--line);
  background: rgba(148, 163, 184, 0.06);
}

.folder-button {
  display: grid;
  grid-template-columns: 1.15rem minmax(0, 1fr) auto 0.8rem;
  gap: 0.6rem;
  align-items: center;
  width: 100%;
  min-height: 54px;
  border: 0;
  padding: 0.62rem;
  text-align: left;
}

.folder-button:hover {
  background: rgba(148, 163, 184, 0.08);
  color: var(--text);
}

.folder-button svg:first-child {
  color: var(--teal);
}

.folder-text strong,
.folder-text span,
.note-button strong,
.note-button small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-text strong {
  color: var(--text);
  font-size: 0.9rem;
  line-height: 1.2;
}

.folder-text span,
.note-button small {
  color: var(--subtle);
  font-size: 0.76rem;
  line-height: 1.35;
}

.count-pill,
.status-pill,
.tag-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  font-family: var(--font-mono, "SFMono-Regular", Consolas, monospace);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.count-pill {
  min-width: 1.55rem;
  min-height: 1.55rem;
  padding: 0 0.42rem;
}

.folder-groups {
  display: grid;
  gap: 0.7rem;
  padding: 0 0.6rem 0.7rem 2.05rem;
}

.folder-group {
  display: grid;
  gap: 0.35rem;
}

.folder-group-title {
  margin: 0;
  color: var(--subtle);
  font-family: var(--font-mono, "SFMono-Regular", Consolas, monospace);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.note-button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.45rem;
  align-items: center;
  width: 100%;
  min-height: 34px;
  border-radius: var(--radius-sm);
  padding: 0.38rem 0.5rem;
  text-align: left;
}

.note-button:hover,
.note-button.is-active {
  border-color: color-mix(in oklab, var(--primary) 48%, var(--line));
  background: var(--primary-soft);
  color: var(--text);
}

.status-pill {
  padding: 0.28rem 0.5rem;
  text-transform: uppercase;
}

.status-ready {
  border-color: color-mix(in oklab, var(--teal) 56%, var(--line));
  background: var(--teal-soft);
  color: #5eead4;
}

.status-draft {
  border-color: color-mix(in oklab, var(--amber) 54%, var(--line));
  background: var(--amber-soft);
  color: #fbbf24;
}

.status-next {
  border-color: color-mix(in oklab, var(--rose) 52%, var(--line));
  background: var(--rose-soft);
  color: #fda4af;
}

.sidebar-footer {
  display: grid;
  gap: 0.65rem;
  border-top: 1px solid var(--line);
  margin-top: 0.75rem;
  padding-top: 0.75rem;
}

.support-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--primary-soft), rgba(16, 185, 129, 0.08));
  padding: 0.78rem;
}

.support-card strong {
  display: block;
  font-size: 0.85rem;
}

.support-card p {
  margin: 0.35rem 0 0;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.admin-main {
  min-width: 0;
}

.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  border-bottom: 1px solid var(--line);
  background: rgba(8, 11, 18, 0.82);
  padding: 0 1rem;
  backdrop-filter: blur(16px);
}

.topbar-left,
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topbar-divider {
  width: 1px;
  height: 1.25rem;
  background: var(--line);
}

.topbar-search {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  color: var(--muted);
  font-size: 0.9rem;
}

.admin-content {
  width: min(1500px, 100%);
  margin: 0 auto;
  padding: 1.1rem;
}

.workspace-heading {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.workspace-heading h1 {
  max-width: 58rem;
  margin: 0.35rem 0 0;
  font-size: clamp(1.8rem, 1.45rem + 1vw, 2.75rem);
  line-height: 1.04;
  letter-spacing: 0;
}

.workspace-heading p {
  max-width: 62rem;
  margin: 0.62rem 0 0;
  color: var(--muted);
  line-height: 1.58;
}

.snapshot-card {
  display: grid;
  gap: 0.24rem;
  min-width: 10rem;
  border: 1px solid color-mix(in oklab, var(--teal) 44%, var(--line));
  border-radius: var(--radius);
  background: var(--teal-soft);
  padding: 0.78rem 0.9rem;
}

.snapshot-card strong {
  font-family: var(--font-mono, "SFMono-Regular", Consolas, monospace);
  font-size: 1.05rem;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.metric-card,
.content-card,
.rail-card,
.empty-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent),
    color-mix(in oklab, var(--surface) 94%, transparent);
  box-shadow: 0 18px 50px -42px rgba(0, 0, 0, 0.75);
}

.metric-card {
  display: grid;
  gap: 0.75rem;
  min-height: 126px;
  padding: 1rem;
}

.metric-icon {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border: 1px solid var(--line);
  border-radius: 0.65rem;
  background: var(--surface-2);
  color: var(--primary);
}

.metric-card span {
  color: var(--muted);
  font-size: 0.86rem;
}

.metric-card strong {
  font-size: 1.95rem;
  line-height: 1;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(310px, 390px);
  gap: 1rem;
  align-items: start;
}

.content-card {
  min-height: calc(100vh - 15rem);
  padding: clamp(1.1rem, 1vw, 1.35rem);
}

.note-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: start;
  border-bottom: 1px solid var(--line);
  padding-bottom: 1rem;
}

.note-header h2 {
  max-width: 24ch;
  margin: 0.35rem 0 0;
  font-size: clamp(2.2rem, 1.55rem + 1.8vw, 4rem);
  line-height: 0.98;
}

.note-header p {
  max-width: 68ch;
  margin: 0.85rem 0 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.65;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 1rem 0 0.4rem;
}

.tag-pill {
  padding: 0.32rem 0.55rem;
}

.section-list {
  display: grid;
}

.note-section {
  border-top: 1px solid var(--line);
  padding: 1rem 0;
}

.note-section:first-child {
  border-top: 0;
}

.note-section h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.25;
}

.note-section p {
  margin: 0.45rem 0 0;
  color: var(--muted);
  line-height: 1.68;
}

.rail-stack {
  display: grid;
  gap: 1rem;
}

.rail-card {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
}

.rail-heading {
  display: flex;
  gap: 0.55rem;
  align-items: center;
}

.rail-heading svg {
  color: var(--primary);
}

.rail-heading h3 {
  margin: 0;
  font-size: 1rem;
}

.command-list,
.link-list,
.check-list {
  display: grid;
  gap: 0.65rem;
}

.command-card,
.link-card,
.check-item {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  padding: 0.78rem;
}

.command-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 2rem;
  gap: 0.7rem;
  align-items: start;
}

.command-card strong,
.link-card strong,
.check-item strong {
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.command-card p,
.link-card small,
.check-item p,
.empty-card p {
  margin: 0.38rem 0 0;
  color: var(--muted);
  line-height: 1.55;
}

.command-card code {
  display: block;
  max-width: 100%;
  margin-top: 0.62rem;
  border: 1px solid var(--line);
  border-radius: 0.55rem;
  background: #070a10;
  color: var(--text);
  padding: 0.55rem;
  font-family: var(--font-mono, "SFMono-Regular", Consolas, monospace);
  font-size: 0.78rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.copy-button {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
}

.link-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1rem;
  gap: 0.7rem;
  align-items: center;
  color: inherit;
  text-decoration: none;
}

.link-card:hover {
  border-color: color-mix(in oklab, var(--primary) 50%, var(--line));
  background: var(--primary-soft);
}

.check-item {
  display: grid;
  grid-template-columns: 1.2rem minmax(0, 1fr);
  gap: 0.7rem;
}

.check-dot {
  display: grid;
  place-items: center;
  width: 1.05rem;
  height: 1.05rem;
  margin-top: 0.12rem;
  border: 1px solid var(--line);
  border-radius: 50%;
}

.check-dot.is-checked {
  border-color: var(--teal);
  background: var(--teal-soft);
  color: #5eead4;
}

.empty-card {
  display: grid;
  place-items: center;
  min-height: 18rem;
  padding: 2rem;
  text-align: center;
}

.empty-card button {
  margin-top: 0.85rem;
}

@media (max-width: 1180px) {
  .admin-shell {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .rail-stack {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 30;
    width: min(18rem, calc(100vw - 2rem));
    height: 100vh;
    border-right: 1px solid var(--line);
    border-bottom: 0;
    transform: translateX(-105%);
    transition: transform 180ms ease;
    box-shadow: 28px 0 70px -48px rgba(0, 0, 0, 0.9);
  }

  .admin-root.sidebar-open .admin-sidebar {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: block;
    border: 0;
    background: rgba(0, 0, 0, 0.48);
    opacity: 0;
    pointer-events: none;
    transition: opacity 180ms ease;
  }

  .admin-root.sidebar-open .sidebar-backdrop {
    opacity: 1;
    pointer-events: auto;
  }

  .sidebar-scroll {
    overflow: auto;
  }

  .admin-topbar {
    position: sticky;
    gap: 0.8rem;
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar-actions {
    flex-wrap: wrap;
  }

  .workspace-heading {
    display: grid;
  }

  .snapshot-card {
    width: 100%;
  }

  .metric-grid,
  .rail-stack {
    grid-template-columns: 1fr;
  }

  .note-header {
    grid-template-columns: 1fr;
  }

  .note-header h2 {
    max-width: 100%;
    font-size: clamp(2rem, 10vw, 3rem);
  }
}
`;
