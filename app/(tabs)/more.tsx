import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { getAppColors } from "@/constants/app-colors";

export default function MoreScreen() {
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

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
    </SafeAreaView>
  );
}
