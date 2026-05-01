import axios from "axios";
import { getApiBaseUrl } from "@/lib/api";

type SignInResponse = {
  access_token: string;
};

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<string> {
  const { data } = await axios.post<SignInResponse>(
    `${getApiBaseUrl()}/auth/signin`,
    { email: email.trim().toLowerCase(), password },
  );
  return data.access_token;
}

export async function signUpAccount(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<void> {
  await axios.post(`${getApiBaseUrl()}/auth/signup`, {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    ...(payload.phone?.trim()
      ? { phone: payload.phone.trim() }
      : {}),
  });
}
