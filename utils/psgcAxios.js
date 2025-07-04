// utils/psgcAxios.js

import axios from 'axios';

const psgcAxios = axios.create({
  baseURL: 'https://psgc.gitlab.io/api', // Base URL for PSGC API
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Optional: Adjust as needed
});

export default psgcAxios;
