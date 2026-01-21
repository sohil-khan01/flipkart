import axios from 'axios';

export const api = axios.create({
  baseURL: '',
});

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
