
"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { getSocket } from "@/lib/socket";

type MessageNotificationContextType = {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  clearUnreadCount: () => void;
};

const MessageNotificationContext =
  createContext<MessageNotificationContextType | null>(null);

type MessageNotificationProviderProps = {
  children: ReactNode;
};

type ConversationsResponse = {
  success: boolean;
  conversations?: Array<{
    unread?: number;
  }>;
  message?: string;
};

type SocketMessagePayload = {
  conversationId: string;
  message: {
    id?: string;
    _id?: string;
    senderId: string;
    receiverId: string;
    text: string;
    read: boolean;
    createdAt?: string;
  };
};

type MessagesUpdatedDetail = {
  unreadCount?: number;
};

export function MessageNotificationProvider({
  children,
}: MessageNotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);

  const refreshUnreadCount = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      const response = await fetch("/api/conversations", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) return;

      const data: ConversationsResponse = await response.json();

      if (!data.success) return;

      // Ignore outdated requests and responses after unmount.
      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      const totalUnread = (data.conversations || []).reduce(
        (total, conversation) =>
          total + Math.max(0, Number(conversation.unread) || 0),
        0,
      );

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("MESSAGE_NOTIFICATION_ERROR:", error);
    }
  }, []);

  const clearUnreadCount = useCallback(() => {
    // Prevent an older in-flight request from restoring the badge.
    requestIdRef.current += 1;
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refreshUnreadCount();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [refreshUnreadCount]);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      void refreshUnreadCount();
    };

    const handleNewMessage = (payload: SocketMessagePayload) => {
      if (!payload?.message?.receiverId) return;

      void refreshUnreadCount();
    };

    const handleMessagesUpdated = (event: Event) => {
      const customEvent =
        event as CustomEvent<MessagesUpdatedDetail>;

      const nextCount = customEvent.detail?.unreadCount;

      if (typeof nextCount === "number" && Number.isFinite(nextCount)) {
        // Update the badge immediately using the page's latest local count.
        requestIdRef.current += 1;
        setUnreadCount(Math.max(0, nextCount));
        return;
      }

      // Events without a count indicate that the API should be rechecked.
      void refreshUnreadCount();
    };

    socket.on("connect", handleConnect);
    socket.on("message:new", handleNewMessage);

    window.addEventListener("messages:updated", handleMessagesUpdated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("message:new", handleNewMessage);

      window.removeEventListener(
        "messages:updated",
        handleMessagesUpdated,
      );
    };
  }, [refreshUnreadCount]);

  return (
    <MessageNotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        clearUnreadCount,
      }}
    >
      {children}
    </MessageNotificationContext.Provider>
  );
}

export function useMessageNotifications() {
  const context = useContext(MessageNotificationContext);

  if (!context) {
    throw new Error(
      "useMessageNotifications must be used inside MessageNotificationProvider",
    );
  }

  return context;
}