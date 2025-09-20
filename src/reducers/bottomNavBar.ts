import { create } from "zustand";

interface BottomNavBarState {
  isExpanded: boolean;
  isVisible: boolean;
  photoboothViewMode: "camera" | "gallery";
  setIsExpanded: (value: boolean) => void;
  setIsVisible: (value: boolean) => void;
  setPhotoboothViewMode: (mode: "camera" | "gallery") => void;
  closeNavBar: () => void;
  hideNavBar: () => void;
  showNavBar: () => void;
}

export const useBottomNavBarStore = create<BottomNavBarState>((set) => ({
  isExpanded: false,
  isVisible: true,
  photoboothViewMode: "camera",
  setIsExpanded: (value) => set({ isExpanded: value }),
  setIsVisible: (value) => set({ isVisible: value }),
  setPhotoboothViewMode: (mode) => set({ photoboothViewMode: mode }),
  closeNavBar: () => set({ isExpanded: false }),
  hideNavBar: () => set({ isVisible: false, isExpanded: false }),
  showNavBar: () => set({ isVisible: true }),
}));
