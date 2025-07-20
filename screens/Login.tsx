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
import { authService } from '@/services/api'; // 경로는 실제 파일 위치에 맞게 조정
import { useSessionStore } from '@/contexts/sessionStore'; // zustand store import

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
      // ✅ 로그인 요청
      const data = await authService.login(username, password);

      console.log('🔐 로그인 응답:', data);

      const sessionId = data?.token;
      if (!sessionId) throw new Error('세션 ID가 응답에 없습니다.');

      // ✅ sessionStore에 저장
      useSessionStore.getState().setSession(sessionId, 'signed');

      // ✅ 홈으로 이동
      router.replace('/(tabs)');
    } catch (err: any) {
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
