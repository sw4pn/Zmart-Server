const expressAsyncHandler = require("express-async-handler");
import dotenv from "dotenv";
import Razorpay from "razorpay";
import Order from "../model/Order.js";
import { createError } from "../middleware/errorHandler.js";
import sendResponse from "../utils/responseHandler";
import { validateMongoId } from "../utils/validateMongoId.js";

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

  const totalAmount = order.finalAmount;

  // order creation
  var options = {
    amount: totalAmount, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
    notes: {
      user: userId,
      orderId: orderId,
    },
  };

  instance.orders.create(options, async function (err, order) {
    console.log(err);
    if (err) return next(createError(400, "Order Creaetion failed."));

    const updateOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { "paymentInfo.razorpay": { order: order } } },
      { new: true }
    );

    return sendResponse(req, res, 200, true, "success", order);
  });
});

export const verifyPayment = expressAsyncHandler(async (req, res, next) => {
  const order_id = req.body.order_id;

  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  console.log("sig received: " + req.body.response.razorpay_signature);
  console.log("sig generated: " + expectedSignature);

  const response = { signatureIsValid: "false" };

  if (expectedSignature === req.body.response.razorpay_signature) {
    response = { signatureIsValid: "true" };

    const updateOrder = await Order.findByIdAndUpdate(
      order_id,
      {
        $set: { status: "Paid", "paymentInfo.razorpay": { verified: true } },
      },
      { new: true }
    );

    return sendResponse(req, res, 200, true, "success", response);
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
