// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="mypage"
        options={{ title: 'MyPage', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
