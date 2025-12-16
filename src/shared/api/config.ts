import { Platform } from 'react-native';

const PORT = 8087;

export const API_BASE_URL =
  Platform.OS === 'android'
    ? `http://192.168.31.114:${PORT}` //10.0.2.2 192.168.31.114
    : `http://localhost:${PORT}`;
