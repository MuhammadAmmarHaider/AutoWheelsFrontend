import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";
import { Provider } from "react-redux";
import "./globals.css";

import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import { store } from "@/store";

export const unstable_settings = {
  anchor: "(tabs)",
};
// This is the root layout for the entire app. It wraps the app in the Redux provider and the theme provider, and sets up the navigation stack. It also applies the appropriate navigation theme (dark or light) based on the user's theme preference. The StatusBar style is also set according to the theme. The actual screens of the app are defined in the Stack.Screen components, with the main tab navigation being in the "(tabs)" screen.
function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View className={isDark ? "dark" : ""} style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="browse" options={{ headerShown: false }} />
          <Stack.Screen name="used-explore" options={{ headerShown: false }} />
          <Stack.Screen name="saved-ads" options={{ headerShown: false }} />
          <Stack.Screen name="catalog/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="chat-detail" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={isDark ? "light" : "dark"} />
      </View>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </Provider>
  );
}
