// styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  mapContainer: {
    borderRadius: 16,              // 원하는 radius
    overflow: 'hidden',            // radius가 적용되도록
    marginHorizontal: 20,          // 양옆에 여백 추가
    height: 200,                   // 높이는 디자인에 따라 조절
    marginTop: 10,
    position: 'relative',          // 힌트 아이콘 배치를 위해
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // 전체화면 지도 스타일
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 10,
  },
  // 확대 힌트 아이콘
  expandHint: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    padding: 5,
  },
  currentLocationMarker: {
    width: 16,
    height: 16,
    backgroundColor: '#FF5900',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  micButton: {
    position: 'absolute',
    bottom: -25,
    right: 20,
    backgroundColor: '#FF5900',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // TransportSteps 컨테이너 위치 조정
  transportStepsContainer: {
    position: 'absolute',
    bottom: 10, // 하단 여백 줄임
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  stepCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#FF5900',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
  },
  instructionBox: {
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});

const additionalStyles = StyleSheet.create({
  // 경로 이탈 표시
  offRouteIndicator: {
    position: 'absolute',
    top: 90, // 헤더 아래
    left: 20,
    right: 20,
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  offRouteText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#8B5000',
  },

  // 재탐색 모달
  rerouteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rerouteModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rerouteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  rerouteMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  rerouteButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  rerouteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  confirmButton: {
    backgroundColor: '#FF5900',
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default styles;