import React, { useState } from 'react';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { getVoiceOwner, setVoiceOwner, clearVoiceOwner } from '@/hooks/VoiceOwner';
import { useSessionStore } from '@/contexts/sessionStore';
import { gptService } from '@/services/api';
import { fetchBusArrivalTime } from '../transportTime/fetchBusArrivalTime';
import { fetchSubwayArrivalTime } from '../transportTime/fetchSubwayArrivalTime';
import { useRoute } from '../../model/RouteContext';
import { router } from 'expo-router';
import { Alert } from 'react-native';


const ENABLE_VOICE = true;

export function useVoiceViewModel() {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const { sessionId } = useSessionStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
    const { routeData } = useRoute();

    


  const startRecognizing = async () => {
    if (!ENABLE_VOICE) return;

    try {
      setVoiceOwner('mic');
      setRecognizedText('');
      await ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        continuous: true,
        interimResults: true,
      });
      setIsListening(true);
setIsSpeaking(true);
    } catch (error) {
      console.error('❌ 음성 인식 시작 오류:', error);
    }
  };

  const stopRecognizing = async () => {
    if (!ENABLE_VOICE) return;

    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    } catch (e) { }
  };

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript;
    if (transcript) setRecognizedText(transcript);
  });

  // 인식 종료되면 → GPT에 보내고 → 결과 읽어줌
  // 🧠 음성 인식 종료 이벤트: GPT + 응답 TTS
useSpeechRecognitionEvent("end", async () => {
  if (getVoiceOwner() !== 'mic') return;

  setIsListening(false);
  clearVoiceOwner();

  const finalText = recognizedText.trim();
  if (!finalText) {
    Alert.alert('알림', '음성이 인식되지 않았습니다.');
    setIsSpeaking(false); // ⬅️ 종료
    return;
  }

  // 🔊 사용자 말 다시 읽기 → 그 후 GPT 요청
  try {
    let gptTriggered = false;

    Speech.speak(finalText, {
      language: 'ko-KR',
      onDone: () => {
        if (!gptTriggered) {
          gptTriggered = true;
          sendToBackend(finalText); // → 내부에서 다시 speak + isSpeaking=false 처리됨
        }
      },
      onError: () => {
        console.error('❌ 음성 speak 오류');
        setIsSpeaking(false);
      },
    });

    // ⏱️ fallback 처리
    setTimeout(() => {
      if (!gptTriggered) {
        console.warn('⏱️ onDone fallback으로 GPT 전송 실행');
        sendToBackend(finalText);
      }
    }, 3000);
  } catch (err) {
    console.error('❌ GPT 처리 오류:', err);
    Speech.speak('서버 응답 중 오류가 발생했습니다.', { language: 'ko-KR' });
    setIsSpeaking(false);
  }
});


  const sendToBackend = async (text: string) => {
    try {
      const json = await gptService.askQuestion({ sessionId, text });
      const { status, intent, responseMessage } = json;

      if (!ENABLE_VOICE) return;

      if (responseMessage) {
        Speech.speak(responseMessage, {
          language: 'ko-KR',
          onDone: () => {
            (async () => {
              if (status === 'API_REQUIRED') {
                if (intent === 'real_time_bus_arrival' && routeData) {
  const busGuide = routeData.guides.find(
    (g) => g.transportType === 'BUS'
  );

  if (busGuide && busGuide.startLocation?.name && busGuide.busNumber) {
    const stopName = busGuide.startLocation.name;
    const busNumber = busGuide.busNumber;

    const arrival = await fetchBusArrivalTime(stopName, busNumber);
    let arrivalText = '도착 정보를 찾을 수 없습니다.';
    if (arrival === '운행종료') arrivalText = '운행이 종료된 버스입니다.';
    else if (arrival === '출발대기 중') arrivalText = '출발 대기 중입니다.';
    else if (typeof arrival === 'number') {
      arrivalText = arrival === 0 ? '곧 도착합니다.' : `${arrival}분 후 도착 예정입니다.`;
    }

    Speech.speak(`${busNumber}번 버스, ${stopName} 정류장 기준 ${arrivalText}`, {
      language: 'ko-KR',
      onDone: () => setIsSpeaking(false),
    });
  } else {
    Speech.speak('버스 정류장 정보를 찾을 수 없습니다.', {
      language: 'ko-KR',
      onDone: () => setIsSpeaking(false),
    });
  }
}
 else if (intent === 'real_time_subway_arrival' && routeData) {
  const subwayGuide = routeData.guides.find(
    (g) => g.transportType === 'SUBWAY'
  );

  if (subwayGuide && subwayGuide.startLocation?.name && subwayGuide.routeName) {
    const stationName = subwayGuide.startLocation.name;
    const lineName = subwayGuide.routeName;

    const arrivalMin = await fetchSubwayArrivalTime(stationName, lineName);

    let arrivalText = '도착 정보를 찾을 수 없습니다.';
    if (typeof arrivalMin === 'number') {
      arrivalText = arrivalMin === 0 ? '곧 도착합니다.' : `${arrivalMin}분 후 도착 예정입니다.`;
    }

    Speech.speak(`${lineName}, ${stationName}역 기준 ${arrivalText}`, {
      language: 'ko-KR',
      onDone: () => setIsSpeaking(false),
    });
    return;
  }
}
 else if (['extract_route', 'research_route'].includes(intent)) {
                  Speech.speak('홈으로 이동할게요. 목적지를 다시 검색해주세요.', {
                    language: 'ko-KR',
                    onDone: () => {
                      setIsSpeaking(false);
                      router.replace('/(tabs)');
                    },
                  });
                } else {
                  setIsSpeaking(false);
                }
              } else {
                setIsSpeaking(false);
              }
            })();
          },
          onError: () => setIsSpeaking(false),
        });
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('❌ gptService 오류:', err);
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
  isListening,
  handleMicPress: isListening ? stopRecognizing : startRecognizing,
  };
}
