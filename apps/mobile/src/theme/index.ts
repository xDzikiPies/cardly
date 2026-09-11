/**
 * Cardly design system.
 * Cel: nowoczesny, "SaaS-owy" wygląd (Uber / Revolut), NIE natywny iOS/Android.
 * Wszystkie ekrany i komponenty powinny korzystać wyłącznie z tych tokenów —
 * żadnych "magicznych" hexów rozsianych po komponentach.
 */

export const colors = {
  // brand
  primary: "#5B4CF0",
  primaryDark: "#4633D6",
  primarySoft: "#EEECFE",

  // neutralne tło / powierzchnie
  bg: "#F6F6FB",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F0F7",

  // tekst
  textPrimary: "#15142B",
  textSecondary: "#6B6B85",
  textMuted: "#9C9CB4",
  textOnPrimary: "#FFFFFF",

  // linie / obramowania
  border: "#E7E7F2",

  // statusy
  success: "#22C58B",
  successSoft: "#E4F9F1",
  warning: "#F5A623",
  danger: "#F1554C",
  dangerSoft: "#FDEBEA",

  // akcent do gwiazdek / oznaczeń
  star: "#FFB400",
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const, letterSpacing: -0.5 },
  h1: { fontSize: 22, lineHeight: 29, fontWeight: "700" as const, letterSpacing: -0.3 },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: "400" as const },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: "600" as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  captionStrong: { fontSize: 13, lineHeight: 18, fontWeight: "600" as const },
  tiny: { fontSize: 11, lineHeight: 15, fontWeight: "500" as const },
};

export const shadow = {
  card: {
    shadowColor: "#15142B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  floating: {
    shadowColor: "#15142B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const theme = { colors, radius, spacing, typography, shadow };
export type Theme = typeof theme;
