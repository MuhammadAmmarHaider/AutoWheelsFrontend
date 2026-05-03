import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { getAppColors } from "@/constants/app-colors";
import { getAuthToken, clearAuthToken } from "@/lib/auth-storage";
import { apiRequest } from "@/lib/api";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function MoreScreen() {
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          const user = await apiRequest<UserInfo>("/auth/me", {
            method: "GET",
          });
          setUserInfo(user);
        }
      } catch (error) {
        // Token might be invalid, just clear it
        await clearAuthToken();
      } finally {
        setLoading(false);
      }
    };

    void loadUserInfo();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);
            try {
              await apiRequest("/auth/logout", { method: "POST" });
            } catch (error) {
              // Continue with logout even if API call fails
            } finally {
              await clearAuthToken();
              setUserInfo(null);
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1 px-6 pt-4"
    >
      <Text
        style={{ color: colors.textPrimary }}
        className="text-2xl font-bold"
      >
        More
      </Text>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.tabActive} />
        </View>
      ) : userInfo ? (
        <View className="mt-8 gap-3">
          {/* User Info Card */}
          <View
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="rounded-xl border px-4 py-4"
          >
            <View className="flex-row items-center gap-3">
              <View
                style={{ backgroundColor: colors.tabActive }}
                className="h-12 w-12 items-center justify-center rounded-full"
              >
                <Text className="text-xl font-bold text-white">
                  {userInfo.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  style={{ color: colors.textPrimary }}
                  className="text-lg font-semibold"
                >
                  {userInfo.name}
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-sm"
                >
                  {userInfo.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="rounded-xl border px-4 py-4"
          >
            <View className="flex-row items-center gap-3">
              {loggingOut ? (
                <ActivityIndicator size="small" color={colors.tabActive} />
              ) : (
                <Ionicons name="log-out-outline" size={24} color={colors.tabActive} />
              )}
              <Text
                style={{ color: colors.textPrimary }}
                className="text-lg font-medium"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </Text>
            </View>
          </Pressable>
        </View>
      ) : (
        <View className="mt-8 gap-3">
          <Link href="/login" asChild>
            <Pressable
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="rounded-xl border px-4 py-4"
            >
              <Text style={{ color: colors.textPrimary }} className="text-lg font-medium">
                Sign in
              </Text>
              <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
                Access sell, my ads, and chat
              </Text>
            </Pressable>
          </Link>
          <Link href="/signup" asChild>
            <Pressable
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="rounded-xl border px-4 py-4"
            >
              <Text style={{ color: colors.textPrimary }} className="text-lg font-medium">
                Create account
              </Text>
              <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
                New to AutoWheels
              </Text>
            </Pressable>
          </Link>
        </View>
      )}
    </SafeAreaView>
  );
}
