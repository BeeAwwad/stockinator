import { create } from "zustand";

type UiState = {
  signOutLoading: boolean;
  setSignOutLoading: (v: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  signOutLoading: false,
  setSignOutLoading: (signOutLoading) => set({ signOutLoading }),
}));
