export interface CardBackground {
  id: string;
  colorStart: string;
  colorEnd: string;
  textColor: string;
}

export const CARD_BACKGROUNDS: Record<string, CardBackground> = {
  bg_violet: { id: "bg_violet", colorStart: "#6C5CE7", colorEnd: "#5B4CF0", textColor: "#FFFFFF" },
  bg_midnight: { id: "bg_midnight", colorStart: "#161A2B", colorEnd: "#2B2F4A", textColor: "#FFFFFF" },
  bg_sunset: { id: "bg_sunset", colorStart: "#FF7A59", colorEnd: "#FFB199", textColor: "#1A1A1A" },
  bg_mint: { id: "bg_mint", colorStart: "#1FD1A1", colorEnd: "#00B894", textColor: "#FFFFFF" },
  bg_paper: { id: "bg_paper", colorStart: "#FFFFFF", colorEnd: "#F0F0F7", textColor: "#15142B" },
  bg_ocean: { id: "bg_ocean", colorStart: "#0F4C81", colorEnd: "#2E86AB", textColor: "#FFFFFF" },
  bg_rose: { id: "bg_rose", colorStart: "#F7B8B0", colorEnd: "#EAA2A2", textColor: "#3A1F1F" },
  bg_graphite: { id: "bg_graphite", colorStart: "#2D2D34", colorEnd: "#000000", textColor: "#FFFFFF" },
};

export function getCardBackground(id: string): CardBackground {
  return CARD_BACKGROUNDS[id] ?? CARD_BACKGROUNDS.bg_violet;
}
