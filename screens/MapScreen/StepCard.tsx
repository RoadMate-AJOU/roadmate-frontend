import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StepCardProps {
  type: 'walk' | 'bus' | 'subway';
  instruction: string;
  route?: string; // 예: "지선:3426" 또는 "3호선:경복궁"
  highlighted?: boolean;
  emoji?: string;
  fullGuidance?: string;
}

export default function StepCard({
  type,
  instruction,
  route,
  highlighted,
  emoji = '🚶',
  fullGuidance,
}: StepCardProps) {
  const getTypeText = () => {
    switch (type) {
      case 'walk': return '도보';
      case 'bus': return '버스';
      case 'subway': return '지하철';
      default: return '이동';
    }
  };

  const getBusNumber = () => {
    if (!route) return null;
    if (route.includes(':')) {
      return route.split(':')[1];
    }
    return route;
  };

  const busNumber = type === 'bus' ? getBusNumber() : null;

  return (
    <TouchableOpacity
      style={[styles.card, highlighted && styles.highlightedCard]}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, highlighted && styles.highlightedText]}>
        {highlighted ? '현재 이동수단' : '다음 이동수단'}
      </Text>

      <View style={[styles.emojiCircle, highlighted && styles.highlightedCircle]}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </View>

      <Text style={[styles.typeText, highlighted && styles.highlightedText]}>
        {getTypeText()}
      </Text>

      {type === 'bus' && busNumber && (
        <Text style={[styles.busInfoText, highlighted && styles.highlightedText]}>
          {`${busNumber}번`}
        </Text>
      )}

      <Text style={[styles.instructionText, highlighted && styles.highlightedText]}>
        {instruction}
      </Text>

      {fullGuidance && (
        <Text style={[styles.fullGuidanceText, highlighted && styles.highlightedText]}>
          {fullGuidance}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 170,
    marginBottom: 13,
    borderWidth: 2,
    borderColor: '#FF6A00',
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
    transform: [{ scale: 0.9 }],
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    color: '#111',
    textAlign: 'center',
  },
  emojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF6A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  emojiText: {
    fontSize: 32,
  },
  typeText: {
    fontSize: 23,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginTop: 2,
    marginBottom: 2,
  },
  busInfoText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FF6A00',
    marginBottom: 2,
    textAlign: 'center',
  },
  fullGuidanceText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
    flex: 1,
  },
  highlightedCard: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
    shadowColor: '#FF6A00',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    transform: [{ scale: 1.0 }],
  },
  highlightedText: {
    color: '#FFF',
  },
  highlightedCircle: {
    borderColor: '#FFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
