import express from "express";
import {
  changePassword,
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updatePassword,
  updateUser,
  blockUser,
  unblockUser,
  getWishlist,
} from "../controllers/user.controller.js";
import { onlyAdmin, onlyAuthorized } from "../middleware/authHandler.js";

const router = express.Router();

router.post("/", createUser);
router.put("/update-password", onlyAuthorized, updatePassword);
router.put("/change-password", onlyAuthorized, changePassword);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id/unblock-user", onlyAuthorized, onlyAdmin, unblockUser);
router.get("/:id/block-user", onlyAuthorized, onlyAdmin, blockUser);
router.get("/wishlist", onlyAuthorized, getWishlist);
// router.get("/:id", authMiddleware, adminMiddleware, getUser);
router.get("/:id", getUser);
router.get("/", onlyAuthorized, onlyAdmin, getAllUsers);

export default router;
