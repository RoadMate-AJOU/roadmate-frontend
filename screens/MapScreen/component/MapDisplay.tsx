import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocation } from '../../../contexts/LocationContext';


const screenHeight = Dimensions.get('window').height;

interface Props {
  routeData: any;
  onOffRouteDetected: () => void;
  isRoutingActive: boolean;
}

export default function MapDisplay({ routeData, onOffRouteDetected, isRoutingActive }: Props) {
  const { location, setLocation, setCurrentLegIndex } = useLocation();
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const mapRef = useRef(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const parseLineString = (lineString: string) => {
    return lineString.split(' ').map((coord) => {
      const [lon, lat] = coord.split(',').map(Number);
      return { latitude: lat, longitude: lon };
    });
  };
  
  function isOffRoute(currentLocation, routeCoords, thresholdMeters = 40): boolean {
  const toRad = (x: number) => (x * Math.PI) / 180;

  function getDistanceMeters(a, b) {
    const R = 6371000;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);

    const aVal =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
  }

  const minDistance = Math.min(
    ...routeCoords.map((coord) => getDistanceMeters(currentLocation, coord))
  );

  console.log('📏 현재 위치와 경로까지 최단 거리:', minDistance.toFixed(2), 'm');

  return minDistance > thresholdMeters;
}


  useEffect(() => {
    console.log('🧭 [MapDisplay] routeData 변경됨');
    if (!routeData?.guides || routeData.guides.length === 0) {
      console.log('⛔ routeData가 비어있습니다.');
      setRouteCoords([]);
      return;
    }

    const allCoords = routeData.guides
      .map((guide) => guide.lineString)
      .filter(Boolean)
      .flatMap(parseLineString);

    console.log('📦 경로 좌표 수:', allCoords.length);
    if (allCoords.length > 0) {
      console.log('📍 첫 좌표:', allCoords[0]);
      console.log('📍 마지막 좌표:', allCoords[allCoords.length - 1]);
    }

    setRouteCoords(allCoords);
  }, [routeData]);

  useEffect(() => {
    const initLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('❌ 위치 권한 거부됨');
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        const pos = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };
        console.log('📍 초기 위치 설정됨:', pos);
        setLocation(pos);
      } catch (e) {
        const fallback = { latitude: 37.5665, longitude: 126.9780 };
        console.warn('⚠️ 위치 가져오기 실패, fallback 사용:', fallback);
        setLocation(fallback);
      }
    };

    initLocation();
  }, []);

  useEffect(() => {
    if (!routeCoords || routeCoords.length === 0 || !isRoutingActive) {
      console.log('⛔ 마커 이동 조건 불충분 → 중단');
      return;
    }

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= routeCoords.length) {
  console.log('✅ 마커가 경로 끝에 도달함');
  clearInterval(intervalRef.current!);

  // 🗣 도착 후 피드백 요청 TTS
  Speech.speak('목적지에 도착했습니다. 방금 경로 안내는 어땠나요? 피드백을 말해주세요.', {
    language: 'ko-KR',
    onDone: () => {
      // 예: 마이크 자동 켜기 로직 (선택)
      // setIsListening(true); // 만약 구현되어 있다면
    },
  });

  return;
}


      let point = routeCoords[i];

      setLocation(point);
console.log(`🟠 마커 이동 [${i}] →`, point);

// ✅ 이탈 여부 검사
if (isOffRoute(point, routeCoords)) {
  console.log('🚨 경로 이탈 감지됨! onOffRouteDetected 실행');
  onOffRouteDetected();
  clearInterval(intervalRef.current!);
  return;
}

      setLocation(point);
      console.log(`🟠 마커 이동 [${i}] →`, point);

      let acc = 0;
      for (let legIdx = 0; legIdx < routeData.guides.length; legIdx++) {
        const guide = routeData.guides[legIdx];
        const points = parseLineString(guide.lineString);
        if (i < acc + points.length) {
          setCurrentLegIndex(legIdx);
          break;
        }
        acc += points.length;
      }

      i++;
    }, 1000); // 🔁 기존 500ms → 1000ms로 유지

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [routeCoords, isRoutingActive]);

  const centerLatitude = location?.latitude || 37.5665;
  const centerLongitude = location?.longitude || 126.9780;
  console.log('🗺️ 현재 지도 중심 좌표:', centerLatitude, centerLongitude);
  console.log('📍 마커 위치:', location);
  console.log('📏 Polyline 좌표 수:', routeCoords.length);

  return (
    <TouchableOpacity activeOpacity={0.9}>
      <MapView
        ref={mapRef}
        style={{ height: screenHeight * 0.5 }}
        region={{
          latitude: centerLatitude,
          longitude: centerLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && (
          <Marker
            coordinate={location}
            title="현재 위치"
            pinColor="#FF5900"
          />
        )}

        {routeData?.guides?.map((guide, idx) => {
          const coords = parseLineString(guide.lineString);

          let strokeColor = '#C0C0C0'; // 도보 기본값
          let strokeWidth = 4;
          let lineDashPattern = [6, 6]; // 점선

          if (guide.transportType === 'BUS') {
            strokeColor = '#007AFF';
            lineDashPattern = undefined;
          } else if (guide.transportType === 'SUBWAY') {
            strokeColor = '#FF5900';
            lineDashPattern = undefined;
          }

          return (
            <Polyline
              key={`polyline-${idx}`}
              coordinates={coords}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              lineDashPattern={lineDashPattern}
            />
          );
        })}
      </MapView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
