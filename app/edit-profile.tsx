import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  Pressable,
  Modal,
  Animated,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import { getAppColors } from "@/constants/app-colors";
import { SELL_NOW_THEME } from "@/constants/sell-now-theme";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
import { PAKISTAN_CITIES } from "@/constants/cities";

const HEADER_COLOR = "#032d42";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  birthday?: string;
  gender?: string;
  role: string;
}

interface SelectModalProps {
  visible: boolean;
  title: string;
  items: { id: string; label: string }[];
  onClose: () => void;
  onSelect: (id: string) => void;
  selectedId?: string;
}

function SelectModal({
  visible,
  title,
  items,
  onClose,
  onSelect,
  selectedId,
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
                        className="flex-row items-center justify-between px-4 py-3"
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
                        {selectedId === item.id && (
                          <Ionicons name="checkmark" size={20} color={theme.header} />
                        )}
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
                        className="flex-row items-center justify-between px-4 py-3"
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
                        {selectedId === item.id && (
                          <Ionicons name="checkmark" size={20} color={theme.header} />
                        )}
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const loadUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await apiRequest<UserProfile>("/auth/me", {
        method: "GET",
      });
      setFullName(user.name || "");
      setEmail(user.email || "");
      setLocation(user.location || "");
      setGender(user.gender || null);
      if (user.birthday) {
        setBirthday(new Date(user.birthday));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUserProfile();
  }, [loadUserProfile]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "Please enter your date of birth";
    return date.toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name.");
      return false;
    }
    if (!location) {
      Alert.alert("Error", "Please select your location.");
      return false;
    }
    if (!birthday) {
      Alert.alert("Error", "Please select your date of birth.");
      return false;
    }
    if (!gender) {
      Alert.alert("Error", "Please select your gender.");
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: fullName.trim(),
          location,
          birthday: birthday?.toISOString(),
          gender,
        }),
      });

      Alert.alert("Success", "Your profile has been updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const cityOptions = PAKISTAN_CITIES.map((city) => ({
    id: city.id,
    label: city.name,
  }));

  const genderOptions = [
    { id: "male", label: "Male" },
    { id: "female", label: "Female" },
    { id: "other", label: "Others" },
  ];

  const selectedCityOption = cityOptions.find((c) => c.id === location);

  if (loading) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />
        <SafeAreaView
          edges={["top"]}
          style={{ backgroundColor: HEADER_COLOR }}
        />
        <SafeAreaView
          edges={["bottom"]}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <View
            style={{ backgroundColor: HEADER_COLOR }}
            className="flex-row items-center gap-3 px-5 pb-4 pt-2"
          >
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </Pressable>
            <Text className="flex-1 text-xl font-bold text-white">
              Edit Profile
            </Text>
          </View>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.tabActive} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />
        <SafeAreaView
          edges={["top"]}
          style={{ backgroundColor: HEADER_COLOR }}
        />
        <SafeAreaView
          edges={["bottom"]}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <View
            style={{ backgroundColor: HEADER_COLOR }}
            className="flex-row items-center gap-3 px-5 pb-4 pt-2"
          >
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </Pressable>
            <Text className="flex-1 text-xl font-bold text-white">
              Edit Profile
            </Text>
          </View>
          <View className="flex-1 items-center justify-center px-8">
            <Text
              className="text-center text-base"
              style={{ color: colors.textSecondary }}
            >
              {error}
            </Text>
            <Pressable
              onPress={() => void loadUserProfile()}
              className="mt-5 rounded-xl px-8 py-3"
              style={{ backgroundColor: colors.tabActive }}
            >
              <Text className="font-semibold text-white">Retry</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </>
    );
  }

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
          <Text className="flex-1 text-xl font-bold text-white">
            Edit Profile
          </Text>
          <View className="w-8" />
        </View>

        {/* ── Body ── */}
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
            <View style={{ backgroundColor: colors.background }} className="px-4 py-4">
              {/* Full Name */}
              <View className="mb-5">
                <View className="mb-2 flex-row items-center gap-2">
                  <Ionicons
                    name="person-circle-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-base font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    Full name
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                </View>
                <TextInput
                  className="rounded-lg border px-4 py-3"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  returnKeyType="next"
                />
              </View>

              {/* Location */}
              <View className="mb-5">
                <View className="mb-2 flex-row items-center gap-2">
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-base font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    Your location
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                </View>
                <Pressable
                  onPress={() => setCityModalVisible(true)}
                  className="flex-row items-center justify-between rounded-lg border px-4 py-3"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color: location ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    {selectedCityOption?.label || "Select your city"}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              {/* Birthday */}
              <View className="mb-5">
                <View className="mb-2 flex-row items-center gap-2">
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-base font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    Your birthday
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center justify-between rounded-lg border px-4 py-3"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color: birthday ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    {formatDate(birthday)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              {/* Email */}
              <View className="mb-5">
                <View className="mb-2 flex-row items-center gap-2">
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-base font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    Your email address
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                </View>
                <TextInput
                  className="rounded-lg border px-4 py-3"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textSecondary,
                  }}
                  value={email}
                  editable={false}
                  selectTextOnFocus={false}
                />
              </View>

              {/* Gender */}
              <View className="mb-6">
                <View className="mb-3 flex-row items-center gap-2">
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-base font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    Please choose a gender
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  {genderOptions.map((option) => (
                    <Pressable
                      key={option.id}
                      onPress={() => setGender(option.id)}
                      className="flex-1 items-center justify-center rounded-full border py-3"
                      style={{
                        borderColor:
                          gender === option.id ? colors.tabActive : colors.border,
                        backgroundColor:
                          gender === option.id ? colors.tabActive : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color:
                            gender === option.id
                              ? "white"
                              : colors.textPrimary,
                        }}
                        className="font-medium"
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <Pressable
                onPress={handleSaveProfile}
                disabled={saving}
                className="rounded-lg px-6 py-3"
                style={{
                  backgroundColor: saving ? colors.border : colors.tabActive,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-center font-semibold text-white">
                      Saving...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center font-semibold text-white">
                    Edit Profile
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={birthday || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* City Modal */}
      <SelectModal
        visible={cityModalVisible}
        title="Select your location"
        items={cityOptions}
        selectedId={location}
        onClose={() => setCityModalVisible(false)}
        onSelect={(cityId) => {
          setLocation(cityId);
          setCityModalVisible(false);
        }}
      />
    </>
  );
}
