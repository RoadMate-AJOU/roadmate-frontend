import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@/contexts/sessionStore';

export default function MyPageScreen() {
  const router = useRouter();
  const { userState, clearSession } = useSessionStore();

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    await clearSession();
    console.log('✅ 로그아웃 처리');
    router.replace('/onboarding');
  };

  const handleDeleteAccount = () => {
    Alert.alert('회원탈퇴', '정말로 탈퇴하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          console.log('✅ 회원탈퇴 처리');
          router.replace('/onboarding');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/elderly.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {userState === 'guest' && (
        <>
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>회원가입</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>로그인</Text>
          </TouchableOpacity>
        </>
      )}

      {userState === 'signed' && (
        <>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleDeleteAccount}>
            <Text style={styles.buttonText}>회원탈퇴</Text>
          </TouchableOpacity>
        </>
      )}
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
  image: {
    width: 260,
    height: 260,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF5900',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: 150,
    alignItems: 'center'
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
