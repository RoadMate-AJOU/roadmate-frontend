import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://49.50.131.200:8080/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || '로그인 실패');
      }

      const data = await response.json();
      const sessionId = data.sessionId;

      Alert.alert('✅ 로그인 성공', `세션 ID: ${sessionId}`);

      router.replace({
        pathname: '/(tabs)',
        params: {
          sessionId,
          userState: 'signed',
        },
      });
    } catch (err) {
      console.error('❌ 로그인 오류:', err.message);
      Alert.alert('로그인 실패', err.message || '다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>로그인</Text>
      <Text style={styles.subtext}>등록된 계정으로 로그인해주세요.</Text>

      <Text style={styles.label}>아이디</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="user-o" size={20} color="#f45a00" style={styles.icon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="아이디를 입력하세요"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#ccc"
        />
      </View>

      <Text style={styles.label}>비밀번호</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="lock" size={20} color="#f45a00" style={styles.icon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#ccc"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 100,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f45a00',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 13,
    color: '#333',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 6,
    marginTop: 16,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f45a00',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#f45a00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
