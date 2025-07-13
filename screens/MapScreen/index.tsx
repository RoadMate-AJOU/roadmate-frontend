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
import { useLocation } from '../../contexts/LocationContext';

export default function MapScreen() {
  const [eta, setEta] = useState('');
  const [busMin, setBusMin] = useState<number | null>(null);
  const [subwayMin, setSubwayMin] = useState<number | null>(null);
  const [routeData, setRouteData] = useState<any>(tmap_sample4);
  const [showAlert, setShowAlert] = useState(false);
  const [answered, setAnswered] = useState(false);
  const { setLocation } = useLocation();

  const guides = routeData?.guides ?? [];
  const firstBusGuide = guides.find((guide) => guide.transportType === 'BUS');
  const firstSubwayGuide = guides.find((guide) => guide.transportType === 'SUBWAY');

  // 버스/지하철 도착 시간
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

  // ETA 계산
  useEffect(() => {
    const now = new Date();
    const totalDuration = guides.reduce((sum, guide) => sum + (guide.time ?? 0), 0);
    const extraMin = (busMin ?? 0) + (subwayMin ?? 0);
    const etaDate = new Date(now.getTime() + (totalDuration + extraMin * 60) * 1000);

    const hours = etaDate.getHours().toString().padStart(2, '0');
    const minutes = etaDate.getMinutes().toString().padStart(2, '0');
    setEta(`${hours}:${minutes}`);
  }, [busMin, subwayMin, routeData]);

  // 경로 이탈 감지 콜백
  const handleRouteOff = () => {
    if (!answered) {
      console.log('🚨 [MapScreen] 경로 이탈 콜백 수신됨');
      setShowAlert(true);
    }
  };

  // 예 클릭 시 새 경로 반영 + 마커 순간이동
  const handleYes = () => {
    console.log('✅ 예 클릭 → 새 경로로 갱신');

    const firstGuide = tmap_sample5.guides?.[0];
    if (firstGuide?.lineString) {
      const [lon, lat] = firstGuide.lineString.split(' ')[0].split(',').map(Number);
      setLocation({ latitude: lat, longitude: lon }); // 마커 순간이동
    }

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Header destination="광화문역" eta={eta} />

      {/* ✅ isRoutingActive=true 추가 */}
      <MapDisplay
        onOffRouteDetected={handleRouteOff}
        routeData={routeData}
        isRoutingActive={true}
      />

      <DetailedDirection routeData={routeData} />
      <TransportSteps routeData={routeData} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: 120 },
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
