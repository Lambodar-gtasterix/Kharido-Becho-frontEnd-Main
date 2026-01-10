import { Platform } from 'react-native';

const PORT = 8087;

export const API_BASE_URL =
  Platform.OS === 'android'
    ? `http://10.110.209.146:${PORT}` // 192.168.31.114
    : `http://localhost:${PORT}`;
