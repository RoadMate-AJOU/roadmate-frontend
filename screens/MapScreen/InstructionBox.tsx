// screens/MapScreen/InstructionBox.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useLocation } from '../../contexts/LocationContext';

export default function InstructionBox() {
  const [currentInstruction, setCurrentInstruction] = useState('🚶‍♂️ 목적지까지 안내 중');
  const { currentLegIndex } = useLocation();
  const params = useLocalSearchParams();
  const lastLegIndex = useRef(-1);
  const hasApiData = useRef(false);
  const emojiGuides = useRef([]);

  // API 데이터가 있으면 사용, 없으면 기본 메시지
  useEffect(() => {
    if (params.routeData && !hasApiData.current) {
      try {
        const routeData = JSON.parse(params.routeData);
        parseEmojiGuides(routeData);
        hasApiData.current = true;
        updateInstructionFromApi(0);
        console.log('📝 InstructionBox: API 데이터로 초기화 완료');
      } catch (error) {
        console.warn('InstructionBox: API 데이터 파싱 실패', error);
        setCurrentInstruction('🚶‍♂️ 목적지까지 안내 중입니다');
        hasApiData.current = false;
      }
    } else if (!params.routeData && !hasApiData.current) {
      hasApiData.current = false;
      updateInstructionFromSample(0);
      console.log('📝 InstructionBox: 샘플 데이터로 초기화 완료');
    }
  }, [params.routeData]);

  // currentLegIndex가 변경될 때만 업데이트
  useEffect(() => {
    if (currentLegIndex === lastLegIndex.current) return;

    lastLegIndex.current = currentLegIndex;

    if (hasApiData.current) {
      updateInstructionFromApi(currentLegIndex);
    } else {
      updateInstructionFromSample(currentLegIndex);
    }
  }, [currentLegIndex]);

  // 이모티콘 가이드들만 추출해서 저장
  const parseEmojiGuides = (routeData) => {
    const guides = [];

    routeData.guides?.forEach((guide, index) => {
      if (guide.guidance && (
        guide.guidance.includes('🚶') ||
        guide.guidance.includes('🚌') ||
        guide.guidance.includes('🚇') ||
        guide.guidance.includes('🚄') ||
        guide.guidance.includes('🚐')
      )) {
        guides.push({
          index: guides.length,
          originalIndex: index,
          guidance: guide.guidance,
          transportType: guide.transportType,
          busNumber: guide.busNumber,
          routeName: guide.routeName
        });
      }
    });

    emojiGuides.current = guides;
    console.log(`📝 이모티콘 가이드 ${guides.length}개 파싱 완료`);
  };

  const updateInstructionFromApi = (legIndex) => {
    if (emojiGuides.current.length > 0) {
      const currentGuide = emojiGuides.current[legIndex] || emojiGuides.current[0];
      const instruction = formatSimpleInstruction(currentGuide);
      setCurrentInstruction(instruction);
    } else {
      setCurrentInstruction('🚶‍♂️ 목적지로 이동 중');
    }
  };

  const updateInstructionFromSample = (legIndex) => {
    const sampleInstructions = [
      '🚶‍♂️ 시흥초등학교로 이동',
      '🚌 707-1번 버스 승차',
      '🚶‍♂️ 중앙시장으로 이동',
      '🚌 13-4번 버스 승차',
      '🚶‍♂️ 목적지로 이동'
    ];

    const instruction = sampleInstructions[legIndex] || sampleInstructions[0];
    setCurrentInstruction(instruction);
  };

  const formatSimpleInstruction = (guide) => {
    if (!guide) return '🚶‍♂️ 이동 중';

    const { transportType, busNumber, routeName, guidance } = guide;

    // 이모티콘이 포함된 간단한 안내만 추출
    if (guidance.includes('🚶')) {
      // 도보 안내에서 목적지만 추출
      if (guidance.includes('까지')) {
        const destination = guidance.split('까지')[0].replace('🚶', '').trim();
        return `🚶‍♂️ ${destination}으로 이동`;
      }
      return '🚶‍♂️ 도보 이동 중';
    }

    if (guidance.includes('🚌')) {
      const busInfo = busNumber || routeName || '버스';
      return `🚌 ${busInfo} 탑승`;
    }

    if (guidance.includes('🚇') || guidance.includes('🚄')) {
      const subwayInfo = routeName || '지하철';
      return `🚇 ${subwayInfo} 탑승`;
    }

    return '🚶‍♂️ 이동 중';
  };

  return;
}

const styles = StyleSheet.create({
  instructionBox: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: '#FFF1E6',
    borderRadius: 12,
    padding: 12,
  },
  instructionText: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
  },
});