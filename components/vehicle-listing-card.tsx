import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import type { getAppColors } from "@/constants/app-colors";
import type { HomeListingCard } from "@/types/home-listing";

type Colors = ReturnType<typeof getAppColors>;

export function formatPkrListingLac(price: number): string {
  if (!Number.isFinite(price)) return "PKR 0";
  if (price >= 100000) {
    const lac = price / 100000;
    const rounded = Math.round(lac * 100) / 100;
    const s =
      lac >= 100
        ? rounded.toLocaleString("en-PK", { maximumFractionDigits: 2 })
        : rounded.toLocaleString("en-PK", {
            minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
          });
    return `PKR ${s} Lac`;
  }
  return `PKR ${Math.round(price).toLocaleString("en-PK")}`;
}

function humanizeFuel(ft?: string): string {
  if (!ft?.trim()) return "—";
  const s = ft.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SpecTile({
  icon,
  label,
  colors,
  numberOfLines = 1,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: Colors;
  /** Mileage / location often need extra lines vs fixed half-width tiles. */
  numberOfLines?: number;
}) {
  return (
    <View className="w-1/2 shrink flex-row items-center gap-2 py-1 pr-1">
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text
        className="native:text-xs min-w-0 flex-1 text-xs leading-4"
        style={{ color: colors.textSecondary }}
        numberOfLines={numberOfLines}
      >
        {label}
      </Text>
    </View>
  );
}

export type VehicleListingCardProps = {
  listing: HomeListingCard;
  colors: Colors;
  isFavorite: boolean;
  onToggleFavorite?: () => void;
  favoriteDisabled?: boolean;
  onPress?: () => void;
};

export function VehicleListingCard({
  listing,
  colors,
  isFavorite,
  onToggleFavorite,
  favoriteDisabled,
  onPress,
}: VehicleListingCardProps) {
  const uri = listing.images?.[0]?.url?.trim();
  const imgs = listing.images ?? [];
  const imgCount = imgs.length;
  const title =
    listing.title?.trim() ||
    `${listing.brand?.name ?? ""} ${listing.model?.name ?? ""}`.trim() ||
    "Vehicle";

  return (
    <View
      className="relative mb-4 flex-row overflow-hidden rounded-xl border"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        className="min-w-0 flex-1 flex-row py-3 pl-3 pr-12"
      >
        <View className="relative h-[118px] w-[118px] shrink-0 overflow-hidden rounded-lg bg-slate-200">
          {uri ? (
            <Image
              source={{ uri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="car-outline" size={36} color={colors.textSecondary} />
            </View>
          )}
          {imgCount > 0 ? (
            <View className="absolute bottom-2 left-2 flex-row items-center rounded-md bg-black/55 px-2 py-0.5">
              <Ionicons name="images-outline" size={13} color="#fff" />
              <Text className="ml-1 text-[11px] font-semibold text-white">{imgCount}</Text>
            </View>
          ) : null}
        </View>

        <View className="min-w-0 flex-1 shrink pl-3">
          <Text
            className="pr-10 text-[15px] font-semibold leading-snug"
            style={{ color: colors.textPrimary }}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text className="mt-1 text-lg font-bold" style={{ color: colors.textPrimary }}>
            {formatPkrListingLac(Number(listing.price))}
          </Text>

          <View className="mt-3 flex-row flex-wrap">
            <SpecTile
              icon="calendar-outline"
              label={`${listing.year ?? "—"}`}
              colors={colors}
            />
            <SpecTile
              icon="speedometer-outline"
              label={`${Number(listing.mileage ?? 0).toLocaleString("en-PK")} km`}
              colors={colors}
              numberOfLines={2}
            />
            <SpecTile
              icon="flame-outline"
              label={humanizeFuel(listing.fuelType)}
              colors={colors}
            />
            <SpecTile
              icon="location-outline"
              label={listing.city?.name ?? "—"}
              colors={colors}
              numberOfLines={3}
            />
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={onToggleFavorite}
        disabled={!onToggleFavorite || favoriteDisabled}
        hitSlop={10}
        className="absolute right-3 top-3"
        accessibilityLabel={isFavorite ? "Remove from saved ads" : "Save listing"}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={colors.tabActive}
          style={{ opacity: !onToggleFavorite || favoriteDisabled ? 0.4 : 1 }}
        />
      </Pressable>
    </View>
  );
}
