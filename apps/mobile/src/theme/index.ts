/**
 * Cardly design system.
 * Cel: nowoczesny, "SaaS-owy" wygląd (Uber / Revolut) — Natywny Dark Mode.
 * Wszystkie ekrany i komponenty powinny korzystać wyłącznie z tych tokenów —
 * żadnych "magicznych" hexów rozsianych po komponentach.
 */

export const colors = {
  // brand / akcent (Nowoczesny, neony fiolet przełamany z cyjanem/bielą)
  primary: "#6E56CF", // Jaskrawy, czytelny fiolet idealny do ciemnego tła
  primaryDark: "#5742A9", // Ciemniejszy odcień na stany pressed/active
  primarySoft: "rgba(110, 86, 207, 0.18)", // Półprzezroczyste tło pod badge i akcenty

  // neutralne tło / powierzchnie (Revolut / Uber Dark Style)
  bg: "#0E0F12", // Głęboka, bardzo ciemna grafitowa czerń jako główne tło
  surface: "#17181C", // Główne karty, kontenery, kafle
  surfaceAlt: "#212328", // Alternatywne tło (np. pola tekstowe, przyciski wtórne)

  // tekst
  textPrimary: "#F3F3F7", // Wyraźny, jasny tekst podstawowy (nie czysta biel dla mniejszego zmęczenia oczu)
  textSecondary: "#9395A1", // Poboczne opisy, podtytuły
  textMuted: "#606370", // Wyciszone etykiety, placeholdery
  textOnPrimary: "#FFFFFF", // Tekst na przyciskach w kolorze primary

  // linie / obramowania
  border: "#2A2C33", // Subtelne, ciemne krawędzie separujące elementy

  // statusy (Jaskrawsze warianty dostosowane do ciemnego tła)
  success: "#30D158",
  successSoft: "rgba(48, 209, 88, 0.15)",
  warning: "#FFD60A",
  danger: "#FF453A",
  dangerSoft: "rgba(255, 69, 58, 0.15)",

  // akcent do gwiazdek / oznaczeń
  star: "#FFD60A",
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
  // W trybie Dark Mode tradycyjne cienie są niewidoczne.
  // Podmieniono je na delikatne rozświetlenie krawędzi (glow/elevation).
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const theme = { colors, radius, spacing, typography, shadow };
export type Theme = typeof theme;