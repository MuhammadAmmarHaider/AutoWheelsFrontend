import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAppColors } from "@/hooks/use-theme";

export interface ReviewData {
  id: string;
  title: string;
  description: string;
  styleRating: number;
  comfortRating: number;
  fuelEconomyRating: number;
  performanceRating: number;
  valueForMoneyRating: number;
  overallRating: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ReviewCardProps {
  review: ReviewData;
  isDark: boolean;
  onShowMore?: () => void;
}

function renderStars(rating: number, color: string) {
  return (
    <View className="flex-row gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < Math.round(rating) ? "star" : "star-outline"}
          size={14}
          color={i < Math.round(rating) ? color : "#ccc"}
        />
      ))}
    </View>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function ReviewCard({
  review,
  isDark,
  onShowMore,
}: ReviewCardProps) {
  const colors = getAppColors(isDark);

  return (
    <View
      className="mx-4 mb-4 overflow-hidden rounded-2xl border p-4"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      {/* Header: Title and Overall Rating */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text
            className="text-base font-semibold"
            style={{ color: colors.textPrimary }}
            numberOfLines={2}
          >
            {review.title}
          </Text>
        </View>
        <View className="items-center">
          <Text
            className="text-lg font-bold"
            style={{ color: colors.tabActive }}
          >
            {review.overallRating.toFixed(1)}
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            /5
          </Text>
        </View>
      </View>

      {/* Overall Rating Stars */}
      <View className="mb-3">
        {renderStars(review.overallRating, colors.tabActive)}
      </View>

      {/* User Info and Date */}
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="font-semibold" style={{ color: colors.textPrimary }}>
            {review.user.name}
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {formatDate(review.createdAt)}
          </Text>
        </View>
      </View>

      {/* Category Ratings */}
      <View
        className="mb-3 gap-2 border-t border-b py-3"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Style
          </Text>
          <View>{renderStars(review.styleRating, colors.tabActive)}</View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Comfort
          </Text>
          <View>{renderStars(review.comfortRating, colors.tabActive)}</View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Fuel Economy
          </Text>
          <View>{renderStars(review.fuelEconomyRating, colors.tabActive)}</View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Performance
          </Text>
          <View>{renderStars(review.performanceRating, colors.tabActive)}</View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Value for Money
          </Text>
          <View>
            {renderStars(review.valueForMoneyRating, colors.tabActive)}
          </View>
        </View>
      </View>

      {/* Review Description */}
      <Text
        className="text-sm leading-5"
        style={{ color: colors.textSecondary }}
        numberOfLines={3}
      >
        {review.description}
      </Text>

      {/* Show More Button */}
      {onShowMore && (
        <Pressable onPress={onShowMore} className="mt-2">
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.tabActive }}
          >
            Show more
          </Text>
        </Pressable>
      )}
    </View>
  );
}
