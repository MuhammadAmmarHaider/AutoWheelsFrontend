import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// This screen shows the chat conversation between the current user and another user regarding a specific listing. It fetches the messages from the API based on the user ID and listing ID passed in the route parameters. The screen displays the messages in a scrollable view, with different styling for sent and received messages. It also includes an input area at the bottom for sending new messages, which calls the API to send the message and then refreshes the message list. The screen handles loading and error states gracefully, and ensures that only authenticated users can access it.
import { getAppColors } from "@/constants/app-colors";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth-storage";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: { id: string; name: string; email: string };
  receiver: { id: string; name: string; email: string };
}

const HEADER_COLOR = "#032d42";

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ChatDetailScreen() {
  const authGate = useRequireAuth();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);

  const params = useLocalSearchParams<{
    userId: string;
    userName: string;
    listingId: string;
    listingTitle: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!params.userId || !params.listingId) {
      setError("Missing required parameters.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      
      const data = await apiRequest<Message[]>(
        `/chat/messages/${params.userId}/${params.listingId}`,
        { method: "GET" }
      );
      setMessages(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, [params.userId, params.listingId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !params.userId || !params.listingId) {
      return;
    }

    setSending(true);
    try {
      const newMessage = await apiRequest<Message>("/chat/send", {
        method: "POST",
        body: {
          receiverId: params.userId,
          listingId: params.listingId,
          content: messageText.trim(),
        },
      });
      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");
      
      // Refresh messages to ensure we have the latest from both parties
      await loadMessages();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (authGate !== "allowed") {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />
        <SafeAreaView
          edges={["top"]}
          style={{ backgroundColor: HEADER_COLOR }}
        />
        <SafeAreaView
          style={{ backgroundColor: colors.background }}
          className="flex-1 items-center justify-center"
        >
          <ActivityIndicator size="large" color={colors.tabActive} />
        </SafeAreaView>
      </>
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
        {/* ── Styled Header ── */}
        <View
          style={{ backgroundColor: HEADER_COLOR }}
          className="flex-row items-center gap-3 px-5 pb-4 pt-2"
        >
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white" numberOfLines={1}>
              {params.userName || "Chat"}
            </Text>
            <Text
              className="text-sm text-white/70"
              numberOfLines={1}
            >
              {params.listingTitle || "Listing"}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
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
                onPress={loadMessages}
                className="mt-5 rounded-xl px-8 py-3"
                style={{ backgroundColor: colors.tabActive }}
              >
                <Text className="font-semibold text-white">Retry</Text>
              </Pressable>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <Ionicons
                name="chatbubble-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text
                className="mt-4 text-center text-lg"
                style={{ color: colors.textSecondary }}
              >
                No messages yet
              </Text>
              <Text
                className="mt-2 text-center text-sm"
                style={{ color: colors.textSecondary }}
              >
                Start the conversation by sending a message
              </Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1 px-4 py-4"
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {messages.map((message) => {
                const isCurrentUser = message.senderId === currentUserId;
                return (
                  <View
                    key={message.id}
                    className={`mb-3 max-w-[80%] rounded-2xl px-4 py-3 ${
                      isCurrentUser ? "self-end" : "self-start"
                    }`}
                    style={{
                      backgroundColor: isCurrentUser
                        ? colors.tabActive
                        : colors.surface,
                    }}
                  >
                    <Text
                      className="text-base"
                      style={{ color: isCurrentUser ? "#fff" : colors.textPrimary }}
                    >
                      {message.content}
                    </Text>
                    <Text
                      className={`mt-1 text-xs ${
                        isCurrentUser ? "text-right" : "text-left"
                      }`}
                      style={{ color: isCurrentUser ? "rgba(255,255,255,0.7)" : colors.textSecondary }}
                    >
                      {formatMessageTime(message.createdAt)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Input Area */}
          <View
            className="border-t px-4 py-3"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
          >
            <View className="flex-row items-center gap-3">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
                className="flex-1 rounded-full px-4 py-3"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                }}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={handleSendMessage}
                disabled={!messageText.trim() || sending}
                className="rounded-full p-3"
                style={{
                  backgroundColor: messageText.trim() && !sending
                    ? colors.tabActive
                    : colors.surface,
                }}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons
                    name="send"
                    size={20}
                    color={messageText.trim() ? "#fff" : colors.textSecondary}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
