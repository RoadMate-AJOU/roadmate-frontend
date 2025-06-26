// InstructionBox.tsx
// "100m 직진 후 좌회전" 안내 UI
import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

export default function InstructionBox() {
  return (
    <View style={styles.instructionBox}>
      {/* 도보 중 실시간 안내 */}
      <Text style={styles.instructionText}>🚶‍♂️ 100m 직진 후 좌회전</Text>
    </View>
  );
}