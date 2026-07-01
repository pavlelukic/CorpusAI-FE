export type Lang = 'en' | 'sr'

const en = {
  'home.title': 'Your AI Study Tutor',
  'home.subtitle':
    'Pick a subject to start a focused chat or test yourself with an instant quiz.',
  'nav.chat': 'Chat',
  'nav.quiz': 'Quiz',
  'chat.placeholder': 'Ask a question...',
  'chat.send': 'Send',
  'chat.newChat': 'New chat',
  'quiz.generate': 'Generate quiz',
  'quiz.topic': 'Topic',
  'quiz.count': 'Number of cards',
  'quiz.flip': 'Flip',
  'quiz.next': 'Next',
  'quiz.prev': 'Previous',
  'quiz.difficulty.EASY': 'Easy',
  'quiz.difficulty.MEDIUM': 'Medium',
  'quiz.difficulty.HARD': 'Hard',
  'error.generic': 'Something went wrong. Please try again.',
  'error.retry': 'Retry',
} as const

type TranslationKey = keyof typeof en

const sr: Record<TranslationKey, string> = {
  'home.title': 'Vaš AI pomoćnik za učenje',
  'home.subtitle': 'Izaberite predmet da započnete razgovor ili proverite znanje kvizom.',
  'nav.chat': 'Čet',
  'nav.quiz': 'Kviz',
  'chat.placeholder': 'Postavite pitanje...',
  'chat.send': 'Pošalji',
  'chat.newChat': 'Novi razgovor',
  'quiz.generate': 'Generiši kviz',
  'quiz.topic': 'Tema',
  'quiz.count': 'Broj kartica',
  'quiz.flip': 'Okreni',
  'quiz.next': 'Sledeće',
  'quiz.prev': 'Prethodno',
  'quiz.difficulty.EASY': 'Lako',
  'quiz.difficulty.MEDIUM': 'Srednje',
  'quiz.difficulty.HARD': 'Teško',
  'error.generic': 'Nešto je pošlo po zlu. Pokušajte ponovo.',
  'error.retry': 'Pokušaj ponovo',
}

const translations: Record<Lang, Record<TranslationKey, string>> = { en, sr }

export function t(key: TranslationKey, lang: Lang): string {
  return translations[lang][key]
}
