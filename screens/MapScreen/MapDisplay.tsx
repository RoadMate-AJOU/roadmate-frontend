// screens/MapScreen/MapDisplay.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocation } from '../../contexts/LocationContext';
import { routeService } from '../../services/api';

const screenHeight = Dimensions.get('window').height;

export default function MapDisplay() {
  const { location, setLocation, currentLegIndex, setCurrentLegIndex } = useLocation();
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [showRerouteAlert, setShowRerouteAlert] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [destination, setDestination] = useState({ lat: 37.5665, lon: 126.9780 }); // default: 서울시청

  const mapRef = useRef(null);
  const lastLegIndex = useRef(-1);
  const routeDataRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const current = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (location) checkRouteDeviation();
  }, [location]);

  const checkRouteDeviation = () => {
    if (!location || !routeCoords.length) return;

    const current = { latitude: location.latitude, longitude: location.longitude };
    const nearestPoint = routeCoords.reduce((a, b) => {
      const distA = getDistance(current, a);
      const distB = getDistance(current, b);
      return distA < distB ? a : b;
    });

    const distanceToRoute = getDistance(current, nearestPoint);
    const ROUTE_DEVIATION_THRESHOLD = 80; // meters

    if (distanceToRoute > ROUTE_DEVIATION_THRESHOLD) {
      if (!isOffRoute) {
        setIsOffRoute(true);
        setTimeout(() => setShowRerouteAlert(true), 5000);
      }
    }
  };

  const getDistance = (a, b) => {
    const R = 6371e3;
    const φ1 = (a.latitude * Math.PI) / 180;
    const φ2 = (b.latitude * Math.PI) / 180;
    const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
    const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
    const c = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
    return d;
  };

  const handleReroute = async () => {
    try {
      setShowRerouteAlert(false);
      setIsOffRoute(false);

      const startLat = location.latitude;
      const startLon = location.longitude;
      const endLat = destination.lat;
      const endLon = destination.lon;

      const result = await routeService.searchRoute(startLat, startLon, endLat, endLon);
      const newCoords = result.guides.map(g => ({ latitude: g.lat, longitude: g.lon }));

      setRouteCoords(newCoords);
      routeDataRef.current = result;

      setCurrentLegIndex(0);
    } catch (error) {
      console.warn('재탐색 실패:', error);
    }
  };

  const toggleMapSize = () => {
    // 추후 확대/축소 대응
  };

  return (
    <TouchableOpacity onPress={toggleMapSize} activeOpacity={0.9}>
      <MapView
        ref={mapRef}
        style={{ height: screenHeight * 0.4 }}
        initialRegion={{
          latitude: location?.latitude || 37.5665,
          longitude: location?.longitude || 126.9780,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="현재 위치"
          />
        )}

        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={5} />
        )}
      </MapView>

      {/* 🚧 경로 이탈 알림 */}
      {isOffRoute && !showRerouteAlert && (
        <View style={styles.offRouteIndicator}>
          <Ionicons name="warning" size={20} color="#FF9500" />
          <Text style={styles.offRouteText}>🚧 경로에서 벗어났습니다</Text>
        </View>
      )}

      {/* 재탐색 모달 */}
      <Modal visible={showRerouteAlert} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>경로에서 벗어났습니다. 재탐색할까요?</Text>
            <Button title="재탐색하기" onPress={handleReroute} />
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  offRouteIndicator: {
    position: 'absolute',
    top: 90,
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
    zIndex: 99,
  },
  offRouteText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#8B5000',
  },
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
});