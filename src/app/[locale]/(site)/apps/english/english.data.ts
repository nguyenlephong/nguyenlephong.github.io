export interface SlangExample {
  text: string
  highlight: string
  note?: string
}

export interface SlangEntry {
  id: string
  term: string
  meaning: string
  tone: string
  memoryHook: string
  contextLines: string[]
  examples: SlangExample[]
  acceptedAnswers: string[]
}

export const warmupLines = [
  "Let's be honest.",
  "You don't want to be confused anymore.",
  "I am gonna help you in today's lesson.",
  "I am not going to lie.",
]

export const englishSlangDeck: SlangEntry[] = [
  {
    id: 'ghost',
    term: 'GHOST',
    meaning: 'To disappear or stop communicating suddenly.',
    tone: 'Casual, dating, messaging, friendship.',
    memoryHook: 'Think: someone was there, then suddenly they are gone.',
    contextLines: [],
    examples: [
      {
        text: "He ghosted me after our first date. I don't know what happened.",
        highlight: 'ghosted',
      },
      {
        text: 'I asked him for his number, but he just ghosted me.',
        highlight: 'ghosted',
      },
      {
        text: "She's been ghosting us all week. I hope everything is okay.",
        highlight: 'ghosting',
      },
    ],
    acceptedAnswers: ['ghost', 'ghosted', 'ghosting'],
  },
  {
    id: 'squad',
    term: 'SQUAD',
    meaning: 'A group of friends or associates.',
    tone: 'Casual, friendly, social media.',
    memoryHook: 'Think: the people who show up with you and for you.',
    contextLines: [],
    examples: [
      {
        text: 'My squad and I are planning a weekend trip next month.',
        highlight: 'squad',
      },
      {
        text: 'She always hangs out with her squad at the mall on weekends.',
        highlight: 'squad',
      },
      {
        text: 'I can always count on my squad to have my back.',
        highlight: 'squad',
      },
    ],
    acceptedAnswers: ['squad'],
  },
  {
    id: 'salty',
    term: 'SALTY',
    meaning: 'Feeling upset, annoyed, or bitter about something.',
    tone: 'Casual, teasing, reaction to losing or being left out.',
    memoryHook: 'Think: a small bitter feeling that shows in how someone talks.',
    contextLines: [
      'You guys just go alone without me.',
      "I don't need you guys either.",
      'He is a little upset.',
      "He doesn't want to talk to me, so now he's a little salty.",
    ],
    examples: [
      {
        text: "He's so salty that he didn't get the promotion instead of me.",
        highlight: 'salty',
      },
      {
        text: 'She got salty when I beat her at the game.',
        highlight: 'salty',
      },
      {
        text: 'I was a little salty when they canceled our concert tickets.',
        highlight: 'salty',
      },
    ],
    acceptedAnswers: ['salty'],
  },
  {
    id: 'tbt',
    term: 'TBT',
    meaning: 'Throwback Thursday, sharing old photos or memories on social media.',
    tone: 'Casual, social media, nostalgia.',
    memoryHook: 'Think: Thursday is the day people post an old memory.',
    contextLines: ['We looked so young.', 'Did you see the Throwback Thursday photo?'],
    examples: [
      {
        text: "Can't believe how young we look in this TBT photo.",
        highlight: 'TBT',
      },
      {
        text: "I'm posting a TBT of our family vacation from years ago.",
        highlight: 'TBT',
      },
      {
        text: 'She posted a TBT of her graduation day and got so many likes.',
        highlight: 'TBT',
      },
    ],
    acceptedAnswers: ['tbt', 'throwback thursday'],
  },
  {
    id: 'tea',
    term: 'TEA',
    meaning: 'Gossip or juicy information.',
    tone: 'Casual, social, used when asking for the story behind something.',
    memoryHook: 'Think: someone is about to spill the story.',
    contextLines: ['Ooh, tell me what happened.', 'Tell me the gossip.'],
    examples: [
      {
        text: 'Have you heard the tea about what really happened at the party?',
        highlight: 'tea',
        note: 'Natural version: Have you heard what happened?',
      },
      {
        text: 'She always knows the latest tea on all our friends.',
        highlight: 'tea',
        note: 'Meaning: She always knows the latest gossip or information.',
      },
      {
        text: "Tell me the tea about what's going on with her and him.",
        highlight: 'tea',
      },
    ],
    acceptedAnswers: ['tea'],
  },
]
