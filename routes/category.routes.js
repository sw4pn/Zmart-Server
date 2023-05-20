import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { onlyAuthorized, onlyAdmin } from "../middleware/authHandler.js";

const router = express.Router();

// router.post("/", onlyAuthorized, onlyAdmin, createCategory);
// router.put("/:id", onlyAuthorized, onlyAdmin, updateCategory);
// router.delete("/:id", onlyAuthorized, onlyAdmin, deleteCategory);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
// router.get("/featured", getFeaturedCategories);
router.get("/:id", getCategory);
router.get("/", getAllCategories);

export default router;
