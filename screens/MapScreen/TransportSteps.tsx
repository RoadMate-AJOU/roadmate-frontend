// TransportSteps.tsx
// 도보/버스/지하철 UI 리스트
import React from 'react';
import { View } from 'react-native';
import StepCard from './StepCard';
import styles from './styles';

export default function TransportSteps() {
  return (
    <View style={styles.stepsContainer}>
      {/* 현재 수단, 이후 수단들 순서대로 렌더링 */}
      <StepCard type="walk" remaining={100} />
      <StepCard type="bus" lines={[472, 99, 123]} />
      <StepCard type="subway" stations={[1, 3, 7]} />
    </View>
  );
}