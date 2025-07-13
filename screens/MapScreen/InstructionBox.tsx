import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useLocation } from '../../contexts/LocationContext';
import { useBusArrival } from '../../hooks/useBusArrival';
import { useSubwayArrival } from '../../hooks/useSubwayArrival';

export default function InstructionBox() {
  const [currentInstruction, setCurrentInstruction] = useState('🚶‍♂️ 목적지까지 안내 중');
  const { currentLegIndex } = useLocation();
  const params = useLocalSearchParams();
  const lastLegIndex = useRef(-1);
  const hasApiData = useRef(false);
  const emojiGuides = useRef<any[]>([]);

  const [mode, setMode] = useState<'walk' | 'bus' | 'subway'>('walk');
  const [guide, setGuide] = useState<any>(null);

  // 버스 및 지하철 실시간 정보
  const { data: busData, loading: busLoading, error: busError } = useBusArrival(
    guide?.stationId ?? '',
    guide?.busRouteId ?? '',
    guide?.stationOrder ?? ''
  );
  const { data: subwayData, loading: subwayLoading, error: subwayError } = useSubwayArrival(
    guide?.transportType === 'SUBWAY' ? guide?.startStop : undefined
  );

  useEffect(() => {
    if (params.routeData && !hasApiData.current) {
      try {
        const routeData = JSON.parse(params.routeData);
        if (!routeData?.guides || routeData.guides.length === 0) throw new Error('routeData.guides 비어 있음');

        parseEmojiGuides(routeData);
        hasApiData.current = true;
        updateInstruction(0);
      } catch (e) {
        console.warn('InstructionBox: routeData 파싱 실패 → 샘플 fallback', e);
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

  const useSampleGuides = () => {
    emojiGuides.current = [
      { guidance: '🚶 광화문역까지 이동', transportType: 'WALK' },
      { guidance: '🚇 5호선 지하철 탑승', transportType: 'SUBWAY', routeName: '5호선', startStop: '광화문' },
      { guidance: '🚶 경복궁역까지 도보 이동', transportType: 'WALK' },
      { guidance: '🚌 종로02번 버스 승차', transportType: 'BUS', busNumber: '종로02', stationId: '01117', busRouteId: '100100118', stationOrder: '1' },
      { guidance: '🚶 세종대로까지 도보 이동', transportType: 'WALK' },
    ];
    hasApiData.current = false;
    updateInstruction(0);
  };

  const parseEmojiGuides = (routeData: any) => {
    const guides = [];

    routeData.guides?.forEach((g: any, index: number) => {
      if (g.guidance && /🚶|🚌|🚇|🚄|🚐/.test(g.guidance)) {
        guides.push({
          index,
          guidance: g.guidance,
          transportType: g.transportType,
          busNumber: g.busNumber,
          routeName: g.routeName,
          startStop: g.start,
          endStop: g.end,
          stationId: g.stId,
          stationOrder: g.ord,
          busRouteId: g.busRouteId,
          exitInfo: g.exitInfo
        });
      }
    });

    emojiGuides.current = guides;
  };

  const updateInstruction = (legIndex: number) => {
    const g = emojiGuides.current[legIndex] || emojiGuides.current[0];
    setGuide(g);

    const simple = formatSimpleInstruction(g);
    setCurrentInstruction(simple);

    if (g.transportType === 'SUBWAY') setMode('subway');
    else if (g.transportType === 'BUS') setMode('bus');
    else setMode('walk');
  };

  const formatSimpleInstruction = (g: any) => {
    if (!g) return '🚶‍♂️ 이동 중';

    if (g.guidance.includes('🚶')) {
      if (g.guidance.includes('까지')) {
        const dest = g.guidance.split('까지')[0].replace('🚶', '').trim();
        return `🚶‍♂️ ${dest}으로 이동`;
      }
      return '🚶‍♂️ 도보 이동 중';
    }
    if (g.guidance.includes('🚌')) return `🚌 ${g.busNumber || g.routeName || '버스'} 탑승`;
    if (g.guidance.includes('🚇') || g.guidance.includes('🚄')) return `🚇 ${g.routeName || '지하철'} 탑승`;
    return '🚶‍♂️ 이동 중';
  };

  const trimTrainLine = (trainLine: string) => trainLine.replace(/^수도권\s*/, '');

  return (
    <View style={styles.container}>
      {/* 간단 이모지 텍스트 */}
      <View style={styles.simple}>
        <Text style={styles.instructionText}>{currentInstruction}</Text>
      </View>

      {/* 추가 정보 섹션 */}
      {mode === 'bus' && guide && (
        <View style={styles.section}>
          <Text style={styles.title}>🚌 버스 정보</Text>
          <Text style={styles.info}>{guide.startStop} → {guide.endStop}</Text>
          {guide.routeName && (
            <Text style={styles.infoHighlight}>🚏 {guide.routeName}번 버스</Text>
          )}
          {busLoading && <ActivityIndicator size="small" color="#888" />}
          {busError && <Text style={styles.error}>실시간 정보 없음</Text>}
          {!busLoading && !busError && busData?.length > 0 && (
            <View style={styles.realtimeBlock}>
              {busData.slice(0, 2).map((info, idx) => (
                <Text key={idx} style={styles.bulletText}>🚌 {info.message}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {mode === 'subway' && guide && (
        <View style={styles.section}>
          <Text style={styles.title}>🚇 지하철 정보</Text>
          <Text style={styles.info}>{guide.startStop} → {guide.endStop}</Text>
          {subwayLoading && <ActivityIndicator size="small" color="#888" />}
          {subwayError && <Text style={styles.error}>실시간 정보 없음</Text>}
          {!subwayLoading && !subwayError && subwayData?.length > 0 && (
            <View style={styles.realtimeBlock}>
              {subwayData.slice(0, 2).map((info, idx) => (
                <Text key={idx} style={styles.bulletText}>
                  🚇 {trimTrainLine(info.trainLine)} ({info.direction}) - {info.message}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
  },
  simple: {
    backgroundColor: '#FFF1E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 10,
    borderColor: '#FF6A00',
    borderWidth: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#111',
    marginBottom: 4,
  },
  infoHighlight: {
    fontSize: 14,
    color: '#FF6A00',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  realtimeBlock: {
    marginTop: 6,
  },
  bulletText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginTop: 4,
  },
});
