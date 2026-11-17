import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  withCredentials: true, // refresh token cookie ကို ပို့ဖို့/လက်ခံဖို့
});
