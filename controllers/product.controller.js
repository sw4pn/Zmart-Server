import expressAsyncHandler from "express-async-handler";
import Category from "../model/Category.js";
import Brand from "../model/Brand.js";
import Color from "../model/Color.js";
import sendResponse from "../utils/responseHandler.js";
import { createError } from "../middleware/errorHandler.js";
import Product from "../model/Product.js";
import User from "../model/User.js";
import slugify from "slugify";
import { validateMongoId } from "../utils/validateMongoId.js";

export const createProduct = expressAsyncHandler(async (req, res, next) => {
  const { title, description, brand, category, quantity, price, color } =
    req.body;

  // Payload validation
  if (
    !title ||
    !description ||
    !brand ||
    !category ||
    !quantity ||
    !price ||
    !color
  ) {
    return next(createError(400, "Missing required fields in the payload."));
  }

  if (req.body.title) {
    req.body.slug = slugify(req.body.title, {
      lower: true,
      locale: "en",
    });
  }

  req.body.category = await Category.findOne({
    title: req.body.category,
  }).select("id");
  req.body.brand = await Brand.findOne({ title: req.body.brand }).select("id");

  if (req.body.color) {
    const arr = [];
    for (const color of req.body.color) {
      const col = await Color.findOne({ title: color }).lean();
      arr.push(col._id);
    }
    req.body.color = arr;
  }

  const product = await Product.findOne({
    title: req.body.title,
    slug: req.body.slug,
    price: req.body.price,
    category: req.body.category,
    brand: req.body.brand,
  }).lean();

  if (product) return next(createError(400, "Same Product already exists."));

  // const newProductObj = new Product(req.body);
  // const newProduct = await newProductObj.save();
  const newProduct = await Product.create(req.body);

  if (newProduct)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Product added successfully.",
      newProduct._doc
    );

  return next(createError(401, "Unknown Error."));
});

export const updateProduct = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (req.body.category) {
    req.body.category = await Category.findOne({
      title: req.body.category,
    });
  }

  if (req.body.brand) {
    req.body.brand = await Brand.findOne({ title: req.body.brand });
  }

  if (req.body.color) {
    const arr = [];
    for (const color of req.body.color) {
      const col = await Color.findOne({ title: color }).select("id");
      arr.push(col);
    }
    req.body.color = arr;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      $set: req.body,
    },
    { new: true, lean: true }
  );

  if (updatedProduct)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Product updated successfully",
      updatedProduct
    );

  return next(createError(400, "Unknown error."));
});

export const deleteProduct = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const deletedProduct = await Product.findByIdAndDelete(id).lean();
  if (deletedProduct)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Product deleted successfully.",
      deletedProduct
    );

  return next(createError(400, "Unknown Error Occurred."));
});

export const getProduct = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);
  const product = await Product.findById(id).populate("category").lean();

  if (product) return sendResponse(req, res, 200, true, "success", product);

  return next(createError(400, "Product Not Found."));
});

export const getProductBySlug = expressAsyncHandler(async (req, res, next) => {
  // const slug = req.params.slug;
  const slug = decodeURIComponent(req.params.slug).trim();

  const product = await Product.findOne({ slug: slug })
    .populate("category brand color")
    .populate({
      path: "reviews.postedBy",
      select: "_id firstName lastName email",
    })
    .lean();
  //.populate({ path: "reviews.postedBy", select: "name email" })

  if (product) return sendResponse(req, res, 200, true, "success", product);

  return next(createError(400, "Product Not Found."));
});

export const getAllProducts = expressAsyncHandler(async (req, res, next) => {
  const products = await Product.find().populate("color").lean();

  if (products) return sendResponse(req, res, 200, true, "success", products);

  return next(createError(400, "Unknown error."));
});

export const getQueryProducts = expressAsyncHandler(async (req, res, next) => {
  // const queryObj = { ...req.query };
});

export const getCategoryProducts = expressAsyncHandler(
  async (req, res, next) => {
    const slug = req.params.id;
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $match: {
          "category.slug": slug,
        },
      },
    ]);

    if (products) {
      if (products.length > 0) {
        return sendResponse(req, res, 200, true, "success", products);
      } else {
        return next(
          createError(400, "No products found for the specified category.")
        );
      }
    }

    return next(createError(400, "unknown error."));
  }
);

export const getBrandProducts = expressAsyncHandler(async (req, res, next) => {
  const slug = req.params.id;
  const products = await Product.aggregate([
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: "$brand",
    },
    {
      $match: {
        "brand.slug": slug,
      },
    },
  ]);

  if (products) {
    if (products.length > 0) {
      return sendResponse(req, res, 200, true, "success", products);
    } else {
      return next(
        createError(400, "No products found for the specified brand.")
      );
    }
  }

  return next(createError(400, "unknown error."));
});

export const getPopularProducts = expressAsyncHandler(
  async (req, res, next) => {
    // const products = await Product.find().sort("-sold, -rating").limit(8);
    const products = await Product.find()
      .populate("brand")
      .sort("-sold, -rating")
      .populate({ path: "category", select: "_id title slug" })
      .limit(6)
      .lean()
      .exec();

    if (products) return sendResponse(req, res, 200, true, "success", products);

    return next(createError(400, "Error getting popular products"));
  }
);

export const getFeaturedProducts = expressAsyncHandler(
  async (req, res, next) => {
    const products = await Product.find()
      .populate("brand")
      .sort("-sold, -rating")
      .limit(8)
      .lean()
      .exec();

    if (products) return sendResponse(req, res, 200, true, "success", products);

    return next(createError(400, "Error getting featured products"));
  }
);

