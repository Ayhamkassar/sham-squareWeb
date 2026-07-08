let extra: Record<string, any> = {};
try {
  const Constants = require('expo-constants');
  extra = Constants.default?.expoConfig?.extra || Constants.expoConfig?.extra || {};
} catch { /* expo-constants not available */ }

export const API_BASE_URL ='https://ashityshop.onrender.com/api/v1';

export const SOCKET_URL =  'https://ashityshop.onrender.com';

export const APP_NAME = 'Sham Presto';
