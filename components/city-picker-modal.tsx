import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { getAppColors } from "@/constants/app-colors";

export type CityOption = { id: string; name: string };

type Colors = ReturnType<typeof getAppColors>;
// The CityPickerModal component is a modal that allows users to select a city from a list of options. It receives props for visibility, closing the modal, the list of cities, the currently selected city ID, a callback for when a city is selected, and the app's color scheme. The modal displays a header with a title and a close button, followed by a scrollable list of cities. Each city option is pressable, and when selected, it calls the onSelect callback with the chosen city and closes the modal. There is also an option to select "All Pakistan" which corresponds to no specific city selection.
type CityPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  cities: CityOption[];
  selectedId: string | null;
  onSelect: (city: CityOption | null) => void;
  colors: Colors;
};

export function CityPickerModal({
  visible,
  onClose,
  cities,
  selectedId,
  onSelect,
  colors,
}: CityPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <SafeAreaView
          edges={["bottom"]}
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "72%",
          }}
        >
          <View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              Location
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={26} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            className="px-4 py-3"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              onPress={() => {
                onSelect(null);
                onClose();
              }}
              className="mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3"
              style={{
                borderColor: selectedId === null ? colors.tabActive : colors.border,
                backgroundColor:
                  selectedId === null ? `${colors.tabActive}14` : "transparent",
              }}
            >
              <Text style={{ color: colors.textPrimary }} className="text-base font-medium">
                All Pakistan
              </Text>
              {selectedId === null && (
                <Ionicons name="checkmark-circle" size={22} color={colors.tabActive} />
              )}
            </Pressable>

            {cities.map((city) => {
              const sel = selectedId === city.id;
              return (
                <Pressable
                  key={city.id}
                  onPress={() => {
                    onSelect(city);
                    onClose();
                  }}
                  className="mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3"
                  style={{
                    borderColor: sel ? colors.tabActive : colors.border,
                    backgroundColor: sel ? `${colors.tabActive}14` : "transparent",
                  }}
                >
                  <Text
                    style={{ color: colors.textPrimary }}
                    className="text-base font-medium"
                  >
                    {city.name}
                  </Text>
                  {sel && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.tabActive} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
