import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// This screen allows users to write a review for a specific car model. It fetches the car details using the provided ID, and allows the user to select the car model, enter a review title, write their review, and rate different aspects of the car (style, comfort, fuel economy, performance, value for money). The user can submit their review, which sends the data to the API. The screen also handles loading states and errors gracefully.
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAppColors } from "@/constants/app-colors";
import { SELL_NOW_THEME } from "@/constants/sell-now-theme";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
import type { CatalogDetailComplete } from "@/types/home-listing";

type ModelOption = {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  fullName: string;
};

type SellFormOptionsResponse = {
  cities: any[];
  models: ModelOption[];
};

const HEADER_COLOR = "#032d42";

interface RatingState {
  style: number;
  comfort: number;
  fuelEconomy: number;
  performance: number;
  valueForMoney: number;
}

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  value?: string;
  placeholder?: string;
  loading?: boolean;
}
// Note: The code for the SelectModal component is included in this file for simplicity, but in a real app it would be better to extract it into its own file for reusability and cleaner code organization.
function FormField({
  label,
  icon,
  onPress,
  value,
  placeholder,
  loading = false,
}: FormFieldProps) {
  const theme = SELL_NOW_THEME;

  return (
    <View className="mt-5">
      <View className="mb-2 flex-row items-center gap-2">
        {icon}
        <Text
          style={{ color: theme.textPrimary }}
          className="text-lg font-medium"
        >
          {label}
        </Text>
        {loading && (
          <ActivityIndicator size="small" color={theme.textSecondary} />
        )}
      </View>
      <Pressable
        onPress={onPress}
        disabled={loading}
        style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
        className="flex-row items-center justify-between rounded-md border px-4 py-3"
      >
        <Text
          style={{ color: value ? theme.textPrimary : theme.textSecondary }}
          className="text-base"
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.textSecondary}
        />
      </Pressable>
    </View>
  );
}
// The SelectModal component is a reusable modal that shows a searchable list of items for the user to select from. It handles its own search state and animations for appearing and disappearing. It also supports categorizing items into "Popular" and "Other" sections based on the order of the provided items.

interface SelectModalProps {
  visible: boolean;
  title: string;
  items: { id: string; label: string }[];
  onClose: () => void;
  onSelect: (id: string) => void;
}

