import { Button } from 'react-native';
import { router } from 'expo-router';
import VoiceConsent from '../../screens/consent/VoiceConsent';

export default function VoiceConsentPage() {
  const handleAgree = () => {
    router.replace('/consent/location');
  };

  return (
    <>
      <VoiceConsent />
      <Button title="동의하기" onPress={handleAgree} />
    </>
  );
}
