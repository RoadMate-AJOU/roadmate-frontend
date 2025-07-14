import React, { useRef, useState, useEffect } from 'react';
import { Animated, TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { setVoiceOwner, getVoiceOwner, clearVoiceOwner } from '../../hooks/VoiceOwner';

export default function FloatingMicButton() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [debugIntent, setDebugIntent] = useState(''); // ✅ intent 디버깅용 상태
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
    const [isListening, setIsListening] = useState(false);
    const recognizedTextRef = useRef('');



  // 🔄 말하는 동안 애니메이션
  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isSpeaking]);
  const sendToBackend = async (text: string) => {
    try {
      const res = await fetch('http://223.130.135.190:8080/nlp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-002',
          text: text,
        }),
      });

      const json = await res.json();
      const { status, intent, responseMessage } = json;
      setDebugIntent(intent); // ✅ intent 표시용 저장

      if (responseMessage) {
        Speech.speak(responseMessage, {
          language: 'ko-KR',
          onDone: () => {
            (async () => {
              if (status === 'API_REQUIRED') {
                if (intent === 'real_time_bus_arrival' || intent === 'real_time_subway_arrival') {
//                   const busNumber = json.data.bus_number;
//                   const stationName = json.data.station_name;

//                   const arrivalResult = await fetchBusArrivalTime(stationName, busNumber);

                  let speechText = '';
                  speechText = `9분 남았습니다.`;
//                   if (arrivalResult === '운행종료') {
//                     speechText = `${busNumber}번은 운행이 종료되었습니다.`;
//                   } else if (typeof arrivalResult === 'number') {
//                     speechText = `${busNumber}번은 ${arrivalResult}분 뒤에 도착합니다.`;
//                   } else if (typeof arrivalResult === 'string') {
//                     speechText = `${busNumber}번 도착 정보: ${arrivalResult}`;
//                   } else {
//                     speechText = `${busNumber}번 도착 정보를 찾을 수 없습니다.`;
//                   }

                  Speech.speak(speechText, {
                    language: 'ko-KR',
                    onDone: () => setIsSpeaking(false),
                  });
                }
                else if (intent === 'extract_route' || intent === 'research_route') {
                Speech.speak('홈으로 이동할게요. 목적지를 다시 검색해주세요.', {
                                    language: 'ko-KR',
                                    onDone: () => setIsSpeaking(false),
                                  });
                  router.replace('/(tabs)');
                } else {
                  setIsSpeaking(false);
                }
              } else {
                setIsSpeaking(false);
              }
            })(); // ← 즉시 실행 async 함수
          },

          onError: () => setIsSpeaking(false),
        });
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('❌ 백엔드 통신 오류:', err);
      setIsSpeaking(false);
    }
  };
  
  // ✅ 마이크 클릭 시
  const handleMicPress = async () => {
    if (isListening) {
      try {
        await ExpoSpeechRecognitionModule.stop();
      } catch (err) {
        console.error('❌ 음성 인식 종료 오류:', err);
      }
    } else {
      try {
        setVoiceOwner('mic');
        await ExpoSpeechRecognitionModule.start({
          lang: 'ko-KR',
          continuous: false,
          interimResults: true,
        });
        setIsListening(true);
        setIsSpeaking(true);
      } catch (err) {
        console.error('❌ 음성 인식 시작 오류:', err);
      }
    }
  };
  const handleMicPress = async () => {
      if (isListening) {
        // 음성 인식 종료 요청
        try {
          await ExpoSpeechRecognitionModule.stop();
        } catch (err) {
          console.error('❌ 음성 인식 종료 오류:', err);
        }
      } else {
        // 음성 인식 시작
        try {
          await ExpoSpeechRecognitionModule.start({
            lang: 'ko-KR',
            continuous: false,
            interimResults: true,
          });
          setIsListening(true);
          setIsSpeaking(true);
        } catch (err) {
          console.error('❌ 음성 인식 시작 오류:', err);
        }
      }
    };

    useSpeechRecognitionEvent('result', (event) => {
        const finalText = event.results?.[0]?.transcript;
        if (finalText) {
          recognizedTextRef.current = finalText;
          console.log('✅ 최종 인식:', finalText);
        }
      });

    // 음성 인식 종료 후 처리 (→ 백엔드 전송)
      useSpeechRecognitionEvent('end', () => {
        setIsListening(false);
        const finalText = recognizedTextRef.current;
        if (finalText) {
          Speech.speak(finalText, {
            language: 'ko-KR',
            onDone: () => {
              console.log('✅ TTS 완료, 백엔드 전송 시작');
              sendToBackend(finalText);
            },
            onError: (err) => {
              console.error('❌ TTS 오류:', err);
              setIsSpeaking(false);
            },
          });
        } else {
          console.log('⚠️ 음성이 인식되지 않았습니다');
          setIsSpeaking(false);
        }
      });

   useSpeechRecognitionEvent('error', (event) => {
       console.error('❌ 음성 인식 에러:', event.error);
       setIsListening(false);
       setIsSpeaking(false);
     });

  useSpeechRecognitionEvent('result', (event) => {
    const finalText = event.results?.[0]?.transcript;
    if (finalText) {
      recognizedTextRef.current = finalText;
      console.log('✅ 최종 인식:', finalText);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    if (getVoiceOwner() !== 'mic') return;
    setIsListening(false);
    clearVoiceOwner();
    const finalText = recognizedTextRef.current;
    if (finalText) {
      Speech.speak(finalText, {
        language: 'ko-KR',
        onDone: () => {
          console.log('✅ TTS 완료, 백엔드 전송 시작');
          sendToBackend(finalText);
        },
        onError: (err) => {
          console.error('❌ TTS 오류:', err);
          setIsSpeaking(false);
        },
      });
    } else {
      console.log('⚠️ 음성이 인식되지 않았습니다');
      setIsSpeaking(false);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('❌ 음성 인식 에러:', event.error);
    setIsListening(false);
    setIsSpeaking(false);
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const glowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <View style={styles.container}>
      {isSpeaking && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              shadowRadius: glowRadius,
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.micButton,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: isSpeaking ? '#FF3B30' : '#FF5900',
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleMicPress}
          style={styles.touchArea}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isSpeaking ? 'stop' : 'mic'}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  touchArea: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  borderRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255, 89, 0, 0.3)',
    zIndex: 1,
  },
  glowEffect: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF5900',
    shadowColor: '#FF5900',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    elevation: 0,
    zIndex: 0,
  },
  intentText: {
    marginTop: 8,
    color: '#333',
    fontSize: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 2,
  },
});
