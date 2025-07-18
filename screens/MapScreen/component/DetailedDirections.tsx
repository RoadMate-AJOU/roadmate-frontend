import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocation } from '../../../contexts/LocationContext';
import { StepDetail } from '../model/stepdetail';
import { styles } from '../style/DetailedDirections.styles';

export default function DetailedDirections({ routeData }: { routeData?: any }) {
  const [allDetailedSteps, setAllDetailedSteps] = useState<StepDetail[]>([]);
  const [currentStepDetails, setCurrentStepDetails] = useState<StepDetail[]>([]);
  const { currentLegIndex } = useLocation();

  useEffect(() => {
    if (routeData?.guides) {
      parseStepsFromGuides(routeData.guides);
    } else {
      const sampleSteps = getAllSampleDetailedSteps();
      setAllDetailedSteps(sampleSteps);
      updateCurrentStepDetails(sampleSteps);
    }
  }, [routeData]);

  const parseStepsFromGuides = (guides: any[]) => {
    try {
      const parsedSteps = guides.flatMap((guide, legIndex) => {
        if (guide.transportType !== 'WALK') return [];

        const instruction = cleanInstruction(guide.guidance || '도보로 이동');
        const distance = formatDistance(guide.distance);

        if (!Array.isArray(guide.steps)) {
          return [
            {
              index: 0,
              instruction,
              distance,
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

      setAllDetailedSteps(parsedSteps);
      updateCurrentStepDetails(parsedSteps);
    } catch (error) {
      console.warn('❌ WALK 단계 파싱 실패:', error);
    }
  };

  const updateCurrentStepDetails = (allSteps: StepDetail[]) => {
    if (allSteps.length === 0) return;

    const updatedDetails = allSteps.map((step, index) => ({
      ...step,
      current: index === 0,
    }));

    setCurrentStepDetails(updatedDetails);
  };

  const cleanInstruction = (instruction: string) => {
    if (!instruction || instruction.trim() === '') return '도보로 이동';
    return instruction.includes(':')
      ? instruction.split(':').slice(1).join(':').trim()
      : instruction.trim();
  };

  const formatDistance = (distance: number) => {
    if (!distance || distance <= 0) return '';
    return distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance}m`;
  };

  const getAllSampleDetailedSteps = () =>
    Array.from({ length: 8 }).map((_, i) => ({
      index: i,
      instruction: `샘플 경로 안내 ${i + 1}`,
      distance: `${30 + i * 20}m`,
      parentLegIndex: 0,
      current: false,
    }));

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

      <ScrollView style={styles.scrollArea} nestedScrollEnabled={true}>
        {currentStepDetails.map((step, index) => (
          <View
            key={`${step.parentLegIndex}-${step.index}`}
            style={[styles.stepItem, step.current && styles.currentStepItem]}
          >
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
      </ScrollView>
    </View>
  );
}
