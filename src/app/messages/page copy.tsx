"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronLeft,
  FiHeart,
  FiInfo,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiMoreHorizontal,
  FiPhone,
  FiSearch,
  FiSend,
  FiShield,
  FiStar,
  FiVideo,
} from "react-icons/fi";

import styles from "./messages.module.scss";

type Message = {
  id: number;
  text: string;
  time: string;
  mine: boolean;
  read?: boolean;
};

type Conversation = {
  id: string;
  name: string;
  initials: string;
  location: string;
  profession: string;
  compatibility: number;
  verified: boolean;
  online: boolean;
  unread: number;
  lastMessage: string;
  lastTime: string;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  {
    id: "ananya-sharma",
    name: "Ananya Sharma",
    initials: "AS",
    location: "Toronto, Canada",
    profession: "Product Designer",
    compatibility: 94,
    verified: true,
    online: true,
    unread: 2,
    lastMessage:
      "It was lovely connecting with you.",
    lastTime: "10m",
    messages: [
      {
        id: 1,
        text: "Hi Akash! Thanks for reaching out.",
        time: "10:12 PM",
        mine: false,
      },
      {
        id: 2,
        text: "Hi Ananya! I enjoyed reading your profile.",
        time: "10:14 PM",
        mine: true,
        read: true,
      },
      {
        id: 3,
        text: "That’s nice to hear. We seem to have quite a few things in common.",
        time: "10:16 PM",
        mine: false,
      },
      {
        id: 4,
        text: "Yes, I noticed that too. I’d love to get to know you better.",
        time: "10:18 PM",
        mine: true,
        read: true,
      },
      {
        id: 5,
        text: "It was lovely connecting with you.",
        time: "10:20 PM",
        mine: false,
      },
    ],
  },
  {
    id: "priya-mehta",
    name: "Priya Mehta",
    initials: "PM",
    location: "Vancouver, Canada",
    profession: "Software Engineer",
    compatibility: 91,
    verified: true,
    online: false,
    unread: 1,
    lastMessage:
      "I saw your profile. We have a lot in common.",
    lastTime: "1h",
    messages: [
      {
        id: 1,
        text: "Hello Akash, nice to connect with you.",
        time: "8:40 PM",
        mine: false,
      },
      {
        id: 2,
        text: "Hello Priya! Nice to connect with you too.",
        time: "8:43 PM",
        mine: true,
        read: true,
      },
      {
        id: 3,
        text: "I saw your profile. We have a lot in common.",
        time: "8:46 PM",
        mine: false,
      },
    ],
  },
  {
    id: "meera-kapoor",
    name: "Meera Kapoor",
    initials: "MK",
    location: "Brampton, Canada",
    profession: "Marketing Manager",
    compatibility: 88,
    verified: true,
    online: true,
    unread: 0,
    lastMessage:
      "Thanks for accepting my interest.",
    lastTime: "Yesterday",
    messages: [
      {
        id: 1,
        text: "Hi Akash, how are you?",
        time: "Yesterday",
        mine: false,
      },
      {
        id: 2,
        text: "I’m doing well, thank you. How about you?",
        time: "Yesterday",
        mine: true,
        read: true,
      },
      {
        id: 3,
        text: "I’m good! Thanks for accepting my interest.",
        time: "Yesterday",
        mine: false,
      },
    ],
  },
  {
    id: "riya-patel",
    name: "Riya Patel",
    initials: "RP",
    location: "Mississauga, Canada",
    profession: "Financial Analyst",
    compatibility: 86,
    verified: false,
    online: false,
    unread: 0,
    lastMessage:
      "Would love to know more about your interests.",
    lastTime: "Mon",
    messages: [
      {
        id: 1,
        text: "Hi! Your profile looks interesting.",
        time: "Monday",
        mine: false,
      },
      {
        id: 2,
        text: "Thank you, Riya. I’d be happy to chat.",
        time: "Monday",
        mine: true,
        read: true,
      },
      {
        id: 3,
        text: "Would love to know more about your interests.",
        time: "Monday",
        mine: false,
      },
    ],
  },
  {
    id: "neha-verma",
    name: "Neha Verma",
    initials: "NV",
    location: "Ottawa, Canada",
    profession: "HR Manager",
    compatibility: 84,
    verified: true,
    online: true,
    unread: 0,
    lastMessage:
      "Maybe we can talk about travel sometime.",
    lastTime: "Sun",
    messages: [
      {
        id: 1,
        text: "Hello Akash!",
        time: "Sunday",
        mine: false,
      },
      {
        id: 2,
        text: "Hi Neha! How has your week been?",
        time: "Sunday",
        mine: true,
        read: true,
      },
      {
        id: 3,
        text: "Pretty good. Maybe we can talk about travel sometime.",
        time: "Sunday",
        mine: false,
      },
    ],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState(
    initialConversations,
  );

  const [selectedId, setSelectedId] = useState(
    initialConversations[0].id,
  );

  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showMobileChat, setShowMobileChat] =
    useState(false);

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === selectedId,
    ) ?? conversations[0];

  const filteredConversations = useMemo(() => {
    if (!search.trim()) {
      return conversations;
    }

    const query = search.toLowerCase();

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

  const unreadTotal = conversations.reduce(
    (total, conversation) =>
      total + conversation.unread,
    0,
  );

  const openConversation = (id: string) => {
    setSelectedId(id);
    setShowMobileChat(true);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              unread: 0,
            }
          : conversation,
      ),
    );
  };

  const sendMessage = () => {
    const text = messageText.trim();

    if (!text) {
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      mine: true,
      read: false,
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedId
          ? {
              ...conversation,
              lastMessage: text,
              lastTime: "now",
              messages: [
                ...conversation.messages,
                newMessage,
              ],
            }
          : conversation,
      ),
    );

    setMessageText("");
  };

  const handleMessageKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

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

            <h1>Messages</h1>

            <p>
              Connect, chat and get to know each other at
              your own pace.
            </p>
          </div>

          <div className={styles.messageCount}>
            <FiMessageCircle aria-hidden="true" />
            <span>
              {unreadTotal} unread
            </span>
          </div>
        </div>

        {/* Messenger */}
        <section
          className={`${styles.messenger} ${
            showMobileChat
              ? styles.mobileChatOpen
              : ""
          }`}
        >
          {/* Conversations sidebar */}
          <aside className={styles.conversationPanel}>
            <div className={styles.conversationHeader}>
              <div>
                <h2>Conversations</h2>

                <span>
                  {conversations.length} connections
                </span>
              </div>

              <button
                type="button"
                aria-label="Message information"
                className={styles.infoButton}
                title="Your conversations are private"
              >
                <FiInfo aria-hidden="true" />
              </button>
            </div>

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

            <div className={styles.conversationList}>
              {filteredConversations.length > 0 ? (
                filteredConversations.map(
                  (conversation) => (
                    <button
                      type="button"
                      key={conversation.id}
                      className={`${styles.conversationItem} ${
                        selectedId === conversation.id
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
                          {conversation.initials}
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
                            {conversation.name}
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
                            {conversation.lastTime}
                          </time>
                        </div>

                        <div
                          className={
                            styles.conversationBottom
                          }
                        >
                          <p>
                            {conversation.lastMessage}
                          </p>

                          {conversation.unread > 0 && (
                            <span
                              className={
                                styles.unreadBadge
                              }
                            >
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ),
                )
              ) : (
                <div className={styles.noConversations}>
                  <FiSearch aria-hidden="true" />
                  <strong>No conversations found</strong>
                  <span>
                    Try a different search.
                  </span>
                </div>
              )}
            </div>

            <div className={styles.sidebarPrivacy}>
              <FiLock aria-hidden="true" />

              <span>
                Your conversations are private.
              </span>
            </div>
          </aside>

          {/* Chat */}
          <section className={styles.chatPanel}>
            <header className={styles.chatHeader}>
              <button
                type="button"
                className={styles.mobileBack}
                onClick={() =>
                  setShowMobileChat(false)
                }
                aria-label="Back to conversations"
              >
                <FiChevronLeft
                  aria-hidden="true"
                />
              </button>

              <Link
                href={`/profile/${selectedConversation.id}`}
                className={styles.chatUser}
              >
                <div className={styles.chatAvatar}>
                  <span>
                    {selectedConversation.initials}
                  </span>

                  {selectedConversation.online && (
                    <i />
                  )}
                </div>

                <div>
                  <div
                    className={styles.chatName}
                  >
                    <strong>
                      {selectedConversation.name}
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

              <div className={styles.chatActions}>
                <a
                  href="tel:+14165550123"
                  aria-label="Call"
                  title="Call"
                >
                  <FiPhone aria-hidden="true" />
                </a>

                <button
                  type="button"
                  aria-label="More options"
                  title="More options"
                >
                  <FiMoreHorizontal
                    aria-hidden="true"
                  />
                </button>
              </div>
            </header>

            {/* Profile strip */}
            <div className={styles.profileStrip}>
              <div>
                <span className={styles.stripIcon}>
                  <FiHeart
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <strong>
                    {selectedConversation.compatibility}%
                    compatibility
                  </strong>

                  <span>
                    {selectedConversation.profession}
                    {" · "}
                    {selectedConversation.location}
                  </span>
                </div>
              </div>

              <Link
                href={`/profile/${selectedConversation.id}`}
              >
                View profile
              </Link>
            </div>

            {/* Messages */}
            <div className={styles.messagesArea}>
              <div className={styles.dateDivider}>
                <span>Today</span>
              </div>

              <div className={styles.safetyMessage}>
                <FiShield aria-hidden="true" />

                <span>
                  Take your time getting to know each
                  other. Never share sensitive personal
                  information unless you feel comfortable.
                </span>
              </div>

              {selectedConversation.messages.map(
                (message) => (
                  <div
                    key={message.id}
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
                        {message.text}
                      </div>

                      <div
                        className={
                          styles.messageMeta
                        }
                      >
                        <time>
                          {message.time}
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
              )}
            </div>

            {/* Composer */}
            <div className={styles.composerArea}>
              <div className={styles.composerHint}>
                <FiShield aria-hidden="true" />

                <span>
                  Keep conversations respectful and
                  private.
                </span>
              </div>

              <div className={styles.composer}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(
                      event.target.value,
                    )
                  }
                  onKeyDown={
                    handleMessageKeyDown
                  }
                  placeholder="Write a message..."
                  aria-label="Write a message"
                />

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
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

              <p className={styles.composerPrivacy}>
                Messages are intended for people you
                have connected with.
              </p>
            </div>
          </section>
        </section>

        {/* Bottom safety card */}
        <section className={styles.safetyCard}>
          <div className={styles.safetyIcon}>
            <FiShield aria-hidden="true" />
          </div>

          <div>
            <strong>
              Stay safe while chatting
            </strong>

            <p>
              Never share passwords, financial details,
              verification codes or other sensitive
              information with anyone.
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
