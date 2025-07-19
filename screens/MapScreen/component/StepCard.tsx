import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StepCard({ type, instruction, highlighted, route, emoji, fullGuidance, liveInfo }: any) {
  return (
    <View style={[styles.card, highlighted && styles.highlightedCard]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{emoji || '🚶'}</Text>
      </View>
      <Text style={styles.guidance}>{fullGuidance || '이동 정보 없음'}</Text>

      {/* 도보가 아닐 때만 infoText 렌더링 */}
      {type !== 'walk' && (
        <Text style={styles.infoText}>
          {liveInfo || instruction || '정보 없음'}
        </Text>
      )}

      {route && <Text style={styles.route}>{route}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    height: 240,
    borderRadius: 12,
    backgroundColor: '#fffaf0',
    padding: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#ff6600',
  },
  badge: {
    backgroundColor: '#fff',        // 흰색 배경
    borderWidth: 2,                 // 테두리 두께 추가
    borderColor: '#ff6600',         // 테두리 주황색
    borderRadius: 16,
    padding: 6,
    marginBottom: 6,
  },
  badgeText: {
    color: '#ff6600',               // 글자도 주황색으로 변경 (가독성 ↑)
    fontWeight: 'bold',
    fontSize: 16,
  },
  guidance: {
    fontSize: 13,
    color: '#ff6600',
    textAlign: 'center',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  route: {
    fontSize: 10,
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
  },
});