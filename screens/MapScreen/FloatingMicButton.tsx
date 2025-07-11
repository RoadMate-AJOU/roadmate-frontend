// screens/MapScreen/FloatingMicButton.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Animated, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FloatingMicButton() {
  const [isRecording, setIsRecording] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // 녹음 중일 때 펄스 애니메이션
  useEffect(() => {
    if (isRecording) {
      // 펄스 효과
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

      // 글로우 효과
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
  }, [isRecording]);

  const handleMicPress = () => {
    setIsRecording(!isRecording);

    if (!isRecording) {
      console.log('🎤 음성 인식 시작');
      // TODO: 음성 인식 시작 로직
    } else {
      console.log('🛑 음성 인식 중지');
      // TODO: 음성 인식 중지 로직
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
      {/* 글로우 효과 (녹음 중일 때만) */}
      {isRecording && (
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

      {/* 메인 마이크 버튼 */}
      <Animated.View
        style={[
          styles.micButton,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: isRecording ? '#FF3B30' : '#FF5900',
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleMicPress}
          style={styles.touchArea}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={28} // 아이콘 크기도 조정
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* 버튼 주변 원형 테두리 (항상 표시) */}
      <View style={styles.borderRing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20, // 상단으로 이동
    left: 20, // 왼쪽으로 이동
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // 다른 요소들 위에 표시
  },
  micButton: {
    width: 60, // 조금 작게 조정
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