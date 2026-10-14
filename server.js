import { createServer } from "http";
import { parse } from "url";

import next from "next";
import { Server } from "socket.io";
import nextEnv from "@next/env";
import mongoose from "mongoose";
import { jwtVerify } from "jose";
import webpush from "web-push";

const { loadEnvConfig } = nextEnv;

/* =======================================================
   LOAD ENV
======================================================= */

loadEnvConfig(process.cwd());

/* =======================================================
   WEB PUSH
======================================================= */

let webPushEnabled = false;

const vapidSubject = process.env.VAPID_SUBJECT;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidSubject && vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey,
    );

    webPushEnabled = true;
    console.log("Web Push: enabled");
  } catch (error) {
    console.error("Web Push configuration error:", error);
  }
} else {
  console.warn(
    "Web Push: disabled because VAPID environment variables are missing.",
  );
}

/* =======================================================
   NEXT CONFIG
======================================================= */

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT) || 3000;

const app = next({
  dev,
  hostname,
  port,
});

const handle = app.getRequestHandler();

/* =======================================================
   MONGODB
======================================================= */

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(uri);

  console.log("MongoDB connected");
}

/* =======================================================
   NOTIFICATION USER MODEL
======================================================= */

/*
  IMPORTANT:
  This model is only for reading sender names.

  It uses the existing "users" collection.
  It does not create a separate users collection.

  A separate model name avoids reusing the full
  registration User model with a limited schema.
*/

const NotificationUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },
  },
  {
    collection: "users",
    strict: true,
  },
);

const NotificationUser =
  mongoose.models.NotificationUser ||
  mongoose.model(
    "NotificationUser",
    NotificationUserSchema,
    "users",
  );

/* =======================================================
   CONVERSATION SCHEMA
======================================================= */

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    conversationKey: {
      type: String,
      index: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

/* =======================================================
   MESSAGE SCHEMA
======================================================= */

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

/* =======================================================
   PUSH SUBSCRIPTION SCHEMA
======================================================= */

const PushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    endpoint: {
      type: String,
      required: true,
      unique: true,
    },

    keys: {
      p256dh: {
        type: String,
        required: true,
      },

      auth: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

/* =======================================================
   MODELS
======================================================= */

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);

const Message =
  mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);

const PushSubscription =
  mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", PushSubscriptionSchema);

/* =======================================================
   HELPERS
======================================================= */

function parseCookies(cookieHeader = "") {
  const cookies = {};

  cookieHeader.split(";").forEach((part) => {
    const index = part.indexOf("=");

    if (index === -1) {
      return;
    }

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  });

  return cookies;
}

async function verifyAuthToken(token) {
  try {
    if (!token) {
      return null;
    }

    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      console.error("AUTH_SECRET missing");
      return null;
    }

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "string" ||
      !payload.userId
    ) {
      return null;
    }

    return {
      userId: payload.userId,
    };
  } catch (error) {
    console.error(
      "Socket JWT error:",
      error?.message || error,
    );

    return null;
  }
}

function isValidObjectId(id) {
  return mongoose.isValidObjectId(id);
}

/* =======================================================
   GET SENDER NAME
======================================================= */

async function getSenderName(userId) {
  try {
    if (!mongoose.isValidObjectId(userId)) {
      return "Someone";
    }

    const user = await NotificationUser.findById(userId)
      .select("firstName lastName")
      .lean();

    if (!user) {
      return "Someone";
    }

    const firstName =
      typeof user.firstName === "string"
        ? user.firstName.trim()
        : "";

    const lastName =
      typeof user.lastName === "string"
        ? user.lastName.trim()
        : "";

    return `${firstName} ${lastName}`.trim() || "Someone";
  } catch (error) {
    console.error("GET_SENDER_NAME_ERROR:", error);
    return "Someone";
  }
}

/* =======================================================
   WEB PUSH HELPER
======================================================= */

