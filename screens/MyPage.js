import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
export default function MyPageScreen() {
  const router = useRouter();
  const { userstate: rawUserState } = useLocalSearchParams();
  const userState = rawUserState !== 'signed' ? 'signed' : 'guest';
  const username = '홍길동';

  const handleLogout = () => router.replace('/onboarding');
  const handleDeleteAccount = () => {
    Alert.alert('회원탈퇴', '정말로 탈퇴하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: () => router.replace('/onboarding'),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userRow}>
        <Image
          source={require('../assets/images/elderly.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.userLabel}>
          {userState === 'signed' ? `${username}님, 반갑습니다!` : '게스트 모드입니다'}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* 고객센터 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>고객센터</Text>
        <TouchableOpacity style={styles.listItem} onPress={() => { }}>
          <View style={styles.listRow}>
            <Text style={styles.listText}>공지사항</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => { }}>
          <View style={styles.listRow}>
            <Text style={styles.listText}>자주 묻는 질문</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 시스템 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>시스템</Text>
        <TouchableOpacity style={styles.listItem} onPress={() => { }}>
          <View style={styles.listRow}>
            <Text style={styles.listText}>앱소개</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => { }}>
          <View style={styles.listRow}>
            <Text style={styles.listText}>이용약관</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => { }}>
          <View style={styles.listRow}>
            <Text style={styles.listText}>개인정보 처리방침</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 버튼 영역 */}
      {userState === 'guest' ? (
        <View style={styles.rowButtonGroup}>
          <TouchableOpacity style={styles.halfButton} onPress={() => router.push('/signup')}>
            <Text style={styles.buttonText}>회원가입</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.halfButton} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>로그인</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.rowButtonGroup}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
            <Text style={styles.buttonText}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 60,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  image: {
    width: 115,
    height: 115,
    marginBottom: 16,
    borderRadius: 90,
  },
  userLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222',
  },
  divider: {
    marginTop: 24,
    width: '100%',
    height: 7,
    backgroundColor: '#E8E8E8',
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 6,
  },
  listItem: {
    backgroundColor: '#fff',
    paddingVertical: 14,
  },
  listText: {
    fontSize: 17,
    color: '#333',
  },
  rowButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  columnButtonGroup: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 40,
  },
  halfButton: {
    flex: 1,
    backgroundColor: '#FF8A33',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#666',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#D32F2F',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});