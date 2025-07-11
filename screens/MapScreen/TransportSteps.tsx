import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import StepCard from './StepCard';
import InstructionBox from './InstructionBox';
import tmapData from '../../constants/routeData';
import { useLocation } from '../../contexts/LocationContext';

export default function TransportSteps() {
  const { currentLegIndex } = useLocation();
  const legs = tmapData?.metaData?.plan?.itineraries?.[0]?.legs ?? [];

  let busCount = 0; // 각 버스 구간의 순서 추적

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {legs.map((leg, index) => {
        const rawMode = leg?.mode?.toUpperCase();
        let mode: 'walk' | 'bus' | 'subway' = 'walk';

        if (rawMode === 'BUS') mode = 'bus';
        else if (rawMode === 'SUBWAY') mode = 'subway';

        const duration = leg.sectionTime ?? 0;
        const description = leg.steps?.[0]?.description ?? '';
        const startStop = leg?.start?.name ?? '';
        const endStop = leg?.end?.name ?? '';
        const routeName = leg.route?.includes(':') ? leg.route.split(':')[1] : leg.route;

        const instructionBoxProps =
          mode === 'walk'
            ? { mode, text: description }
            : {
                mode,
                startStop,
                endStop,
                exitInfo: '2',
                busOrder: busCount,
                stationName: startStop,
                routeName: routeName || '',
                stationId: leg.stId ?? leg.stationId ?? '',
                busRouteId: leg.busRouteId ?? '',
                stationOrder: leg.ord ?? leg.stationOrder ?? '',

              };

        const stepCard = (
          <StepCard
            key={`step-${index}`}
            type={mode}
            instruction={`${Math.floor(duration / 60)}분`}
            highlighted={index === currentLegIndex}
            route={leg.route}
          />
        );

        const instructionBox = (
          <InstructionBox key={`instruction-${index}`} {...instructionBoxProps} />
        );

        const row = (
          <View key={index} style={styles.row}>
            {stepCard}
            {instructionBox}
          </View>
        );

        if (mode === 'bus') busCount++;

        return row;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
});
