import express from "express";
import { onlyAdmin, onlyAuthorized } from "../middleware/authHandler.js";
import {
  createBrand,
  updateBrand,
  getBrand,
  getAllBrands,
  deleteBrand,
} from "../controllers/brand.controller.js";

const router = express.Router();

router.post("/", onlyAuthorized, onlyAdmin, createBrand);
router.put("/:id", onlyAuthorized, onlyAdmin, updateBrand);
router.delete("/:id", onlyAuthorized, onlyAdmin, deleteBrand);
router.get("/:id", getBrand);
router.get("/", getAllBrands);

export default router;
