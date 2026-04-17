/**
 * English — authoritative source of truth.
 * Every other locale only needs keys it overrides; missing keys fall
 * back to these values via the catalog resolver.
 */
export const en = {
  // Global
  'app.title': 'Truth or Dare',
  'app.tagline': 'No wifi. No accounts. Just the good stuff.',

  // Common
  'common.back': 'Back',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.close': 'Close',
  'common.done': 'Done',
  'common.skip': 'Skip',
  'common.add': 'Add',
  'common.home': 'Home',

  // Home
  'home.quickStart': 'Quick Start',
  'home.newGame': 'New Game',
  'home.browseCategories': 'Browse Categories',
  'home.openSettings': 'Open settings',
  'home.quickStartA11y': 'Quick start with last settings',
  'home.newGameA11y': 'Configure a new game',
  'home.browseA11y': 'Browse all categories',

  // Setup
  'setup.title': 'New Game',
  'setup.players': 'Players',
  'setup.ageGroup': 'Age Group',
  'setup.mood': 'Mood',
  'setup.advancedOptions': 'Advanced options',
  'setup.timer': 'Timer',
  'setup.timerOff': 'Off',
  'setup.questionsPerRound': 'Questions per round',
  'setup.typeFilter': 'Type filter',
  'setup.allowSkips': 'Allow skips',
  'setup.startGame': 'Start Game',
  'setup.startGameA11y': 'Start game',
  'setup.noMatch':
    'No questions match these settings. Try a different age group or mood, or unlock a pack.',
  'setup.poolCount': '{count} questions available',

  // Player setup
  'player.name': 'Player name',
  'player.limitReached': 'Player limit reached',
  'player.addA11y': 'Add player',
  'player.removeA11y': 'Remove {name}',
  'player.currentA11y': 'Current player: {name}',

  // Age group
  'age.kids': 'Kids',
  'age.teens': 'Teens',
  'age.youngAdult': 'Young Adult',
  'age.adult': 'Adult',
  'age.18plus': '18+',
  'age.kidsRange': '6–12',
  'age.teensRange': '13–17',
  'age.youngAdultRange': '18–24',
  'age.adultRange': '25–40',
  'age.18plusRange': 'Adults only',
  'age.kidsDesc': 'Wholesome, gentle prompts',
  'age.teensDesc': 'School & social life',
  'age.youngAdultDesc': 'College & social experiments',
  'age.adultDesc': 'Career, relationships, reflection',
  'age.18plusDesc': 'All content including explicit categories',
  'age.confirmRequired': 'Confirmation required',
  'age.confirmTitle': 'Confirm your age',
  'age.confirmMessage':
    '18+ mode includes adult and explicit content. You must be at least 18 years old to continue.',
  'age.confirmYes': "I'm 18 or older",

  // Mood
  'mood.party': 'Party',
  'mood.intimate': 'Intimate',
  'mood.chill': 'Chill',
  'mood.icebreaker': 'Icebreaker',
  'mood.a11y': 'Mood: {label}',

  // Type filter
  'type.mixed': 'Mixed',
  'type.truth': 'Truth',
  'type.dare': 'Dare',

  // Play
  'play.noActiveGame': 'No active game',
  'play.noMoreQuestions': 'No more questions',
  'play.noMoreSubtitle': 'The pool for these settings is exhausted.',
  'play.seeResults': 'See results',
  'play.endGameA11y': 'End game',
  'play.endConfirmTitle': 'End this game?',
  'play.endConfirmMessage': 'Scores will be saved for the results screen.',
  'play.endConfirmButton': 'End Game',
  'play.tapToReveal': 'Tap to reveal',
  'play.truth': 'TRUTH',
  'play.dare': 'DARE',
  'play.level': 'Level {current}/{max}',
  'play.hotSeat': 'Hot seat — everyone fires questions at {player} for {seconds}s',
  'play.chain': 'Chain',
  'play.grab': 'Grab',
  'play.bonus': 'Bonus prompt',
  'play.skipA11y': 'Skip this question',
  'play.doneA11y': 'Mark done',

  // Results
  'results.title': 'Results',
  'results.winner': '{name} wins',
  'results.ended': 'Game ended',
  'results.points': '{score} points',
  'results.noPoints': 'No points scored this round.',
  'results.playAgain': 'Play Again',
  'results.newGame': 'New Game',
  'results.home': 'Home',
  'results.noResults': 'No results to show',
  'results.noResultsSubtitle': 'Start a game from the home screen.',
  'results.backToHome': 'Back to home',
  'results.truths': '{count} truths',
  'results.dares': '{count} dares',
  'results.skips': '{count} skips',

  // Categories
  'categories.title': 'Categories',
  'categories.filterAll': 'All',
  'categories.filterFree': 'Free',
  'categories.filterPremium': 'Premium',
  'categories.questions': '{count} questions',

  // Settings
  'settings.title': 'Settings',
  'settings.closeA11y': 'Close settings',
  'settings.audioFeedback': 'Audio & Feedback',
  'settings.soundEffects': 'Sound effects',
  'settings.hapticFeedback': 'Haptic feedback',
  'settings.defaultAgeGroup': 'Default Age Group',
  'settings.language': 'Language',
  'settings.iap': 'In-App Purchases',
  'settings.restorePurchases': 'Restore purchases',
  'settings.iapHint': 'Real IAP integration lands in a future update.',
  'settings.version': 'Truth or Dare v{app} · Questions v{db}',
  'settings.rtlRestart': 'Restart the app for right-to-left layout to take effect.',

  // Packs
  'pack.premium': 'Premium',
  'pack.oneTimePurchase': 'One-time purchase',
  'pack.purchaseFailed': 'Purchase failed. Please try again.',
  'pack.notNow': 'Not now',
  'pack.unlockFor': 'Unlock for ${price}',
  'pack.unlockA11y': 'Unlock {label} for ${price}',
  'pack.purchasing': 'Purchasing…',

  // Streak
  'streak.label': '{count}× streak',

  // Error boundary
  'error.title': 'Something went wrong',
  'error.body':
    'The app ran into an unexpected problem. Please restart, or reinstall if it keeps happening.',
} as const;

export type TranslationKey = keyof typeof en;
export type Catalog = Partial<Record<TranslationKey, string>>;
