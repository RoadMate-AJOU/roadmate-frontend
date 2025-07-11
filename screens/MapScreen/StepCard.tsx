// screens/MapScreen/StepCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StepCardProps {
  type: 'walk' | 'bus' | 'subway';
  instruction: string;
  route?: string;
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
  fullGuidance
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
    // "노선:13-4" → "13-4"
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
      {/* 다음 이동수단 라벨 */}
      <Text style={[styles.label, highlighted && styles.highlightedText]}>
        {highlighted ? '현재 이동수단' : '다음 이동수단'}
      </Text>

      {/* 큰 이모티콘 */}
      <View style={[styles.emojiCircle, highlighted && styles.highlightedCircle]}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </View>

      {/* 이동수단 타입 */}
      <Text style={[styles.typeText, highlighted && styles.highlightedText]}>
        {getTypeText()}
      </Text>

      {/* 버스 번호 정보 */}
      {type === 'bus' && busNumber && (
        <Text style={[styles.busInfoText, highlighted && styles.highlightedText]}>
          {`${busNumber}번`}
        </Text>
      )}

      {/* 소요 시간 */}
      <Text style={[styles.instructionText, highlighted && styles.highlightedText]}>
        {instruction}
      </Text>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 170,
    marginBottom:13,
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
    justifyContent: 'space-between', // 공간 균등 분배
    transform: [{ scale: 0.9 }],
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6, // 여백 줄임
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
    marginBottom: 6, // 여백 줄임
    backgroundColor: '#fff',
  },
  emojiText: {
    fontSize: 32,
  },
  typeText: {
    fontSize: 23,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2, // 여백 줄임
  },
  instructionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginTop: 2, // 여백 줄임
    marginBottom: 2, // 아래 여백 추가해서 조절
  },
  busInfoText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FF6A00',
    marginBottom: 1, // 여백 줄임
  },
  fullGuidanceText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2, // 여백 줄임
    lineHeight: 12,
    flex: 1, // 남은 공간 사용
  },

  // 강조 스타일 - 현재 이동수단 (배경색 반전)
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