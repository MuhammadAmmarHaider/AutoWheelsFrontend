import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAppColors } from "@/constants/app-colors";
import { useTheme } from "@/hooks/use-theme";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { apiRequest } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth-storage";

interface Conversation {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  sender: { id: string; name: string; email: string };
  receiver: { id: string; name: string; email: string };
  listing: {
    id: string;
    title: string;
    year: number;
    price: number;
    images: { id: string; url: string }[];
    brand: { id: string; name: string };
    model: { id: string; name: string };
    city: { id: string; name: string };
  };
}

const HEADER_COLOR = "#032d42";

function formatMessageDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function formatPkr(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ChatScreen() {
  const authGate = useRequireAuth();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      
      const data = await apiRequest<Conversation[]>("/chat/conversations", {
        method: "GET",
      });
      
      // Client-side deduplication: group by sorted user pair + listingId
      const deduplicated = new Map();
      for (const msg of data) {
        const userPair = [msg.senderId, msg.receiverId].sort().join('-');
        const key = `${userPair}-${msg.listingId}`;
        if (!deduplicated.has(key)) {
          deduplicated.set(key, msg);
        } else {
          // Keep the most recent message
          const existing = deduplicated.get(key);
          if (new Date(msg.createdAt) > new Date(existing.createdAt)) {
            deduplicated.set(key, msg);
          }
        }
      }
      
      setConversations(Array.from(deduplicated.values()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authGate === "allowed") {
      void loadConversations();
    }
  }, [authGate, loadConversations]);

  const getOtherUser = (conversation: Conversation) => {
    // Return the other user in the conversation (not the current user)
    if (conversation.senderId === currentUserId) {
      return conversation.receiver;
    }
    return conversation.sender;
  };

  const handleChatPress = (conversation: Conversation) => {
    const otherUser = getOtherUser(conversation);
    router.push({
      pathname: "/chat-detail",
      params: {
        userId: otherUser.id,
        userName: otherUser.name,
        listingId: conversation.listingId,
        listingTitle: conversation.listing.title,
      },
    });
  };

  if (authGate !== "allowed") {
    return (
      <SafeAreaView
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.tabActive} />
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />
      
      {/* Top safe area — dark so status bar background matches header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: HEADER_COLOR }} />

      {/* Main content — bottom safe area handled here with screen bg color */}
      <SafeAreaView
        edges={["bottom"]}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        {/* Header */}
        <View
          style={{ backgroundColor: HEADER_COLOR }}
          className="flex-row items-center gap-3 px-5 pb-4 pt-2"
        >
          <Text className="text-2xl font-bold text-white">Messages</Text>
        </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.tabActive} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-center text-base"
            style={{ color: colors.textSecondary }}
          >
            {error}
          </Text>
          <Pressable
            onPress={loadConversations}
            className="mt-5 rounded-xl px-8 py-3"
            style={{ backgroundColor: colors.tabActive }}
          >
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons
            name="chatbubbles-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text
            className="mt-4 text-center text-lg"
            style={{ color: colors.textSecondary }}
          >
            No conversations yet
          </Text>
          <Text
            className="mt-2 text-center text-sm"
            style={{ color: colors.textSecondary }}
          >
            Start chatting with sellers about cars you're interested in
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const otherUser = getOtherUser(item);
            const carImage = item.listing.images[0]?.url;

            return (
              <Pressable
                onPress={() => handleChatPress(item)}
                className="flex-row items-center p-4 border-b"
                style={{ borderColor: colors.border }}
              >
                {/* Car Image */}
                <View className="mr-4 overflow-hidden rounded-lg">
                  {carImage ? (
                    <Image
                      source={{ uri: carImage }}
                      style={{ width: 60, height: 60 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={{ width: 60, height: 60, backgroundColor: colors.surface }}
                      className="items-center justify-center"
                    >
                      <Ionicons
                        name="car-outline"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>
                  )}
                </View>

                {/* Chat Info */}
                <View className="flex-1">
                  {/* Car Name and Location */}
                  <Text
                    className="text-base font-bold"
                    style={{ color: colors.textPrimary }}
                    numberOfLines={1}
                  >
                    {item.listing.brand.name} {item.listing.model.name}{" "}
                    {item.listing.year}{" "}{item.listing.city.name}
                  </Text>
                  {/* <View className="mt-1 flex-row items-center gap-1">
                    <Ionicons
                      name="location"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {item.listing.city.name}
                    </Text>
                  </View> */}

                  {/* Person Name */}
                  <Text
                    className="mt-1 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {otherUser.name}
                  </Text>

                  {/* Last Message Preview */}
                  <Text
                    className="mt-1 text-sm"
                    style={{ color: colors.textSecondary }}
                    numberOfLines={1}
                  >
                    {item.content}
                  </Text>
                </View>

                {/* Date */}
                <Text
                  className="ml-3 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {formatMessageDate(item.createdAt)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
      </SafeAreaView>
    </>
  );
}
