// screens/signup.tsx

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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ✅ 타입 정의
type RootStackParamList = {
  Onboarding: undefined;
  Signup: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

// ✅ export 해줘야 다른 곳에서 쓸 수 있음!
export type FormState = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type Props = {
  onSubmit?: (form: FormState) => void;
};

export default function SignUpScreen({ onSubmit }: Props) {
  const [form, setForm] = useState<FormState>({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const navigation = useNavigation<NavigationProp>();

  const handleChange = (field: keyof FormState, value: string) => {
    setForm({ ...form, [field]: value });
  };

// TODO : 형님이 하실 거 - api.js 에서 회원가입 함수 연결 -> 백에서 sessionId 받아와서 /(tabs)로 화면 넘길 때  {sessionId = {백에서 받은 sessionId},  userstate = “signed”} 파라미터 같이 넘기기
  const handlePress = () => {
    const { name, username, password, confirmPassword } = form;
    if (!name || !username || !password || !confirmPassword) {
      Alert.alert('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    onSubmit?.(form);

    navigation.replace('/(tabs)');
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
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

// 스타일
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
