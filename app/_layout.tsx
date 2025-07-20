// app/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useSessionStore } from '../contexts/sessionStore';

export default function RootLayout() {
  const { sessionId, userState, loadSessionFromStorage } = useSessionStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadSessionFromStorage().then(() => {
      if (!sessionId || !userState) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    });
  }, []);

  return <Slot />;
}
