import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function MyPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/signup'); // ✅ signup.js로 이동
  };

  const handleLogout = () => {
    console.log('로그아웃');
    // TODO: 로그아웃 처리 로직 추가
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '회원탈퇴',
      '정말로 탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴', style: 'destructive', onPress: () => console.log('회원탈퇴') },
      ]
    );
    // TODO: 회원탈퇴 처리 로직 추가
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>회원탈퇴</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 20,
  },
  button: {
    backgroundColor: '#FF5900',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  dangerButton: {
    backgroundColor: '#B00020',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
