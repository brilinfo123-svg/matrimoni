"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { io, Socket } from "socket.io-client";

import {
  FiCheck,
  FiChevronLeft,
  FiHeart,
  FiInfo,
  FiLock,
  FiMessageCircle,
  FiMoreHorizontal,
  FiPhone,
  FiSearch,
  FiSend,
  FiShield,
} from "react-icons/fi";

import styles from "./messages.module.scss";
import SkeletonLoader from "@/components/SkeletonLoader/SkeletonLoader";

type ApiMessage = {
  _id?: string;
  id?: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  time: string;
  mine: boolean;
  read: boolean;
};

type Conversation = {
  id: string;
  participantId: string;
  name: string;
  initials: string;
  location: string;
  profession: string;
  compatibility: number;
  verified: boolean;
  online: boolean;
  phone?: string;
  unread: number;
  lastMessage: string;
  lastTime: string;
  messages: Message[];
};

type ConversationsResponse = {
  success: boolean;
  conversations?: Conversation[];
  message?: string;
};

type MessagesResponse = {
  success: boolean;
  messages?: ApiMessage[];
  message?: string;
};

type SocketMessagePayload = {
  conversationId: string;
  message: ApiMessage;
};

type PresencePayload = {
  userId: string;
  online: boolean;
};

type MessageReadPayload = {
  conversationId: string;
  messageId: string;
  read: boolean;
};

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:3000";

/*
 * -----------------------------------------
 * Get initials
 * -----------------------------------------
 */
function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

/*
 * -----------------------------------------
 * Format message time
 * -----------------------------------------
 */
