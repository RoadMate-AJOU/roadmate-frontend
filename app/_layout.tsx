import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* index.tsx 화면용 설정 */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* 탭 네비게이션 그룹 설정 */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
