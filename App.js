// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from './screens/OnboardingScreen';
import Signup from './screens/signup';
import Home from './screens/home';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen'; // ✅ MapScreen 포함

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer> {/* independent 제거 ✅ */}
      <Stack.Navigator
        initialRouteName="Onboarding" // ✅ 무조건 Onboarding부터 시작
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
