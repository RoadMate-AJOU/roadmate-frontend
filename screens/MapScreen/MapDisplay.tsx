// MapDisplay.tsx
// 지도 + 현재 위치 마커 + 경로 표시
import React, { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocation } from '../../contexts/LocationContext';
import styles from './styles';
import MicButton from './MicButton';

const sampleRoute = require('../../data/tmap_sample3.json');

export default function MapDisplay() {
  const { location } = useLocation();
  const [routeSegments, setRouteSegments] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    parseRouteFromLocalJSON(sampleRoute);
  }, []);

  // 경로 데이터 smoothing을 위한 보간 함수
  const interpolatePoints = (start, end, numPoints = 5) => {
    const points = [];
    for (let i = 1; i <= numPoints; i++) {
      const lat = start.latitude + (end.latitude - start.latitude) * (i / (numPoints + 1));
      const lon = start.longitude + (end.longitude - start.longitude) * (i / (numPoints + 1));
      points.push({ latitude: lat, longitude: lon });
    }
    return points;
  };

  const smoothPolyline = (coords) => {
    const newCoords = [];
    for (let i = 0; i < coords.length - 1; i++) {
      newCoords.push(coords[i], ...interpolatePoints(coords[i], coords[i + 1], 4));
    }
    newCoords.push(coords[coords.length - 1]);
    return newCoords;
  };

  // 로컬 JSON 파일에서 경로 파싱
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
          const coords = step.linestring?.split(' ').map(pair => {
            const [lon, lat] = pair.split(',');
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);
            if (isNaN(latNum) || isNaN(lonNum)) return null;
            return { latitude: latNum, longitude: lonNum };
          }).filter(coord => coord !== null);
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

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={
          routeSegments.length > 0
            ? {
                latitude: routeSegments[0].coords[0].latitude,
                longitude: routeSegments[0].coords[0].longitude,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
              }
            : {
                latitude: location?.latitude || 37.5665,
                longitude: location?.longitude || 126.9780,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
              }
        }
      >
        {location && (
          <Marker coordinate={location}>
            <View style={styles.currentLocationMarker} />
          </Marker>
        )}

        {/* 경로 표시 */}
        {routeSegments.map((segment, idx) => (
          <Polyline
            key={idx}
            coordinates={segment.coords}
            strokeColor={getColorByMode(segment.mode)}
            strokeWidth={segment.mode === 'WALK' ? 3 : 6}
            lineDashPattern={segment.mode === 'WALK' ? [8, 6] : undefined}
          />
        ))}

        {/* 출발지 / 도착지 마커 */}
        {routeSegments.length > 0 && (
          <>
            <Marker coordinate={routeSegments[0].coords[0]} title="출발지" pinColor="green" />
            <Marker
              coordinate={routeSegments[routeSegments.length - 1].coords.slice(-1)[0]}
              title="도착지"
              pinColor="red"
            />
          </>
        )}
      </MapView>
    </View>
  );
}
