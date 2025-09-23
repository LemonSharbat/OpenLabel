import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Mobile-friendly BASE_URL
const emulatorBase = "http://10.0.2.2:5000/api";
const iosSimBase = "http://localhost:5000/api";
const lanHost = Constants?.expoGoConfig?.debuggerHost?.split(":")?.[0];
const lanBase = lanHost ? `http://${lanHost}:5000/api` : emulatorBase;

const DEV_BASE_URL =
  Platform.OS === "android"
    ? Constants?.expoGoConfig
      ? lanBase
      : emulatorBase
    : Constants?.expoGoConfig
    ? lanBase
    : iosSimBase;

export const BASE_URL = __DEV__
  ? DEV_BASE_URL
  : "https://your-production-api.com/api";

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Token management
const TOKEN_KEY = "openlabel_auth_token";

export const tokenManager = {
  async setToken(token) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.error("Error storing token:", e);
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.error("Error retrieving token:", e);
      return null;
    }
  },

  async removeToken() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      delete api.defaults.headers.common.Authorization;
    } catch (e) {
      console.error("Error removing token:", e);
    }
  },

  async initializeToken() {
    try {
      const token = await this.getToken();
      if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
      return token;
    } catch (e) {
      console.error("Error initializing token:", e);
      return null;
    }
  },
};

// Interceptors
api.interceptors.request.use(
  (config) => {
    if (__DEV__)
      console.log(
        `🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => {
    if (__DEV__) console.log(`✅ ${res.status} ${res.config.url}`);
    return res;
  },
  async (error) => {
    const status = error?.response?.status;
    if (__DEV__) console.log(`❌ ${status} ${error?.config?.url}`);
    if (status === 401) {
      await tokenManager.removeToken();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  async register(payload) {
    try {
      const { data } = await api.post("/auth/register", payload);
      if (data?.success && data?.token) await tokenManager.setToken(data.token);
      return data;
    } catch (e) {
      throw this.handleError(e);
    }
  },

  async login(payload) {
    try {
      const { data } = await api.post("/auth/login", payload);
      if (data?.success && data?.token) await tokenManager.setToken(data.token);
      return data;
    } catch (e) {
      throw this.handleError(e);
    }
  },

  async getProfile() {
    try {
      const { data } = await api.get("/auth/profile");
      return data;
    } catch (e) {
      throw this.handleError(e);
    }
  },

  async updateProfile(payload) {
    try {
      const { data } = await api.put("/auth/profile", payload);
      return data;
    } catch (e) {
      throw this.handleError(e);
    }
  },

  async logout() {
    await tokenManager.removeToken();
    return { success: true, message: "Logged out successfully" };
  },

  handleError(error) {
    if (error?.response) {
      return {
        success: false,
        message: error.response.data?.message || "Server error occurred",
        status: error.response.status,
      };
    } else if (error?.request) {
      return {
        success: false,
        message: "Network error. Please check your connection.",
        status: 0,
      };
    } else {
      return {
        success: false,
        message: "An unexpected error occurred",
        status: -1,
      };
    }
  },
};

export default api;
