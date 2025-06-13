import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';

// 🔄 로컬 JSON 파일 import
const sampleRoute = require('../data/tmap_sample.json');

// 🔧 나중에 실제 API 사용 시 여기만 true로 바꾸면 됨
const USE_TMAP_API = false;

const TMAP_API_KEY = 'amzjmTA9k91qcTfEEuDzi22E2A222MBU12hioLCA';

export default function MapScreen() {
  const [routeSegments, setRouteSegments] = useState([]);

  useEffect(() => {
    if (USE_TMAP_API) {
      fetchTmapRouteFromAPI();
    } else {
      parseRouteFromLocalJSON(sampleRoute);
    }
  }, []);

  // ✅ 실제 API 호출
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

  // ✅ 로컬 JSON 사용
  const parseRouteFromLocalJSON = (json) => {
    const legs = json?.metaData?.plan?.itineraries?.[0]?.legs;
    if (!legs) {
      Alert.alert('로컬 데이터 오류', 'legs 데이터가 없습니다.');
      return;
    }
    parseLegsToSegments(legs);
  };

  // ✅ legs → segments 파싱
  const parseLegsToSegments = (legs) => {
    const parsed = legs.flatMap((leg) => {
      const mode = leg.mode;
      const steps = leg.steps ?? [];

      return steps.map(step => {
        const coords = step.linestring
          ?.split(' ')
          .map(pair => {
            const [lon, lat] = pair.split(',');
            return {
              latitude: parseFloat(lat),
              longitude: parseFloat(lon),
            };
          }) ?? [];

        return {
          mode,
          coords,
        };
      });
    });

    setRouteSegments(parsed.filter(seg => seg.coords.length > 0));
  };

  // ✅ 경로 종류별 색상 설정
  const getColorByMode = (mode) => {
    switch (mode) {
      case 'WALK': return '#999999';
      case 'BUS': return '#FF5900';
      case 'SUBWAY': return '#3b82f6';
      default: return '#888888';
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.555162,
          longitude: 126.936928,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {routeSegments.map((segment, idx) =>
          <Polyline
            key={idx}
            coordinates={segment.coords}
            strokeColor={getColorByMode(segment.mode)}
            strokeWidth={segment.mode === 'WALK' ? 3 : 6}
          />
        )}

        {routeSegments.length > 0 && (
          <>
            <Marker coordinate={routeSegments[0].coords[0]} title="출발지" />
            <Marker
              coordinate={
                routeSegments[routeSegments.length - 1].coords.slice(-1)[0]
              }
              title="도착지"
            />
          </>
        )}
      </MapView>
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
