// contexts/LocationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext({
  location: null,
  setLocation: () => {},
  currentLegIndex: -1,
  setCurrentLegIndex: () => {},
});

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [currentLegIndex, setCurrentLegIndex] = useState(-1); // 추가됨

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, currentLegIndex, setCurrentLegIndex }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
