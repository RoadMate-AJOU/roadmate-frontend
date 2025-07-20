// service/mic/FloatingMicViewModel.tsx
import { useState, useRef } from 'react';
import * as Speech from 'expo-speech';
import { router, useRouter } from 'expo-router';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
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
      const json = await gptService.askQuestion({
        sessionId,
        text,
      });

      const { status, intent, responseMessage } = json;

      if (!ENABLE_VOICE) return;

      if (responseMessage) {
        Speech.speak(responseMessage, {
              language: 'ko-KR',
              onDone: () => {
                (async () => {
                  if (status === 'API_REQUIRED') {
                    if (intent === 'real_time_bus_arrival' && data?.bus_number && routeData) {
                      const busNumber = data.bus_number;
                      const busGuide = routeData.guides.find(
                        (g) => g.transportType === 'BUS' && g.busNumber?.replace(/\s/g, '') === busNumber.replace(/\s/g, '')
                      );
                      if (busGuide && busGuide.startLocation?.name) {
                        const stopName = busGuide.startLocation.name;
                        const arrival = await fetchBusArrivalTime(stopName, busNumber);
        
                        let arrivalText = '도착 정보를 찾을 수 없습니다.';
                        if (arrival === '운행종료') arrivalText = '운행이 종료된 버스입니다.';
                        else if (arrival === '출발대기 중') arrivalText = '출발 대기 중입니다.';
                        else if (typeof arrival === 'number') {
                          arrivalText = arrival === 0 ? '곧 도착합니다.' : `${arrival}분 후 도착 예정입니다.`;
                        } else if (typeof arrival === 'string') {
                          arrivalText = arrival;
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
                    } else if (intent === 'real_time_subway_arrival' && data?.subway_line && routeData) {
                      const lineName = data.subway_line;
                      const subwayGuide = routeData.guides.find(
                        (g) => g.transportType === 'SUBWAY' && g.routeName?.replace(/\s/g, '') === lineName.replace(/\s/g, '')
                      );
        
                      if (subwayGuide && subwayGuide.startLocation?.name) {
                        const stationName = subwayGuide.startLocation.name;
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
                    } else if (['extract_route', 'research_route'].includes(intent)) {
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
      console.log('✅ 최종 인식:', finalText);
    }
  });

  useSpeechRecognitionEvent('end', () => {
  if (getVoiceOwner() !== 'mic') return;
  setIsListening(false);
  clearVoiceOwner();

  const finalText = recognizedTextRef.current;
  if (finalText) {
    console.log('🧠 인식된 텍스트:', finalText);

    // ✅ 백엔드로 보낸 여부 추적
    let hasSentToBackend = false;

    // ✅ 인식된 음성을 먼저 TTS로 읽기
    Speech.speak(finalText, {
      language: 'ko-KR',
      onDone: () => {
        if (!hasSentToBackend) {
          console.log('✅ TTS 완료, 백엔드 전송 시작');
          hasSentToBackend = true;
          sendToBackend(finalText); // ✅ 읽은 후 백엔드 전송
        }
      },
      onError: (err) => {
        console.error('❌ TTS 오류:', err);
        setIsSpeaking(false);
      },
    });

    // ✅ Fallback: onDone이 불리지 않을 경우에도 실행되도록
    setTimeout(() => {
      if (!hasSentToBackend) {
        console.warn('⏱️ TTS onDone 누락 → fallback으로 백엔드 전송');
        hasSentToBackend = true;
        sendToBackend(finalText);
      }
    }, 4000); // 3초보다 약간 여유 있게
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

  return {
    isSpeaking,
    isListening,
    handleMicPress,
  };
}
