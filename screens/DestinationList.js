// screens/DestinationList.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLocation } from '../contexts/LocationContext';
import { poiService, routeService } from '../services/api';

export default function DestinationList() {
  const [poiList, setPoiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [routeSearching, setRouteSearching] = useState(null); // 경로 검색 중인 목적지 ID
  const { location } = useLocation();
  const router = useRouter();
  const params = useLocalSearchParams();

  // POI 결과 처리 함수를 useCallback으로 메모화
  const processPoiResults = useCallback((results) => {
    const parsedList = results.map((place, idx) => ({
      id: `${place.name}-${idx}-${Date.now()}`,
      name: place.name,
      distance: place.distance ? `${Math.round(place.distance)}m` : '',
      category: place.category || '기타',
      address: place.address || '주소 정보 없음',
      lat: place.latitude,
      lon: place.longitude,
      tel: place.tel || '',
    }));

    setPoiList(parsedList);
  }, []);

  // POI 검색 함수를 useCallback으로 메모화
  const searchPOI = useCallback(async (keyword) => {
    if (!keyword || !keyword.trim()) {
      return;
    }

    const currentLocation = location || { latitude: 37.2816, longitude: 127.0453 };

    try {
      setLoading(true);
      console.log('🔍 DestinationList에서 POI 검색:', keyword);

      const response = await poiService.searchPOI(
        keyword.trim(),
        currentLocation.latitude,
        currentLocation.longitude
      );

      if (response.places && response.places.length > 0) {
        processPoiResults(response.places);
        console.log('✅ POI 검색 완료:', response.places.length, '개 결과');
      } else {
        setPoiList([]);
        Alert.alert('검색 결과 없음', `"${keyword}"에 대한 검색 결과가 없습니다.`);
      }
    } catch (error) {
      console.error('❌ POI 검색 오류:', error);
      Alert.alert('검색 오류', '장소 검색 중 오류가 발생했습니다.');
      loadSampleData();
    } finally {
      setLoading(false);
    }
  }, [location, processPoiResults]);

  // 샘플 데이터 로드 함수를 useCallback으로 메모화
  const loadSampleData = useCallback(() => {
    try {
      const samplePOI = require('../data/tmap_POI_sample.json');
      const rawList = samplePOI?.searchPoiInfo?.pois?.poi ?? [];

      const parsedList = rawList.map((poi, idx) => ({
        id: `${poi.id}-${poi.navSeq}-${idx}-${Date.now()}`,
        name: poi.name,
        distance: '',
        category: `${poi.upperBizName || ''}, ${poi.middleBizName || ''}`,
        address: poi.newAddressList?.newAddress?.[0]?.fullAddressRoad || '주소 정보 없음',
        lat: parseFloat(poi.frontLat),
        lon: parseFloat(poi.frontLon),
      }));

      setPoiList(parsedList);
      setSearchKeyword('샘플 데이터');
    } catch (error) {
      console.error('❌ 샘플 데이터 로드 오류:', error);
      setPoiList([]);
    }
  }, []);

  // useEffect를 한 번만 실행되도록 수정
  useEffect(() => {
    if (initialized) {
      return;
    }

    console.log('🎯 DestinationList params:', params);

    if (params.poiResults) {
      try {
        const parsedResults = JSON.parse(params.poiResults);
        const keyword = params.searchKeyword || '';

        console.log('✅ Home에서 전달받은 POI 결과:', parsedResults.length, '개');

        setSearchKeyword(keyword);
        processPoiResults(parsedResults);
        setInitialized(true);
      } catch (error) {
        console.error('❌ POI 결과 파싱 오류:', error);
        loadSampleData();
        setInitialized(true);
      }
    } else if (params.searchKeyword && !initialized) {
      setSearchKeyword(params.searchKeyword);
      searchPOI(params.searchKeyword);
      setInitialized(true);
    } else if (!initialized) {
      loadSampleData();
      setInitialized(true);
    }
  }, [params.poiResults, params.searchKeyword, initialized, processPoiResults, searchPOI, loadSampleData]);

  // 경로 검색 및 지도 이동
  const handleSelectDestination = useCallback(async (item) => {
    console.log('🎯 목적지 선택됨:', item.name);

    const currentLocation = location || { latitude: 37.2816, longitude: 127.0453 };

    // 경로 검색 로딩 시작
    setRouteSearching(item.id);

    try {
      console.log('🔍 경로 검색 시작...');

      // 경로 API 호출
      const routeResponse = await routeService.searchRoute(
        currentLocation.latitude,
        currentLocation.longitude,
        item.lat,
        item.lon,
        '현재 위치',
        item.name
      );

      console.log('✅ 경로 검색 완료:', routeResponse);

      // 경로 정보와 함께 지도 화면으로 이동
      router.push({
        pathname: '/map',
        params: {
          // 목적지 정보
          destinationName: item.name,
          destinationLat: item.lat,
          destinationLon: item.lon,
          destinationAddress: item.address,

          // 출발지 정보
          startLat: currentLocation.latitude,
          startLon: currentLocation.longitude,
          startName: '현재 위치',

          // 경로 정보 (JSON 문자열로 전달)
          routeData: JSON.stringify(routeResponse),

          // 기본 정보
          totalDistance: routeResponse.totalDistance || 0,
          totalTime: routeResponse.totalTime || 0,
          totalFare: routeResponse.totalFare || 0,
        }
      });

    } catch (error) {
      console.error('❌ 경로 검색 실패:', error);

      // 경로 검색 실패 시 기본 지도로 이동
      Alert.alert(
        '경로 검색 실패',
        '경로를 찾을 수 없습니다. 기본 지도로 이동합니다.',
        [
          {
            text: '확인',
            onPress: () => {
              router.push({
                pathname: '/map',
                params: {
                  destinationName: item.name,
                  destinationLat: item.lat,
                  destinationLon: item.lon,
                  destinationAddress: item.address,
                  startLat: currentLocation.latitude,
                  startLon: currentLocation.longitude,
                  startName: '현재 위치',
                  routeError: 'true'
                }
              });
            }
          }
        ]
      );
    } finally {
      setRouteSearching(null);
    }
  }, [router, location]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        routeSearching === item.id && styles.cardSearching
      ]}
      onPress={() => handleSelectDestination(item)}
      disabled={routeSearching === item.id}
    >
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.address}>{item.address}</Text>
        </View>
        {item.tel ? (
          <View style={styles.addressRow}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={styles.address}>{item.tel}</Text>
          </View>
        ) : null}
      </View>

      {/* 경로 검색 중 표시 */}
      {routeSearching === item.id && (
        <View style={styles.searchingOverlay}>
          <ActivityIndicator size="small" color="#FF5900" />
          <Text style={styles.searchingText}>경로 검색 중...</Text>
        </View>
      )}
    </TouchableOpacity>
  ), [handleSelectDestination, routeSearching]);

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5900" />
        <Text style={styles.loadingText}>"{searchKeyword}" 검색 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="arrow-back" size={24} color="#FF5900" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {searchKeyword ? `"${searchKeyword}" 검색 결과` : '목적지 목록'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {poiList.length > 0 ? (
        <FlatList
          data={poiList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          <Text style={styles.emptySubText}>다른 키워드로 검색해보세요</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>목적지 다시 설정할래요!</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(250, 129, 47, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#FA812F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  cardSearching: {
    opacity: 0.7,
    backgroundColor: 'rgba(250, 129, 47, 0.2)',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: '#FF5900',
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  address: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  searchingOverlay: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -15 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FF5900',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#FF5900',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});