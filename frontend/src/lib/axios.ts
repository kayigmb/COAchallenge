import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";

export const BASE_URL = process.env.BACKEND_URL;
const responseBody = <T>(response: AxiosResponse<T>): T => response.data;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token!}`;
        config.headers["Content-Type"] = "application/json";
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      toast("Server network error!", { type: "error" });
    }

    if (
      error?.response?.status === 401 ||
      error?.response?.data.detail === "Not authenticated"
    ) {
      if (typeof window !== "undefined") {
        // localStorage.clear();
        // window.location.href = "/login";
      }
    }

    if (error?.response?.status === 403) {
      toast("Unauthorized!", { type: "error" });
    }

    return Promise.reject(error.response);
  },
);

if (typeof window !== "undefined") {
  window.addEventListener("offline", () => {
    toast("Network is offline", {
      type: "error",
    });
    return;
  });
}

interface RequestMethods {
  get: <T>(URL: string, params?: Record<string, never>) => Promise<T>;
  post: <T>(URL: string, body: any, config?: AxiosRequestConfig) => Promise<T>;
  put: <T>(URL: string, body: any, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T>(
    URL: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  patch: <T>(URL: string, body: any, config?: AxiosRequestConfig) => Promise<T>;
}

const request: RequestMethods = {
  get: (url, params) => axiosInstance.get(url, { params }).then(responseBody),
  post: (url, body) => axiosInstance.post(url, body).then(responseBody),
  put: (url, body) => axiosInstance.put(url, body).then(responseBody),
  delete: (url, params) =>
    axiosInstance.delete(url, { params }).then(responseBody),
  patch: (url, body) => axiosInstance.patch(url, body).then(responseBody),
};

export default request;
