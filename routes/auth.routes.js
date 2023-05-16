import express from "express";

import {
  forgotPassword,
  loginUser,
  logout,
  resetPassword,
} from "../controllers/auth.controller.js";
import { onlyAuthorized } from "../middleware/authHandler.js";

const router = express.Router();

router.post("/login", loginUser);
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
// router.get("/refreshToken", refreshToken);
// router.get("/verifyToken", verifyToken);
// router.get("/verifyUser", onlyAuthorized, verifyUser);
router.get("/logout", logout);

export default router;