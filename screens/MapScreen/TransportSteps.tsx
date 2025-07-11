// screens/MapScreen/TransportSteps.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import StepCard from './StepCard';
import { useLocation } from '../../contexts/LocationContext';
import styles from './styles';

export default function TransportSteps() {
  const { currentLegIndex } = useLocation();
  const params = useLocalSearchParams();
  const [stableSteps, setStableSteps] = useState([]); // 안정화된 스텝 데이터
  const lastLegIndex = useRef(-1);

  // 주요 이동수단만 추출 (이모티콘 기준)
  const getMainTransportSteps = () => {
    if (params.routeData) {
      try {
        const routeData = JSON.parse(params.routeData);
        return parseApiMainSteps(routeData);
      } catch (error) {
        console.warn('TransportSteps: API 데이터 파싱 실패', error);
        return getSampleMainSteps();
      }
    }
    return getSampleMainSteps();
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initialSteps = getMainTransportSteps();
    setStableSteps(initialSteps);
  }, [params.routeData]);

  // currentLegIndex 변경 시에만 highlighted 상태 업데이트
  useEffect(() => {
    if (currentLegIndex === lastLegIndex.current) return;

    lastLegIndex.current = currentLegIndex;

    setStableSteps(prevSteps =>
      prevSteps.map((step, index) => ({
        ...step,
        highlighted: step.originalIndex === currentLegIndex || index === currentLegIndex
      }))
    );
  }, [currentLegIndex]);

  // API 데이터에서 이모티콘 기준으로 주요 이동수단 추출
  const parseApiMainSteps = (routeData) => {
    if (!routeData.guides || routeData.guides.length === 0) {
      return getSampleMainSteps();
    }

    const mainSteps = [];

    routeData.guides.forEach((guide, index) => {
      // 🎯 이모티콘이 있는 주요 안내만 추출
      if (guide.guidance && (
        guide.guidance.includes('🚶') ||
        guide.guidance.includes('🚌') ||
        guide.guidance.includes('🚇') ||
        guide.guidance.includes('🚄') ||
        guide.guidance.includes('🚐')
      )) {
        const { transportType, time, routeName, busNumber, guidance } = guide;

        let type: 'walk' | 'bus' | 'subway' = 'walk';
        if (transportType === 'BUS' || guidance.includes('🚌') || guidance.includes('🚐')) {
          type = 'bus';
        } else if (transportType === 'SUBWAY' || guidance.includes('🚇') || guidance.includes('🚄')) {
          type = 'subway';
        }

        // 시간 표시 (분 단위)
        const timeText = time ? `${Math.ceil(time / 60)}분` : '';

        // 노선 정보
        const route = busNumber || routeName || '';

        mainSteps.push({
          type,
          instruction: timeText,
          highlighted: index === currentLegIndex,
          route: route ? `노선:${route}` : undefined,
          emoji: getEmojiFromGuidance(guidance),
          fullGuidance: guidance,
          originalIndex: index // 원본 인덱스 저장
        });
      }
    });

    console.log(`📋 주요 이동수단 ${mainSteps.length}개 추출됨`);
    return mainSteps;
  };

  // 안내 문구에서 이모티콘 추출
  const getEmojiFromGuidance = (guidance) => {
    if (guidance.includes('🚶')) return '🚶';
    if (guidance.includes('🚌')) return '🚌';
    if (guidance.includes('🚇')) return '🚇';
    if (guidance.includes('🚄')) return '🚄';
    if (guidance.includes('🚐')) return '🚐';
    return '🚶'; // 기본값
  };

  // 샘플 데이터의 주요 이동수단
  const getSampleMainSteps = () => {
    return [
      {
        type: 'walk',
        instruction: '8분',
        highlighted: currentLegIndex === 0,
        emoji: '🚶',
        fullGuidance: '🚶 시흥초등학교까지 도보',
        originalIndex: 0
      },
      {
        type: 'bus',
        instruction: '20분',
        highlighted: currentLegIndex === 1,
        route: '노선:707-1',
        emoji: '🚌',
        fullGuidance: '🚌 707-1번 버스 탑승',
        originalIndex: 1
      },
      {
        type: 'walk',
        instruction: '5분',
        highlighted: currentLegIndex === 2,
        emoji: '🚶',
        fullGuidance: '🚶 중앙시장까지 도보',
        originalIndex: 2
      },
      {
        type: 'bus',
        instruction: '30분',
        highlighted: currentLegIndex === 3,
        route: '노선:13-4',
        emoji: '🚌',
        fullGuidance: '🚌 13-4번 버스 탑승',
        originalIndex: 3
      },
      {
        type: 'walk',
        instruction: '4분',
        highlighted: currentLegIndex === 4,
        emoji: '🚶',
        fullGuidance: '🚶 목적지까지 도보',
        originalIndex: 4
      }
    ];
  };

  return (
    <View style={styles.transportStepsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={transportStepsStyles.scrollContent}
      >
        {stableSteps.map((step, index) => (
          <StepCard
            key={`step-${step.originalIndex || index}`}
            type={step.type}
            instruction={step.instruction}
            highlighted={step.highlighted}
            route={step.route}
            emoji={step.emoji}
            fullGuidance={step.fullGuidance}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const transportStepsStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 4,
  },
});