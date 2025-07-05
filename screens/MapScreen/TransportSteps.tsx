// screens/MapScreen/TransportSteps.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import StepCard from './StepCard';
import InstructionBox from './InstructionBox';
import tmapData from '../../constants/routeData';
import { useLocation } from '../../contexts/LocationContext';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function TransportSteps({ currentMode }) {
  const { location } = useLocation();
  const legs = tmapData?.metaData?.plan?.itineraries?.[0]?.legs ?? [];

  const busLegs = legs.filter((leg) => leg.mode === 'BUS');
  const firstBusLeg = busLegs[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {legs.map((leg, index) => {
        const rawMode = leg?.mode?.toUpperCase();
        let mode: 'walk' | 'bus' | 'subway' = 'walk';

        if (rawMode === 'BUS') {
          if (leg !== firstBusLeg) return null;

          const startStop = firstBusLeg?.start?.name ?? '';
          const endStop = firstBusLeg?.end?.name ?? '';
          const routeName = firstBusLeg?.route?.split(':')[1];
          const duration = firstBusLeg?.sectionTime ?? 0;

          return (
            <View key={`bus-${index}`} style={styles.row}>
              <StepCard
                type="bus"
                instruction={`${Math.floor(duration / 60)}분`}
                highlighted={currentMode === 'BUS'}
                route={firstBusLeg.route}
              />
              <InstructionBox
                mode="bus"
                startStop={startStop}
                endStop={endStop}
                routeName={routeName}
              />
            </View>
          );
        }

        if (rawMode === 'SUBWAY') mode = 'subway';

        const duration = leg.sectionTime ?? 0;
        const description = leg.steps?.[0]?.description ?? '';
        const startStop = leg?.start?.name ?? '';
        const endStop = leg?.end?.name ?? '';
        const routeName = leg.route?.includes(':') ? leg.route.split(':')[1] : leg.route;

        const instructionBoxProps =
          mode === 'walk'
            ? { mode, text: description }
            : { mode, startStop, endStop, exitInfo: '2' };

        return (
          <View key={index} style={styles.row}>
            <StepCard
              type={mode}
              instruction={`${Math.floor(duration / 60)}분`}
              highlighted={currentMode === rawMode}
              route={leg.route}
            />
            <InstructionBox {...instructionBoxProps} />
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
