// screens/MapScreen/StepCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface StepCardProps {
  type: 'walk' | 'bus' | 'subway';
  instruction: string;
  highlighted?: boolean; // ✅ 강조 여부
}

const transportIcons = {
  walk: <Ionicons name="walk" size={24} color="#FF6A00" />,
  bus: <MaterialIcons name="directions-bus" size={24} color="#FF6A00" />,
  subway: <FontAwesome5 name="subway" size={22} color="#FF6A00" />,
};

const transportLabels = {
  walk: '도보',
  bus: '버스',
  subway: '지하철',
};

export default function StepCard({ type, instruction, highlighted }: StepCardProps) {
  return (
    <View style={[styles.card, highlighted && styles.highlightedCard]}>
      <Text style={styles.label}>다음 이동수단</Text>
      <View style={styles.iconCircle}>
        {transportIcons[type]}
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
  activeCard: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
  },
  highlightedCard: {
      backgroundColor: '#FFF1E6', // 연한 주황색 강조 배경
      shadowColor: '#FF6A00',
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
  },
});
