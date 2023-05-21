import express from "express";

import { onlyAuthorized, onlyAdmin } from "../middleware/authHandler.js";

const router = express.Router();

router.post("/");
// router.post("/", authMiddleware, sellerMiddleware, createProduct);
// router.put("/wishlist", authMiddleware, addToWishlist);
// // router.put("/wishlist/:productId", authMiddleware, addToWishlist);
// router.put("/add-review/:id", authMiddleware, addReview);
// router.put("/:id", authMiddleware, sellerMiddleware, updateProduct);
// router.delete("/:id", authMiddleware, sellerMiddleware, deleteProduct);
// router.get("/popular", getPopularProduct);
// router.get("/featured", getFeaturedProduct);
// router.get("/special", getSpecialDeals);
// router.get("/clean-slug", cleanProductSlug);
// router.get("/slug/:slug", getProductBySlug);
// router.get("/category/:id", getCategoryProducts);
// router.get("/:id", getProduct);
// router.get("/query", getQueryProducts);
// router.get("/", getAllProducts);

export default router;
