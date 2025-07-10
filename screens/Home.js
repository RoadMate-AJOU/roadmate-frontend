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
import { poiService, gptService } from '../services/api'; // API 서비스 추가

const ENABLE_VOICE = true;

export default function Home() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const { location } = useLocation();

  const appendLog = (msg) => {
    setLogMessages((prev) => [...prev.slice(-19), msg]);
    console.log('🏠 HOME LOG:', msg);
  };

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

  // 텍스트 검색 처리 함수
  const handleTextSearch = async () => {
    if (!recognizedText.trim()) {
      Alert.alert('알림', '목적지를 입력해주세요.');
      return;
    }

    setIsSearching(true);
    appendLog(`📝 텍스트 검색 시작: ${recognizedText}`);

    try {
      // 텍스트 입력시 바로 POI 검색
      await searchPOI(recognizedText.trim());
    } catch (error) {
      appendLog(`❌ 텍스트 검색 오류: ${error.message}`);
      Alert.alert('검색 오류', '검색 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSearching(false);
    }
  };

  // 음성 검색 처리 함수
  const handleVoiceSearch = async (voiceText) => {
    if (!voiceText.trim()) {
      Alert.alert('알림', '음성이 인식되지 않았습니다. 다시 시도해주세요.');
      return;
    }

    setIsSearching(true);
    appendLog(`🎤 음성 검색 시작: ${voiceText}`);

    try {
      // 음성 입력시 GPT로 파싱 후 POI 검색
      appendLog('🤖 GPT로 음성 파싱 중...');
      const parsedResult = await gptService.parseUserInput(voiceText);
      appendLog(`📍 파싱 결과: ${parsedResult.destination}`);

      if (!parsedResult.destination) {
        Alert.alert('오류', '목적지를 찾을 수 없습니다. 다시 말씀해주세요.');
        return;
      }

      // 파싱된 목적지로 POI 검색
      await searchPOI(parsedResult.destination);
    } catch (error) {
      appendLog(`❌ 음성 검색 오류: ${error.message}`);
      Alert.alert('음성 검색 오류', '음성 인식 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSearching(false);
    }
  };

  // POI 검색 함수
  const searchPOI = async (keyword) => {
    const currentLocation = location || { latitude: 37.2816, longitude: 127.0453 };

    appendLog(`🔍 POI 검색: ${keyword}`);
    appendLog(`📍 현재 위치: ${currentLocation.latitude}, ${currentLocation.longitude}`);

    try {
      const response = await poiService.searchPOI(
        keyword,
        currentLocation.latitude,
        currentLocation.longitude
      );

      if (response.places && response.places.length > 0) {
        appendLog(`✅ 검색 완료: ${response.places.length}개 결과`);

        // 검색 결과와 함께 destination 페이지로 이동
        router.push({
          pathname: '/destination',
          params: {
            searchKeyword: keyword,
            poiResults: JSON.stringify(response.places),
            totalCount: response.totalCount,
          }
        });
      } else {
        appendLog('❌ 검색 결과 없음');
        Alert.alert('검색 결과 없음', `"${keyword}"에 대한 검색 결과가 없습니다.`);
      }
    } catch (error) {
      appendLog(`❌ POI 검색 실패: ${error.message}`);
      throw error;
    }
  };

  const startRecognizing = async () => {
    if (!ENABLE_VOICE) {
      // 음성 기능이 비활성화된 경우 텍스트 검색 수행
      if (recognizedText.trim()) {
        handleVoiceSearch(recognizedText);
      } else {
        Alert.alert('알림', '검색할 목적지를 입력해주세요.');
      }
      return;
    }

    const granted = await requestAudioPermission();
    if (!granted) {
      appendLog('❌ 마이크 권한 거부됨');
      return;
    }

    try {
      await ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        continuous: true,
        interimResults: true,
      });
      appendLog('▶️ 음성 인식 시작됨');
      const perm = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      appendLog(`권한 상태: ${JSON.stringify(perm)}`);
      setIsListening(true);
    } catch (error) {
      appendLog(`❌ 음성 인식 오류: ${JSON.stringify(error)}`);
    }
  };

  const stopRecognizing = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
      appendLog('⏹️ 음성 인식 중지됨');
      setIsListening(false);
    } catch (e) {
      appendLog(`❌ 중지 오류: ${JSON.stringify(e)}`);
    }
  };

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript;
    if (transcript) {
      appendLog(`🗣️ 인식 결과: ${transcript}`);
      setRecognizedText(transcript);
    }
  });

  useSpeechRecognitionEvent("partialresult", (event) => {
    const transcript = event.text;
    if (transcript) {
      appendLog(`📝 인식 중: ${transcript}`);
      setRecognizedText(transcript);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    appendLog('🔇 음성 인식 종료');
    setIsListening(false);

    // 음성 인식 완료 후 자동으로 검색 수행
    if (recognizedText.trim()) {
      handleVoiceSearch(recognizedText);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    appendLog(`❌ 인식 에러: ${event.message}`);
    setIsListening(false);
  });

  return (
    <View style={styles.container}>
      {/* 검색창 */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="목적지 검색"
          placeholderTextColor="#FF5900"
          value={recognizedText}
          onChangeText={setRecognizedText}
          onSubmitEditing={handleTextSearch} // 엔터키로 검색
          editable={!isSearching && !isListening}
        />
        <TouchableOpacity onPress={handleTextSearch} disabled={isSearching || isListening}>
          <Ionicons name="search" size={18} color="#FF5900" />
        </TouchableOpacity>
      </View>

      <View style={styles.guideTextContainer}>
        <Text style={styles.guideText}>
          {isSearching ? '검색 중...' : '마이크를 누르고 목적지를 검색해 주세요.'}
        </Text>
        <Text style={styles.exampleText}>예) "서울역까지 가고 싶어"</Text>
      </View>

      {/* 마이크 버튼 */}
      <View style={styles.centerContent}>
        <TouchableOpacity
          style={[
            styles.micButton,
            (isListening || isSearching) && styles.micButtonActive
          ]}
          onPress={isListening ? stopRecognizing : startRecognizing}
          disabled={isSearching}
        >
          {isSearching ? (
            <Ionicons name="hourglass-outline" size={100} color="white" />
          ) : (
            <Ionicons name="mic-outline" size={100} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* 인식된 텍스트 실시간 출력 */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>📝 인식된 텍스트</Text>
        <Text style={styles.resultText}>
          {isSearching
            ? '검색 중...'
            : recognizedText || '마이크를 눌러 말해보세요.'
          }
        </Text>
      </View>

      {/* 로그 출력 */}
      <ScrollView style={styles.logContainer}>
        {logMessages.map((msg, idx) => (
          <Text key={idx} style={styles.logText}>• {msg}</Text>
        ))}
      </ScrollView>
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
  micButtonActive: {
    shadowColor: '#FF5900',
    shadowOpacity: 0.6,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
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
  logContainer: {
    maxHeight: 150,
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  logText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});