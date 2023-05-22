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

router.post("/", createCoupon);
router.put("/:id", onlyAuthorized, onlyAdmin, updateCoupon);
router.delete("/:id", onlyAuthorized, onlyAdmin, deleteCoupon);
// router.get("/validate", validateCoupon);
router.get("/:id", getCoupon);
router.get("/", getAllCoupons);

export default router;
