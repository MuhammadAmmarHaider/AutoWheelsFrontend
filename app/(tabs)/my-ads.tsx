import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { MyAdListItem, type MyListing } from "@/components/my-ad-list-item";
import { SELL_NOW_THEME } from "@/constants/sell-now-theme";
import { getAppColors } from "@/constants/app-colors";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";

const HEADER_BG = SELL_NOW_THEME.header;

type TabKey = "ACTIVE" | "PENDING" | "SOLD";

const TABS: { key: TabKey; label: string }[] = [
  { key: "ACTIVE", label: "Active" },
  { key: "PENDING", label: "Pending" },
  { key: "SOLD", label: "Removed" },
];

function emptyCopy(tab: TabKey): { title: string; subtitle: string } {
  switch (tab) {
    case "ACTIVE":
      return {
        title: "No Active Ads",
        subtitle:
          "You haven't posted anything yet. Would you like to sell something?",
      };
    case "PENDING":
      return {
        title: "No Pending Ads",
        subtitle:
          "Listings awaiting approval will show up here once you submit them.",
      };
    case "SOLD":
      return {
        title: "No Removed Ads",
        subtitle:
          "Sold or removed listings will appear in this tab for you to review.",
      };
    default:
      return { title: "Nothing here", subtitle: "" };
  }
}

export default function MyAdsScreen() {
  const authGate = useRequireAuth();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const [tab, setTab] = useState<TabKey>("ACTIVE");
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<MyListing[]>("/listings/user/my-listings", {
        method: "GET",
      });
      setListings(Array.isArray(data) ? data : []);
    } catch (e) {
      setListings([]);
      setError(e instanceof Error ? e.message : "Failed to load your ads.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (authGate !== "allowed") return;
      setLoading(true);
      void loadListings();
    }, [authGate, loadListings]),
  );

  const counts = useMemo(() => {
    return {
      ACTIVE: listings.filter((l) => l.status === "ACTIVE").length,
      PENDING: listings.filter((l) => l.status === "PENDING").length,
      SOLD: listings.filter((l) => l.status === "SOLD").length,
    };
  }, [listings]);

  const filtered = useMemo(
    () => listings.filter((l) => l.status === tab),
    [listings, tab],
  );

  const onRefresh = () => {
    setRefreshing(true);
    void loadListings();
  };

  const reactivateListing = async (id: string) => {
    try {
      await apiRequest(`/listings/${id}/status`, {
        method: "PUT",
        body: { status: "ACTIVE" },
      });
      await loadListings();
      setTab("ACTIVE");
    } catch (e) {
      Alert.alert(
        "Could not re-activate",
        e instanceof Error ? e.message : "Try again.",
      );
    }
  };

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

  const screenBg = isDark ? colors.surface : "#f3f4f6";

  return (
    <View className="flex-1" style={{ backgroundColor: screenBg }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: HEADER_BG }}>
        <View className="py-3.5">
          <Text className="text-center text-lg font-bold text-white">
            My Ads
          </Text>
        </View>
      </SafeAreaView>

      <View
        style={{ backgroundColor: colors.background }}
        className="flex-row border-b"
      >
        {TABS.map((t) => {
          const selected = tab === t.key;
          const count = counts[t.key];
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              className="flex-1 items-center py-3"
              style={{
                borderBottomWidth: selected ? 3 : 0,
                borderBottomColor: selected ? colors.textPrimary : "transparent",
              }}
            >
              <Text
                style={{
                  color: selected ? colors.textPrimary : colors.textSecondary,
                }}
                className="text-sm font-semibold"
              >
                {t.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center pt-10">
          <ActivityIndicator size="large" color={colors.tabActive} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-center text-base"
          >
            {error}
          </Text>
          <Pressable
            onPress={() => {
              setLoading(true);
              void loadListings();
            }}
            className="mt-4 rounded-xl px-6 py-3"
            style={{ backgroundColor: colors.tabActive }}
          >
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 pt-6">
          <MaterialCommunityIcons
            name="text-search"
            size={88}
            color={colors.textSecondary}
            style={{ opacity: 0.5 }}
          />
          <Text
            style={{ color: colors.textPrimary }}
            className="mt-6 text-center text-xl font-bold"
          >
            {emptyCopy(tab).title}
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="mt-2 text-center text-base leading-6"
          >
            {emptyCopy(tab).subtitle}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const variant =
              tab === "ACTIVE"
                ? "active"
                : tab === "PENDING"
                  ? "pending"
                  : "removed";

            return (
              <MyAdListItem
                listing={item}
                variant={variant}
                colors={colors}
                onEdit={() =>
                  Alert.alert(
                    "Edit listing",
                    "Editing from the app will be available in a future update.",
                  )
                }
                onReactivate={
                  tab === "SOLD"
                    ? () => {
                        Alert.alert(
                          "Re-activate listing",
                          "This will mark your ad as active again.",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Re-Activate",
                              onPress: () => void reactivateListing(item.id),
                            },
                          ],
                        );
                      }
                    : undefined
                }
              />
            );
          }}
        />
      )}
    </View>
  );
}
