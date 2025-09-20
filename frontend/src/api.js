import axios from "axios";

const API_URL =   process.env.REACT_APP_API_URL;// Django backend
 // withCredentials: true, 

// Axios instance with token support
const api = axios.create({
  baseURL: API_URL,
});

// Attach token if exists (request interceptor)
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem("tokens");
  if (tokens) {
    const { access } = JSON.parse(tokens); // ✅ extract access token properly
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
  }
  return config;
});

// Handle 401 errors (response interceptor)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const tokens = localStorage.getItem("tokens");
      if (tokens) {
        const { refresh } = JSON.parse(tokens); // ✅ extract refresh token
        try {
          // Call backend refresh API
          const res = await api.post("users/token/refresh/", { refresh });

          // Save new tokens
          const newTokens = { access: res.data.access, refresh };
          localStorage.setItem("tokens", JSON.stringify(newTokens));

          // Update default header for future requests
          api.defaults.headers.Authorization = `Bearer ${res.data.access}`;

          // Retry the failed request with new token
          return api(originalRequest);
        } catch (err) {
          // Refresh token expired → force logout
          localStorage.removeItem("tokens");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (userData) => api.post("users/register/", userData);

export const login = async (credentials) => {
  const response = await api.post("users/login/", credentials);

  // Save tokens on login
  const tokens = {
    access: response.data.access,
    refresh: response.data.refresh,
  };
  localStorage.setItem("tokens", JSON.stringify(tokens));

  return response.data;
};

export const refreshToken = (refresh) =>
  api.post("users/token/refresh/", { refresh });

// Chat APIs
export const getChats = () => api.get("users/chats/");
export const createChat = (title) => api.post("users/chats/", { title: title });
export const getMessages = (chatId) => api.get(`users/messages/?chat=${chatId}`);
export const sendMessage = (data) => api.post("users/messages/", data);


// export const getChats = () => api.get("chats/");
// export const createChat = (title) => api.post("users/chats/",{title});
// export const getMessages = (chatId) => api.get(`messages/?chat=${chatId}`);
// export const sendMessage = (data) => api.post("messages/", data);

// Career Analyzer API
export const analyzeCareer = async (resumeText) => {
  if (!resumeText) throw new Error("Resume text is empty");
  const res = await axios.post("career/analyzer/", {
    resume_text: resumeText,
  }); // no token needed here unless you require auth
  return res.data;
};

export default api;
