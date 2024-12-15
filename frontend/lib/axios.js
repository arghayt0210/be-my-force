// lib/axios.js
import axios from "axios";

// Create instances for different content types
const axiosJSON = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosFormData = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Request interceptor
const requestInterceptor = (config) => {
  // You can add common request handling here
  return config;
};

// Response interceptor
const responseInterceptor = (response) => {
  return response;
};

// Error interceptor
const errorInterceptor = (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    // Handle unauthorized access
    window.location.href = "/login";
  }
  return Promise.reject(error);
};

// Apply interceptors to both instances
[axiosJSON, axiosFormData].forEach((instance) => {
  instance.interceptors.request.use(requestInterceptor, errorInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);
});

export { axiosJSON, axiosFormData };
