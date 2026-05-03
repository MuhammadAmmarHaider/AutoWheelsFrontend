import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// This screen shows the user's saved ads (favorites). It fetches the list of saved ads from the API and displays them in a list. Users can also remove ads from their saved list by tapping the heart icon. The screen handles loading and error states gracefully, and supports pagination for long lists of saved ads.
import { VehicleListingCard } from "@/components/vehicle-listing-card";
import { getAppColors } from "@/constants/app-colors";
import { SELL_NOW_THEME } from "@/constants/sell-now-theme";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
import type { FavoritesPageResponse } from "@/types/favorites";
import type { HomeListingCard } from "@/types/home-listing";

const PAGE = 20;

const HEADER_BG = SELL_NOW_THEME.header;

export default function SavedAdsScreen() {
  const router = useRouter();
  const authGate = useRequireAuth();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const [items, setItems] = useState<HomeListingCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const mapRows = useCallback((data: FavoritesPageResponse): HomeListingCard[] => {
    const rows = Array.isArray(data.favorites)
      ? data.favorites.map((f) => f.listing).filter(Boolean)
      : [];
    return rows as HomeListingCard[];
  }, []);

  const loadInitial = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiRequest<FavoritesPageResponse>(
        `/favorites?skip=0&take=${PAGE}`,
      );
      const rows = mapRows(data);
      setItems(rows);
      setTotal(typeof data.total === "number" ? data.total : rows.length);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setError(e instanceof Error ? e.message : "Failed to load saved ads.");
    } finally {
      setLoading(false);
    }
  }, [mapRows]);

  useFocusEffect(
    useCallback(() => {
      if (authGate !== "allowed") return;
      void loadInitial();
    }, [authGate, loadInitial]),
  );

  const loadMore = async () => {
    if (authGate !== "allowed") return;
    if (loading || loadingMore) return;
    if (items.length >= total) return;

    setLoadingMore(true);
    try {
      const data = await apiRequest<FavoritesPageResponse>(
        `/favorites?skip=${items.length}&take=${PAGE}`,
      );
      const rows = mapRows(data);
      setItems((prev) => [...prev, ...rows]);
      setTotal(typeof data.total === "number" ? data.total : total);
    } catch {
      // ignore paging errors silently
    } finally {
      setLoadingMore(false);
    }
  };

  const removeFavorite = async (listingId: string) => {
    setBusyId(listingId);
    try {
      await apiRequest(`/favorites/${listingId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((l) => l.id !== listingId));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  const screenBg = isDark ? colors.surface : "#f3f4f6";

  const headerBar = (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: HEADER_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_BG} />
      <View style={{ backgroundColor: HEADER_BG }} className="px-5 pb-4 pt-2">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </Pressable>
          <Text className="text-2xl font-bold text-white">Saved ads</Text>
        </View>
      </View>
    </SafeAreaView>
  );

  if (authGate !== "allowed") {
    return (
      <View className="flex-1" style={{ backgroundColor: screenBg }}>
        {headerBar}
        <View style={{ flex: 1, backgroundColor: colors.background }} className="items-center justify-center">
          <ActivityIndicator size="large" color={colors.tabActive} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: screenBg }}>
      {headerBar}

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.tabActive} />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text style={{ color: colors.textSecondary }} className="text-center text-base">
              {error}
            </Text>
            <Pressable
              onPress={() => void loadInitial()}
              className="mt-5 rounded-xl px-6 py-3"
              style={{ backgroundColor: colors.tabActive }}
            >
              <Text className="font-semibold text-white">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 }}
            onEndReachedThreshold={0.35}
            onEndReached={() => void loadMore()}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator style={{ marginTop: 16 }} color={colors.tabActive} />
              ) : items.length === 0 ? (
                <Text className="mt-16 px-8 text-center text-base" style={{ color: colors.textSecondary }}>
                  Nothing saved yet. Tap the heart on a listing to save it here.
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <VehicleListingCard
                listing={item}
                colors={colors}
                isFavorite
                favoriteDisabled={busyId === item.id}
                onToggleFavorite={() => void removeFavorite(item.id)}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}
