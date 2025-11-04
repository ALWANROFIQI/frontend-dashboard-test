// lib/axiosClient.ts
import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: '/api', // semua request otomatis diarahkan ke /api/*
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});
