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
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLocation } from '../contexts/LocationContext';
import { poiService, routeService } from '../services/api';
import * as Speech from 'expo-speech';

// ✅ 여기에 추가!
const appendLog = (title, payload) => {
  console.log(`📝 [${title}]`, JSON.stringify(payload, null, 2));
};

export default function DestinationList() {
  const [poiList, setPoiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [routeSearching, setRouteSearching] = useState(null);
  const { location } = useLocation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const processPoiResults = useCallback((results) => {
    const parsedList = results.map((place, idx) => {
      const rawDistance = place.distance || 0;
      const formattedDistance =
        rawDistance >= 1000
          ? `${(rawDistance / 1000).toFixed(1)}km`
          : `${Math.round(rawDistance)}m`;

      return {
        id: `${place.name}-${idx}-${Date.now()}`,
        name: place.name,
        distance: formattedDistance,
        category: place.category || '기타',
        address: place.address || '주소 정보 없음',
        lat: place.latitude,
        lon: place.longitude,
        tel: place.tel || '',
      };
    });

        setPoiList(parsedList);
      }, []);

  const searchPOI = useCallback(async (keyword) => {
    if (!keyword?.trim()) return;
//    const currentLocation = location || { latitude: 37.2816, longitude: 127.0453 };
        const currentLocation = { latitude: 37.52759656, longitude: 126.91994412 };

    try {
      setLoading(true);
      const response = await poiService.searchPOI(keyword.trim(), currentLocation.latitude, currentLocation.longitude);
      if (response.places?.length > 0) {
        processPoiResults(response.places);
      } else {
        setPoiList([]);
        Alert.alert('검색 결과 없음', `"${keyword}"에 대한 검색 결과가 없습니다.`);
      }
    } catch (error) {
      Alert.alert('검색 오류', '장소 검색 중 오류가 발생했습니다.');
      loadSampleData();
    } finally {
      setLoading(false);
    }
  }, [location, processPoiResults]);

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
      setPoiList([]);
    }
  }, []);

  useEffect(() => {
    loadSampleData();
    setInitialized(true);
  }, [loadSampleData]);

  useEffect(() => {
    if (initialized) return;
    if (params.poiResults) {
      try {
        const parsedResults = JSON.parse(params.poiResults);
        const keyword = params.searchKeyword || '';
        setSearchKeyword(keyword);
        processPoiResults(parsedResults);
        setInitialized(true);
      } catch (error) {
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
  }, [params, initialized, processPoiResults, searchPOI, loadSampleData]);

  const handleSelectDestination = useCallback(async (item) => {
//    const currentLocation = location || { latitude: 37.2816, longitude: 127.0453 };
        const currentLocation = { latitude: 37.52759656, longitude: 126.91994412 };

    setRouteSearching(item.id);
    appendLog('📤 경로 요청 파라미터', {
      startLat: currentLocation.latitude,
      startLon: currentLocation.longitude,
      endLat: item.lat,
      endLon: item.lon,
      startName: '현재 위치',
      endName: item.name
    });

    try {
      const routeResponse = await routeService.searchRoute(
        currentLocation.latitude, currentLocation.longitude, item.lat, item.lon, '현재 위치', item.name
      );
      Speech.speak(`현재 위치에서 ${item.name}까지 경로를 탐색합니다.`, {
        language: 'ko-KR',
        pitch: 1.0,
        rate: 1.0,
        onDone: () => {
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
            },
          });
        },
      }); // ✅ 이 괄호 2개가 꼭 필요합니다
    } catch (error) {
      appendLog('❌ 경로 요청 실패', error);
      Alert.alert('경로 검색 실패', '경로를 찾을 수 없습니다. 기본 지도로 이동합니다.', [{
        text: '확인',
        onPress: () => {
          router.replace({
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
            },
          });
        }
      }]);
    } finally {
      setRouteSearching(null);
    }
  }, [router, location]);


  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.card, routeSearching === item.id && styles.cardSearching]}
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
        {!!item.tel && (
          <View style={styles.addressRow}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={styles.address}>{item.tel}</Text>
          </View>
        )}
      </View>
      {routeSearching === item.id && (
        <View style={styles.searchingOverlay}>
          <ActivityIndicator size="small" color="#FF5900" />
          <Text style={styles.searchingText}>경로 검색 중...</Text>
        </View>
      )}
    </TouchableOpacity>
  ), [handleSelectDestination, routeSearching]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5900" />
        <Text style={styles.loadingText}>"{searchKeyword}" 검색 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="arrow-back" size={24} color="#FF5900" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{searchKeyword ? `"${searchKeyword}" 검색 결과` : '목적지 목록'}</Text>
        <View style={{ width: 24 }} />
      </View>
      {poiList.length > 0 ? (
        <FlatList
          data={poiList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          bounces={true}
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
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.buttonText}>목적지 다시 설정할래요!</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(250,129,47,0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },   // ⬅️ 살짝 더 선명하게
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3, // ⬅️ 기존보다 약간 강조
      },
    }),
    position: 'relative',
  },

  cardSearching: {
    opacity: 0.7,
    backgroundColor: '#FFF8F2',
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
    bottom: Platform.OS === 'ios' ? 30 : 20,
    alignSelf: 'center',
    backgroundColor: '#FF8A33',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, // ⬅️ 더 깊은 그림자
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6, // ⬅️ 입체감 있게
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
