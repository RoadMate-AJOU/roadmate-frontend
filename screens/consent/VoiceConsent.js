import { View, Text, StyleSheet } from 'react-native';

export default function VoiceConsent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>음성 정보 동의 페이지입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
});
