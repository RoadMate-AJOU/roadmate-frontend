import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const MOCK_DATA = [
  {
    id: '1',
    name: '이마트 마포점',
    distance: '500 m',
    category: '슈퍼, 마트',
    address: '서울 마포구 신공덕동',
    image: require('../assets/images/emart-logo.png'),
  },
  {
    id: '2',
    name: '이마트 마포점',
    distance: '500 m',
    category: '슈퍼, 마트',
    address: '서울 마포구 신공덕동',
    image: require('../assets/images/emart-logo.png'),
  },
  {
    id: '3',
    name: '이마트 마포점',
    distance: '500 m',
    category: '슈퍼, 마트',
    address: '서울 마포구 신공덕동',
    image: require('../assets/images/emart-logo.png'),
  },
  {
    id: '4',
    name: '이마트 마포점',
    distance: '500 m',
    category: '슈퍼, 마트',
    address: '서울 마포구 신공덕동',
    image: require('../assets/images/emart-logo.png'),
  },
  {
      id: '5',
      name: '이마트 마포점',
      distance: '500 m',
      category: '슈퍼, 마트',
      address: '서울 마포구 신공덕동',
      image: require('../assets/images/emart-logo.png'),
    },
  {
      id: '6',
      name: '이마트 마포점',
      distance: '500 m',
      category: '슈퍼, 마트',
      address: '서울 마포구 신공덕동',
      image: require('../assets/images/emart-logo.png'),
    },
  {
      id: '7',
      name: '이마트 마포점',
      distance: '500 m',
      category: '슈퍼, 마트',
      address: '서울 마포구 신공덕동',
      image: require('../assets/images/emart-logo.png'),
    },
];

export default function DestinationList() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push('/map')}>
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_DATA}
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
    paddingBottom: 100, // 버튼과 겹치지 않게 하단 여백 추가
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 16,
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
