// ✅ DetailedDirections.tsx (스크롤 제거 및 maxHeight 삭제 버전)

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocation } from '../../contexts/LocationContext';

export default function DetailedDirections({ routeData }: { routeData?: any }) {
  const [allDetailedSteps, setAllDetailedSteps] = useState([]);
  const [currentStepDetails, setCurrentStepDetails] = useState([]);
  const { currentLegIndex } = useLocation();
  const lastLegIndex = useRef(-2);

  const validLegIndex = currentLegIndex < 0 ? 0 : currentLegIndex;

  useEffect(() => {
    if (routeData?.guides) {
      console.log('📦 [DetailedDirections] routeData 전달됨');
      parseStepsFromGuides(routeData.guides);
    } else {
      console.warn('⚠️ [DetailedDirections] routeData 없음. 샘플 데이터로 대체');
      const sampleSteps = getAllSampleDetailedSteps();
      setAllDetailedSteps(sampleSteps);
      updateCurrentStepDetails(sampleSteps, validLegIndex);
    }
  }, [routeData]);

  useEffect(() => {
    if (validLegIndex === lastLegIndex.current) return;
    lastLegIndex.current = validLegIndex;
    updateCurrentStepDetails(allDetailedSteps, validLegIndex);
  }, [validLegIndex, allDetailedSteps]);

  const parseStepsFromGuides = (guides: any[]) => {
    try {
      const parsedSteps = guides.flatMap((guide, legIndex) => {
        if (guide.transportType !== 'WALK') return [];

        if (!Array.isArray(guide.steps)) {
          return [
            {
              index: 0,
              instruction: cleanInstruction(guide.guidance || '도보 안내'),
              distance: formatDistance(guide.distance),
              parentLegIndex: legIndex,
              current: false,
            },
          ];
        }

        return guide.steps.map((step: any, stepIndex: number) => ({
          index: stepIndex,
          instruction: cleanInstruction(step.description),
          distance: formatDistance(step.distance),
          parentLegIndex: legIndex,
          current: false,
        }));
      });

      console.log('✅ [DetailedDirections] WALK 단계 추출 완료:', parsedSteps);
      setAllDetailedSteps(parsedSteps);
      updateCurrentStepDetails(parsedSteps, validLegIndex);
    } catch (error) {
      console.warn('❌ [DetailedDirections] WALK 단계 파싱 실패:', error);
    }
  };

  const updateCurrentStepDetails = (allSteps, legIndex) => {
    if (allSteps.length === 0) return;
    const currentDetails = allSteps.filter(step => step.parentLegIndex === legIndex);
    const updatedDetails = currentDetails.map((step, index) => ({
      ...step,
      current: index === 0,
    }));
    setCurrentStepDetails(updatedDetails);
  };

  const cleanInstruction = (instruction: string) => {
    if (!instruction) return '';
    return instruction.includes(':')
      ? instruction.split(':').slice(1).join(':').trim()
      : instruction.trim();
  };

  const formatDistance = (distance: number) => {
    if (!distance || distance <= 0) return '';
    return distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance}m`;
  };

  const getAllSampleDetailedSteps = () => [
    { index: 0, instruction: '남쪽으로 34m 직진', distance: '34m', parentLegIndex: 0, current: false },
    { index: 1, instruction: '우회전 후 157m 직진', distance: '157m', parentLegIndex: 0, current: false },
    { index: 2, instruction: '좌회전 후 월드컵로 102m', distance: '102m', parentLegIndex: 0, current: false },
    { index: 3, instruction: '횡단보도 건넌 후 80m 직진', distance: '80m', parentLegIndex: 0, current: false },
    { index: 4, instruction: '지하철역 진입', distance: '', parentLegIndex: 0, current: false },
  ];

  if (currentStepDetails.length === 0) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.title}>이동 준비 중... (데이터 없음)</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>지금 우리는</Text>

      {currentStepDetails.map((step, index) => (
        <View key={step.index} style={[styles.stepItem, step.current && styles.currentStepItem]}>
          <View style={[styles.stepNumber, step.current && styles.currentStepNumber]}>
            <Text style={[styles.stepNumberText, step.current && styles.currentStepNumberText]}>
              {index + 1}
            </Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepInstruction, step.current && styles.currentStepInstruction]}>
              {step.instruction}
            </Text>
            {step.distance && (
              <Text style={[styles.stepDistance, step.current && styles.currentStepDistance]}>
                {step.distance}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  currentStepItem: {
    backgroundColor: '#FFF1E6',
    borderLeftColor: '#FF6A00',
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  currentStepNumber: {
    backgroundColor: '#FF6A00',
  },
  stepNumberText: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 20,
  },
  currentStepInstruction: {
    color: '#FF6A00',
    fontWeight: '700',
  },
  stepDistance: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  currentStepDistance: {
    color: '#FF8533',
    fontWeight: '500',
  },
});
