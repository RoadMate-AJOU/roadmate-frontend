// MapDisplay.tsx
// 지도 + 현재 위치 마커 + 경로 표시 + 실시간 안내 텍스트
import React, { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocation } from '../../contexts/LocationContext';
import styles from './styles';
import MicButton from './MicButton';
import InstructionBox from './InstructionBox';

import sampleRoute from '../../constants/routeData';

export default function MapDisplay() {
  const { location, setLocation } = useLocation();
  const [routeSegments, setRouteSegments] = useState([]);
  const [currentWalkInstruction, setCurrentWalkInstruction] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    parseRouteFromLocalJSON(sampleRoute);
  }, []);

  useEffect(() => {
    const coords = routeSegments.flatMap(seg => seg.coords);
    let i = 0;
    const interval = setInterval(() => {
      if (i < coords.length) {
        setLocation(coords[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [routeSegments]);

  useEffect(() => {
    if (!location || routeSegments.length === 0) return;

    const legs = sampleRoute?.metaData?.plan?.itineraries?.[0]?.legs ?? [];
    for (const leg of legs) {
      if (leg.mode !== 'WALK') continue;

      for (const step of leg.steps || []) {
        const points = step.linestring?.split(' ').map((pair) => {
          const [lon, lat] = pair.split(',').map(parseFloat);
          return { latitude: lat, longitude: lon };
        }) ?? [];

        const match = points.some((pt) =>
          getDistance(location.latitude, location.longitude, pt.latitude, pt.longitude) < 20
        );

        if (match) {
          setCurrentWalkInstruction(step.description);
          return;
        }
      }
    }

    setCurrentWalkInstruction('');
  }, [location, routeSegments]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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
        return [{ mode, coords: smoothPolyline(coords) }];
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

        {routeSegments.map((segment, idx) => (
          <Polyline
            key={idx}
            coordinates={segment.coords}
            strokeColor={getColorByMode(segment.mode)}
            strokeWidth={segment.mode === 'WALK' ? 3 : 6}
            lineDashPattern={segment.mode === 'WALK' ? [8, 6] : undefined}
          />
        ))}

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

      {/* 안내 문구 */}
      {Boolean(currentWalkInstruction?.trim()) && (
        <InstructionBox mode="walk" text={currentWalkInstruction} />
      )}



      <MicButton />
    </View>
  );
}
