import express from "express";
import { onlyAuthorized } from "../middleware/authHandler.js";
import {
  generateOrderId,
  // processPayment,
  // sendStripeApiKey,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-payment-intent");
router.get("/create/:id", onlyAuthorized, generateOrderId);
// router.route("/payment/process").post(onlyAuthorized, processPayment);
// router.route("/stripe-key").get(onlyAuthorized, sendStripeApiKey);

// router.post("/checkout", onlyAuthorized, checkout);
// router.post("/verification", onlyAuthorized, paymentVerification);
router.post("/verification", onlyAuthorized, verifyPayment);

export default router;
