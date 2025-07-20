import axios from 'axios';
import { useSessionStore } from './sessionStore';

const apiClient = axios.create({
  baseURL: '10.0.2.2:8080',
});

apiClient.interceptors.request.use((config) => {
  const sessionId = useSessionStore.getState().sessionId;

  if (sessionId) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['Authorization'] = sessionId;
  }

  return config;
});

export default apiClient;