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
} from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ENABLE_VOICE = true;

export default function Home() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [logMessages, setLogMessages] = useState([]);

  const appendLog = (msg: string) => {
    setLogMessages((prev) => [...prev.slice(-19), msg]);
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

  const startRecognizing = async () => {
    if (!ENABLE_VOICE) return;

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
   router.push('/destination');
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
        />
        <Ionicons name="search" size={18} color="#FF5900" />
      </View>

      <View style={styles.guideTextContainer}>
        <Text style={styles.guideText}>마이크를 누르고 목적지를 검색해 주세요.</Text>
        <Text style={styles.exampleText}>예) “서울역까지 가고 싶어”</Text>
      </View>

      {/* 마이크 버튼 */}
      <View style={styles.centerContent}>
        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={isListening ? stopRecognizing : startRecognizing}
        >
          <Ionicons name="mic-outline" size={100} color="white" />
        </TouchableOpacity>
      </View>

      {/* 인식된 텍스트 실시간 출력 */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>📝 인식된 텍스트</Text>
        <Text style={styles.resultText}>
          {recognizedText || '마이크를 눌러 말해보세요.'}
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
