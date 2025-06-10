import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ExploreScreen() {
  const handleStartGuide = () => {
    // 여기에 navigation 또는 router.push('/destination') 등 넣을 수 있어요
    console.log('안내 시작');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>안내를 시작해볼까요?</Text>
      <TouchableOpacity style={styles.button} onPress={handleStartGuide}>
        <Text style={styles.buttonText}>목적지 설정하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, marginBottom: 20, fontWeight: '600' },
  button: { backgroundColor: '#0066cc', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16 },
});
