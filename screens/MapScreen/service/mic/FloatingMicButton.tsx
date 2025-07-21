import React, { useRef, useState, useEffect } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { getVoiceOwner, setVoiceOwner, clearVoiceOwner } from '@/hooks/VoiceOwner';
import { gptService } from '@/services/api';
import { router } from 'expo-router';
import { styles } from '../../style/FloatingMicButton.styles'; // ✅ 스타일 분리
import { useRoute } from '../../model/RouteContext';
import { fetchBusArrivalTime } from '../transportTime/fetchBusArrivalTime';
import { fetchSubwayArrivalTime } from '../transportTime/fetchSubwayArrivalTime';
import { useLocation } from '@/contexts/LocationContext';


export default function FloatingMicButton() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognizedTextRef = useRef('');
  const { routeData } = useRoute();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1000, useNativeDriver: false }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isSpeaking]);

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

  useSpeechRecognitionEvent('result', (event) => {
    const finalText = event.results?.[0]?.transcript;
    if (finalText) {
      recognizedTextRef.current = finalText;
      console.log('✅ 인식된 텍스트:', finalText);
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
          console.log('✅ TTS 완료, GPT 전송');
          sendToBackend(finalText);
        },
        onError: (err) => {
          console.error('❌ TTS 오류:', err);
          setIsSpeaking(false);
        },
      });
    } else {
      console.log('⚠️ 인식된 텍스트 없음');
      setIsSpeaking(false);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('❌ 음성 인식 에러:', event.error);
    setIsListening(false);
    setIsSpeaking(false);
  });

  const sendToBackend = async (text: string) => {
    try {
      const json = await gptService.askQuestion(text);
      const { status, intent, responseMessage, data } = json;

//       const { currentLegIndex } = useLocation(); // 🔥 현재 하이라이트된 카드 index
// const validLegIndex = currentLegIndex < 0 ? 0 : currentLegIndex;
// const currentGuide = routeData?.guides?.[validLegIndex];

      if (!responseMessage) {
        setIsSpeaking(false);
        return;
      }

      Speech.speak(responseMessage, {
        language: 'ko-KR',
        onDone: async () => {
          if (status === 'API_REQUIRED') {
            if (intent === 'real_time_bus_arrival' && routeData && data?.bus_number) {
  const targetBusNumber = data.bus_number;

  const busGuide = routeData.guides.find(
    (g) => g.transportType === 'BUS' && g.busNumber === targetBusNumber
  );

  if (busGuide?.startLocation?.name) {
    const stopName = busGuide.startLocation.name;
    const arrival = await fetchBusArrivalTime(stopName, targetBusNumber);

    let info = '도착 정보를 찾을 수 없습니다.';
    if (arrival === '운행종료') info = '운행이 종료된 버스입니다.';
    else if (arrival === '출발대기 중') info = '출발 대기 중입니다.';
    else if (typeof arrival === 'number') info = arrival === 0 ? '곧 도착합니다.' : `${arrival}분 후 도착 예정입니다.`;

    Speech.speak(`${targetBusNumber}번 버스, ${stopName} 정류장 기준 ${info}`, {
      language: 'ko-KR',
      onDone: () => setIsSpeaking(false),
    });
    return;
  } else {
    Speech.speak(`${targetBusNumber}번 버스의 정류장 정보를 찾을 수 없습니다.`, {
      language: 'ko-KR',
      onDone: () => setIsSpeaking(false),
    });
    return;
  }
}


            else if (intent === 'real_time_subway_arrival' && routeData && data?.subway_line) {
  const targetLine = data.subway_line;

  const subwayGuide = routeData.guides.find(
    (g) => g.transportType === 'SUBWAY' && g.routeName === targetLine
  );

  if (subwayGuide?.startLocation?.name && subwayGuide?.routeName) {
    const stationName = subwayGuide.startLocation.name;
    const lineName = subwayGuide.routeName;

    const arrivalMin = await fetchSubwayArrivalTime(stationName, lineName);

    const info = typeof arrivalMin === 'number'
      ? (arrivalMin === 0 ? '곧 도착합니다.' : `${arrivalMin}분 후 도착 예정입니다.`)
      : '도착 정보를 찾을 수 없습니다.';

    Speech.speak(`${lineName}, ${stationName}역 기준 ${info}`, {
      language: 'ko-KR',
      onDone: () => setIsSpeaking(false),
    });
    return;
  } else {
    Speech.speak(`${targetLine} 지하철 노선의 역 정보를 찾을 수 없습니다.`, {
      language: 'ko-KR',
      onDone: () => setIsSpeaking(false),
    });
    return;
  }
}
// else if (intent === 'current_location' && currentGuide) {
//             const guidanceText = currentGuide.guidance || '안내 문구가 없습니다';
//             Speech.speak(guidanceText, {
//               language: 'ko-KR',
//               onDone: () => setIsSpeaking(false),
//             });
//             return;
//           }

            else if (['extract_route', 'research_route'].includes(intent)) {
              Speech.speak('홈으로 이동할게요. 목적지를 다시 검색해주세요.', {
                language: 'ko-KR',
                onDone: () => {
                  setIsSpeaking(false);
                  router.replace('/(tabs)');
                },
              });
              return;
            }
          }

          setIsSpeaking(false);
        },
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.error('❌ GPT 통신 오류:', err);
      setIsSpeaking(false);
    }
  };

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
        <Ionicons name={isSpeaking ? 'stop' : 'mic'} size={28} color="white" />
      </TouchableOpacity>
    </Animated.View>
  </View>
);

}
