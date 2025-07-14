import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../assets/images/fix.png'),
    description: '말로 목적지를 말하면,\n어떻게 가야 할지 대신 알려주는\n대중교통 안내 도우미입니다.',
  },
  {
    id: '2',
    image: require('../assets/images/fix2.png'),
    description: "'서울역 가고 싶어요'\n말하면 버스, 지하철까지\n전부 알려드려요.",
  },
  {
    id: '3',
    image: require('../assets/images/fix3.png'),
    description: "안내 중에도\n'어디서 내리죠?' 물으면\n다시 말해드려요.",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(Number(viewableItems[0].index));
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleSignup = () => {
    router.push('/signup'); // ✅ 파일 기반 라우팅
  };

  const handleGuest = () => {
    router.replace('/(tabs)'); // ✅ 탭 그룹으로 이동
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={index === currentIndex ? styles.dotActive : styles.dotInactive}
          />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.guestButton} onPress={handleGuest}>
          <Text style={styles.buttonText}>게스트</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
  },
  description: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff6600',
    marginHorizontal: 4,
  },
  dotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 40,
  },
  guestButton: {
    flex: 1,
    backgroundColor: '#ff6600',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 6,
    alignItems: 'center',
    // ✅ 입체감 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6, // Android용
  },

  signupButton: {
    flex: 1,
    backgroundColor: '#ff6600',
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 6,
    alignItems: 'center',
    // ✅ 입체감 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    // ✅ 약간 음각 느낌
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  }

});
