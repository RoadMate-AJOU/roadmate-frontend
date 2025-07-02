// screens/MapScreen/StepCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepCardProps {
  type: 'walk' | 'bus' | 'subway';
  instruction: string;
}

const transportIcons = {
  walk: '🚶',
  bus: '🚌',
  subway: '🚇',
};

const transportLabels = {
  walk: '도보',
  bus: '버스',
  subway: '지하철',
};

export default function StepCard({ type, instruction }: StepCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>다음 이동수단</Text>
      <View style={styles.iconCircle}>
        <Text style={styles.emoji}>{transportIcons[type]}</Text>
      </View>
      <Text style={styles.typeText}>{transportLabels[type]}</Text>
      <Text style={styles.instructionText}>{instruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 180,
    borderWidth: 2,
    borderColor: '#FF6A00',
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#111',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emoji: {
    fontSize: 26,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});
