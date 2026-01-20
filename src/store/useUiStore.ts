import { create } from "zustand";

type UiState = {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  darkMode: false,
  setDarkMode: (darkMode) => set({ darkMode }),
}));
