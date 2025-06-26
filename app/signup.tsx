// app/signup.tsx

import { router } from 'expo-router';
import SignUpScreen, { FormState } from '../screens/signup'; // ✅ FormState 함께 import

export default function SignUpPage() {
  const handleSubmit = (data: FormState) => {
    console.log('회원가입 완료:', data);
    router.replace('/(tabs)'); // 원하는 라우팅으로 이동
  };

  return <SignUpScreen onSubmit={handleSubmit} />;
}
