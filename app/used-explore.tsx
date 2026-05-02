import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";

import { VehicleListingCard } from "@/components/vehicle-listing-card";
import { getAppColors } from "@/constants/app-colors";
import { SELL_NOW_THEME } from "@/constants/sell-now-theme";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-storage";
import type { FavoriteListingIdsResponse } from "@/types/favorites";
import type {
  ExploreListingsResponse,
  HomeListingCard,
} from "@/types/home-listing";

const HEADER_BG = SELL_NOW_THEME.header;

export default function UsedExploreScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);
  const params = useLocalSearchParams<{ cityId?: string; search?: string }>();

  const initialCity = typeof params.cityId === "string" ? params.cityId : "";
  const initialSearchDecoded = useMemo(() => {
    const raw = typeof params.search === "string" ? params.search : "";
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [params.search]);

  const [cityId] = useState(initialCity);

  const [search, setSearch] = useState(initialSearchDecoded);
  const [debounced, setDebounced] = useState(initialSearchDecoded.trim());

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 380);
    return () => clearTimeout(t);
  }, [search]);

  const [items, setItems] = useState<HomeListingCard[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [favBusyId, setFavBusyId] = useState<string | null>(null);

  const loadFavoriteIds = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const data = await apiRequest<FavoriteListingIdsResponse>(
        "/favorites/listing-ids",
      );
      setFavoriteIds(new Set(data.listingIds ?? []));
    } catch {
      setFavoriteIds(new Set());
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFavoriteIds();
    }, [loadFavoriteIds]),
  );

  const buildQuery = useCallback(
    (nextSkip: number) => {
      const q = new URLSearchParams({
        skip: String(nextSkip),
        take: "20",
      });
      if (cityId) q.set("cityId", cityId);
      if (debounced) q.set("search", debounced);
      return `/listings/explore?${q.toString()}`;
    },
    [cityId, debounced],
  );

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<ExploreListingsResponse>(buildQuery(0));
      const list = data.listings ?? [];
      setItems(list);
      setTotal(data.total);
      setSkip((data.skip ?? 0) + list.length);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setSkip(0);
      setError(e instanceof Error ? e.message : "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (loading || loadingMore) return;
    if (items.length >= total) return;
    setLoadingMore(true);
    try {
      const data = await apiRequest<ExploreListingsResponse>(buildQuery(skip));
      const list = data.listings ?? [];
      setItems((prev) => [...prev, ...list]);
      setSkip((s) => s + list.length);
      setTotal(data.total);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleFavorite = async (listingId: string) => {
    const token = await getAuthToken();
    if (!token) {
      router.push({ pathname: "/login", params: { redirect: pathname } });
      return;
    }

    const wasFavorite = favoriteIds.has(listingId);
    setFavBusyId(listingId);

    try {
      if (wasFavorite) {
        await apiRequest(`/favorites/${listingId}`, { method: "DELETE" });
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        await apiRequest("/favorites", {
          method: "POST",
          body: { listingId },
        });
        setFavoriteIds((prev) => new Set(prev).add(listingId));
      }
    } catch {
      // leave state; optionally toast
    } finally {
      setFavBusyId(null);
    }
  };

  const screenBg = isDark ? colors.surface : "#f3f4f6";

  return (
    <View className="flex-1" style={{ backgroundColor: screenBg }}>
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
            <Text className="text-2xl font-bold text-white">
              Browse used cars
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <View
        className="px-4 pb-4 pt-3"
        style={{ backgroundColor: colors.background }}
      >
        <View
          className="flex-row items-center rounded-xl border px-3 py-2"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            className="flex-1 py-2 pl-2 text-[15px]"
            placeholder="Search used cars…"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={{ color: colors.textPrimary }}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Pressable
            onPress={() => router.push("/saved-ads")}
            hitSlop={10}
            accessibilityLabel="Saved ads"
          >
            <Ionicons name="heart-outline" size={24} color={colors.tabActive} />
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {loading ? (
          <View className="flex-1 items-center justify-center">
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
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
            onEndReachedThreshold={0.35}
            onEndReached={() => void loadMore()}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  style={{ marginTop: 16 }}
                  color={colors.tabActive}
                />
              ) : items.length === 0 ? (
                <Text
                  className="mt-12 text-center text-base"
                  style={{ color: colors.textSecondary }}
                >
                  No used listings yet.
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/listing/${item.id}`)}
                style={{ marginBottom: 12 }}
              >
                <VehicleListingCard
                  listing={item}
                  colors={colors}
                  isFavorite={favoriteIds.has(item.id)}
                  favoriteDisabled={favBusyId === item.id}
                  onToggleFavorite={() => void toggleFavorite(item.id)}
                />
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}
