// screens/MapScreen/index.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Header from './Header';
import MapDisplay from './MapDisplay';
import InstructionBox from './InstructionBox';
import DetailedDirections from './DetailedDirections';
import TransportSteps from './TransportSteps';
import MicButton from './MicButton';
import styles from './styles';

import { useBusArrival } from '../../hooks/useBusArrival';
import { useSubwayArrival } from '../../hooks/useSubwayArrival';
import tmapData from '../../constants/routeData';

export default function MapScreen() {
  const [eta, setEta] = useState('');
  const legs = tmapData?.metaData?.plan?.itineraries?.[0]?.legs ?? [];

  const firstBusLeg = legs.find((leg) => leg.mode === 'BUS');
  const firstSubwayLeg = legs.find((leg) => leg.mode === 'SUBWAY');

  const { soonestMinutes: busMin } = useBusArrival(
    firstBusLeg?.stId,
    firstBusLeg?.busRouteId,
    firstBusLeg?.ord
  );

  const { soonestMinutes: subwayMin } = useSubwayArrival(
    firstSubwayLeg?.start?.name
  );

  useEffect(() => {
    const now = new Date();
    const totalDuration = legs.reduce((sum, leg) => sum + (leg.sectionTime ?? 0), 0);
    const extraMin = (busMin ?? 0) + (subwayMin ?? 0);
    const etaDate = new Date(now.getTime() + (totalDuration / 60 + extraMin) * 60 * 1000);

    const hours = etaDate.getHours().toString().padStart(2, '0');
    const minutes = etaDate.getMinutes().toString().padStart(2, '0');
    setEta(`${hours}:${minutes}`);
  }, [busMin, subwayMin]);

  return (
    <View style={styles.container}>
      {/* 상단 헤더 - 목적지 및 도착 시간 */}
      <Header destination="경복궁" eta={eta} />

      {/* 지도 + 현재 위치 마커 */}
      <MapDisplay />

      {/* 실시간 길안내 텍스트 */}
      <InstructionBox />

      {/* 세부 경로 안내 - 지도와 카드 사이에 추가 */}
      <DetailedDirections />

      {/* 도보/버스/지하철 단계별 카드 */}
      <TransportSteps />

      {/* 하단 마이크 버튼 */}
      <MicButton />
    </View>
  );
}
