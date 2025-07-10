// screens/Home.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLocation } from '../contexts/LocationContext';
import { gptService, poiService } from '../services/api'; // 새로 만든 API 서비스

const ENABLE_VOICE = false; // 음성 기능 비활성화

export default function Home() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { location } = useLocation();

  // 검색 처리 함수 (텍스트 입력용 - GPT 없이 바로 POI 검색)
  const handleTextSearch = async () => {
    if (!recognizedText.trim()) {
      Alert.alert('알림', '목적지를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 텍스트 입력 시 GPT 파싱 없이 바로 POI 검색
      console.log('📝 텍스트 입력 - 바로 POI 검색:', recognizedText);

      router.push({
        pathname: '/destination',
        params: {
          searchKeyword: recognizedText.trim(),
        }
      });

    } catch (error) {
      console.error('❌ 검색 오류:', error);
      Alert.alert('오류', '검색 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 음성 처리 함수 (음성 입력용 - GPT 파싱 후 POI 검색)
  const handleVoiceSearch = async (voiceText) => {
    if (!voiceText.trim()) {
      Alert.alert('알림', '음성이 인식되지 않았습니다. 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 음성 입력 시 GPT로 파싱 후 목적지 추출
      console.log('🎯 음성 입력 - GPT 파싱:', voiceText);
      const parsedResult = await gptService.parseUserInput(voiceText);
      console.log('📍 파싱 결과:', parsedResult);

      const { departure, destination } = parsedResult;

      if (!destination) {
        Alert.alert('오류', '목적지를 찾을 수 없습니다. 다시 말씀해주세요.');
        return;
      }

      // 파싱된 목적지로 검색
      console.log('🔍 파싱된 목적지로 검색:', destination);
      router.push({
        pathname: '/destination',
        params: {
          searchKeyword: destination,
        }
      });

    } catch (error) {
      console.error('❌ 음성 검색 오류:', error);
      Alert.alert('오류', '음성 인식 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecognizing = async () => {
    if (!ENABLE_VOICE) {
      // 음성 기능이 비활성화된 경우 - 텍스트가 있으면 음성 검색으로, 없으면 텍스트 검색으로
      if (recognizedText.trim()) {
        // 텍스트가 입력되어 있으면 음성 처리 플로우로 (GPT 파싱)
        handleVoiceSearch(recognizedText);
      } else {
        Alert.alert('알림', '검색할 목적지를 입력해주세요.');
      }
      return;
    }

    // 실제 음성 인식 로직 (현재 비활성화)
    setIsListening(true);
    // Voice recognition logic would go here
  };

  const stopRecognizing = async () => {
    setIsListening(false);
  };

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
          onSubmitEditing={handleTextSearch} // 엔터키로 텍스트 검색
        />
        <TouchableOpacity onPress={handleTextSearch}>
          <Ionicons name="search" size={18} color="#FF5900" />
        </TouchableOpacity>
      </View>

      <View style={styles.guideTextContainer}>
        <Text style={styles.guideText}>검색창에 입력하거나 마이크로 목적지를 말해주세요.</Text>
      </View>

      {/* 텍스트 + 마이크 */}
      <View style={styles.centerContent}>
        <TouchableOpacity
          style={[
            styles.micButton,
            (isListening || isLoading) && styles.micButtonActive
          ]}
          onPress={isLoading ? null : startRecognizing}
          disabled={isLoading}
        >
          {isLoading ? (
            <Ionicons name="hourglass-outline" size={100} color="white" />
          ) : (
            <Ionicons name="mic-outline" size={100} color="white" />
          )}
        </TouchableOpacity>

        <Text style={styles.resultText}>
          {isLoading
            ? '검색 중...'
            : recognizedText
              ? `"${recognizedText}" 검색 준비됨`
              : '텍스트 입력 또는 마이크 사용'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 100,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEFE5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    width: '80%',
    height: '7%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: '#FF5900',
  },
  guideTextContainer: {
    marginTop: 70,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 70,
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
  resultText: {
    fontSize: 20,
    marginTop: 30,
    textAlign: 'center',
    color: '#000',
  },
});