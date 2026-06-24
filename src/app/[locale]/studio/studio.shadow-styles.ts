export const studioShadowStyles = `
:host {
  display: block;
  min-height: 100vh;
  color-scheme: light;
}

* {
  box-sizing: border-box;
  min-width: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  border: 0;
  cursor: pointer;
}

a {
  color: inherit;
}

.studio-admin {
  --background: var(--bg, #ffffff);
  --foreground: var(--fg, #0a0a0a);
  --card: var(--bg-elevated, #ffffff);
  --card-foreground: var(--fg, #0a0a0a);
  --muted: var(--bg-muted, #f5f5f5);
  --muted-foreground: var(--fg-muted, #717171);
  --input: var(--border, #e5e5e5);
  --primary: var(--accent, #2563eb);
  --primary-foreground: var(--fg-on-accent, #ffffff);
  --sidebar: color-mix(in oklab, var(--bg, #ffffff) 86%, var(--bg-muted, #f5f5f5));
  --sidebar-foreground: var(--fg, #0a0a0a);
  --sidebar-accent: color-mix(in oklab, var(--accent-soft, #eef2ff) 72%, var(--bg-elevated, #ffffff));
  --sidebar-border: var(--border, #e5e5e5);
  --ring: var(--accent, #2563eb);
  --control-radius: 0.5rem;
  --radius: 0.5rem;
  display: grid;
  grid-template-columns: 18.5rem minmax(0, 1fr);
  gap: 0.75rem;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  padding: 0.75rem;
  background: var(--sidebar);
  color: var(--foreground);
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.studio-admin,
.studio-main,
.dashboard-content,
.route-page,
.card,
.metric-card {
  max-width: 100%;
}

.studio-main,
.dashboard-content,
.route-page {
  overflow-x: clip;
}

.studio-admin[data-studio-font="source"] {
  font-family: var(--font-reading-source), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.studio-admin[data-studio-font="plex"] {
  font-family: var(--font-reading-plex), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.studio-admin[data-studio-font="atkinson"] {
  font-family: var(--font-reading-atkinson), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.studio-admin[data-studio-font="lora"] {
  font-family: var(--font-reading-lora), Georgia, "Times New Roman", serif;
}

.studio-admin[data-studio-font="be-vietnam"] {
  font-family: var(--font-reading-be-vietnam), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.studio-admin.is-dark {
  color-scheme: dark;
}

.studio-admin.is-sidebar-collapsed {
  grid-template-columns: 4.5rem minmax(0, 1fr);
}

.studio-admin.is-sidebar-hidden {
  grid-template-columns: minmax(0, 1fr);
}

.studio-admin.is-sidebar-hidden .studio-sidebar {
  display: none;
}

.studio-admin[data-sidebar-variant="sidebar"] {
  gap: 0;
  padding: 0;
}

.studio-admin[data-sidebar-variant="sidebar"] .studio-sidebar {
  top: 0;
  height: 100vh;
  border-width: 0 1px 0 0;
  border-radius: 0;
}

.studio-admin[data-sidebar-variant="sidebar"] .studio-main {
  height: 100vh;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.studio-admin[data-sidebar-variant="floating"] {
  gap: 1rem;
  padding: 1rem;
}

.studio-admin[data-sidebar-variant="floating"] .studio-sidebar,
.studio-admin[data-sidebar-variant="floating"] .studio-main {
  height: calc(100vh - 2rem);
  border-radius: 1rem;
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.08);
}

.studio-admin[data-sidebar-variant="floating"] .studio-sidebar {
  top: 1rem;
}

.studio-admin[data-content-layout="full-width"] .dashboard-content {
  width: 100%;
  max-width: none;
  margin-right: 0;
  margin-left: 0;
}

.studio-admin[data-content-layout="centered"] .dashboard-content {
  width: min(100%, 1536px);
  margin-right: auto;
  margin-left: auto;
}

.studio-admin[data-navbar-style="scroll"] .studio-main {
  overflow: auto;
}

.studio-admin[data-navbar-style="scroll"] .studio-topbar {
  position: relative;
  top: auto;
}

.studio-admin[data-navbar-style="scroll"] .dashboard-content {
  flex: 0 0 auto;
  min-height: calc(100% - 3rem);
  overflow: visible;
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

.studio-sidebar {
  position: sticky;
  top: 0.75rem;
  display: flex;
  height: calc(100vh - 1.5rem);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--sidebar-border);
  border-radius: 0.875rem;
  background: var(--sidebar);
  color: var(--sidebar-foreground);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem;
}

.sidebar-brand {
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  gap: 0.625rem;
  border-radius: var(--control-radius);
  color: var(--foreground);
  font-size: 1rem;
  font-weight: 600;
  outline: none;
  text-decoration: none;
}

.sidebar-brand:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--ring) 72%, transparent);
  outline-offset: 3px;
}

.sidebar-brand svg,
.sidebar-brand img {
  width: 1.125rem;
  height: 1.125rem;
}

.sidebar-brand-mark {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--primary) 45%, var(--border));
  border-radius: 999px;
  background:
    radial-gradient(circle at 32% 24%, color-mix(in srgb, #ffffff 88%, transparent), transparent 34%),
    linear-gradient(135deg, color-mix(in srgb, var(--primary) 82%, #38bdf8), color-mix(in srgb, #111827 92%, var(--primary)));
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18), 0 0.35rem 0.9rem color-mix(in srgb, var(--primary) 26%, transparent);
}

.sidebar-brand img {
  width: 1.75rem;
  height: 1.75rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  object-fit: cover;
}

.sidebar-brand svg {
  stroke-width: 2.35;
}

.sidebar-close {
  display: none;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--foreground);
}

.is-sidebar-collapsed .sidebar-brand {
  justify-content: center;
}

.is-sidebar-collapsed .sidebar-brand span,
.is-sidebar-collapsed .sidebar-menu-button span:not(.sidebar-badge),
.is-sidebar-collapsed .sidebar-badge,
.is-sidebar-collapsed .sidebar-chevron,
.is-sidebar-collapsed .user-card span,
.is-sidebar-collapsed .user-card > svg {
  display: none;
}

.sidebar-create {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
  padding: 0.5rem 1rem 0.875rem;
}

.is-sidebar-collapsed .sidebar-create {
  grid-template-columns: 1fr;
  padding: 0.25rem 1rem 0.75rem;
}

.is-sidebar-collapsed .quick-create {
  width: 2.25rem;
  justify-content: center;
}

.is-sidebar-collapsed .quick-create span,
.is-sidebar-collapsed .mail-button {
  display: none;
}

.quick-create,
.mail-button,
.icon-button,
.topbar-icon,
.outline-button,
.select-button,
.sidebar-menu-button,
.search-command {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--control-radius);
  background: transparent;
  color: inherit;
  text-decoration: none;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    transform 120ms ease;
}

.quick-create,
.outline-button,
.select-button,
.sidebar-menu-button,
.profile-link-grid a,
.skill-list-button,
.checklist-list-button,
.flow-group-button,
.flow-list-button,
.welcome-shortcut,
.welcome-link-grid a,
.ai-note-button,
.check-row {
  overflow-wrap: anywhere;
}

.quick-create {
  height: 2.125rem;
  justify-content: flex-start;
  gap: 0.5rem;
  border-color: var(--border);
  background: var(--background);
  color: var(--foreground);
  padding: 0 0.75rem;
  font-weight: 500;
}

.quick-create svg,
.mail-button svg,
.sidebar-menu-button svg,
.icon-button svg,
.topbar-icon svg,
.outline-button svg,
.select-button svg,
.search-command svg {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
}

.mail-button,
.icon-button {
  width: 2.125rem;
  height: 2.125rem;
  border-color: color-mix(in srgb, var(--foreground) 12%, transparent);
  background: var(--background);
}

.mail-button:hover,
.icon-button:hover,
.outline-button:hover,
.select-button:hover,
.quick-create:hover {
  background: var(--muted);
}

.sidebar-scroll {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 0 1rem 0.75rem;
}

.sidebar-group {
  display: grid;
  gap: 0.375rem;
  padding: 0.5rem 0;
}

.sidebar-group + .sidebar-group {
  margin-top: 0.5rem;
}

.sidebar-group-label {
  margin: 0;
  padding: 0 0.5rem 0.35rem;
  color: var(--muted-foreground);
  font-size: 0.75rem;
  line-height: 1;
}

.sidebar-menu {
  display: grid;
  gap: 0.125rem;
}

.sidebar-menu-button {
  position: relative;
  width: 100%;
  min-height: 2rem;
  justify-content: flex-start;
  gap: 0.625rem;
  border-radius: var(--control-radius);
  padding: 0 0.625rem;
  color: var(--sidebar-foreground);
  font-size: 0.875rem;
  text-align: left;
}

.sidebar-menu-button:disabled,
.sidebar-menu-button.is-disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.sidebar-menu-button:hover,
.sidebar-menu-button.is-active {
  background: color-mix(in srgb, var(--primary) 9%, transparent);
}

.sidebar-menu-button.is-active {
  border-color: color-mix(in srgb, var(--primary) 18%, transparent);
  font-weight: 600;
}

.sidebar-menu-button span:not(.sidebar-badge) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-badge {
  display: inline-flex;
  margin-left: auto;
  min-width: 2rem;
  height: 1.125rem;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, #22c55e 45%, transparent);
  border-radius: 999px;
  color: #16a34a;
  padding: 0 0.45rem;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1;
  text-align: center;
}

.sidebar-chevron {
  margin-left: auto;
  transition: transform 150ms ease;
}

.sidebar-menu-button[aria-expanded="true"] .sidebar-chevron {
  transform: rotate(90deg);
}

.sidebar-fallback {
  width: 1rem;
  height: 1rem;
}

.sidebar-tree {
  display: grid;
  gap: 0.125rem;
}

.sidebar-submenu {
  display: grid;
  gap: 0.125rem;
  margin-left: 1.25rem;
  border-left: 1px solid var(--border);
  padding-left: 0.5rem;
}

.sidebar-submenu-link {
  min-height: 1.875rem;
  border-radius: 0.5rem;
  color: var(--muted-foreground);
  padding: 0.375rem 0.5rem;
  text-decoration: none;
}

.sidebar-submenu-link:hover,
.sidebar-submenu-link.is-active {
  background: var(--sidebar-accent);
  color: var(--foreground);
}

.sidebar-scrim {
  display: none;
}

.sidebar-footer {
  display: grid;
  gap: 0.875rem;
  border-top: 1px solid transparent;
  padding: 0.75rem 1rem 1rem;
}

.support-card {
  border: 1px solid var(--border);
  border-radius: 0.875rem;
  background: var(--card);
  padding: 1rem;
}

.support-card strong {
  display: block;
  font-weight: 600;
}

.support-card p {
  margin: 0.375rem 0 0;
  color: var(--muted-foreground);
  line-height: 1.35;
}

.support-card a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.profile-link-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.375rem;
  margin-top: 0.75rem;
}

.profile-link-grid a {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  gap: 0.375rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--background);
  padding: 0 0.5rem;
  color: var(--foreground);
  font-size: 0.75rem;
  text-decoration: none;
}

.profile-link-grid a:hover {
  background: var(--muted);
}

.profile-link-grid svg {
  width: 0.875rem;
  height: 0.875rem;
  flex: 0 0 auto;
}

.user-card {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr) 1.75rem;
  gap: 0.625rem;
  align-items: center;
  color: inherit;
  text-decoration: none;
}

.user-avatar,
.topbar-avatar,
.workstream-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--muted);
  color: var(--foreground);
}

.user-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-color: #0a0a0a;
  background: #2c2c2c;
  color: #ffffff;
  font-size: 1rem;
}

.user-card strong,
.workstream-cell strong,
.joined-cell strong {
  display: block;
  overflow: hidden;
  color: var(--foreground);
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card small,
.workstream-cell small,
.joined-cell small {
  display: block;
  overflow: hidden;
  color: var(--muted-foreground);
  font-size: 0.75rem;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card > svg {
  width: 1.75rem;
  height: 1.75rem;
  justify-self: center;
  color: var(--foreground);
}

.studio-main {
  display: flex;
  min-width: 0;
  min-height: 0;
  height: calc(100vh - 1.5rem);
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  border: 1px solid var(--border);
  border-radius: 0.875rem;
  background: var(--background);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.studio-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  height: 3rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  background: color-mix(in srgb, var(--background) 82%, transparent);
  padding: 0 1rem 0 1.5rem;
  backdrop-filter: blur(12px);
}

.topbar-left,
.topbar-actions,
.card-actions,
.table-toolbar,
.metric-value-row,
.chart-legend {
  display: flex;
  align-items: center;
}

.topbar-left {
  gap: 0.75rem;
}

.topbar-actions {
  gap: 0.5rem;
}

.topbar-separator {
  width: 1px;
  height: 1rem;
  background: color-mix(in srgb, var(--foreground) 10%, transparent);
}

.search-command {
  min-height: 2.125rem;
  gap: 0.5rem;
  border-color: transparent;
  background: transparent;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  padding: 0 0.375rem;
}

.search-command:hover {
  background: transparent;
  color: var(--foreground);
}

.search-command kbd {
  display: inline-flex;
  min-width: 1.75rem;
  height: 1.25rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 0.3125rem;
  background: color-mix(in srgb, var(--muted) 72%, transparent);
  color: var(--muted-foreground);
  font-size: 0.6875rem;
  font-weight: 500;
}

.topbar-icon {
  width: 2.125rem;
  height: 2.125rem;
  border-color: color-mix(in srgb, var(--foreground) 12%, transparent);
  background: var(--background);
  color: var(--foreground);
}

.topbar-icon:hover {
  background: var(--muted);
}

.topbar-avatar {
  width: 2.125rem;
  height: 2.125rem;
  border: 1px solid var(--border);
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.account-popover {
  position: absolute;
  top: 2.75rem;
  right: 1rem;
  z-index: 40;
  display: grid;
  gap: 0.35rem;
  width: 15rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--card);
  padding: 0.875rem;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14);
}

.preferences-anchor {
  position: relative;
}

.preferences-popover {
  position: absolute;
  top: 2.75rem;
  right: 0;
  z-index: 45;
  display: grid;
  gap: 1rem;
  width: min(21rem, calc(100vw - 2rem));
  max-height: min(42rem, calc(100vh - 5rem));
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 0.875rem;
  background: var(--card);
  padding: 1rem;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.16);
}

.preferences-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.preferences-head h2,
.preferences-head p,
.preference-section p {
  margin: 0;
}

.preferences-head h2 {
  font-size: 0.95rem;
  font-weight: 600;
}

.preferences-head p,
.preference-section p {
  color: var(--muted-foreground);
  font-size: 0.75rem;
  line-height: 1.45;
}

.theme-color-preview {
  display: inline-flex;
  min-height: 1.625rem;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.375rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--muted-foreground);
  padding: 0 0.5rem;
  font-size: 0.75rem;
}

.theme-color-preview i {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 999px;
  background: var(--primary);
}

.preference-section {
  display: grid;
  gap: 0.5rem;
}

.preference-section label {
  color: var(--foreground);
  font-size: 0.75rem;
  font-weight: 600;
}

.preference-segment {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.25rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--muted);
  padding: 0.25rem;
}

.preference-segment[data-columns="2"] {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.preference-segment[data-columns="3"] {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.preference-segment button {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.55rem;
  background: transparent;
  color: var(--muted-foreground);
  font-size: 0.75rem;
}

.preference-segment button span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preference-segment button.is-active {
  background: var(--background);
  color: var(--foreground);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.preference-segment svg,
.preference-select-row svg {
  width: 0.875rem;
  height: 0.875rem;
}

.preference-select-row {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  align-items: center;
  gap: 0.5rem;
}

.restore-preferences {
  min-height: 2.25rem;
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  background: var(--background);
  color: var(--foreground);
  font-size: 0.75rem;
  font-weight: 600;
}

.restore-preferences:hover {
  background: var(--muted);
}

.account-popover strong,
.account-popover > span {
  display: block;
}

.account-popover > span {
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.account-nav {
  display: grid;
  gap: 0.25rem;
  margin-top: 0.55rem;
  border-top: 1px solid var(--border);
  padding-top: 0.625rem;
}

.account-nav a {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  min-height: 2rem;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  padding: 0 0.5rem;
  color: var(--foreground);
  text-decoration: none;
}

.account-nav a:hover {
  background: var(--muted);
}

.account-nav svg {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--muted-foreground);
}

.dashboard-content {
  display: flex;
  width: min(100%, 1536px);
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 1.5rem;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  margin: 0 auto;
  padding: 1.5rem;
}

.dashboard-content,
.route-page {
  overflow-x: clip;
}

.route-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.route-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.route-heading h1 {
  margin: 0.25rem 0 0;
  color: var(--foreground);
  font-size: 1.875rem;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: 0;
}

.route-heading p {
  max-width: 48rem;
  margin: 0.5rem 0 0;
  color: var(--muted-foreground);
}

.route-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.route-kicker svg {
  width: 0.875rem;
  height: 0.875rem;
}

.route-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.route-heading .outline-button,
.skill-reader-head .outline-button {
  flex: 0 0 auto;
  min-width: max-content;
}

.route-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.65fr);
  gap: 1rem;
}

.route-wide-card {
  min-width: 0;
}

.route-panel {
  min-height: 14rem;
}

.route-panel h2,
.auth-card h1,
.invoice-paper strong,
.kanban-column h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.timeline-list,
.task-list,
.module-grid {
  display: grid;
  gap: 0.625rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 1.625rem minmax(0, 1fr);
  gap: 0.625rem;
  align-items: center;
}

.timeline-item span {
  display: inline-flex;
  width: 1.625rem;
  height: 1.625rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 0.75rem;
}

.timeline-item p {
  margin: 0;
}

.module-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.module-card {
  display: grid;
  gap: 0.35rem;
  min-height: 5.5rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--muted);
  padding: 0.875rem;
}

.module-card span {
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.welcome-route {
  display: grid;
  gap: 1rem;
}

.welcome-shell {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(21rem, 0.78fr);
  gap: 1rem;
  align-items: stretch;
}

.welcome-intro,
.welcome-panel,
.welcome-link-band {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--card);
}

.welcome-intro {
  position: relative;
  display: flex;
  min-height: 22rem;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  overflow: hidden;
  padding: clamp(1.25rem, 2.2vw, 2rem);
}

.welcome-intro::before {
  position: absolute;
  inset: 0 0 auto;
  height: 0.25rem;
  background: linear-gradient(90deg, #16a34a, #0ea5e9, #f59e0b);
  content: "";
}

.welcome-eyebrow {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid color-mix(in srgb, var(--primary) 36%, var(--border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  color: var(--primary);
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.welcome-intro h1 {
  margin: 0.9rem 0 0;
  color: var(--foreground);
  font-size: clamp(2.35rem, 5vw, 4.5rem);
  font-weight: 650;
  letter-spacing: 0;
  line-height: 0.95;
}

.welcome-intro p {
  max-width: 48rem;
  margin: 1rem 0 0;
  color: var(--muted-foreground);
  font-size: clamp(1rem, 1.35vw, 1.2rem);
  line-height: 1.65;
}

.welcome-note-strip {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 0.875rem;
  align-items: start;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
  color: var(--muted-foreground);
  line-height: 1.55;
}

.welcome-note-strip svg,
.welcome-panel-head > span,
.welcome-link-head > span {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--muted) 66%, transparent);
  color: var(--foreground);
}

.welcome-panel,
.welcome-link-band {
  display: grid;
  gap: 1rem;
  padding: clamp(1rem, 1.8vw, 1.25rem);
}

.welcome-panel-head,
.welcome-link-head {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
}

.welcome-panel-head h2,
.welcome-link-head h2 {
  margin: 0;
  color: var(--foreground);
  font-size: 1rem;
  font-weight: 650;
}

.welcome-panel-head p,
.welcome-link-head p {
  margin: 0.35rem 0 0;
  color: var(--muted-foreground);
  line-height: 1.5;
}

.welcome-shortcut-grid,
.welcome-link-grid {
  display: grid;
  gap: 0.625rem;
}

.welcome-shortcut,
.welcome-link-grid a {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  min-height: 4.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--background) 76%, transparent);
  color: var(--foreground);
  padding: 0.75rem;
  text-decoration: none;
  transition: background-color 150ms ease, border-color 150ms ease, transform 120ms ease;
}

.welcome-shortcut:hover,
.welcome-link-grid a:hover {
  border-color: color-mix(in srgb, var(--primary) 34%, var(--border));
  background: color-mix(in srgb, var(--primary) 7%, var(--background));
  transform: translateY(-1px);
}

.welcome-shortcut > svg,
.welcome-link-grid a > svg:first-child {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--primary);
}

.welcome-shortcut span,
.welcome-link-grid a span {
  display: grid;
  min-width: 0;
  gap: 0.2rem;
}

.welcome-shortcut strong,
.welcome-link-grid a strong {
  overflow: hidden;
  color: var(--foreground);
  font-size: 0.9375rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.welcome-shortcut small,
.welcome-link-grid a small {
  color: var(--muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.4;
}

.welcome-shortcut em {
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--muted-foreground);
  padding: 0.25rem 0.55rem;
  font-size: 0.75rem;
  font-style: normal;
}

.welcome-link-grid a > svg:last-child {
  width: 0.95rem;
  height: 0.95rem;
  color: var(--muted-foreground);
}

.ai-setup-container.card {
  display: grid;
  grid-template-columns: 18rem minmax(0, 1fr) 19rem;
  height: clamp(34rem, calc(100vh - 17rem), 52rem);
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.ai-setup-index,
.ai-setup-reader,
.ai-workflow-rail {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 1rem;
}

.ai-setup-index {
  border-right: 1px solid var(--border);
  background: color-mix(in srgb, var(--muted) 62%, transparent);
}

.ai-workflow-rail {
  border-left: 1px solid var(--border);
  background: color-mix(in srgb, var(--muted) 44%, transparent);
}

.ai-pane-head,
.ai-reader-head,
.ai-panel-title {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.ai-pane-head > span,
.ai-panel-title > svg {
  display: inline-flex;
  width: 1.875rem;
  height: 1.875rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--control-radius);
  background: var(--background);
  color: var(--muted-foreground);
}

.ai-pane-head svg,
.ai-panel-title svg {
  width: 1rem;
  height: 1rem;
}

.ai-pane-head h2,
.ai-reader-head h2,
.ai-panel-title h3,
.ai-checklist-panel h3,
.ai-research-queue h3,
.ai-section-list h3 {
  margin: 0;
  color: var(--foreground);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

.ai-pane-head p,
.ai-reader-head p,
.ai-panel-title p,
.ai-section-list p,
.ai-command-card p,
.ai-workflow-step p,
.ai-research-queue p {
  margin: 0.25rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.ai-runtime-strip,
.ai-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.ai-runtime-strip {
  margin-top: 1rem;
}

.ai-runtime-strip span,
.ai-tag-list span,
.ai-status-pill {
  display: inline-flex;
  min-height: 1.5rem;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--background);
  color: var(--muted-foreground);
  padding: 0 0.5rem;
  font-size: 0.75rem;
}

.ai-setup-groups {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.ai-setup-group {
  display: grid;
  gap: 0.5rem;
}

.ai-setup-group > p {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.75rem;
  font-weight: 600;
}

.ai-setup-group > div {
  display: grid;
  gap: 0.375rem;
}

.ai-note-button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: flex-start;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--foreground);
  padding: 0.625rem;
  text-align: left;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    transform 120ms ease;
}

.ai-note-button:hover,
.ai-note-button.is-active {
  border-color: var(--border);
  background: var(--background);
}

.ai-note-button:active {
  transform: translateY(1px);
}

.ai-note-button strong,
.ai-note-button small,
.ai-note-button em {
  display: block;
}

.ai-note-button strong {
  font-size: 0.875rem;
  font-weight: 600;
}

.ai-note-button small {
  margin-top: 0.25rem;
  color: var(--muted-foreground);
  line-height: 1.35;
}

.ai-note-button em {
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  font-style: normal;
}

.ai-setup-reader {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-reader-head {
  justify-content: space-between;
}

.ai-reader-head h2 {
  margin-top: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.ai-reader-head small {
  flex: 0 0 auto;
  color: var(--muted-foreground);
  font-size: 0.75rem;
}

.status-ready {
  border-color: color-mix(in srgb, #22c55e 36%, var(--border));
  color: #15803d;
}

.status-draft {
  border-color: color-mix(in srgb, #f59e0b 36%, var(--border));
  color: #92400e;
}

.status-outline {
  border-color: color-mix(in srgb, #2563eb 32%, var(--border));
  color: #1d4ed8;
}

.status-research {
  border-color: color-mix(in srgb, #71717a 36%, var(--border));
  color: var(--muted-foreground);
}

.status-next {
  border-color: color-mix(in srgb, #71717a 36%, var(--border));
}

.ai-section-list {
  display: grid;
  gap: 0.875rem;
}

.ai-section-list section,
.ai-command-panel,
.ai-checklist-panel,
.ai-research-queue article {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--background);
  padding: 0.875rem;
}

.ai-command-panel {
  display: grid;
  gap: 0.875rem;
}

.ai-command-list {
  display: grid;
  gap: 0.625rem;
}

.ai-command-card {
  display: grid;
  gap: 0.375rem;
  border: 1px solid var(--border);
  border-radius: var(--control-radius);
  background: var(--muted);
  padding: 0.75rem;
}

.ai-command-card span {
  color: var(--foreground);
  font-size: 0.8125rem;
  font-weight: 600;
}

.ai-command-card code {
  overflow-wrap: anywhere;
  border-radius: var(--control-radius);
  background: var(--foreground);
  color: var(--background);
  padding: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.75rem;
  line-height: 1.45;
}

.ai-link-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.625rem;
}

.ai-link-grid a {
  display: grid;
  gap: 0.25rem;
  border: 1px solid var(--border);
  border-radius: var(--control-radius);
  background: var(--muted);
  color: var(--foreground);
  padding: 0.875rem;
  text-decoration: none;
}

.ai-link-grid span {
  color: var(--muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.ai-workflow-rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-workflow-steps {
  display: grid;
  gap: 0.625rem;
}

.ai-workflow-step {
  display: grid;
  grid-template-columns: 1.75rem minmax(0, 1fr);
  gap: 0.625rem;
  border: 1px solid var(--border);
  border-radius: var(--control-radius);
  background: var(--background);
  padding: 0.75rem;
}

.ai-workflow-step > span {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--foreground);
  color: var(--background);
  font-size: 0.75rem;
}

.ai-workflow-step strong {
  display: block;
  font-size: 0.875rem;
}

.ai-checklist-panel {
  display: grid;
  gap: 0.75rem;
}

.ai-checklist-panel > div {
  display: grid;
  gap: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--control-radius);
  background: color-mix(in srgb, var(--muted) 34%, transparent);
}

.ai-research-queue {
  display: grid;
  gap: 0.625rem;
}

.skill-library-workbench.card,
.checklist-workbench.card {
  display: grid;
  grid-template-columns: 18rem minmax(0, 1fr) 18rem;
  height: clamp(36rem, calc(100vh - 17rem), 54rem);
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.skill-index-pane,
.skill-reader-pane,
.skill-side-pane,
.checklist-index-pane,
.checklist-reader-pane,
.checklist-side-pane {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 1rem;
}

.skill-index-pane,
.checklist-index-pane {
  border-right: 1px solid var(--border);
  background: color-mix(in srgb, var(--muted) 62%, transparent);
}

.skill-side-pane,
.checklist-side-pane {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-left: 1px solid var(--border);
  background: color-mix(in srgb, var(--muted) 44%, transparent);
}

.skill-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 1rem;
}

.skill-filter-row button {
  min-height: 2rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--background);
  color: var(--muted-foreground);
  padding: 0 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.skill-filter-row button.is-active {
  border-color: color-mix(in srgb, var(--accent) 34%, var(--border));
  background: color-mix(in srgb, var(--accent) 12%, var(--background));
  color: var(--foreground);
}

.skill-list,
.checklist-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
}

.skill-list-button,
.checklist-list-button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.625rem;
  align-items: flex-start;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--foreground);
  padding: 0.75rem;
  text-align: left;
}

.skill-list-button:hover,
.skill-list-button.is-active,
.checklist-list-button:hover,
.checklist-list-button.is-active {
  border-color: var(--border);
  background: var(--background);
}

.skill-list-button strong,
.skill-list-button small,
.skill-list-button em,
.checklist-list-button strong,
.checklist-list-button small,
.checklist-list-button em {
  display: block;
}

.skill-list-button strong,
.checklist-list-button strong {
  font-size: 0.875rem;
  font-weight: 600;
}

.skill-list-button small,
.checklist-list-button small {
  margin-top: 0.25rem;
  color: var(--muted-foreground);
  font-size: 0.75rem;
  line-height: 1.4;
}

.skill-list-button em,
.checklist-list-button em {
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  font-style: normal;
  white-space: nowrap;
}

.skill-reader-pane,
.checklist-reader-pane {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-reader-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.skill-reader-head h2 {
  margin: 0.5rem 0 0;
  color: var(--foreground);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.skill-reader-head p {
  margin: 0.375rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.5;
}

.skill-markdown-preview,
.checklist-side-pane pre {
  max-width: 100%;
  min-height: 0;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #050505;
  color: #f5f5f5;
  padding: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.75rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.skill-markdown-preview {
  flex: 1 1 auto;
}

.skill-side-pane section,
.checklist-side-pane section,
.checklist-section-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--background);
  padding: 0.875rem;
}

.skill-side-pane h3,
.checklist-side-pane h3,
.checklist-section-card h3 {
  margin: 0;
  color: var(--foreground);
  font-size: 0.9375rem;
  font-weight: 600;
}

.skill-side-pane p,
.checklist-side-pane p,
.checklist-section-card p {
  margin: 0.375rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.checklist-section-list {
  display: grid;
  gap: 0.875rem;
}

.checklist-section-card {
  display: grid;
  gap: 0.75rem;
}

.checklist-section-card > ol,
.checklist-step-node > ol {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.checklist-step-node > ol {
  margin-left: 1rem;
  border-left: 1px solid var(--border);
}

.checklist-step-node .check-row {
  border: 0;
  border-top: 1px solid var(--border);
  border-radius: 0;
  background: color-mix(in srgb, var(--muted) 24%, transparent);
}

.checklist-step-node:first-child > .check-row {
  border-top: 0;
}

.checklist-step-node[data-depth="1"] > .check-row {
  padding-left: 1rem;
  background: color-mix(in srgb, var(--muted) 14%, transparent);
}

.checklist-side-pane pre {
  max-height: 18rem;
  margin: 0.75rem 0 0;
}

.flow-workbench.card {
  display: grid;
  grid-template-columns: 19rem minmax(0, 1fr) 19rem;
  height: clamp(38rem, calc(100vh - 17rem), 56rem);
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.flow-workbench.card.is-architecture-demo {
  grid-template-columns: minmax(0, 1fr);
  height: auto;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.flow-index-pane,
.flow-reader-pane,
.flow-side-pane {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 1rem;
}

.flow-index-pane {
  border-right: 1px solid var(--border);
  background: color-mix(in srgb, var(--muted) 62%, transparent);
}

.flow-reader-pane {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.flow-workbench.card.is-architecture-demo .flow-reader-pane {
  min-height: calc(100vh - 6rem);
  overflow: visible;
  padding: 0;
}

.flow-side-pane {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-left: 1px solid var(--border);
  background: color-mix(in srgb, var(--muted) 44%, transparent);
}

.flow-group-list,
.flow-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
}

.flow-group-button,
.flow-list-button {
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: transparent;
  color: var(--foreground);
  padding: 0.75rem;
  text-align: left;
  text-decoration: none;
}

.flow-group-button {
  display: grid;
  gap: 0.25rem;
}

.flow-list-button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.625rem;
  align-items: flex-start;
}

.flow-group-button:hover,
.flow-group-button.is-active,
.flow-list-button:hover,
.flow-list-button.is-active {
  border-color: var(--border);
  background: var(--background);
}

.flow-group-button strong,
.flow-group-button small,
.flow-list-button strong,
.flow-list-button small,
.flow-list-button em {
  display: block;
}

.flow-group-button strong,
.flow-list-button strong {
  font-size: 0.875rem;
  font-weight: 600;
}

.flow-group-button small,
.flow-list-button small {
  color: var(--muted-foreground);
  font-size: 0.75rem;
  line-height: 1.4;
}

.flow-list-button small {
  margin-top: 0.25rem;
}

.flow-list-button em {
  border-radius: 999px;
  background: var(--muted);
  color: var(--muted-foreground);
  padding: 0.125rem 0.45rem;
  font-size: 0.6875rem;
  font-style: normal;
}

.flow-chart-surface {
  display: grid;
  flex: 0 0 auto;
  gap: 1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--primary) 24%, var(--border));
  border-radius: var(--radius);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent), transparent 40%),
    color-mix(in srgb, var(--background) 94%, var(--muted));
  padding: 1rem;
}

.flow-chart-surface.is-architecture-demo {
  grid-template-rows: auto auto minmax(0, 1fr);
  min-height: calc(100vh - 6rem);
  gap: 0.75rem;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
}

.flow-chart-surface.is-fullscreen {
  position: fixed;
  inset: 0.75rem;
  z-index: 120;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--primary) 26%, var(--border));
  border-radius: var(--radius);
  background: var(--background);
  box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.46);
  padding: 1rem;
}

.flow-chart-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(14rem, 0.68fr) auto;
  gap: 1rem;
  align-items: end;
}

.flow-chart-head h3 {
  margin: 0.45rem 0 0;
  color: var(--foreground);
  font-size: 1.05rem;
  font-weight: 600;
}

.flow-chart-head p {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.flow-board-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: end;
  border: 1px solid color-mix(in srgb, var(--primary) 20%, var(--border));
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--primary) 7%, var(--muted));
  padding: 0.85rem;
}

.flow-board-toolbar:not(.has-selectors) {
  grid-template-columns: auto;
  justify-content: end;
}

.flow-board-actionbar {
  display: inline-flex;
  width: fit-content;
  min-height: 2.9rem;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border: 1px solid color-mix(in srgb, var(--foreground) 12%, transparent);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--background) 82%, var(--card));
  padding: 0.35rem;
}

.flow-board-fullscreen-button {
  display: inline-flex;
  min-height: 2.15rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: max-content;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  color: var(--foreground);
  padding: 0 0.65rem;
  font-size: 0.82rem;
  font-weight: 650;
}

.flow-board-fullscreen-button:hover {
  background: var(--muted);
}

.flow-board-fullscreen-button svg {
  width: 1rem;
  height: 1rem;
}

.flow-react-surface {
  --flow-minimap-bg: rgba(248, 250, 252, 0.97);
  --flow-minimap-mask: rgba(15, 23, 42, 0.14);
  --flow-minimap-stroke: #2563eb;
  --flow-minimap-node-stroke: rgba(15, 23, 42, 0.82);
  height: min(54vh, 34rem);
  min-height: 25rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--foreground) 10%, transparent);
  border-radius: 0.95rem;
  background: color-mix(in srgb, var(--background) 92%, var(--muted));
}

.studio-admin.is-dark .flow-react-surface {
  --flow-minimap-bg: rgba(15, 23, 42, 0.97);
  --flow-minimap-mask: rgba(2, 6, 23, 0.58);
  --flow-minimap-stroke: #38bdf8;
  --flow-minimap-node-stroke: rgba(248, 250, 252, 0.9);
}

.flow-react-surface.is-architecture-demo {
  height: max(34rem, calc(100vh - 15rem));
  min-height: 34rem;
}

.flow-chart-surface.is-fullscreen .flow-react-surface {
  height: 100%;
  min-height: 0;
}

.flow-example-toolbar {
  display: grid;
  grid-template-columns: minmax(11rem, 0.34fr) minmax(14rem, 1fr);
  gap: 0.75rem;
  align-items: end;
  min-width: 0;
}

.flow-example-toolbar label {
  display: grid;
  gap: 0.35rem;
  color: var(--muted-foreground);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.flow-example-toolbar select {
  appearance: none;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 0.65rem;
  background-color: var(--card);
  background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-position: right 0.85rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  color: var(--foreground);
  padding: 0.65rem 2.75rem 0.65rem 0.75rem;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 650;
  text-transform: none;
}

.flow-react-canvas,
.react-flow {
  width: 100%;
  height: 100%;
  direction: ltr;
  --xy-edge-stroke-default: color-mix(in srgb, var(--primary) 38%, var(--border));
  --xy-edge-stroke-width-default: 1.5;
  --xy-minimap-background-color-default: var(--card);
  --xy-minimap-mask-background-color-default: color-mix(in srgb, var(--muted) 70%, transparent);
  --xy-controls-button-background-color-default: var(--card);
  --xy-controls-button-background-color-hover-default: var(--muted);
  --xy-controls-button-color-default: var(--foreground);
  --xy-controls-button-border-color-default: var(--border);
  --xy-controls-box-shadow-default: 0 8px 22px rgba(0, 0, 0, 0.1);
  --xy-background-color-default: transparent;
  --xy-background-pattern-dots-color-default: color-mix(in srgb, var(--foreground) 20%, transparent);
  background-color: transparent;
}

.react-flow__container,
.react-flow__edgelabel-renderer,
.react-flow__viewport-portal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.react-flow__pane {
  z-index: 1;
  touch-action: none;
}

.react-flow__viewport {
  z-index: 2;
  pointer-events: none;
  transform-origin: 0 0;
}

.react-flow__renderer {
  z-index: 4;
}

.react-flow .react-flow__edges {
  position: absolute;
}

.react-flow .react-flow__edges svg {
  position: absolute;
  overflow: visible;
  pointer-events: none;
}

.react-flow__edge {
  pointer-events: visibleStroke;
}

.react-flow__edge-path,
.react-flow__connection-path {
  fill: none;
  stroke: var(--xy-edge-stroke, var(--xy-edge-stroke-default));
  stroke-width: var(--xy-edge-stroke-width, var(--xy-edge-stroke-width-default));
}

.react-flow__edge.animated path {
  animation: dashdraw 0.5s linear infinite;
  stroke-dasharray: 5;
}

.react-flow__arrowhead polyline {
  fill: var(--xy-edge-stroke, var(--xy-edge-stroke-default));
  stroke: var(--xy-edge-stroke, var(--xy-edge-stroke-default));
}

.react-flow__nodes {
  pointer-events: none;
  transform-origin: 0 0;
}

.react-flow__node {
  position: absolute;
  box-sizing: border-box;
  cursor: default;
  pointer-events: all;
  transform-origin: 0 0;
  user-select: none;
}

.react-flow__handle {
  position: absolute;
  width: 0.55rem;
  height: 0.55rem;
  min-width: 0.55rem;
  min-height: 0.55rem;
  border: 1px solid var(--card);
  border-radius: 999px;
  background: var(--primary);
  pointer-events: none;
}

.react-flow__handle-left {
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%);
}

.react-flow__handle-right {
  top: 50%;
  right: 0;
  transform: translate(50%, -50%);
}

.react-flow__handle-top {
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
}

.react-flow__handle-bottom {
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
}

.react-flow__background {
  z-index: -1;
  pointer-events: none;
}

.react-flow__panel {
  position: absolute;
  z-index: 5;
  margin: 0.75rem;
}

.react-flow__panel.top {
  top: 0;
}

.react-flow__panel.bottom {
  bottom: 0;
}

.react-flow__panel.left {
  left: 0;
}

.react-flow__panel.right {
  right: 0;
}

.react-flow__controls {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 0.65rem;
  box-shadow: var(--xy-controls-box-shadow, var(--xy-controls-box-shadow-default));
}

.react-flow__controls-button {
  display: flex;
  width: 1.75rem;
  height: 1.75rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-bottom: 1px solid var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default));
  background: var(--xy-controls-button-background-color, var(--xy-controls-button-background-color-default));
  color: var(--xy-controls-button-color, var(--xy-controls-button-color-default));
  padding: 0.25rem;
}

.react-flow__controls-button:hover {
  background: var(--xy-controls-button-background-color-hover, var(--xy-controls-button-background-color-hover-default));
}

.react-flow__controls-button:last-child {
  border-bottom: 0;
}

.react-flow__controls-button svg {
  width: 0.875rem;
  height: 0.875rem;
  fill: currentColor;
}

.react-flow__minimap {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--foreground) 28%, var(--border));
  border-radius: 0.75rem;
  background: var(--flow-minimap-bg);
  box-shadow: 0 0.9rem 2.2rem rgba(0, 0, 0, 0.3);
  width: 10rem;
  height: 7rem;
  opacity: 1;
}

.react-flow__minimap-svg {
  display: block;
  background: var(--flow-minimap-bg);
}

.react-flow__minimap-mask {
  fill: var(
    --xy-minimap-mask-background-color-props,
    var(--xy-minimap-mask-background-color, var(--xy-minimap-mask-background-color-default))
  );
  stroke: var(--xy-minimap-mask-stroke-color-props, color-mix(in srgb, var(--foreground) 34%, var(--primary)));
  stroke-width: var(--xy-minimap-mask-stroke-width-props, 1.2);
}

.react-flow__minimap-node {
  opacity: 0.96;
  stroke: var(--xy-minimap-node-stroke-color-props, color-mix(in srgb, var(--foreground) 66%, var(--background)));
  stroke-width: var(--xy-minimap-node-stroke-width-props, 2.4);
}

.react-flow__background-pattern.dots {
  fill: var(--xy-background-pattern-color, var(--xy-background-pattern-dots-color-default));
}

.flow-react-node {
  position: relative;
  isolation: isolate;
  display: grid;
  gap: 0.45rem;
  width: 14rem;
  min-height: 5.75rem;
  border: 1px solid color-mix(in srgb, var(--flow-node-color) 34%, var(--border));
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--card) 94%, var(--flow-node-color) 6%);
  color: var(--foreground);
  padding: 0.8rem;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.1);
}

.flow-react-node--hub {
  width: 18rem;
  border-color: color-mix(in srgb, var(--primary) 52%, var(--border));
  background: color-mix(in srgb, var(--card) 88%, var(--primary) 12%);
}

.flow-react-node--input {
  border-radius: 999px;
  place-items: center;
  text-align: center;
}

.flow-react-node--default,
.flow-react-node--service,
.flow-react-node--worker {
  width: 15rem;
}

.flow-react-node--output {
  border-radius: 1.25rem 0.35rem 1.25rem 0.35rem;
  background: color-mix(in srgb, var(--card) 86%, var(--flow-node-color) 14%);
}

.flow-react-node--group {
  width: 100%;
  height: 100%;
  align-content: start;
  border-style: dashed;
  border-color: color-mix(in srgb, var(--flow-node-color) 44%, var(--border));
  background: color-mix(in srgb, var(--flow-node-color) 7%, transparent);
  padding: 1rem;
  box-shadow: none;
  pointer-events: none;
}

.flow-react-node--gateway {
  width: 15.5rem;
  border-radius: 0.4rem;
  clip-path: polygon(8% 0, 100% 0, 92% 100%, 0 100%);
  padding-inline: 1.3rem;
}

.flow-react-node--database {
  width: 14.5rem;
  border-radius: 1rem 1rem 1.35rem 1.35rem;
  padding-top: 1.15rem;
}

.flow-react-node--database::before {
  position: absolute;
  z-index: -1;
  top: -0.05rem;
  right: -0.05rem;
  left: -0.05rem;
  height: 1.05rem;
  border: 1px solid color-mix(in srgb, var(--flow-node-color) 34%, var(--border));
  border-radius: 50%;
  background: color-mix(in srgb, var(--card) 82%, var(--flow-node-color) 18%);
  content: "";
}

.flow-react-node--queue,
.flow-react-node--topic {
  width: 14.5rem;
  border-style: dashed;
}

.flow-react-node--topic {
  border-style: dotted;
  border-width: 2px;
}

.flow-react-node--cache {
  width: 14.5rem;
  overflow: hidden;
}

.flow-react-node--cache::before,
.flow-react-node--cache::after {
  position: absolute;
  right: 0.75rem;
  left: 0.75rem;
  height: 0.38rem;
  border: 1px solid color-mix(in srgb, var(--flow-node-color) 42%, transparent);
  border-radius: 999px;
  content: "";
}

.flow-react-node--cache::before {
  bottom: 0.55rem;
}

.flow-react-node--cache::after {
  bottom: 1rem;
}

.flow-react-node--external {
  width: 15.5rem;
  border-style: dashed;
  background: color-mix(in srgb, var(--background) 92%, var(--flow-node-color) 8%);
}

.flow-react-node--decision {
  width: 10.5rem;
  min-height: 8.25rem;
  place-items: center;
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  padding: 2rem 1.65rem;
  text-align: center;
}

.flow-react-node--risk {
  width: 14.5rem;
  border-color: color-mix(in srgb, #dc2626 60%, var(--border));
  background: color-mix(in srgb, var(--card) 86%, #dc2626 14%);
}

.flow-react-node--note {
  width: 14.5rem;
  border-style: dashed;
  border-radius: 0.35rem;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--flow-node-color) 20%, transparent) 0 0.35rem, transparent 0.35rem),
    color-mix(in srgb, var(--card) 90%, var(--flow-node-color) 10%);
}

.flow-react-node--detail {
  width: 18rem;
}

.flow-react-node.is-active {
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--flow-node-color) 24%, transparent),
    0 16px 38px rgba(0, 0, 0, 0.12);
}

.flow-react-node.tone-source {
  --flow-node-color: #2563eb;
}

.flow-react-node.tone-process {
  --flow-node-color: #0f766e;
}

.flow-react-node.tone-agent {
  --flow-node-color: #d97706;
}

.flow-react-node.tone-review {
  --flow-node-color: #7c3aed;
}

.flow-react-node.tone-storage {
  --flow-node-color: #0891b2;
}

.flow-react-node.tone-event {
  --flow-node-color: #9333ea;
}

.flow-react-node.tone-external {
  --flow-node-color: #64748b;
}

.flow-react-node.tone-risk {
  --flow-node-color: #dc2626;
}

.flow-react-node.tone-output {
  --flow-node-color: #16a34a;
}

.flow-react-node-badge {
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--flow-node-color) 14%, var(--muted));
  color: color-mix(in srgb, var(--flow-node-color) 78%, var(--foreground));
  padding: 0.15rem 0.45rem;
  font-size: 0.67rem;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.flow-react-node strong {
  color: var(--foreground);
  font-size: 0.86rem;
  font-weight: 650;
  line-height: 1.25;
}

.flow-react-node small {
  display: -webkit-box;
  overflow: hidden;
  color: var(--muted-foreground);
  font-size: 0.74rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

.flow-chart-outcome {
  display: grid;
  gap: 0.35rem;
  border: 1px solid color-mix(in srgb, var(--primary) 22%, var(--border));
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--primary) 8%, var(--muted));
  padding: 0.875rem;
}

.flow-chart-outcome span {
  color: var(--muted-foreground);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.flow-chart-outcome strong {
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.45;
}

.flow-step-map {
  display: grid;
  gap: 0.875rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.flow-step-node {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr);
  gap: 0.875rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--background);
  padding: 0.875rem;
}

.flow-step-index {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary) 12%, var(--muted));
  color: var(--foreground);
  font-size: 0.75rem;
  font-weight: 700;
}

.flow-step-node h3 {
  margin: 0;
  color: var(--foreground);
  font-size: 1rem;
  font-weight: 600;
}

.flow-step-node p {
  margin: 0.35rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.5;
}

.flow-step-node dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.625rem;
  margin: 0.75rem 0 0;
}

.flow-step-node dl div,
.flow-side-pane section {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--muted) 24%, transparent);
  padding: 0.75rem;
}

.flow-step-node dt,
.flow-side-pane h3 {
  margin: 0;
  color: var(--foreground);
  font-size: 0.8125rem;
  font-weight: 600;
}

.flow-step-node dd,
.flow-side-pane p {
  margin: 0.35rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.flow-side-pane ul {
  display: grid;
  gap: 0.375rem;
  margin: 0.5rem 0 0;
  padding-left: 1rem;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.native-select {
  appearance: none;
  width: 100%;
  min-height: 2rem;
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  background-color: var(--background);
  background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-position: right 0.7rem center;
  background-repeat: no-repeat;
  background-size: 0.95rem;
  color: var(--foreground);
  padding: 0 2.45rem 0 0.625rem;
}

.tabs-row {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  gap: 0.25rem;
  overflow-x: auto;
  border-bottom: 1px solid var(--border);
}

.tabs-row button {
  min-height: 2.25rem;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--muted-foreground);
  padding: 0 0.75rem;
}

.tabs-row button.is-active {
  border-color: var(--foreground);
  color: var(--foreground);
}

.tabs-wrap {
  flex-wrap: wrap;
  border: 0;
}

.tabs-wrap button {
  border: 1px solid var(--border);
  border-radius: 0.625rem;
}

.tabs-wrap button.is-active {
  background: var(--primary);
  color: var(--primary-foreground);
}

.empty-route {
  min-height: 16rem;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-route svg {
  width: 2rem;
  height: 2rem;
}

.empty-route p {
  max-width: 30rem;
  margin: 0;
  color: var(--muted-foreground);
}

.productivity-layout,
.invoice-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.65fr);
  gap: 1rem;
}

.check-row {
  display: grid;
  grid-template-columns: 0.875rem minmax(0, 1fr);
  align-items: flex-start;
  gap: 0.625rem;
  min-height: auto;
  border: 0;
  border-bottom: 1px solid var(--border);
  border-radius: 0;
  padding: 0.75rem;
}

.check-row:last-child {
  border-bottom: 0;
}

.check-row input {
  width: 0.875rem;
  height: 0.875rem;
  margin: 0.1875rem 0 0;
  accent-color: var(--primary);
}

.check-row span {
  display: grid;
  gap: 0.1875rem;
}

.check-row strong {
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.35;
}

.check-row small {
  color: var(--muted-foreground);
  font-size: 0.8125rem;
  line-height: 1.45;
}

.preview-route {
  min-height: calc(100vh - 6rem);
}

.preview-shell {
  display: grid;
  grid-template-columns: minmax(14rem, 0.35fr) minmax(0, 1fr);
  min-height: 32rem;
  padding: 0;
}

.preview-list {
  display: grid;
  align-content: start;
  border-right: 1px solid var(--border);
}

.preview-list button {
  display: grid;
  gap: 0.25rem;
  min-height: 4.75rem;
  background: transparent;
  color: var(--foreground);
  padding: 0.875rem 1rem;
  text-align: left;
}

.preview-list button.is-active {
  background: var(--muted);
}

.preview-list span,
.preview-thread p {
  color: var(--muted-foreground);
}

.preview-thread {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.25rem;
}

.preview-thread h2 {
  margin: 0;
}

.preview-thread textarea {
  min-height: 9rem;
  resize: vertical;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--background);
  color: var(--foreground);
  padding: 0.875rem;
}

.preview-avatar {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--muted);
}

.mail-route,
.chat-route {
  min-height: calc(100vh - 6rem);
}

.mail-workbench,
.chat-workbench {
  display: grid;
  min-height: 42rem;
  padding: 0;
}

.mail-workbench {
  grid-template-columns: minmax(20rem, 24rem) minmax(0, 1fr);
}

.chat-workbench {
  grid-template-columns: minmax(19rem, 23rem) minmax(0, 1fr);
}

.chat-workbench.has-profile {
  grid-template-columns: minmax(18rem, 21rem) minmax(0, 1fr) minmax(16rem, 19rem);
}

.mail-list-pane,
.mail-detail-pane,
.chat-list-pane,
.chat-thread-pane,
.chat-profile-pane {
  min-width: 0;
  min-height: 0;
}

.mail-list-pane,
.chat-list-pane {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  border-right: 1px solid var(--border);
  padding: 0.875rem;
}

.mail-detail-pane,
.chat-thread-pane {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.875rem;
}

.chat-profile-pane {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
  border-left: 1px solid var(--border);
  padding: 1rem;
}

.mail-pane-toolbar,
.mail-detail-toolbar,
.chat-thread-head,
.profile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.mail-pane-toolbar h2,
.mail-message-head h2,
.chat-thread-head h2,
.profile-head h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.2;
}

.mail-pane-toolbar p,
.mail-message-head p,
.chat-thread-head p,
.profile-head p {
  margin: 0.25rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.mail-toolbar-actions,
.composer-actions,
.profile-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.icon-ghost,
.primary-icon {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: var(--foreground);
  background: transparent;
}

.icon-ghost:hover {
  background: var(--muted);
}

.primary-icon {
  background: var(--primary);
  color: var(--primary-foreground);
}

.icon-ghost svg,
.primary-icon svg {
  width: 1rem;
  height: 1rem;
}

.studio-search-field {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  align-items: center;
  gap: 0.5rem;
  min-height: 2rem;
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  background: var(--background);
  padding: 0 0.625rem;
  color: var(--muted-foreground);
}

.studio-search-field input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--foreground);
}

.mail-groups,
.chat-groups {
  min-height: 0;
  overflow: auto;
}

.mail-group,
.chat-group {
  display: grid;
  gap: 0.375rem;
}

.mail-group + .mail-group,
.chat-group + .chat-group {
  margin-top: 0.75rem;
}

.mail-group-title {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.75rem;
}

.mail-row-list {
  display: grid;
  gap: 0.25rem;
}

.mail-row,
.chat-row {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 5.5rem;
  grid-template-columns: 2.25rem minmax(0, 1fr);
  gap: 0.75rem;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--foreground);
  padding: 0.75rem;
  text-align: left;
}

.chat-row {
  grid-template-columns: 2.25rem minmax(0, 1fr) auto;
}

.mail-row:hover,
.mail-row.is-active,
.chat-row:hover,
.chat-row.is-active {
  background: var(--muted);
}

.mail-row.is-active::before,
.chat-row.is-active::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--primary);
}

.mail-avatar,
.chat-avatar {
  position: relative;
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  background: var(--background);
  color: var(--foreground);
  font-size: 0.75rem;
  font-weight: 600;
}

.chat-avatar.is-large {
  width: 2.75rem;
  height: 2.75rem;
}

.chat-avatar i {
  position: absolute;
  right: -0.0625rem;
  bottom: -0.0625rem;
  width: 0.625rem;
  height: 0.625rem;
  border: 2px solid var(--background);
  border-radius: 999px;
  background: #16a34a;
}

.mail-row-body,
.chat-row-body {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.mail-row-top,
.mail-row-subject,
.mail-row-preview {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mail-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.mail-row-top strong {
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mail-row-top small,
.mail-row-preview,
.mail-labels span,
.mail-recipient-row small,
.attachment-pill small {
  color: var(--muted-foreground);
  font-size: 0.75rem;
}

.mail-row-subject {
  color: var(--foreground);
  font-size: 0.8125rem;
  font-weight: 500;
}

.mail-row-subject i {
  display: inline-block;
  width: 0.45rem;
  height: 0.45rem;
  margin-left: 0.35rem;
  border-radius: 999px;
  background: #2563eb;
  vertical-align: middle;
}

.mail-labels,
.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.mail-labels span,
.profile-tags span {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  min-height: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--background);
  padding: 0 0.45rem;
}

.mail-labels svg {
  width: 0.7rem;
  height: 0.7rem;
}

.mail-message-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.priority-pill,
.unread-count {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 0.25rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.unread-count {
  width: 1.5rem;
  height: 1.5rem;
  align-self: center;
  padding: 0;
}

.mail-recipient-row,
.chat-contact-summary {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}

.mail-recipient-row p {
  margin: 0.2rem 0;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.attachment-list {
  display: grid;
  gap: 0.5rem;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 0;
}

.attachment-list > div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.attachment-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2rem;
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  background: var(--muted);
  color: var(--foreground);
  padding: 0 0.625rem;
}

.mail-body {
  flex: 1;
  overflow: auto;
  margin: 0;
  color: var(--foreground);
  line-height: 1.7;
  white-space: pre-wrap;
}

.composer-box,
.chat-composer {
  display: grid;
  gap: 0.75rem;
  margin-top: auto;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--background);
  padding: 0.75rem;
}

.composer-input {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  gap: 0.5rem;
  align-items: center;
}

.composer-input input,
.chat-composer textarea {
  width: 100%;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: var(--foreground);
}

.composer-actions {
  justify-content: flex-end;
}

.chat-tabs,
.profile-tabs,
.chat-composer-tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--border);
}

.chat-tabs button,
.profile-tabs button,
.chat-composer-tabs button {
  min-height: 2rem;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--muted-foreground);
  padding: 0 0.625rem;
  text-transform: capitalize;
}

.chat-tabs button.is-active,
.profile-tabs button.is-active,
.chat-composer-tabs button.is-active {
  border-color: var(--foreground);
  color: var(--foreground);
}

.thread-date-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--muted-foreground);
  font-size: 0.75rem;
}

.thread-date-divider::before,
.thread-date-divider::after {
  content: "";
  height: 1px;
  flex: 1;
  background: var(--border);
}

.thread-date-divider span {
  border-radius: 999px;
  background: var(--muted);
  padding: 0.25rem 0.625rem;
}

.message-list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
  padding: 0.25rem 0;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.message-row.is-outbound {
  flex-direction: row-reverse;
}

.message-bubble {
  max-width: min(34rem, 80%);
  border-radius: 0.9rem;
  background: var(--muted);
  padding: 0.75rem 0.875rem;
}

.message-row.is-outbound .message-bubble {
  background: var(--primary);
  color: var(--primary-foreground);
}

.message-bubble p {
  margin: 0;
  line-height: 1.55;
}

.message-bubble small {
  display: block;
  margin-top: 0.375rem;
  color: var(--muted-foreground);
  font-size: 0.75rem;
}

.message-row.is-outbound .message-bubble small {
  color: color-mix(in srgb, var(--primary-foreground) 72%, transparent);
}

.profile-head {
  align-items: flex-start;
}

.profile-detail-list {
  display: grid;
  gap: 0.75rem;
}

.profile-detail-row {
  display: grid;
  grid-template-columns: 1rem auto minmax(0, 1fr);
  gap: 0.5rem;
  align-items: center;
  font-size: 0.8125rem;
}

.profile-detail-row svg {
  color: var(--muted-foreground);
}

.profile-detail-row span {
  color: var(--muted-foreground);
}

.profile-detail-row strong {
  overflow: hidden;
  font-weight: 500;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-card {
  padding: 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar-grid button {
  display: grid;
  min-height: 6rem;
  align-content: start;
  gap: 0.35rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: transparent;
  color: var(--foreground);
  padding: 0.75rem;
  text-align: left;
}

.calendar-grid button.has-event {
  background: var(--muted);
}

.calendar-grid small {
  color: var(--muted-foreground);
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(15rem, 1fr));
  gap: 1rem;
  overflow-x: auto;
}

.kanban-column {
  display: grid;
  align-content: start;
  gap: 0.75rem;
  min-height: 28rem;
  border: 1px solid var(--border);
  border-radius: 0.875rem;
  background: var(--muted);
  padding: 0.875rem;
}

.kanban-card {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--card);
  padding: 0.875rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.invoice-paper {
  min-height: 28rem;
  border: 1px solid var(--border);
  border-radius: 0.875rem;
  background: var(--card);
  padding: 2rem;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
}

.invoice-line,
.invoice-total {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--border);
  padding: 1rem 0;
}

.invoice-total {
  margin-top: 2rem;
  font-size: 1.125rem;
}

.form-row {
  display: grid;
  gap: 0.375rem;
  margin-top: 0.875rem;
}

.form-row span {
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.form-row input {
  min-height: 2.5rem;
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  background: var(--background);
  color: var(--foreground);
  padding: 0 0.75rem;
}

.auth-route {
  min-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.auth-route .route-heading,
.auth-route .metric-grid {
  width: min(100%, 72rem);
}

.auth-card {
  width: min(100%, 26rem);
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.primary-action {
  width: 100%;
  min-height: 2.5rem;
  margin-top: 1rem;
  border-radius: 0.625rem;
  background: var(--primary);
  color: var(--primary-foreground);
}

.command-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: start center;
  background: rgba(0, 0, 0, 0.32);
  padding: 12vh 1rem 1rem;
}

.command-dialog {
  width: min(42rem, 100%);
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 0.875rem;
  background: var(--card);
  color: var(--foreground);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}

.command-input-row {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr) 2rem;
  gap: 0.75rem;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 0.875rem;
}

.command-input-row input {
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--foreground);
}

.command-input-row button {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--foreground);
}

.command-results {
  display: grid;
  max-height: 24rem;
  overflow: auto;
  padding: 0.5rem;
}

.command-section-label {
  margin: 0.5rem 0 0.125rem;
  padding: 0 0.75rem;
  color: var(--muted-foreground);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: uppercase;
}

.command-results a {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
  border-radius: 0.625rem;
  padding: 0.75rem;
  text-decoration: none;
}

.command-results a:hover,
.command-results a.is-active {
  background: var(--muted);
}

.command-results small {
  display: block;
  overflow: hidden;
  color: var(--muted-foreground);
  text-overflow: ellipsis;
  white-space: nowrap;
}

#dashboard,
#release-signal,
#system-workstreams {
  scroll-margin-top: 4.25rem;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.metric-card,
.card {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--foreground) 10%, transparent);
  border-radius: var(--radius);
  background: var(--card);
  color: var(--card-foreground);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.metric-card {
  min-height: 9.75rem;
  background: linear-gradient(to top, rgba(10, 10, 10, 0.035), transparent), var(--card);
  padding: 1rem;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.metric-card:hover,
.activity-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--foreground) 16%, transparent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.metric-icon {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  background: var(--muted);
  color: var(--muted-foreground);
}

.metric-card p {
  margin: 0.5rem 0 0.625rem;
  color: var(--muted-foreground);
  font-size: 0.875rem;
}

.metric-value-row {
  flex-wrap: wrap;
  gap: 0.625rem;
}

.metric-value-row strong {
  font-size: 1.875rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
}

.trend-badge,
.soft-pill,
.billing-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border-radius: 999px;
  white-space: nowrap;
}

.trend-badge {
  height: 1.25rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.trend-up {
  background: var(--primary);
  color: var(--primary-foreground);
}

.trend-down {
  background: #ffe4e6;
  color: #ff0000;
}

.trend-badge svg {
  width: 0.75rem;
  height: 0.75rem;
}

.metric-helper {
  display: block;
  margin-top: 0.25rem;
  color: var(--muted-foreground);
  font-size: 0.875rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.mail-workbench.card,
.chat-workbench.card {
  display: grid;
  gap: 0;
  padding: 0;
}

.card-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
}

.card-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.15;
}

.card-header p {
  margin: 0.35rem 0 0;
  color: var(--muted-foreground);
}

.card-actions {
  gap: 0.5rem;
}

.outline-button,
.select-button {
  min-height: 2rem;
  gap: 0.375rem;
  border-color: var(--border);
  background: var(--background);
  padding: 0 0.625rem;
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 500;
}

.select-button {
  min-width: 7rem;
  justify-content: space-between;
  font-weight: 400;
}

.activity-card {
  min-height: 25.625rem;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.studio-chart-shell {
  display: grid;
  gap: 0.5rem;
}

.studio-chart {
  width: 100%;
  height: 17.25rem;
}

.studio-chart .recharts-wrapper,
.studio-chart .recharts-surface,
.studio-chart .recharts-layer {
  outline: none;
}

.studio-chart .recharts-cartesian-axis-tick text {
  fill: var(--muted-foreground);
  font-size: 12px;
}

.studio-chart .recharts-cartesian-grid line {
  stroke: var(--border);
}

.studio-chart .recharts-curve {
  transition: opacity 180ms ease;
}

.chart-legend.interactive {
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 0.25rem;
  color: var(--foreground);
  font-size: 0.75rem;
}

.chart-legend.interactive button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 0;
  background: transparent;
  padding: 0.25rem 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  opacity: 0.72;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.chart-legend.interactive button:hover,
.chart-legend.interactive button:focus-visible,
.chart-legend.interactive button.is-active {
  opacity: 1;
  outline: none;
  transform: translateY(-1px);
}

.chart-legend.interactive i {
  width: 0.5rem;
  height: 0.5rem;
  flex: 0 0 auto;
  border-radius: 0.125rem;
}

.studio-chart-tooltip {
  display: grid;
  min-width: 12.5rem;
  gap: 0.625rem;
  border: 1px solid color-mix(in srgb, var(--foreground) 12%, transparent);
  border-radius: 0.75rem;
  background: var(--background);
  padding: 0.625rem 0.75rem;
  color: var(--foreground);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  font-size: 0.75rem;
}

.studio-chart-tooltip strong {
  font-weight: 600;
}

.studio-chart-tooltip div {
  display: grid;
  gap: 0.45rem;
}

.studio-chart-tooltip span {
  display: grid;
  grid-template-columns: 0.5rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
}

.studio-chart-tooltip i {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 2px;
}

.studio-chart-tooltip em {
  color: var(--muted-foreground);
  font-style: normal;
}

.studio-chart-tooltip b {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.records-card {
  gap: 0.875rem;
}

.ops-kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--foreground) 10%, transparent);
  border-radius: var(--radius);
  background: var(--card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.ops-kpi-card {
  display: grid;
  gap: 0.5rem;
  min-height: 7.5rem;
  border-right: 1px solid var(--border);
  padding: 1rem;
}

.ops-kpi-card:last-child {
  border-right: 0;
}

.ops-kpi-card span {
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.ops-kpi-card strong {
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1;
}

.ops-kpi-card p {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.ops-kpi-card.tone-success {
  background: linear-gradient(to bottom, rgba(34, 197, 94, 0.06), transparent);
}

.ops-kpi-card.tone-warning {
  background: linear-gradient(to bottom, rgba(245, 158, 11, 0.08), transparent);
}

.ops-detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(17rem, 0.85fr) minmax(18rem, 0.85fr);
  gap: 1rem;
  align-items: stretch;
}

.component-inventory,
.distribution-card,
.checklist-panel {
  min-height: 18rem;
}

.component-token-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.component-token {
  display: inline-flex;
  min-height: 1.875rem;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--muted);
  padding: 0 0.625rem;
  color: var(--foreground);
  font-size: 0.8125rem;
}

.component-samples {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
}

.distribution-layout {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
}

.donut-chart {
  position: relative;
  display: grid;
  width: 9rem;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 999px;
}

.donut-chart::after {
  position: absolute;
  inset: 1.65rem;
  border-radius: inherit;
  background: var(--card);
  content: "";
}

.donut-chart span {
  position: relative;
  z-index: 1;
  font-size: 1.125rem;
  font-weight: 600;
}

.distribution-list {
  display: grid;
  gap: 0.75rem;
}

.distribution-list div {
  display: grid;
  grid-template-columns: 0.625rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
}

.distribution-list span {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 999px;
}

.distribution-list p {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.distribution-list strong {
  font-weight: 500;
}

.checklist-row {
  align-items: flex-start;
}

.checklist-row span {
  display: grid;
  gap: 0.25rem;
}

.checklist-row small {
  color: var(--muted-foreground);
}

.workstreams-card {
  scroll-margin-top: 4.25rem;
}

.table-header {
  align-items: center;
}

.table-toolbar {
  gap: 0.5rem;
}

.workstream-search {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  align-items: center;
  gap: 0.5rem;
  width: min(20rem, 100%);
  height: 2rem;
  border: 1px solid var(--input);
  border-radius: 0.625rem;
  background: var(--background);
  padding: 0 0.625rem;
  color: var(--muted-foreground);
}

.workstream-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--foreground);
}

.workstream-search input::placeholder {
  color: var(--muted-foreground);
}

.toolbar-spacer {
  flex: 1;
}

.table-shell {
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
}

table {
  width: 100%;
  min-width: 840px;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

th,
td {
  height: 3.9375rem;
  border-bottom: 1px solid var(--border);
  padding: 0 1rem;
  vertical-align: middle;
}

th {
  height: 2.875rem;
  color: var(--foreground);
  font-weight: 600;
}

th:first-child,
td:first-child {
  width: 3.75rem;
  text-align: center;
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: var(--muted);
}

.checkbox {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  background: var(--background);
}

.workstream-cell {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 0.625rem;
  align-items: center;
}

.workstream-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
}

.workstream-avatar svg {
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
}

.soft-pill {
  min-height: 1.25rem;
  border: 1px solid var(--border);
  background: var(--muted);
  color: var(--muted-foreground);
  padding: 0 0.45rem;
  font-size: 0.75rem;
}

.billing-pill {
  min-height: 1.25rem;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--muted-foreground);
  padding: 0 0.45rem;
  font-size: 0.75rem;
}

.billing-paid svg {
  width: 0.75rem;
  height: 0.75rem;
  color: #22c55e;
}

.billing-pending {
  color: #717171;
}

.billing-unpaid {
  color: #dc2626;
}

.joined-cell {
  display: block;
}

@media (max-width: 1480px) {
  .ai-setup-container.card {
    grid-template-columns: 17rem minmax(0, 1fr);
    height: clamp(38rem, calc(100vh - 14rem), 58rem);
  }

  .ai-workflow-rail {
    grid-column: 1 / -1;
    border-top: 1px solid var(--border);
    border-left: 0;
  }
}

@media (max-width: 1480px) {
  .skill-library-workbench.card,
  .checklist-workbench.card,
  .flow-workbench.card {
    grid-template-columns: minmax(15rem, 0.34fr) minmax(0, 1fr);
    height: auto;
    min-height: auto;
    overflow: visible;
  }

  .skill-index-pane,
  .skill-reader-pane,
  .skill-side-pane,
  .checklist-index-pane,
  .checklist-reader-pane,
  .checklist-side-pane,
  .flow-index-pane,
  .flow-reader-pane,
  .flow-side-pane {
    overflow: visible;
  }

  .skill-side-pane,
  .checklist-side-pane,
  .flow-side-pane {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-top: 1px solid var(--border);
    border-left: 0;
  }

  .skill-markdown-preview {
    max-height: 38rem;
  }
}

@media (max-width: 1180px) {
  .metric-grid,
  .ops-kpi-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ops-kpi-card:nth-child(2n) {
    border-right: 0;
  }

  .ops-kpi-card:nth-child(-n + 2) {
    border-bottom: 1px solid var(--border);
  }

  .ops-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .component-inventory {
    grid-column: 1 / -1;
  }

  .skill-library-workbench.card,
  .checklist-workbench.card,
  .flow-workbench.card {
    grid-template-columns: minmax(14rem, 0.38fr) minmax(0, 1fr);
    height: auto;
    min-height: auto;
    overflow: visible;
  }

  .skill-index-pane,
  .skill-reader-pane,
  .skill-side-pane,
  .checklist-index-pane,
  .checklist-reader-pane,
  .checklist-side-pane,
  .flow-index-pane,
  .flow-reader-pane,
  .flow-side-pane {
    overflow: visible;
  }

  .skill-side-pane,
  .checklist-side-pane,
  .flow-side-pane {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-top: 1px solid var(--border);
    border-left: 0;
  }

  .ai-setup-container.card {
    height: auto;
    min-height: auto;
    overflow: visible;
  }
}

@media (max-width: 1080px) {
  .ai-setup-container.card,
  .skill-library-workbench.card,
  .checklist-workbench.card,
  .flow-workbench.card {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
    overflow: visible;
  }

  .ai-setup-index,
  .ai-setup-reader,
  .ai-workflow-rail,
  .skill-index-pane,
  .skill-reader-pane,
  .skill-side-pane,
  .checklist-index-pane,
  .checklist-reader-pane,
  .checklist-side-pane,
  .flow-index-pane,
  .flow-reader-pane,
  .flow-side-pane {
    overflow: visible;
  }

  .ai-setup-index,
  .skill-index-pane,
  .checklist-index-pane,
  .flow-index-pane {
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }

  .ai-workflow-rail,
  .skill-side-pane,
  .checklist-side-pane,
  .flow-side-pane {
    grid-column: auto;
    grid-template-columns: 1fr;
    border-left: 0;
    border-top: 1px solid var(--border);
  }

  .studio-flow-route .flow-reader-pane {
    order: 1;
  }

  .studio-flow-route .flow-side-pane {
    order: 2;
  }

  .studio-flow-route .flow-index-pane {
    order: 3;
    border-top: 1px solid var(--border);
    border-bottom: 0;
  }

  .flow-example-toolbar {
    grid-template-columns: 1fr;
  }

  .flow-board-toolbar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .flow-board-actionbar {
    justify-self: start;
  }

  .welcome-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .studio-admin,
  .studio-admin.is-sidebar-collapsed,
  .studio-admin.is-sidebar-hidden,
  .studio-admin[data-sidebar-variant="sidebar"],
  .studio-admin[data-sidebar-variant="floating"] {
    grid-template-columns: 1fr;
    gap: 0;
    height: 100dvh;
    min-height: 100dvh;
    padding: 0;
  }

  .studio-sidebar,
  .studio-admin[data-sidebar-variant="sidebar"] .studio-sidebar,
  .studio-admin[data-sidebar-variant="floating"] .studio-sidebar {
    display: none;
    top: 0;
    height: 100dvh;
    border-radius: 0;
  }

  .studio-admin.is-mobile-open .studio-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 80;
    display: flex;
    height: 100dvh;
    width: min(22rem, calc(100vw - 1rem));
    max-width: calc(100vw - 1rem);
    border-width: 0 1px 0 0;
    border-radius: 0 0.875rem 0.875rem 0;
    box-shadow: 16px 0 40px rgba(0, 0, 0, 0.16);
  }

  .studio-admin.is-mobile-open .sidebar-scrim {
    position: fixed;
    inset: 0;
    z-index: 70;
    display: block;
    background: rgba(0, 0, 0, 0.34);
  }

  .studio-admin.is-mobile-open .sidebar-brand {
    justify-content: flex-start;
  }

  .studio-admin.is-mobile-open .sidebar-brand span,
  .studio-admin.is-mobile-open .quick-create span,
  .studio-admin.is-mobile-open .sidebar-menu-button span:not(.sidebar-badge) {
    display: inline;
  }

  .studio-admin.is-mobile-open .quick-create {
    width: 100%;
    justify-content: flex-start;
  }

  .studio-admin.is-mobile-open .sidebar-menu-button {
    justify-content: flex-start;
  }

  .studio-admin.is-mobile-open .sidebar-badge {
    display: inline-flex;
    align-items: center;
  }

  .studio-admin.is-mobile-open .sidebar-chevron {
    display: block;
  }

  .sidebar-close {
    display: inline-flex;
  }

  .sidebar-scroll {
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .studio-main,
  .studio-admin[data-sidebar-variant="sidebar"] .studio-main,
  .studio-admin[data-sidebar-variant="floating"] .studio-main {
    height: 100dvh;
    min-height: 0;
    margin: 0;
    border: 0;
    border-radius: 0;
  }

  .studio-topbar {
    height: 3.25rem;
    min-height: 3.25rem;
    border-radius: 0;
    padding: 0 0.75rem;
  }

  .topbar-left {
    flex: 0 1 auto;
    gap: 0.5rem;
    min-width: 0;
    max-width: calc(100% - 3rem);
  }

  .topbar-actions {
    flex: 0 0 auto;
    gap: 0.375rem;
    margin-left: auto;
  }

  .topbar-separator {
    display: none;
  }

  .preferences-anchor {
    display: flex;
    flex: 0 0 auto;
  }

  .preferences-anchor .topbar-icon {
    display: inline-flex;
  }

  .sidebar-footer {
    display: none;
  }

  .search-command {
    min-width: 2.25rem;
    height: 2.25rem;
    padding: 0 0.625rem;
  }

  .search-command span {
    max-width: 5.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .topbar-actions .topbar-icon:nth-child(n + 2),
  .topbar-avatar,
  .user-avatar,
  .user-card {
    display: none;
  }

  .search-command kbd {
    display: none;
  }

  .preferences-popover {
    position: fixed;
    top: 3.75rem;
    right: 0.75rem;
    left: 0.75rem;
    width: auto;
    max-height: calc(100dvh - 4.5rem);
    overflow: auto;
  }

  .dashboard-content {
    width: 100%;
    gap: 1rem;
    padding: 0.875rem;
  }

  .route-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.875rem;
  }

  .route-heading > div {
    width: 100%;
    min-width: 0;
  }

  .route-heading h1 {
    font-size: 1.375rem;
    line-height: 1.15;
  }

  .route-heading p {
    max-width: 100%;
    font-size: 0.875rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .route-actions {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: stretch;
  }

  .route-actions > * {
    width: 100%;
    min-height: 2.25rem;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.625rem;
  }

  .metric-card {
    min-height: 6.75rem;
    padding: 0.75rem;
  }

  .metric-icon {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.45rem;
  }

  .metric-card p {
    margin: 0.45rem 0 0.5rem;
    font-size: 0.75rem;
    line-height: 1.35;
  }

  .metric-value-row strong {
    font-size: 1.375rem;
  }

  .trend-badge {
    height: 1.125rem;
    padding: 0 0.375rem;
    font-size: 0.6875rem;
  }

  .metric-helper {
    font-size: 0.75rem;
    line-height: 1.35;
  }

  .ops-kpi-strip {
    grid-template-columns: 1fr;
  }

  .ops-kpi-card {
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }

  .ops-kpi-card:last-child {
    border-bottom: 0;
  }

  .route-grid,
  .ops-detail-grid,
  .ai-setup-container.card,
  .skill-library-workbench.card,
  .checklist-workbench.card,
  .flow-workbench.card,
  .productivity-layout,
  .invoice-layout,
  .preview-shell,
  .mail-workbench,
  .chat-workbench,
  .chat-workbench.has-profile {
    grid-template-columns: 1fr;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }

  .component-inventory {
    grid-column: auto;
  }

  .distribution-layout {
    grid-template-columns: 1fr;
  }

  .donut-chart {
    width: min(12rem, 100%);
    justify-self: center;
  }

  .preview-list,
  .ai-setup-index,
  .skill-index-pane,
  .checklist-index-pane,
  .flow-index-pane,
  .mail-list-pane,
  .chat-list-pane,
  .chat-profile-pane {
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }

  .chat-profile-pane {
    border-left: 0;
  }

  .ai-workflow-rail,
  .skill-side-pane,
  .checklist-side-pane,
  .flow-side-pane {
    grid-template-columns: 1fr;
    border-left: 0;
    border-top: 1px solid var(--border);
  }

  .ai-setup-index,
  .ai-setup-reader,
  .ai-workflow-rail,
  .skill-index-pane,
  .skill-reader-pane,
  .skill-side-pane,
  .checklist-index-pane,
  .checklist-reader-pane,
  .checklist-side-pane,
  .flow-index-pane,
  .flow-reader-pane,
  .flow-side-pane {
    overflow: visible;
    padding: 0.875rem;
  }

  .flow-chart-head {
    grid-template-columns: 1fr;
    gap: 0.625rem;
    align-items: start;
  }

  .welcome-shell,
  .welcome-link-grid {
    grid-template-columns: 1fr;
  }

  .ai-pane-head,
  .ai-panel-title {
    gap: 0.625rem;
  }

  .ai-reader-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
  }

  .ai-reader-head h2 {
    margin-top: 0.25rem;
    font-size: 1.2rem;
  }

  .ai-runtime-strip {
    gap: 0.3125rem;
    margin-top: 0.75rem;
  }

  .ai-note-button {
    grid-template-columns: 1fr;
  }

  .ai-note-button em {
    justify-self: flex-start;
  }

  .skill-reader-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
  }

  .skill-reader-head h2 {
    font-size: 1.2rem;
  }

  .route-heading .outline-button,
  .skill-reader-head .outline-button {
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    white-space: normal;
  }

  .skill-list-button,
  .checklist-list-button,
  .flow-list-button {
    grid-template-columns: 1fr;
  }

  .skill-list-button em,
  .checklist-list-button em,
  .flow-list-button em {
    justify-self: flex-start;
  }

  .flow-step-node,
  .flow-step-node dl {
    grid-template-columns: 1fr;
  }

  .ai-command-card code {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .ai-workflow-step {
    grid-template-columns: 1.5rem minmax(0, 1fr);
    padding: 0.625rem;
  }

  .check-row {
    align-items: flex-start;
    min-height: auto;
    padding: 0.625rem;
  }

  .ai-link-grid {
    grid-template-columns: 1fr;
  }

  .mail-workbench,
  .chat-workbench,
  .ai-setup-container.card,
  .skill-library-workbench.card,
  .checklist-workbench.card,
  .flow-workbench.card {
    height: auto;
    min-height: auto;
    overflow: visible;
  }

  .mail-detail-toolbar,
  .chat-thread-head,
  .mail-message-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .message-bubble {
    max-width: 86%;
  }

  .calendar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .calendar-grid button {
    min-height: 5rem;
  }

  .card-header,
  .activity-header,
  .table-header {
    grid-template-columns: 1fr;
  }

  .card-actions,
  .table-toolbar {
    flex-wrap: wrap;
  }

  .toolbar-spacer {
    display: none;
  }

  .workstream-search {
    width: 100%;
  }

  .studio-chart {
    height: 15rem;
  }

  .chart-legend.interactive {
    justify-content: flex-start;
  }

  .workstreams-card .table-shell {
    overflow: visible;
    border: 0;
    border-radius: 0;
  }

  .workstreams-card table,
  .workstreams-card tbody,
  .workstreams-card tr,
  .workstreams-card td {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .workstreams-card thead,
  .workstreams-card td:first-child {
    display: none;
  }

  .workstreams-card tbody {
    display: grid;
    gap: 0.75rem;
  }

  .workstreams-card tr {
    display: grid;
    gap: 0.625rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--card);
    padding: 0.75rem;
  }

  .workstreams-card td {
    display: grid;
    grid-template-columns: 5.5rem minmax(0, 1fr);
    align-items: center;
    height: auto;
    border-bottom: 0;
    padding: 0;
    text-align: left;
  }

  .workstreams-card td::before {
    color: var(--muted-foreground);
    content: attr(data-label);
    font-size: 0.75rem;
  }

  .workstreams-card td[data-label="Workstream"] {
    grid-template-columns: 1fr;
  }

  .workstreams-card td[data-label="Workstream"]::before {
    display: none;
  }

  .workstream-cell {
    grid-template-columns: 1.75rem minmax(0, 1fr);
  }

  .workstream-avatar {
    width: 1.75rem;
    height: 1.75rem;
  }
}

@media (max-width: 640px) {
  .metric-grid,
  .route-actions,
  .welcome-shortcut,
  .welcome-link-grid a,
  .profile-link-grid {
    grid-template-columns: 1fr;
  }

  .studio-flow-route .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .route-actions {
    display: grid;
  }

  .message-bubble {
    max-width: 92%;
  }
}

@media (max-width: 520px) {
  .search-command span {
    display: none;
  }

  .route-actions,
  .calendar-grid {
    grid-template-columns: 1fr;
  }

  .preferences-popover {
    top: 3.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-height: calc(100dvh - 4rem);
    padding: 0.875rem;
  }

  .preference-segment,
  .preference-segment[data-columns="2"],
  .preference-segment[data-columns="3"] {
    grid-template-columns: 1fr;
  }

  .metric-card {
    min-height: auto;
  }

  .ai-setup-index,
  .ai-setup-reader,
  .ai-workflow-rail {
    padding: 0.75rem;
  }
}
`;
