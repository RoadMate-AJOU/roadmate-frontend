import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function SignUpForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handlePress = () => {
    if (!name || !phone) {
      alert('이름과 전화번호를 입력해주세요.');
      return;
    }
    onSubmit({ name, phone });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TextInput
        style={styles.input}
        placeholder="이름"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="전화번호"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Button title="가입하기" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
});