async function sendPushNotificationToUser(userId, payload) {
  if (!webPushEnabled) {
    return;
  }

  try {
    const subscriptions = await PushSubscription.find({
      userId: String(userId),
    }).lean();

    if (!subscriptions.length) {
      return;
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        };

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload),
            {
              TTL: 60 * 60,
              urgency: "high",
            },
          );
        } catch (error) {
          const statusCode = error?.statusCode;

          if (statusCode === 404 || statusCode === 410) {
            await PushSubscription.deleteOne({
              _id: subscription._id,
            });

            console.log(
              "Removed expired push subscription:",
              subscription.endpoint,
            );
          }

          throw error;
        }
      }),
    );

    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Push send failed:", result.reason);
      }
    }
  } catch (error) {
    console.error("WEB_PUSH_SEND_ERROR:", error);
  }
}

/* =======================================================
   NEXT SERVER
======================================================= */

await app.prepare();

const httpServer = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url, true);

    await handle(req, res, parsedUrl);
  } catch (error) {
    console.error("Next request error:", error);

    res.statusCode = 500;
    res.end("Internal server error");
  }
});

/* =======================================================
   SOCKET.IO
======================================================= */

const io = new Server(httpServer, {
  path: "/socket.io",

  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  },

  transports: ["websocket", "polling"],

  pingTimeout: 20000,
  pingInterval: 25000,
});

/* =======================================================
   SOCKET AUTH
======================================================= */

io.use(async (socket, next) => {
  try {
    const socketToken = socket.handshake.auth?.token;

    const cookieHeader = socket.handshake.headers.cookie || "";
    const cookies = parseCookies(cookieHeader);
    const cookieToken = cookies.matrimonial_session;

    const token = socketToken || cookieToken;

    if (!token) {
      console.error("Socket: authentication token missing");
      return next(new Error("Unauthorized"));
    }

    const session = await verifyAuthToken(token);

    if (!session?.userId) {
      return next(new Error("Unauthorized"));
    }

    socket.userId = String(session.userId);

    next();
  } catch (error) {
    console.error(
      "Socket authentication failed:",
      error?.message || error,
    );

    next(new Error("Socket authentication failed"));
  }
});

/* =======================================================
   ONLINE USERS
======================================================= */

const onlineUsers = new Map();

/* =======================================================
   SOCKET CONNECTION
======================================================= */

