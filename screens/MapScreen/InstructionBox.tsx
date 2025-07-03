import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { useBusArrival } from '../../hooks/useBusArrival';

const SERVICE_KEY = 'Cb4J4pwSCPtLzWh4f1CyJUEZLFslFJPJgXOjaYDQZXXD3WFkNaNcWsOA%2BjWVx6h9XNsiy2TTIlfsQpodJyQ6iQ%3D%3D';

interface InstructionBoxProps {
  mode: 'walk' | 'bus' | 'subway';
  text?: string;
  exitInfo?: string;
  startStop?: string;
  endStop?: string;
  routeName?: string;
}

// ✅ arsId 조회 함수 + 디버깅 로그 추가됨
async function fetchArsId(stationName: string): Promise<string | null> {
  try {
    const response = await axios.get(
      'http://ws.bus.go.kr/api/rest/stationinfo/getStationByName',
      {
        params: {
          ServiceKey: SERVICE_KEY,
          stSrch: stationName,
        },
      }
    );
    console.log('🧾 arsId 응답:', response.data); // 🔍 응답 확인용 디버깅 로그

    const items = response.data?.ServiceResult?.msgBody?.itemList ?? [];
    return items.length > 0 ? items[0].arsId : null;
  } catch (error) {
    console.error('🚨 arsId 조회 실패:', error);
    return null;
  }
}

export default function InstructionBox({
  mode,
  text,
  exitInfo,
  startStop,
  endStop,
  routeName,
}: InstructionBoxProps) {
  const [arsId, setArsId] = useState<string | null>(null);

  // 🚏 arsId 동적으로 가져오기
  useEffect(() => {
    if (mode === 'bus' && startStop) {
      fetchArsId(startStop).then(setArsId);
    }
  }, [startStop]);

  // 🚍 arsId 준비되면 도착 정보 API 호출
  const { data: arrivalData, loading } = useBusArrival(arsId ?? '');

  // 🚌 현재 버스 노선 찾기
  const matchedBus = arrivalData.find(
    (bus) => bus.routeName === routeName
  );

  // 🧭 디버깅 로그
  useEffect(() => {
    console.log('🧭 InstructionBox DEBUG');
    console.log('mode:', mode);
    console.log('startStop:', startStop);
    console.log('arsId:', arsId);
    console.log('routeName:', routeName);
    console.log('API data:', arrivalData);
    console.log('Matched arrival:', matchedBus);
  }, [arsId, arrivalData]);

  // 🚏 텍스트 렌더링
  let displayText = '';
  if (mode === 'walk') {
    displayText = text ?? '';
  } else if (mode === 'bus') {
    displayText = `${endStop ?? '정류장'}에서 하차`;
  } else if (mode === 'subway') {
    displayText = `${startStop ?? '승차역'} ➜ ${endStop ?? '하차역'} (출구 ${exitInfo ?? '1'}번)`;
  }

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
