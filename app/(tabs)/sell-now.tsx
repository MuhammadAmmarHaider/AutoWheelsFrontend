import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { apiRequest, uploadImages } from "@/lib/api";
import { SELL_NOW_THEME } from "@/constants/sell-now-theme";
import { PAKISTAN_CITIES, type City } from "@/constants/cities";
import {
  fetchSellFormOptions,
  fetchCurrentUser,
  clearError,
} from "@/store/slices/listingSlice";
import type { AppDispatch, RootState } from "@/store";
import { getAuthToken } from "@/lib/auth-storage";
import { useRequireAuth } from "@/hooks/use-require-auth";
type ModelOption = {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  fullName: string;
};

type SellFormOptionsResponse = {
  cities: City[];
  models: ModelOption[];
};

type UserMeResponse = {
  id: string;
  name: string;
  phone?: string | null;
};

const BODY_COLOR_OPTIONS = [
  "White",
  "Black",
  "Silver",
  "Gray",
  "Blue",
  "Red",
  "Green",
  "Brown",
  "Golden",
];

const theme = SELL_NOW_THEME ?? {
  header: "#032d42",
  screenBg: "#f3f4f6",
  cardBg: "#ffffff",
  border: "#d6d9df",
  textPrimary: "#30343a",
  textSecondary: "#7b828c",
  button: "#338b9d",
  buttonText: "#ffffff",
};

const BUTTON_COLOR = "#338b9d";

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  value?: string;
  placeholder: string;
  loading?: boolean;
}

