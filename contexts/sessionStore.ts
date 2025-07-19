// stores/useSessionStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type UserState = 'guest' | 'signed';

interface SessionStore {
  sessionId: string | null;
  userState: UserState | null;
  isLoaded: boolean;

  setSession: (sessionId: string, userState: UserState) => void;
  clearSession: () => void;
  loadSessionFromStorage: () => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  userState: null,
  isLoaded: false,

  setSession: (sessionId, userState) => {
    set({ sessionId, userState });
    // 저장은 따로 async 함수에서 처리
    void SecureStore.setItemAsync('sessionId', sessionId);
    void SecureStore.setItemAsync('userState', userState);
  },

  clearSession: () => {
    set({ sessionId: null, userState: null });
    void SecureStore.deleteItemAsync('sessionId');
    void SecureStore.deleteItemAsync('userState');
  },

  loadSessionFromStorage: async () => {
    try {
      const savedSessionId = await SecureStore.getItemAsync('sessionId');
      const savedUserState = (await SecureStore.getItemAsync('userState')) as UserState;

      set({
        sessionId: savedSessionId ?? null,
        userState: savedUserState ?? null,
        isLoaded: true,
      });
    } catch (e) {
      console.warn('🔐 세션 로드 실패', e);
      set({ isLoaded: true }); // 실패해도 로딩 완료 처리
    }
  },
}));
