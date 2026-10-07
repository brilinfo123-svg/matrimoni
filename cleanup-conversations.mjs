import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const uri =
  process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is missing",
  );
}

const ConversationSchema =
  new mongoose.Schema(
    {
      participants: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
        },
      ],

      conversationKey: String,

      lastMessage: String,

      lastMessageAt: Date,
    },
    {
      timestamps: true,
    },
  );

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model(
    "Conversation",
    ConversationSchema,
  );

function createKey(
  userA,
  userB,
) {
  return [
    String(userA),
    String(userB),
  ]
    .sort()
    .join("_");
}

await mongoose.connect(uri);

console.log(
  "MongoDB connected",
);

const conversations =
  await Conversation.find();

const groups = new Map();

for (const conversation of conversations) {
  if (
    !conversation.participants ||
    conversation.participants.length !== 2
  ) {
    continue;
  }

  const key = createKey(
    conversation.participants[0],
    conversation.participants[1],
  );

  if (!groups.has(key)) {
    groups.set(key, []);
  }

  groups
    .get(key)
    .push(conversation);
}

for (
  const [
    key,
    items,
  ] of groups
) {
  /*
   * Newest conversation first.
   */
  items.sort(
    (a, b) =>
      new Date(
        b.lastMessageAt || b.createdAt,
      ).getTime() -
      new Date(
        a.lastMessageAt || a.createdAt,
      ).getTime(),
  );

  const keep =
    items[0];

  /*
   * Add conversation key.
   */
  if (
    keep.conversationKey !==
    key
  ) {
    keep.conversationKey =
      key;

    await keep.save();
  }

  /*
   * Delete duplicates.
   */
  if (items.length > 1) {
    const duplicates =
      items.slice(1);

    console.log(
      `Found ${duplicates.length} duplicate conversation(s) for ${key}`,
    );

    for (
      const duplicate of duplicates
    ) {
      console.log(
        "Deleting:",
        String(
          duplicate._id,
        ),
      );

      await Conversation.deleteOne({
        _id:
          duplicate._id,
      });
    }
  }
}

console.log(
  "Conversation cleanup completed.",
);

await mongoose.disconnect();