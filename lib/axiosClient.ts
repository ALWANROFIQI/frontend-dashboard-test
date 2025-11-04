// lib/axiosClient.ts
import axios from 'axios';

// Client-side axios instance untuk memanggil Next.js API Routes
const axiosClient = axios.create({
  baseURL: '/', // panggil API internal Next.js seperti /api/products
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export default axiosClient;
