// screens/MapScreen/MapDisplay.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Alert, View, TouchableOpacity, Modal, Dimensions, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { useLocation } from '../../contexts/LocationContext';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';
import FloatingMicButton from './FloatingMicButton';

export default function MapDisplay() {
  const { location, setLocation, currentLegIndex, setCurrentLegIndex } = useLocation();
  const [routeSegments, setRouteSegments] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [mainTransportSteps, setMainTransportSteps] = useState([]);
  const [currentRoutePoint, setCurrentRoutePoint] = useState(0);
  const [allRoutePoints, setAllRoutePoints] = useState([]);
  const [emojiGuidePoints, setEmojiGuidePoints] = useState([]);
  const [isOffRoute, setIsOffRoute] = useState(false); // 경로 이탈 상태
  const [showRerouteAlert, setShowRerouteAlert] = useState(false); // 재탐색 알림 표시
  const mapRef = useRef(null);
  const params = useLocalSearchParams();
  const intervalRef = useRef(null);
  const offRouteTimeoutRef = useRef(null);
  const lastRouteCheckRef = useRef(0);

  // 두 좌표 간의 거리 계산 (미터)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 경로와의 거리 계산 (가장 가까운 경로 포인트까지의 거리)
  const calculateDistanceToRoute = (currentPos) => {
    if (allRoutePoints.length === 0) return 0;

    let minDistance = Infinity;

    for (const routePoint of allRoutePoints) {
      const distance = calculateDistance(
        currentPos.latitude, currentPos.longitude,
        routePoint.latitude, routePoint.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    return minDistance;
  };

  // 경로 이탈 확인
  const checkRouteDeviation = (currentPoint) => {
    const now = Date.now();

    // 3초마다만 체크 (너무 자주 체크하지 않음)
    if (now - lastRouteCheckRef.current < 3000) return;
    lastRouteCheckRef.current = now;

    const distanceToRoute = calculateDistanceToRoute(currentPoint);
    const ROUTE_DEVIATION_THRESHOLD = 50; // 50미터 이상 벗어나면 경로 이탈로 판단

    console.log(`📍 경로와의 거리: ${Math.round(distanceToRoute)}m`);

    if (distanceToRoute > ROUTE_DEVIATION_THRESHOLD) {
      if (!isOffRoute) {
        setIsOffRoute(true);
        console.log('⚠️ 경로 이탈 감지');

        // 5초 후에 재탐색 알림 표시
        offRouteTimeoutRef.current = setTimeout(() => {
          setShowRerouteAlert(true);
        }, 5000);
      }
    } else {
      // 경로 복귀
      if (isOffRoute) {
        setIsOffRoute(false);
        setShowRerouteAlert(false);
        console.log('✅ 경로 복귀');

        if (offRouteTimeoutRef.current) {
          clearTimeout(offRouteTimeoutRef.current);
          offRouteTimeoutRef.current = null;
        }
      }
    }
  };

  // API 데이터가 있으면 API 사용, 없으면 기존 샘플 데이터 사용
  useEffect(() => {
    if (isInitialized) return;

    console.log('🗺️ MapDisplay 초기화 시작');

    if (params.routeData) {
      parseRouteFromApiResponse();
    } else {
      parseRouteFromLocalJSON();
    }

    setIsInitialized(true);
  }, [params.routeData, isInitialized]);

  // 위치 시뮬레이션 - 깜빡임 완전 제거 버전
  useEffect(() => {
    if (!isInitialized || allRoutePoints.length === 0) return;

    console.log('🚶 위치 기반 경로 시뮬레이션 시작 -', allRoutePoints.length, '개 포인트');

    let currentIndex = 0;
    let lastGuideUpdate = 0;

    const startSimulation = () => {
      intervalRef.current = setInterval(() => {
        if (currentIndex >= allRoutePoints.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          console.log('🏁 경로 시뮬레이션 완료');
          return;
        }

        const currentPoint = allRoutePoints[currentIndex];

        // 위치 업데이트 - 상태 변경 최소화
        setLocation(prevLocation => {
          const latDiff = Math.abs((prevLocation?.latitude || 0) - currentPoint.latitude);
          const lonDiff = Math.abs((prevLocation?.longitude || 0) - currentPoint.longitude);

          // 충분한 변화가 있을 때만 업데이트 (깜빡임 방지)
          if (latDiff > 0.0005 || lonDiff > 0.0005) {
            return {
              latitude: currentPoint.latitude,
              longitude: currentPoint.longitude
            };
          }
          return prevLocation;
        });

        // 가이드 업데이트는 5초마다만 (과도한 업데이트 방지)
        if (currentIndex - lastGuideUpdate > 10) {
          const nearestGuideIndex = findNearestGuideIndex(currentPoint);

          if (nearestGuideIndex !== -1) {
            setCurrentLegIndex(prev => {
              if (prev !== nearestGuideIndex) {
                console.log(`🔄 이동수단 전환: ${prev} → ${nearestGuideIndex}`);
                lastGuideUpdate = currentIndex;
                return nearestGuideIndex;
              }
              return prev;
            });
          }

          // 경로 이탈 확인
          checkRouteDeviation(currentPoint);
        }

        if (currentIndex % 50 === 0) {
          console.log('📍 경로 진행:', Math.round((currentIndex / allRoutePoints.length) * 100) + '%');
        }

        currentIndex++;
      }, 1500); // 더 느린 업데이트로 안정성 확보
    };

    startSimulation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (offRouteTimeoutRef.current) {
        clearTimeout(offRouteTimeoutRef.current);
      }
    };
  }, [isInitialized]); // 의존성 최소화

  // 현재 위치에서 가장 가까운 이모티콘 가이드 인덱스 찾기
  const findNearestGuideIndex = (currentPoint) => {
    if (emojiGuidePoints.length === 0) return -1;

    let minDistance = Infinity;
    let nearestIndex = -1;

    emojiGuidePoints.forEach((guide, index) => {
      // 각 가이드의 시작점과 끝점 중 더 가까운 거리 계산
      const startDistance = calculateDistance(
        currentPoint.latitude, currentPoint.longitude,
        guide.startLocation.lat, guide.startLocation.lon
      );

      const endDistance = calculateDistance(
        currentPoint.latitude, currentPoint.longitude,
        guide.endLocation.lat, guide.endLocation.lon
      );

      const distance = Math.min(startDistance, endDistance);

      // 100m 이내에 있고 가장 가까운 가이드 선택
      if (distance < 100 && distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  };

  // 재탐색 실행
  const handleReroute = async () => {
    setShowRerouteAlert(false);
    setIsOffRoute(false);

    console.log('🔄 경로 재탐색 시작');

    try {
      // 현재 위치에서 목적지까지 새 경로 요청
      // TODO: 실제 재탐색 API 호출
      // const newRouteData = await requestNewRoute(location, destination);

      // 임시로 기존 경로 재사용 (실제로는 새 경로 데이터로 교체)
      console.log('🔄 새 경로로 업데이트 완료');

    } catch (error) {
      console.error('❌ 재탐색 실패:', error);
      Alert.alert('재탐색 실패', '경로를 다시 검색할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 재탐색 거부
  const handleDismissReroute = () => {
    setShowRerouteAlert(false);
    // 경로 이탈 상태는 유지 (사용자가 의도적으로 무시)
  };

  // API 응답 파싱 - 이모티콘 기반 주요 이동수단 추출
  const parseRouteFromApiResponse = () => {
    try {
      const routeData = JSON.parse(params.routeData);
      console.log('🔄 API 경로 데이터 파싱 시작 - 총 guides:', routeData.guides?.length || 0);

      if (!routeData.guides || routeData.guides.length === 0) {
        console.log('⚠️ API 경로에 guides 없음, 샘플 데이터 사용');
        parseRouteFromLocalJSON();
        return;
      }

      const segments = [];
      const mainSteps = [];
      const emojiGuides = [];
      const allPoints = [];

      routeData.guides.forEach((guide, index) => {
        const transportType = guide.transportType || 'WALK';
        const coords = parseLineString(guide.lineString, guide.startLocation, guide.endLocation);

        if (coords.length > 0) {
          segments.push({
            mode: transportType,
            coords: coords,
            originalLegIndex: index,
            guidance: guide.guidance,
            distance: guide.distance,
            time: guide.time
          });

          // 모든 좌표를 전체 경로에 추가
          allPoints.push(...coords);
        }

        // 🎯 이모티콘이 있는 주요 안내만 추출
        if (guide.guidance && (
          guide.guidance.includes('🚶') ||
          guide.guidance.includes('🚌') ||
          guide.guidance.includes('🚇') ||
          guide.guidance.includes('🚄') ||
          guide.guidance.includes('🚐')
        )) {
          const stepInfo = {
            index: emojiGuides.length, // 이모티콘 가이드 내에서의 인덱스
            originalIndex: index, // 원본 가이드 인덱스
            type: getTransportTypeFromEmoji(guide.guidance),
            instruction: guide.guidance,
            time: guide.time,
            distance: guide.distance,
            busNumber: guide.busNumber,
            routeName: guide.routeName,
            startLocation: guide.startLocation,
            endLocation: guide.endLocation
          };

          mainSteps.push(stepInfo);
          emojiGuides.push(stepInfo);
        }
      });

      console.log(`✅ API에서 ${segments.length}개 구간, ${mainSteps.length}개 주요 이동수단, ${allPoints.length}개 포인트 생성`);

      setRouteSegments(segments);
      setMainTransportSteps(mainSteps);
      setEmojiGuidePoints(emojiGuides);
      setAllRoutePoints(allPoints);

    } catch (error) {
      console.error('❌ API 데이터 파싱 실패:', error);
      parseRouteFromLocalJSON();
    }
  };

  // 이모티콘에서 교통수단 타입 추출
  const getTransportTypeFromEmoji = (guidance) => {
    if (guidance.includes('🚶')) return 'walk';
    if (guidance.includes('🚌')) return 'bus';
    if (guidance.includes('🚇')) return 'subway';
    if (guidance.includes('🚄')) return 'train';
    if (guidance.includes('🚐')) return 'bus';
    return 'walk';
  };

  // 기존 샘플 데이터 파싱 (위치 기반 전환 지원)
  const parseRouteFromLocalJSON = () => {
    console.log('📁 샘플 데이터 로딩 시작');

    const sampleRoute = require('../../data/tmap_sample3.json');
    const legs = sampleRoute?.metaData?.plan?.itineraries?.[0]?.legs;

    if (!legs) {
      Alert.alert('로컬 데이터 오류', 'legs 데이터가 없습니다.');
      return;
    }

    const parsed = legs.flatMap((leg, legIndex) => {
      const mode = leg.mode;
      const density = legIndex === 2 ? 20 : 12;

      if (mode === 'WALK' && leg.steps) {
        const mergedCoords = leg.steps.flatMap((step) => {
          const coords = step.linestring?.split(' ').map(pair => {
            const [lon, lat] = pair.split(',');
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
          });
          return coords.filter(Boolean);
        });
        return [{ mode, coords: smoothPolyline(mergedCoords, density), originalLegIndex: legIndex }];
      }

      if ((mode === 'BUS' || mode === 'SUBWAY') && leg.passStopList?.stationList) {
        const coords = leg.passStopList.stationList.map((station) => {
          return {
            latitude: parseFloat(station.lat),
            longitude: parseFloat(station.lon),
          };
        });
        return [{ mode, coords: smoothPolyline(coords, density), originalLegIndex: legIndex }];
      }

      return [];
    });

    // 샘플 데이터용 주요 이동수단 (위치 정보 포함)
    const sampleMainSteps = [
      {
        index: 0, type: 'walk', instruction: '🚶 시흥초등학교까지 도보', time: 480, distance: 500,
        startLocation: { lat: 37.5665, lon: 126.9780 },
        endLocation: { lat: 37.5675, lon: 126.9790 }
      },
      {
        index: 1, type: 'bus', instruction: '🚌 707-1번 버스 탑승', time: 1200, busNumber: '707-1',
        startLocation: { lat: 37.5675, lon: 126.9790 },
        endLocation: { lat: 37.5750, lon: 126.9850 }
      },
      {
        index: 2, type: 'walk', instruction: '🚶 중앙시장까지 도보', time: 300, distance: 200,
        startLocation: { lat: 37.5750, lon: 126.9850 },
        endLocation: { lat: 37.5760, lon: 126.9860 }
      },
      {
        index: 3, type: 'bus', instruction: '🚌 13-4번 버스 탑승', time: 1800, busNumber: '13-4',
        startLocation: { lat: 37.5760, lon: 126.9860 },
        endLocation: { lat: 37.5850, lon: 126.9950 }
      },
      {
        index: 4, type: 'walk', instruction: '🚶 목적지까지 도보', time: 240, distance: 150,
        startLocation: { lat: 37.5850, lon: 126.9950 },
        endLocation: { lat: 37.5870, lon: 126.9970 }
      }
    ];

    // 전체 경로 포인트 생성
    const allPoints = parsed.flatMap(segment => segment.coords);

    console.log(`📍 샘플 데이터에서 ${parsed.length}개 구간, ${allPoints.length}개 포인트 생성`);

    setRouteSegments(parsed);
    setMainTransportSteps(sampleMainSteps);
    setEmojiGuidePoints(sampleMainSteps);
    setAllRoutePoints(allPoints);
  };

  // LineString 파싱 (API용)
  const parseLineString = (lineString, startLocation, endLocation) => {
    if (!lineString || lineString.trim() === '') {
      if (startLocation && endLocation) {
        return [
          { latitude: startLocation.lat, longitude: startLocation.lon },
          { latitude: endLocation.lat, longitude: endLocation.lon }
        ];
      }
      return [];
    }

    try {
      const coordinates = lineString.trim().split(' ');
      const coords = [];

      for (const coord of coordinates) {
        const [lon, lat] = coord.split(',');
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);

        if (!isNaN(latNum) && !isNaN(lonNum)) {
          coords.push({ latitude: latNum, longitude: lonNum });
        }
      }

      return smoothPolyline(coords, 8); // 포인트 밀도 줄여서 성능 향상
    } catch (error) {
      console.warn('LineString 파싱 실패:', error);
      return [];
    }
  };

  // 기존 보간 함수들
  const interpolatePoints = (start, end, numPoints = 8) => {
    const points = [];
    for (let i = 1; i <= numPoints; i++) {
      const lat = start.latitude + (end.latitude - start.latitude) * (i / (numPoints + 1));
      const lon = start.longitude + (end.longitude - start.longitude) * (i / (numPoints + 1));
      points.push({ latitude: lat, longitude: lon });
    }
    return points;
  };

  const smoothPolyline = (coords, density = 8) => {
    if (coords.length < 2) return coords;

    const newCoords = [];
    for (let i = 0; i < coords.length - 1; i++) {
      newCoords.push(coords[i], ...interpolatePoints(coords[i], coords[i + 1], density));
    }
    newCoords.push(coords[coords.length - 1]);
    return newCoords;
  };

  // 교통수단별 색상
  const getColorByMode = (mode) => {
    switch (mode) {
      case 'WALK': return '#999';
      case 'BUS': return '#3b82f6';
      case 'SUBWAY': return '#FF5900';
      default: return '#888';
    }
  };

  // 지도 확대/축소 토글
  const toggleMapSize = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  // 지도 컴포넌트 - 현재 위치 중심으로 포커스
  const MapComponent = React.memo(({ isFullScreen = false }) => {
    const screenData = Dimensions.get('window');
    const mapRef = useRef(null);

    // 현재 위치를 중심으로 하는 region
    const currentRegion = React.useMemo(() => ({
      latitude: location?.latitude || 37.5665,
      longitude: location?.longitude || 126.9780,
      latitudeDelta: 0.008, // 줌 레벨을 더 가깝게
      longitudeDelta: 0.008,
    }), [location?.latitude, location?.longitude]);

    // 위치가 변경될 때마다 지도 중심을 현재 위치로 이동
    React.useEffect(() => {
      if (location && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }, 1000); // 1초 동안 부드럽게 이동
      }
    }, [location]);

    const mapStyle = React.useMemo(() => {
      return isFullScreen ? {
        width: screenData.width,
        height: screenData.height
      } : styles.map;
    }, [isFullScreen]);

    return (
      <MapView
        ref={mapRef}
        style={mapStyle}
        initialRegion={currentRegion}
        provider="google"
        moveOnMarkerPress={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        loadingEnabled={false}
        mapType="standard"
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        pitchEnabled={false}
        rotateEnabled={true} // 회전 허용
        scrollEnabled={true}
        zoomEnabled={true}
        maxZoomLevel={18}
        minZoomLevel={12} // 최소 줌 레벨 높임
        cacheEnabled={true}
        loadingBackgroundColor="#f5f5f5"
        followsUserLocation={false}
        showsMyLocationButton={false}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            flat={true}
            identifier="userLocation"
          >
            <View style={styles.currentLocationMarker} />
          </Marker>
        )}

        {routeSegments.map((seg, idx) => (
          <Polyline
            key={`route-${idx}-${seg.mode}`}
            coordinates={seg.coords}
            strokeColor={getColorByMode(seg.mode)}
            strokeWidth={seg.mode === 'WALK' ? 4 : 7} // 선 두께 증가
            lineDashPattern={seg.mode === 'WALK' ? [8, 6] : undefined}
            lineJoin="round"
            lineCap="round"
          />
        ))}
      </MapView>
    );
  });

  return (
    <View style={styles.mapContainer}>
      {/* 일반 지도 (터치 가능) */}
      <TouchableOpacity onPress={toggleMapSize} activeOpacity={0.9}>
        <MapComponent />

        {/* 확대 힌트 아이콘 */}
        <View style={styles.expandHint}>
          <Ionicons name="expand-outline" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {/* 경로 이탈 상태 표시 */}
      {isOffRoute && !showRerouteAlert && (
        <View style={additionalStyles.offRouteIndicator}>
          <Ionicons name="warning" size={20} color="#FF9500" />
          <Text style={additionalStyles.offRouteText}>경로에서 벗어났습니다</Text>
        </View>
      )}

      {/* 재탐색 알림 모달 */}
      <Modal
        visible={showRerouteAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDismissReroute}
      >
        <View style={additionalStyles.rerouteModalOverlay}>
          <View style={additionalStyles.rerouteModalContent}>
            <Ionicons name="location" size={40} color="#FF5900" />
            <Text style={additionalStyles.rerouteTitle}>경로 재탐색</Text>
            <Text style={additionalStyles.rerouteMessage}>
              현재 경로에서 벗어났습니다.{'\n'}새로운 경로를 검색하시겠습니까?
            </Text>

            <View style={additionalStyles.rerouteButtons}>
              <TouchableOpacity
                style={[additionalStyles.rerouteButton, additionalStyles.dismissButton]}
                onPress={handleDismissReroute}
              >
                <Text style={additionalStyles.dismissButtonText}>나중에</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[additionalStyles.rerouteButton, additionalStyles.confirmButton]}
                onPress={handleReroute}
              >
                <Text style={additionalStyles.confirmButtonText}>재탐색</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 전체화면 지도 모달 */}
      <Modal
        visible={isMapExpanded}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.fullScreenContainer}>
          {/* 닫기 버튼 */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsMapExpanded(false)}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* 전체화면 지도 */}
          <MapComponent isFullScreen={true} />
        </View>
      </Modal>

      {/* 플로팅 마이크 버튼 */}
      <FloatingMicButton />
    </View>
  );
}

// 추가 스타일들
const additionalStyles = StyleSheet.create({
  // 경로 이탈 표시
  offRouteIndicator: {
    position: 'absolute',
    top: 90, // 헤더 아래
    left: 20,
    right: 20,
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  offRouteText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#8B5000',
  },

  // 재탐색 모달
  rerouteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rerouteModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rerouteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  rerouteMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  rerouteButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  rerouteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  confirmButton: {
    backgroundColor: '#FF5900',
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