function formatMessageTime(date?: string) {
  if (!date) {
    return "";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/*
 * -----------------------------------------
 * Format conversation time
 * -----------------------------------------
 */
function formatConversationTime(date?: string) {
  if (!date) {
    return "";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const now = new Date();

  const sameDay =
    value.toDateString() === now.toDateString();

  if (sameDay) {
    return value.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);

  yesterday.setDate(
    yesterday.getDate() - 1,
  );

  if (
    value.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return value.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

/*
 * -----------------------------------------
 * Normalize API message
 * -----------------------------------------
 */
function normalizeMessage(
  message: ApiMessage,
  currentUserId: string,
): Message {
  const messageId =
    message._id ||
    message.id ||
    `${message.conversationId}-${message.createdAt}-${Math.random()}`;

  return {
    id: String(messageId),

    conversationId: String(
      message.conversationId,
    ),

    senderId: String(
      message.senderId,
    ),

    receiverId: String(
      message.receiverId,
    ),

    text: message.text,

    time: formatMessageTime(
      message.createdAt,
    ),

    mine:
      String(message.senderId) ===
      String(currentUserId),

    read: Boolean(message.read),
  };
}

export default function MessagesPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  /*
   * -----------------------------------------
   * Profile ID from URL
   * -----------------------------------------
   */
  const profileIdFromUrl =
    searchParams.get("userId") ||
    searchParams.get("profile");

  /*
   * -----------------------------------------
   * State
   * -----------------------------------------
   */
  const [currentUserId, setCurrentUserId] =
    useState("");

  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [messageText, setMessageText] =
    useState("");

  const [
    showMobileChat,
    setShowMobileChat,
  ] = useState(false);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  /*
   * -----------------------------------------
   * Delete chat menu
   * -----------------------------------------
   */
  const [showChatMenu, setShowChatMenu] =
    useState(false);

  const [
    deletingConversation,
    setDeletingConversation,
  ] = useState(false);

  /*
   * -----------------------------------------
   * Refs
   * -----------------------------------------
   */
  const socketRef =
    useRef<Socket | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const selectedIdRef =
    useRef("");

  const messageIdsRef =
    useRef(new Set<string>());

  /*
   * IMPORTANT:
   * Socket callbacks can otherwise use
   * old conversations state.
   */
  const conversationsRef =
    useRef<Conversation[]>([]);

  /*
   * -----------------------------------------
   * Selected conversation
   * -----------------------------------------
   */
  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id === selectedId,
    ) || null;

  /*
   * -----------------------------------------
   * Scroll to latest message
   * -----------------------------------------
   */
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "end",
          },
        );
      });
    });
  };

  /*
   * -----------------------------------------
   * Notify Header about unread count change
   * -----------------------------------------
   *
   * MessageNotificationProvider listens
   * for this browser event and refreshes
   * /api/conversations.
   *
   * IMPORTANT:
   * This event is dispatched only after
   * message:read succeeds.
   */
  const notifyMessagesUpdated = () => {
    window.dispatchEvent(
      new Event("messages:updated"),
    );
  };

  /*
   * -----------------------------------------
   * Scroll when messages change
   * -----------------------------------------
   */
  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    if (
      selectedConversation.messages.length ===
      0
    ) {
      return;
    }

    scrollToBottom();
  }, [
    selectedConversation?.id,
    selectedConversation?.messages.length,
  ]);

  /*
   * -----------------------------------------
   * Keep conversations ref updated
   * -----------------------------------------
   */
  useEffect(() => {
    conversationsRef.current =
      conversations;
  }, [conversations]);

  /*
   * -----------------------------------------
   * Filter conversations
   * -----------------------------------------
   */
  const filteredConversations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          [
            conversation.name,
            conversation.location,
            conversation.profession,
            conversation.lastMessage,
          ].some((value) =>
            value
              .toLowerCase()
              .includes(query),
          ),
      );
    }, [
      conversations,
      search,
    ]);

  /*
   * -----------------------------------------
   * Total unread messages
   * -----------------------------------------
   */
  const unreadTotal =
    conversations.reduce(
      (total, conversation) =>
        total + conversation.unread,
      0,
    );

  /*
   * -----------------------------------------
   * Load logged-in user
   * -----------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser =
      async () => {
        try {
          const response =
            await fetch(
              "/api/auth/me",
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              },
            );

          const data =
            await response.json();

          const userId =
            data?.user?._id ||
            data?.user?.id;

          if (
            !cancelled &&
            response.ok &&
            data?.success &&
            userId
          ) {
            const id = String(
              userId,
            );

            console.log(
              "Current user ID:",
              id,
            );

            setCurrentUserId(id);
          }
        } catch (error) {
          console.error(
            "Current user error:",
            error,
          );
        }
      };

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * -----------------------------------------
   * Load/create conversations
   * -----------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    const loadConversations =
      async () => {
        try {
          setLoadingConversations(true);
          setErrorMessage("");

          /*
           * Create/find conversation when
           * coming from Matches/Profile.
           *
           * IMPORTANT:
           * This POST must NOT automatically
           * restore a deletedFor user.
           */
          if (profileIdFromUrl) {
            console.log(
              "Creating/finding conversation with:",
              profileIdFromUrl,
            );

            const createResponse =
              await fetch(
                "/api/conversations",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    userId:
                      profileIdFromUrl,
                  }),
                },
              );

            const createData =
              await createResponse.json();

            console.log(
              "Conversation create response:",
              createData,
            );

            if (
              !createResponse.ok ||
              !createData.success
            ) {
              throw new Error(
                createData.message ||
                  "Unable to create conversation",
              );
            }
          }

          /*
           * Load conversations.
           *
           * API must exclude conversations
           * where current user exists in
           * deletedFor.
           */
          const response =
            await fetch(
              "/api/conversations",
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              },
            );

          const data: ConversationsResponse =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                "Unable to load conversations",
            );
          }

          if (cancelled) {
            return;
          }

          const loaded =
            data.conversations || [];

          /*
           * Make sure messages array
           * always exists.
           */
          const normalizedConversations =
            loaded.map(
              (conversation) => ({
                ...conversation,

                id: String(
                  conversation.id,
                ),

                participantId: String(
                  conversation.participantId,
                ),

                unread:
                  Number(
                    conversation.unread,
                  ) || 0,

                messages:
                  conversation.messages ||
                  [],
              }),
            );

          /*
           * Store message IDs.
           */
          normalizedConversations.forEach(
            (conversation) => {
              conversation.messages.forEach(
                (message) => {
                  messageIdsRef.current.add(
                    message.id,
                  );
                },
              );
            },
          );

          setConversations(
            normalizedConversations,
          );

          /*
           * Select requested profile.
           */
          if (profileIdFromUrl) {
            const matchingConversation =
              normalizedConversations.find(
                (conversation) =>
                  String(
                    conversation.participantId,
                  ) ===
                  String(
                    profileIdFromUrl,
                  ),
              );

            if (
              matchingConversation
            ) {
              setSelectedId(
                matchingConversation.id,
              );

              setShowMobileChat(
                true,
              );
            }
          } else if (
            normalizedConversations.length >
            0
          ) {
            setSelectedId(
              normalizedConversations[0].id,
            );
          }
        } catch (error) {
          console.error(
            "Conversations error:",
            error,
          );

          if (!cancelled) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Unable to load conversations",
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingConversations(
              false,
            );
          }
        }
      };

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, [profileIdFromUrl]);

  /*
   * -----------------------------------------
   * Keep selected conversation ID available
   * inside socket callbacks
   * -----------------------------------------
   */
  useEffect(() => {
    selectedIdRef.current =
      selectedId;
  }, [selectedId]);

  /*
   * -----------------------------------------
   * Close chat menu when clicking outside
   * -----------------------------------------
   */
  useEffect(() => {
    if (!showChatMenu) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as HTMLElement;

      if (
        !target.closest(
          `.${styles.chatMenuWrapper}`,
        )
      ) {
        setShowChatMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [showChatMenu]);

  /*
   * =====================================================
   * SOCKET.IO CONNECTION
   * =====================================================
   */
  useEffect(() => {
    if (!currentUserId) {
      console.log(
        "Waiting for current user before connecting socket...",
      );

      return;
    }

    console.log(
      "Connecting Socket.IO:",
      SOCKET_URL,
    );

    const socket = io(
      SOCKET_URL,
      {
        path: "/socket.io",
        withCredentials: true,
        transports: [
          "websocket",
          "polling",
        ],
        timeout: 10000,
      },
    );

    socketRef.current =
      socket;

    /*
     * -----------------------------------------
     * Socket connected
     * -----------------------------------------
     */
    socket.on(
      "connect",
      () => {
        console.log(
          "Socket connected:",
          socket.id,
        );

        /*
         * Rejoin selected conversation
         * after connection/reconnection.
         */
        if (
          selectedIdRef.current
        ) {
          socket.emit(
            "conversation:join",
            {
              conversationId:
                selectedIdRef.current,
            },
          );

          /*
           * Mark messages as read.
           *
           * IMPORTANT:
           * Header notification is refreshed
           * only after backend confirms success.
           */
          socket.emit(
            "message:read",
            {
              conversationId:
                selectedIdRef.current,
            },
            (
              response?: {
                success?: boolean;
                messageIds?: string[];
              },
            ) => {
              if (
                !response?.success
              ) {
                console.warn(
                  "Unable to mark messages as read after socket connect:",
                  response,
                );

                return;
              }

              /*
               * Backend successfully marked
               * messages as read.
               *
               * Notify Header.
               */
              notifyMessagesUpdated();
            },
          );
        }
      },
    );

    /*
     * -----------------------------------------
     * Connection error
     * -----------------------------------------
     */
    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Socket connection error:",
          error.message,
        );

        setErrorMessage(
          `Socket connection error: ${error.message}`,
        );
      },
    );

    /*
     * -----------------------------------------
     * Socket disconnected
     * -----------------------------------------
     */
    socket.on(
      "disconnect",
      (reason) => {
        console.log(
          "Socket disconnected:",
          reason,
        );
      },
    );

    /*
     * =====================================================
     * NEW REALTIME MESSAGE
     * =====================================================
     */
    socket.on(
      "message:new",
      async (
        payload: SocketMessagePayload,
      ) => {
        console.log(
          "Realtime message received:",
          payload,
        );

        if (
          !payload?.conversationId ||
          !payload?.message
        ) {
          return;
        }

        const normalized =
          normalizeMessage(
            payload.message,
            currentUserId,
          );

        /*
         * Prevent duplicate messages.
         */
        if (
          messageIdsRef.current.has(
            normalized.id,
          )
        ) {
          return;
        }

        messageIdsRef.current.add(
          normalized.id,
        );

        /*
         * Check whether conversation
         * currently exists in frontend.
         */
        const conversationExists =
          conversationsRef.current.some(
            (conversation) =>
              String(
                conversation.id,
              ) ===
              String(
                payload.conversationId,
              ),
          );

        /*
         * -----------------------------------------
         * Conversation does not exist locally
         * -----------------------------------------
         *
         * This can happen when the current user
         * previously deleted the conversation.
         */
        if (!conversationExists) {
          try {
            const response =
              await fetch(
                "/api/conversations",
                {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                },
              );

            const data: ConversationsResponse =
              await response.json();

            if (
              response.ok &&
              data.success
            ) {
              const loaded =
                data.conversations || [];

              const normalizedConversations =
                loaded.map(
                  (conversation) => ({
                    ...conversation,

                    id: String(
                      conversation.id,
                    ),

                    participantId: String(
                      conversation.participantId,
                    ),

                    unread:
                      Number(
                        conversation.unread,
                      ) || 0,

                    messages:
                      conversation.messages ||
                      [],
                  }),
                );

              /*
               * Add existing message IDs.
               */
              normalizedConversations.forEach(
                (conversation) => {
                  conversation.messages.forEach(
                    (message) => {
                      messageIdsRef.current.add(
                        message.id,
                      );
                    },
                  );
                },
              );

              setConversations(
                normalizedConversations,
              );

              /*
               * Find restored conversation.
               */
              const restoredConversation =
                normalizedConversations.find(
                  (conversation) =>
                    String(
                      conversation.id,
                    ) ===
                    String(
                      payload.conversationId,
                    ),
                );

              if (
                restoredConversation
              ) {
                setSelectedId(
                  restoredConversation.id,
                );

                setShowMobileChat(
                  true,
                );
              }
            }
          } catch (error) {
            console.error(
              "Unable to reload conversations after new message:",
              error,
            );
          }

          scrollToBottom();

          return;
        }

        /*
         * -----------------------------------------
         * Existing conversation
         * -----------------------------------------
         */
        setConversations(
          (current) =>
            current.map(
              (conversation) => {
                if (
                  String(
                    conversation.id,
                  ) !==
                  String(
                    payload.conversationId,
                  )
                ) {
                  return conversation;
                }

                const isCurrentConversation =
                  selectedIdRef.current ===
                  conversation.id;

                return {
                  ...conversation,

                  messages: [
                    ...conversation.messages,
                    normalized,
                  ],

                  lastMessage:
                    normalized.text,

                  lastTime:
                    formatConversationTime(
                      payload.message
                        .createdAt,
                    ),

                  unread:
                    normalized.mine ||
                    isCurrentConversation
                      ? 0
                      : conversation.unread +
                        1,
                };
              },
            ),
        );

        /*
         * -----------------------------------------
         * If this is an incoming message inside
         * the currently open conversation,
         * immediately mark it as read.
         *
         * IMPORTANT:
         * Header is updated ONLY after ACK.
         * -----------------------------------------
         */
        if (
          !normalized.mine &&
          selectedIdRef.current ===
            String(
              payload.conversationId,
            ) &&
          socket.connected
        ) {
          socket.emit(
            "message:read",
            {
              conversationId:
                payload.conversationId,
            },
            (
              response?: {
                success?: boolean;
                messageIds?: string[];
              },
            ) => {
              if (
                !response?.success
              ) {
                console.warn(
                  "Unable to mark realtime message as read:",
                  response,
                );

                return;
              }

              /*
               * Backend successfully updated
               * unread messages.
               *
               * Refresh Header badge.
               */
              notifyMessagesUpdated();
            },
          );
        }

        scrollToBottom();
      },
    );

    /*
     * =====================================================
     * REALTIME READ RECEIPT
     * =====================================================
     *
     * Existing ✓ -> ✓✓ functionality.
     */
    socket.on(
      "message:read",
      (
        payload: MessageReadPayload,
      ) => {
        console.log(
          "Realtime message read:",
          payload,
        );

        if (
          !payload?.conversationId ||
          !payload?.messageId
        ) {
          return;
        }

        setConversations(
          (current) =>
            current.map(
              (conversation) => {
                if (
                  String(
                    conversation.id,
                  ) !==
                  String(
                    payload.conversationId,
                  )
                ) {
                  return conversation;
                }

                return {
                  ...conversation,

                  messages:
                    conversation.messages.map(
                      (message) =>
                        String(
                          message.id,
                        ) ===
                        String(
                          payload.messageId,
                        )
                          ? {
                              ...message,
                              read:
                                payload.read ===
                                true,
                            }
                          : message,
                    ),
                };
              },
            ),
        );
      },
    );

    /*
     * -----------------------------------------
     * Online/offline updates
     * -----------------------------------------
     */
    socket.on(
      "presence:update",
      (
        payload: PresencePayload,
      ) => {
        if (
          !payload?.userId
        ) {
          return;
        }

        setConversations(
          (current) =>
            current.map(
              (conversation) =>
                String(
                  conversation.participantId,
                ) ===
                String(
                  payload.userId,
                )
                  ? {
                      ...conversation,
                      online:
                        payload.online,
                    }
                  : conversation,
            ),
        );
      },
    );

    /*
     * -----------------------------------------
     * Socket cleanup
     * -----------------------------------------
     */
    return () => {
      console.log(
        "Cleaning Socket.IO connection",
      );

      socket.off(
        "connect",
      );

      socket.off(
        "connect_error",
      );

      socket.off(
        "disconnect",
      );

      socket.off(
        "message:new",
      );

      socket.off(
        "message:read",
      );

      socket.off(
        "presence:update",
      );

      socket.disconnect();

      if (
        socketRef.current ===
        socket
      ) {
        socketRef.current =
          null;
      }
    };
  }, [currentUserId]);

  /*
   * =====================================================
   * LOAD MESSAGES WHEN SELECTED CONVERSATION CHANGES
   * =====================================================
   */
  useEffect(() => {
    if (!selectedId) {
      return;
    }

    let cancelled = false;

    const loadMessages =
      async () => {
        try {
          setLoadingMessages(true);
          setErrorMessage("");

          const response =
            await fetch(
              `/api/conversations/${selectedId}/messages`,
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              },
            );

          const data: MessagesResponse =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                "Unable to load messages",
            );
          }

          if (cancelled) {
            return;
          }

          const loadedMessages =
            (
              data.messages || []
            ).map(
              (message) =>
                normalizeMessage(
                  message,
                  currentUserId,
                ),
            );

          /*
           * Store message IDs.
           */
          loadedMessages.forEach(
            (message) => {
              messageIdsRef.current.add(
                message.id,
              );
            },
          );

          /*
           * Update messages and locally
           * clear unread count.
           */
          setConversations(
            (current) =>
              current.map(
                (conversation) =>
                  conversation.id ===
                  selectedId
                    ? {
                        ...conversation,

                        messages:
                          loadedMessages,

                        unread: 0,
                      }
                    : conversation,
              ),
          );

          /*
           * Join conversation room.
           */
          if (
            socketRef.current?.connected
          ) {
            socketRef.current.emit(
              "conversation:join",
              {
                conversationId:
                  selectedId,
              },
            );

            /*
             * -----------------------------------------
             * Mark messages as read on backend.
             * -----------------------------------------
             *
             * IMPORTANT:
             * We notify Header ONLY after
             * message:read returns success.
             */
            socketRef.current.emit(
              "message:read",
              {
                conversationId:
                  selectedId,
              },
              (
                response?: {
                  success?: boolean;
                  messageIds?: string[];
                },
              ) => {
                console.log(
                  "message:read response:",
                  response,
                );

                if (
                  !response?.success
                ) {
                  console.warn(
                    "Unable to mark messages as read:",
                    response,
                  );

                  return;
                }

                /*
                 * Backend successfully marked
                 * unread messages as read.
                 *
                 * Tell Header notification
                 * provider to refresh count.
                 */
                notifyMessagesUpdated();
              },
            );
          }

          scrollToBottom();
        } catch (error) {
          console.error(
            "Messages loading error:",
            error,
          );

          if (!cancelled) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Unable to load messages",
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingMessages(
              false,
            );
          }
        }
      };

    loadMessages();

    /*
     * Leave conversation room when
     * switching conversations.
     */
    return () => {
      cancelled = true;

      if (
        socketRef.current?.connected
      ) {
        socketRef.current.emit(
          "conversation:leave",
          {
            conversationId:
              selectedId,
          },
        );
      }
    };
  }, [
    selectedId,
    currentUserId,
  ]);

  /*
   * =====================================================
   * SELECT CONVERSATION
   * =====================================================
   */
  const openConversation = (
    conversationId: string,
  ) => {
    /*
     * Close more-options menu.
     */
    setShowChatMenu(false);

    /*
     * Leave old room.
     */
    if (
      socketRef.current?.connected &&
      selectedId &&
      selectedId !== conversationId
    ) {
      socketRef.current.emit(
        "conversation:leave",
        {
          conversationId:
            selectedId,
        },
      );
    }

    /*
     * Select new conversation.
     */
    setSelectedId(
      conversationId,
    );

    setShowMobileChat(
      true,
    );

    /*
     * Clear unread locally.
     *
     * IMPORTANT:
     * Do NOT call notifyMessagesUpdated()
     * here because backend message:read may
     * not have completed yet.
     */
    setConversations(
      (current) =>
        current.map(
          (conversation) =>
            conversation.id ===
            conversationId
              ? {
                  ...conversation,
                  unread: 0,
                }
              : conversation,
        ),
    );
  };

  /*
   * =====================================================
   * DELETE CONVERSATION
   * =====================================================
   */
  const deleteConversation = async () => {
    if (
      !selectedConversation ||
      deletingConversation
    ) {
      return;
    }

    const conversationId =
      selectedConversation.id;

    /*
     * IMPORTANT:
     * This is a soft delete for the current
     * user. Permanent deletion only happens
     * when both users delete the conversation.
     */
    const shouldDelete =
      window.confirm(
        `Delete your conversation with ${selectedConversation.name}? The chat will be removed from your side. Messages will be permanently deleted only when both users delete the conversation.`,
      );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingConversation(true);
      setErrorMessage("");
      setShowChatMenu(false);

      /*
       * Leave Socket.IO conversation room.
       */
      if (
        socketRef.current?.connected
      ) {
        socketRef.current.emit(
          "conversation:leave",
          {
            conversationId,
          },
        );
      }

      /*
       * Delete conversation from database.
       *
       * Backend decides whether this is:
       *
       * 1. Soft delete for current user
       *
       * OR
       *
       * 2. Permanent delete if other user
       *    has already deleted it.
       */
      const response =
        await fetch(
          `/api/delete/${conversationId}`,
          {
            method: "DELETE",
            credentials: "include",
            cache: "no-store",
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete conversation",
        );
      }

      /*
       * IMPORTANT:
       * Clear URL query parameters.
       *
       * Otherwise /messages?userId=...
       * could call POST /api/conversations
       * again after deletion.
       */
      router.replace(
        "/messages",
      );

      /*
       * Remove message IDs from
       * duplicate tracker ONLY AFTER
       * database deletion succeeded.
       */
      selectedConversation.messages.forEach(
        (message) => {
          messageIdsRef.current.delete(
            message.id,
          );
        },
      );

      /*
       * Remove conversation
       * from frontend state.
       */
      const remaining =
        conversations.filter(
          (conversation) =>
            conversation.id !==
            conversationId,
        );

      setConversations(
        remaining,
      );

      /*
       * Open next conversation.
       */
      if (remaining.length > 0) {
        setSelectedId(
          remaining[0].id,
        );

        setShowMobileChat(
          true,
        );
      } else {
        /*
         * No chats remaining.
         */
        setSelectedId("");

        setShowMobileChat(
          false,
        );
      }

      /*
       * Header unread count also needs
       * to be refreshed after deletion.
       */
      notifyMessagesUpdated();

      console.log(
        "Conversation deleted successfully:",
        {
          conversationId,
          permanentlyDeleted:
            Boolean(
              data.permanentlyDeleted,
            ),
        },
      );
    } catch (error) {
      console.error(
        "Delete conversation error:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete conversation",
      );
    } finally {
      setDeletingConversation(false);
    }
  };

  /*
   * =====================================================
   * SEND MESSAGE
   * =====================================================
   */
  const sendMessage = () => {
    const text =
      messageText.trim();

    if (!text) {
      return;
    }

    if (!selectedId) {
      setErrorMessage(
        "Please select a conversation.",
      );

      return;
    }

    const socket =
      socketRef.current;

    if (!socket) {
      setErrorMessage(
        "Socket is not initialized.",
      );

      console.error(
        "Socket is not initialized",
      );

      return;
    }

    if (!socket.connected) {
      setErrorMessage(
        "Chat connection is not available. Please wait a moment and try again.",
      );

      console.error(
        "Socket is disconnected",
      );

      return;
    }

    if (sending) {
      return;
    }

    setSending(true);
    setErrorMessage("");

    console.log(
      "Sending message:",
      {
        conversationId:
          selectedId,
        text,
        socketId:
          socket.id,
      },
    );

    socket.emit(
      "message:send",
      {
        conversationId:
          selectedId,
        text,
      },
      (
        response?: {
          success?: boolean;
          message?: string;
        },
      ) => {
        console.log(
          "message:send response:",
          response,
        );

        setSending(false);

        if (
          !response?.success
        ) {
          setErrorMessage(
            response?.message ||
              "Unable to send message.",
          );

          return;
        }

        setMessageText("");

        scrollToBottom();
      },
    );
  };

  /*
   * -----------------------------------------
   * Enter sends message
   * -----------------------------------------
   */
  const handleMessageKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  /*
   * =====================================================
   * NO CONVERSATIONS
   * =====================================================
   */
  if (
    !loadingConversations &&
    conversations.length === 0
  ) {
    return (
      <main className={styles.page}>
        <div
          className={
            styles.backgroundGlow
          }
        />

        <div
          className={
            styles.backgroundGlowTwo
          }
        />

        <div className="container">
          <div
            className={
              styles.pageHeader
            }
          >
            <div>
              <span
                className={
                  styles.eyebrow
                }
              >
                <FiMessageCircle
                  aria-hidden="true"
                />

                Your conversations
              </span>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              style={{
                marginBottom: "16px",
              }}
            >
              {errorMessage}
            </div>
          )}

          <section
            className={
              styles.safetyCard
            }
          >
            <div
              className={
                styles.safetyIcon
              }
            >
              <FiMessageCircle
                aria-hidden="true"
              />
            </div>

            <div>
              <strong>
                No conversations yet
              </strong>

              <p>
                Start by connecting with a
                profile you are interested in.
              </p>
            </div>

            <Link href="/matches">
              Find matches
            </Link>
          </section>
        </div>
      </main>
    );
  }

  /*
   * =====================================================
   * MAIN PAGE
   * =====================================================
   */
  return (
    <main className={styles.page}>
      <div
        className={
          styles.backgroundGlow
        }
      />

      <div
        className={
          styles.backgroundGlowTwo
        }
      />

      <div className="container">
        {/* Page header */}
        <div
          className={
            styles.pageHeader
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              <FiMessageCircle
                aria-hidden="true"
              />

              Your conversations
            </span>
          </div>

          <div
            className={
              styles.messageCount
            }
          >
            <FiMessageCircle
              aria-hidden="true"
            />

            <span>
              {unreadTotal} unread
            </span>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Messenger */}
        <section
          className={`${styles.messenger} ${
            showMobileChat
              ? styles.mobileChatOpen
              : ""
          }`}
        >
          {/* =========================================
              Conversations sidebar
          ========================================== */}
          <aside
            className={
              styles.conversationPanel
            }
          >
            <div
              className={
                styles.conversationHeader
              }
            >
              <div>
                <h2>
                  Conversations
                </h2>

                <span>
                  {loadingConversations
                    ? "Loading..."
                    : `${conversations.length} connections`}
                </span>
              </div>

              <button
                type="button"
                aria-label="Message information"
                className={
                  styles.infoButton
                }
                title="Your conversations are private"
              >
                <FiInfo
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Search */}
            <div
              className={
                styles.searchBox
              }
            >
              <FiSearch
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search conversations..."
                aria-label="Search conversations"
              />
            </div>

            {/* Conversation list */}
            <div
              className={
                styles.conversationList
              }
            >
              {loadingConversations ? (
                <SkeletonLoader
                  variant="conversations"
                  count={6}
                />
              ) : filteredConversations.length >
                0 ? (
                filteredConversations.map(
                  (
                    conversation,
                  ) => (
                    <button
                      type="button"
                      key={
                        conversation.id
                      }
                      className={`${styles.conversationItem} ${
                        selectedId ===
                        conversation.id
                          ? styles.selectedConversation
                          : ""
                      }`}
                      onClick={() =>
                        openConversation(
                          conversation.id,
                        )
                      }
                    >
                      <div
                        className={
                          styles.conversationAvatar
                        }
                      >
                        <span>
                          {conversation.initials ||
                            getInitials(
                              conversation.name,
                            )}
                        </span>

                        {conversation.online && (
                          <i
                            className={
                              styles.avatarOnline
                            }
                          />
                        )}
                      </div>

                      <div
                        className={
                          styles.conversationDetails
                        }
                      >
                        <div
                          className={
                            styles.conversationNameRow
                          }
                        >
                          <strong>
                            {
                              conversation.name
                            }
                          </strong>

                          {conversation.verified && (
                            <span
                              className={
                                styles.smallVerified
                              }
                            >
                              <FiCheck
                                aria-hidden="true"
                              />
                            </span>
                          )}

                          <time>
                            {
                              conversation.lastTime
                            }
                          </time>
                        </div>

                        <div
                          className={
                            styles.conversationBottom
                          }
                        >
                          <p>
                            {
                              conversation.lastMessage
                            }
                          </p>

                          {conversation.unread >
                            0 && (
                            <span
                              className={
                                styles.unreadBadge
                              }
                            >
                              {
                                conversation.unread
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ),
                )
              ) : (
                <div
                  className={
                    styles.noConversations
                  }
                >
                  <FiSearch
                    aria-hidden="true"
                  />

                  <strong>
                    No conversations found
                  </strong>

                  <span>
                    Try a different search.
                  </span>
                </div>
              )}
            </div>

            {/* Privacy */}
            <div
              className={
                styles.sidebarPrivacy
              }
            >
              <FiLock
                aria-hidden="true"
              />

              <span>
                Your conversations are private.
              </span>
            </div>
          </aside>

          {/* =========================================
              Chat panel
          ========================================== */}
          <section
            className={
              styles.chatPanel
            }
          >
            {!selectedConversation ? (
              <div
                className={
                  styles.noConversations
                }
              >
                <FiMessageCircle
                  aria-hidden="true"
                />

                <strong>
                  Select a conversation
                </strong>

                <span>
                  Choose someone from your
                  conversations.
                </span>
              </div>
            ) : (
              <>
                {/* ===================================
                    Chat header
                ==================================== */}
                <header
                  className={
                    styles.chatHeader
                  }
                >
                  {/* Mobile back */}
                  <button
                    type="button"
                    className={
                      styles.mobileBack
                    }
                    onClick={() => {
                      setShowMobileChat(
                        false,
                      );

                      setShowChatMenu(
                        false,
                      );
                    }}
                    aria-label="Back to conversations"
                  >
                    <FiChevronLeft
                      aria-hidden="true"
                    />
                  </button>

                  {/* User */}
                  <Link
                    href={`/profile/${selectedConversation.participantId}`}
                    className={
                      styles.chatUser
                    }
                  >
                    <div
                      className={
                        styles.chatAvatar
                      }
                    >
                      <span>
                        {
                          selectedConversation.initials
                        }
                      </span>

                      {selectedConversation.online && (
                        <i />
                      )}
                    </div>

                    <div>
                      <div
                        className={
                          styles.chatName
                        }
                      >
                        <strong>
                          {
                            selectedConversation.name
                          }
                        </strong>

                        {selectedConversation.verified && (
                          <span
                            className={
                              styles.chatVerified
                            }
                          >
                            <FiCheck
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </div>

                      <span
                        className={
                          styles.chatStatus
                        }
                      >
                        {selectedConversation.online
                          ? "Online now"
                          : selectedConversation.location}
                      </span>
                    </div>
                  </Link>

                  {/* Actions */}
                  <div
                    className={
                      styles.chatActions
                    }
                  >
                    {selectedConversation.phone && (
                      <a
                        href={`tel:${selectedConversation.phone}`}
                        aria-label="Call"
                        title="Call"
                      >
                        <FiPhone
                          aria-hidden="true"
                        />
                      </a>
                    )}

                    {/* More options + delete */}
                    <div
                      className={
                        styles.chatMenuWrapper
                      }
                    >
                      <button
                        type="button"
                        aria-label="More options"
                        title="More options"
                        onClick={() =>
                          setShowChatMenu(
                            (current) =>
                              !current,
                          )
                        }
                        disabled={
                          deletingConversation
                        }
                      >
                        <FiMoreHorizontal
                          aria-hidden="true"
                        />
                      </button>

                      {showChatMenu && (
                        <div
                          className={
                            styles.chatMenu
                          }
                        >
                          <button
                            type="button"
                            className={
                              styles.deleteChatButton
                            }
                            onClick={
                              deleteConversation
                            }
                            disabled={
                              deletingConversation
                            }
                          >
                            {deletingConversation
                              ? "Deleting..."
                              : "Delete conversation"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </header>

                {/* ===================================
                    Profile strip
                ==================================== */}
                <div
                  className={
                    styles.profileStrip
                  }
                >
                  <div>
                    <span
                      className={
                        styles.stripIcon
                      }
                    >
                      <FiHeart
                        aria-hidden="true"
                      />
                    </span>

                    <div>
                      <strong>
                        {
                          selectedConversation.compatibility
                        }
                        % compatibility
                      </strong>

                      <span>
                        {
                          selectedConversation.profession
                        }
                        {" · "}
                        {
                          selectedConversation.location
                        }
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/profile/${selectedConversation.participantId}`}
                  >
                    View profile
                  </Link>
                </div>

                {/* ===================================
                    Messages
                ==================================== */}
                <div
                  className={
                    styles.messagesArea
                  }
                >
                  <div
                    className={
                      styles.dateDivider
                    }
                  >
                    <span>
                      Today
                    </span>
                  </div>

                  {/* Safety message */}
                  <div
                    className={
                      styles.safetyMessage
                    }
                  >
                    <FiShield
                      aria-hidden="true"
                    />

                    <span>
                      Take your time getting to
                      know each other. Never share
                      sensitive personal information
                      unless you feel comfortable.
                    </span>
                  </div>

                  {/* Message skeleton */}
                  {loadingMessages ? (
                    <SkeletonLoader
                      variant="messages"
                      count={5}
                    />
                  ) : selectedConversation
                      .messages.length >
                    0 ? (
                    selectedConversation.messages.map(
                      (
                        message,
                      ) => (
                        <div
                          key={
                            message.id
                          }
                          className={`${styles.messageRow} ${
                            message.mine
                              ? styles.myMessage
                              : styles.theirMessage
                          }`}
                        >
                          {!message.mine && (
                            <div
                              className={
                                styles.messageAvatar
                              }
                            >
                              {
                                selectedConversation.initials
                              }
                            </div>
                          )}

                          <div
                            className={
                              styles.messageContent
                            }
                          >
                            <div
                              className={
                                styles.messageBubble
                              }
                            >
                              {
                                message.text
                              }
                            </div>

                            <div
                              className={
                                styles.messageMeta
                              }
                            >
                              <time>
                                {
                                  message.time
                                }
                              </time>

                              {message.mine && (
                                <span
                                  className={
                                    message.read
                                      ? styles.readStatus
                                      : ""
                                  }
                                >
                                  <FiCheck
                                    aria-hidden="true"
                                  />

                                  {message.read && (
                                    <FiCheck
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <div
                      className={
                        styles.noConversations
                      }
                    >
                      <FiMessageCircle
                        aria-hidden="true"
                      />

                      <strong>
                        No messages yet
                      </strong>

                      <span>
                        Start the conversation.
                      </span>
                    </div>
                  )}

                  <div
                    ref={
                      messagesEndRef
                    }
                  />
                </div>

                {/* ===================================
                    Composer
                ==================================== */}
                <div
                  className={
                    styles.composerArea
                  }
                >
                  <div
                    className={
                      styles.composerHint
                    }
                  >
                    <FiShield
                      aria-hidden="true"
                    />

                    <span>
                      Keep conversations
                      respectful and private.
                    </span>
                  </div>

                  <div
                    className={
                      styles.composer
                    }
                  >
                    <input
                      type="text"
                      value={messageText}
                      onChange={(
                        event,
                      ) =>
                        setMessageText(
                          event.target
                            .value,
                        )
                      }
                      onKeyDown={
                        handleMessageKeyDown
                      }
                      placeholder="Write a message..."
                      aria-label="Write a message"
                      maxLength={2000}
                      disabled={
                        sending ||
                        deletingConversation
                      }
                    />

                    <button
                      type="button"
                      onClick={
                        sendMessage
                      }
                      disabled={
                        !messageText.trim() ||
                        sending ||
                        deletingConversation
                      }
                      aria-label="Send message"
                      className={
                        styles.sendButton
                      }
                    >
                      <FiSend
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <p
                    className={
                      styles.composerPrivacy
                    }
                  >
                    Messages are intended for
                    people you have connected with.
                  </p>
                </div>
              </>
            )}
          </section>
        </section>

        {/* =========================================
            Bottom safety card
        ========================================== */}
        <section
          className={
            styles.safetyCard
          }
        >
          <div
            className={
              styles.safetyIcon
            }
          >
            <FiShield
              aria-hidden="true"
            />
          </div>

          <div>
            <strong>
              Stay safe while chatting
            </strong>

            <p>
              Never share passwords, financial
              details, verification codes or other
              sensitive information with anyone.
            </p>
          </div>

          <Link href="/safety">
            Safety tips

            <FiChevronLeft
              aria-hidden="true"
            />
          </Link>
        </section>
      </div>
    </main>
  );
}