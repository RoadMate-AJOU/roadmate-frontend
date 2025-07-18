import { Stack } from 'expo-router';
import { LocationProvider } from '../contexts/LocationContext';
import { useFonts } from 'expo-font';
import { View } from 'react-native';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Pretendard: require('../assets/fonts/Pretendard-Regular.ttf'),
    PretendardBold: require('../assets/fonts/Pretendard-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <View />; // 또는 로딩 스피너, splash 등
  }

  return (
    <LocationProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </LocationProvider>
  );
}
