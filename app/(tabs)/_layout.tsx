import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { useTheme } from "@/hooks/use-theme";
import { getAppColors } from "@/constants/app-colors";

export default function TabLayout() {
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const activeColor = colors.tabActive;
  const inactiveColor = colors.tabInactive;
  const bgColor = colors.surface;
  const borderColor = colors.border;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-ads"
        options={{
          title: "My Ads",
          tabBarIcon: ({ color }) => <AntDesign name="unordered-list" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sell-now"
        options={{
          title: "Sell Now",
          tabBarLabelStyle: {
            marginTop: 10,
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: focused ? activeColor : colors.sellNowBg,
                justifyContent: "center",
                alignItems: "center",
                marginTop: -22,
              }}
            >
              <Ionicons name="add" size={32} color={colors.onAccent} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <AntDesign name="message" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
