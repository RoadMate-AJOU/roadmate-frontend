import { useEffect } from 'react';
import { router } from 'expo-router';
import SplashScreen from '../screens/SplashScreen';

export default function AppEntry() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)'); // → 탭 구조로 이동
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}
