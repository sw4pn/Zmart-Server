import expressAsyncHandler from "express-async-handler";
import sendResponse from "../utils/responseHandler.js";
import Brand from "../model/Brand.js";
import slugify from "slugify";
import { createError } from "../middleware/errorHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";

export const createBrand = expressAsyncHandler(async (req, res, next) => {
  if (!req.body.sug || req.body.slug === "") {
    req.body.slug = slugify(req.body.title, { lower: true });
  }

  const brand = await Brand.findOne({
    $or: [{ title: req.body.title }, { slug: req.body.slug }],
  }).lean();

  if (brand) return next(createError(400, "Brand Already Exists."));

  console.log(req.body.slug);
  const newBrand = await Brand.create(req.body);

  if (newBrand)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Brand added successfully.",
      newBrand._doc
    );

  return next(createError(400, "Unknown error."));
});

export const updateBrand = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;

  validateMongoId(id);

  if (!req.body.slug || req.body.slug === "") {
    req.body.slug = slugify(req.body.title, { lower: true });
  }

  const brand = await Brand.findOne({
    $or: [{ title: req.body.title }, { slug: req.body.slug }],
  }).lean();

  console.log(brand._id.toString(), id.toString());

  if (brand && brand._id.toString() !== id.toString()) {
    return next(createError(400, "Brand already exists."));
  }

  const updatedBrand = await Brand.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true }
  ).lean();

  if (updateBrand)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Brand updated successfully.",
      updatedBrand
    );

  return next(createError(400, "Unknown Error."));
});

export const deleteBrand = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;

  validateMongoId(id);

  const deletedBrand = await Brand.findByIdAndDelete(id).lean();

  if (deletedBrand)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Brand deleted successfully.",
      deletedBrand
    );

  return next(createError(500, "Unknown Error."));
});

export const getBrand = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const brand = await Brand.findById(id).lean();

  if (brand) return sendResponse(req, res, 200, true, "success", brand);

  return next(createError(500, "Brand not found."));
});

export const getAllBrands = expressAsyncHandler(async (req, res, next) => {
  const brands = await Brand.find().lean();

  if (brands) return sendResponse(req, res, 200, true, "success", brands);

  return next(createError(500, "Unknown error."));
});
