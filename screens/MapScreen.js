import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';

const sampleRoute = require('../data/tmap_sample.json');
const USE_TMAP_API = false;
const TMAP_API_KEY = 'amzjmTA9k91qcTfEEuDzi22E2A222MBU12hioLCA';

function haversine(a, b) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const aVal = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

export default function MapScreen() {
  const [routeSegments, setRouteSegments] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const mapRef = useRef(null);

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

  const fetchTmapRouteFromAPI = async () => {
    try {
      const response = await fetch('https://apis.openapi.sk.com/transit/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          appKey: TMAP_API_KEY,
        },
        body: JSON.stringify({
          startX: '126.926493082645',
          startY: '37.6134436427887',
          endX: '127.126936754911',
          endY: '37.5004198786564',
          count: 10,
          lang: 0,
          format: 'json',
        }),
      });

      const json = await response.json();
      const legs = json?.metaData?.plan?.itineraries?.[0]?.legs;
      if (!legs) throw new Error('legs 없음');
      parseLegsToSegments(legs);
    } catch (error) {
      Alert.alert('에러', error.message);
    }
  };

  const parseRouteFromLocalJSON = (json) => {
    const legs = json?.metaData?.plan?.itineraries?.[0]?.legs;
    if (!legs) {
      Alert.alert('로컬 데이터 오류', 'legs 데이터가 없습니다.');
      return;
    }
    parseLegsToSegments(legs);
  };

  const parseLegsToSegments = (legs) => {
    const parsed = legs.flatMap((leg) => {
      const mode = leg.mode;

      if (mode === 'WALK' && leg.steps) {
        const mergedCoords = leg.steps.flatMap((step, stepIdx) => {
          const coords = step.linestring
            ?.split(' ')
            .map(pair => {
              const [lon, lat] = pair.split(',');
              const latNum = parseFloat(lat);
              const lonNum = parseFloat(lon);
              if (isNaN(latNum) || isNaN(lonNum)) {
                console.log(`❗ 잘못된 좌표 (WALK Step ${stepIdx}):`, pair);
                return null;
              }
              return { latitude: latNum, longitude: lonNum };
            })
            .filter(coord => coord !== null);

          return coords || [];
        });

        console.log(`🚶‍♂️ WALK 구간 - 전체 점 개수: ${mergedCoords.length}`);
        return [{ mode, coords: mergedCoords }];
      }


      if ((mode === 'SUBWAY' || mode === 'BUS') && leg.passStopList?.stationList) {
        const coords = leg.passStopList.stationList.map((station, i) => {
          const latNum = parseFloat(station.lat);
          const lonNum = parseFloat(station.lon);
          if (isNaN(latNum) || isNaN(lonNum)) {
            console.log(`❗ 잘못된 정류장 좌표 (${mode} Station ${i}):`, station);
            return null;
          }
          return { latitude: latNum, longitude: lonNum };
        }).filter(coord => coord !== null);

        console.log(`🚈 ${mode} 정류장 연결 - 점 개수: ${coords.length}`);

        return [{ mode, coords }];
      }

      console.log(`⚠️ mode 처리 안됨: ${mode}`);
      return [];
    });

    setRouteSegments(parsed.filter(seg => seg.coords.length > 1));
  };

  const getColorByMode = (mode) => {
    switch (mode) {
      case 'WALK':
        return '#999999';
      case 'BUS':
        return '#FF5900';
      case 'SUBWAY':
        return '#3b82f6';
      default:
        return '#888888';
    }
  };

  return (
    <View style={styles.container}>
      {mapCenter && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapCenter}
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

          {routeSegments.length > 0 && (
            <>
              <Marker
                coordinate={routeSegments[0].coords[0]}
                title="출발지"
                pinColor="green"
              />
              <Marker
                coordinate={
                  routeSegments[routeSegments.length - 1].coords.slice(-1)[0]
                }
                title="도착지"
                pinColor="red"
              />
            </>
          )}
        </MapView>
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
});
