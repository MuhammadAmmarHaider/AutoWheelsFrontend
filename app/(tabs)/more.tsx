import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { getAppColors } from "@/constants/app-colors";
import { SELL_NOW_THEME } from "@/constants/sell-now-theme";
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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: SELL_NOW_THEME.header }}>
        <StatusBar barStyle="light-content" backgroundColor={SELL_NOW_THEME.header} />
        <View style={{ backgroundColor: SELL_NOW_THEME.header }} className="px-5 pb-4 pt-2">
          <Text className="text-2xl font-bold text-white">More</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator size="large" color={colors.tabActive} />
          </View>
        ) : userInfo ? (
          <View className="gap-3">
            {/* User Info Card */}
            <Pressable
              onPress={() => router.push("/edit-profile")}
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
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </Pressable>

            {/* Navigation Options */}
            <Text
              style={{ color: colors.textSecondary }}
              className="mt-6 text-xs font-semibold uppercase"
            >
              Quick Access
            </Text>

            {/* Browse Used Cars */}
            <Pressable
              onPress={() => router.push("/used-explore")}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="rounded-xl border px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="car-outline" size={24} color={colors.tabActive} />
                <View className="flex-1">
                  <Text
                    style={{ color: colors.textPrimary }}
                    className="text-lg font-medium"
                  >
                    Browse Used Cars
                  </Text>
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="mt-1 text-xs"
                  >
                    Explore available listings
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* My Ads */}
            <Pressable
              onPress={() => router.push("/(tabs)/my-ads")}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="rounded-xl border px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="list-outline" size={24} color={colors.tabActive} />
                <View className="flex-1">
                  <Text
                    style={{ color: colors.textPrimary }}
                    className="text-lg font-medium"
                  >
                    My Ads
                  </Text>
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="mt-1 text-xs"
                  >
                    Manage your listings
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Saved Ads */}
            <Pressable
              onPress={() => router.push("/saved-ads")}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="rounded-xl border px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="heart-outline" size={24} color={colors.tabActive} />
                <View className="flex-1">
                  <Text
                    style={{ color: colors.textPrimary }}
                    className="text-lg font-medium"
                  >
                    Saved Ads
                  </Text>
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="mt-1 text-xs"
                  >
                    Your favorite listings
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Write Review */}
            <Pressable
              onPress={() => router.push("/browse")}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="rounded-xl border px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="star-outline" size={24} color={colors.tabActive} />
                <View className="flex-1">
                  <Text
                    style={{ color: colors.textPrimary }}
                    className="text-lg font-medium"
                  >
                    Write Review
                  </Text>
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="mt-1 text-xs"
                  >
                    Share your experience
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Logout Button */}
            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="mt-6 rounded-xl border px-4 py-4"
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
          <View className="gap-3">
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
      </ScrollView>
    </View>
  );
}
