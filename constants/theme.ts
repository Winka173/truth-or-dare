// constants/theme.ts
export type GradientKey = 'splash' | 'home' | 'setup' | 'handoff' | 'play' | 'results';

export const gradients: Record<GradientKey, [string, string]> = {
  splash:  ['#FF6B6B', '#FFB347'],
  home:    ['#A855F7', '#EC4899'],
  setup:   ['#38BDF8', '#34D399'],
  handoff: ['#FB923C', '#FBBF24'],
  play:    ['#6366F1', '#A855F7'],
  results: ['#EC4899', '#FBBF24'],
};

export const darkGradients: Record<GradientKey, [string, string]> = {
  splash:  ['#1A0A0A', '#2D1515'],
  home:    ['#0D0320', '#1A0A1A'],
  setup:   ['#020D1A', '#021A12'],
  handoff: ['#1A0D02', '#1A1502'],
  play:    ['#02020D', '#0D021A'],
  results: ['#1A0212', '#1A1502'],
};

export const colors = {
  white: '#FFFFFF',
  black: '#000000',
  frostedLight:  'rgba(255,255,255,0.15)',
  frostedDark:   'rgba(255,255,255,0.08)',
  frostedBorder: 'rgba(255,255,255,0.20)',
  textOnGradient:      '#FFFFFF',
  textMutedOnGradient: 'rgba(255,255,255,0.70)',
  truth:   '#38BDF8',
  dare:    '#FB923C',
  gold:    '#FBBF24',
  silver:  '#94A3B8',
  bronze:  '#F97316',
  success: '#34D399',
  warning: '#FBBF24',
  error:   '#F87171',
  lock:    'rgba(255,255,255,0.40)',
};

export const fonts = {
  heading:  'Baloo2_800ExtraBold',
  body:     'Outfit_400Regular',
  bodySemi: 'Outfit_600SemiBold',
  bodyBold: 'Outfit_700Bold',
};

export const spacing = {
  xs:    4,
  sm:    8,
  md:    16,
  lg:    24,
  xl:    32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  full: 9999,
} as const;

export const animation = {
  spring:       { damping: 12, stiffness: 180 } as const,
  springBouncy: { damping: 8,  stiffness: 180 } as const,
  springGentle: { damping: 20, stiffness: 120 } as const,
  pressScale:   0.93,
  selectScale:  1.03,
} as const;
