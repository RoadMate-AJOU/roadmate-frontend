/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#FF5900';
const tintColorDark = '#FF5900';

export const Colors = {
  light: {
    text: '#000000',
    background: '#fff',
    tint: tintColorLight,
    icon: tintColorLight,
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFF',
    background: '#151515',
    tint: tintColorDark,
    icon: tintColorDark,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
