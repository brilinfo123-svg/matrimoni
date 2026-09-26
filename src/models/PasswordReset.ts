import mongoose, {
    Document,
    Model,
    Schema,
  } from "mongoose";
  
  export interface IPasswordReset extends Document {
    email: string;
    otpHash: string;
    expiresAt: Date;
    attempts: number;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const PasswordResetSchema =
    new Schema<IPasswordReset>(
      {
        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
          index: true,
        },
  
        otpHash: {
          type: String,
          required: true,
        },
  
        expiresAt: {
          type: Date,
          required: true,
        },
  
        attempts: {
          type: Number,
          default: 0,
        },
  
        verified: {
          type: Boolean,
          default: false,
        },
      },
      {
        timestamps: true,
      },
    );
  
  // Automatically delete expired OTP records
  PasswordResetSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 },
  );
  
  const PasswordReset =
    (mongoose.models.PasswordReset as Model<IPasswordReset>) ||
    mongoose.model<IPasswordReset>(
      "PasswordReset",
      PasswordResetSchema,
    );
  
  export default PasswordReset;