import { LuHeadphones, LuMic2, LuPenLine, LuShuffle } from 'react-icons/lu'

export default function EnglishVisual() {
  return (
    <div className="english-app-visual" aria-hidden="true">
      <div className="english-visual-topbar">
        <span />
        <span />
        <span />
      </div>
      <div className="english-visual-card">
        <div className="english-visual-label">TODAY&apos;S SLANG</div>
        <strong>GHOST</strong>
        <p>To disappear or stop communicating suddenly.</p>
        <div className="english-visual-sentence">
          He <span>ghosted</span> me after our first date.
        </div>
      </div>
      <div className="english-visual-actions">
        <span>
          <LuShuffle />
          Shuffle
        </span>
        <span>
          <LuPenLine />
          Blank
        </span>
        <span>
          <LuHeadphones />
          Listen
        </span>
      </div>
      <div className="english-visual-wave">
        <LuMic2 />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}
