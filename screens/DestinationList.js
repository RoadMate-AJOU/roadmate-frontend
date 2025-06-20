// DestinationList.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocation } from '../contexts/LocationContext';

const samplePOI = require('../data/tmap_POI_sample.json');

export default function DestinationList() {
  const [poiList, setPoiList] = useState([]);
  const { location } = useLocation();
  const router = useRouter();

  useEffect(() => {
    const rawList = samplePOI?.searchPoiInfo?.pois?.poi ?? [];

    const parsedList = rawList.map((poi, idx) => ({
      id: `${poi.id}-${poi.navSeq}-${idx}`,
      name: poi.name,
      distance: '',
      category: `${poi.upperBizName || ''}, ${poi.middleBizName || ''}`,
      address: poi.newAddressList?.newAddress?.[0]?.fullAddressRoad || '주소 정보 없음',
      lat: parseFloat(poi.frontLat),
      lon: parseFloat(poi.frontLon),
    }));

    setPoiList(parsedList);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/map', params: { name: item.name } })}>
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
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={poiList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')}>
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
  list: {
    paddingTop: 100,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(250, 129, 47, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#FA812F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 15,
    color: '#999',
  },
  category: {
    fontSize: 15,
    color: '#555',
    marginTop: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  address: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
