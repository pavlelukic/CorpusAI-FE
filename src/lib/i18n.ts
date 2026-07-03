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
  'chat.emptyTitle': 'What would you like to know about {{subject}}?',
  'chat.emptyHint': 'Ask anything from the course, or start with an example below.',
  'chat.langLocked': 'Start a new chat to change the language.',
  'quiz.langLocked': 'Start a new quiz to change the language.',
  'quiz.setupTitle': 'Generate a Quiz',
  'quiz.setupSubtitle': 'Build a set of flashcards from your course material.',
  'quiz.generating': 'Generating flashcards…',
  'quiz.generate': 'Generate Quiz',
  'quiz.topic': 'Topic (optional)',
  'quiz.topicPlaceholder': 'e.g. design patterns',
  'quiz.count': 'Number of cards',
  'quiz.question': 'Question',
  'quiz.answer': 'Answer',
  'quiz.revealHint': 'Click to reveal answer →',
  'quiz.source': 'Source: {{hint}}',
  'quiz.next': 'Next →',
  'quiz.prev': '← Previous',
  'quiz.finish': 'Finish',
  'quiz.difficulty.EASY': 'Easy',
  'quiz.difficulty.MEDIUM': 'Medium',
  'quiz.difficulty.HARD': 'Hard',
  'quiz.doneTitle': 'Quiz complete',
  'quiz.doneSubtitle': 'Nice work - you reviewed every quiz card.',
  'quiz.reviewAgain': 'Review again',
  'quiz.newQuiz': 'New quiz',
  'error.generic': 'Something went wrong. Please try again.',
  'error.retry': 'Retry',
  'error.boundaryTitle': 'Something went wrong',
  'error.boundarySubtitle': 'An unexpected error occurred. Try reloading the page.',
  'error.reload': 'Reload page',
  'notFound.title': 'Page not found',
  'notFound.subtitle': "The page you're looking for doesn't exist.",
  'notFound.backHome': 'Back to home',
} as const

export type TranslationKey = keyof typeof en

const sr: Record<TranslationKey, string> = {
  'home.title': 'Vaš AI pomoćnik za učenje',
  'home.subtitle': 'Izaberite predmet da započnete razgovor ili proverite znanje kvizom.',
  'nav.chat': 'Čet',
  'nav.quiz': 'Kviz',
  'chat.placeholder': 'Postavite pitanje...',
  'chat.send': 'Pošalji',
  'chat.newChat': 'Novi razgovor',
  'chat.emptyTitle': 'Šta biste želeli da saznate o predmetu {{subject}}?',
  'chat.emptyHint': 'Pitajte bilo šta iz gradiva, ili počnite sa primerom ispod.',
  'chat.langLocked': 'Pokrenite novi razgovor kako biste promenili jezik.',
  'quiz.langLocked': 'Pokrenite novi kviz kako biste promenili jezik.',
  'quiz.setupTitle': 'Napravi kviz',
  'quiz.setupSubtitle': 'Napravite set kviz kartica vezan za gradivo izabranog predmeta.',
  'quiz.generating': 'Generišem kartice…',
  'quiz.generate': 'Napravi kviz',
  'quiz.topic': 'Tema (opciono)',
  'quiz.topicPlaceholder': 'npr. softverski paterni u javi',
  'quiz.count': 'Broj kartica',
  'quiz.question': 'Pitanje',
  'quiz.answer': 'Odgovor',
  'quiz.revealHint': 'Kliknite da vidite odgovor →',
  'quiz.source': 'Izvor: {{hint}}',
  'quiz.next': 'Sledeća →',
  'quiz.prev': '← Prethodna',
  'quiz.finish': 'Završi',
  'quiz.difficulty.EASY': 'Lako',
  'quiz.difficulty.MEDIUM': 'Srednje',
  'quiz.difficulty.HARD': 'Teško',
  'quiz.doneTitle': 'Kviz završen',
  'quiz.doneSubtitle': 'Odlično - pregledali ste sve kviz kartice!',
  'quiz.reviewAgain': 'Ponovi',
  'quiz.newQuiz': 'Novi kviz',
  'error.generic': 'Nešto je pošlo po zlu. Pokušajte ponovo.',
  'error.retry': 'Pokušaj ponovo',
  'error.boundaryTitle': 'Nešto je pošlo po zlu',
  'error.boundarySubtitle': 'Došlo je do neočekivane greške. Pokušajte da osvežite stranicu.',
  'error.reload': 'Osveži stranicu',
  'notFound.title': 'Stranica nije pronađena',
  'notFound.subtitle': 'Stranica koju tražite ne postoji.',
  'notFound.backHome': 'Nazad na početnu',
}

const translations: Record<Lang, Record<TranslationKey, string>> = { en, sr }

export function t(key: TranslationKey, lang: Lang, vars?: Record<string, string>): string {
  const template = translations[lang][key]
  if (!vars) return template
  return Object.entries(vars).reduce(
    (result, [name, value]) => result.replaceAll(`{{${name}}}`, value),
    template,
  )
}

export const chatChips: Record<Lang, string[]> = {
  en: ['Explain a key concept', 'Give me a real-world example', 'What should I focus on?'],
  sr: ['Objasni mi jedan ključni pojam', 'Daj mi primer iz prakse', 'Na šta treba da se fokusiram?'],
}
