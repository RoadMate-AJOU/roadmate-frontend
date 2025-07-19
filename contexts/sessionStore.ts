import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type UserState = 'guest' | 'signed' | null;

interface SessionStore {
  sessionId: string | null;
  userState: UserState;
  setSession: (sessionId: string, userState: UserState) => Promise<void>;
  clearSession: () => Promise<void>;
  loadSessionFromStorage: () => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  userState: null,

  setSession: async (sessionId, userState) => {
    await SecureStore.setItemAsync('sessionId', sessionId);
    await SecureStore.setItemAsync('userState', userState);
    set({ sessionId, userState });
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync('sessionId');
    await SecureStore.deleteItemAsync('userState');
    set({ sessionId: null, userState: null });
  },

  loadSessionFromStorage: async () => {
    const savedSessionId = await SecureStore.getItemAsync('sessionId');
    const savedUserState = (await SecureStore.getItemAsync('userState')) as UserState;
    if (savedSessionId && savedUserState) {
      set({ sessionId: savedSessionId, userState: savedUserState });
    }
  },
}));
