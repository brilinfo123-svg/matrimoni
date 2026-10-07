"use client";

import {
  createContext,
  ReactNode,
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
  createContext<MessageNotificationContextType | null>(
    null,
  );

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

export function MessageNotificationProvider({
  children,
}: MessageNotificationProviderProps) {
  const [unreadCount, setUnreadCount] =
    useState(0);

  const mountedRef = useRef(false);

  /*
   * -----------------------------------------
   * Load unread messages from API
   * -----------------------------------------
   */
  const refreshUnreadCount = async () => {
    try {
      const response = await fetch(
        "/api/conversations",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return;
      }

      const data: ConversationsResponse =
        await response.json();

      if (!data.success) {
        return;
      }

      const conversations =
        data.conversations || [];

      const totalUnread =
        conversations.reduce(
          (total, conversation) =>
            total +
            (Number(
              conversation.unread,
            ) || 0),
          0,
        );

      if (mountedRef.current) {
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error(
        "MESSAGE_NOTIFICATION_ERROR:",
        error,
      );
    }
  };

  /*
   * -----------------------------------------
   * Clear badge
   * -----------------------------------------
   */
  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  /*
   * -----------------------------------------
   * Initial unread count
   * -----------------------------------------
   */
  useEffect(() => {
    mountedRef.current = true;

    refreshUnreadCount();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /*
   * -----------------------------------------
   * Socket.IO
   * -----------------------------------------
   */
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      console.log(
        "MESSAGE NOTIFICATION SOCKET CONNECTED:",
        socket.id,
      );

      /*
       * Re-sync unread count whenever
       * socket connects/reconnects.
       */
      refreshUnreadCount();
    };

    /*
     * -----------------------------------------
     * NEW MESSAGE
     * -----------------------------------------
     */
    const handleNewMessage = (
      payload: SocketMessagePayload,
    ) => {
      console.log(
        "HEADER MESSAGE NOTIFICATION:",
        payload,
      );

      if (
        !payload?.message ||
        !payload.message.receiverId
      ) {
        return;
      }

      /*
       * Do NOT blindly increment here.
       *
       * Instead fetch latest unread count
       * from database/API.
       *
       * This prevents duplicate count when
       * socket reconnects or multiple tabs
       * are open.
       */
      refreshUnreadCount();
    };

    /*
     * -----------------------------------------
     * Message was read somewhere
     * -----------------------------------------
     *
     * Messages page will dispatch:
     *
     * window.dispatchEvent(
     *   new Event("messages:updated")
     * )
     *
     * after opening/reading a conversation.
     */
    const handleMessagesUpdated = () => {
      refreshUnreadCount();
    };

    socket.on(
      "connect",
      handleConnect,
    );

    socket.on(
      "message:new",
      handleNewMessage,
    );

    window.addEventListener(
      "messages:updated",
      handleMessagesUpdated,
    );

    /*
     * -----------------------------------------
     * Cleanup
     * -----------------------------------------
     */
    return () => {
      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "message:new",
        handleNewMessage,
      );

      window.removeEventListener(
        "messages:updated",
        handleMessagesUpdated,
      );
    };
  }, []);

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

/*
 * -----------------------------------------
 * Custom hook
 * -----------------------------------------
 */
export function useMessageNotifications() {
  const context =
    useContext(
      MessageNotificationContext,
    );

  if (!context) {
    throw new Error(
      "useMessageNotifications must be used inside MessageNotificationProvider",
    );
  }

  return context;
}