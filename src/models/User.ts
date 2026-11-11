import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  profileFor: string;
  email: string;
  mobile: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  state: string;
  city: string;
  religion: string;
  cast: string;
  motherTongue: string;
  maritalStatus: string;
  education: string;
  college: string;
  profession: string;
  company: string;
  income: string;
  aboutYourself: string;
  diet: string;
  smoking: string;
  drinking: string;
  partnerAgeMin: string;
  partnerAgeMax: string;
  partnerState: string;
  partnerCity: string;
  partnerReligion: string;
  partnerCast: string;
  partnerEducation: string;
  partnerProfession: string;
  partnerMaritalStatus: string;
  photos: string[];
  photoPublicIds: string[];
  isMobileVisible: boolean;
  isActive: boolean;
  favorites: mongoose.Types.ObjectId[];
  isProfileComplete: boolean;

  // Contact monetization fields
  contactCredits: number;
  freeContactUnlocksUsed: number;
  premiumUntil: Date | null;
  unlockedProfiles: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    profileFor: {
      type: String,
      required: true,
      enum: ["self", "son", "daughter", "brother", "sister", "friend", "relative"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    religion: {
      type: String,
      default: "",
      trim: true,
    },
    cast: {
      type: String,
      default: "",
      trim: true,
    },
    motherTongue: {
      type: String,
      default: "",
      trim: true,
    },
    maritalStatus: {
      type: String,
      default: "",
      trim: true,
    },
    education: {
      type: String,
      default: "",
      trim: true,
    },
    college: {
      type: String,
      default: "",
      trim: true,
    },
    profession: {
      type: String,
      default: "",
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    income: {
      type: String,
      default: "",
      trim: true,
    },
    aboutYourself: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    diet: {
      type: String,
      default: "",
      trim: true,
    },
    smoking: {
      type: String,
      default: "",
      trim: true,
    },
    drinking: {
      type: String,
      default: "",
      trim: true,
    },
    partnerAgeMin: {
      type: String,
      default: "",
    },
    partnerAgeMax: {
      type: String,
      default: "",
    },
    partnerState: {
      type: String,
      default: "",
      trim: true,
    },
    partnerCity: {
      type: String,
      default: "",
      trim: true,
    },
    partnerReligion: {
      type: String,
      default: "",
      trim: true,
    },
    partnerCast: {
      type: String,
      default: "",
      trim: true,
    },
    partnerEducation: {
      type: String,
      default: "",
      trim: true,
    },
    partnerProfession: {
      type: String,
      default: "",
      trim: true,
    },
    partnerMaritalStatus: {
      type: String,
      default: "",
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    photoPublicIds: {
      type: [String],
      default: [],
    },
    isMobileVisible: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    favorites: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // Contact monetization fields
      contactCredits: {
        type: Number,
        default: 0,
        min: 0,
      },

      freeContactUnlocksUsed: {
        type: Number,
        default: 0,
        min: 0,
      },

      premiumUntil: {
        type: Date,
        default: null,
      },

      unlockedProfiles: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: [],
      },
  },
  {
    timestamps: true,
  },
);

const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

export default User;
