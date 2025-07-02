// screens/MapScreen/TransportSteps.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import StepCard from './StepCard';
import InstructionBox from './InstructionBox';
import tmapData from '../../data/tmap_sample1.json';

export default function TransportSteps() {
  // 각 leg에 들어 있는 steps에 mode를 주입하면서 평탄화
  const steps =
    tmapData?.metaData?.plan?.itineraries?.[0]?.legs?.flatMap(leg =>
      leg?.steps?.map(step => ({
        ...step,
        mode: leg.mode, // 각 step에 상위 leg의 mode 부여
      })) ?? []
    ) ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {steps.map((step, index) => {
        // 안전하게 mode 처리
        const rawMode = step?.mode?.toUpperCase();
        let mode: 'walk' | 'bus' | 'subway' = 'walk';

        if (rawMode === 'BUS') mode = 'bus';
        else if (rawMode === 'SUBWAY') mode = 'subway';

        const instruction = step?.description ?? '(설명 없음)';

        return (
          <View key={index} style={styles.row}>
            <StepCard type={mode} instruction={instruction} />
            <InstructionBox text={instruction} />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 40,
    paddingLeft: 10,
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});
