import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Image, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MyPage() {
  const router = useRouter();
  const { userstate: rawUserState } = useLocalSearchParams();
  const userstate = rawUserState || 'guest';

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    console.log('✅ 로그아웃 처리');
    router.replace('/onboarding');
  };

  const handleDeleteAccount = () => {
    Alert.alert('회원탈퇴', '정말로 탈퇴하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: () => {
          console.log('✅ 회원탈퇴 처리');
          router.replace('/onboarding');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/elderly.png')} // ✅ 이미지 경로
        style={styles.image}
        resizeMode="contain"
      />

      {userstate === 'guest' ? (
        <>
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>회원가입</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>로그인</Text>
          </TouchableOpacity>
        </>
      ) : (
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  image: {
    width: 320,
    height: 320,
    marginBottom: 20,
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
