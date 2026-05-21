export default function GlanceVisual() {
  return (
    <div className="app-visual app-visual-glance" aria-hidden="true">
      <div className="app-visual-stage">
        <div className="app-visual-window">
          <div className="app-visual-window-bar">
            <span className="app-visual-dot app-visual-dot--red" />
            <span className="app-visual-dot app-visual-dot--amber" />
            <span className="app-visual-dot app-visual-dot--green" />
            <span className="app-visual-window-title">Safari — Wikipedia</span>
          </div>
          <div className="app-visual-window-body">
            <p className="app-visual-text">
              The Swift programming language is a{' '}
              <mark className="app-visual-highlight">
                general-purpose, multi-paradigm, compiled
              </mark>{' '}
              language developed by Apple Inc.
            </p>
          </div>
        </div>

        <div className="app-visual-panel" role="presentation">
          <div className="app-visual-panel-head">
            <span className="app-visual-panel-eyebrow">
              <span className="app-visual-panel-dot" /> Glance
            </span>
            <span className="app-visual-panel-pair">EN → VI</span>
          </div>
          <p className="app-visual-panel-source">
            general-purpose, multi-paradigm, compiled
          </p>
          <div className="app-visual-panel-divider" />
          <p className="app-visual-panel-target">
            đa mục đích, đa hệ hình, biên dịch
          </p>
          <div className="app-visual-panel-foot">
            <kbd>⌃</kbd>
            <kbd>⌥</kbd>
            <kbd>⏎</kbd>
            <span>Replace selection</span>
          </div>
        </div>

        <div className="app-visual-cursor" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="22" height="22">
            <path
              d="M2 2 L2 12 L5 9 L7.5 14 L9.5 13 L7 8 L11 8 Z"
              fill="currentColor"
              stroke="white"
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
