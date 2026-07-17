'use client'

import { useEffect, useMemo, useState } from 'react'
import type { IconType } from 'react-icons'
import {
  LuArrowLeft,
  LuArrowRight,
  LuBookOpen,
  LuCheck,
  LuEye,
  LuHeadphones,
  LuKeyboard,
  LuLayers,
  LuListChecks,
  LuRotateCcw,
  LuShuffle,
  LuSparkles,
  LuTarget,
  LuVolume2,
} from 'react-icons/lu'
import { APP_ROUTE } from '@/app/app.const'
import {
  englishSlangDeck,
  warmupLines,
  type SlangEntry,
} from '@/app/[locale]/(site)/apps/english/english.data'
import { Link } from '@/i18n/navigation'
import { track } from '@/lib/analytics'

type PracticeMode = 'flashcard' | 'blank' | 'choice' | 'listen'
type ResultState = 'idle' | 'correct' | 'wrong'

const modeItems: Array<{
  id: PracticeMode
  label: string
  short: string
  icon: IconType
}> = [
  { id: 'flashcard', label: 'Flashcard', short: 'Nhớ nghĩa', icon: LuLayers },
  { id: 'blank', label: 'Fill blank', short: 'Điền từ', icon: LuKeyboard },
  { id: 'choice', label: 'Quiz', short: 'Chọn đáp án', icon: LuListChecks },
  { id: 'listen', label: 'Listen', short: 'Nghe câu', icon: LuHeadphones },
]

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function randomExampleIndex(entry: SlangEntry): number {
  return Math.floor(Math.random() * entry.examples.length)
}

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
}

function blankSentence(sentence: string, highlight: string): string {
  return sentence.replace(highlight, '_____')
}

function buildTermChoices(entry: SlangEntry): string[] {
  const distractors = shuffle(
    englishSlangDeck.filter((item) => item.id !== entry.id).map((item) => item.term)
  ).slice(0, 3)
  return shuffle([entry.term, ...distractors])
}

function getEntryById(id: string): SlangEntry {
  return englishSlangDeck.find((entry) => entry.id === id) ?? englishSlangDeck[0]
}

interface EnglishPracticeAppProps {
  locale: string
}

