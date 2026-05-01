import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTheme } from "@/hooks/use-theme";
import { getAppColors } from "@/constants/app-colors";

export default function ChatScreen() {
  const authGate = useRequireAuth();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  if (authGate !== "allowed") {
    return (
      <SafeAreaView
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.tabActive} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1 items-center justify-center"
    >
      <Text style={{ color: colors.textPrimary }} className="text-2xl">
        Chat Page
      </Text>
    </SafeAreaView>
  );
}