io.on("connection", (socket) => {
  const userId = String(socket.userId);

  console.log("Socket connected:", socket.id, "user:", userId);

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socket.id);

  socket.join(`user:${userId}`);

  io.emit("presence:update", {
    userId,
    online: true,
  });

  /* =====================================================
     JOIN CONVERSATION
  ===================================================== */

  socket.on("conversation:join", async (payload) => {
    try {
      const conversationId = payload?.conversationId;

      if (
        !conversationId ||
        !isValidObjectId(conversationId)
      ) {
        return;
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      }).lean();

      if (!conversation) {
        console.warn(
          "Unauthorized conversation join:",
          userId,
          conversationId,
        );

        return;
      }

      socket.join(`conversation:${conversationId}`);

      console.log(
        `User ${userId} joined conversation ${conversationId}`,
      );
    } catch (error) {
      console.error("conversation:join error:", error);
    }
  });

  /* =====================================================
     LEAVE CONVERSATION
  ===================================================== */

  socket.on("conversation:leave", (payload) => {
    const conversationId = payload?.conversationId;

    if (!conversationId) {
      return;
    }

    socket.leave(`conversation:${conversationId}`);
  });

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  socket.on("message:send", async (payload, callback) => {
    try {
      const conversationId = payload?.conversationId;

      const text =
        typeof payload?.text === "string"
          ? payload.text.trim()
          : "";

      if (!conversationId || !isValidObjectId(conversationId)) {
        callback?.({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }

      if (!text) {
        callback?.({
          success: false,
          message: "Message text is required",
        });
        return;
      }

      if (text.length > 2000) {
        callback?.({
          success: false,
          message: "Message cannot exceed 2000 characters",
        });
        return;
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        callback?.({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      const receiverId = conversation.participants.find(
        (participantId) => String(participantId) !== userId,
      );

      if (!receiverId) {
        callback?.({
          success: false,
          message: "Receiver not found",
        });
        return;
      }

      const receiverUserId = String(receiverId);
      const senderName = await getSenderName(userId);

      const message = await Message.create({
        conversationId: conversation._id,
        senderId: new mongoose.Types.ObjectId(userId),
        receiverId,
        text,
        read: false,
      });

      await Conversation.findByIdAndUpdate(conversation._id, {
        $set: {
          lastMessage: text,
          lastMessageAt: message.createdAt,
        },
      });

      const messagePayload = {
        conversationId: String(conversation._id),

        message: {
          id: String(message._id),
          _id: String(message._id),
          conversationId: String(message.conversationId),
          senderId: String(message.senderId),
          receiverId: String(message.receiverId),
          text: message.text,
          read: message.read,
          createdAt: message.createdAt?.toISOString(),
          updatedAt: message.updatedAt?.toISOString(),
        },
      };

      io.to(`user:${userId}`).emit("message:new", messagePayload);
      io.to(`user:${receiverUserId}`).emit("message:new", messagePayload);

      const receiverSockets = onlineUsers.get(receiverUserId);
      const receiverIsOnline = Boolean(
        receiverSockets && receiverSockets.size > 0,
      );

      if (!receiverIsOnline) {
        await sendPushNotificationToUser(receiverUserId, {
          title: `${senderName} sent you a message`,

          body:
            text.length > 100
              ? `${text.substring(0, 100)}...`
              : text,

          senderName,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          url: `/messages?profile=${userId}`,
          conversationId: String(conversation._id),
          senderId: userId,
          tag: `message-${String(message._id)}`,
        });
      }

      callback?.({
        success: true,
        message: "Message sent",
      });

      console.log("Message sent:", {
        conversationId: String(conversation._id),
        senderId: userId,
        senderName,
        receiverId: receiverUserId,
        pushSent: !receiverIsOnline && webPushEnabled,
      });
    } catch (error) {
      console.error("message:send error:", error);

      callback?.({
        success: false,
        message: "Unable to send message",
      });
    }
  });

  /* =====================================================
     MESSAGE READ
  ===================================================== */

  socket.on("message:read", async (payload, callback) => {
    try {
      const conversationId = payload?.conversationId;

      if (!conversationId || !isValidObjectId(conversationId)) {
        callback?.({
          success: false,
          message: "Invalid conversation ID",
        });
        return;
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      }).lean();

      if (!conversation) {
        callback?.({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      const unreadMessages = await Message.find({
        conversationId,
        receiverId: userId,
        read: false,
      })
        .select("_id senderId")
        .lean();

      if (!unreadMessages.length) {
        callback?.({
          success: true,
          messageIds: [],
        });
        return;
      }

      const messageIds = unreadMessages.map((message) =>
        String(message._id),
      );

      await Message.updateMany(
        {
          _id: {
            $in: unreadMessages.map((message) => message._id),
          },
          receiverId: userId,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        },
      );

      for (const message of unreadMessages) {
        io.to(`user:${String(message.senderId)}`).emit(
          "message:read",
          {
            conversationId: String(conversationId),
            messageId: String(message._id),
            read: true,
          },
        );
      }

      callback?.({
        success: true,
        messageIds,
      });

      console.log("Messages marked as read:", {
        conversationId: String(conversationId),
        readerId: userId,
        messageIds,
      });
    } catch (error) {
      console.error("message:read error:", error);

      callback?.({
        success: false,
        message: "Unable to mark messages as read",
      });
    }
  });

  /* =====================================================
     DISCONNECT
  ===================================================== */

  socket.on("disconnect", (reason) => {
    console.log(
      "Socket disconnected:",
      socket.id,
      "user:",
      userId,
      "reason:",
      reason,
    );

    const userSockets = onlineUsers.get(userId);

    if (userSockets) {
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        onlineUsers.delete(userId);

        io.emit("presence:update", {
          userId,
          online: false,
        });
      }
    }
  });
});

/* =======================================================
   START
======================================================= */

httpServer.listen(port, hostname, async () => {
  try {
    await connectDB();

    console.log("");
    console.log("========================================");
    console.log(`Next.js:    http://${hostname}:${port}`);
    console.log(`Socket.IO:  http://${hostname}:${port}/socket.io`);
    console.log(`Web Push:   ${webPushEnabled ? "Enabled" : "Disabled"}`);
    console.log("========================================");
    console.log("");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
});