import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useBusArrival } from '../../hooks/useBusArrival';
import { useSubwayArrival } from '../../hooks/useSubwayArrival';

interface InstructionBoxProps {
  mode: 'walk' | 'bus' | 'subway';
  text?: string;
  startStop?: string;
  endStop?: string;
  exitInfo?: string;
  busOrder?: number;
  stationId?: string;
  busRouteId?: string;
  stationOrder?: string;
  routeName?: string;
}

export default function InstructionBox({
  mode,
  text,
  startStop,
  endStop,
  exitInfo,
  busOrder,
  stationId,
  busRouteId,
  stationOrder,
  routeName,
}: InstructionBoxProps) {
  const {
    data: busData,
    loading: busLoading,
    error: busError,
  } = useBusArrival(stationId ?? '', busRouteId ?? '', stationOrder ?? '');

  const {
    data: subwayData,
    loading: subwayLoading,
    error: subwayError,
  } = useSubwayArrival(mode === 'subway' ? startStop : undefined);

  // 지하철 노선명 추출 ('수도권 3호선' → '3호선')
  const trimTrainLine = (trainLine: string) => {
    return trainLine.replace(/^수도권\s*/, '');
  };

  return (
    <View style={styles.container}>
      {/* 도보 안내 */}
      {mode === 'walk' && text && (
        <View style={styles.section}>
          <Text style={styles.title}>🚶 도보 안내</Text>
          <Text style={styles.info}>{text}</Text>
        </View>
      )}

      {/* 버스 안내 */}
      {mode === 'bus' && (
        <View style={styles.section}>
          <Text style={styles.title}>🚌 버스 {busOrder! + 1}번 구간</Text>
          <Text style={styles.info}>정류장: {startStop} → {endStop}</Text>
          {routeName && (
            <Text style={styles.infoHighlight}>🚏 {routeName}번 버스를 타세요</Text>
          )}
          {busLoading && <ActivityIndicator size="small" color="#888" />}
          {busError && <Text style={styles.error}>실시간 정보 없음</Text>}
          {!busLoading && !busError && busData?.length > 0 && (
            <View style={styles.realtimeBlock}>
              <Text style={styles.refreshText}>🔁 20초마다 자동 갱신</Text>
              {busData.slice(0, 2).map((info, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bullet}>🚌</Text>
                  <Text style={styles.bulletText}>{info.message}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 지하철 안내 */}
      {mode === 'subway' && (
        <View style={styles.section}>
          <Text style={styles.title}>🚇 지하철 안내</Text>
          <Text style={styles.info}>
            {startStop} → {endStop} (출구 {exitInfo}번)
          </Text>
          {subwayData?.[0]?.trainLine && (
            <Text style={styles.infoHighlight}>
              🚇 {trimTrainLine(subwayData[0].trainLine)} 탑승하세요
            </Text>
          )}
          {subwayLoading && <ActivityIndicator size="small" color="#888" />}
          {subwayError && <Text style={styles.error}>실시간 정보 없음</Text>}
          {!subwayLoading && !subwayError && subwayData?.length > 0 && (
            <View style={styles.realtimeBlock}>
              <Text style={styles.refreshText}>🔁 20초마다 자동 갱신</Text>
              {subwayData.slice(0, 2).map((info, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bullet}>🚇</Text>
                  <Text style={styles.bulletText}>
                    {trimTrainLine(info.trainLine)} ({info.direction}) - {info.message}
                  </Text>
                </View>
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
    flex: 1,
    paddingLeft: 12,
    paddingTop: 8,
  },
  section: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderColor: '#FF6A00',
    borderWidth: 1,
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
    paddingLeft: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bullet: {
    fontSize: 14,
    marginRight: 6,
  },
  bulletText: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  refreshText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginTop: 4,
  },
});
