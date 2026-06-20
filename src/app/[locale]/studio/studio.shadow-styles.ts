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
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --muted: #f5f5f5;
  --muted-foreground: #717171;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --primary: #171717;
  --primary-foreground: #fafafa;
  --sidebar: #fafafa;
  --sidebar-foreground: #0a0a0a;
  --sidebar-accent: #f4f4f5;
  --sidebar-border: #e5e5e5;
  --ring: #a1a1a1;
  --radius: 0.75rem;
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr);
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--sidebar);
  color: var(--foreground);
  font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  font-size: 14px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.studio-admin.is-dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #111111;
  --card-foreground: #fafafa;
  --muted: #1f1f1f;
  --muted-foreground: #a3a3a3;
  --border: #262626;
  --input: #333333;
  --primary: #fafafa;
  --primary-foreground: #171717;
  --sidebar: #111111;
  --sidebar-foreground: #fafafa;
  --sidebar-accent: #1f1f1f;
  --sidebar-border: #262626;
}

.studio-admin.is-sidebar-collapsed {
  grid-template-columns: 4.5rem minmax(0, 1fr);
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
  top: 0;
  display: flex;
  height: 100vh;
  flex-direction: column;
  border-right: 1px solid var(--sidebar-border);
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
  border-radius: 0.625rem;
  color: var(--foreground);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
}

.sidebar-brand svg {
  width: 1.125rem;
  height: 1.125rem;
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
  grid-template-columns: minmax(0, 1fr) 2.25rem;
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
  border-radius: 0.625rem;
  background: transparent;
  color: inherit;
  text-decoration: none;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    transform 120ms ease;
}

.quick-create {
  height: 2rem;
  justify-content: flex-start;
  gap: 0.5rem;
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 0 0.625rem;
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
  width: 2.25rem;
  height: 2.25rem;
  border-color: var(--border);
  background: var(--background);
}

.mail-button:hover,
.icon-button:hover,
.outline-button:hover,
.select-button:hover,
.search-command:hover {
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
  padding: 0 0.5rem;
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
  background: var(--sidebar-accent);
}

.sidebar-menu-button.is-active {
  font-weight: 600;
}

.sidebar-menu-button span:not(.sidebar-badge) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-badge {
  margin-left: auto;
  border: 1px solid #22c55e;
  border-radius: 999px;
  color: #16a34a;
  padding: 0.0625rem 0.375rem;
  font-size: 0.75rem;
  line-height: 1.25;
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
.customer-avatar {
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
.customer-cell strong,
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
.customer-cell small,
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
  min-height: calc(100vh - 1rem);
  flex-direction: column;
  overflow-x: hidden;
  margin: 0.5rem 0.5rem 0.5rem 0;
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
  background: var(--border);
}

.search-command {
  gap: 0.5rem;
  color: var(--muted-foreground);
  font-size: 0.875rem;
}

.search-command kbd {
  display: inline-flex;
  min-width: 1.75rem;
  height: 1.25rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 0.6875rem;
  font-weight: 500;
}

.topbar-icon {
  width: 2rem;
  height: 2rem;
  background: var(--primary);
  color: var(--primary-foreground);
}

.topbar-icon:hover {
  background: #2b2b2b;
}

.topbar-avatar {
  width: 2rem;
  height: 2rem;
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

.account-popover strong,
.account-popover span,
.account-popover a {
  display: block;
}

.account-popover span {
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}

.account-popover a {
  margin-top: 0.35rem;
  border-top: 1px solid var(--border);
  padding-top: 0.625rem;
  color: var(--foreground);
  text-decoration: none;
}

.dashboard-content {
  display: flex;
  width: min(100%, 1536px);
  flex: 1;
  flex-direction: column;
  gap: 1.5rem;
  margin: 0 auto;
  padding: 1.5rem;
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

.native-select {
  min-height: 2rem;
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  background: var(--background);
  color: var(--foreground);
  padding: 0 2rem 0 0.625rem;
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
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.5rem;
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  padding: 0 0.75rem;
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
  display: grid;
  min-height: calc(100vh - 6rem);
  place-items: center;
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
#customer-activity,
#customers {
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
  margin: 0.625rem 0 0.875rem;
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
  margin-top: 0.5rem;
  color: var(--muted-foreground);
  font-size: 0.875rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
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

.chart-legend {
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.25rem;
  color: var(--foreground);
  font-size: 0.75rem;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.chart-legend i {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 0.125rem;
}

.legend-active {
  background: #717171;
}

.legend-new {
  background: #d4d4d4;
}

.legend-returning {
  background: #525252;
}

.activity-card {
  min-height: 25.625rem;
}

.activity-chart {
  display: block;
  width: 100%;
  height: 19.25rem;
  margin-top: 0.25rem;
  overflow: visible;
}

.chart-grid line {
  stroke: #f0f0f0;
  stroke-width: 1;
}

.chart-line {
  fill: none;
  stroke-linejoin: round;
  stroke-linecap: round;
  stroke-width: 1.2;
}

.chart-new {
  stroke: #d4d4d4;
}

.chart-active {
  stroke: #737373;
}

.chart-returning {
  stroke: #525252;
}

.chart-axis text {
  fill: var(--muted-foreground);
  font-size: 12px;
}

.customers-card {
  gap: 0.875rem;
}

.table-header {
  align-items: center;
}

.table-toolbar {
  gap: 0.5rem;
}

.customer-search {
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

.customer-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--foreground);
}

.customer-search input::placeholder {
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

.customer-cell {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 0.625rem;
  align-items: center;
}

.customer-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
}

.customer-avatar svg {
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
}

.soft-pill {
  min-height: 1.25rem;
  border: 1px solid var(--border);
  background: #fafafa;
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

@media (max-width: 1180px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .studio-admin {
    grid-template-columns: 1fr;
  }

  .studio-sidebar {
    display: none;
  }

  .studio-admin.is-mobile-open .studio-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 80;
    display: flex;
    width: min(19rem, 86vw);
    box-shadow: 16px 0 40px rgba(0, 0, 0, 0.16);
  }

  .studio-admin.is-mobile-open .sidebar-scrim {
    position: fixed;
    inset: 0;
    z-index: 70;
    display: block;
    background: rgba(0, 0, 0, 0.34);
  }

  .sidebar-close {
    display: inline-flex;
  }

  .studio-main {
    min-height: 100vh;
    margin: 0;
    border: 0;
    border-radius: 0;
  }

  .studio-topbar {
    border-radius: 0;
    padding: 0 0.875rem;
  }

  .topbar-actions {
    gap: 0.375rem;
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

  .dashboard-content {
    padding: 1rem;
  }

  .route-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .route-grid,
  .productivity-layout,
  .invoice-layout,
  .preview-shell {
    grid-template-columns: 1fr;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }

  .preview-list {
    border-right: 0;
    border-bottom: 1px solid var(--border);
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

  .customer-search {
    width: 100%;
  }

  .activity-chart {
    height: 15.5rem;
  }
}
`;
