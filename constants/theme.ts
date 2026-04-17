/**
 * Design tokens — "Midnight Revel" / "The Electric Editorial"
 *
 * Source: Stitch with Google — project `10347203616987101752`
 * Design system asset: `bb275d18706e4a30b4216375e2782318` (v1)
 *
 * Color palette extracted from Stitch design system (namedColors).
 * Confirmed against raw HTML/CSS of Setup, Home (Active), Results, Settings screens.
 *
 * Typography, font sizes, spacing, and radius follow PRD §3.1–3.2 which
 * override Stitch's enum-limited font picker (Noto Serif / Plus Jakarta
 * Sans were the closest enum matches — the designMd text confirms the
 * intent is Playfair Display / DM Sans / DM Mono).
 *
 * Animation timing values come from PRD §3.3.
 * Shadow / elevation rules come from the Midnight Revel designMd document.
 */

export const colors = {
  primary: {
    default: '#FF6C93',
    container: '#FE1874',
    dim: '#E50066',
    fixed: '#FFA9BB',
    fixedDim: '#FF93AB',
    onPrimary: '#48001B',
    onPrimaryContainer: '#000000',
    onPrimaryFixed: '#560022',
    onPrimaryFixedVariant: '#8D003C',
  },
  secondary: {
    default: '#EBB2FF',
    container: '#42005C',
    dim: '#D97DFF',
    fixed: '#F8D8FF',
    fixedDim: '#F2C5FF',
    onSecondary: '#6A0092',
    onSecondaryContainer: '#D97EFF',
    onSecondaryFixed: '#690090',
    onSecondaryFixedVariant: '#8930B0',
  },
  tertiary: {
    default: '#81ECFF',
    container: '#00E3FD',
    dim: '#00D4EC',
    fixed: '#00E3FD',
    fixedDim: '#00D4EC',
    onTertiary: '#005762',
    onTertiaryContainer: '#004D57',
    onTertiaryFixed: '#003840',
    onTertiaryFixedVariant: '#005762',
  },
  semantic: {
    success: '#81ECFF',
    warning: '#FFA9BB',
    error: '#FD6F85',
    errorContainer: '#8A1632',
    errorDim: '#C8475D',
    onError: '#490013',
    onErrorContainer: '#FF97A3',
  },
  bg: {
    base: '#0D0D18',
    screen: '#0D0D18',
    game: '#0D0D18',
    containerLowest: '#000000',
    containerLow: '#12121F',
    container: '#181828',
    containerHigh: '#1E1E30',
    containerHighest: '#242439',
    bright: '#2A2A42',
    dim: '#0D0D18',
    card: '#1E1E30',
    cardActive: '#242439',
    input: '#242439',
    variant: '#242439',
  },
  text: {
    primary: '#E5E3FF',
    secondary: '#AAA8C3',
    muted: '#74738C',
    placeholder: '#46465D',
    inverse: '#48001B',
    onBackground: '#E5E3FF',
    onSurface: '#E5E3FF',
    onSurfaceVariant: '#AAA8C3',
  },
  border: {
    outline: '#74738C',
    outlineVariant: '#46465D',
  },
  inverse: {
    surface: '#FCF8FF',
    onSurface: '#555461',
    primary: '#BD0053',
  },
  timer: {
    safe: '#81ECFF',
    warning: '#FFA9BB',
    danger: '#FD6F85',
    track: '#46465D',
  },
  overlay: {
    glass: 'rgba(42, 42, 66, 0.6)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    ghostBorder: 'rgba(70, 70, 93, 0.15)',
  },
  surfaceTint: '#FF6C93',
} as const;

export const gradients = {
  cta: ['#FF6C93', '#FE1874'] as const,
  ctaAngle: 135,
  card: ['#1E1E30', '#242439'] as const,
} as const;

export const fonts = {
  heading: 'PlayfairDisplay_700Bold',
  headingItalic: 'PlayfairDisplay_700Bold_Italic',
  body: 'DMSans_400Regular',
  bodyMed: 'DMSans_500Medium',
  bodySemi: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
  mono: 'DMMono_400Regular',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
  '4xl': 48,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  ctaGlow: {
    shadowColor: '#FE1874',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  timerDanger: {
    shadowColor: '#FD6F85',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
} as const;

export const blur = {
  glass: 24,
} as const;

export const animation = {
  transition: {
    slide: 280,
    modal: 340,
    fade: 220,
  },
  entry: {
    header: 350,
    gameCard: 320,
    settingsSection: 380,
    chipStagger: 50,
    setupRowStagger: 60,
    playerBadgeStagger: 40,
    resultCardStagger: 80,
  },
  cardFlip: {
    damping: 15,
    stiffness: 100,
    haptic: 'impactMedium' as const,
  },
  timer: {
    warningThresholdPct: 0.5,
    dangerThresholdPct: 0.25,
    hapticAt: [10, 3] as const,
  },
  pressScale: {
    button: 0.95,
    chip: 0.91,
    card: 0.97,
    icon: 0.88,
    action: 0.93,
  },
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
export const minTouchTarget = 44;

export const theme = {
  colors,
  gradients,
  fonts,
  fontSize,
  spacing,
  radius,
  shadow,
  blur,
  animation,
  hitSlop,
  minTouchTarget,
} as const;

export type Theme = typeof theme;
export type ColorToken = keyof typeof colors;
export type FontToken = keyof typeof fonts;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
