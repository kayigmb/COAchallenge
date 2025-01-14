import { create } from "zustand";

type UserData = {
  id: string;
  name: string;
  email: string;
};

interface UserProfileState {
  user: UserData | null;
  getUserProfile: (user: UserData) => void;
  removeUserProfile: () => void;
}

export const useUserProfile = create<UserProfileState>((set) => ({
  user: null,
  getUserProfile: (user) => set({ user }),
  removeUserProfile: () => set({ user: null }),
}));