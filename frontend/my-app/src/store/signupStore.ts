import { create } from 'zustand';
import { SignupRequest, SignupStep1Input, SignupStep2Input } from '../types/types';

const INITIAL_STEP1: SignupStep1Input = {
  email: '',
  password: '',
  confirmPassword: '',
};

const INITIAL_STEP2: SignupStep2Input = {
  nickname: '',
  gender: '',
  birthDate: '',
  heightCm: 0,
  weightKg: 0,
};

interface SignupDraftState {
  step1: SignupStep1Input;
  step2: SignupStep2Input;
  setStep1: (data: SignupStep1Input) => void;
  setStep2: (data: SignupStep2Input) => void;
  reset: () => void;
  buildPayload: () => SignupRequest;
}

export const useSignupStore = create<SignupDraftState>((set, get) => ({
  step1: INITIAL_STEP1,
  step2: INITIAL_STEP2,
  setStep1: (data) => set({ step1: data }),
  setStep2: (data) => set({ step2: data }),
  reset: () => set({ step1: INITIAL_STEP1, step2: INITIAL_STEP2 }),
  buildPayload: () => {
    const { step1, step2 } = get();
    return { ...step1, ...step2 };
  },
}));
