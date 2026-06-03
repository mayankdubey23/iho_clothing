import axios from 'axios';

export const API_BASE_URL = 'http://192.168.29.114:8000/api';
export const SITE_BASE_URL = 'http://192.168.29.114:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});
