import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "/api/v1" : "https://even-tick-backend.onrender.com/api/v1",
});

apiClient.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("eventick_user");
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
