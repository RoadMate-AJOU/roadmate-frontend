import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Modal, TouchableOpacity } from 'react-native';
import Header from './Header';
import MapDisplay from './MapDisplay';
import DetailedDirection from './DetailedDirections';
import TransportSteps from './TransportSteps';
import MicButton from './FloatingMicButton';
import { fetchBusArrivalTime } from './fetchBusArrivalTime';
import { fetchSubwayArrivalTime } from './fetchSubwayArrivalTime';
import tmap_sample4 from '../../data/tmap_sample4.json';
import tmap_sample5 from '../../data/tmap_sample5.json';

export default function MapScreen() {
  const [eta, setEta] = useState('');
  const [busMin, setBusMin] = useState<number | null>(null);
  const [subwayMin, setSubwayMin] = useState<number | null>(null);
  const [routeData, setRouteData] = useState<any>(tmap_sample4);
  const [showAlert, setShowAlert] = useState(false);
  const [answered, setAnswered] = useState(false);

  const guides = routeData?.guides ?? [];

  const firstBusGuide = guides.find((guide) => guide.transportType === 'BUS');
  const firstSubwayGuide = guides.find((guide) => guide.transportType === 'SUBWAY');

  useEffect(() => {
    const fetchArrivalTimes = async () => {
      if (firstBusGuide?.startLocation?.name && firstBusGuide?.busNumber) {
        const min = await fetchBusArrivalTime(firstBusGuide.startLocation.name, firstBusGuide.busNumber);
        setBusMin(min);
      }
      if (firstSubwayGuide?.startLocation?.name) {
        const min = await fetchSubwayArrivalTime(firstSubwayGuide.startLocation.name);
        setSubwayMin(min);
      }
    };
    fetchArrivalTimes();
  }, [firstBusGuide, firstSubwayGuide]);

  useEffect(() => {
    const now = new Date();
    const totalDuration = guides.reduce((sum, guide) => sum + (guide.time ?? 0), 0);
    const extraMin = (busMin ?? 0) + (subwayMin ?? 0);
    const etaDate = new Date(now.getTime() + (totalDuration + extraMin * 60) * 1000);

    const hours = etaDate.getHours().toString().padStart(2, '0');
    const minutes = etaDate.getMinutes().toString().padStart(2, '0');
    setEta(`${hours}:${minutes}`);
  }, [busMin, subwayMin, routeData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!answered) {
        console.log('🚨 경로 이탈 감지됨 (하드코딩)');
        setShowAlert(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [answered]);

  const handleYes = () => {
    console.log('✅ 예 클릭 → 새 경로로 갱신');
    setRouteData(tmap_sample5);
    setShowAlert(false);
    setAnswered(true);
  };

  const handleNo = () => {
    console.log('❌ 아니요 클릭 → 기존 경로 유지');
    setShowAlert(false);
    setAnswered(true);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        <Header destination="광화문역" eta={eta} />
        <MapDisplay />
        <DetailedDirection routeData={routeData} />
        <TransportSteps routeData={routeData} />
      </ScrollView>

      {/* ✅ 오른쪽 하단 고정 마이크 버튼 */}
      <MicButton />

      <Modal visible={showAlert} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>경로에서 이탈한 것 같아요. 새로운 경로를 탐색할까요?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.buttonYes} onPress={handleYes}>
                <Text style={styles.buttonText}>예</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonNo} onPress={handleNo}>
                <Text style={styles.buttonText}>아니요</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  buttonYes: {
    backgroundColor: '#FF6A00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonNo: {
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
