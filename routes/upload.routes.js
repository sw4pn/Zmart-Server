import express from "express";
import { onlyAdmin, onlyAuthorized } from "../middleware/authHandler.js";
import {
  uploadAvatar,
  uploadProductImage,
  uploadImages,
  deleteImage,
} from "../controllers/upload.controller.js";
import { uploadImage } from "../middleware/uploadHandler.js";

const router = express.Router();

router.post(
  "/avatar",
  onlyAuthorized,
  uploadImage.single("images"),
  uploadAvatar
);

router.post(
  "/product-image",
  onlyAuthorized,
  onlyAdmin,
  uploadImage.single("images"),
  uploadProductImage
);

router.post(
  "/product-images",
  onlyAuthorized,
  onlyAdmin,
  uploadImage.array("images", 10),
  uploadImages
);

router.put("/delete", onlyAuthorized, deleteImage);

export default router;
