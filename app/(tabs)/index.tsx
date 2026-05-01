import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { getAppColors } from "@/constants/app-colors";

export default function HomeScreen() {
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1 items-center justify-center"
    >
      <Text style={{ color: colors.textPrimary }} className="text-2xl">
        Home Page
      </Text>
    </SafeAreaView>
  );
}
