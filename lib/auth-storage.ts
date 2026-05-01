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
