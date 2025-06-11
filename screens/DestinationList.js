import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const MOCK_DATA = [
  {
    id: '1',
    name: '이마트 마포점',
    distance: '500 m',
    category: '슈퍼, 마트',
    address: '서울 마포구 신공덕동',
    image: require('../assets/images/emart-logo.png'), // 로고 경로
  },
  {
      id: '2',
      name: '이마트 마포점',
      distance: '500 m',
      category: '슈퍼, 마트',
      address: '서울 마포구 신공덕동',
      image: require('../assets/images/emart-logo.png'), // 로고 경로
    },
    {
        id: '3',
        name: '이마트 마포점',
        distance: '500 m',
        category: '슈퍼, 마트',
        address: '서울 마포구 신공덕동',
        image: require('../assets/images/emart-logo.png'), // 로고 경로
      },
  {
      id: '4',
      name: '이마트 마포점',
      distance: '500 m',
      category: '슈퍼, 마트',
      address: '서울 마포구 신공덕동',
      image: require('../assets/images/emart-logo.png'), // 로고 경로
    },

];

export default function DestinationList() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.logo} />
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
    </View>
  );

  return (
    <FlatList
      data={MOCK_DATA}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListFooterComponent={
            <TouchableOpacity style={styles.resetButton} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.resetButtonText}>목적지 다시 설정할래요!</Text>
            </TouchableOpacity>
            }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingTop: 80,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 14,
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
    fontSize: 16,
    color: '#999',
  },
  category: {
    fontSize: 16,
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
  resetButton: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#FF5900',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

