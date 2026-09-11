import { create } from "zustand";
import { BusinessCard } from "@/types";
import { getMyCard, updateMyCard } from "@/services/api";
import { CARD_BACKGROUNDS } from "@/mocks/data";

interface CardState {
  card: BusinessCard | null;
  draft: BusinessCard | null;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  load: () => Promise<void>;
  /** Startuje pusty szkic nowej wizytówki (empty state -> "Stwórz wizytówkę"). */
  startNewCard: (seed: { firstName: string; lastName: string; email: string }) => void;
  updateDraft: (patch: Partial<BusinessCard>) => void;
  save: () => Promise<void>;
  discardDraft: () => void;
}

export const useCardStore = create<CardState>((set, get) => ({
  card: null,
  draft: null,
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false,

  load: async () => {
    set({ isLoading: true });
    const card = await getMyCard();
    set({ card, draft: card ? { ...card } : null, isLoading: false, hasUnsavedChanges: false });
  },

  startNewCard: (seed) => {
    const blank: BusinessCard = {
      id: `card_new_${Date.now()}`,
      userId: "me",
      firstName: seed.firstName,
      lastName: seed.lastName,
      jobTitle: "",
      email: seed.email,
      phone: "",
      backgroundId: CARD_BACKGROUNDS[0].id,
      isPrimary: true,
    };
    set({ card: null, draft: blank, hasUnsavedChanges: true });
  },

  updateDraft: (patch) => {
    const { draft } = get();
    if (!draft) return;
    set({ draft: { ...draft, ...patch }, hasUnsavedChanges: true });
  },

  save: async () => {
    const { draft } = get();
    if (!draft) return;
    set({ isSaving: true });
    const saved = await updateMyCard(draft);
    set({ card: saved, draft: { ...saved }, isSaving: false, hasUnsavedChanges: false });
  },

  discardDraft: () => {
    const { card } = get();
    set({ draft: card ? { ...card } : null, hasUnsavedChanges: false });
  },
}));
