// hooks/useVoiceViewModel.ts
import { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { gptService } from '@/services/api';
import { setVoiceOwner, getVoiceOwner, clearVoiceOwner } from '@/hooks/VoiceOwner';
// import { useSpeechRecognitionEvent, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

export function useVoiceViewModel(ENABLE_VOICE = false) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [debugIntent, setDebugIntent] = useState('');
    const recognizedTextRef = useRef('');
    const router = useRouter();

    const startListening = async () => {
        if (!ENABLE_VOICE) return;

        setVoiceOwner('mic');
        await ExpoSpeechRecognitionModule.start({
            lang: 'ko-KR',
            continuous: false,
            interimResults: true,
        });
        setIsListening(true);
        setIsSpeaking(true);
    };

    const stopListening = async () => {
        await ExpoSpeechRecognitionModule.stop();
        setIsListening(false);
    };

    const sendToBackend = async (sessionId: string, text: string) => {
        const res = await gptService.askQuestion({ sessionId, text });
        const { intent, status, responseMessage } = res;
        setDebugIntent(intent);

        if (!responseMessage) return setIsSpeaking(false);

        Speech.speak(responseMessage, {
            language: 'ko-KR',
            onDone: () => {
                if (status === 'API_REQUIRED') {
                    if (['real_time_bus_arrival', 'real_time_subway_arrival'].includes(intent)) {
                        Speech.speak('9분 남았습니다.', {
                            language: 'ko-KR',
                            onDone: () => setIsSpeaking(false),
                        });
                    } else if (['extract_route', 'research_route'].includes(intent)) {
                        Speech.speak('홈으로 이동할게요. 목적지를 다시 검색해주세요.', {
                            language: 'ko-KR',
                            onDone: () => {
                                setIsSpeaking(false);
                                router.replace('/(tabs)');
                            },
                        });
                    } else setIsSpeaking(false);
                } else setIsSpeaking(false);
            },
            onError: () => setIsSpeaking(false),
        });
    };

    const onResult = (event: any) => {
        const finalText = event.results?.[0]?.transcript;
        if (finalText) recognizedTextRef.current = finalText;
    };

    const onEnd = () => {
        if (getVoiceOwner() !== 'mic') return;
        clearVoiceOwner();
        setIsListening(false);

        const finalText = recognizedTextRef.current;
        if (finalText) {
            Speech.speak(finalText, {
                language: 'ko-KR',
                onDone: () => sendToBackend(finalText, finalText),
            });
        } else {
            setIsSpeaking(false);
        }
    };

    const onError = () => {
        setIsListening(false);
        setIsSpeaking(false);
    };

    return {
        isSpeaking,
        isListening,
        startListening,
        stopListening,
        handleMicPress: async () => {
            if (!ENABLE_VOICE) return;
            isListening ? await stopListening() : await startListening();
        },
        debugIntent,
        onResult,
        onEnd,
        onError,
    };
}
