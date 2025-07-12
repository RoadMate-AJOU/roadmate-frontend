import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useLocation } from '../../contexts/LocationContext';

export default function InstructionBox() {
  const [currentInstruction, setCurrentInstruction] = useState('🚶‍♂️ 목적지까지 안내 중');
  const { currentLegIndex } = useLocation();
  const params = useLocalSearchParams();
  const lastLegIndex = useRef(-1);
  const hasApiData = useRef(false);
  const emojiGuides = useRef([]);

  // ✅ routeData가 유효하지 않으면 샘플 fallback
  useEffect(() => {
    if (params.routeData && !hasApiData.current) {
      try {
        const routeData = JSON.parse(params.routeData);
        if (!routeData?.guides || routeData.guides.length === 0) {
          throw new Error('routeData.gudes가 비어 있음');
        }

        parseEmojiGuides(routeData);
        hasApiData.current = true;
        updateInstruction(0);
        console.log('📝 InstructionBox: API 데이터로 초기화 완료');
      } catch (error) {
        console.warn('InstructionBox: API 데이터 파싱 실패 또는 guides 없음 → 샘플로 fallback', error);
        useSampleGuides();
      }
    } else if (!params.routeData && !hasApiData.current) {
      useSampleGuides();
    }
  }, [params.routeData]);

  useEffect(() => {
    if (currentLegIndex === lastLegIndex.current) return;

    lastLegIndex.current = currentLegIndex;
    updateInstruction(currentLegIndex);
  }, [currentLegIndex]);

  // ✅ 서울 기반 샘플 가이드
  const useSampleGuides = () => {
    emojiGuides.current = [
      { guidance: '🚶 광화문역까지 이동', transportType: 'WALK' },
      { guidance: '🚇 5호선 지하철 탑승', transportType: 'SUBWAY', routeName: '5호선' },
      { guidance: '🚶 경복궁역까지 도보 이동', transportType: 'WALK' },
      { guidance: '🚌 종로02번 버스 승차', transportType: 'BUS', busNumber: '종로02' },
      { guidance: '🚶 세종대로까지 도보 이동', transportType: 'WALK' },
    ];
    hasApiData.current = false;
    updateInstruction(0);
    console.log('📝 InstructionBox: 샘플 가이드 (서울 경로) 로딩 완료');
  };

  const parseEmojiGuides = (routeData) => {
    const guides = [];

    routeData.guides?.forEach((guide, index) => {
      if (guide.guidance && /🚶|🚌|🚇|🚄|🚐/.test(guide.guidance)) {
        guides.push({
          index: guides.length,
          originalIndex: index,
          guidance: guide.guidance,
          transportType: guide.transportType,
          busNumber: guide.busNumber,
          routeName: guide.routeName
        });
      }
    });

    emojiGuides.current = guides;
    console.log(`📝 이모티콘 가이드 ${guides.length}개 파싱 완료`);
  };

  const updateInstruction = (legIndex) => {
    const guide = emojiGuides.current[legIndex] || emojiGuides.current[0];
    const instruction = formatSimpleInstruction(guide);
    setCurrentInstruction(instruction);
  };

  const formatSimpleInstruction = (guide) => {
    if (!guide) return '🚶‍♂️ 이동 중';

    const { transportType, busNumber, routeName, guidance } = guide;

    if (guidance.includes('🚶')) {
      if (guidance.includes('까지')) {
        const destination = guidance.split('까지')[0].replace('🚶', '').trim();
        return `🚶‍♂️ ${destination}으로 이동`;
      }
      return '🚶‍♂️ 도보 이동 중';
    }

    if (guidance.includes('🚌')) {
      const busInfo = busNumber || routeName || '버스';
      return `🚌 ${busInfo} 탑승`;
    }

    if (guidance.includes('🚇') || guidance.includes('🚄')) {
      const subwayInfo = routeName || '지하철';
      return `🚇 ${subwayInfo} 탑승`;
    }

    return '🚶‍♂️ 이동 중';
  };

  return (
    <View style={styles.instructionBox}>
      <Text style={styles.instructionText}>{currentInstruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  instructionBox: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: '#FFF1E6',
    borderRadius: 12,
    padding: 12,
  },
  instructionText: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
  },
});