export default function EnglishPracticeApp({ locale }: EnglishPracticeAppProps) {
  const [mode, setMode] = useState<PracticeMode>('flashcard')
  const [sessionOrder, setSessionOrder] = useState(() => englishSlangDeck.map((entry) => entry.id))
  const [activeIndex, setActiveIndex] = useState(0)
  const [exampleIndex, setExampleIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [blankInput, setBlankInput] = useState('')
  const [blankResult, setBlankResult] = useState<ResultState>('idle')
  const [choiceOptions, setChoiceOptions] = useState(() => buildTermChoices(englishSlangDeck[0]))
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [listenChoice, setListenChoice] = useState<string | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set())
  const [hardIds, setHardIds] = useState<Set<string>>(() => new Set())
  const [speechStatus, setSpeechStatus] = useState('')

  const activeEntry = useMemo(
    () => getEntryById(sessionOrder[activeIndex] ?? englishSlangDeck[0].id),
    [activeIndex, sessionOrder]
  )
  const activeExample = activeEntry.examples[exampleIndex] ?? activeEntry.examples[0]
  const activeMode = modeItems.find((item) => item.id === mode) ?? modeItems[0]
  const ActiveModeIcon = activeMode.icon
  const progressLabel = `${activeIndex + 1}/${sessionOrder.length}`
  const completionPercent = Math.round((completedIds.size / englishSlangDeck.length) * 100)

  const refreshChallenge = (entry: SlangEntry, nextMode = mode): void => {
    setExampleIndex(randomExampleIndex(entry))
    setBlankInput('')
    setBlankResult('idle')
    setSelectedChoice(null)
    setListenChoice(null)
    setChoiceOptions(buildTermChoices(entry))
    setShowAnswer(nextMode !== 'flashcard')
    setSpeechStatus('')
  }

  const selectEntry = (entryId: string): void => {
    const nextIndex = sessionOrder.indexOf(entryId)
    const resolvedIndex = nextIndex >= 0 ? nextIndex : 0
    const nextEntry = getEntryById(entryId)
    setActiveIndex(resolvedIndex)
    refreshChallenge(nextEntry)
    track('english_practice_select_slang', {
      app_id: 'e-slang',
      slang_id: nextEntry.id,
      slang_term: nextEntry.term,
      locale,
    })
  }

  const nextEntry = (): void => {
    const nextIndex = (activeIndex + 1) % sessionOrder.length
    const next = getEntryById(sessionOrder[nextIndex])
    setActiveIndex(nextIndex)
    refreshChallenge(next)
    track('english_practice_next', {
      app_id: 'e-slang',
      slang_id: next.id,
      slang_term: next.term,
      mode,
      locale,
    })
  }

  const shuffleSession = (): void => {
    const nextOrder = shuffle(englishSlangDeck.map((entry) => entry.id))
    const first = getEntryById(nextOrder[0])
    setSessionOrder(nextOrder)
    setActiveIndex(0)
    refreshChallenge(first)
    track('english_practice_shuffle', { app_id: 'e-slang', mode, locale })
  }

  const resetSession = (): void => {
    const order = englishSlangDeck.map((entry) => entry.id)
    setSessionOrder(order)
    setCompletedIds(new Set())
    setHardIds(new Set())
    setActiveIndex(0)
    refreshChallenge(englishSlangDeck[0])
    track('english_practice_reset', { app_id: 'e-slang', locale })
  }

  const toggleHard = (): void => {
    setHardIds((current) => {
      const next = new Set(current)
      if (next.has(activeEntry.id)) next.delete(activeEntry.id)
      else next.add(activeEntry.id)
      return next
    })
    track('english_practice_mark_hard', {
      app_id: 'e-slang',
      slang_id: activeEntry.id,
      slang_term: activeEntry.term,
      locale,
    })
  }

  const markCompleted = (entry = activeEntry): void => {
    setCompletedIds((current) => {
      const next = new Set(current)
      next.add(entry.id)
      return next
    })
  }

  const changeMode = (nextMode: PracticeMode): void => {
    setMode(nextMode)
    refreshChallenge(activeEntry, nextMode)
    track('english_practice_mode_change', {
      app_id: 'e-slang',
      mode: nextMode,
      slang_id: activeEntry.id,
      locale,
    })
  }

  const revealAnswer = (): void => {
    setShowAnswer((current) => !current)
    track('english_practice_reveal', {
      app_id: 'e-slang',
      slang_id: activeEntry.id,
      slang_term: activeEntry.term,
      visible: !showAnswer,
      locale,
    })
  }

  const checkBlank = (): void => {
    const normalized = normalizeAnswer(blankInput)
    const accepted = [...activeEntry.acceptedAnswers, activeExample.highlight].some(
      (answer) => normalizeAnswer(answer) === normalized
    )
    setBlankResult(accepted ? 'correct' : 'wrong')
    if (accepted) markCompleted()
    track('english_practice_answer', {
      app_id: 'e-slang',
      mode: 'blank',
      slang_id: activeEntry.id,
      slang_term: activeEntry.term,
      correct: accepted,
      locale,
    })
  }

  const chooseTerm = (term: string, source: 'choice' | 'listen'): void => {
    const correct = term === activeEntry.term
    if (source === 'choice') setSelectedChoice(term)
    else setListenChoice(term)
    if (correct) markCompleted()
    track('english_practice_answer', {
      app_id: 'e-slang',
      mode: source,
      slang_id: activeEntry.id,
      slang_term: activeEntry.term,
      answer: term,
      correct,
      locale,
    })
  }

  const speak = (text: string): void => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechStatus('Trình duyệt này chưa hỗ trợ text-to-speech.')
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.onstart = () => setSpeechStatus('Đang phát audio...')
    utterance.onend = () => setSpeechStatus('Đã phát xong.')
    utterance.onerror = () => setSpeechStatus('Không phát được audio lúc này.')
    window.speechSynthesis.speak(utterance)
    track('english_practice_tts', {
      app_id: 'e-slang',
      slang_id: activeEntry.id,
      slang_term: activeEntry.term,
      locale,
    })
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      shuffleSession()
    }, 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const target = event.target
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      if (isTyping) return

      if (event.key.toLowerCase() === 's') {
        shuffleSession()
      }
      if (event.key === ' ') {
        event.preventDefault()
        revealAnswer()
      }
      if (event.key.toLowerCase() === 'n') {
        nextEntry()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry.id, activeIndex, mode, sessionOrder, showAnswer])

  return (
    <section className="english-console" aria-label="E-Slang English practice app">
      <header className="english-hero">
        <div className="english-hero-copy">
          <Link href={APP_ROUTE.APPS} className="page-back english-back">
            <LuArrowLeft aria-hidden="true" />
            Apps
          </Link>
          <span className="eyebrow english-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" /> E-Slang practice
          </span>
          <h1>Học slang bằng cách nhớ, điền, nghe, và lặp lại.</h1>
          <p>
            Static content vẫn có thể thành một buổi học mới mỗi lần: shuffle câu hỏi,
            đảo đáp án, nghe câu ví dụ, và đánh dấu những từ cần ôn lại.
          </p>
        </div>

        <div className="english-session-panel" aria-label="Session summary">
          <div>
            <span>Lượt học</span>
            <strong>{progressLabel}</strong>
          </div>
          <div>
            <span>Đã xong</span>
            <strong>{completionPercent}%</strong>
          </div>
          <div>
            <span>Từ khó</span>
            <strong>{hardIds.size}</strong>
          </div>
        </div>
      </header>

      <div className="english-warmup" aria-label="Warm-up phrases">
        {warmupLines.map((line) => (
          <button key={line} type="button" onClick={() => speak(line)}>
            <LuVolume2 aria-hidden="true" />
            <span>{line}</span>
          </button>
        ))}
      </div>

      <div className="english-workbench">
        <aside className="english-rail" aria-label="Slang index">
          <div className="english-panel-head">
            <span>Bộ thẻ</span>
            <strong>{englishSlangDeck.length} thẻ slang</strong>
          </div>
          <div className="english-slang-list">
            {englishSlangDeck.map((entry) => {
              const isActive = entry.id === activeEntry.id
              const isDone = completedIds.has(entry.id)
              const isHard = hardIds.has(entry.id)
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={isActive ? 'english-slang-item is-active' : 'english-slang-item'}
                  aria-pressed={isActive}
                  onClick={() => selectEntry(entry.id)}
                >
                  <span className="english-slang-term">{entry.term}</span>
                  <span className="english-slang-meaning">{entry.meaning}</span>
                  <span className="english-slang-flags">
                    {isDone && (
                      <span>
                        <LuCheck aria-hidden="true" />
                        Xong
                      </span>
                    )}
                    {isHard && (
                      <span>
                        <LuTarget aria-hidden="true" />
                        Khó
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <article className="english-study-card" aria-labelledby="english-active-term">
          <div className="english-card-topline">
            <span>{activeMode.label}</span>
            <span>{activeEntry.tone}</span>
          </div>

          <div className="english-term-row">
            <div>
              <h2 id="english-active-term">{activeEntry.term}</h2>
              <p>{activeEntry.memoryHook}</p>
            </div>
            <button
              type="button"
              className="english-icon-button"
              onClick={() => speak(activeEntry.term)}
              aria-label={`Listen to ${activeEntry.term}`}
            >
              <LuVolume2 aria-hidden="true" />
            </button>
          </div>

          <div className={showAnswer ? 'english-answer is-visible' : 'english-answer'}>
            <div className="english-meaning-box">
              <span>Meaning</span>
              <strong>{activeEntry.meaning}</strong>
            </div>

            {activeEntry.contextLines.length > 0 && (
              <div className="english-context-lines">
                {activeEntry.contextLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}

            <div className="english-example-list">
              {activeEntry.examples.map((example, index) => (
                <div key={`${activeEntry.id}-${index}`} className="english-example-row">
                  <button
                    type="button"
                    className="english-icon-button english-icon-button--small"
                    onClick={() => speak(example.text)}
                    aria-label={`Listen to example ${index + 1}`}
                  >
                    <LuVolume2 aria-hidden="true" />
                  </button>
                  <p>
                    {example.text}
                    {example.note && <span>{example.note}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {!showAnswer && (
            <div className="english-hidden-answer">
              <LuEye aria-hidden="true" />
              <span>Tự xem nghĩa sau khi thử nhớ trong đầu.</span>
            </div>
          )}

          <div className="english-card-actions">
            <button type="button" className="btn btn-secondary" onClick={revealAnswer}>
              <LuEye aria-hidden="true" />
              {showAnswer ? 'Ẩn đáp án' : 'Mở đáp án'}
            </button>
            <button
              type="button"
              className={hardIds.has(activeEntry.id) ? 'btn btn-primary' : 'btn btn-ghost'}
              onClick={toggleHard}
            >
              <LuTarget aria-hidden="true" />
              {hardIds.has(activeEntry.id) ? 'Đang ôn' : 'Đánh dấu khó'}
            </button>
            <button type="button" className="btn btn-primary" onClick={nextEntry}>
              Tiếp theo
              <LuArrowRight aria-hidden="true" />
            </button>
          </div>
        </article>

        <aside className="english-practice" aria-label="Practice panel">
          <div className="english-mode-grid" role="tablist" aria-label="Practice modes">
            {modeItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === mode
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={isActive ? 'is-active' : undefined}
                  onClick={() => changeMode(item.id)}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.short}</span>
                </button>
              )
            })}
          </div>

          <div className="english-practice-card">
            <div className="english-practice-kicker">
              <ActiveModeIcon aria-hidden="true" />
              <span>{activeMode.label}</span>
            </div>

            {mode === 'flashcard' && (
              <div className="english-practice-block">
                <p className="english-practice-question">Nhìn từ này, nói nghĩa bằng lời của anh.</p>
                <strong className="english-big-term">{activeEntry.term}</strong>
                <button type="button" className="btn btn-secondary" onClick={revealAnswer}>
                  <LuSparkles aria-hidden="true" />
                  Kiểm tra trí nhớ
                </button>
              </div>
            )}

            {mode === 'blank' && (
              <div className="english-practice-block">
                <p className="english-practice-question">
                  {blankSentence(activeExample.text, activeExample.highlight)}
                </p>
                <label className="english-answer-input">
                  <span>Câu trả lời</span>
                  <input
                    value={blankInput}
                    onChange={(event) => {
                      setBlankInput(event.target.value)
                      setBlankResult('idle')
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') checkBlank()
                    }}
                    placeholder="Type the missing word"
                    autoCapitalize="off"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </label>
                <button type="button" className="btn btn-primary" onClick={checkBlank}>
                  <LuCheck aria-hidden="true" />
                  Check
                </button>
                {blankResult !== 'idle' && (
                  <p className={`english-result english-result--${blankResult}`} aria-live="polite">
                    {blankResult === 'correct'
                      ? 'Đúng rồi. Đọc lại cả câu một lần.'
                      : `Chưa đúng. Đáp án tự nhiên ở câu này là "${activeExample.highlight}".`}
                  </p>
                )}
              </div>
            )}

            {mode === 'choice' && (
              <div className="english-practice-block">
                <p className="english-practice-question">{activeEntry.meaning}</p>
                <div className="english-choice-grid">
                  {choiceOptions.map((term) => {
                    const isSelected = selectedChoice === term
                    const isCorrect = term === activeEntry.term
                    const stateClass =
                      selectedChoice && isCorrect
                        ? 'is-correct'
                        : isSelected && !isCorrect
                          ? 'is-wrong'
                          : ''
                    return (
                      <button
                        key={term}
                        type="button"
                        className={stateClass}
                        onClick={() => chooseTerm(term, 'choice')}
                      >
                        {term}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {mode === 'listen' && (
              <div className="english-practice-block">
                <p className="english-practice-question">Nghe câu ví dụ, chọn slang xuất hiện trong câu.</p>
                <button type="button" className="btn btn-secondary" onClick={() => speak(activeExample.text)}>
                  <LuHeadphones aria-hidden="true" />
                  Phát câu
                </button>
                <div className="english-choice-grid">
                  {choiceOptions.map((term) => {
                    const isSelected = listenChoice === term
                    const isCorrect = term === activeEntry.term
                    const stateClass =
                      listenChoice && isCorrect
                        ? 'is-correct'
                        : isSelected && !isCorrect
                          ? 'is-wrong'
                          : ''
                    return (
                      <button
                        key={term}
                        type="button"
                        className={stateClass}
                        onClick={() => chooseTerm(term, 'listen')}
                      >
                        {term}
                      </button>
                    )
                  })}
                </div>
                {speechStatus && <p className="english-speech-status">{speechStatus}</p>}
              </div>
            )}
          </div>

          <div className="english-session-actions">
            <button type="button" className="btn btn-secondary" onClick={shuffleSession}>
              <LuShuffle aria-hidden="true" />
              Xáo trộn
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetSession}>
              <LuRotateCcw aria-hidden="true" />
              Làm lại
            </button>
          </div>

          <div className="english-review-strip">
            <LuBookOpen aria-hidden="true" />
            <div>
              <span>Review loop</span>
              <p>
                {hardIds.size > 0
                  ? `${hardIds.size} từ đang nằm trong nhóm cần ôn lại.`
                  : 'Chưa có từ khó. Đánh dấu khi anh thấy cần lặp lại.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
