import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

let rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';

if (rawApiUrl) {
  rawApiUrl = rawApiUrl.replace(/\/+$/, '');
  if (rawApiUrl.endsWith('/api')) {
    rawApiUrl = rawApiUrl.slice(0, -4);
  }
  axios.defaults.baseURL = rawApiUrl;
}

axios.defaults.withCredentials = true;

const storedToken = localStorage.getItem('dealflow360_token');
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

console.log('📡 DEALFLOW360 API Base URL:', axios.defaults.baseURL || '(Relative Path)');

window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled Promise Rejection caught:', event.reason);
  event.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
