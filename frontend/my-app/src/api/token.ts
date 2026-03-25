import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const NICKNAME_KEY = 'user_nickname';

export const tokenService = {
  save: async (token: string, nickname?: string | null) => {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(TOKEN_KEY, token);
      if (typeof nickname === 'string' && nickname.trim() !== '') {
        window.localStorage.setItem(NICKNAME_KEY, nickname.trim());
      } else {
        window.localStorage.removeItem(NICKNAME_KEY);
      }
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (typeof nickname === 'string' && nickname.trim() !== '') {
      await SecureStore.setItemAsync(NICKNAME_KEY, nickname.trim());
    } else {
      await SecureStore.deleteItemAsync(NICKNAME_KEY);
    }
  },
  get: async () => {
    if (Platform.OS === 'web') {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  saveRefreshToken: async (refreshToken: string) => {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },
  getRefreshToken: async () => {
    if (Platform.OS === 'web') {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  getNickname: async () => {
    if (Platform.OS === 'web') {
      return window.localStorage.getItem(NICKNAME_KEY);
    }
    return SecureStore.getItemAsync(NICKNAME_KEY);
  },
  delete: async () => {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.localStorage.removeItem(NICKNAME_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(NICKNAME_KEY);
  },
};