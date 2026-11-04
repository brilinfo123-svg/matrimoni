import mongoose, { Schema, models, model } from "mongoose";

const PaymentOrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["contact_pack", "monthly"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    provider: {
      type: String,
      enum: ["razorpay", "google_play"],
      required: true,
    },

    providerOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    providerPaymentId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },

    fulfilledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default models.PaymentOrder || model("PaymentOrder", PaymentOrderSchema);