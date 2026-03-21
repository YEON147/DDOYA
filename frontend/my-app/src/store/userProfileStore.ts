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
  nickname: '도요',
  gender: '여성',
  birthDate: '1999-05-21',
  heightCm: '163',
  weightKg: '53',
};

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: initialProfile,
  setProfile: (profile) =>
    set((state) => ({
      profile: { ...state.profile, ...profile },
    })),
}));
