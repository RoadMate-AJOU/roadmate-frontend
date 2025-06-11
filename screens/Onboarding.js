import { View, Text, StyleSheet } from 'react-native';

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>온보딩 화면입니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
});
