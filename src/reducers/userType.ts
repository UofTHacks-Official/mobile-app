import { create } from "zustand";

export type UserType = "admin" | "volunteer" | "judge" | "hacker";

interface UserTypeState {
  userType: UserType | null;
  setUserType: (type: UserType) => void;
  clearUserType: () => void;
}

export const useUserTypeStore = create<UserTypeState>((set) => ({
  userType: null,
  setUserType: (type) => set({ userType: type }),
  clearUserType: () => set({ userType: null }),
}));
