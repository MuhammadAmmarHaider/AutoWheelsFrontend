import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
// The HomeCarCard component is a reusable card component that displays information about a car listing. It shows the car's image, title, price, location, year, mileage, and fuel type. The card can be used in various parts of the app, such as the home screen or browse screen, to showcase different car listings. It accepts props for the listing data, color scheme, optional fixed width for horizontal carousels, and an onPress callback for when the card is tapped.
import type { getAppColors } from "@/constants/app-colors";
import type { HomeListingCard } from "@/types/home-listing";

type Colors = ReturnType<typeof getAppColors>;

export function formatPkr(price: number): string {
  const n = Number.isFinite(price) ? Math.round(price) : 0;
  return `PKR ${n.toLocaleString("en-PK")}`;
}

type HomeCarCardProps = {
  listing: HomeListingCard;
  colors: Colors;
  /** Fixed width when shown in horizontal carousel; omit for fluid (e.g. browse list). */
  width?: number;
  onPress?: () => void;
};

export function HomeCarCard({ listing, colors, width, onPress }: HomeCarCardProps) {
  const uri = listing.images?.[0]?.url?.trim();
  const fuel = (listing.fuelType || "").replaceAll("_", " ").toLowerCase();
  const fuelLabel = fuel ? fuel.charAt(0).toUpperCase() + fuel.slice(1) : "N/A";
  const title =
    listing.title?.trim() ||
    `${listing.brand?.name ?? ""} ${listing.model?.name ?? ""}`.trim() ||
    "Vehicle";

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
        className="w-full bg-slate-200"
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
            <Ionicons name="car-outline" size={40} color={colors.textSecondary} />
          </View>
        )}
      </View>

      <View className="p-2.5">
        <Text
          numberOfLines={2}
          className="text-sm font-semibold leading-tight"
          style={{ color: colors.textPrimary }}
        >
          {title}
        </Text>
        <Text className="mt-1 text-sm font-bold" style={{ color: colors.tabActive }}>
          {formatPkr(listing.price)}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-0.5 text-xs"
          style={{ color: colors.textSecondary }}
        >
          {listing.city?.name ?? "Unknown location"}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-0.5 text-xs"
          style={{ color: colors.textSecondary }}
        >
          {[
            listing.year?.toString() ?? "N/A",
            `${Number(listing.mileage ?? 0).toLocaleString("en-PK")} km`,
            fuelLabel,
          ].join(" | ")}
        </Text>
      </View>
    </Pressable>
  );
}
