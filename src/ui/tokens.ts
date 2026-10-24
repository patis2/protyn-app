// Design tokens from the Protyn brand kit: deep sage and coral on sand.
// Every screen reads colours from here so light and dark stay in step.

export type Palette = {
  bg: string;
  surface: string;
  sunk: string;
  ink: string;
  muted: string;
  line: string;
  sage: string;
  sageDeep: string;
  sageSoft: string;
  onSage: string;
  band: string;
  coral: string;
  coralSoft: string;
  coralInk: string;
  amberSoft: string;
  amberInk: string;
  scrim: string;
};

export const light: Palette = {
  bg: '#F8F1E9',
  surface: '#FFFCF7',
  sunk: '#F1E9DE',
  ink: '#1C2421',
  muted: '#56635C',
  line: '#E4DACC',
  sage: '#4F7A5E',
  sageDeep: '#2F5240',
  sageSoft: '#DCE7DD',
  onSage: '#F8F1E9',
  band: '#B7CDBB',
  coral: '#E8735A',
  coralSoft: '#F9DDD4',
  coralInk: '#B4472F',
  amberSoft: '#F6E7C8',
  amberInk: '#7A5310',
  scrim: 'rgba(31,42,46,0.42)',
};

export const dark: Palette = {
  bg: '#151B18',
  surface: '#1D2621',
  sunk: '#19211D',
  ink: '#ECE8E0',
  muted: '#9DABA6',
  line: '#2F3B37',
  sage: '#8DB89B',
  sageDeep: '#B5D6BF',
  sageSoft: '#24362B',
  onSage: '#111A15',
  band: '#3A5A45',
  coral: '#F08D74',
  coralSoft: '#3A2621',
  coralInk: '#F5B4A1',
  amberSoft: '#3A3020',
  amberInk: '#EBCB8B',
  scrim: 'rgba(0,0,0,0.6)',
};

export const font = {
  display: 'Outfit_600SemiBold',
  displayBold: 'Outfit_700Bold',
  displayMedium: 'Outfit_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const size = {
  small: 13,
  body: 15,
  card: 16,
  screen: 27,
  big: 38,
};

export const radius = { sm: 12, md: 14, lg: 18, xl: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

/** Widest the main column gets on web and tablets, so lines stay readable. */
export const maxContentWidth = 720;
/** At or above this width the web app shows a sidebar instead of a tab bar. */
export const sidebarBreakpoint = 900;
