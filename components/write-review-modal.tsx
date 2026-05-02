import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAppColors } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  newCarId: string;
  newCarName: string;
  isDark: boolean;
  onReviewSubmitted?: () => void;
}

function renderStarRating(
  rating: number,
  onPress: (value: number) => void,
  colors: any,
) {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Pressable key={i} onPress={() => onPress(i + 1)} hitSlop={8}>
          <Ionicons
            name={i < rating ? "star" : "star-outline"}
            size={32}
            color={i < rating ? colors.tabActive : "#ccc"}
          />
        </Pressable>
      ))}
    </View>
  );
}

export default function WriteReviewModal({
  visible,
  onClose,
  newCarId,
  newCarName,
  isDark,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const colors = getAppColors(isDark);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [styleRating, setStyleRating] = useState(0);
  const [comfortRating, setComfortRating] = useState(0);
  const [fuelEconomyRating, setFuelEconomyRating] = useState(0);
  const [performanceRating, setPerformanceRating] = useState(0);
  const [valueForMoneyRating, setValueForMoneyRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const isComplete =
    title.trim().length >= 5 &&
    description.trim().length >= 10 &&
    styleRating > 0 &&
    comfortRating > 0 &&
    fuelEconomyRating > 0 &&
    performanceRating > 0 &&
    valueForMoneyRating > 0;

  const handleSubmit = async () => {
    if (!isComplete) {
      Alert.alert("Incomplete", "Please fill all fields and provide ratings");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          styleRating,
          comfortRating,
          fuelEconomyRating,
          performanceRating,
          valueForMoneyRating,
          newCarId,
        }),
      });

      Alert.alert("Success", "Review submitted successfully!");
      resetForm();
      onClose();
      onReviewSubmitted?.();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to submit review",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStyleRating(0);
    setComfortRating(0);
    setFuelEconomyRating(0);
    setPerformanceRating(0);
    setValueForMoneyRating(0);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 py-3"
          style={{ backgroundColor: "#032d42" }}
        >
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </Pressable>
          <Text className="flex-1 text-lg font-bold text-white pl-3">
            Write a Review
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Car Model Section */}
          <View className="mx-4 mt-5 gap-3">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="car-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                Car model
              </Text>
            </View>
            <View
              className="rounded-xl border px-4 py-3"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Text className="text-base" style={{ color: colors.textPrimary }}>
                {newCarName}
              </Text>
            </View>
          </View>

          {/* Review Title */}
          <View className="mx-4 mt-6 gap-3">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="document-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                Review Title
              </Text>
            </View>
            <TextInput
              className="rounded-xl border px-4 py-3 text-base"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.textPrimary,
              }}
              placeholderTextColor={colors.textSecondary}
              placeholder="Great buy, Excellent value for money, etc."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text
              className="text-xs text-right"
              style={{ color: colors.textSecondary }}
            >
              {title.length}/100
            </Text>
          </View>

          {/* Ratings */}
          <View className="mx-4 mt-6 gap-4">
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.textPrimary }}
            >
              Rating
            </Text>

            <View className="gap-4">
              <View>
                <Text
                  className="mb-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Style {styleRating > 0 && `(${styleRating}/5)`}
                </Text>
                {renderStarRating(styleRating, setStyleRating, colors)}
              </View>

              <View>
                <Text
                  className="mb-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Comfort {comfortRating > 0 && `(${comfortRating}/5)`}
                </Text>
                {renderStarRating(comfortRating, setComfortRating, colors)}
              </View>

              <View>
                <Text
                  className="mb-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Fuel Economy{" "}
                  {fuelEconomyRating > 0 && `(${fuelEconomyRating}/5)`}
                </Text>
                {renderStarRating(
                  fuelEconomyRating,
                  setFuelEconomyRating,
                  colors,
                )}
              </View>

              <View>
                <Text
                  className="mb-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Performance{" "}
                  {performanceRating > 0 && `(${performanceRating}/5)`}
                </Text>
                {renderStarRating(
                  performanceRating,
                  setPerformanceRating,
                  colors,
                )}
              </View>

              <View>
                <Text
                  className="mb-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Value for Money{" "}
                  {valueForMoneyRating > 0 && `(${valueForMoneyRating}/5)`}
                </Text>
                {renderStarRating(
                  valueForMoneyRating,
                  setValueForMoneyRating,
                  colors,
                )}
              </View>
            </View>
          </View>

          {/* Review Description */}
          <View className="mx-4 mt-6 gap-3">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                Write a review
              </Text>
            </View>
            <TextInput
              className="rounded-xl border px-4 py-3 text-base"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                minHeight: 120,
                textAlignVertical: "top",
              }}
              placeholderTextColor={colors.textSecondary}
              placeholder={`Exterior\nInterior (Features, Space and Comfort)\nFuel Economy\nRide Quality and Handling\nFinal Words`}
              value={description}
              onChangeText={setDescription}
              maxLength={1000}
              multiline
            />
            <Text
              className="text-xs text-right"
              style={{ color: colors.textSecondary }}
            >
              {description.length}/1000
            </Text>
          </View>

          {/* Submit Button */}
          <View className="mx-4 mt-8 gap-3 mb-6">
            <Pressable
              onPress={handleSubmit}
              disabled={!isComplete || loading}
              className="rounded-2xl py-3"
              style={{
                backgroundColor: isComplete ? colors.tabActive : colors.border,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center font-semibold text-white">
                  Submit review
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
