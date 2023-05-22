import { Schema, model } from "mongoose";

const couponSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  expire: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default model("Coupon", couponSchema);
