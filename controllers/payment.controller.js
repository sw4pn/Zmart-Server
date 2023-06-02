import expressAsyncHandler from "express-async-handler";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../model/Order.js";
import { createError } from "../middleware/errorHandler.js";
import sendResponse from "../utils/responseHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";
import stripe from "stripe";

dotenv.config();
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const stripeInstance = stripe(SECRET_KEY);

const stripeClient = stripe(
  "sk_test_51MuQXrSFBOVV3nkPwK4bBwEkUH2UU6c9Fefci8Ofs9yGbSvM5Ehb8Qhn2W6jaKxtNJFYEd4zbDjP4O6gz7S5wmYf006uwykHhB"
);

// instantiate Razorpay
const instance = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

export const generateOrderId = expressAsyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  validateMongoId(orderId);

  const userId = req.user?._id;

  const order = await Order.findById(orderId).lean();

  if (!order) return next(createError(400, "Order not found."));

  const totalAmount = Math.ceil(order.finalAmount * 100);

  // order creation
  var options = {
    amount: totalAmount, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_",
    notes: {
      user: userId,
      orderId: orderId,
    },
  };

  instance.orders.create(options, async function (err, order) {
    console.log(err);
    if (err) return next(createError(400, "Order Creation failed." + err));

    const updateOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          "paymentInfo.razorpay": { order: order },
          "paymentInfo.status": "Payment Initiated",
        },
      },
      { new: true }
    );

    if (updateOrder) return sendResponse(req, res, 200, true, "success", order);

    return next(createError(400, "Payment Not initialized."));
  });
});

export const verifyPayment = expressAsyncHandler(async (req, res, next) => {
  const order_id = req.body.orderId;

  let body = req.body.razorpayOrderId + "|" + req.body.razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  console.log("sig received: " + req.body.razorpaySignature);
  console.log("sig generated: " + expectedSignature);

  const response = { signatureIsValid: false };

  if (expectedSignature === req.body.razorpaySignature) {
    response.signatureIsValid = true;

    const findOrder = await Order.findById(order_id);

    // order: {
    //   id: String,
    //   entity: String,
    //   amount: Number,
    //   amount_paid: Number,
    //   amount_due: Number,
    //   currency: String,
    //   receipt: String,
    //   status: String,
    //   attempts: Number,
    //   notes: [],
    //   created_at: Number,
    // },
    // razOrderId: { type: String },
    // razPaymentId: { type: String },
    // verified: { type: Boolean },
    if (findOrder) {
      findOrder.paymentInfo.status = "Paid";
      findOrder.paymentInfo.razorpay = {
        order: findOrder.paymentInfo.order,
        razOrderId: findOrder.paymentInfo.razOrderId,
        razPaymentId: findOrder.paymentInfo.razPaymentId,
        verified: true,
      };

      const updateOrder = await findOrder.save();
      return sendResponse(req, res, 200, true, "success", response);
    }
    // const updateOrder = await Order.findByIdAndUpdate(
    //   order_id,
    //   {
    //     $set: {
    //       "paymentInfo.status": "Paid",
    //       "paymentInfo.razorpay": {
    //         ...updateOrder.paymentInfo.razorpay,
    //         verified: true,
    //       },
    //     },
    //   },
    //   { new: true }
    // );
  }

  return sendResponse(req, res, 200, false, "error", response);
});

export const createPaymentIntent = expressAsyncHandler(
  async (req, res, next) => {
    const { items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  }
);
