import expressAsyncHandler from "express-async-handler";
import Category from "../model/Category.js";
import Brand from "../model/Brand.js";
import Color from "../model/Color.js";
import sendResponse from "../utils/responseHandler.js";
import { createError } from "../middleware/errorHandler";
import Product from "../model/Product.js";

export const createProduct = expressAsyncHandler(async (req, res, next) => {
  if (req.body.title) {
    req.body.slug = slugify(req.body.title, {
      lower: true,
      locale: "en",
    });
  }

  req.body.category = await Category.findOne({ title: req.body.category });
  req.body.brand = await Brand.findOne({ title: req.body.brand });
  req.body.color = await Color.findOne({ title: req.body.color });

  const product = await Product.findOne({
    title: title,
    slug: req.body.slug,
    price: price,
    category: req.body.category,
    brand: req.body.brand,
  }).lean();

  if (product) throw createError(400, "Same Product already exists.");

  return sendResponse(req, res, 200, true, "Ok", req.body);
  //   const newProduct = await Product.create(req.body);

  //   if (newProduct)
  //     return sendResponse(
  //       req,
  //       res,
  //       200,
  //       true,
  //       "Product added successfully.",
  //       newProduct._doc
  //     );

  return next(createError(401, "Unknown Error."));
});
