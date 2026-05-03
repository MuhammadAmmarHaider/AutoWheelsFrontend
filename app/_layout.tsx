import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "./globals.css";
import { View } from "react-native";
import { Provider } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import { store } from "@/store";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutContent() {
  const { isDark } = useTheme();

  useEffect(() => {
    // Hide the splash screen after the app is ready
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
