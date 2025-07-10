import React, { useEffect, useState } from 'react';
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
import { poiService } from '../services/api';

export default function DestinationList() {
  const [poiList, setPoiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // 검색 완료 플래그 추가
  const { location } = useLocation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const searchKeyword = params.searchKeyword || '카페';

  const handleBackPress = () => {
    router.replace('/(tabs)');
  };

  const searchPOI = async (keyword) => {
    if (!keyword || !keyword.trim() || loading) {
      return;
    }

    const currentLocation = location || { latitude: 37.2816, longitude: 127.0453 };

    try {
      setLoading(true);
      console.log('🔍 POI 검색 시작:', keyword);

      const response = await poiService.searchPOI(
        keyword.trim(),
        currentLocation.latitude,
        currentLocation.longitude
      );

      if (response.places && response.places.length > 0) {
        const parsedList = response.places.map((place, idx) => ({
          id: `${place.name}-${idx}`,
          name: place.name,
          distance: place.distance ? `${Math.round(place.distance)}m` : '',
          category: place.category || '기타',
          address: place.address || '주소 정보 없음',
          lat: place.latitude,
          lon: place.longitude,
          tel: place.tel || '',
        }));

        setPoiList(parsedList);
        console.log('✅ POI 검색 완료, 결과 수:', parsedList.length);
      } else {
        setPoiList([]);
        Alert.alert('검색 결과 없음', `"${keyword}"에 대한 검색 결과가 없습니다.`);
      }
    } catch (error) {
      console.error('❌ POI 검색 오류:', error);
      Alert.alert('검색 오류', '장소 검색 중 오류가 발생했습니다.');
      setPoiList([]);
    } finally {
      setLoading(false);
      setHasSearched(true); // 검색 완료 표시
    }
  };

  useEffect(() => {
    // 검색 키워드가 있고 아직 검색하지 않았을 때만 실행
    if (searchKeyword && searchKeyword.trim() && !hasSearched) {
      searchPOI(searchKeyword);
    }
  }, [searchKeyword, hasSearched]); // hasSearched 추가

  const handleSelectDestination = (item) => {
    console.log('🎯 목적지 선택됨!', item);
    console.log('🎯 선택된 아이템 상세:', {
      name: item.name,
      lat: item.lat,
      lon: item.lon,
      address: item.address
    });

    // Alert로 확인
    Alert.alert(
      '목적지 선택됨',
      `${item.name}\n위도: ${item.lat}\n경도: ${item.lon}`,
      [
        {
          text: 'MapScreen으로 이동',
          onPress: () => {
            console.log('🎯 router.push 호출 시작');

            try {
              router.push({
                pathname: '/map',
                params: {
                  destinationName: item.name,
                  destinationLat: item.lat,
                  destinationLon: item.lon,
                  destinationAddress: item.address,
                }
              });

              console.log('🎯 router.push 호출 완료');
            } catch (error) {
              console.error('🎯 라우팅 에러:', error);
              Alert.alert('라우팅 오류', error.message);
            }
          }
        },
        { text: '취소' }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectDestination(item)}
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
    </TouchableOpacity>
  );

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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#FF5900" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>"{searchKeyword}" 검색 결과</Text>
        <View style={{ width: 24 }} />
      </View>

      {poiList.length > 0 ? (
        <FlatList
          data={poiList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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