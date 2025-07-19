// app/signup.tsx

import { router } from 'expo-router';
import SignUpScreen, { FormState } from '../screens/signup';
import { useSessionStore } from '../contexts/sessionStore'; // ✅ 추가

export default function SignUpPage() {
  const handleSubmit = async (data: FormState) => {
    console.log('회원가입 완료:', data);

    // ✅ sessionId를 예시로 생성 (실제 서버 응답값을 기반으로 대체해야 함)
    const sessionId = `user-${Date.now()}`;
    await useSessionStore.getState().setSession(sessionId, 'signed');

    router.replace('/(tabs)');
  };

  return <SignUpScreen onSubmit={handleSubmit} />;
}
