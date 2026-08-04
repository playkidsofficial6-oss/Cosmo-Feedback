import axios from 'axios';

const API_URL = "http://localhost:4000" //|| `https://api.feedback.cosmohome.in`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Request interceptor to add the access token
api.interceptors.request.use(config => {
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
}, error => Promise.reject(error));

// Response interceptor to handle 401s and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ignore refresh endpoint 401s to prevent infinite loop
    if (originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (e) {
        setAccessToken(null);
        window.location.href = '/';
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export const fetcher = (url: string) => api.get(url).then(res => res.data);
