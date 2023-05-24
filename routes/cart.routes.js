import express from "express";
import { onlyAuthorized } from "../middleware/authHandler.js";
import {
  addToCart,
  emptyCart,
  getCart,
  removeItem,
  updateCartItem,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/", onlyAuthorized, addToCart);
// router.post("/", authMiddleware, addToCart);
router.put("/:id", onlyAuthorized, updateCartItem);
router.delete("/:id", onlyAuthorized, removeItem);
router.delete("/", onlyAuthorized, emptyCart);
router.get("/", onlyAuthorized, getCart);
// router.get("/", getAllCoupons);

export default router;
