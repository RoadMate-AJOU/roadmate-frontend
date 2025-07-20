import { createContext, useContext } from 'react';

export const RouteContext = createContext<{
  routeData: any;
  setRouteData: React.Dispatch<React.SetStateAction<any>>;
} | null>(null);

export const useRoute = () => {
  const context = useContext(RouteContext);
  if (!context) throw new Error('useRoute must be used within a RouteProvider');
  return context;
};
