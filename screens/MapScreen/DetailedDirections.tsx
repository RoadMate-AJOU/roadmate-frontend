// screens/MapScreen/DetailedDirections.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useLocation } from '../../contexts/LocationContext';

export default function DetailedDirections() {
  const [allDetailedSteps, setAllDetailedSteps] = useState([]);
  const [currentStepDetails, setCurrentStepDetails] = useState([]);
  const { currentLegIndex } = useLocation();
  const params = useLocalSearchParams();
  const lastLegIndex = useRef(-1);

  useEffect(() => {
    if (params.routeData) {
      parseAllDetailsFromApi();
    } else {
      const sampleSteps = getAllSampleDetailedSteps();
      setAllDetailedSteps(sampleSteps);
      updateCurrentStepDetails(sampleSteps, 0);
    }
  }, [params.routeData]);

  // currentLegIndex 변경 시에만 현재 구간 세부사항 업데이트
  useEffect(() => {
    if (currentLegIndex === lastLegIndex.current) return;

    lastLegIndex.current = currentLegIndex;
    updateCurrentStepDetails(allDetailedSteps, currentLegIndex);
  }, [currentLegIndex, allDetailedSteps]);

  // 현재 이동수단에 해당하는 세부 안내만 추출
  const updateCurrentStepDetails = (allSteps, legIndex) => {
    if (allSteps.length === 0) return;

    // 현재 이동수단(legIndex)에 해당하는 세부 안내들만 필터링
    const currentDetails = allSteps.filter(step => step.parentLegIndex === legIndex);

    // 현재 진행 중인 첫 번째 스텝을 current로 설정
    const updatedDetails = currentDetails.map((step, index) => ({
      ...step,
      current: index === 0 // 첫 번째 세부 안내가 현재 진행 중
    }));

    setCurrentStepDetails(updatedDetails);

    console.log(`📝 현재 이동수단 ${legIndex}의 세부 안내 ${updatedDetails.length}개 표시`);
  };

  // API 데이터에서 모든 세부 안내 추출 (이동수단별로 그룹화)
  const parseAllDetailsFromApi = () => {
    try {
      const routeData = JSON.parse(params.routeData);
      const allSteps = [];
      let currentEmojiIndex = 0;

      // 이모티콘 가이드들의 인덱스 찾기
      const emojiGuideIndices = [];
      routeData.guides?.forEach((guide, index) => {
        if (guide.guidance && (
          guide.guidance.includes('🚶') ||
          guide.guidance.includes('🚌') ||
          guide.guidance.includes('🚇') ||
          guide.guidance.includes('🚄') ||
          guide.guidance.includes('🚐')
        )) {
          emojiGuideIndices.push(index);
        }
      });

      routeData.guides?.forEach((guide, index) => {
        // 이모티콘이 포함되지 않은 세부 안내들만 추출
        if (guide.guidance &&
            !guide.guidance.includes('🚶') &&
            !guide.guidance.includes('🚌') &&
            !guide.guidance.includes('🚇') &&
            !guide.guidance.includes('🚄') &&
            !guide.guidance.includes('🚐')) {

          // 이 세부 안내가 어느 이모티콘 가이드에 속하는지 찾기
          let parentLegIndex = 0;
          for (let i = 0; i < emojiGuideIndices.length; i++) {
            if (index < emojiGuideIndices[i]) {
              parentLegIndex = i === 0 ? 0 : i - 1;
              break;
            } else if (i === emojiGuideIndices.length - 1) {
              parentLegIndex = i;
              break;
            }
          }

          // 거리 정보 포맷팅
          let distanceText = '';
          if (guide.distance && guide.distance > 0) {
            distanceText = guide.distance >= 1000
              ? `${(guide.distance / 1000).toFixed(1)}km`
              : `${guide.distance}m`;
          }

          // 안내 텍스트 정리
          const cleanedInstruction = cleanInstruction(guide.guidance);

          if (cleanedInstruction) {
            allSteps.push({
              index: index,
              instruction: cleanedInstruction,
              distance: distanceText,
              routeName: guide.routeName || '',
              transportType: guide.transportType || '',
              parentLegIndex: parentLegIndex, // 어느 이동수단에 속하는지
              current: false
            });
          }
        }
      });

      setAllDetailedSteps(allSteps);
      updateCurrentStepDetails(allSteps, currentLegIndex);
      console.log(`📝 전체 세부 경로 안내 ${allSteps.length}개 파싱 완료`);
    } catch (error) {
      console.warn('DetailedDirections: API 파싱 실패', error);
      const sampleSteps = getAllSampleDetailedSteps();
      setAllDetailedSteps(sampleSteps);
      updateCurrentStepDetails(sampleSteps, currentLegIndex);
    }
  };

  // 안내 텍스트에서 콜론(:) 앞의 모든 접두사 제거
  const cleanInstruction = (instruction) => {
    if (!instruction) return '';

    // 콜론(:) 앞의 모든 텍스트 제거 (예: "월드컵로:", "보행자도로:" 등)
    if (instruction.includes(':')) {
      return instruction.split(':').slice(1).join(':').trim();
    }

    return instruction.trim();
  };

  // 샘플 세부 안내 (이동수단별로 그룹화)
  const getAllSampleDetailedSteps = () => {
    return [
      // 첫 번째 도보 (parentLegIndex: 0)
      { index: 0, instruction: '남쪽으로 34m 직진', distance: '34m', parentLegIndex: 0, current: false },
      { index: 1, instruction: '우회전 후 157m 직진', distance: '157m', parentLegIndex: 0, current: false },
      { index: 2, instruction: '좌회전 후 월드컵로 102m', distance: '102m', parentLegIndex: 0, current: false },
      { index: 3, instruction: '횡단보도 이용', distance: '15m', parentLegIndex: 0, current: false },

      // 첫 번째 버스 (parentLegIndex: 1)
      { index: 4, instruction: '707-1번 버스 승차', distance: '', parentLegIndex: 1, current: false },
      { index: 5, instruction: '시청역 방면으로 운행', distance: '2.1km', parentLegIndex: 1, current: false },
      { index: 6, instruction: '중앙시장 정류장 하차', distance: '', parentLegIndex: 1, current: false },

      // 두 번째 도보 (parentLegIndex: 2)
      { index: 7, instruction: '정류장에서 북쪽으로 이동', distance: '48m', parentLegIndex: 2, current: false },
      { index: 8, instruction: '횡단보도 건너기', distance: '12m', parentLegIndex: 2, current: false },

      // 두 번째 버스 (parentLegIndex: 3)
      { index: 9, instruction: '13-4번 버스 승차', distance: '', parentLegIndex: 3, current: false },
      { index: 10, instruction: '강남역 방면으로 운행', distance: '3.2km', parentLegIndex: 3, current: false },
      { index: 11, instruction: '목적지 근처 정류장 하차', distance: '', parentLegIndex: 3, current: false },

      // 마지막 도보 (parentLegIndex: 4)
      { index: 12, instruction: '정류장에서 동쪽으로 이동', distance: '25m', parentLegIndex: 4, current: false },
      { index: 13, instruction: '목적지 건물 도착', distance: '15m', parentLegIndex: 4, current: false }
    ];
  };

  if (currentStepDetails.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>이동 준비 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>지금 우리는</Text>
      <ScrollView
        style={styles.stepsContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentStepDetails.map((step, index) => (
          <View
            key={step.index}
            style={[
              styles.stepItem,
              step.current && styles.currentStepItem
            ]}
          >
            <View style={[
              styles.stepNumber,
              step.current && styles.currentStepNumber
            ]}>
              <Text style={[
                styles.stepNumberText,
                step.current && styles.currentStepNumberText
              ]}>
                {index + 1}
              </Text>
            </View>

            <View style={styles.stepContent}>
              <Text style={[
                styles.stepInstruction,
                step.current && styles.currentStepInstruction
              ]}>
                {step.instruction}
              </Text>
              {step.distance && (
                <Text style={[
                  styles.stepDistance,
                  step.current && styles.currentStepDistance
                ]}>
                  {step.distance}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    height: 310,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepsContainer: {
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  currentStepItem: {
    backgroundColor: '#FFF1E6',
    borderLeftColor: '#FF6A00',
    shadowColor: '#FF6A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  currentStepNumber: {
    backgroundColor: '#FF6A00',
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  currentStepNumberText: {
    color: '#FFF',
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 20,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 25,
  },
  currentStepInstruction: {
    color: '#FF6A00',
    fontWeight: '700',
  },
  stepDistance: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 2,
  },
  currentStepDistance: {
    color: '#FF8533',
    fontWeight: '500',
  },
});