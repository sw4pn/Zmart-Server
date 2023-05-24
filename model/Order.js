import mongoose from "mongoose";
import { Schema, ObjectId } from "mongoose";

const orderSchema = new Schema(
  {
    orderId: { type: String, unique: true, required: true },

    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      pinCode: {
        type: Number,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        color: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Color",
        },
        variant: {
          type: String,
        },
      },
    ],

    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderPrice: {
      type: Number,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    finalAmount: { type: Number, required: true },

    status: {
      type: String,
      required: true,
      default: "Processing",
    },

    coupon: {
      type: ObjectId,
      ref: "Coupon",
    },

    paymentInfo: {
      id: {
        type: String,
      },
      status: {
        type: String,
        required: true,
        default: "Not Paid",
      },
      payTime: {
        type: Date,
      },
      razorpay: {
        order: {
          id: String,
          entity: String,
          amount: Number,
          amount_paid: Number,
          amount_due: Number,
          currency: String,
          receipt: String,
          status: String,
          attempts: Number,
          notes: [],
          created_at: Number,
        },
        razOrderId: { type: String },
        razPaymentId: { type: String },
        verified: { type: Boolean },
      },
    },

    deliveryStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Cash on Delivery",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered",
        "Processing Return",
        "Return Complete",
        "Refund Complete",
      ],
    },
    orderTime: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
