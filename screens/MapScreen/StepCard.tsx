import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface StepCardProps {
  type: 'walk' | 'bus' | 'subway';
  instruction: string;
  route?: string; // "지선:3426" 또는 "3호선:경복궁" 형식
  highlighted?: boolean;
}

export default function StepCard({ type, instruction, route, highlighted }: StepCardProps) {
  const getIcon = () => {
    const color = highlighted ? '#FFF' : '#FF6A00';
    switch (type) {
      case 'walk':
        return <Ionicons name="walk" size={24} color={color} />;
      case 'bus':
        return <MaterialIcons name="directions-bus" size={24} color={color} />;
      case 'subway':
        return <FontAwesome5 name="subway" size={22} color={color} />;
      default:
        return null;
    }
  };

  const shouldShowInstruction = highlighted || type !== 'walk';

  return (
    <View style={[styles.card, highlighted && styles.highlightedCard]}>
      <Text style={[styles.label, highlighted && styles.highlightedText]}>다음 이동수단</Text>
      <View style={[styles.iconCircle, highlighted && styles.highlightedCircle]}>{getIcon()}</View>
      <Text style={[styles.typeText, highlighted && styles.highlightedText]}>{{
        walk: '도보',
        bus: '버스',
        subway: '지하철',
      }[type]}</Text>

      {shouldShowInstruction && (
        <Text style={[styles.instructionText, highlighted && styles.highlightedText]}>
          {instruction}
        </Text>
      )}
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
  busInfoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF6A00',
    marginBottom: 2,
    textAlign: 'center',
  },
  highlightedCard: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
    borderWidth: 2,
    shadowColor: '#FF6A00',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  highlightedText: {
    color: '#FFF',
  },
  highlightedCircle: {
    borderColor: '#FFF',
  },
});
