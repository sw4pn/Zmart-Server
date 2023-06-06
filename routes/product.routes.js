import express from "express";

import { onlyAuthorized, onlyAdmin } from "../middleware/authHandler.js";
import {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  addReview,
  deleteProduct,
  getPopularProducts,
  getFeaturedProducts,
  getSpecialDeals,
  cleanProductSlug,
  getProductBySlug,
  getCategoryProducts,
  editReview,
  deleteReview,
  getBrandProducts,
  searchProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", onlyAuthorized, onlyAdmin, createProduct);
// router.put("/wishlist/:productId", onlyAuthorized, addToWishlist);
router.put("/add-review/:id", onlyAuthorized, addReview);
router.put("/edit-review/:id", onlyAuthorized, editReview);
router.put("/delete-review/:id", onlyAuthorized, deleteReview);
router.put("/:id", onlyAuthorized, onlyAdmin, updateProduct);
router.delete("/:id", onlyAuthorized, onlyAdmin, deleteProduct);
router.get("/popular", getPopularProducts);
router.get("/featured", getFeaturedProducts);
router.get("/special", getSpecialDeals);

router.get("/search/:query", searchProducts);

router.get("/clean-slug", cleanProductSlug);
router.get("/slug/:slug", getProductBySlug);
router.get("/category/:id", getCategoryProducts);
router.get("/brand/:id", getBrandProducts);
router.get("/:id", getProduct);
// router.get("/query", getQueryProducts);
router.get("/", getAllProducts);

export default router;
