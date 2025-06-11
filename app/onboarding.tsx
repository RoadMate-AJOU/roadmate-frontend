import { Button } from 'react-native';
import { router } from 'expo-router';
import Onboarding from '../screens/Onboarding';

export default function OnboardingPage() {
  const goToSignup = () => {
    router.replace('/signup');
  };

  return (
    <>
      <Onboarding />
      <Button title="회원가입하기" onPress={goToSignup} />
    </>
  );
}