function FormField({
  label,
  icon,
  onPress,
  value,
  placeholder,
  loading = false,
}: FormFieldProps) {
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

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.label.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [items, search],
  );

  const popularCities = useMemo(
    () => filteredItems.slice(0, 6),
    [filteredItems],
  );

  const otherCities = useMemo(() => filteredItems.slice(6), [filteredItems]);

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
              {popularCities.length > 0 && (
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
                    {popularCities.map((item, idx) => (
                      <Pressable
                        key={item.id}
                        className="px-4 py-3"
                        style={{
                          borderBottomWidth:
                            idx === popularCities.length - 1 ? 0 : 1,
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

              {otherCities.length > 0 && (
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
                    {otherCities.map((item, idx) => (
                      <Pressable
                        key={item.id}
                        className="px-4 py-3"
                        style={{
                          borderBottomWidth:
                            idx === otherCities.length - 1 ? 0 : 1,
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

export default function SellNowScreen() {
  const router = useRouter();
  const authGate = useRequireAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { sellFormOptions, currentUser, loadingFormOptions, loadingUserData } =
    useSelector((state: RootState) => state.listing);

  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedRegisteredCityId, setSelectedRegisteredCityId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [year, setYear] = useState("");
  const [bodyColor, setBodyColor] = useState("");
  const [kmsDriven, setKmsDriven] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [localImageUris, setLocalImageUris] = useState<string[]>([]);

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [registeredCityModalVisible, setRegisteredCityModalVisible] =
    useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [bodyColorModalVisible, setBodyColorModalVisible] = useState(false);

  // API returns [] when DB has no rows; [] is truthy so `||` would not fall back.
  const cities =
    sellFormOptions?.cities && sellFormOptions.cities.length > 0
      ? sellFormOptions.cities
      : PAKISTAN_CITIES;
  const models = sellFormOptions?.models?.length ? sellFormOptions.models : [];

  const selectedCity = cities.find((city) => city.id === selectedCityId);
  const selectedRegisteredCity = cities.find(
    (city) => city.id === selectedRegisteredCityId,
  );
  const selectedModel = models.find((model) => model.id === selectedModelId);

  useEffect(() => {
    if (authGate !== "allowed") return;
    const initializeData = async () => {
      const token = await getAuthToken();
      dispatch(fetchSellFormOptions());
      dispatch(fetchCurrentUser(token));
    };
    void initializeData();
  }, [authGate, dispatch]);

  useEffect(() => {
    if (currentUser) {
      setContactName(currentUser.name || "");
      setContactPhone(currentUser.phone || "");
    }
  }, [currentUser]);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow media access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as unknown as ImagePicker.MediaTypeOptions,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      const newUris = [...localImageUris, ...selectedUris].slice(0, 8);

      // Update preview immediately
      setLocalImageUris(newUris);

      // Upload images to backend
      setUploading(true);
      try {
        const uploadResult = await uploadImages(newUris);
        setImageUrls(uploadResult.urls);
      } catch (error) {
        // Clear local preview on upload failure
        setLocalImageUris([]);
        setImageUrls([]);

        const message =
          error instanceof Error ? error.message : "Failed to upload images";
        Alert.alert("Upload Error", `${message}\n\nPlease try again.`);
      } finally {
        setUploading(false);
      }
    }
  };

  const validateForm = () => {
    if (imageUrls.length === 0) return "Please upload at least one image.";
    if (!selectedCityId) return "Please select a location city.";
    if (!selectedModelId) return "Please select a car model.";
    if (!year.trim()) return "Please enter model year.";
    if (!selectedRegisteredCityId) return "Please select registered city.";
    if (!bodyColor.trim()) return "Please enter body color.";
    if (!kmsDriven.trim()) return "Please enter KMs driven.";
    if (!description.trim()) return "Please enter description.";
    if (!price.trim()) return "Please enter price.";
    if (!contactName.trim()) return "Please enter your name.";
    if (!contactPhone.trim()) return "Please enter mobile number.";
    return null;
  };

  const onPostAd = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Missing Information", validationError);
      return;
    }

    setPosting(true);
    try {
      await apiRequest("/listings", {
        method: "POST",
        auth: true,
        body: {
          modelId: selectedModelId,
          brandId: selectedModel?.brandId,
          cityId: selectedCityId,
          registeredCityId: selectedRegisteredCityId,
          year: Number(year),
          mileage: Number(kmsDriven),
          bodyColor,
          description,
          price: Number(price),
          contactName,
          contactPhone,
          allowWhatsapp,
          imageUrls: imageUrls,
        },
      });

      setImageUrls([]);
      setLocalImageUris([]);
      setSelectedCityId("");
      setSelectedRegisteredCityId("");
      setSelectedModelId("");
      setYear("");
      setBodyColor("");
      setKmsDriven("");
      setDescription("");
      setPrice("");
      setAllowWhatsapp(false);
      router.replace("/my-ads");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to post ad.";
      Alert.alert("Error", message);
    } finally {
      setPosting(false);
    }
  };

  if (authGate !== "allowed") {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: theme.screenBg }}
        className="flex-1 items-center justify-center"
      >
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={theme.button} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: theme.header }}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.header} />

      <View
        style={{ backgroundColor: theme.header }}
        className="px-5 pb-4 pt-2"
      >
        <View className="flex-row items-center gap-3">
          <Ionicons name="chevron-back" size={26} color="#fff" />
          <Text className="text-2xl font-bold text-white">
            Sell Your Vehicle
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ backgroundColor: theme.screenBg }}
          className="flex-1 px-5"
          contentContainerStyle={{ paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* Image upload section */}
            <Pressable
              style={{
                borderColor: theme.header,
                backgroundColor: theme.cardBg,
              }}
              className="items-center rounded-md border border-dashed p-8"
              onPress={pickImages}
              disabled={uploading}
            >
              <Feather name="upload-cloud" size={34} color={theme.header} />
              <Text
                style={{ color: theme.header }}
                className="mt-2 text-lg font-medium"
              >
                Upload photos
              </Text>
              <Text
                style={{ color: theme.textSecondary }}
                className="mt-1 text-sm"
              >
                {imageUrls.length}/8 uploaded
              </Text>
              {uploading && (
                <ActivityIndicator
                  size="small"
                  color={theme.header}
                  style={{ marginTop: 8 }}
                />
              )}
            </Pressable>

            {imageUrls.length > 0 && (
              <ScrollView
                horizontal
                className="mt-3"
                showsHorizontalScrollIndicator={false}
              >
                <View className="flex-row gap-2">
                  {imageUrls.map((uri) => (
                    <Image
                      key={uri}
                      source={{ uri }}
                      className="h-16 w-16 rounded-md"
                    />
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Location */}
            <FormField
              label="Location"
              icon={
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={theme.textSecondary}
                />
              }
              onPress={() => setCityModalVisible(true)}
              value={selectedCity?.name}
              placeholder="Select your location"
              loading={loadingFormOptions}
            />

            {/* Car Model */}
            <FormField
              label="Car model"
              icon={
                <Ionicons
                  name="car-outline"
                  size={20}
                  color={theme.textSecondary}
                />
              }
              onPress={() => setModelModalVisible(true)}
              value={selectedModel?.fullName}
              placeholder="Select your car model"
              loading={loadingFormOptions}
            />

            {/* Year */}
            <View className="mt-5">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text
                  style={{ color: theme.textPrimary }}
                  className="text-lg font-medium"
                >
                  Year
                </Text>
              </View>
              <TextInput
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  color: theme.textPrimary,
                }}
                className="rounded-md border px-4 py-3"
                placeholder="e.g. 2021"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={year}
                onChangeText={setYear}
              />
            </View>

            {/* Registered City */}
            <FormField
              label="Registered in"
              icon={
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={20}
                  color={theme.textSecondary}
                />
              }
              onPress={() => setRegisteredCityModalVisible(true)}
              value={selectedRegisteredCity?.name}
              placeholder="Select place of registration"
              loading={loadingFormOptions}
            />

            {/* Body Color */}
            <FormField
              label="Body color"
              icon={
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color={theme.textSecondary}
                />
              }
              onPress={() => setBodyColorModalVisible(true)}
              value={bodyColor}
              placeholder="Select your car color"
            />

            {/* KMs Driven */}
            <View className="mt-5">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons
                  name="speedometer-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text
                  style={{ color: theme.textPrimary }}
                  className="text-lg font-medium"
                >
                  KMs driven
                </Text>
              </View>
              <TextInput
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  color: theme.textPrimary,
                }}
                className="rounded-md border px-4 py-3"
                placeholder="e.g. 45000"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={kmsDriven}
                onChangeText={setKmsDriven}
              />
            </View>

            {/* Description */}
            <View className="mt-5">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons
                  name="list-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text
                  style={{ color: theme.textPrimary }}
                  className="text-lg font-medium"
                >
                  Description
                </Text>
              </View>
              <TextInput
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  color: theme.textPrimary,
                }}
                className="rounded-md border px-4 py-3"
                placeholder="For example: Alloy rims, first owner, etc."
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Price */}
            <View className="mt-5">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text
                  style={{ color: theme.textPrimary }}
                  className="text-lg font-medium"
                >
                  Price
                </Text>
              </View>
              <TextInput
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  color: theme.textPrimary,
                }}
                className="rounded-md border px-4 py-3"
                placeholder="Enter price"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            {/* Personal Information Section */}
            <Text
              style={{ color: theme.textSecondary }}
              className="mb-2 mt-8 text-sm font-bold uppercase tracking-wide"
            >
              Personal Information
            </Text>

            {/* Name */}
            <View className="mt-2">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text
                  style={{ color: theme.textPrimary }}
                  className="text-lg font-medium"
                >
                  Name
                </Text>
                {loadingUserData && (
                  <ActivityIndicator size="small" color={theme.textSecondary} />
                )}
              </View>
              <TextInput
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  color: theme.textPrimary,
                }}
                className="rounded-md border px-4 py-3"
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
                value={contactName}
                onChangeText={setContactName}
                editable={!loadingUserData}
              />
            </View>

            {/* Mobile Number */}
            <View className="mt-5">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text
                  style={{ color: theme.textPrimary }}
                  className="text-lg font-medium"
                >
                  Mobile Number
                </Text>
                {loadingUserData && (
                  <ActivityIndicator size="small" color={theme.textSecondary} />
                )}
              </View>
              <TextInput
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  color: theme.textPrimary,
                }}
                className="rounded-md border px-4 py-3"
                placeholder="03xxxxxxxxx"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
                editable={!loadingUserData}
              />
            </View>

            {/* WhatsApp Toggle */}
            <View
              style={{
                borderColor: theme.border,
                backgroundColor: theme.cardBg,
              }}
              className="mt-5 flex-row items-center justify-between rounded-md border px-4 py-3"
            >
              <View>
                <Text
                  style={{ color: theme.textPrimary }}
                  className="text-base font-semibold"
                >
                  Allow WhatsApp Contact
                </Text>
                <Text
                  style={{ color: theme.textSecondary }}
                  className="mt-1 text-xs"
                >
                  Make sure phone and WhatsApp numbers are same
                </Text>
              </View>
              <View className="ml-3">
                <Switch
                  value={allowWhatsapp}
                  onValueChange={setAllowWhatsapp}
                  trackColor={{ false: "#cbd5e1", true: BUTTON_COLOR }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>

            {/* Post Ad Button */}
            <Pressable
              style={{ backgroundColor: BUTTON_COLOR }}
              className="mt-5 mb-6 items-center rounded-md py-3"
              onPress={onPostAd}
              disabled={posting}
            >
              {posting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{ color: theme.buttonText }}
                  className="text-lg font-semibold"
                >
                  Post Ad
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <SelectModal
        visible={cityModalVisible}
        title="Select city"
        items={cities.map((city) => ({ id: city.id, label: city.name }))}
        onClose={() => setCityModalVisible(false)}
        onSelect={setSelectedCityId}
      />

      <SelectModal
        visible={registeredCityModalVisible}
        title="Registered in"
        items={cities.map((city) => ({ id: city.id, label: city.name }))}
        onClose={() => setRegisteredCityModalVisible(false)}
        onSelect={setSelectedRegisteredCityId}
      />

      <SelectModal
        visible={modelModalVisible}
        title="Select car model"
        items={models.map((model) => ({
          id: model.id,
          label: model.fullName,
        }))}
        onClose={() => setModelModalVisible(false)}
        onSelect={setSelectedModelId}
      />

      <SelectModal
        visible={bodyColorModalVisible}
        title="Body color"
        items={BODY_COLOR_OPTIONS.map((color) => ({
          id: color,
          label: color,
        }))}
        onClose={() => setBodyColorModalVisible(false)}
        onSelect={setBodyColor}
      />
    </SafeAreaView>
  );
}
