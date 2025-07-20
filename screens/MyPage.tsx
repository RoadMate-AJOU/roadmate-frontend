import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../contexts/sessionStore';

export default function MyPage() {
  const router = useRouter();
  const { userState, sessionId, clearSession } = useSessionStore();

  const handleSignUp = () => router.push('/signup');
  const handleLogin = () => router.push('/login');
  const handleLogout = () => {
    clearSession();
    router.replace('/onboarding');
  };
  const handleDeleteAccount = () => {
    Alert.alert('회원탈퇴', '정말로 탈퇴하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          if (!sessionId) {
            Alert.alert('세션 없음', '로그인 후 시도해 주세요.');
            return;
          }
          try {
            const res = await fetch(`http://49.50.131.200:8080/users/${sessionId}`, {
              method: 'DELETE',
            });
            if (!res.ok) throw new Error(await res.text());
            Alert.alert('회원탈퇴 완료');
            clearSession();
            router.replace('/onboarding');
          } catch (err) {
            Alert.alert('오류', '회원탈퇴 실패');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/elderly.png')} style={styles.image} />
      {userState === 'signed' ? (
        <>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleDeleteAccount}>
            <Text style={styles.buttonText}>회원탈퇴</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>회원가입</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>로그인</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', gap: 20 },
  image: { width: 260, height: 260, marginBottom: 20 },
  button: { backgroundColor: '#FF5900', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25 },
  dangerButton: { backgroundColor: '#B00020' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
