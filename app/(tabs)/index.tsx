import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import {
  CityPickerModal,
  type CityOption,
} from "@/components/city-picker-modal";
import { HomeCarCard } from "@/components/home-car-card";
import { NewCarCatalogCard } from "@/components/new-car-catalog-card";
import { getAppColors } from "@/constants/app-colors";
import { SELL_NOW_THEME } from "@/constants/sell-now-theme";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
import type {
  CatalogFeedResponse,
  CatalogFeedSection,
  CatalogSectionKey,
  HomeFeedResponse,
  HomeFeedSection,
} from "@/types/home-listing";

type BrowseTab = "used" | "new";

const CARD_WIDTH = 168;
const HEADER_BG = SELL_NOW_THEME.header;
const SELECTED_TAB_GREEN = "#63df4e";

async function fetchSellOptionsCities(): Promise<CityOption[]> {
  try {
    const data = await apiRequest<{ cities: CityOption[] }>(
      "/listings/sell-form/options",
      { method: "GET" },
    );
    return Array.isArray(data.cities) ? data.cities : [];
  } catch {
    return [];
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const [browseTab, setBrowseTab] = useState<BrowseTab>("used");
  const [searchUsed, setSearchUsed] = useState("");
  const [searchNew, setSearchNew] = useState("");
  const [debouncedUsed, setDebouncedUsed] = useState("");
  const [debouncedNew, setDebouncedNew] = useState("");

  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);

  const [usedSections, setUsedSections] = useState<HomeFeedSection[]>([]);
  const [catalogSections, setCatalogSections] = useState<CatalogFeedSection[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsed(searchUsed.trim()), 380);
    return () => clearTimeout(t);
  }, [searchUsed]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedNew(searchNew.trim()), 380);
    return () => clearTimeout(t);
  }, [searchNew]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const list = await fetchSellOptionsCities();
      if (!cancelled)
        setCities(list.sort((a, b) => a.name.localeCompare(b.name)));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadUsed = useCallback(async () => {
    const q = new URLSearchParams();
    if (selectedCity?.id) q.set("cityId", selectedCity.id);
    if (debouncedUsed) q.set("search", debouncedUsed);
    const qs = q.toString();
    const url = qs ? `/listings/home-feed?${qs}` : "/listings/home-feed";
    const data = await apiRequest<HomeFeedResponse>(url, { method: "GET" });
    setUsedSections(Array.isArray(data.sections) ? data.sections : []);
  }, [debouncedUsed, selectedCity?.id]);

  const loadCatalog = useCallback(async () => {
    const q = new URLSearchParams();
    if (debouncedNew) q.set("search", debouncedNew);
    const qs = q.toString();
    const url = qs ? `/catalog/home-feed?${qs}` : "/catalog/home-feed";
    const data = await apiRequest<CatalogFeedResponse>(url, { method: "GET" });
    setCatalogSections(Array.isArray(data.sections) ? data.sections : []);
  }, [debouncedNew]);

  const loadHome = useCallback(async () => {
    setError(null);
    try {
      if (browseTab === "used") {
        await loadUsed();
      } else {
        await loadCatalog();
      }
    } catch (e) {
      if (browseTab === "used") setUsedSections([]);
      else setCatalogSections([]);
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [browseTab, loadCatalog, loadUsed]);

  useEffect(() => {
    setLoading(true);
    void loadHome();
  }, [loadHome]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadHome();
  };

  const locationLabel = useMemo(
    () => selectedCity?.name ?? "Pakistan",
    [selectedCity],
  );

  const searchValue = browseTab === "used" ? searchUsed : searchNew;
  const setSearchValue = browseTab === "used" ? setSearchUsed : setSearchNew;

  const openUsedExplore = useCallback(() => {
    router.push({
      pathname: "/used-explore",
      params: {
        cityId: selectedCity?.id ?? "",
        search: debouncedUsed,
      },
    });
  }, [debouncedUsed, router, selectedCity?.id]);

  const openCatalogBrowse = useCallback(
    (sectionKey: CatalogSectionKey) => {
      router.push({
        pathname: "/browse",
        params: {
          section: sectionKey,
          search: debouncedNew,
        },
      });
    },
    [debouncedNew, router],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: HEADER_BG }}
      edges={["top"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={HEADER_BG} />
      <View style={{ backgroundColor: HEADER_BG }} className="px-5 pb-4 pt-2">
        <Text className="text-2xl font-bold text-white">Browse cars</Text>
        <View className="mt-4 flex-row gap-2">
          {(
            [
              { key: "used" as const, label: "Used Cars" },
              { key: "new" as const, label: "New Cars" },
            ] as const
          ).map((tab) => {
            const sel = browseTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setBrowseTab(tab.key)}
                className="flex-1 rounded-xl py-3"
                style={{
                  backgroundColor: sel
                    ? SELECTED_TAB_GREEN
                    : "rgba(255,255,255,0.12)",
                  borderWidth: 1,
                  borderColor: sel
                    ? SELECTED_TAB_GREEN
                    : "rgba(255,255,255,0.26)",
                }}
              >
                <Text
                  className="text-center text-[15px] font-semibold"
                  style={{ color: sel ? "#0b1d24" : "#fff" }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {browseTab === "used" ? (
          <View
            className="mx-4 mt-5 flex-row items-center rounded-xl px-3 py-2"
            style={{
              borderWidth: 1,
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
              value={searchValue}
              onChangeText={setSearchValue}
              style={{ color: colors.textPrimary }}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            <View
              style={{
                width: 1,
                height: 24,
                backgroundColor: colors.border,
                marginHorizontal: 6,
              }}
            />
            <Pressable
              onPress={() => setCityModalOpen(true)}
              className="shrink flex-row items-center py-2 pl-1"
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.tabActive}
              />
              <Text
                numberOfLines={1}
                className="ml-1 max-w-[108px] text-[13px] font-semibold"
                style={{ color: colors.textPrimary }}
              >
                {locationLabel}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mx-4 mt-4">
            <View
              className="flex-row items-center rounded-xl px-3 py-2"
              style={{
                borderWidth: 1,
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
                placeholder="Search new cars..."
                placeholderTextColor={colors.textSecondary}
                value={searchValue}
                onChangeText={setSearchValue}
                style={{ color: colors.textPrimary }}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>
          </View>
        )}

        {loading && !refreshing ? (
          <View className="min-h-[220] items-center justify-center py-16">
            <ActivityIndicator size="large" color={colors.tabActive} />
          </View>
        ) : error ? (
          <View className="mx-8 mt-12 items-center">
            <Text
              className="text-center text-base"
              style={{ color: colors.textSecondary }}
            >
              {error}
            </Text>
            <Pressable
              onPress={() => {
                setLoading(true);
                void loadHome();
              }}
              className="mt-5 rounded-xl px-8 py-3"
              style={{ backgroundColor: colors.tabActive }}
            >
              <Text className="font-semibold text-white">Retry</Text>
            </Pressable>
          </View>
        ) : browseTab === "used" ? (
          <View className="mt-8 pb-10">
            {usedSections.map((section) => (
              <View key={section.key} className="mb-9">
                <View className="mb-3 flex-row items-center justify-between px-4">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.textPrimary }}
                  >
                    {section.title}
                  </Text>
                  <Pressable onPress={openUsedExplore} hitSlop={8}>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.tabActive }}
                    >
                      View all
                    </Text>
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                >
                  {(section.listings ?? []).slice(0, 10).map((listing) => (
                    <Pressable
                      key={listing.id}
                      onPress={() => router.push(`/listing/${listing.id}`)}
                      style={{ width: CARD_WIDTH }}
                    >
                      <HomeCarCard
                        listing={listing}
                        colors={colors}
                        width={CARD_WIDTH}
                      />
                    </Pressable>
                  ))}
                  {(!section.listings || section.listings.length === 0) && (
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="pl-4 text-base"
                    >
                      No used listings yet.
                    </Text>
                  )}
                </ScrollView>
              </View>
            ))}
          </View>
        ) : (
          <View className="mt-8 pb-10">
            {catalogSections.map((section) => (
              <View key={section.key} className="mb-9">
                <View className="mb-3 flex-row items-center justify-between px-4">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.textPrimary }}
                  >
                    {section.title}
                  </Text>
                  <Pressable
                    onPress={() =>
                      openCatalogBrowse(section.key as CatalogSectionKey)
                    }
                    hitSlop={8}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.tabActive }}
                    >
                      View all
                    </Text>
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                >
                  {(section.entries ?? []).slice(0, 10).map((entry) => (
                    <View key={entry.id} style={{ width: CARD_WIDTH }}>
                      <NewCarCatalogCard
                        entry={entry}
                        colors={colors}
                        width={CARD_WIDTH}
                        onPress={() => router.push(`/catalog/${entry.id}`)}
                      />
                    </View>
                  ))}
                  {(!section.entries || section.entries.length === 0) && (
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="pl-4 text-base"
                    >
                      No brochures yet. Run backend seed after migrations for
                      sample entries.
                    </Text>
                  )}
                </ScrollView>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CityPickerModal
        visible={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        cities={cities}
        selectedId={selectedCity?.id ?? null}
        onSelect={(c) => setSelectedCity(c)}
        colors={colors}
      />
    </SafeAreaView>
  );
}
