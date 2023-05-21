import Category from "../model/Category.js";
import { validateMongoId } from "../utils/validateMongoId.js";
import { createError } from "../middleware/errorHandler.js";
import slugify from "slugify";
import expressAsyncHandler from "express-async-handler";
import sendResponse from "../utils/responseHandler.js";

export const createCategory = expressAsyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ title: req.body.title })
    .lean()
    .exec();

  if (req.body.slug === "" || !req.body.slug) {
    req.body.slug = slugify(req.body.title, { lower: true });
  }

  if (category) return next(createError(400, "Category Already Exists."));

  const slug = await Category.findOne({ slug: req.body.slug });
  if (slug) return next(createError(400, "Slug already exists"));

  const newCategory = await Category.create(req.body);

  if (newCategory)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Category Added Successfully!",
      newCategory._doc
    );

  return next(createError(500, "Unknown Error."));
});

export const updateCategory = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const category = await Category.findOne({ title: req.body.title })
    .lean()
    .exec();
  if (req.body.slug === "") {
    req.body.slug = slugify(req.body.title, { lower: true });
  }

  if (category && category._id.toString() !== id.toString())
    return next(createError(400, "Category Already Exists."));

  const slug = await Category.findOne({ slug: req.body.slug });
  if (slug && slug._id.toString() !== id.toString())
    return next(createError(400, "Slug already exists"));

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true }
  ).lean();

  if (updatedCategory)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Category updated successfully!",
      updatedCategory
    );

  return next(createError(500, "Category not found."));
});

export const deleteCategory = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const deletedCategory = await Category.findByIdAndDelete(id).lean();

  if (deletedCategory)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Category deleted successfully.",
      deletedCategory
    );

  return next(createError(500, "Unknown Error."));
});

export const getCategory = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const category = await Category.findById(id).lean();

  if (category) return sendResponse(req, res, 200, true, "success", category);

  return next(createError(400, "Category not found."));
});

export const getAllCategories = expressAsyncHandler(async (req, res, next) => {
  const categories = await Category.find({ status: true }).lean().exec();

  if (categories)
    return sendResponse(req, res, 200, true, "success", categories);

  return next(createError(500, "Unknown Error."));
});

// export const getFeaturedCategories = asyncHandler(async (req, res, next) => {
//   // const categories = await Category.find({ status: true });

//   const categories = await Category.aggregate([
//     { $match: { status: true } },
//     {
//       $lookup: {
//         from: "products",
//         localField: "_id",
//         foreignField: "category",
//         as: "products",
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         title: "$title",
//         imageUrl: "$imageUrl",
//         slug: "$slug",
//         items: { $size: "$products" },
//       },
//     },
//   ]);

//   if (categories) sendResponse(req, res, 200, true, "success", categories);

//   next(createError(500, "Unknown Error."));
// });
