import { useState, useRef } from 'react';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { useSpeechRecognitionEvent, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { setVoiceOwner, getVoiceOwner, clearVoiceOwner } from '@/hooks/VoiceOwner';
import { gptService } from '@/services/api';
import { useSessionStore } from '@/contexts/sessionStore';
import { useRoute } from '../../model/RouteContext';
import { fetchBusArrivalTime } from '../transportTime/fetchBusArrivalTime';
import { fetchSubwayArrivalTime } from '../transportTime/fetchSubwayArrivalTime';

const ENABLE_VOICE = true;

export function useVoiceViewModel() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognizedTextRef = useRef('');
  const router = useRouter();
  const { sessionId } = useSessionStore();
  const { routeData } = useRoute();

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

  const handleMicPress = async () => {
  if (!ENABLE_VOICE) {
    console.warn('⚠️ 음성 인식이 비활성화되어 있습니다.');
    return;
  }

  const currentOwner = getVoiceOwner();
  if (currentOwner && currentOwner !== 'mic') {
    console.warn(`⚠️ 현재 '${currentOwner}'이(가) 음성 사용 중이므로 마이크 시작 차단`);
    return;
  }

  if (isListening) {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (err) {
      console.error('❌ 음성 인식 종료 오류:', err);
    }
  } else {
    try {
      setVoiceOwner('mic'); // ⬅️ 이 전에 검사함
      recognizedTextRef.current = '';
      await ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        continuous: true,
        interimResults: true,
      });
      setIsListening(true);
      setIsSpeaking(true);
    } catch (err) {
      console.error('❌ 음성 인식 시작 오류:', err);
    }
  }
};


  // ✅ 최종 인식 결과만 처리
  useSpeechRecognitionEvent("result", (event) => {
    if (!ENABLE_VOICE) return;
    const transcript = event.results?.[0]?.transcript;
    if (transcript) {
      recognizedTextRef.current = transcript;
    }
  });

  useSpeechRecognitionEvent("end", () => {
  if (!ENABLE_VOICE) return;
  if (getVoiceOwner() !== 'mic') return;

  setIsListening(false);
  clearVoiceOwner();

  const finalText = recognizedTextRef.current;
  if (finalText.trim()) {
    console.log('🧠 최종 인식 텍스트:', finalText);

    let gptTriggered = false; // ✅ 중복 방지용

    Speech.speak(finalText, {
      language: 'ko-KR',
      onDone: () => {
        if (!gptTriggered) {
          console.log('✅ TTS 완료, GPT 전송');
          gptTriggered = true;
          sendToBackend(finalText);
        }
      },
      onError: (err) => {
        console.error('❌ TTS 오류:', err);
        setIsSpeaking(false);
      },
    });

    // ✅ fallback: onDone이 호출되지 않는 경우
    setTimeout(() => {
      if (!gptTriggered) {
        console.warn('⏱️ TTS onDone 누락 → fallback 실행');
        sendToBackend(finalText);
      }
    }, 3000); // 말하는 시간보다 충분히 긴 여유 시간
  }
});


  useSpeechRecognitionEvent('error', (event) => {
    console.error('❌ 음성 인식 에러:', event.error);
    setIsListening(false);
    setIsSpeaking(false);
  });

  return {
    isSpeaking,
    isListening,
    handleMicPress,
  };
}
