import axios from 'axios';
import Cookie from 'js-cookie';

// ----------------------------------------------------------------------
const { NEXT_PUBLIC_API_URL: API_ROOT_ENDPOINT } = process.env;

const axiosInstance = axios.create({
  baseURL: API_ROOT_ENDPOINT || 'http://localhost:1337',
});

axiosInstance.interceptors.response.use(
  response => response,
  error =>
    Promise.reject(
      (error.response && error.response.data) || 'Something went wrong'
    )
);

axiosInstance.interceptors.request.use(config => {
  const token = Cookie.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
