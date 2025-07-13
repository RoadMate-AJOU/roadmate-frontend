import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import StepCard from './StepCard';
import { useLocation } from '../../contexts/LocationContext';
import { fetchBusArrivalTime } from '../MapScreen/fetchBusArrivalTime';
import { fetchSubwayArrivalTime } from '../MapScreen/fetchSubwayArrivalTime';

export default function TransportSteps({ routeData }: { routeData: any }) {
  const { currentLegIndex } = useLocation();
  const [stableSteps, setStableSteps] = useState([]);
  const [liveInfoMap, setLiveInfoMap] = useState<Record<number, string>>({});
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const validLegIndex = currentLegIndex < 0 ? 0 : currentLegIndex;

  const [localRouteData, setLocalRouteData] = useState(routeData);

  // 🧠 외부에서 routeData 변경되면 반영
  useEffect(() => {
    console.log('🔁 props.routeData 변경 감지됨 → localRouteData 업데이트');
    setLocalRouteData(routeData);
  }, [routeData]);

  useEffect(() => {
    if (!localRouteData?.guides) {
      console.warn('🚨 localRouteData.guides가 존재하지 않습니다!');
      return;
    }

    console.log('📦 [TransportSteps] localRouteData:', localRouteData);
    console.log('📦 guides.length:', localRouteData.guides.length);

    const mainSteps = localRouteData.guides.map((guide, index) => {
      const { transportType, time, routeName, busNumber, guidance, startLocation } = guide;

      console.log(`🔎 Guide#${index} transportType=${transportType}, start=${startLocation?.name}, route=${routeName}`);

      let type: 'walk' | 'bus' | 'subway' = 'walk';
      if (transportType === 'BUS') type = 'bus';
      else if (transportType === 'SUBWAY') type = 'subway';

      const timeText = time ? `${Math.ceil(time / 60)}분` : '정보 없음';
      const route = busNumber || routeName || '';

      return {
        type,
        instruction: timeText,
        highlighted: index === validLegIndex,
        route: route ? `노선:${route}` : '노선 정보 없음',
        emoji: getEmojiFromGuidance(guidance),
        fullGuidance: guidance || '안내 문구 없음',
        originalIndex: index,
        startLocation: startLocation?.name,
        routeName: route,
      };
    });

    setStableSteps(mainSteps);
    fetchLiveInfos(mainSteps, '🔄 localRouteData or legIndex 변경');

    if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
    fetchIntervalRef.current = setInterval(() => {
      console.log('⏱️ [INTERVAL] 30초마다 실시간 정보 갱신');
      fetchLiveInfos(mainSteps, '🔄 주기적 갱신');
    }, 30 * 1000);

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        console.log('🧹 [CLEANUP] 실시간 갱신 인터벌 해제');
      }
    };
  }, [localRouteData, currentLegIndex]);

  const fetchLiveInfos = async (steps: any[], source: string) => {
    console.log(`🔍 [fetchLiveInfos] ${source} - 시작`);
    const newLiveInfoMap: Record<number, string> = {};

    await Promise.all(
      steps.map(async (step) => {
        if (step.type === 'bus' && step.startLocation && step.routeName) {
          const routeName = step.routeName.replace(/^노선:/, '');
          const result = await fetchBusArrivalTime(step.startLocation, routeName);
          if (result === '운행종료') {
            newLiveInfoMap[step.originalIndex] = `🚌 ${step.routeName}, 운행종료`;
          } else if (typeof result === 'number') {
            newLiveInfoMap[step.originalIndex] = `🚌 ${step.routeName}, ${result === 0 ? '곧 도착' : `${result}분 후 도착`}`;
          }
        } else if (step.type === 'subway' && step.startLocation) {
          const minutes = await fetchSubwayArrivalTime(step.startLocation);
          if (minutes !== null) {
            newLiveInfoMap[step.originalIndex] = `🚇 ${step.startLocation}, ${minutes === 0 ? '곧 도착' : `${minutes}분 후 도착`}`;
          }
        }
      })
    );

    setLiveInfoMap(newLiveInfoMap);
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

  if (!stableSteps.length) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: '#888', textAlign: 'center' }}>
          🫥 StepCard 데이터가 없습니다 (guides → steps 변환 실패)
        </Text>
      </View>
    );
  }

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
  container: { marginTop: 12 },
  scrollContent: { paddingHorizontal: 12, paddingBottom: 20, alignItems: 'center' },
  cardWrapper: { marginHorizontal: 6 },
});
