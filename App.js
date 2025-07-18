import { Text, TextInput } from 'react-native';
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';

import Onboarding from './screens/Onboarding';
import Signup from './screens/signup';
import MyPage from './screens/MyPage';
import Home from './screens/home';
import MapScreen from './screens/MapScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Pretendard: require('./assets/fonts/Pretendard-Regular.ttf'),
    Pretendard-Bold: require('./assets/fonts/Pretendard-Bold.ttf'),
  });

  useEffect(() => {
    const defaultFont = { fontFamily: 'Pretendard' };
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = [Text.defaultProps.style, defaultFont];
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.style = [TextInput.defaultProps.style, defaultFont];
  }, []);

  if (!fontsLoaded) return <AppLoading />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="MyPage" component={MyPage} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
