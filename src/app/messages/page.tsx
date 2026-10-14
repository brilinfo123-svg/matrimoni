"use client";

import Link from "next/link";
import Image from "next/image";
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
  FiArrowLeft,
  FiCheck,
  FiChevronLeft,
  FiHeart,
  FiMessageCircle,
  FiLock,
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
  photo?: string | null;
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
 * =====================================================
 * CLIENT-SIDE CACHE
 * =====================================================
 *
 * This cache survives client-side navigation while
 * the application remains in the same browser runtime.
 *
 * It does not persist through a full page refresh.
 */

let cachedMessagesUserId = "";

let cachedSelectedConversationId = "";

let conversationsCache: {
  userId: string;
  conversations: Conversation[];
} | null = null;

const messagesCache = new Map<string, Message[]>();

function getMessageCacheKey(
  userId: string,
  conversationId: string,
) {
  return `${userId}:${conversationId}`;
}

/*
 * =====================================================
 * HELPERS
 * =====================================================
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

type ProfileAvatarProps = {
  photo?: string | null;
  name: string;
  initials?: string;
  className: string;
  imageClassName: string;
  size: number;
  online?: boolean;
  onlineClassName?: string;
};

function ProfileAvatar({
  photo,
  name,
  initials,
  className,
  imageClassName,
  size,
  online = false,
  onlineClassName,
}: ProfileAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl =
    typeof photo === "string" && photo.trim()
      ? photo.trim()
      : null;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <div className={className}>
      {imageUrl && !imageFailed ? (
        <Image
          src={imageUrl}
          alt={`${name}'s profile photo`}
          width={size}
          height={size}
          className={imageClassName}
          onError={() => setImageFailed(true)}
          unoptimized
        />
      ) : (
        <span>{initials || getInitials(name)}</span>
      )}

      {online && (
        <i
          className={onlineClassName}
          aria-label="Online"
        />
      )}
    </div>
  );
}

function formatMessageTime(date?: string) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatConversationTime(date?: string) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  const now = new Date();

  if (value.toDateString() === now.toDateString()) {
    return value.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (value.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return value.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

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
    conversationId: String(message.conversationId),
    senderId: String(message.senderId),
    receiverId: String(message.receiverId),
    text: message.text,
    time: formatMessageTime(message.createdAt),
    mine:
      String(message.senderId) === String(currentUserId),
    read: Boolean(message.read),
  };
}

/*
 * =====================================================
 * MESSAGES PAGE
 * =====================================================
 */

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const profileIdFromUrl =
    searchParams.get("userId") ||
    searchParams.get("profile");

  /*
   * -----------------------------------------------------
   * INITIAL CACHED DATA
   * -----------------------------------------------------
   */

  const [currentUserId, setCurrentUserId] = useState(
    () => cachedMessagesUserId,
  );

  const [conversations, setConversations] = useState<
    Conversation[]
  >(() => {
    if (
      conversationsCache &&
      conversationsCache.userId === cachedMessagesUserId
    ) {
      return conversationsCache.conversations;
    }

    return [];
  });

  const [selectedId, setSelectedId] = useState(() => {
    if (
      conversationsCache &&
      conversationsCache.userId === cachedMessagesUserId
    ) {
      const cachedConversationExists =
        conversationsCache.conversations.some(
          (conversation) =>
            conversation.id === cachedSelectedConversationId,
        );

      if (
        cachedConversationExists &&
        cachedSelectedConversationId
      ) {
        return cachedSelectedConversationId;
      }

      return conversationsCache.conversations[0]?.id || "";
    }

    return "";
  });

  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const [loadingConversations, setLoadingConversations] =
    useState(() => {
      return !(
        conversationsCache &&
        conversationsCache.userId === cachedMessagesUserId
      );
    });

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showChatMenu, setShowChatMenu] = useState(false);
  const [deletingConversation, setDeletingConversation] =
    useState(false);

  /*
   * -----------------------------------------------------
   * REFS
   * -----------------------------------------------------
   */

  const socketRef = useRef<Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedIdRef = useRef("");

  const messageIdsRef = useRef(new Set<string>());

  const conversationsRef = useRef<Conversation[]>([]);

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === selectedId,
    ) || null;

  /*
   * -----------------------------------------------------
   * SCROLL TO BOTTOM
   * -----------------------------------------------------
   */

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    });
  };

  /*
   * -----------------------------------------------------
   * NOTIFY HEADER ABOUT UNREAD COUNT
   * -----------------------------------------------------
   */

  const notifyMessagesUpdated = () => {
    window.dispatchEvent(new Event("messages:updated"));
  };

  /*
   * -----------------------------------------------------
   * UPDATE CACHED DATA
   * -----------------------------------------------------
   *
   * This also keeps the cache updated when Socket.IO
   * changes messages, unread counts, or online status.
   */

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!currentUserId) return;

    cachedMessagesUserId = currentUserId;

    conversationsCache = {
      userId: currentUserId,
      conversations,
    };

    conversations.forEach((conversation) => {
      messagesCache.set(
        getMessageCacheKey(
          currentUserId,
          conversation.id,
        ),
        conversation.messages || [],
      );
    });

    if (
      selectedId &&
      conversations.some(
        (conversation) => conversation.id === selectedId,
      )
    ) {
      cachedSelectedConversationId = selectedId;
    } else if (
      cachedSelectedConversationId &&
      !conversations.some(
        (conversation) =>
          conversation.id === cachedSelectedConversationId,
      )
    ) {
      cachedSelectedConversationId =
        conversations[0]?.id || "";
    }
  }, [conversations, currentUserId, selectedId]);

  /*
   * -----------------------------------------------------
   * SCROLL WHEN MESSAGES CHANGE
   * -----------------------------------------------------
   */

  useEffect(() => {
    if (!selectedConversation) return;

    if (selectedConversation.messages.length === 0) return;

    scrollToBottom();
  }, [
    selectedConversation?.id,
    selectedConversation?.messages.length,
  ]);

  /*
   * -----------------------------------------------------
   * FILTER CONVERSATIONS
   * -----------------------------------------------------
   */

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) =>
      [
        conversation.name,
        conversation.location,
        conversation.profession,
        conversation.lastMessage,
      ].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [conversations, search]);

  /*
   * -----------------------------------------------------
   * TOTAL UNREAD MESSAGES
   * -----------------------------------------------------
   */

  const unreadTotal = conversations.reduce(
    (total, conversation) => total + conversation.unread,
    0,
  );

  /*
   * =====================================================
   * LOAD LOGGED-IN USER
   * =====================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        const userId =
          data?.user?._id ||
          data?.user?.id;

        if (
          cancelled ||
          !response.ok ||
          !data?.success ||
          !userId
        ) {
          if (!cancelled) {
            /*
             * No authenticated user was found.
             * Clear cached private conversation data.
             */
            cachedMessagesUserId = "";
            cachedSelectedConversationId = "";
            conversationsCache = null;
            messagesCache.clear();

            setCurrentUserId("");
            setConversations([]);
            setSelectedId("");
            setLoadingConversations(false);
          }

          return;
        }

        const id = String(userId);

        console.log("Current user ID:", id);

        /*
         * Prevent one account from seeing another
         * account's cached conversations.
         */
        if (
          cachedMessagesUserId &&
          cachedMessagesUserId !== id
        ) {
          conversationsCache = null;
          messagesCache.clear();
          cachedSelectedConversationId = "";

          setConversations([]);
          setSelectedId("");
          setLoadingConversations(true);
        }

        cachedMessagesUserId = id;
        setCurrentUserId(id);
      } catch (error) {
        console.error("Current user error:", error);

        if (!cancelled) {
          setErrorMessage("Unable to verify your session.");
          setLoadingConversations(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =====================================================
   * LOAD / CREATE CONVERSATIONS
   * =====================================================
   *
   * Cached conversations appear immediately.
   * The API still refreshes them in the background.
   */


useEffect(() => {
  let cancelled = false;

  const loadConversations = async () => {
    if (!currentUserId) return;

    const hasCachedConversations =
      conversationsCache?.userId === currentUserId;

    /*
     * Do not show the sidebar skeleton if cached
     * conversations are already available.
     */
    if (!hasCachedConversations) {
      setLoadingConversations(true);
    }

    setErrorMessage("");

    try {
      /*
       * Create/find conversation when coming from
       * a profile or Matches page.
       */
      if (profileIdFromUrl) {
        console.log(
          "Creating/finding conversation with:",
          profileIdFromUrl,
        );

        const createResponse = await fetch(
          "/api/conversations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              userId: profileIdFromUrl,
            }),
          },
        );

        const createData = await createResponse.json();

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
       * Fetch latest conversation list.
       */
      const response = await fetch("/api/conversations", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data: ConversationsResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load conversations",
        );
      }

      if (cancelled) return;

      const loaded = data.conversations || [];

      /*
       * Normalize conversations and preserve cached
       * messages while the message endpoint refreshes.
       */
      const normalizedConversations: Conversation[] =
        loaded.map((conversation) => {
          const conversationId = String(conversation.id);

          const cacheKey = getMessageCacheKey(
            currentUserId,
            conversationId,
          );

          const hasCachedMessages =
            messagesCache.has(cacheKey);

          return {
            ...conversation,
            id: conversationId,
            participantId: String(
              conversation.participantId,
            ),
            unread: Number(conversation.unread) || 0,
            messages: hasCachedMessages
              ? messagesCache.get(cacheKey) || []
              : conversation.messages || [],
          };
        });

      /*
       * IMPORTANT:
       * Render conversations immediately.
       * Do not wait for participant names/photos.
       */
      if (cancelled) return;

      normalizedConversations.forEach((conversation) => {
        conversation.messages.forEach((message) => {
          messageIdsRef.current.add(message.id);
        });
      });

      setConversations(normalizedConversations);

      /*
       * Select the requested profile immediately.
       */
      if (profileIdFromUrl) {
        const matchingConversation =
          normalizedConversations.find(
            (conversation) =>
              String(conversation.participantId) ===
              String(profileIdFromUrl),
          );

        if (matchingConversation) {
          setSelectedId(matchingConversation.id);
          setShowMobileChat(true);
        } else {
          setSelectedId((previousId) => {
            const stillExists =
              normalizedConversations.some(
                (conversation) =>
                  conversation.id === previousId,
              );

            return stillExists
              ? previousId
              : normalizedConversations[0]?.id || "";
          });
        }
      } else {
        /*
         * Keep the previously selected conversation
         * if it still exists after the refresh.
         */
        setSelectedId((previousId) => {
          const stillExists =
            normalizedConversations.some(
              (conversation) =>
                conversation.id === previousId,
            );

          return stillExists
            ? previousId
            : normalizedConversations[0]?.id || "";
        });
      }

      /*
       * Hydrate participant names and profile photos
       * after the unread count has already rendered.
       */
      const participantIds = [
        ...new Set(
          normalizedConversations
            .map(
              (conversation) =>
                conversation.participantId,
            )
            .filter(Boolean),
        ),
      ];

      if (participantIds.length > 0) {
        const usersResponse = await fetch(
          `/api/users?ids=${encodeURIComponent(
            participantIds.join(","),
          )}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const usersData = await usersResponse.json();

        if (
          !cancelled &&
          usersResponse.ok &&
          usersData.success
        ) {
          const photoByUserId = new Map<
            string,
            { photo: string | null; name: string }
          >(
            (usersData.users || []).map(
              (user: {
                id: string;
                photo: string | null;
                name: string;
              }) => [
                String(user.id),
                {
                  photo: user.photo,
                  name: user.name,
                },
              ],
            ),
          );

          const hydratedConversations =
            normalizedConversations.map(
              (conversation) => {
                const profile = photoByUserId.get(
                  String(conversation.participantId),
                );

                if (!profile) return conversation;

                return {
                  ...conversation,
                  photo: profile.photo,
                  ...(profile.name
                    ? {
                        name: profile.name,
                        initials: getInitials(profile.name),
                      }
                    : {}),
                };
              },
            );

          if (!cancelled) {
            setConversations(hydratedConversations);
          }
        }
      }
    } catch (error) {
      console.error("Conversations error:", error);

      if (!cancelled) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load conversations",
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingConversations(false);
      }
    }
  };

  loadConversations();

  return () => {
    cancelled = true;
  };
}, [profileIdFromUrl, currentUserId]);

  /*
   * =====================================================
   * KEEP SELECTED ID AVAILABLE TO SOCKET CALLBACKS
   * =====================================================
   */

  useEffect(() => {
    selectedIdRef.current = selectedId;

    if (selectedId) {
      cachedSelectedConversationId = selectedId;
    }
  }, [selectedId]);

  /*
   * =====================================================
   * CLOSE CHAT MENU WHEN CLICKING OUTSIDE
   * =====================================================
   */

  useEffect(() => {
    if (!showChatMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(`.${styles.chatMenuWrapper}`)) {
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

    console.log("Connecting Socket.IO:", SOCKET_URL);

    const socket = io(SOCKET_URL, {
      path: "/socket.io",

      auth: (callback) => {
        fetch("/api/auth/socket-token", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })
          .then(async (response) => {
            const data = await response.json();

            if (!response.ok || !data?.token) {
              throw new Error(
                data?.message ||
                  "Socket token unavailable",
              );
            }

            callback({ token: data.token });
          })
          .catch((error) => {
            console.error("Socket token error:", error);
            callback({});
          });
      },

      withCredentials: true,
      transports: ["websocket", "polling"],
      timeout: 10000,
    });

    socketRef.current = socket;

    /*
     * -----------------------------------------------------
     * SOCKET CONNECTED
     * -----------------------------------------------------
     */

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      if (selectedIdRef.current) {
        socket.emit("conversation:join", {
          conversationId: selectedIdRef.current,
        });

        socket.emit(
          "message:read",
          {
            conversationId: selectedIdRef.current,
          },
          (
            response?: {
              success?: boolean;
              messageIds?: string[];
            },
          ) => {
            if (!response?.success) {
              console.warn(
                "Unable to mark messages as read after socket connect:",
                response,
              );

              return;
            }

            notifyMessagesUpdated();
          },
        );
      }
    });

    /*
     * -----------------------------------------------------
     * CONNECTION ERROR
     * -----------------------------------------------------
     */

    socket.on("connect_error", (error) => {
      console.error(
        "Socket connection error:",
        error.message,
      );

      setErrorMessage(
        `Socket connection error: ${error.message}`,
      );
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    /*
     * =====================================================
     * NEW REALTIME MESSAGE
     * =====================================================
     */

    socket.on(
      "message:new",
      async (payload: SocketMessagePayload) => {
        console.log("Realtime message received:", payload);

        if (
          !payload?.conversationId ||
          !payload?.message
        ) {
          return;
        }

        const normalized = normalizeMessage(
          payload.message,
          currentUserId,
        );
       
const conversationBeforeUpdate =
  conversationsRef.current.find(
    (conversation) =>
      conversation.id === String(payload.conversationId),
  );

const pendingMessage =
  conversationBeforeUpdate?.messages.find(
    (message) =>
      message.id.startsWith("temp-") &&
      message.mine &&
      message.text === normalized.text,
  );

if (pendingMessage) {
  messageIdsRef.current.delete(pendingMessage.id);
  messageIdsRef.current.add(normalized.id);

  setConversations((current) =>
    current.map((conversation) => {
      if (
        conversation.id !== String(payload.conversationId)
      ) {
        return conversation;
      }

      return {
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.id === pendingMessage.id
            ? normalized
            : message,
        ),
        lastMessage: normalized.text,
        lastTime: formatConversationTime(
          payload.message.createdAt,
        ),
      };
    }),
  );

  return;
}
        /*
         * Prevent duplicate messages.
         */
        if (messageIdsRef.current.has(normalized.id)) {
          return;
        }

        messageIdsRef.current.add(normalized.id);

        const conversationExists =
          conversationsRef.current.some(
            (conversation) =>
              String(conversation.id) ===
              String(payload.conversationId),
          );

        /*
         * Conversation is not currently in the sidebar.
         * Refresh the conversation list from the server.
         */
        if (!conversationExists) {
          try {
            const response = await fetch(
              "/api/conversations",
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              },
            );

            const data: ConversationsResponse =
              await response.json();

            if (response.ok && data.success) {
              const loaded = data.conversations || [];

              const normalizedConversations: Conversation[] =
                loaded.map((conversation) => {
                  const conversationId = String(
                    conversation.id,
                  );

                  const cacheKey = getMessageCacheKey(
                    currentUserId,
                    conversationId,
                  );

                  return {
                    ...conversation,

                    id: conversationId,

                    participantId: String(
                      conversation.participantId,
                    ),

                    unread:
                      Number(conversation.unread) || 0,

                    messages: messagesCache.has(cacheKey)
                      ? messagesCache.get(cacheKey) || []
                      : conversation.messages || [],
                  };
                });

              normalizedConversations.forEach(
                (conversation) => {
                  conversation.messages.forEach(
                    (message) => {
                      messageIdsRef.current.add(message.id);
                    },
                  );
                },
              );

              if (
                !normalizedConversations.some(
                  (conversation) =>
                    conversation.id ===
                    String(payload.conversationId),
                )
              ) {
                return;
              }

              setConversations(normalizedConversations);

              const restoredConversation =
                normalizedConversations.find(
                  (conversation) =>
                    String(conversation.id) ===
                    String(payload.conversationId),
                );

              if (restoredConversation) {
                setSelectedId(restoredConversation.id);
                setShowMobileChat(true);
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
         * Update existing conversation.
         */
        setConversations((current) =>
          current.map((conversation) => {
            if (
              String(conversation.id) !==
              String(payload.conversationId)
            ) {
              return conversation;
            }

            const isCurrentConversation =
              selectedIdRef.current === conversation.id;

            const alreadyExists =
              conversation.messages.some(
                (message) => message.id === normalized.id,
              );

            return {
              ...conversation,

              messages: alreadyExists
                ? conversation.messages
                : [
                    ...conversation.messages,
                    normalized,
                  ],

              lastMessage: normalized.text,

              lastTime: formatConversationTime(
                payload.message.createdAt,
              ),

              unread:
                normalized.mine || isCurrentConversation
                  ? 0
                  : conversation.unread + 1,
            };
          }),
        );

        /*
         * Mark an incoming message as read if this
         * conversation is already open.
         */
        if (
          !normalized.mine &&
          selectedIdRef.current ===
            String(payload.conversationId) &&
          socket.connected
        ) {
          socket.emit(
            "message:read",
            {
              conversationId: payload.conversationId,
            },
            (
              response?: {
                success?: boolean;
                messageIds?: string[];
              },
            ) => {
              if (!response?.success) {
                console.warn(
                  "Unable to mark realtime message as read:",
                  response,
                );

                return;
              }

              notifyMessagesUpdated();
            },
          );
        }

        scrollToBottom();
      },
    );

    /*
     * =====================================================
     * REALTIME READ RECEIPTS
     * =====================================================
     */

    socket.on(
      "message:read",
      (payload: MessageReadPayload) => {
        console.log("Realtime message read:", payload);

        if (
          !payload?.conversationId ||
          !payload?.messageId
        ) {
          return;
        }

        setConversations((current) =>
          current.map((conversation) => {
            if (
              String(conversation.id) !==
              String(payload.conversationId)
            ) {
              return conversation;
            }

            return {
              ...conversation,

              messages: conversation.messages.map(
                (message) =>
                  String(message.id) ===
                  String(payload.messageId)
                    ? {
                        ...message,
                        read: payload.read === true,
                      }
                    : message,
              ),
            };
          }),
        );
      },
    );

    /*
     * -----------------------------------------------------
     * ONLINE / OFFLINE STATUS
     * -----------------------------------------------------
     */

    socket.on(
      "presence:update",
      (payload: PresencePayload) => {
        if (!payload?.userId) return;

        setConversations((current) =>
          current.map((conversation) =>
            String(conversation.participantId) ===
            String(payload.userId)
              ? {
                  ...conversation,
                  online: payload.online,
                }
              : conversation,
          ),
        );
      },
    );

    /*
     * -----------------------------------------------------
     * SOCKET CLEANUP
     * -----------------------------------------------------
     */

    return () => {
      console.log("Cleaning Socket.IO connection");

      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("message:new");
      socket.off("message:read");
      socket.off("presence:update");

      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [currentUserId]);

  /*
   * =====================================================
   * LOAD MESSAGES WHEN SELECTED CONVERSATION CHANGES
   * =====================================================
   *
   * Cached messages stay visible while the API refreshes.
   * The skeleton only appears when this conversation
   * does not have cached messages.
   */

  useEffect(() => {
    if (!selectedId || !currentUserId) return;

    let cancelled = false;

    const cacheKey = getMessageCacheKey(
      currentUserId,
      selectedId,
    );

    const hasCachedMessages = messagesCache.has(cacheKey);

    const loadMessages = async () => {
      try {
        if (!hasCachedMessages) {
          setLoadingMessages(true);
        } else {
          setLoadingMessages(false);
        }

        setErrorMessage("");

        const response = await fetch(
          `/api/conversations/${selectedId}/messages`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const data: MessagesResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load messages",
          );
        }

        if (cancelled) return;

        const loadedMessages = (
          data.messages || []
        ).map((message) =>
          normalizeMessage(message, currentUserId),
        );

        /*
         * Save refreshed messages in the cache.
         */
        messagesCache.set(cacheKey, loadedMessages);

        /*
         * Keep track of known message IDs.
         */
        loadedMessages.forEach((message) => {
          messageIdsRef.current.add(message.id);
        });

        /*
         * Update messages and clear local unread count.
         */
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === selectedId
              ? {
                  ...conversation,
                  messages: loadedMessages,
                  unread: 0,
                }
              : conversation,
          ),
        );

        /*
         * Join the conversation room.
         */
        if (socketRef.current?.connected) {
          socketRef.current.emit("conversation:join", {
            conversationId: selectedId,
          });

          /*
           * Notify Header only after the backend confirms
           * that messages were marked as read.
           */
          socketRef.current.emit(
            "message:read",
            {
              conversationId: selectedId,
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

              if (!response?.success) {
                console.warn(
                  "Unable to mark messages as read:",
                  response,
                );

                return;
              }

              notifyMessagesUpdated();
            },
          );
        }

        scrollToBottom();
      } catch (error) {
        console.error("Messages loading error:", error);

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load messages",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;

      if (socketRef.current?.connected) {
        socketRef.current.emit("conversation:leave", {
          conversationId: selectedId,
        });
      }
    };
  }, [selectedId, currentUserId]);

  /*
   * =====================================================
   * SELECT CONVERSATION
   * =====================================================
   */

  const openConversation = (conversationId: string) => {
    setShowChatMenu(false);

    if (
      socketRef.current?.connected &&
      selectedId &&
      selectedId !== conversationId
    ) {
      socketRef.current.emit("conversation:leave", {
        conversationId: selectedId,
      });
    }

    setSelectedId(conversationId);
    cachedSelectedConversationId = conversationId;

    setShowMobileChat(true);

    /*
     * Clear unread locally. Header is notified after
     * the backend confirms message:read.
     */
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
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

    const conversationId = selectedConversation.id;

    const shouldDelete = window.confirm(
      `Delete your conversation with ${selectedConversation.name}? The chat will be removed from your side. Messages will be permanently deleted only when both users delete the conversation.`,
    );

    if (!shouldDelete) return;

    try {
      setDeletingConversation(true);
      setErrorMessage("");
      setShowChatMenu(false);

      if (socketRef.current?.connected) {
        socketRef.current.emit("conversation:leave", {
          conversationId,
        });
      }

      const response = await fetch(
        `/api/delete/${conversationId}`,
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete conversation",
        );
      }

      /*
       * Clear URL query parameters so a deleted chat
       * is not automatically created again.
       */
      router.replace("/messages");

      /*
       * Clear deleted messages from duplicate tracking.
       */
      selectedConversation.messages.forEach((message) => {
        messageIdsRef.current.delete(message.id);
      });

      /*
       * Remove the deleted conversation from the cache.
       */
      messagesCache.delete(
        getMessageCacheKey(currentUserId, conversationId),
      );

      const remaining = conversations.filter(
        (conversation) => conversation.id !== conversationId,
      );

      conversationsCache = {
        userId: currentUserId,
        conversations: remaining,
      };

      setConversations(remaining);

      /*
       * Select the next available conversation.
       */
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        cachedSelectedConversationId = remaining[0].id;
        setShowMobileChat(true);
      } else {
        setSelectedId("");
        cachedSelectedConversationId = "";
        setShowMobileChat(false);
      }

      notifyMessagesUpdated();

      console.log("Conversation deleted successfully:", {
        conversationId,
        permanentlyDeleted: Boolean(
          data.permanentlyDeleted,
        ),
      });
    } catch (error) {
      console.error("Delete conversation error:", error);

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
  const text = messageText.trim();

  if (!text || !selectedId || sending) return;

  const socket = socketRef.current;

  if (!socket?.connected) {
    setErrorMessage(
      "Chat connection is unavailable. Please try again.",
    );
    return;
  }

  const conversationId = selectedId;
  const tempId = `temp-${Date.now()}`;

  const optimisticMessage: Message = {
    id: tempId,
    conversationId,
    senderId: currentUserId,
    receiverId:
      selectedConversation?.participantId || "",
    text,
    time: formatMessageTime(new Date().toISOString()),
    mine: true,
    read: false,
  };

  // Show the message immediately.
  messageIdsRef.current.add(tempId);

  setConversations((current) =>
    current.map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation;
      }

      return {
        ...conversation,
        messages: [
          ...conversation.messages,
          optimisticMessage,
        ],
        lastMessage: text,
        lastTime: "Now",
        unread: 0,
      };
    }),
  );

  // Clear the input immediately.
  setMessageText("");
  setSending(true);
  setErrorMessage("");
  scrollToBottom();

  socket.emit(
    "message:send",
    {
      conversationId,
      text,
    },
    (response?: {
      success?: boolean;
      message?: string;
    }) => {
      setSending(false);

      if (!response?.success) {
        // Remove the optimistic message if sending failed.
        messageIdsRef.current.delete(tempId);

        setConversations((current) =>
          current.map((conversation) => {
            if (conversation.id !== conversationId) {
              return conversation;
            }

            return {
              ...conversation,
              messages: conversation.messages.filter(
                (message) => message.id !== tempId,
              ),
            };
          }),
        );

        setMessageText(text);

        setErrorMessage(
          response?.message || "Unable to send message.",
        );

        return;
      }

      // The server accepted the message.
      // The message:new event should reconcile it
      // with the persisted message returned by the server.
    },
  );
};

  /*
   * -----------------------------------------------------
   * ENTER KEY SENDS MESSAGE
   * -----------------------------------------------------
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
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className="container">
          <div className={styles.pageHeader}>
            <div>
              <span className={styles.eyebrow}>
                <FiMessageCircle aria-hidden="true" />
                Your conversations
              </span>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              style={{ marginBottom: "16px" }}
            >
              {errorMessage}
            </div>
          )}

          <section className={styles.safetyCard}>
            <div className={styles.safetyIcon}>
              <FiMessageCircle aria-hidden="true" />
            </div>

            <div>
              <strong>No conversations yet</strong>
              <p>
                Start by connecting with a profile you are
                interested in.
              </p>
            </div>

            <Link href="/matches">Find matches</Link>
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
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              <FiMessageCircle aria-hidden="true" />
              Your conversations
            </span>
          </div>

          <div className={styles.messageCount}>
            <FiMessageCircle aria-hidden="true" />
            <span>{unreadTotal} unread</span>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            style={{ marginBottom: "16px" }}
          >
            {errorMessage}
          </div>
        )}

        {/* Messenger */}
        <section
          className={`${styles.messenger} ${
            showMobileChat ? styles.mobileChatOpen : ""
          }`}
        >
          {/* Conversations sidebar */}
          <aside className={styles.conversationPanel}>
            <div className={styles.conversationHeader}>
              <div>
                <Link
                  href="/search"
                  className={styles.backHomeButton}
                  aria-label="Back to home"
                  title="Back to Home"
                >
                  <FiArrowLeft aria-hidden="true" />
                  <span>Back</span>
                </Link>
              </div>
            </div>

            {/* Search */}
            <div className={styles.searchBox}>
              <FiSearch aria-hidden="true" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search conversations..."
                aria-label="Search conversations"
              />
            </div>

            {/* Conversation list */}
            <div className={styles.conversationList}>
              {loadingConversations ? (
                <SkeletonLoader
                  variant="conversations"
                  count={6}
                />
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <button
                    type="button"
                    key={conversation.id}
                    className={`${styles.conversationItem} ${
                      selectedId === conversation.id
                        ? styles.selectedConversation
                        : ""
                    }`}
                    onClick={() =>
                      openConversation(conversation.id)
                    }
                  >
                    <ProfileAvatar
                      photo={conversation.photo}
                      name={conversation.name}
                      initials={conversation.initials}
                      className={styles.conversationAvatar}
                      imageClassName={
                        styles.conversationAvatarImage
                      }
                      size={48}
                      online={conversation.online}
                      onlineClassName={styles.avatarOnline}
                    />

                    <div className={styles.conversationDetails}>
                      <div
                        className={
                          styles.conversationNameRow
                        }
                      >
                        <strong>{conversation.name}</strong>

                        {conversation.verified && (
                          <span
                            className={styles.smallVerified}
                          >
                            <FiCheck aria-hidden="true" />
                          </span>
                        )}

                        <time>{conversation.lastTime}</time>
                      </div>

                      <div
                        className={
                          styles.conversationBottom
                        }
                      >
                        <p>{conversation.lastMessage}</p>

                        {conversation.unread > 0 && (
                          <span className={styles.unreadBadge}>
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className={styles.noConversations}>
                  <FiSearch aria-hidden="true" />
                  <strong>No conversations found</strong>
                  <span>Try a different search.</span>
                </div>
              )}
            </div>

            {/* Privacy */}
            <div className={styles.sidebarPrivacy}>
              <FiLock aria-hidden="true" />
              <span>Your conversations are private.</span>
            </div>
          </aside>

          {/* Chat panel */}
          <section className={styles.chatPanel}>
            {!selectedConversation ? (
              <div className={styles.noConversations}>
                <FiMessageCircle aria-hidden="true" />
                <strong>Select a conversation</strong>
                <span>
                  Choose someone from your conversations.
                </span>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <header className={styles.chatHeader}>
                  <button
                    type="button"
                    className={styles.mobileBack}
                    onClick={() => {
                      setShowMobileChat(false);
                      setShowChatMenu(false);
                    }}
                    aria-label="Back to conversations"
                  >
                    <FiChevronLeft aria-hidden="true" />
                  </button>

                  <Link
                    href={`/profile/${selectedConversation.participantId}`}
                    className={styles.chatUser}
                  >
                    <ProfileAvatar
                      photo={selectedConversation.photo}
                      name={selectedConversation.name}
                      initials={selectedConversation.initials}
                      className={styles.chatAvatar}
                      imageClassName={styles.chatAvatarImage}
                      size={48}
                      online={selectedConversation.online}
                    />

                    <div>
                      <div className={styles.chatName}>
                        <strong>
                          {selectedConversation.name}
                        </strong>

                        {selectedConversation.verified && (
                          <span className={styles.chatVerified}>
                            <FiCheck aria-hidden="true" />
                          </span>
                        )}
                      </div>

                      <span className={styles.chatStatus}>
                        {selectedConversation.online
                          ? "Online now"
                          : selectedConversation.location}
                      </span>
                    </div>
                  </Link>

                  {/* Chat actions */}
                  <div className={styles.chatActions}>
                    {selectedConversation.phone && (
                      <a
                        href={`tel:${selectedConversation.phone}`}
                        aria-label="Call"
                        title="Call"
                      >
                        <FiPhone aria-hidden="true" />
                      </a>
                    )}

                    <div className={styles.chatMenuWrapper}>
                      <button
                        type="button"
                        aria-label="More options"
                        title="More options"
                        onClick={() =>
                          setShowChatMenu((current) => !current)
                        }
                        disabled={deletingConversation}
                      >
                        <FiMoreHorizontal aria-hidden="true" />
                      </button>

                      {showChatMenu && (
                        <div className={styles.chatMenu}>
                          <button
                            type="button"
                            className={styles.deleteChatButton}
                            onClick={deleteConversation}
                            disabled={deletingConversation}
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

                {/* Profile strip */}
                <div className={styles.profileStrip}>
                  <div>
                    <span className={styles.stripIcon}>
                      <FiHeart aria-hidden="true" />
                    </span>

                    <div>
                      <strong>
                        {selectedConversation.compatibility}%
                        {" "}compatibility
                      </strong>

                      <span>
                        {selectedConversation.profession}
                        {" · "}
                        {selectedConversation.location}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/profile/${selectedConversation.participantId}`}
                  >
                    View profile
                  </Link>
                </div>

                {/* Messages area */}
                <div className={styles.messagesArea}>
                  <div className={styles.safetyMessage}>
                    <FiShield aria-hidden="true" />

                    <span>
                      Take your time getting to know each other.
                      Never share sensitive personal information
                      unless you feel comfortable.
                    </span>
                  </div>

                  <div className={styles.dateDivider}>
                    <span>Today</span>
                  </div>

                  {/* Cached messages are displayed without
                      a skeleton while the API refreshes. */}
                  {loadingMessages ? (
                    <SkeletonLoader
                      variant="messages"
                      count={5}
                    />
                  ) : selectedConversation.messages.length > 0 ? (
                    selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`${styles.messageRow} ${
                          message.mine
                            ? styles.myMessage
                            : styles.theirMessage
                        }`}
                      >
                        {!message.mine && (
                          <ProfileAvatar
                            photo={selectedConversation.photo}
                            name={selectedConversation.name}
                            initials={selectedConversation.initials}
                            className={styles.messageAvatar}
                            imageClassName={
                              styles.messageAvatarImage
                            }
                            size={36}
                          />
                        )}

                        <div className={styles.messageContent}>
                          <div className={styles.messageBubble}>
                            {message.text}
                          </div>

                          <div className={styles.messageMeta}>
                            <time>{message.time}</time>

                            {message.mine && (
                              <span
                                className={
                                  message.read
                                    ? styles.readStatus
                                    : ""
                                }
                              >
                                <FiCheck aria-hidden="true" />

                                {message.read && (
                                  <FiCheck aria-hidden="true" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noConversations}>
                      <FiMessageCircle aria-hidden="true" />
                      <strong>No messages yet</strong>
                      <span>Start the conversation.</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Composer */}
                <div className={styles.composerArea}>
                  <div className={styles.composerHint}>
                    <FiShield aria-hidden="true" />
                    <span>
                      Keep conversations respectful and private.
                    </span>
                  </div>

                  <div className={styles.composer}>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(event.target.value)
                      }
                      onKeyDown={handleMessageKeyDown}
                      placeholder="Write a message..."
                      aria-label="Write a message"
                      maxLength={2000}
                      disabled={
                        sending || deletingConversation
                      }
                    />

                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={
                        !messageText.trim() ||
                        sending ||
                        deletingConversation
                      }
                      aria-label="Send message"
                      className={styles.sendButton}
                    >
                      <FiSend aria-hidden="true" />
                    </button>
                  </div>

                  <p className={styles.composerPrivacy}>
                    Messages are intended for people you have
                    connected with.
                  </p>
                </div>
              </>
            )}
          </section>
        </section>

        {/* Bottom safety card */}
        <section className={styles.safetyCard}>
          <Link href="/safety">
            <FiShield aria-hidden="true" />
            Safety tips
            <FiChevronLeft aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}