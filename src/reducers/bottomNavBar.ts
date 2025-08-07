import { create } from 'zustand';

interface BottomNavBarState {
  isExpanded: boolean;
  isVisible: boolean;
  setIsExpanded: (value: boolean) => void;
  setIsVisible: (value: boolean) => void;
  closeNavBar: () => void;
  hideNavBar: () => void;
  showNavBar: () => void;
}

export const useBottomNavBarStore = create<BottomNavBarState>((set) => ({
  isExpanded: false,
  isVisible: true,
  setIsExpanded: (value) => set({ isExpanded: value }),
  setIsVisible: (value) => set({ isVisible: value }),
  closeNavBar: () => set({ isExpanded: false }),
  hideNavBar: () => set({ isVisible: false, isExpanded: false }),
  showNavBar: () => set({ isVisible: true }),
})); 