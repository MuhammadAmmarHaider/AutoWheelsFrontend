import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";

import { formatPkr } from "@/components/home-car-card";
import { getAppColors } from "@/constants/app-colors";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
import type { ShowroomCatalogCard } from "@/types/home-listing";

export default function CatalogDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const [entry, setEntry] = useState<ShowroomCatalogCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || typeof id !== "string") {
      setError("Missing id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<ShowroomCatalogCard>(`/catalog/${id}`, {
        method: "GET",
      });
      setEntry(data);
    } catch (e) {
      setEntry(null);
      setError(e instanceof Error ? e.message : "Could not load details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

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
        <Text className="flex-1 text-lg font-bold" style={{ color: colors.textPrimary }} numberOfLines={1}>
          Specifications
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.tabActive} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base" style={{ color: colors.textSecondary }}>
            {error}
          </Text>
          <Pressable
            className="mt-5 rounded-xl px-8 py-3"
            style={{ backgroundColor: colors.tabActive }}
            onPress={() => void load()}
          >
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      ) : entry ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <Text
            className="mx-4 mb-3 mt-2 text-xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            {entry.title}
          </Text>
          <View
            className="mx-4 mb-2 rounded-xl border px-4 py-2"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          >
            <Text className="text-center text-[11px] font-bold uppercase text-slate-500">
              Informational brochure · vehicle not listed for sale in this section
            </Text>
          </View>

          {entry.images?.[0]?.url ? (
            <Image
              source={{ uri: entry.images[0].url }}
              style={{
                width: "92%",
                alignSelf: "center",
                marginTop: 12,
                height: 208,
                borderRadius: 12,
              }}
              contentFit="cover"
            />
          ) : null}

          <Text className="mx-4 mt-5 text-lg font-semibold" style={{ color: colors.tabActive }}>
            {entry.indicativePrice != null && Number(entry.indicativePrice) > 0
              ? `Indicative from ~${formatPkr(Number(entry.indicativePrice))}`
              : "Indicative price on request"}
          </Text>

          <Text className="mx-4 mt-2 text-base" style={{ color: colors.textSecondary }}>
            {`${entry.brand?.name ?? ""} ${entry.model?.name ?? ""}`.trim()} · {entry.year} ·{" "}
            {entry.fuelType} · {entry.transmission}
          </Text>

          {entry.subtitle ? (
            <Text className="mx-4 mt-5 text-[17px] font-semibold" style={{ color: colors.textPrimary }}>
              {entry.subtitle}
            </Text>
          ) : null}

          <Text className="mx-4 mt-4 whitespace-pre-wrap text-[15px] leading-7" style={{ color: colors.textPrimary }}>
            {entry.description}
          </Text>

          <View className="mx-4 mt-8 rounded-xl border p-5" style={{ borderColor: colors.border }}>
            <Text style={{ color: colors.textSecondary }} className="text-sm leading-6">
              To purchase a peer-to-peer used vehicle, browse the Used cars tab on the home screen. Authorized
              new-car dealers are not part of these informational profiles.
            </Text>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
