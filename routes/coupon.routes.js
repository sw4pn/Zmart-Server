import express from "express";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getAllCoupons,
  getCoupon,
} from "../controllers/coupon.controller.js";
import { onlyAdmin, onlyAuthorized } from "../middleware/authHandler.js";

const router = express.Router();

router.post("/", onlyAuthorized, onlyAdmin, createCoupon);
router.put("/:id", onlyAuthorized, onlyAdmin, updateCoupon);
router.delete("/:id", onlyAuthorized, onlyAdmin, deleteCoupon);
router.get("/validate/:code", onlyAuthorized, validateCoupon);
router.get("/:id", getCoupon);
router.get("/", getAllCoupons);

export default router;
