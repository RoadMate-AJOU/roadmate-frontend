// styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  mapContainer: {
    height: 250,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
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
  stepsContainer: {
    padding: 16,
    gap: 12,
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

export default styles;