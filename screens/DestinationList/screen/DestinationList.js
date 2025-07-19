// screens/DestinationList.js
import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DestinationItem from '../component/DestinationItem';
import { useDestinationListViewModel } from '../service/DestinationViewModel';

// ✅ 여기에 추가!
const appendLog = (title, payload) => {
  console.log(`📝 [${title}]`, JSON.stringify(payload, null, 2));
};

export default function DestinationList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
      Speech.stop();
    };
  }, []);

  const {
    poiList,
    searchKeyword,
    routeSearching,
    handleSelectDestination,
    initialize
  } = useDestinationListViewModel(router, params, isActiveRef);



  useEffect(() => {
    initialize();
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <DestinationItem
        item={item}
        isSearching={routeSearching === item.id}
        disabled={routeSearching !== null}
        onPress={() => handleSelectDestination(item)}
      />
    ),
    [handleSelectDestination, routeSearching]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});