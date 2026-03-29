import { create } from 'zustand';

export type UserProfile = {
  nickname: string;
  gender: string;
  birthDate: string;
  heightCm: string;
  weightKg: string;
};

type UserProfileState = {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
};

const initialProfile: UserProfile = {
  nickname: '',
  gender: '',
  birthDate: '',
  heightCm: '',
  weightKg: '',
};

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: initialProfile,
  setProfile: (profile) =>
    set((state) => ({
      profile: { ...state.profile, ...profile },
    })),
}));
