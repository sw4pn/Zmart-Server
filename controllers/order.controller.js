import expressAsyncHandler from "express-async-handler";
import Order from "../model/Order.js";
import { validateMongoId } from "../utils/validateMongoId.js";
import sendResponse from "../utils/responseHandler.js";
import { createError } from "../middleware/errorHandler.js";
import Color from "../model/Color.js";
import Coupon from "../model/Coupon.js";
import { v4 as uuidv4 } from "uuid";
import User from "../model/User.js";

// Generate the order ID
function generateOrderId() {
  return Order.countDocuments().then((count) => {
    const numericId = count + 1;
    const orderStart = 100000 + numericId;
    const timestamp = Date.now();
    const orderId = `ORDER-${timestamp}-${orderStart}`;
    return orderId;
  });
}

export const createOrder = expressAsyncHandler(async (req, res, next) => {
  const { shippingInfo, orderItems, itemsPrice, orderedBy } = req.body;

  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const taxPrice = req.body.taxPrice
    ? (req.body.taxPrice * totalPrice) / 100
    : 0.18 * totalPrice;

  const shippingPrice = totalPrice > 499 ? 0 : 50;

  const totalAmount = totalPrice + taxPrice + shippingPrice;

  if (req.body.coupon) {
    const coupon = await Coupon.findOne({
      name: req.body.coupon.toUpperCase(),
      isActive: true,
    }).lean();

    // check date expiry  coupon.expire
    if (new Date(coupon.expire) > new Date()) {
      req.body.finalAmount = Math.ceil(
        (totalAmount * coupon.discount) / 100
      ).toFixed(2);
      req.body.coupon = coupon;
    } else {
      req.body.finalAmount = totalAmount;
    }
  } else {
    req.body.finalAmount = totalAmount;
  }

  const orderId = await generateOrderId();

  const order = await Order.create({
    orderId,
    shippingInfo,
    orderItems,
    orderedBy,
    orderPrice: totalPrice,
    taxPrice,
    shippingPrice,
    totalAmount,
    coupon: req.body.coupon,
    finalAmount: req.body.finalAmount,
  });

  if (order) {
    const cartUser = await User.findById(orderedBy);

    cartUser.cart = {
      products: [],
      totalPrice: 0,
      totalAfterDiscount: 0,
    };

    const saveUser = await cartUser.save();

    return sendResponse(
      req,
      res,
      200,
      true,
      "Order created successfully.",
      order._doc
    );
  }

  return next(createError(400, "Error processing order."));
});

export const getOrder = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const order = await Order.findById(id)
    .populate([
      {
        path: "orderItems.color",
        select: "_id value title",
      },
      {
        path: "orderItems.product",
        select: "_id thumbnail title",
      },
    ])
    .lean();

  if (order) return sendResponse(req, res, 200, true, "success", order);

  return next(createError(400, "Order not found."));
});

export const updateOrder = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, lean: true }
  );

  if (!updatedOrder) return next(createError(500, "Error updating order"));

  return sendResponse(
    req,
    res,
    200,
    true,
    "Order updated successfully.",
    updatedOrder
  );
});

export const deleteOrder = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);
  const deletedProduct = await Order.findByIdAndDelete(id).lean();

  if (deletedProduct)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Order deleted successfully.",
      deletedProduct
    );

  return next(createError(400, "Error deleting Order."));
});

export const getAllOrders = expressAsyncHandler(async (req, res, next) => {
  const orders = await Order.find().lean();

  if (orders) return sendResponse(req, res, 200, true, "success", orders);

  return next(createError(400, "Error getting all orders."));
});

export const getUserOrders = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const orders = await Order.find({ orderedBy: userId })
    .sort({ createdAt: -1 })
    .lean();

  if (orders) return sendResponse(req, res, 200, true, "success", orders);

  return next(createError(400, "Error getting all orders."));
});
