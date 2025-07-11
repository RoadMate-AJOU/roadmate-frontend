import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeaderProps {
  destination: string;
  eta: string;
}

export default function Header({ destination, eta }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.push('/destination')}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.destinationText}>📍 {destination}</Text>
      <View style={{ flex: 1 }} />
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.etaLabel}>도착 예정</Text>
        <Text style={styles.etaTime}>{eta || '계산 중...'}</Text>
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
