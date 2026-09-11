import { create } from "zustand";
import { User } from "@/types";
import { checkSession, login as apiLogin, logout as apiLogout, register as apiRegister, RegisterInput } from "@/services/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** Trwa sprawdzanie sesji przy starcie apki — dopóki true, chowamy splash i nic nie renderujemy. */
  isCheckingSession: boolean;
  isSubmitting: boolean;
  error: string | null;

  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isCheckingSession: true,
  isSubmitting: false,
  error: null,

  checkSession: async () => {
    const user = await checkSession();
    set({ user, isAuthenticated: !!user, isCheckingSession: false });
  },

  login: async (email, password) => {
    set({ isSubmitting: true, error: null });
    try {
      const user = await apiLogin(email, password);
      set({ user, isAuthenticated: true, isSubmitting: false });
    } catch {
      set({ error: "Nieprawidłowy email lub hasło", isSubmitting: false });
      throw new Error("INVALID_CREDENTIALS");
    }
  },

  register: async (input) => {
    set({ isSubmitting: true, error: null });
    try {
      const user = await apiRegister(input);
      set({ user, isAuthenticated: true, isSubmitting: false });
    } catch {
      set({ error: "Nie udało się utworzyć konta. Spróbuj ponownie.", isSubmitting: false });
      throw new Error("REGISTER_FAILED");
    }
  },

  logout: async () => {
    await apiLogout();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
