import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';

const ENABLE_VOICE = false; // ⚠️ 실제 기기에서 음성 기능 테스트 시 true로 변경

export default function Home() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startRecognizing = async () => {
    if (!ENABLE_VOICE) return;

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '마이크 권한 요청',
          message: '음성 인식을 위해 마이크 권한이 필요합니다.',
          buttonPositive: '확인',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    try {
      await Voice.destroy();
      await Voice.start('ko-KR');
      setIsListening(true);
    } catch (e) {
      console.error('Voice start error:', e);
    }
  };

  const stopRecognizing = async () => {
    if (!ENABLE_VOICE) return;

    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Voice stop error:', e);
    }
  };

  useEffect(() => {
    if (!ENABLE_VOICE) return;

    Voice.onSpeechResults = (event) => {
      if (event.value) {
        setRecognizedText(event.value[0]);
      }
    };
    Voice.onSpeechEnd = () => setIsListening(false);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

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

      {/* 텍스트 + 마이크 */}
      <View style={styles.centerContent}>
        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={isListening ? stopRecognizing : startRecognizing}
        >
          <Ionicons name="mic-outline" size={100} color="white" />
        </TouchableOpacity>

        <Text style={styles.resultText}>
          {recognizedText ? recognizedText : '마이크를 눌러 말해주세요'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEFE5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    width: '80%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FF5900',
  },
  centerContent: {
    flex: 1,
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
  resultText: {
    fontSize: 20,
    marginTop: 30,
    textAlign: 'center',
    color: '#000',
  },
});
