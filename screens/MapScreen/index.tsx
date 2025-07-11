import React from 'react';
import { View } from 'react-native';
import Header from './Header';
import MapDisplay from './MapDisplay';
import InstructionBox from './InstructionBox';
import DetailedDirections from './DetailedDirections';
import TransportSteps from './TransportSteps';
import styles from './styles';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      {/* 상단 헤더 - 목적지 및 도착 시간 */}
      <Header />

      {/* 지도 + 현재 위치 마커 */}
      <MapDisplay />

      {/* 실시간 길안내 텍스트 */}
      <InstructionBox />

      {/* 세부 경로 안내 - 지도와 카드 사이에 추가 */}
      <DetailedDirections />

      {/* 도보/버스/지하철 단계별 카드 */}
      <TransportSteps />
    </View>
  );
}