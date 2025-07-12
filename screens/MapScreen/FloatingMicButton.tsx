import React, { useRef, useState, useEffect } from 'react';
import { Animated, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';

export default function FloatingMicButton() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

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

  /*
  const sendToBackend = async (text: string) => {
    try {
      const res = await fetch('http://223.130.135.190:8080/api/poi/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'user-001',
          text: text,
        }),
      });

      const json = await res.json();
      const { status, intent, responseMessage } = json;

      if (status === 'COMPLETE') {
        Speech.speak(responseMessage, {
          language: 'ko-KR',
          onDone: () => setIsSpeaking(false),
        });
      } else if (status === 'API_REQUIRED') {
        if (intent === 'extract_route' || intent === 'research_route') {
          Speech.speak(responseMessage, {
            language: 'ko-KR',
            onDone: () => {
              setIsSpeaking(false);
              router.push('/home');
            },
          });
        } else if (
          intent === 'real_time_bus_arrival' ||
          intent === 'real_time_subway_arrival'
        ) {
          Speech.speak('500번 버스 도착 정보를 확인해볼게요.', {
            language: 'ko-KR',
            onDone: () => setIsSpeaking(false),
          });
        } else {
          setIsSpeaking(false);
        }
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('❌ 백엔드 통신 오류:', err);
      setIsSpeaking(false);
    }
  };
  */

  const handleMicPress = () => {
    // 마이크 기능 일시 비활성화
    setIsSpeaking((prev) => !prev);
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
          <Ionicons
            name={isSpeaking ? 'stop' : 'mic'}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.borderRing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
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
});
