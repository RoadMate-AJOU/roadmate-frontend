import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import StepCard from './StepCard';
import { useLocation } from '../../contexts/LocationContext';
import styles from './styles';

export default function TransportSteps() {
  const { currentLegIndex } = useLocation();
  const params = useLocalSearchParams();
  const [stableSteps, setStableSteps] = useState([]);
  const lastLegIndex = useRef(-1);

  // 주요 이동수단만 추출
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

  // currentLegIndex 변경 시 하이라이트 업데이트
  useEffect(() => {
    if (currentLegIndex === lastLegIndex.current) return;

    lastLegIndex.current = currentLegIndex;

    setStableSteps(prevSteps =>
      prevSteps.map((step, index) => ({
        ...step,
        highlighted: step.originalIndex === currentLegIndex || index === currentLegIndex,
      }))
    );
  }, [currentLegIndex]);

  // API 데이터 파싱
  const parseApiMainSteps = (routeData) => {
    if (!routeData.guides || routeData.guides.length === 0) {
      return getSampleMainSteps();
    }

    const mainSteps = [];

    routeData.guides.forEach((guide, index) => {
      const { transportType, time, routeName, busNumber, guidance } = guide;

      if (
        guidance &&
        (guidance.includes('🚶') ||
          guidance.includes('🚌') ||
          guidance.includes('🚇') ||
          guidance.includes('🚄') ||
          guidance.includes('🚐'))
      ) {
        let type: 'walk' | 'bus' | 'subway' = 'walk';
        if (transportType === 'BUS' || guidance.includes('🚌') || guidance.includes('🚐')) {
          type = 'bus';
        } else if (transportType === 'SUBWAY' || guidance.includes('🚇') || guidance.includes('🚄')) {
          type = 'subway';
        }

        const timeText = time ? `${Math.ceil(time / 60)}분` : '';
        const route = busNumber || routeName || '';

        mainSteps.push({
          type,
          instruction: timeText,
          highlighted: index === currentLegIndex,
          route: route ? `노선:${route}` : undefined,
          emoji: getEmojiFromGuidance(guidance),
          fullGuidance: guidance,
          originalIndex: index,
        });
      }
    });

    console.log(`📋 주요 이동수단 ${mainSteps.length}개 추출됨`);
    return mainSteps;
  };

  const getEmojiFromGuidance = (guidance: string) => {
    if (guidance.includes('🚶')) return '🚶';
    if (guidance.includes('🚌')) return '🚌';
    if (guidance.includes('🚇')) return '🚇';
    if (guidance.includes('🚄')) return '🚄';
    if (guidance.includes('🚐')) return '🚐';
    return '🚶';
  };

  const getSampleMainSteps = () => {
    return [
      {
        type: 'walk',
        instruction: '8분',
        highlighted: currentLegIndex === 0,
        emoji: '🚶',
        fullGuidance: '🚶 시흥초등학교까지 도보',
        originalIndex: 0,
      },
      {
        type: 'bus',
        instruction: '20분',
        highlighted: currentLegIndex === 1,
        route: '노선:707-1',
        emoji: '🚌',
        fullGuidance: '🚌 707-1번 버스 탑승',
        originalIndex: 1,
      },
      {
        type: 'walk',
        instruction: '5분',
        highlighted: currentLegIndex === 2,
        emoji: '🚶',
        fullGuidance: '🚶 중앙시장까지 도보',
        originalIndex: 2,
      },
      {
        type: 'bus',
        instruction: '30분',
        highlighted: currentLegIndex === 3,
        route: '노선:13-4',
        emoji: '🚌',
        fullGuidance: '🚌 13-4번 버스 탑승',
        originalIndex: 3,
      },
      {
        type: 'walk',
        instruction: '4분',
        highlighted: currentLegIndex === 4,
        emoji: '🚶',
        fullGuidance: '🚶 목적지까지 도보',
        originalIndex: 4,
      },
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
