// screens/MapScreen/InstructionBox.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InstructionBoxProps {
  text: string;
}

export default function InstructionBox({ text }: InstructionBoxProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{text}</Text>
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
