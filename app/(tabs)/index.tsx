import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Home from '../../screens/Home';
import { useSessionStore } from '../../contexts/sessionStore';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { sessionId, userState, setSession, loadSessionFromStorage } = useSessionStore();

  const [initialized, setInitialized] = useState(false);
  const [redirected, setRedirected] = useState(false); // 🔁 중복 라우팅 방지

  const paramSessionId = searchParams.sessionId?.toString();
  const paramUserState = searchParams.userState?.toString() as 'guest' | 'signed' | undefined;

  useEffect(() => {
    const initSession = async () => {
      // 테스트 시 SecureStore 초기화
      // await SecureStore.deleteItemAsync('sessionId');
      // await SecureStore.deleteItemAsync('userState');

      if (paramSessionId && paramUserState) {
        console.log('🚀 파라미터로 세션 설정');
        await setSession(paramSessionId, paramUserState);
      } else {
        console.log('📦 SecureStore에서 세션 로드');
        await loadSessionFromStorage();
      }

      setInitialized(true);
    };

    initSession();
  }, []);

  // ✅ 세션 없음 → 온보딩 이동은 effect에서 처리
  useEffect(() => {
    const isValidUserState = userState === 'guest' || userState === 'signed';

    if (initialized && (!sessionId || !isValidUserState) && !redirected) {
      console.log('🔁 세션 없음 → 온보딩으로 이동');
      setRedirected(true); // 중복 이동 방지
      router.replace('/onboarding');
    }
  }, [initialized, sessionId, userState]);

  // ✅ 아직 초기화 중이거나 리디렉션 중이면 렌더링 안 함
  if (!initialized || (!sessionId && !redirected)) return null;

  // ✅ 세션 유지 중
  console.log('✅ 세션 유지 중:', { sessionId, userState });
  return <Home sessionId={sessionId} userState={userState} />;
}
