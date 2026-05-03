import React, { useEffect } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const SplashScreenComponent = () => {
  useEffect(() => {
    // Hide the splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Image
        source={require("../assets/images/transparent logo.png")}
        style={{
          width: 250,
          height: 250,
          resizeMode: "contain",
        }}
      />
      <View className="mt-8">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    </View>
  );
};
