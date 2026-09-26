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
  motherTongue: string;
  maritalStatus: string;

  education: string;
  college: string;
  profession: string;
  company: string;
  income: string;

  familyType: string;
  familyValues: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;

  lifestyle: string;
  diet: string;
  smoking: string;
  drinking: string;

  partnerAgeMin: string;
  partnerAgeMax: string;

  partnerState: string;
  partnerCity: string;

  partnerReligion: string;
  partnerEducation: string;
  partnerProfession: string;
  partnerMaritalStatus: string;
  partnerLifestyle: string;

  photos: string[];

  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isProfileComplete: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    profileFor: {
      type: String,
      required: true,
      enum: [
        "self",
        "son",
        "daughter",
        "brother",
        "sister",
        "friend",
        "relative",
      ],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
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
    },

    motherTongue: {
      type: String,
      default: "",
    },

    maritalStatus: {
      type: String,
      default: "",
    },

    education: {
      type: String,
      default: "",
    },

    college: {
      type: String,
      default: "",
    },

    profession: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "",
    },

    income: {
      type: String,
      default: "",
    },

    familyType: {
      type: String,
      default: "",
    },

    familyValues: {
      type: String,
      default: "",
    },

    fatherOccupation: {
      type: String,
      default: "",
    },

    motherOccupation: {
      type: String,
      default: "",
    },

    siblings: {
      type: String,
      default: "",
    },

    lifestyle: {
      type: String,
      default: "",
    },

    diet: {
      type: String,
      default: "",
    },

    smoking: {
      type: String,
      default: "",
    },

    drinking: {
      type: String,
      default: "",
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
    },

    partnerCity: {
      type: String,
      default: "",
    },

    partnerReligion: {
      type: String,
      default: "",
    },

    partnerEducation: {
      type: String,
      default: "",
    },

    partnerProfession: {
      type: String,
      default: "",
    },

    partnerMaritalStatus: {
      type: String,
      default: "",
    },

    partnerLifestyle: {
      type: String,
      default: "",
    },

    photos: {
      type: [String],
      default: [],
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

export default User;