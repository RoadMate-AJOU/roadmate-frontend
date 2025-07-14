import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLocation } from '../contexts/LocationContext';
import { poiService, gptService } from '../services/api';
import * as Speech from 'expo-speech';
import { setVoiceOwner, getVoiceOwner, clearVoiceOwner } from '../hooks/VoiceOwner';
const ENABLE_VOICE = true;

export default function Home() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { location } = useLocation();

  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '마이크 권한 요청',
          message: '음성 인식을 위해 마이크 권한이 필요합니다.',
          buttonPositive: '확인',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleTextSearch = async () => {
    const inputText = recognizedText.trim();
    if (!inputText) {
      Alert.alert('알림', '목적지를 입력해주세요.');
      return;
    }

    setIsSearching(true);

    try {
      const res = await fetch('http://223.130.135.190:8080/nlp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-002',
          text: inputText,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();

      const destination = result.data?.destination;
      if (!destination) {
        Alert.alert('오류', '목적지를 찾을 수 없습니다. 다시 입력해주세요.');
        return;
      }

      Speech.speak(`${destination} 검색 결과를 알려드릴게요. 원하시는 목적지를 눌러 주세요.`, {
        language: 'ko-KR',
        pitch: 1.0,
        rate: 1.0,
      });


      await searchPOI(destination);
    } catch (error) {
      Alert.alert('텍스트 검색 오류', '검색 중 문제가 발생했습니다. 다시 시도해주세요.');
      console.error('🔴 handleTextSearch error:', error);
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
          sessionId: 'session-002',
          text: voiceText,
        }),
      });

      if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);

          }

      const result = await res.json();



      // 2. 목적지 추출 후 POI 검색 실행
      const destination = result.data?.destination;
      if (!destination) {
        Alert.alert('오류', '목적지를 찾을 수 없습니다. 다시 말씀해주세요.');
        return;
      }

      Speech.speak(`${destination} 검색 결과를 알려드릴게요. 원하시는 목적지를 눌러 주세요.`, {
        language: 'ko-KR',
        pitch: 1.0,
        rate: 1.0,
      });


      await searchPOI(destination);

    } catch (error) {
      Alert.alert('음성 검색 오류', '음성 인식 중 문제가 발생했습니다. 다시 시도해주세요.');
      console.error('🔴 handleVoiceSearch error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const searchPOI = async (keyword) => {
//  const currentLocation = location || { latitude: 37.2816, longitude: 127.0453 };
    const currentLocation = { latitude: 37.52759656, longitude: 126.91994412 };

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
        Alert.alert('검색 결과 없음', `${keyword}에 대한 검색 결과가 없습니다.`);
      }
    } catch (error) {
      throw error;
    }
  };

  const startRecognizing = async () => {
    if (!ENABLE_VOICE) {
      if (recognizedText.trim()) {
        handleTextSearch();
      } else {
        Alert.alert('알림', '음성 인식이 비활성화되어 있습니다. 텍스트로 검색해주세요.');
      }
      return;
    }

    const granted = await requestAudioPermission();
    if (!granted) return;

    try {
        setVoiceOwner('home');
      await ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        continuous: true,
        interimResults: true,
      });
      setIsListening(true);
    } catch (error) {}
  };

  const stopRecognizing = async () => {
    if (!ENABLE_VOICE) return;

    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    } catch (e) {}
  };

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript;
    if (transcript) setRecognizedText(transcript);
  });

  useSpeechRecognitionEvent("partialresult", (event) => {
    const transcript = event.text;
    if (transcript) setRecognizedText(transcript);
  });

  useSpeechRecognitionEvent("end", () => {
  if (getVoiceOwner() !== 'home') return;
    setIsListening(false);
    clearVoiceOwner();
    if (recognizedText.trim()) {
      handleVoiceSearch(recognizedText);
    }
  });

  useSpeechRecognitionEvent("error", () => {
    setIsListening(false);
  });

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
          editable={!isSearching && !isListening}
        />
        <TouchableOpacity onPress={handleTextSearch} disabled={isSearching || isListening}>
          <Ionicons name="search" size={18} color="#FF5900" />
        </TouchableOpacity>
      </View>

      <View style={styles.guideTextContainer}>
        <Text style={styles.guideText}>
          {isSearching ? '검색 중...' : ENABLE_VOICE ? '마이크를 누르고 목적지를 검색해 주세요.' : '텍스트로 목적지를 검색해 주세요.'}
        </Text>
        <Text style={styles.exampleText}>
          {ENABLE_VOICE ? '예) "서울역까지 가고 싶어"' : '예) "서울역"'}
        </Text>
      </View>

      <View style={styles.centerContent}>
        <TouchableOpacity
          style={[
            styles.micButton,
            (isListening || isSearching) && styles.micButtonActive,
            !ENABLE_VOICE && styles.micButtonDisabled
          ]}
          onPress={isListening ? stopRecognizing : startRecognizing}
          disabled={isSearching}
        >
          {isSearching ? (
            <Ionicons name="hourglass-outline" size={100} color="white" />
          ) : (
            <Ionicons name={ENABLE_VOICE ? "mic-outline" : "search-outline"} size={100} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>
          {isSearching
            ? '검색 중...'
            : recognizedText || (ENABLE_VOICE ? '마이크를 눌러 말해보세요.' : '위 검색창에 목적지를 입력하세요.')
          }
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
    borderRadius: 20,
    width: '80%',
    height: 64, // ✅ 고정값으로 설정
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
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  micButtonActive: {
    shadowColor: '#FF5900',
    shadowOpacity: 0.9,          // ✅ 더 진하게
    shadowRadius: 40,            // ✅ Glow 범위 넓게
    shadowOffset: { width: 0, height: 0 },
    elevation: 30,               // ✅ Android에서 glow 강화
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