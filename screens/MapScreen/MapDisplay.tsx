import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocation } from '../../contexts/LocationContext';
import tmap_sample4 from '../../data/tmap_sample4.json';

const screenHeight = Dimensions.get('window').height;

export default function MapDisplay() {
  const { location, setLocation, setCurrentLegIndex } = useLocation();
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [showRerouteAlert, setShowRerouteAlert] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const mapRef = useRef(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ lineString 파서
  const parseLineString = (lineString) => {
    return lineString.split(' ').map((coord) => {
      const [lon, lat] = coord.split(',').map(Number);
      return { latitude: lat, longitude: lon };
    });
  };

  // ✅ 초기 위치 설정
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
        console.warn('⚠️ 위치 가져오기 실패, fallback 사용');
        setLocation(fallback);
      }
    };

    initLocation();
  }, []);

  // ✅ tmap_sample4 lineString 기반 경로 로드
  useEffect(() => {
    const allCoords = tmap_sample4.guides
      .map((guide) => guide.lineString)
      .filter(Boolean)
      .flatMap(parseLineString);

    console.log('📦 경로 로드됨 (lineString 기반), 총 좌표 수:', allCoords.length);
    setRouteCoords(allCoords);
  }, []);

  // ✅ 마커 시뮬레이션 이동 + 하이라이트 전환
  useEffect(() => {
    if (!routeCoords || routeCoords.length === 0) {
      console.log('⛔ routeCoords 비어 있음. 마커 시뮬레이션 중단');
      return;
    }

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= routeCoords.length) {
        console.log('✅ 마커가 경로 끝에 도달함');
        clearInterval(intervalRef.current!);
        return;
      }

      const point = routeCoords[i];
      setLocation(point);
      console.log(`🟠 [MapDisplay] 마커 이동 [${i}] →`, point);

      // ✅ 현재 point가 어떤 leg 구간인지 계산해서 currentLegIndex 설정
      let acc = 0;
      for (let legIdx = 0; legIdx < tmap_sample4.guides.length; legIdx++) {
        const guide = tmap_sample4.guides[legIdx];
        const points = parseLineString(guide.lineString);
        if (i < acc + points.length) {
          setCurrentLegIndex(legIdx);
          break;
        }
        acc += points.length;
      }

      i++;
    }, 500); // 0.5초 간격

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [routeCoords]);

  const centerLatitude = location?.latitude || 37.5665;
  const centerLongitude = location?.longitude || 126.9780;

  return (
    <TouchableOpacity activeOpacity={0.9}>
      <MapView
        ref={mapRef}
        style={{ height: screenHeight * 0.4 }}
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
          >
            <View style={styles.customMarker} />
          </Marker>
        )}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#007AFF"
            strokeWidth={5}
          />
        )}
      </MapView>

      <Modal visible={showRerouteAlert} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>경로에서 벗어났습니다. 재탐색할까요?</Text>
            <Button title="재탐색하기" onPress={() => setShowRerouteAlert(false)} />
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
    customMarker: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#FF5900', // 주황색 원형 마커
      borderWidth: 2,
      borderColor: '#fff',

      // ✅ Android 전용 그림자 느낌
      elevation: 6, // 숫자 클수록 그림자 강함
    },

});