import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { formatPkr } from "@/components/home-car-card";
import type { getAppColors } from "@/constants/app-colors";
import type { ShowroomCatalogCard } from "@/types/home-listing";

type Colors = ReturnType<typeof getAppColors>;

type NewCarCatalogCardProps = {
  entry: ShowroomCatalogCard;
  colors: Colors;
  width?: number;
  onPress?: () => void;
};

function fuelTransmissionLabel(ft: string, tr: string): string {
  const f = ft?.replace(/_/g, " ") ?? "";
  const t = tr?.replace(/_/g, " ") ?? "";
  return [f, t].filter(Boolean).join(" · ");
}

export function NewCarCatalogCard({
  entry,
  colors,
  width,
  onPress,
}: NewCarCatalogCardProps) {
  const uri = entry.images?.[0]?.url?.trim();
  const line2 = [
    `${entry.brand?.name ?? ""} ${entry.model?.name ?? ""}`.trim(),
    entry.year?.toString(),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        width: width ?? undefined,
        flexGrow: width ? 0 : 1,
        alignSelf: width ? undefined : "stretch",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        overflow: "hidden",
      }}
    >
      <View
        className="w-full"
        style={{ aspectRatio: 4 / 3, backgroundColor: colors.surface }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={120}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons
              name="document-text-outline"
              size={38}
              color={colors.textSecondary}
            />
          </View>
        )}
        {/* <View
          className="absolute bottom-0 left-0 right-0 px-2 py-1"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <Text className="text-center text-[10px] font-bold uppercase tracking-wide text-white">
            Specs · not for sale
          </Text>
        </View> */}
      </View>

      <View className="p-2.5">
        <Text
          numberOfLines={2}
          className="text-sm font-semibold leading-tight"
          style={{ color: colors.textPrimary }}
        >
          {entry.title}
        </Text>
        {entry.subtitle ? (
          <Text
            numberOfLines={1}
            className="mt-0.5 text-xs"
            style={{ color: colors.textSecondary }}
          >
            {entry.subtitle}
          </Text>
        ) : null}
        <Text
          className="mt-1 text-sm font-bold"
          style={{ color: colors.tabActive }}
        >
          {entry.indicativePrice != null && Number(entry.indicativePrice) > 0
            ? `From ~${formatPkr(Number(entry.indicativePrice))}`
            : "Price on request"}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-0.5 text-xs"
          style={{ color: colors.textSecondary }}
        >
          {[line2, fuelTransmissionLabel(entry.fuelType, entry.transmission)]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </View>
    </Pressable>
  );
}
