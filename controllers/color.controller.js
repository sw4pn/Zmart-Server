import expressAsyncHandler from "express-async-handler";
import Color from "../model/Color.js";
import sendResponse from "../utils/responseHandler.js";
import { createError } from "../middleware/errorHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";

export const createColor = expressAsyncHandler(async (req, res, next) => {
  const color = await Color.findOne({
    $or: [{ title: req.body.title }, { value: req.body.value }],
  })
    .lean()
    .exec();

  if (color) return next(createError(400, "Color already exists"));

  const newColor = await Color.create(req.body);

  if (newColor)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Color created successfully",
      newColor._doc
    );

  return next(createError(400, "Unknown error occurred."));
});

export const updateColor = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const color = await Color.findOne({
    $or: [{ title: req.body.title }, { value: req.body.value }],
  }).lean();

  if (color && color._id.toString() !== id)
    return next(createError(400, "Color already exists."));

  const updatedColor = await Color.findByIdAndUpdate(
    id,
    { $set: req.body },
    {
      new: true,
    }
  ).lean();

  if (updateColor)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Color updated successfully",
      updatedColor
    );

  return next(createError(400, "Unknown error."));
});

export const deleteColor = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;

  validateMongoId(id);

  const deletedColor = await Color.findByIdAndDelete(id).lean();

  if (deletedColor)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Color deleted successfully",
      deletedColor
    );

  return next(createError(400, "Unknown error"));
});

export const getColor = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const color = await Color.findById(id).lean();

  if (color) return sendResponse(req, res, 200, true, "success", color);

  return next(createError(400, "Color not found."));
});

export const getAllColors = expressAsyncHandler(async (req, res, next) => {
  const colors = await Color.find().lean();

  if (colors) return sendResponse(req, res, 200, true, "success", colors);

  return next(createError(400, "Unknown error."));
});