function SelectModal({
  visible,
  title,
  items,
  onClose,
  onSelect,
}: SelectModalProps) {
  const [search, setSearch] = useState("");
  const translateY = useRef(new Animated.Value(0)).current;
  const theme = SELL_NOW_THEME;

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.label.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [items, search],
  );

  const popularItems = useMemo(
    () => filteredItems.slice(0, 6),
    [filteredItems],
  );
  const otherItems = useMemo(() => filteredItems.slice(6), [filteredItems]);

  const handleClose = () => {
    setSearch("");
    Animated.timing(translateY, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };
// The pan responder allows the user to drag the modal down to dismiss it. It tracks the vertical movement and if the user drags it down far enough or with enough velocity, it triggers the close animation and callback.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 10 &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: 800,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setSearch("");
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={handleClose}
      >
        <SafeAreaView
          edges={["bottom"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "85%",
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              backgroundColor: theme.screenBg,
              paddingHorizontal: 16,
              paddingTop: 16,
              transform: [{ translateY }],
            }}
            onStartShouldSetResponder={() => true}
          >
            {/* Drag Handle */}
            <View
              className="mb-4 items-center py-2"
              {...panResponder.panHandlers}
            >
              <View className="h-1.5 w-16 rounded-full bg-slate-300" />
            </View>

            <Text
              style={{ color: theme.textPrimary }}
              className="text-xl font-semibold"
            >
              {title}
            </Text>

            <TextInput
              style={{
                borderColor: theme.border,
                backgroundColor: theme.cardBg,
                color: theme.textPrimary,
              }}
              className="mt-3 rounded-xl border px-4 py-3"
              placeholder="Search..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
            />

            <ScrollView className="mt-4 flex-1" bounces={false}>
              {popularItems.length > 0 && (
                <>
                  <Text
                    style={{ color: theme.textPrimary }}
                    className="mb-2 text-lg font-medium"
                  >
                    Popular
                  </Text>
                  <View
                    style={{ borderColor: theme.border }}
                    className="mb-5 overflow-hidden rounded-2xl border bg-white"
                  >
                    {popularItems.map((item, idx) => (
                      <Pressable
                        key={item.id}
                        className="px-4 py-3"
                        style={{
                          borderBottomWidth:
                            idx === popularItems.length - 1 ? 0 : 1,
                          borderColor: theme.border,
                        }}
                        onPress={() => {
                          onSelect(item.id);
                          handleClose();
                        }}
                      >
                        <Text
                          style={{ color: theme.textPrimary }}
                          className="text-base"
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {otherItems.length > 0 && (
                <>
                  <Text
                    style={{ color: theme.textPrimary }}
                    className="mb-2 text-lg font-medium"
                  >
                    Other
                  </Text>
                  <View
                    style={{ borderColor: theme.border }}
                    className="mb-5 overflow-hidden rounded-2xl border bg-white"
                  >
                    {otherItems.map((item, idx) => (
                      <Pressable
                        key={item.id}
                        className="px-4 py-3"
                        style={{
                          borderBottomWidth:
                            idx === otherItems.length - 1 ? 0 : 1,
                          borderColor: theme.border,
                        }}
                        onPress={() => {
                          onSelect(item.id);
                          handleClose();
                        }}
                      >
                        <Text
                          style={{ color: theme.textPrimary }}
                          className="text-base"
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {filteredItems.length === 0 && (
                <Text style={{ color: theme.textSecondary }} className="mt-3">
                  No matching results
                </Text>
              )}
            </ScrollView>

            <Pressable
              style={{ backgroundColor: theme.header }}
              className="mt-3 mb-2 items-center rounded-xl py-3"
              onPress={handleClose}
            >
              <Text className="font-semibold text-white">Close</Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

export default function WriteReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const [entry, setEntry] = useState<CatalogDetailComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carModalVisible, setCarModalVisible] = useState(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);

  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [ratings, setRatings] = useState<RatingState>({
    style: 0,
    comfort: 0,
    fuelEconomy: 0,
    performance: 0,
    valueForMoney: 0,
  });

  // Ref for the review text input so we can scroll to it
  const scrollViewRef = useRef<ScrollView>(null);
  const reviewTextInputRef = useRef<TextInput>(null);

  const load = useCallback(async () => {
    if (!id || typeof id !== "string") {
      setError("Missing id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setLoadingModels(true);

    try {
      // Load car details
      const data = await apiRequest<CatalogDetailComplete>(`/catalog/${id}`, {
        method: "GET",
      });
      setEntry(data);

      // Load all available models for selection
      try {
        const formOptions = await apiRequest<SellFormOptionsResponse>(
          "/listings/sell-form/options",
          { method: "GET" },
        );
        const allModels = formOptions.models || [];
        setModels(allModels);

        // FIX: compare brandName (string) to brand.name (string), not brandId to name
        const currentModel = allModels.find(
          (m) =>
            m.name === data.model?.name && m.brandName === data.brand?.name,
        );
        if (currentModel) {
          setSelectedModel(currentModel);
        }
      } catch (formError) {
        console.error("Failed to load models:", formError);
        setModels([]);
      }
    } catch (e) {
      setEntry(null);
      setError(e instanceof Error ? e.message : "Could not load details.");
    } finally {
      setLoading(false);
      setLoadingModels(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRatingChange = (category: keyof RatingState, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const renderStars = (
    category: keyof RatingState,
    interactive: boolean = true,
  ) => {
    return (
      <View className="flex-row gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => interactive && handleRatingChange(category, i + 1)}
            disabled={!interactive}
          >
            <Ionicons
              name={i < ratings[category] ? "star" : "star-outline"}
              size={24}
              color={i < ratings[category] ? colors.tabActive : "#ccc"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const calculateOverallRating = (): number => {
    const values = Object.values(ratings);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  };

  const validateForm = (): boolean => {
    if (!reviewTitle.trim()) {
      Alert.alert("Error", "Please enter a review title.");
      return false;
    }
    if (!reviewText.trim()) {
      Alert.alert("Error", "Please write a review.");
      return false;
    }
    if (Object.values(ratings).some((rating) => rating === 0)) {
      Alert.alert("Error", "Please rate all categories.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !entry) return;

    setSubmitting(true);
    try {
      await apiRequest(`/catalog/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          title: reviewTitle.trim(),
          description: reviewText.trim(),
          styleRating: ratings.style,
          comfortRating: ratings.comfort,
          fuelEconomyRating: ratings.fuelEconomy,
          performanceRating: ratings.performance,
          valueForMoneyRating: ratings.valueForMoney,
          overallRating: calculateOverallRating(),
        }),
      });

      Alert.alert("Success", "Your review has been submitted successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to submit review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />

      {/* Top safe area — dark so status bar background matches header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: HEADER_COLOR }} />

      {/* Main content */}
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
            Write a Review
          </Text>
          <View className="w-8" />
        </View>

        {/* ── Body ── */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.tabActive} />
          </View>
        ) : error || !entry ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text
              className="text-center text-base"
              style={{ color: colors.textSecondary }}
            >
              {error || "Details not found."}
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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              className="flex-1"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View className="px-4 py-4">
                {/* Car Model */}
                <FormField
                  label="Car model"
                  icon={
                    <Ionicons
                      name="car-outline"
                      size={20}
                      color={SELL_NOW_THEME.textSecondary}
                    />
                  }
                  onPress={() => setCarModalVisible(true)}
                  value={selectedModel?.fullName || entry.title}
                  placeholder="Select your car model"
                  loading={loadingModels}
                />

                {/* Review Title */}
                <View className="mt-5 mb-2">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={SELL_NOW_THEME.textSecondary}
                    />
                    <Text
                      className="text-lg font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      Review Title
                    </Text>
                  </View>
                  <TextInput
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      color: colors.textPrimary,
                    }}
                    placeholder="Great buy, Excellent value for money, etc."
                    placeholderTextColor={colors.textSecondary}
                    value={reviewTitle}
                    onChangeText={setReviewTitle}
                    returnKeyType="next"
                    onSubmitEditing={() => reviewTextInputRef.current?.focus()}
                  />
                </View>

                {/* Ratings */}
                <View className="mt-5 mb-2">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons
                      name="star-outline"
                      size={20}
                      color={SELL_NOW_THEME.textSecondary}
                    />
                    <Text
                      className="text-lg font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      Rating
                    </Text>
                  </View>

                  <View
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      gap: 16,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text style={{ color: colors.textPrimary }}>Style</Text>
                      {renderStars("style")}
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text style={{ color: colors.textPrimary }}>Comfort</Text>
                      {renderStars("comfort")}
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text style={{ color: colors.textPrimary }}>
                        Fuel Economy
                      </Text>
                      {renderStars("fuelEconomy")}
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text style={{ color: colors.textPrimary }}>
                        Performance
                      </Text>
                      {renderStars("performance")}
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text style={{ color: colors.textPrimary }}>
                        Value for Money
                      </Text>
                      {renderStars("valueForMoney")}
                    </View>
                  </View>
                </View>

                {/* Review Text */}
                <View className="mt-5 mb-2">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={SELL_NOW_THEME.textSecondary}
                    />
                    <Text
                      className="text-lg font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      Write a review
                    </Text>
                  </View>
                  <TextInput
                    ref={reviewTextInputRef}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      color: colors.textPrimary,
                      minHeight: 120,
                    }}
                    placeholder="Exterior, Interior (Features, Space and Comfort), Performance, Fuel Economy, Value for Money, etc."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    textAlignVertical="top"
                    value={reviewText}
                    onChangeText={setReviewText}
                    // Scroll the ScrollView so this field stays visible when keyboard opens
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 300);
                    }}
                  />
                </View>

                {/* Overall Rating Display */}
                <View
                  className="mt-5 mb-2 rounded-xl border p-4 items-center"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    className="mb-1 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Overall Rating
                  </Text>
                  <View className="flex-row items-end gap-1">
                    <Text
                      className="text-3xl font-bold"
                      style={{ color: colors.tabActive }}
                    >
                      {calculateOverallRating().toFixed(1)}
                    </Text>
                    <Text
                      className="text-base mb-1"
                      style={{ color: colors.textSecondary }}
                    >
                      /5
                    </Text>
                  </View>
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={submitting}
                  className="mt-4 rounded-xl px-6 py-3"
                  style={{
                    backgroundColor: submitting
                      ? colors.border
                      : colors.tabActive,
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? (
                    <View className="flex-row items-center justify-center gap-2">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="font-semibold text-white">
                        Submitting...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center font-semibold text-white">
                      Submit Review
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>

      {/* Car Model Modal */}
      <SelectModal
        visible={carModalVisible}
        title="Select car model"
        items={models.map((model) => ({
          id: model.id,
          label: model.fullName,
        }))}
        onClose={() => setCarModalVisible(false)}
        onSelect={(modelId) => {
          const selected = models.find((m) => m.id === modelId);
          if (selected) {
            setSelectedModel(selected);
          }
        }}
      />
    </>
  );
}
