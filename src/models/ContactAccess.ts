import mongoose, { Schema, models, model } from "mongoose";

const ContactAccessSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    profileId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    source: {
      type: String,
      enum: ["free", "credit", "premium"],
      required: true,
    },
  },
  { timestamps: true }
);

// One user unlocks one profile only once.
ContactAccessSchema.index(
  { userId: 1, profileId: 1 },
  { unique: true }
);

export default models.ContactAccess || model("ContactAccess", ContactAccessSchema);