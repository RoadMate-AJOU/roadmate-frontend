import { router } from 'expo-router';
import SignUpForm from '../screens/signup';

export default function SignUpPage() {
  const handleSubmit = (data: { name: string; phone: string }) => {
    console.log('회원가입 완료:', data);
    router.replace('/consent/voice'); // 가입 후 메인 탭으로 이동
  };

  return <SignUpForm onSubmit={handleSubmit} />;
}
