import { create } from 'zustand'
import { tokenService } from '../api/token'

interface AuthState {
  accessToken: string | null
  isLoggedIn: boolean
  nickname: string | null
  setToken: (token: string, nickname?: string | null) => Promise<void>
  clearToken: () => Promise<void>
  loadToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isLoggedIn: false,
  nickname: null,
  
  // 로그인 시 토큰 저장
  setToken: async (token, nickname) => {
    if (typeof token !== 'string' || token.trim() === '') {
      throw new Error('Invalid access token format')
    }

    await tokenService.save(token)
    set({
      accessToken: token,
      isLoggedIn: true,
      nickname: typeof nickname === 'string' ? nickname : null,
    })
  },

  // 로그아웃 시 토큰 삭제
  clearToken: async () => {
    await tokenService.delete()
    set({ accessToken: null, isLoggedIn: false, nickname: null })
  },

  // 앱 시작 시 토큰 불러오기
  loadToken: async () => {
    const token = await tokenService.get()
    if (token) set({ accessToken: token, isLoggedIn: true })
  },
}))