import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { NewCarCatalogCard } from "@/components/new-car-catalog-card";
import { getAppColors } from "@/constants/app-colors";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
import type {
  BrowseCatalogResponse,
  CatalogSectionKey,
} from "@/types/home-listing";

const CATALOG_SECTION_TITLES: Record<CatalogSectionKey, string> = {
  latest: "Recently added specs",
  featured: "Highlighted models",
  newest_models: "Latest model years",
};

export default function BrowseScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);
  const params = useLocalSearchParams<{
    section?: string;
    search?: string;
  }>();

  const catalogSection = useMemo((): CatalogSectionKey => {
    const s = (params.section || "latest").trim();
    if (s === "featured" || s === "newest_models") return s;
    return "latest";
  }, [params.section]);

  const search = useMemo(() => {
    const raw = typeof params.search === "string" ? params.search : "";
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [params.search]);

  const [items, setItems] = useState<BrowseCatalogResponse["entries"]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headerTitle =
    CATALOG_SECTION_TITLES[catalogSection] ??
    CATALOG_SECTION_TITLES.latest;

  const buildCatalogQuery = useCallback(
    (nextSkip: number) => {
      const q = new URLSearchParams({
        section: catalogSection,
        skip: String(nextSkip),
        take: "20",
      });
      if (search.trim()) q.set("search", search.trim());
      return `/catalog/browse?${q.toString()}`;
    },
    [catalogSection, search],
  );

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<BrowseCatalogResponse>(buildCatalogQuery(0));
      const rows = data.entries ?? [];
      setItems(rows);
      setTotal(data.total);
      setSkip((data.skip ?? 0) + rows.length);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setSkip(0);
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [buildCatalogQuery]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (loading || loadingMore) return;
    if (items.length >= total) return;

    setLoadingMore(true);
    try {
      const data = await apiRequest<BrowseCatalogResponse>(buildCatalogQuery(skip));
      const rows = data.entries ?? [];
      setItems((prev) => [...prev, ...rows]);
      setSkip((s) => s + rows.length);
      setTotal(data.total);
    } catch {
      // ignore silently
    } finally {
      setLoadingMore(false);
    }
  };

  const subtitleParts = [`New car brochures (not listed for sale)`, search.trim() ? `“${search.trim()}”` : null].filter(
    Boolean,
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View
        className="flex-row items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: colors.border }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
            {headerTitle}
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {subtitleParts.join(" · ")}
          </Text>
        </View>
      </View>

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
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
          onEndReachedThreshold={0.35}
          onEndReached={() => void loadMore()}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginTop: 16 }} color={colors.tabActive} />
            ) : items.length === 0 ? (
              <Text
                className="mt-10 text-center text-base"
                style={{ color: colors.textSecondary }}
              >
                No brochures match yet.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <NewCarCatalogCard
              entry={item}
              colors={colors}
              onPress={() => router.push(`/catalog/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
