import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from './screens/OnboardingScreen';
import Signup from './screens/signup';
import HomeScreen from './screens/HomeScreen';
import Home from './screens/home';
import MapScreen from './screens/MapScreen'; // ✅ MapScreen 추가

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Map" component={MapScreen} /> {/* ✅ Map 추가 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
