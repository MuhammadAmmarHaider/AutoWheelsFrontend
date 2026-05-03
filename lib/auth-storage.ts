import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "auth_token";

export async function getAuthToken() {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function setAuthToken(token: string) {
  return AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function clearAuthToken() {
  return AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || null;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return getUserIdFromToken(token);
}
