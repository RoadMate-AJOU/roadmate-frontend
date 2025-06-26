// MapDisplay.tsx
// 지도 + 마이크 + 현재 위치 표시
import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../../contexts/LocationContext';
import styles from './styles';
import MicButton from './MicButton';

export default function MapDisplay() {
  const { location } = useLocation();

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 37.5665,
          longitude: location?.longitude || 126.9780,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && (
          <Marker coordinate={location}>
            <View style={styles.currentLocationMarker} />
          </Marker>
        )}
      </MapView>

    </View>
  );
}