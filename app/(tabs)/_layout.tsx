// app/(tabs)/_layout.tsx
import { Tabs, Slot, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { useSessionStore } from '@/contexts/sessionStore';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { sessionId, userState } = useLocalSearchParams();
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    if (sessionId && userState) {
      setSession(sessionId as string, userState as 'guest' | 'signed');
    }
  }, [sessionId, userState]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: 'MyPage',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
