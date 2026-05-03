import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
// This screen shows the details of a specific listing. It fetches the listing details from the API using the ID from the route parameters. The screen displays the listing's images in a carousel, along with its title, price, key features (year, mileage, fuel type, transmission), additional details (registered city, color, model), description, and seller information. It also provides buttons to contact the seller via call, WhatsApp, chat, or SMS. The screen handles loading and error states gracefully.
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAppColors } from "@/constants/app-colors";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
// The ListingDetail interface defines the structure of the listing data that we expect to receive from the API. It includes all the relevant information about the listing, such as title, price, year, mileage, fuel type, transmission, images, brand/model, city, and seller info.
interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  year: number;
  mileage: number;
  bodyColor?: string;
  fuelType: string;
  transmission: string;
  images: { id: string; url: string }[];
  brand: { name: string };
  model: { name: string };
  city: { id: string; name: string };
  registeredCity?: { id: string; name: string } | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  contactName?: string;
  contactPhone?: string;
  allowWhatsapp?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_HEIGHT = 300;

const HEADER_COLOR = "#032d42";

function formatPkr(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const load = useCallback(async () => {
    if (!id || typeof id !== "string") {
      setError("Missing listing ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<ListingDetail>(`/listings/${id}`, {
        method: "GET",
      });
      setListing(data);
    } catch (e) {
      setListing(null);
      setError(e instanceof Error ? e.message : "Could not load details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCallSeller = () => {
    const phoneNumber = listing?.contactPhone || listing?.user?.phone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch(() => {});
    }
  };
// The handleCallSeller function attempts to open the phone dialer with the seller's phone number. It first checks if the listing has a contactPhone specified, and if not, it falls back to the user's phone number. If a phone number is available, it uses Linking.openURL with the "tel:" scheme to open the dialer. If there is an error (e.g., no dialer available), it catches it silently.
  const handleWhatsApp = () => {
    const phoneNumber = listing?.contactPhone || listing?.user?.phone;
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      Linking.openURL(`https://wa.me/${cleanPhone}`).catch(() => {});
    }
  };

  const handleSendMessage = () => {
    router.push({
      pathname: "/chat-detail",
      params: {
        userId: listing?.user?.id,
        userName: listing?.user?.name,
        listingId: listing?.id,
        listingTitle: listing?.title,
      },
    });
  };

  const handleSMS = () => {
    const phoneNumber = listing?.contactPhone || listing?.user?.phone;
    if (phoneNumber) {
      Linking.openURL(`sms:${phoneNumber}`).catch(() => {});
    }
  };

  // Derive header title: "Brand Model Year" once loaded
  const headerTitle = listing
    ? `${listing.brand?.name} ${listing.model?.name} ${listing.year}`
    : "Loading...";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />

      {/* Top safe area — dark so status bar background matches header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: HEADER_COLOR }} />

      {/* Main content — bottom safe area handled here with screen bg color */}
      <SafeAreaView
        edges={["bottom"]}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        {/* ── Styled Header ── */}
        <View
          style={{ backgroundColor: HEADER_COLOR }}
          className="flex-row items-center gap-3 px-5 pb-4 pt-2"
        >
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </Pressable>
          <Text
            className="flex-1 text-xl font-bold text-white"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {loading ? "Loading..." : headerTitle}
          </Text>
        </View>

        {/* ── Body ── */}
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={colors.tabActive} />
            </View>
          ) : error || !listing ? (
            <View className="flex-1 items-center justify-center px-8">
              <Text
                className="text-center text-base"
                style={{ color: colors.textSecondary }}
              >
                {error || "Listing not found."}
              </Text>
              <Pressable
                onPress={() => router.back()}
                className="mt-5 rounded-xl px-8 py-3"
                style={{ backgroundColor: colors.tabActive }}
              >
                <Text className="font-semibold text-white">Go Back</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
              >
                {/* Image Carousel */}
                {listing.images?.length > 0 ? (
                  <View
                    style={{
                      height: IMAGE_HEIGHT,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <FlatList
                      data={listing.images}
                      keyExtractor={(item) => item.id}
                      horizontal
                      pagingEnabled
                      scrollEventThrottle={16}
                      onScroll={(event) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.x / screenWidth,
                        );
                        setCurrentImageIndex(index);
                      }}
                      renderItem={({ item }) => (
                        <Image
                          source={{ uri: item.url }}
                          style={{ width: screenWidth, height: IMAGE_HEIGHT }}
                          contentFit="cover"
                        />
                      )}
                      showsHorizontalScrollIndicator={false}
                    />
                    {/* Image Counter */}
                    <View
                      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                      className="absolute bottom-3 right-3 rounded-lg px-2 py-1"
                    >
                      <Text className="text-xs font-semibold text-white">
                        {currentImageIndex + 1}/{listing.images.length}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      height: IMAGE_HEIGHT,
                      backgroundColor: colors.surface,
                    }}
                    className="items-center justify-center"
                  >
                    <Ionicons
                      name="image-outline"
                      size={48}
                      color={colors.textSecondary}
                    />
                  </View>
                )}

                {/* Title and Price Section */}
                <View
                  className="border-b px-4 py-4"
                  style={{ borderColor: colors.border }}
                >
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: colors.textPrimary }}
                  >
                    {listing.title}
                  </Text>
                  <Text
                    className="mt-2 text-2xl font-bold"
                    style={{ color: colors.tabActive }}
                  >
                    {formatPkr(listing.price)}
                  </Text>
                  <View className="mt-3 flex-row items-center gap-1">
                    <Ionicons
                      name="location"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={{ color: colors.textSecondary }}>
                      {listing.city?.name}
                    </Text>
                  </View>
                </View>

                {/* Key Features */}
                <View
                  className="border-b px-4 py-5"
                  style={{ borderColor: colors.border }}
                >
                  <View className="flex-row justify-around">
                    <View className="items-center gap-2">
                      <View
                        className="rounded-lg p-3"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={24}
                          color={colors.tabActive}
                        />
                      </View>
                      <Text
                        className="text-center text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        {listing.year}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Year
                      </Text>
                    </View>

                    <View className="items-center gap-2">
                      <View
                        className="rounded-lg p-3"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <Ionicons
                          name="speedometer-outline"
                          size={24}
                          color={colors.tabActive}
                        />
                      </View>
                      <Text
                        className="text-center text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        {(listing.mileage / 1000).toFixed(1)}k
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Mileage (km)
                      </Text>
                    </View>

                    <View className="items-center gap-2">
                      <View
                        className="rounded-lg p-3"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <Ionicons
                          name="flame-outline"
                          size={24}
                          color={colors.tabActive}
                        />
                      </View>
                      <Text
                        className="text-center text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        {listing.fuelType}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Fuel
                      </Text>
                    </View>

                    <View className="items-center gap-2">
                      <View
                        className="rounded-lg p-3"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <Ionicons
                          name="settings-outline"
                          size={24}
                          color={colors.tabActive}
                        />
                      </View>
                      <Text
                        className="text-center text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        {listing.transmission === "AUTOMATIC"
                          ? "Auto"
                          : "Manual"}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Trans.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Additional Details */}
                <View
                  className="border-b px-4 py-5"
                  style={{ borderColor: colors.border }}
                >
                  <Text
                    className="mb-4 text-lg font-bold"
                    style={{ color: colors.textPrimary }}
                  >
                    Details
                  </Text>

                  {[
                    {
                      label: "Registered in",
                      value: listing.registeredCity?.name || "Not specified",
                    },
                    {
                      label: "Exterior Color",
                      value: listing.bodyColor || "Not specified",
                    },
                    {
                      label: "Model",
                      value: `${listing.brand?.name} ${listing.model?.name}`,
                    },
                  ].map((item, idx) => (
                    <View
                      key={idx}
                      className="mb-3 flex-row items-center justify-between py-2"
                    >
                      <Text
                        style={{ color: colors.textSecondary }}
                        className="text-sm"
                      >
                        {item.label}
                      </Text>
                      <Text
                        className="font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Description */}
                {listing.description && (
                  <View
                    className="border-b px-4 py-5"
                    style={{ borderColor: colors.border }}
                  >
                    <Text
                      className="mb-3 text-lg font-bold"
                      style={{ color: colors.textPrimary }}
                    >
                      Description
                    </Text>
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="leading-6"
                    >
                      {listing.description}
                    </Text>
                  </View>
                )}

                {/* Seller Information */}
                <View
                  className="border-b px-4 py-5"
                  style={{ borderColor: colors.border }}
                >
                  <Text
                    className="mb-4 text-lg font-bold"
                    style={{ color: colors.textPrimary }}
                  >
                    Seller Information
                  </Text>
                  <View
                    className="rounded-lg p-4"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text
                      className="text-base font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      {listing.user?.name}
                    </Text>
                    {listing.user?.phone && (
                      <Text
                        className="mt-2 text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        Phone: {listing.user.phone}
                      </Text>
                    )}
                    {listing.user?.email && (
                      <Text
                        className="mt-1 text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        Email: {listing.user.email}
                      </Text>
                    )}
                  </View>
                </View>
              </ScrollView>

              {/* Contact Buttons */}
              <View
                className="border-t p-4"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                }}
              >
                <Pressable
                  onPress={handleCallSeller}
                  className="mb-3 flex-row items-center justify-center rounded-lg py-3"
                  style={{ backgroundColor: colors.tabActive }}
                >
                  <Ionicons name="call" size={20} color="white" />
                  <Text className="ml-2 font-semibold text-white">
                    Call Seller
                  </Text>
                </Pressable>

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={handleWhatsApp}
                    className="flex-1 flex-row items-center justify-center rounded-lg border py-3"
                    style={{ borderColor: colors.tabActive }}
                  >
                    <Ionicons
                      name="logo-whatsapp"
                      size={20}
                      color={colors.tabActive}
                    />
                    <Text
                      className="ml-2 font-semibold"
                      style={{ color: colors.tabActive }}
                    >
                      WhatsApp
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSendMessage}
                    className="flex-1 flex-row items-center justify-center rounded-lg border py-3"
                    style={{ borderColor: colors.tabActive }}
                  >
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={20}
                      color={colors.tabActive}
                    />
                    <Text
                      className="ml-2 font-semibold"
                      style={{ color: colors.tabActive }}
                    >
                      Chat
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSMS}
                    className="flex-1 flex-row items-center justify-center rounded-lg border py-3"
                    style={{ borderColor: colors.tabActive }}
                  >
                    <Ionicons
                      name="chatbox-outline"
                      size={20}
                      color={colors.tabActive}
                    />
                    <Text
                      className="ml-2 font-semibold"
                      style={{ color: colors.tabActive }}
                    >
                      SMS
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}
