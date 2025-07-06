// InstructionBox.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InstructionBoxProps {
  mode: 'walk' | 'bus' | 'subway';
  busOrder?: number; // 첫 번째 버스인지 두 번째 버스인지
}

export default function InstructionBox({ mode, busOrder = 0 }: InstructionBoxProps) {
  if (mode !== 'bus') return null;

  if (busOrder === 0) {
    return (
      <View style={styles.box}>
        <Text style={styles.title}>🚌 시흥초등학교</Text>
        <Text style={styles.busLine}>
          <Text style={styles.busNumber}>707-1번 </Text>
          <Text style={styles.busTime}>2분</Text>
        </Text>
        <Text style={styles.busLine}>
          <Text style={styles.busNumber}>707-1번 </Text>
          <Text style={styles.busTime}>9분</Text>
        </Text>

        <Text style={styles.arrow}>▼</Text>

        <Text style={styles.title}>🚌 삼성디지털프라자</Text>
        <Text style={styles.busLine}>
          <Text style={styles.busNumber}>707-1번 </Text>
          <Text style={styles.busTime}>19분</Text>
        </Text>
      </View>
    );
  } else if (busOrder === 1) {
    return (
      <View style={styles.box}>
        <Text style={styles.title}>🚌 중앙시장</Text>
        <Text style={styles.busLine}>
          <Text style={styles.busNumber}>13-4번 </Text>
          <Text style={styles.busTime}>5분</Text>
        </Text>
        <Text style={styles.busLine}>
          <Text style={styles.busNumber}>13-4번 </Text>
          <Text style={styles.busTime}>11분</Text>
        </Text>

        <Text style={styles.arrow}>▼</Text>

        <Text style={styles.title}>🚌 수원역</Text>
        <Text style={styles.busLine}>
          <Text style={styles.busNumber}>13-4번 </Text>
          <Text style={styles.busTime}>24분</Text>
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#FFFAF0',
    borderColor: '#FF6A00',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    marginLeft: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    marginTop: 6,
  },
  busLine: {
    fontSize: 13,
    marginVertical: 1,
  },
  busNumber: {
    color: '#000',
  },
  busTime: {
    color: '#FF6A00',
  },
  arrow: {
    textAlign: 'center',
    fontSize: 18,
    color: '#FF6A00',
    marginVertical: 4,
  },
});
