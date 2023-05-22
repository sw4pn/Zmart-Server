import express from "express";
import {
  createColor,
  deleteColor,
  getAllColors,
  getColor,
  updateColor,
} from "../controllers/color.controller.js";

import { onlyAdmin, onlyAuthorized } from "../middleware/authHandler.js";

const router = express.Router();

router.post("/", onlyAuthorized, onlyAdmin, createColor);
router.put("/:id", onlyAuthorized, onlyAdmin, updateColor);
router.delete("/:id", onlyAuthorized, onlyAdmin, deleteColor);
router.get("/:id", getColor);
router.get("/", getAllColors);

export default router;
