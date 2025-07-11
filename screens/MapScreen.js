import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import Header from './MapScreen/Header'; // Header 컴포넌트 경로 확인
import tmapData from '../constants/routeData';
import { useBusArrival } from '../hooks/useBusArrival';
import { useSubwayArrival } from '../hooks/useSubwayArrival';

export default function MapScreen() {
  const legs = tmapData?.metaData?.plan?.itineraries?.[0]?.legs ?? [];

  const [eta, setEta] = useState('');

  // ✅ 정류장/노선 정보 설정
  const firstBusLeg = legs.find((leg) => leg.mode === 'BUS');
  const firstSubwayLeg = legs.find((leg) => leg.mode === 'SUBWAY');

  const {
    soonestMinutes: busMin,
  } = useBusArrival(
    firstBusLeg?.stId ?? '',
    firstBusLeg?.busRouteId ?? '',
    firstBusLeg?.ord ?? ''
  );

  const {
    soonestMinutes: subwayMin,
  } = useSubwayArrival(firstSubwayLeg?.start?.name ?? '');

  // ✅ 도보/전체 duration 계산
  const totalDurationMin = legs.reduce((sum, leg) => {
    return sum + (leg?.sectionTime ?? 0);
  }, 0) / 60;

  // ✅ ETA 계산 (매번 현재 시각 기준)
  useEffect(() => {
    if (busMin == null && subwayMin == null) return;

    const now = new Date(); // 매번 현재 시간 기준으로 계산
    console.log('🕒 현재 시각:', now.toLocaleTimeString());
    console.log('🚶 도보 등 총 소요시간:', totalDurationMin);
    console.log('🚌 버스까지:', busMin, '분');
    console.log('🚇 지하철까지:', subwayMin, '분');

    const etaDate = new Date(
      now.getTime() +
        (totalDurationMin + (busMin ?? 0) + (subwayMin ?? 0)) * 60 * 1000
    );
    const hours = etaDate.getHours().toString().padStart(2, '0');
    const minutes = etaDate.getMinutes().toString().padStart(2, '0');
    setEta(`${hours}:${minutes}`);
  }, [busMin, subwayMin, totalDurationMin]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} />
      <View style={styles.header}>
        <Header destination="강남역" eta={eta} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
  },
});
