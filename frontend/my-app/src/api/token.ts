import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';

export const tokenService = {
    save: async (token: string) => await SecureStore.setItemAsync(TOKEN_KEY, token),
    get: async () => await SecureStore.getItemAsync(TOKEN_KEY),
    delete: async () => await SecureStore.deleteItemAsync(TOKEN_KEY),
  };