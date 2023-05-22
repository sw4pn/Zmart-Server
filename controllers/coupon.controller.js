import expressAsyncHandler from "express-async-handler";
import Coupon from "../model/Coupon.js";
import sendResponse from "../utils/responseHandler.js";
import { createError } from "../middleware/errorHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";

export const createCoupon = expressAsyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({ name: req.body.name }).lean();

  if (coupon) return next(createError(400, "Coupon already exists"));

  const newCoupon = await Coupon.create(req.body);

  if (newCoupon)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Coupon created successfully",
      newCoupon._doc
    );

  return next(createError(400, "Unknown error."));
});

export const updateCoupon = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const coupon = await Coupon.findOne({ name: req.body.name }).lean();

  if (coupon && coupon._id.toString() !== id.toString()) {
    return next(createError(400, "Coupon already exists"));
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true }
  ).lean();

  if (updatedCoupon)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Coupon updated successfully",
      updatedCoupon
    );

  return next(createError(400, "Unknown error."));
});

export const deleteCoupon = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const deletedCoupon = await Coupon.findByIdAndDelete(id).lean();

  if (deletedCoupon)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Coupon deleted successfully",
      deletedCoupon
    );

  return next(createError(400, "Unknown error."));
});

export const getCoupon = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const coupon = await Coupon.findById(id).lean();

  if (coupon) return sendResponse(req, res, 200, true, "success", coupon);

  return next(createError(400, "x Invalid Coupon Code."));
});

export const getAllCoupons = expressAsyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find().lean();

  if (coupons) return sendResponse(req, res, 200, true, "success", coupons);

  return next(createError(400, "Unknown error."));
});

export const validateCoupon = expressAsyncHandler(async (req, res, next) => {
  const couponCode = req.params.code;

  if (!couponCode || couponCode.trim() === "") {
    return next(createError(400, "Invalid Coupon Code."));
  }
  const coupon = await Coupon.findOne({ name: couponCode }).lean();

  if (coupon) return sendResponse(req, res, 200, true, "success", coupon);

  return next(createError(400, "x Invalid coupon code."));
});
