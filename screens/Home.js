import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLocation } from '../contexts/LocationContext';
<<<<<<< HEAD
import { poiService } from '../services/api';
=======
import { poiService, gptService } from '../services/api';
import * as Speech from 'expo-speech';
>>>>>>> dc9da24 (apk)

const ENABLE_VOICE = false; // 음성 인식 비활성화

export default function Home() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { location } = useLocation();

  const handleTextSearch = async () => {
    if (!recognizedText.trim()) {
      Alert.alert('알림', '목적지를 입력해주세요.');
      return;
    }

    setIsSearching(true);

    try {
      await searchPOI(recognizedText.trim());
    } catch (error) {
      Alert.alert('검색 오류', '검색 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceSearch = async (voiceText) => {
    if (!voiceText.trim()) {
      Alert.alert('알림', '음성이 인식되지 않았습니다. 다시 시도해주세요.');
      return;
    }

    setIsSearching(true);

    try {
      const res = await fetch('http://223.130.135.190:8080/nlp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-001',
          text: voiceText,
        }),
      });

      if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

      const result = await res.json();

      if (result.responseMessage) {
        // 1. 사용자에게 Alert로 표시
        Alert.alert('안내', result.responseMessage);

        // 2. TTS로 읽어주기
        Speech.speak(result.responseMessage, {
          language: 'ko-KR',
          pitch: 1.0,
          rate: 1.0,
        });
      }

      // 2. 목적지 추출 후 POI 검색 실행
//      const destination = result.data?.destination;
//      if (!destination) {
//        Alert.alert('오류', '목적지를 찾을 수 없습니다. 다시 말씀해주세요.');
//        return;
//      }

      await searchPOI(destination);

    } catch (error) {
      Alert.alert('음성 검색 오류', '음성 인식 중 문제가 발생했습니다. 다시 시도해주세요.');
      console.error('🔴 handleVoiceSearch error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const searchPOI = async (keyword) => {
    const currentLocation = location || { latitude: 37.2816, longitude: 127.0453 };

    try {
      const response = await poiService.searchPOI(
        keyword,
        currentLocation.latitude,
        currentLocation.longitude
      );

      if (response.places && response.places.length > 0) {
        router.push({
          pathname: '/destination',
          params: {
            searchKeyword: keyword,
            poiResults: JSON.stringify(response.places),
            totalCount: response.totalCount,
          }
        });
      } else {
        Alert.alert('검색 결과 없음', `"${keyword}"에 대한 검색 결과가 없습니다.`);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleMicPress = () => {
    if (ENABLE_VOICE) {
      // 음성 인식 로직 주석 처리됨
      return;
    }

    // 음성 비활성화 상태에서는 텍스트 검색만 수행
    if (recognizedText.trim()) {
      handleTextSearch();
    } else {
      Alert.alert('알림', '텍스트를 입력해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="목적지 검색"
          placeholderTextColor="#FF5900"
          value={recognizedText}
          onChangeText={setRecognizedText}
          onSubmitEditing={handleTextSearch}
          editable={!isSearching}
        />
        <TouchableOpacity onPress={handleTextSearch} disabled={isSearching}>
          <Ionicons name="search" size={18} color="#FF5900" />
        </TouchableOpacity>
      </View>

      <View style={styles.guideTextContainer}>
        <Text style={styles.guideText}>
          텍스트로 목적지를 검색해 주세요.
        </Text>
        <Text style={styles.exampleText}>예) "서울역"</Text>
      </View>

      <View style={styles.centerContent}>
        <TouchableOpacity
          style={[
            styles.micButton,
            !ENABLE_VOICE && styles.micButtonDisabled,
          ]}
          onPress={handleMicPress}
          disabled={isSearching}
        >
          <Ionicons name="search-outline" size={100} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>
          {isSearching
            ? '검색 중...'
            : recognizedText || '위 검색창에 목적지를 입력하세요.'}
        </Text>
      </View>

      {!ENABLE_VOICE && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ 음성 인식이 비활성화되어 있습니다.{'\n'}
            개발 빌드에서 음성 기능을 사용할 수 있습니다.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEFE5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    width: '80%',
    height: '12%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: '#FF5900',
  },
  guideTextContainer: {
    marginTop: 50,
    marginBottom: 30,
    alignItems: 'center',
  },
  guideText: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 20,
    color: '#444',
    textAlign: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    backgroundColor: '#FF5900',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  micButtonDisabled: {
    backgroundColor: '#ccc',
  },
  resultContainer: {
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  resultTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
  },
  warningContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});
