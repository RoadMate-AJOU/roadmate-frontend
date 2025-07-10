// app/map.tsx - 파라미터 전달 수정
import { useLocalSearchParams } from 'expo-router';
import MapScreen from '@/screens/MapScreen/index';

export default function MapPage() {
  // URL 파라미터 받기
  const params = useLocalSearchParams();
  
  console.log('🚀 app/map.tsx에서 받은 params:', params);
  
  // MapScreen에 props로 전달
  return <MapScreen {...params} />;
}