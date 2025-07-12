import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import StepCard from './StepCard';
import { useLocation } from '../../contexts/LocationContext';
import styles from './styles';
import { fetchBusArrivalTime } from '../MapScreen/fetchBusArrivalTime';
import { fetchSubwayArrivalTime } from '../MapScreen/fetchSubwayArrivalTime';

export default function TransportSteps({ routeData }: { routeData: any }) {
  const { currentLegIndex } = useLocation();
  const [stableSteps, setStableSteps] = useState([]);
  const [liveInfoMap, setLiveInfoMap] = useState<Record<number, string>>({});
  const lastLegIndex = useRef(-1);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!routeData?.guides) return;

    const mainSteps = routeData.guides.map((guide, index) => {
      const { transportType, time, routeName, busNumber, guidance, startLocation } = guide;

      let type: 'walk' | 'bus' | 'subway' = 'walk';
      if (transportType === 'BUS') type = 'bus';
      else if (transportType === 'SUBWAY') type = 'subway';

      const timeText = time ? `${Math.ceil(time / 60)}분` : '';
      const route = busNumber || routeName || '';

      return {
        type,
        instruction: timeText,
        highlighted: index === currentLegIndex,
        route: route ? `노선:${route}` : undefined,
        emoji: getEmojiFromGuidance(guidance),
        fullGuidance: guidance,
        originalIndex: index,
        startLocation: startLocation?.name,
        routeName: route,
      };
    });

    setStableSteps(mainSteps);
    fetchLiveInfos(mainSteps, '🔄 초기 호출');

    // ⏱️ 30초마다 정보 재호출
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
    }
    fetchIntervalRef.current = setInterval(() => {
      console.log('⏱️ [INTERVAL] 30초마다 실시간 정보 갱신 시작');
      fetchLiveInfos(mainSteps, '🔄 주기적 갱신');
    }, 30 * 1000);

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        console.log('🧹 [CLEANUP] 실시간 갱신 인터벌 해제');
      }
    };
  }, [routeData]);

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

  const fetchLiveInfos = async (steps: any[], source: string) => {
    console.log(`🔍 [fetchLiveInfos] ${source} - 시작`);
    const newLiveInfoMap: Record<number, string> = {};

    await Promise.all(
      steps.map(async (step) => {
        if (step.type === 'bus' && step.startLocation && step.routeName) {
          const routeName = step.routeName.replace(/^노선:/, '');
          const result = await fetchBusArrivalTime(step.startLocation, routeName);
          if (result === '운행종료') {
            console.log(`🚌 [${step.startLocation}] ${routeName} → 운행종료`);
            newLiveInfoMap[step.originalIndex] = `🚌 ${step.routeName}, 운행종료`;
          } else if (typeof result === 'number') {
            console.log(`🚌 [${step.startLocation}] ${routeName} → ${result}분 후 도착`);
            newLiveInfoMap[step.originalIndex] = `🚌 ${step.routeName}, ${result === 0 ? '곧 도착' : `${result}분 후 도착`}`;
          }
        } else if (step.type === 'subway' && step.startLocation) {
          const minutes = await fetchSubwayArrivalTime(step.startLocation);
          if (minutes !== null) {
            console.log(`🚇 [${step.startLocation}] → ${minutes}분 후 도착`);
            newLiveInfoMap[step.originalIndex] = `🚇 ${step.startLocation}, ${minutes === 0 ? '곧 도착' : `${minutes}분 후 도착`}`;
          }
        }
      })
    );

    setLiveInfoMap(newLiveInfoMap);
    console.log('✅ [fetchLiveInfos] 실시간 정보 갱신 완료\n');
  };

  const getEmojiFromGuidance = (guidance: string) => {
    if (!guidance) return '🚶';
    if (guidance.includes('🚶')) return '🚶';
    if (guidance.includes('🚌')) return '🚌';
    if (guidance.includes('🚇')) return '🚇';
    if (guidance.includes('🚄')) return '🚄';
    if (guidance.includes('🚐')) return '🚐';
    return '🚶';
  };

  return (
    <View style={transportStepsStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={transportStepsStyles.scrollContent}
      >
        {stableSteps.map((step, index) => (
          <View key={`step-${step.originalIndex || index}`} style={transportStepsStyles.cardWrapper}>
            <StepCard
              type={step.type}
              instruction={step.instruction}
              highlighted={step.highlighted}
              route={step.route}
              emoji={step.emoji}
              fullGuidance={step.fullGuidance}
              liveInfo={liveInfoMap[step.originalIndex]}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const transportStepsStyles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    alignItems: 'center',
  },
  cardWrapper: {
    marginHorizontal: 6,
  },
});
