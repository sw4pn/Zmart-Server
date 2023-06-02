import express from "express";

import {
  forgotPassword,
  loginUser,
  logout,
  resetPassword,
  verifyUser,
  toggleWishlist,
  getWishlist,
} from "../controllers/auth.controller.js";
import { onlyAuthorized } from "../middleware/authHandler.js";

const router = express.Router();

router.post("/login", loginUser);
// router.post("/send-mail", sendMail);
router.put("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
// router.get("/refreshToken", refreshToken);
// router.get("/verifyToken", verifyToken);
// router.get("/verifyUser", onlyAuthorized, verifyUser);
router.put("/wishlist", onlyAuthorized, toggleWishlist);
router.get("/wishlist", onlyAuthorized, getWishlist);
router.get("/verify-user", onlyAuthorized, verifyUser);
router.get("/logout", logout);

export default router;
