import Constants from "expo-constants";
import * as Device from "expo-device";
import { getAuthToken } from "@/lib/auth-storage";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Platform } from "react-native";

/** Backend port — must match `backend/src/main.ts` */
const DEFAULT_API_PORT = "3333";

function getMetroBundlerHostname(): string | null {
  const hostUri = Constants.expoConfig?.hostUri?.trim();
  if (hostUri) {
    const host = hostUri.split(":")[0]?.trim();
    if (host) return host;
  }
  const dbg = Constants.expoGoConfig?.debuggerHost;
  if (typeof dbg === "string" && dbg.length > 0) {
    return dbg.split(":")[0]?.trim() ?? null;
  }
  return null;
}

/**
 * `app.json` often uses localhost for dev — that only works on web or iOS Simulator.
 * On Expo Go / physical devices / Android emulator, localhost is the phone itself.
 * In development, remap loopback URLs to the same host Metro uses (your PC LAN IP).
 */
function resolveApiBaseUrl(): string {
  const configured = (
    Constants.expoConfig?.extra?.apiBaseUrl as string | undefined
  )?.trim();
  const fallback = `http://127.0.0.1:${DEFAULT_API_PORT}`;
  const raw = configured || fallback;

  let parsed: URL;
  try {
    parsed = new URL(raw.includes("://") ? raw : `http://${raw}`);
  } catch {
    return fallback;
  }

  const port = parsed.port || DEFAULT_API_PORT;
  const hostLower = parsed.hostname.toLowerCase();
  const isLoopback =
    hostLower === "localhost" || hostLower === "127.0.0.1";

  if (Platform.OS === "web") {
    return `${parsed.protocol}//${parsed.hostname}:${port}`;
  }

  if (__DEV__ && isLoopback) {
    // Android emulator: LAN IP from Metro often does not route to the host; use Virtual Router alias.
    if (Platform.OS === "android" && !Device.isDevice) {
      const url = `http://10.0.2.2:${port}`;
      console.log("[api] Android emulator — using host loopback alias:", url);
      return url;
    }

    const devHost = getMetroBundlerHostname();
    if (devHost) {
      const url = `http://${devHost}:${port}`;
      console.log("[api] Resolved loopback apiBaseUrl to dev machine:", url);
      return url;
    }

    console.warn(
      "[api] Using loopback apiBaseUrl but Metro hostUri is unavailable. Use a LAN URL in extra.apiBaseUrl " +
        `or tunnel (e.g. http://192.168.x.x:${port}).`,
    );
  }

  return `${parsed.protocol}//${parsed.hostname}:${port}`;
}

/** Call at startup; re-resolve pattern available if expoConfig hydration ever lags */
export function getApiBaseUrl(): string {
  return resolveApiBaseUrl();
}

const API_BASE_URL = getApiBaseUrl();

let axiosInstance: AxiosInstance | null = null;

const getAxiosInstance = async (): Promise<AxiosInstance> => {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to attach token
    axiosInstance.interceptors.request.use(async (config) => {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  return axiosInstance;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const instance = await getAxiosInstance();

  const config: AxiosRequestConfig = {
    method: options.method || "GET",
    url: path,
    headers: options.headers,
  };

  if (options.body) {
    config.data = options.body;
  }

  try {
    const response = await instance.request<T>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const fallback = `Request failed with status ${error.response?.status || "unknown"}`;
      try {
        const errorData = error.response?.data as
          | { message?: string | string[] }
          | undefined;
        const message = Array.isArray(errorData?.message)
          ? errorData.message.join(", ")
          : errorData?.message || fallback;
        throw new Error(message);
      } catch {
        throw new Error(fallback);
      }
    }
    throw error;
  }
}

// Upload images via backend Cloudinary integration
export async function uploadImages(
  fileUris: string[]
): Promise<{ urls: string[] }> {
  const token = await getAuthToken();
  const formData = new FormData();

  for (let i = 0; i < fileUris.length; i++) {
    const uri = fileUris[i];
    const filename = `image-${i}-${Date.now()}.jpg`;

    formData.append("files", {
      uri,
      name: filename,
      type: "image/jpeg",
    } as unknown as Blob);
  }

  const base = getApiBaseUrl().replace(/\/$/, "");
  const uploadUrl = `${base}/upload/images`;

  try {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    const raw = await response.text();
    let data: unknown = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const body = data as
        | { message?: string | string[]; error?: string }
        | null
        | undefined;
      const msg = body?.message;
      const detail = Array.isArray(msg) ? msg.join(", ") : msg || body?.error;
      throw new Error(
        detail || raw || `Upload failed (${response.status})`,
      );
    }

    const payload = data as {
      success?: boolean;
      data?: Array<{ url: string; publicId: string }>;
    };

    if (payload.success && payload.data?.length) {
      const urls = payload.data.map((item) => item.url);
      return { urls };
    }

    throw new Error("Upload endpoint returned unexpected body");
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown upload error");
  }
}