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
    // TODO: 형님이 하실 거 - 로그아웃 처리 로직 추가
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
    // TODO: 형님이 하실 거 - 회원탈퇴 처리 로직 추가
  };

  // TODO : 형님이 하실 거 - 로그인 로직 구현
  const handleLogin = () => {}



// TODO : 형님이 하실 거 - userstate 받아와서 “signed” 일 때랑, “guest” 일 때 따라서 버튼 나타나는 거 다르게 + 로그인 버튼 추가
// userstate는 온보딩 -> 홈 -> 마이페이지 로 페이지 이동할때마다 파라미터로 데이터 받아오면 됩니당
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
