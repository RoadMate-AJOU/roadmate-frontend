// screens/MapScreen/InstructionBox.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBusArrival } from '../../hooks/useBusArrival';
import { useLocation } from '../../contexts/LocationContext';
import tmapData from '../../constants/routeData';

interface InstructionBoxProps {
  mode: 'walk' | 'bus' | 'subway';
  text?: string;
  exitInfo?: string;
  startStop?: string;
  endStop?: string;
  routeName?: string; // e.g., "272"
}

const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function InstructionBox({
  mode,
  text,
  exitInfo,
  startStop,
  endStop,
  routeName,
}: InstructionBoxProps) {
  const { location } = useLocation();
  const [dynamicText, setDynamicText] = useState(text ?? '');

  // 🚶 도보일 경우 현재 위치에 따라 안내문 갱신
  useEffect(() => {
    if (mode !== 'walk' || !location) return;

    const legs = tmapData?.metaData?.plan?.itineraries?.[0]?.legs ?? [];
    for (const leg of legs) {
      if (leg.mode !== 'WALK') continue;

      for (const step of leg.steps || []) {
        const points = step.linestring?.split(' ').map((pair) => {
          const [lon, lat] = pair.split(',').map(parseFloat);
          return { latitude: lat, longitude: lon };
        }) ?? [];

        const match = points.some((pt) =>
          getDistance(location.latitude, location.longitude, pt.latitude, pt.longitude) < 20
        );

        if (match) {
          setDynamicText(step.description);
          return;
        }
      }
    }
  }, [location, mode]);

  // 🚌 버스 정보 hook 호출 (버스일 때만)
  const { matchedBus, loading } = useBusArrival(
    mode === 'bus' ? startStop : undefined,
    mode === 'bus' ? routeName : undefined
  );

  // 📝 텍스트 구성
  let displayText = '';
  if (mode === 'walk') {
    displayText = dynamicText;
  } else if (mode === 'bus') {
    displayText = `${endStop ?? '정류장'}에서 하차`;
  } else if (mode === 'subway') {
    displayText = `${startStop ?? '승차역'} ➜ ${endStop ?? '하차역'} (출구 ${exitInfo ?? '1'}번)`;
  }

  // 🧪 렌더 조건 체크
  const shouldRender = displayText || (mode === 'bus' && (matchedBus || !loading));
  if (!shouldRender) return null;

  return (
    <View style={styles.box}>
      <Text style={styles.text}>{displayText}</Text>

      {mode === 'bus' && matchedBus && (
        <Text style={styles.arrival}>
          🚌 {matchedBus.predictTime1 || '도착 정보 없음'}
        </Text>
      )}

      {mode === 'bus' && !matchedBus && !loading && (
        <Text style={styles.arrival}>🚌 도착 정보 없음</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#FFFAF0',
    borderColor: '#FF6A00',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    marginLeft: 10,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  arrival: {
    marginTop: 4,
    fontSize: 13,
    color: '#FF6A00',
  },
});
