// app/(tabs)/index.tsx
import React, { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Home from '../../screens/Home';
import { useSessionStore } from '../../contexts/sessionStore';

export default function HomeScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { sessionId, userState, setSession } = useSessionStore();

  const paramSessionId = searchParams.sessionId?.toString();
  const paramUserState = searchParams.userState?.toString();

  // ✅ Zustand에 초기 세션 저장 (한 번만 실행)
  useEffect(() => {
    if (paramSessionId && paramUserState && !sessionId) {
      setSession({ sessionId: paramSessionId, userState: paramUserState });
    }
  }, [paramSessionId, paramUserState]);

  // ✅ 세션 유무에 따라 라우팅 결정 (setSession 이후에도 반응)
  useEffect(() => {
    if (!sessionId && userState === null && !paramSessionId) {
      // 파라미터도 없고 상태도 없을 때만 온보딩으로 이동
      router.replace('/onboarding');
    }
  }, [sessionId, userState, paramSessionId]);

  if (!sessionId && userState === null && !paramSessionId) return null;

  return <Home sessionId={sessionId!} userState={userState!} />;
}
