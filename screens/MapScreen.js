// MapScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Alert, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { useLocation } from '../contexts/LocationContext';
import * as Location from 'expo-location';

const sampleRoute = require('../data/tmap_sample3.json');
const USE_TMAP_API = false;

export default function MapScreen() {
  const [routeSegments, setRouteSegments] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [heading, setHeading] = useState(null);
  const [micExpanded, setMicExpanded] = useState(false);

  const micAnim = useRef(new Animated.Value(0)).current;
  const micIconScale = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const { location, setLocation } = useLocation();
  const { name } = useLocalSearchParams();



  const window = Dimensions.get('window');

  const micSize = micAnim.interpolate({ inputRange: [0, 1], outputRange: [88, 160] });
  const micLeft = micAnim.interpolate({ inputRange: [0, 1], outputRange: [20, window.width / 2 - 80] });
  const micTop = micAnim.interpolate({ inputRange: [0, 1], outputRange: [window.height - 118, window.height / 2 - 80] });
  const micRadius = micAnim.interpolate({ inputRange: [0, 1], outputRange: [44, 80] });
  const micOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let headingSub;
    const subscribeHeading = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        headingSub = await Location.watchHeadingAsync((data) => {
          setHeading(data.trueHeading ?? data.magHeading);
        });
      }
    };
    subscribeHeading();
    return () => headingSub && headingSub.remove();
  }, []);

  useEffect(() => {
    if (USE_TMAP_API) {
      fetchTmapRouteFromAPI();
    } else {
      parseRouteFromLocalJSON(sampleRoute);
    }
  }, []);

  useEffect(() => {
    if (routeSegments.length > 0) {
      const firstCoord = routeSegments[0]?.coords?.[0];
      if (firstCoord) {
        setMapCenter({
          ...firstCoord,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }
  }, [routeSegments]);

  useEffect(() => {
    if (mapRef.current && routeSegments.length > 0) {
      const allCoords = routeSegments.flatMap(seg => seg.coords);
      if (allCoords.length > 0) {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [routeSegments]);

  const interpolatePoints = (start, end, numPoints = 5) => {
    const points = [];
    for (let i = 1; i <= numPoints; i++) {
      const lat = start.latitude + (end.latitude - start.latitude) * (i / (numPoints + 1));
      const lon = start.longitude + (end.longitude - start.longitude) * (i / (numPoints + 1));
      points.push({ latitude: lat, longitude: lon });
    }
    return points;
  };

  // 현재 위치와 특정 지점 간의 거리 (Haversine formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isOffRoute = (currentLocation, path, threshold = 50) => {
    if (!currentLocation || path.length === 0) return false;

    const minDistance = path.reduce((min, point) => {
      const d = getDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        point.latitude,
        point.longitude
      );
      return Math.min(min, d);
    }, Infinity);

    return minDistance > threshold;
  };

  useEffect(() => {
    if (!location || routeSegments.length === 0) return;

    const allCoords = routeSegments.flatMap(seg => seg.coords);
    const offRoute = isOffRoute(location, allCoords);

    if (offRoute) {
      console.log('🚨 경로 이탈!');
    }
  }, [location]);

    // 개발 중 테스트용 - 일정 시간마다 위치 변경
    useEffect(() => {
      let i = 0;
      const fakePath = routeSegments.flatMap(seg => seg.coords);

      const interval = setInterval(() => {
        if (i < fakePath.length) {
          setLocation(fakePath[i]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 2000); // 2초마다 이동

      return () => clearInterval(interval);
    }, [routeSegments]);



  const smoothPolyline = (coords) => {
    const newCoords = [];
    for (let i = 0; i < coords.length - 1; i++) {
      newCoords.push(coords[i], ...interpolatePoints(coords[i], coords[i + 1], 4));
    }
    newCoords.push(coords[coords.length - 1]);
    return newCoords;
  };

  const parseRouteFromLocalJSON = (json) => {
    const legs = json?.metaData?.plan?.itineraries?.[0]?.legs;
    if (!legs) {
      Alert.alert('로컬 데이터 오류', 'legs 데이터가 없습니다.');
      return;
    }

    const parsed = legs.flatMap((leg) => {
      const mode = leg.mode;
      if (mode === 'WALK' && leg.steps) {
        const mergedCoords = leg.steps.flatMap((step) => {
          const coords = step.linestring
            ?.split(' ')
            .map(pair => {
              const [lon, lat] = pair.split(',');
              const latNum = parseFloat(lat);
              const lonNum = parseFloat(lon);
              if (isNaN(latNum) || isNaN(lonNum)) return null;
              return { latitude: latNum, longitude: lonNum };
            })
            .filter(coord => coord !== null);
          return coords || [];
        });
        return [{ mode, coords: smoothPolyline(mergedCoords) }];
      }

      if ((mode === 'SUBWAY' || mode === 'BUS') && leg.passStopList?.stationList) {
        const coords = leg.passStopList.stationList.map((station) => {
          const latNum = parseFloat(station.lat);
          const lonNum = parseFloat(station.lon);
          if (isNaN(latNum) || isNaN(lonNum)) return null;
          return { latitude: latNum, longitude: lonNum };
        }).filter(coord => coord !== null);
        return [{ mode, coords }];
      }

      return [];
    });

    const connected = [];
    for (let i = 0; i < parsed.length; i++) {
      const current = parsed[i];
      if (i > 0) {
        const prev = parsed[i - 1];
        const prevEnd = prev.coords[prev.coords.length - 1];
        const currStart = current.coords[0];
        const dist = Math.sqrt(
          Math.pow(prevEnd.latitude - currStart.latitude, 2) +
          Math.pow(prevEnd.longitude - currStart.longitude, 2)
        );
        if (dist > 0.00005) {
          connected.push({ mode: 'WALK', coords: smoothPolyline([prevEnd, currStart]) });
        }
      }
      connected.push(current);
    }

    setRouteSegments(connected.filter(seg => seg.coords.length > 1));
  };

  const getColorByMode = (mode) => {
    switch (mode) {
      case 'WALK': return '#999';
      case 'BUS': return '#3b82f6';
      case 'SUBWAY': return '#FF5900';
      default: return '#888';
    }
  };

  const toggleMic = () => {
    Animated.parallel([
      Animated.timing(micAnim, {
        toValue: micExpanded ? 0 : 1,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(micIconScale, {
        toValue: micExpanded ? 1 : 1.8,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      })
    ]).start();

    if (!micExpanded) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micOpacity, { toValue: 0.3, duration: 400, useNativeDriver: false }),
          Animated.timing(micOpacity, { toValue: 1, duration: 400, useNativeDriver: false })
        ])
      ).start();
    } else {
      micOpacity.setValue(1);
    }

    setMicExpanded(!micExpanded);
  };

  return (
    <View style={styles.container}>
      {mapCenter && (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={mapCenter}
            showsUserLocation={false}
          >
            {routeSegments.map((segment, idx) => (
              <Polyline
                key={idx}
                coordinates={segment.coords}
                strokeColor={getColorByMode(segment.mode)}
                strokeWidth={segment.mode === 'WALK' ? 3 : 6}
                lineDashPattern={segment.mode === 'WALK' ? [8, 6] : undefined}
              />
            ))}

            {location && (
              <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.currentLocationMarker} />
              </Marker>
            )}

            {routeSegments.length > 0 && (
              <>
                <Marker coordinate={routeSegments[0].coords[0]} title="출발지" pinColor="green" />
                <Marker coordinate={routeSegments[routeSegments.length - 1].coords.slice(-1)[0]} title="도착지" pinColor="red" />
              </>
            )}
          </MapView>

          <View style={styles.headerBox}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.destination}>📍 {name || '목적지'}</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.eta}>도착 예정{"\n"}10:26</Text>
          </View>

          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>🚶‍♂️ <Text style={{ color: '#FF3B30' }}>100m 직진 후 좌회전</Text></Text>
          </View>

          <Animated.View style={[styles.micButton, {
            width: micSize,
            height: micSize,
            borderRadius: micRadius,
            left: micLeft,
            top: micTop,
            opacity: micOpacity
          }]}>
            <TouchableOpacity onPress={toggleMic} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Animated.View style={{ transform: [{ scale: micIconScale }] }}>
                <Ionicons name="mic" size={50} color="white" />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    backgroundColor: '#FF5900',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#FF5900',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  headerBox: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#FFF1E6',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 10 },
  destination: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF5900',
    flexShrink: 1,
  },
  eta: { fontSize: 16, textAlign: 'right', color: '#222' },
  instructionBox: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: '#FFF1E6',
    borderRadius: 12,
    padding: 12,
  },
  instructionText: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
  },
  micButton: {
    position: 'absolute',
    backgroundColor: '#FF5900',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#FF5900',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});