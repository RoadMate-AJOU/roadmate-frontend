// screens/MapScreen/InstructionBox.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InstructionBoxProps {
  mode: 'walk' | 'bus' | 'subway';
  text?: string;
  exitInfo?: string;
  startStop?: string;
  endStop?: string;
}


export default function InstructionBox({ mode, text, exitInfo, startStop, endStop }: InstructionBoxProps) {
  let displayText = '';


  if (mode === 'walk') {
    displayText = text ?? '';
  } else if (mode === 'bus') {
    displayText = `${endStop ?? '정류장'}에서 하차`;
  } else if (mode === 'subway') {
    displayText = `${startStop ?? '승차역'} ➜ ${endStop ?? '하차역'} (출구 ${exitInfo ?? '1'}번)`;
  }

  return (
    <View style={styles.box}>
      <Text style={styles.text}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#FFFAF0',
    borderColor: '#FF6A00',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    marginLeft: 10,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
});
