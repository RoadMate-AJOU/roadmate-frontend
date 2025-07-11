// screens/MapScreen/Header.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Header() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // API 데이터가 있으면 사용, 없으면 기본값
  const getDisplayInfo = () => {
    let destination = '경복궁'; // 기본값
    let eta = '10:26'; // 기본값

    if (params.destinationName) {
      destination = params.destinationName;
    }

    if (params.routeData) {
      try {
        const routeData = JSON.parse(params.routeData);
        const totalTimeSeconds = routeData.totalTime || 0;

        if (totalTimeSeconds > 0) {
          const now = new Date();
          const arrivalTime = new Date(now.getTime() + (totalTimeSeconds * 1000));
          eta = arrivalTime.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        }
      } catch (error) {
        console.warn('Header: 경로 데이터 파싱 실패', error);
      }
    }

    return { destination, eta };
  };

  const { destination, eta } = getDisplayInfo();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.push('/destination')}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.destinationText}>📍 {destination}</Text>
      <View style={{ flex: 1 }} />
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.etaLabel}>도착 예정</Text>
        <Text style={styles.etaTime}>{eta}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  destinationText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: '#FF5900',
  },
  etaLabel: {
    fontSize: 12,
    color: '#555',
  },
  etaTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
});