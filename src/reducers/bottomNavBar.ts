import { create } from 'zustand';

interface BottomNavBarState {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  closeNavBar: () => void;
}

export const useBottomNavBarStore = create<BottomNavBarState>((set) => ({
  isExpanded: false,
  setIsExpanded: (value) => set({ isExpanded: value }),
  closeNavBar: () => set({ isExpanded: false }),
})); 