export const getSpecialDeals = expressAsyncHandler(async (req, res, next) => {
  const products = await Product.find()
    .populate("brand")
    .sort("-discount ,-rating")
    .limit(8)
    .lean()
    .exec();

  if (products) return sendResponse(req, res, 200, true, "success", products);

  return next(createError(400, "Error getting special deal products"));
});

export const addReview = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (req.body) {
    const review = {
      star: req.body.star,
      review: req.body.review,
      postedBy: req.body.postedBy,
      date: req.body.date,
    };

    const product = await Product.findById(id);

    if (!product) {
      return next(createError(404, "Product not found"));
    }

    // Check if the user has already posted a review
    const existingReview = product.reviews.find(
      (item) => item.postedBy.toString() === review.postedBy.toString()
    );

    if (existingReview) {
      return next(createError(400, "Review already posted by the you."));
    }

    product.reviews.push(review);

    // calculate the new rating
    const newRating =
      product.reviews.reduce((acc, cur) => acc + cur.star, 0) /
      product.reviews.length;
    product.rating = newRating.toFixed(2);

    const addedReview = await product.save();
    if (addedReview)
      return sendResponse(req, res, 200, true, "success", addedReview._doc);
  }

  return next(createError(400, "Unknown Error."));
});

export const editReview = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const reviewId = req.body.reviewId;

  const { star, review, postedBy, date } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    return next(createError(404, "Product not found"));
  }

  const reviewIndex = product.reviews.findIndex(
    (item) => item._id.toString() == reviewId.toString()
  );

  if (reviewIndex === -1) {
    return next(createError(404, "Review not found"));
  }

  const existingReview = product.reviews[reviewIndex];

  if (existingReview.postedBy.toString() !== postedBy.toString()) {
    return next(
      createError(401, "Unauthorized: Review can only be edited by the author")
    );
  }

  product.reviews[reviewIndex].star = star;
  product.reviews[reviewIndex].review = review;
  product.reviews[reviewIndex].date = date;

  const newRating =
    product.reviews.reduce((acc, cur) => acc + cur.star, 0) /
    product.reviews.length;
  product.rating = newRating.toFixed(2);

  const updatedProduct = await product.save();

  return sendResponse(
    req,
    res,
    200,
    true,
    "Review updated successfully",
    updatedProduct._doc
  );
});

export const deleteReview = expressAsyncHandler(async (req, res, next) => {
  const user = req.user;
  const id = req.params.id;
  const reviewId = req.body.reviewId;

  const product = await Product.findById(id);

  if (!product) {
    return next(createError(404, "Product not found"));
  }

  const reviewIndex = product.reviews.findIndex(
    (item) => item._id.toString() == reviewId.toString()
  );

  if (reviewIndex === -1) {
    return next(createError(404, "Review not found"));
  }

  const existingReview = product.reviews[reviewIndex];

  if (existingReview.postedBy._id?.toString() !== user._id?.toString()) {
    return next(
      createError(401, "Unauthorized: Review can only be deleted by the author")
    );
  }

  product.reviews.splice(reviewIndex, 1);

  const newRating =
    product.reviews.reduce((acc, cur) => acc + cur.star, 0) /
    product.reviews.length;
  product.rating = newRating.toFixed(2);

  const updatedProduct = await product.save();

  return sendResponse(
    req,
    res,
    200,
    true,
    "Review deleted successfully",
    updatedProduct._doc
  );
});

export const addToWishlist = expressAsyncHandler(async (req, res) => {
  const id = req.user._id;
  // const { productId } = req.body;
  const { productId } = req.body;

  const user = await User.findById(id).lean();

  const alreadyAdded = user.wishlist.find((id) => id.toString() === productId);

  if (alreadyAdded) {
    const user = await User.findByIdAndUpdate(
      id,
      { $pull: { wishlist: productId } },
      {
        new: true,
      }
    ).lean();

    // send user
    if (user)
      return sendResponse(
        req,
        res,
        200,
        true,
        "Product removed from wishlist.",
        user
      );

    return next(createError(400, "Error removing from wishlist, try again."));
  } else {
    const user = await User.findByIdAndUpdate(
      id,
      { $push: { wishlist: productId } },
      { new: true }
    ).lean();

    // send user
    if (user)
      return sendResponse(
        req,
        res,
        200,
        true,
        "Product added to wishlist.",
        user
      );

    return next(createError(400, "Error adding to wishlist, try again."));
  }
});

export const cleanProductSlug = expressAsyncHandler(async (req, res, next) => {
  const products = await Product.find();

  for (const product of products) {
    const slug = product.slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // product.slug = slug;
    // await product.save();
    await Product.updateOne({ _id: product._id }, { slug: slug });
  }

  return sendResponse(
    req,
    res,
    200,
    true,
    "Product slugs cleaned successfully."
  );
});

export const searchProducts = expressAsyncHandler(async (req, res, next) => {
  const query = req.params.query;

  const products = await Product.find(
    { title: { $regex: new RegExp(query), $options: "is" } },
    // { title: { $regex: new RegExp(query), $options: "is" }, isActive: true },
    { title: 1, slug: 1, thumbnail: 1, price: 1, discount: 1, _id: 0 }
  );

  if (products.length <= 0) {
    return next(createError(404, "No product found."));
  }
  if (products.length > 0)
    return sendResponse(req, res, 200, true, "success", { products });

  return next(
    createError(400, "Your request could not be processed. Please try again.")
  );
});
