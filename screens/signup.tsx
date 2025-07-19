import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export type FormState = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const API_BASE_URL = 'http://49.50.131.200:8080';

export default function SignUpScreen() {
  const [form, setForm] = useState<FormState>({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: keyof FormState, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handlePress = async () => {
    const { name, username, password, confirmPassword } = form;

    if (!name || !username || !password || !confirmPassword) {
      Alert.alert('모든 항목을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, username, password }),
      });

      const result = await response.json();

      console.log('📦 응답 데이터:', result);

      if (!response.ok) {
        throw new Error(result.message || '회원가입 실패');
      }

      const { sessionId } = result;

      Alert.alert('회원가입 완료', '이제 서비스를 이용하실 수 있습니다.');

      router.replace({
        pathname: '/(tabs)',
        params: {
          sessionId,
          userState: 'signed',
        },
      });
    } catch (error: any) {
      console.error('❌ 회원가입 에러:', error);
      Alert.alert('회원가입 실패', error.message || '네트워크 오류');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatch =
    form.password.length > 0 && form.password === form.confirmPassword;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회원가입</Text>
      <Text style={styles.subtext}>
        사용자 맞춤 기능을 시작하기 위해서 회원가입을 해야합니다.
      </Text>

      {/* 이름 */}
      <Text style={styles.label}>이름</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="user" size={20} color="#f45a00" style={styles.icon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="예) 홍길동"
          value={form.name}
          onChangeText={(v) => handleChange('name', v)}
          placeholderTextColor="#ccc"
        />
      </View>

      {/* 아이디 */}
      <Text style={styles.label}>아이디</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="user-o" size={20} color="#f45a00" style={styles.icon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="한국어, 영어 모두 가능"
          value={form.username}
          onChangeText={(v) => handleChange('username', v)}
          placeholderTextColor="#ccc"
        />
      </View>

      {/* 비밀번호 */}
      <Text style={styles.label}>비밀번호</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="lock" size={20} color="#f45a00" style={styles.icon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="비밀번호"
          value={form.password}
          onChangeText={(v) => handleChange('password', v)}
          secureTextEntry
          placeholderTextColor="#ccc"
        />
      </View>

      {/* 비밀번호 확인 */}
      <Text style={styles.label}>비밀번호 확인</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="lock" size={20} color="#f45a00" style={styles.icon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="비밀번호를 다시 입력해주세요."
          value={form.confirmPassword}
          onChangeText={(v) => handleChange('confirmPassword', v)}
          secureTextEntry
          placeholderTextColor="#ccc"
        />
        {isPasswordMatch && (
          <FontAwesome
            name="check"
            size={18}
            color="#f45a00"
            style={styles.rightCheck}
          />
        )}
      </View>

      {/* 버튼 */}
      <TouchableOpacity style={styles.button} onPress={handlePress} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>시작하기</Text>
        )}
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
  rightCheck: {
    position: 'absolute',
    right: 12,
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
