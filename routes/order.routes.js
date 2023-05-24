import express from "express";
import { onlyAdmin, onlyAuthorized } from "../middleware/authHandler.js";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrder,
  getUserOrders,
  updateOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", onlyAuthorized, createOrder);
router.put("/:id", onlyAuthorized, updateOrder);
router.delete("/:id", onlyAuthorized, onlyAdmin, deleteOrder);
router.get("/user", onlyAuthorized, getUserOrders);
router.get("/:id", onlyAuthorized, getOrder);
router.get("/", onlyAuthorized, onlyAdmin, getAllOrders);

export default router;
