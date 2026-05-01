import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { getAppColors } from "@/constants/app-colors";

export type MyListing = {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  status: "ACTIVE" | "PENDING" | "SOLD";
  images: { url: string }[];
  brand: { name: string };
  model: { name: string };
  city: { name: string };
};

type AppColors = ReturnType<typeof getAppColors>;

export type MyAdListItemVariant = "active" | "pending" | "removed";

function formatPkrLacs(price: number): string {
  const lac = price / 100_000;
  if (lac >= 0.01) {
    return `PKR ${lac.toFixed(2)} Lac`;
  }
  return `PKR ${Math.round(price).toLocaleString("en-PK")}`;
}

function formatFuelLabel(fuel: string): string {
  return fuel.charAt(0) + fuel.slice(1).toLowerCase();
}

type Props = {
  listing: MyListing;
  variant: MyAdListItemVariant;
  colors: AppColors;
  viewCount?: number;
  leadCount?: number;
  onEdit?: () => void;
  onReactivate?: () => void;
};

export function MyAdListItem({
  listing,
  variant,
  colors,
  viewCount = 0,
  leadCount = 0,
  onEdit,
  onReactivate,
}: Props) {
  const imageUrl = listing.images[0]?.url;
  const showSoldBadge = variant === "removed" || listing.status === "SOLD";
  const title =
    listing.title ||
    `${listing.brand.name} ${listing.model.name}`.trim();
  const specs = `${listing.year} | ${listing.mileage.toLocaleString()} km | ${formatFuelLabel(listing.fuelType)}`;

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      }}
      className="mb-4 overflow-hidden rounded-xl border"
    >
      <View className="flex-row p-3">
        <View className="relative h-[104px] w-[132px] overflow-hidden rounded-lg bg-neutral-200">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <MaterialCommunityIcons
                name="car-off"
                size={36}
                color={colors.textSecondary}
              />
            </View>
          )}

          {showSoldBadge && (
            <View className="absolute left-0 top-0 bg-black/60 px-2 py-1">
              <Text className="text-[10px] font-semibold uppercase text-white">
                sold out
              </Text>
            </View>
          )}

          <View className="absolute bottom-1.5 left-1.5 right-1.5 flex-row gap-1.5">
            <View className="flex-row items-center gap-1 rounded-full bg-black/55 px-2 py-0.5">
              <Feather name="eye" size={11} color="#fff" />
              <Text className="text-[10px] font-medium text-white">
                {viewCount}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-black/55 px-2 py-0.5">
              <Feather name="phone" size={11} color="#fff" />
              <Text className="text-[10px] font-medium text-white">
                {leadCount}
              </Text>
            </View>
          </View>
        </View>

        <View className="min-w-0 flex-1 pl-3">
          <Text
            style={{ color: colors.textPrimary }}
            className="text-[15px] font-bold leading-5"
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            style={{ color: colors.textPrimary }}
            className="mt-1.5 text-lg font-bold"
          >
            {formatPkrLacs(listing.price)}
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="mt-0.5 text-sm"
            numberOfLines={1}
          >
            {listing.city.name}
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="mt-1 text-xs"
            numberOfLines={1}
          >
            {specs}
          </Text>
        </View>
      </View>

      {(onEdit || onReactivate) && (
        <View
          style={{ borderTopColor: colors.border }}
          className="flex-row gap-2 border-t px-3 py-2.5"
        >
          {onEdit && (
            <Pressable
              onPress={onEdit}
              style={{ borderColor: colors.tabActive }}
              className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-lg border-2 bg-transparent"
            >
              <Feather name="edit-2" size={16} color={colors.tabActive} />
              <Text
                style={{ color: colors.tabActive }}
                className="text-sm font-semibold"
              >
                Edit
              </Text>
            </Pressable>
          )}
          {onReactivate && (
            <Pressable
              onPress={onReactivate}
              style={{ backgroundColor: colors.tabActive }}
              className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-lg"
            >
              <MaterialCommunityIcons
                name="restore"
                size={18}
                color={colors.onAccent}
              />
              <Text
                style={{ color: colors.onAccent }}
                className="text-sm font-semibold"
              >
                Re-Activate
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
