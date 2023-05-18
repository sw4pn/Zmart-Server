import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please Enter First Name"],
      maxLength: [30, "Name cannot exceed 30 characters."],
      minLength: [3, "Name should have more than 3 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please Enter Last Name"],
      maxLength: [30, "Name cannot exceed 30 characters."],
      minLength: [3, "Name should have more than 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Please Enter EmailId"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please Enter Password"],
      minLength: [6, "Password should be greater than 5 characters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    cart: {
      products: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          count: { type: Number, default: 0 },
          color: { type: mongoose.Schema.Types.ObjectId, ref: "Color" },
          variant: { type: Array },
          price: { type: Number },
          finalPrice: { type: Number },
        },
      ],
      totalPrice: { type: Number },
      totalAfterDiscount: { type: Number },
    },
    address: {
      type: Object,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    orders: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    passwordChangedAt: { type: Date },
    passwordResetAt: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", userSchema);
