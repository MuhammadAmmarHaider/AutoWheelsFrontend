import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import {
  Link,
  useLocalSearchParams,
  useRouter,
  type Href,
} from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { signInWithPassword } from "@/lib/auth-api";
import { setAuthToken } from "@/lib/auth-storage";
import { getAppColors } from "@/constants/app-colors";
import { useTheme } from "@/hooks/use-theme";

function formatAuthError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const m = data?.message;
    if (Array.isArray(m)) return m.join(", ");
    if (typeof m === "string") return m;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Could not sign in. Please try again.";
}

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string | string[] }>();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const redirectParam = params.redirect;
  const redirect =
    typeof redirectParam === "string"
      ? redirectParam
      : redirectParam?.[0] ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Enter email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const token = await signInWithPassword(email, password);
      await setAuthToken(token);
      const next: Href =
        redirect && redirect.length > 0 ? (redirect as Href) : "/";
      router.replace(next);
    } catch (e) {
      Alert.alert("Sign in failed", formatAuthError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 32,
          }}
        >
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
            className="mb-6 flex-row items-center gap-1 self-start"
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color={colors.tabActive} />
            <Text style={{ color: colors.tabActive }} className="text-base">
              Back
            </Text>
          </Pressable>

          <Text
            style={{ color: colors.textPrimary }}
            className="text-3xl font-bold"
          >
            Welcome back
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="mt-2 text-base"
          >
            Sign in to post ads, manage listings, and chat.
          </Text>

          <View className="mt-8">
            <Text
              style={{ color: colors.textSecondary }}
              className="mb-2 text-sm font-medium"
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              style={{
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
              className="rounded-xl border px-4 py-3 text-base"
            />
          </View>

          <View className="mt-5">
            <Text
              style={{ color: colors.textSecondary }}
              className="mb-2 text-sm font-medium"
            >
              Password
            </Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                style={{
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  paddingRight: 48,
                }}
                className="rounded-xl border px-4 py-3 text-base"
              />
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-3"
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            style={{
              backgroundColor: colors.tabActive,
              opacity: submitting ? 0.7 : 1,
            }}
            className="mt-8 items-center rounded-xl py-4"
          >
            {submitting ? (
              <ActivityIndicator color={colors.onAccent} />
            ) : (
              <Text
                style={{ color: colors.onAccent }}
                className="text-base font-semibold"
              >
                Sign in
              </Text>
            )}
          </Pressable>

          <View className="mt-8 flex-row flex-wrap items-center justify-center gap-1">
            <Text style={{ color: colors.textSecondary }} className="text-base">
              No account?
            </Text>
            <Link
              href={
                redirect
                  ? ({ pathname: "/signup", params: { redirect } } as Href)
                  : "/signup"
              }
              asChild
            >
              <Pressable>
                <Text
                  style={{ color: colors.tabActive }}
                  className="text-base font-semibold"
                >
                  Create one
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
