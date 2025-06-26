// StepCard.tsx
// 각각의 교통 수단 카드를 나타냄
import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

export default function StepCard({ type, remaining, lines, stations }) {
  return (
    <View style={styles.stepCard}>
      {/* 수단별 내용 조건부 렌더링 */}
      {type === 'walk' && (
        <Text style={styles.cardText}>도보
          {'\n'}남은 거리 {remaining}m
        </Text>
      )}
      {type === 'bus' && (
        <Text style={styles.cardText}>버스 탑승
          {'\n'}노선: {lines?.join(', ')}
        </Text>
      )}
      {type === 'subway' && (
        <Text style={styles.cardText}>지하철
          {'\n'}호선: {stations?.join(', ')}
        </Text>
      )}
    </View>
  );
}