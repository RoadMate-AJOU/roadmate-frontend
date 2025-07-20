import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native';
import Header from '../component/Header';
import MapDisplay from '../component/MapDisplay';
import TransportSteps from '../component/TransportSteps';
import MicButton from '../component/FloatingMicButton';
import { fetchBusArrivalTime } from '../service/transportTime/fetchBusArrivalTime';
import { fetchSubwayArrivalTime } from '../service/transportTime/fetchSubwayArrivalTime';
import { useLocation } from '../../../contexts/LocationContext';
import { routeService } from '../../../services/api';
import { useLocalSearchParams } from 'expo-router';
import { useSessionStore } from '@/contexts/sessionStore';
import * as Speech from 'expo-speech';
import { RouteContext } from '../model/RouteContext';


export default function MapScreen() {
  const {
    destinationName,
    destinationLat,
    destinationLon,
    startLat,
    startLon,
    startName,
  } = useLocalSearchParams();
  const [eta, setEta] = useState('');
  const [busMin, setBusMin] = useState<number | null>(null);
  const [subwayMin, setSubwayMin] = useState<number | null>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [answered, setAnswered] = useState(false);
  const { location, setLocation } = useLocation();
   const { sessionId } = useSessionStore();

  // ✅ 초기 경로 요청
  useEffect(() => {
    const fetchInitialRoute = async () => {
      try {
        const result = await routeService.searchRoute(
          sessionId,
          parseFloat(startLat as string),
          parseFloat(startLon as string),
          parseFloat(destinationLat as string),
          parseFloat(destinationLon as string),
          startName as string,
          destinationName as string
        );
        setRouteData(result);
      } catch (err) {
        Alert.alert('경로 탐색 실패', err.message || '문제가 발생했습니다.');
      }
    };

    if (startLat && startLon && destinationLat && destinationLon) {
      fetchInitialRoute();
    }
  }, [startLat, startLon, destinationLat, destinationLon]);

  const guides = routeData?.guides ?? [];
  const firstBusGuide = guides.find((guide) => guide.transportType === 'BUS');
  const firstSubwayGuide = guides.find((guide) => guide.transportType === 'SUBWAY');

  useEffect(() => {
    const fetchArrivalTimes = async () => {
      if (firstBusGuide?.startLocation?.name && firstBusGuide?.busNumber) {
        const min = await fetchBusArrivalTime(firstBusGuide.startLocation.name, firstBusGuide.busNumber);
        setBusMin(min);
      }
      if (firstSubwayGuide?.startLocation?.name) {
        const min = await fetchSubwayArrivalTime(firstSubwayGuide.startLocation.name, firstSubwayGuide.routeName);
        setSubwayMin(min);
      }
    };
    fetchArrivalTimes();
  }, [firstBusGuide, firstSubwayGuide]);

  useEffect(() => {
  if (!routeData) return;

  const now = new Date();
  const totalDuration = guides.reduce((sum, guide) => sum + (guide.time ?? 0), 0);

  const fallbackExtraMin = 0; // 실시간 정보 없을 때 추가 대기시간
  const validBusMin = typeof busMin === 'number' ? busMin : fallbackExtraMin;
  const validSubwayMin = typeof subwayMin === 'number' ? subwayMin : fallbackExtraMin;

  const etaDate = new Date(now.getTime() + (totalDuration + (validBusMin + validSubwayMin) * 60) * 1000);

  const hours = etaDate.getHours();
  const minutes = etaDate.getMinutes();

  // NaN 방지: hours, minutes 중 하나라도 NaN이면 fallback 사용
  if (isNaN(hours) || isNaN(minutes)) {
    const fallbackDate = new Date(now.getTime() + totalDuration * 1000);
    const fh = fallbackDate.getHours().toString().padStart(2, '0');
    const fm = fallbackDate.getMinutes().toString().padStart(2, '0');
    setEta(`${fh}:${fm}`);
  } else {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    setEta(`${formattedHours}:${formattedMinutes}`);
  }
}, [busMin, subwayMin, routeData]);

  const handleRouteOff = () => {
  if (!answered) {
    console.log('🚨 [MapScreen] 경로 이탈 콜백 수신됨');

    // ✅ 음성 출력
    Speech.speak('경로를 이탈하셨습니다. 경로를 재탐색합니다.', {
      language: 'ko-KR',
    });

    // ✅ Alert로 사용자에게 알림
    Alert.alert(
      '경로 이탈',
      '경로를 이탈하셨습니다. 경로를 재탐색합니다.',
      [
        {
          text: '확인',
          onPress: handleYes,
        },
      ],
      { cancelable: false }
    );

    setAnswered(true);
  }
};


  const handleYes = async () => {
    console.log('✅ 예 클릭 → 새 경로로 갱신');
    try {
      const newRoute = await routeService.searchRoute(
        sessionId,
        location.latitude,
        location.longitude,
        parseFloat(destinationLat as string),
        parseFloat(destinationLon as string),
        '현재 위치',
        destinationName as string
      );
      const firstGuide = newRoute.guides?.[0];
      if (firstGuide?.lineString) {
        const [lon, lat] = firstGuide.lineString.split(' ')[0].split(',').map(Number);
        setLocation({ latitude: lat, longitude: lon }); // 마커 순간이동
      }
      setRouteData(newRoute);
    } catch (err) {
      Alert.alert('새 경로 요청 실패', err.message || '문제가 발생했습니다.');
    }
    setShowAlert(false);
    setAnswered(true);
  };

    // 도착지 도달 감지용 상태
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    if (!location || !destinationLat || !destinationLon || hasArrived) return;

    const toRad = (value: number) => (value * Math.PI) / 180;
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // Earth radius in meters
      const φ1 = toRad(lat1);
      const φ2 = toRad(lat2);
      const Δφ = toRad(lat2 - lat1);
      const Δλ = toRad(lon2 - lon1);

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // distance in meters
    };

    const distance = getDistance(
      location.latitude,
      location.longitude,
      parseFloat(destinationLat as string),
      parseFloat(destinationLon as string)
    );

    if (distance < 30) {
      console.log('✅ 목적지 도착 확인됨!');
      setHasArrived(true);

      Speech.speak('경로 안내를 종료합니다. 피드백을 원하시면 마이크를 켜고 말씀해주세요.', {
        language: 'ko-KR',
      });

      // 필요하다면 마이크 자동으로 켜거나 모달 띄우는 로직도 여기 추가 가능
    }
  }, [location, destinationLat, destinationLon, hasArrived]);


  return (
    <RouteContext.Provider value={{ routeData, setRouteData }}>
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        <Header destination={destinationName} eta={eta} />

        {routeData && (
          <>
            <MapDisplay onOffRouteDetected={handleRouteOff} routeData={routeData} isRoutingActive={true} />
            <TransportSteps />
          </>
        )}

      </ScrollView>
      <MicButton />
    </View>
  </RouteContext.Provider>
);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: 120 },
  buttonYes: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonNo: {
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
