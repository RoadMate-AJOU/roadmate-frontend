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
import { useSessionStore } from '../contexts/sessionStore';

type LoginResponse = {
  id: string;
  token: string;
};

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setSession } = useSessionStore();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://49.50.131.200:8080/users/signin', {
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

      const result: LoginResponse = await response.json(); // ✅ JSON 응답 파싱
      const sessionId = result.token;
      const userId = result.id;

      console.log('✅ 로그인 성공:', sessionId);
      console.log('✅ 사용자 ID:', userId);

      // ✅ 세션 저장
      await setSession(sessionId, 'signed');

      // ✅ 메인 탭으로 이동
      router.replace({
        pathname: '/(tabs)',
        params: {
          sessionId,
          userId,
          userstate: 'signed',
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

      {/* 아이디 */}
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

      {/* 비밀번호 */}
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

      {/* 로그인 버튼 */}
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
