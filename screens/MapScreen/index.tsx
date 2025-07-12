// screens/MapScreen/MapScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import Header from './Header';
import MapDisplay from './MapDisplay';
import DetailedDirection from './DetailedDirections';
import TransportSteps from './TransportSteps';
import MicButton from './FloatingMicButton';
import tmapData from '../../constants/routeData';
import { fetchBusArrivalTime } from './fetchBusArrivalTime';
import { fetchSubwayArrivalTime } from './fetchSubwayArrivalTime';

export default function MapScreen() {
  const [eta, setEta] = useState('');
  const [busMin, setBusMin] = useState<number | null>(null);
  const [subwayMin, setSubwayMin] = useState<number | null>(null);

  const guides = tmapData?.guides ?? [];

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
  }, [busMin, subwayMin]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header destination="광화문역" eta={eta} />
        <MapDisplay />
        <DetailedDirection routeData={tmapData} />
        <TransportSteps routeData={tmapData} />
        <Text style={styles.debugText}>📍 DEBUG: MapScreen End</Text>
      </ScrollView>
      <MicButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  debugText: {
    marginVertical: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
});
