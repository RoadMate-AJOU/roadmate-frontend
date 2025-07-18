import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppEntry() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const seen = await AsyncStorage.getItem('onboardingSeen');

      if (seen === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }

      setIsReady(true);
    };

    init();
  }, []);

  return null;
}
