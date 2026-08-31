import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default to local machine IP or custom server
export const DEFAULT_API_URL = 'http://10.0.2.2:5000/api'; // Android Emulator alias for localhost:5000

let customApiUrl = DEFAULT_API_URL;

export const setCustomApiUrl = async (url: string) => {
  customApiUrl = url;
  await AsyncStorage.setItem('tfs_mobile_api_url', url);
};

export const getApiUrl = async () => {
  const stored = await AsyncStorage.getItem('tfs_mobile_api_url');
  if (stored) customApiUrl = stored;
  return customApiUrl;
};

const mobileApiClient = axios.create({
  baseURL: customApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

mobileApiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('tfs_mobile_token');
  const url = await AsyncStorage.getItem('tfs_mobile_api_url');
  if (url) {
    config.baseURL = url;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default mobileApiClient;
