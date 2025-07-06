// MapDisplay.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocation } from '../../contexts/LocationContext';
import styles from './styles';
import MicButton from './MicButton';
import sampleRoute from '../../constants/routeData';

export default function MapDisplay() {
  const { location, setLocation, setCurrentLegIndex } = useLocation();
  const [routeSegments, setRouteSegments] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    parseRouteFromLocalJSON(sampleRoute);
  }, []);

  useEffect(() => {
    const coordsWithMeta = [];
    routeSegments.forEach((seg) => {
      seg.coords.forEach((coord) => {
        coordsWithMeta.push({
          ...coord,
          mode: seg.mode,
          legIndex: seg.originalLegIndex, // 정확한 legIndex 저장
        });
      });
    });

    let i = 0;
    const interval = setInterval(() => {
      if (i >= coordsWithMeta.length) {
        clearInterval(interval);
        return;
      }

      const point = coordsWithMeta[i];
      setLocation({ latitude: point.latitude, longitude: point.longitude });
      setCurrentLegIndex(point.legIndex);
      console.log('🚩 위치:', point.latitude, point.longitude, '→ leg:', point.legIndex);
      i++;
    }, 400);

    return () => clearInterval(interval);
  }, [routeSegments]);

  const interpolatePoints = (start, end, numPoints = 12) => {
    const points = [];
    for (let i = 1; i <= numPoints; i++) {
      const lat = start.latitude + (end.latitude - start.latitude) * (i / (numPoints + 1));
      const lon = start.longitude + (end.longitude - start.longitude) * (i / (numPoints + 1));
      points.push({ latitude: lat, longitude: lon });
    }
    return points;
  };

  const smoothPolyline = (coords, density = 12) => {
    const newCoords = [];
    for (let i = 0; i < coords.length - 1; i++) {
      newCoords.push(coords[i], ...interpolatePoints(coords[i], coords[i + 1], density));
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

    const parsed = legs.flatMap((leg, legIndex) => {
      const mode = leg.mode;
      const density = legIndex === 2 ? 20 : 12; // 두 번째 도보 구간 보간 더 많이

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

    setRouteSegments(parsed);
  };

  const getColorByMode = (mode) => {
    switch (mode) {
      case 'WALK': return '#999';
      case 'BUS': return '#3b82f6';
      case 'SUBWAY': return '#FF5900';
      default: return '#888';
    }
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
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

        {routeSegments.map((seg, idx) => (
          <Polyline
            key={idx}
            coordinates={seg.coords}
            strokeColor={getColorByMode(seg.mode)}
            strokeWidth={seg.mode === 'WALK' ? 3 : 6}
            lineDashPattern={seg.mode === 'WALK' ? [8, 6] : undefined}
          />
        ))}
      </MapView>

      <MicButton />
    </View>
  );
}
