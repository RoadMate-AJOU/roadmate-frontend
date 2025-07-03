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

export default function TransportSteps() {
  const { location } = useLocation();
  const legs = tmapData?.metaData?.plan?.itineraries?.[0]?.legs ?? [];

  const activeIndex = useMemo(() => {
    if (!location) return -1;
    return legs.findIndex((leg) => {
      const coords =
        leg.steps?.flatMap((step) => {
          const points =
            step.linestring
              ?.split(' ')
              .map((pair) => {
                const [lon, lat] = pair.split(',').map(parseFloat);
                return { latitude: lat, longitude: lon };
              }) ?? [];
          return points;
        }) ?? [];

      return coords.some(
        (pt) =>
          getDistance(
            location.latitude,
            location.longitude,
            pt.latitude,
            pt.longitude
          ) < 30
      );
    });
  }, [location]);

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
        const routeName = leg.route?.split(':')[1]; // ex) "간선:272" → "272"

        const instructionBoxProps =
          mode === 'walk'
            ? { mode, text: description }
            : mode === 'bus'
            ? { mode, startStop, endStop, routeName }
            : { mode, startStop, endStop, exitInfo: '2' };

        return (
          <View key={index} style={styles.row}>
            <StepCard
              type={mode}
              instruction={`${duration % 60}분`}
              highlighted={index === activeIndex}
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
