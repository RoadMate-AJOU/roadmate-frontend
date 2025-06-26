// index.tsx
// 전체적인 map 스크린 조립 구조
import React from 'react';
import { View } from 'react-native';
import Header from './Header';
import MapDisplay from './MapDisplay';
import InstructionBox from './InstructionBox';
import TransportSteps from './TransportSteps';
import MicButton from './MicButton';
import styles from './styles';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      {/* 상단 헤더 - 목적지 및 도착 시간 */}
      <Header destination="경복궁" eta="10:26" />

      {/* 지도 + 현재 위치 마커 */}
      <MapDisplay />

      {/* 실시간 길안내 텍스트 */}
      <InstructionBox />

      {/* 도보/버스/지하철 단계별 카드 */}
      <TransportSteps />

      {/* 하단 마이크 버튼 */}
      <MicButton />
    </View>
  );
}