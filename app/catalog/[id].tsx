import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  View,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { getAppColors } from "@/constants/app-colors";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
import type { CatalogDetailComplete } from "@/types/home-listing";
import ReviewCard from "@/components/review-card";
import WriteReviewModal from "@/components/write-review-modal";
import NewCarCatalogCard from "@/components/new-car-catalog-card";

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_HEIGHT = 300;

function formatPkr(amount: number | null | undefined): string {
  if (!amount || amount === 0) return "Price on request";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface DetailRowProps {
  label: string;
  value: string | number | null | undefined;
  icon?: string;
  colors: any;
}

function DetailRow({ label, value, icon, colors }: DetailRowProps) {
  if (!value) return null;
  return (
    <View className="mb-3 flex-row items-center justify-between py-2">
      <View className="flex-row flex-1 items-center gap-2">
        {icon && (
          <Ionicons name={icon as any} size={16} color={colors.tabActive} />
        )}
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {label}
        </Text>
      </View>
      <Text
        className="font-semibold"
        style={{ color: colors.textPrimary }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export default function CatalogDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const [entry, setEntry] = useState<CatalogDetailComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const load = useCallback(async () => {
    if (!id || typeof id !== "string") {
      setError("Missing id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<CatalogDetailComplete>(`/catalog/${id}`, {
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.tabActive} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !entry) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-center text-base"
            style={{ color: colors.textSecondary }}
          >
            {error || "Specifications not found."}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-5 rounded-xl px-8 py-3"
            style={{ backgroundColor: colors.tabActive }}
          >
            <Text className="font-semibold text-white">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const images = entry.images || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Image Carousel */}
        {images.length > 0 ? (
          <View
            style={{ height: IMAGE_HEIGHT, backgroundColor: colors.surface }}
          >
            <FlatList
              data={images}
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
                {currentImageIndex + 1}/{images.length}
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

        {/* Back Button Overlay */}
        <Pressable
          onPress={() => router.back()}
          className="absolute left-4 top-14 z-10 rounded-full p-2"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>

        {/* Title and Price */}
        <View
          className="border-b px-4 py-4"
          style={{ borderColor: colors.border }}
        >
          <Text
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            {entry.title}
          </Text>
          <Text
            className="mt-2 text-2xl font-bold"
            style={{ color: colors.tabActive }}
          >
            {formatPkr(entry.indicativePrice)}
          </Text>
          <Text
            className="mt-2 text-sm"
            style={{ color: colors.textSecondary }}
          >
            {entry.brand?.name} {entry.model?.name} • {entry.year} •{" "}
            {entry.fuelType} •{" "}
            {entry.transmission === "AUTOMATIC" ? "Automatic" : "Manual"}
          </Text>
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
                {entry.year}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Year
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
                {entry.fuelType}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Fuel Type
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
                {entry.transmission === "AUTOMATIC" ? "Auto" : "Manual"}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Trans.
              </Text>
            </View>

            {entry.engineDetails?.horsepower && (
              <View className="items-center gap-2">
                <View
                  className="rounded-lg p-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons
                    name="flash-outline"
                    size={24}
                    color={colors.tabActive}
                  />
                </View>
                <Text
                  className="text-center text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  {entry.engineDetails.horsepower}
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  HP
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {entry.description && (
          <View
            className="border-b px-4 py-5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="mb-3 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Overview
            </Text>
            <Text style={{ color: colors.textSecondary }} className="leading-6">
              {entry.description}
            </Text>
          </View>
        )}

        {/* Features */}
        {entry.features && entry.features.length > 0 && (
          <View
            className="border-b px-4 py-5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="mb-3 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Features
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {entry.features.map((feature, idx) => (
                <View
                  key={idx}
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Engine Details */}
        {entry.engineDetails && (
          <View
            className="border-b px-4 py-5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="mb-4 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Engine
            </Text>
            <DetailRow
              label="Engine Type"
              value={entry.engineDetails.type}
              icon="settings-outline"
              colors={colors}
            />
            <DetailRow
              label="Displacement"
              value={
                entry.engineDetails.displacement
                  ? `${entry.engineDetails.displacement} cc`
                  : undefined
              }
              colors={colors}
            />
            <DetailRow
              label="Cylinders"
              value={entry.engineDetails.cylinders}
              colors={colors}
            />
            <DetailRow
              label="Horsepower"
              value={entry.engineDetails.horsepower}
              colors={colors}
            />
            <DetailRow
              label="Torque"
              value={entry.engineDetails.torque}
              colors={colors}
            />
            <DetailRow
              label="Drivetrain"
              value={entry.engineDetails.drivetrain}
              colors={colors}
            />
            <DetailRow
              label="Max Speed"
              value={
                entry.engineDetails.maxSpeed
                  ? `${entry.engineDetails.maxSpeed} km/h`
                  : undefined
              }
              colors={colors}
            />
            {entry.engineDetails.turbocharged && (
              <View className="my-2 rounded-lg bg-blue-100 px-3 py-2 dark:bg-blue-900">
                <Text className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                  🔧 Turbocharged
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Dimensions */}
        {entry.dimensions && (
          <View
            className="border-b px-4 py-5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="mb-4 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Dimensions
            </Text>
            <DetailRow
              label="Length"
              value={
                entry.dimensions.length
                  ? `${entry.dimensions.length} mm`
                  : undefined
              }
              colors={colors}
            />
            <DetailRow
              label="Width"
              value={
                entry.dimensions.width
                  ? `${entry.dimensions.width} mm`
                  : undefined
              }
              colors={colors}
            />
            <DetailRow
              label="Height"
              value={
                entry.dimensions.height
                  ? `${entry.dimensions.height} mm`
                  : undefined
              }
              colors={colors}
            />
            <DetailRow
              label="Wheelbase"
              value={
                entry.dimensions.wheelbase
                  ? `${entry.dimensions.wheelbase} mm`
                  : undefined
              }
              colors={colors}
            />
            <DetailRow
              label="Ground Clearance"
              value={
                entry.dimensions.groundClearance
                  ? `${entry.dimensions.groundClearance} mm`
                  : undefined
              }
              colors={colors}
            />
            <DetailRow
              label="Boot Space"
              value={
                entry.dimensions.bootSpace
                  ? `${entry.dimensions.bootSpace} L`
                  : undefined
              }
              colors={colors}
            />
            <DetailRow
              label="Doors"
              value={entry.dimensions.doors}
              colors={colors}
            />
            <DetailRow
              label="Seating"
              value={entry.dimensions.seating}
              colors={colors}
            />
          </View>
        )}

        {/* Transmission */}
        {entry.transmissionDetails && (
          <View
            className="border-b px-4 py-5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="mb-4 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Transmission
            </Text>
            <DetailRow
              label="Type"
              value={entry.transmissionDetails.type}
              colors={colors}
            />
            <DetailRow
              label="Gearbox"
              value={entry.transmissionDetails.gearbox}
              colors={colors}
            />
          </View>
        )}

        {/* Wheels */}
        {entry.wheels && (
          <View
            className="border-b px-4 py-5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="mb-4 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Wheels & Tyres
            </Text>
            <DetailRow
              label="Wheel Type"
              value={entry.wheels.wheelType}
              colors={colors}
            />
            <DetailRow
              label="Wheel Size"
              value={entry.wheels.wheelSize}
              colors={colors}
            />
            <DetailRow
              label="Tyre Size"
              value={entry.wheels.tyreSize}
              colors={colors}
            />
            <DetailRow
              label="Spare Tyre Size"
              value={entry.wheels.spareTyreSize}
              colors={colors}
            />
          </View>
        )}

        {/* Fuel Economy */}
        {entry.fuelEconomy && (
          <View
            className="border-b px-4 py-5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="mb-4 text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Fuel Economy
            </Text>
            <DetailRow
              label="City Mileage"
              value={
                entry.fuelEconomy.cityMileage
                  ? `${entry.fuelEconomy.cityMileage} km/l`
                  : undefined
              }
              colors={colors}
            />
            <DetailRow
              label="Highway Mileage"
              value={
                entry.fuelEconomy.highwayMileage
                  ? `${entry.fuelEconomy.highwayMileage} km/l`
                  : undefined
              }
              colors={colors}
            />
            <DetailRow
              label="Tank Capacity"
              value={
                entry.fuelEconomy.tankCapacity
                  ? `${entry.fuelEconomy.tankCapacity} L`
                  : undefined
              }
              colors={colors}
            />
          </View>
        )}

        {/* Steering & Suspension */}
        {(entry.steering || entry.suspension) && (
          <View
            className="border-b px-4 py-5"
            style={{ borderColor: colors.border }}
          >
            {entry.steering && (
              <>
                <Text
                  className="mb-4 text-lg font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Steering
                </Text>
                <DetailRow
                  label="Type"
                  value={entry.steering.type}
                  colors={colors}
                />
                <DetailRow
                  label="Turning Radius"
                  value={
                    entry.steering.turningRadius
                      ? `${entry.steering.turningRadius} m`
                      : undefined
                  }
                  colors={colors}
                />
                {entry.steering.powerAssisted && (
                  <View className="my-2 rounded-lg bg-green-100 px-3 py-2 dark:bg-green-900">
                    <Text className="text-xs font-semibold text-green-900 dark:text-green-100">
                      ✓ Power Assisted
                    </Text>
                  </View>
                )}
              </>
            )}

            {entry.suspension && (
              <>
                <Text
                  className="mb-4 mt-4 text-lg font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Suspension & Brakes
                </Text>
                <DetailRow
                  label="Front Suspension"
                  value={entry.suspension.front}
                  colors={colors}
                />
                <DetailRow
                  label="Front Brakes"
                  value={entry.suspension.frontBrakes}
                  colors={colors}
                />
                <DetailRow
                  label="Rear Suspension"
                  value={entry.suspension.rear}
                  colors={colors}
                />
                <DetailRow
                  label="Rear Brakes"
                  value={entry.suspension.rearBrakes}
                  colors={colors}
                />
              </>
            )}
          </View>
        )}

        {/* Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
