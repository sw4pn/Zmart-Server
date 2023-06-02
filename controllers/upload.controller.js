import expressAsyncHandler from "express-async-handler";
import {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} from "../config/cloudinaryConfig.js";
import sendResponse from "../utils/responseHandler.js";
import { createError } from "../middleware/errorHandler.js";
import fs from "fs";

export const uploadProductImage = expressAsyncHandler(
  async (req, res, next) => {
    const file = req.file;

    if (!file) return next(createError(400, "No file specified."));

    const uploader = (path, folder) => cloudinaryUploadImage(path, folder);

    const uploadFile = await uploader(file.path, "products");

    if (uploadFile) {
      return sendResponse(
        req,
        res,
        200,
        true,
        "Image uploaded successfully",
        uploadFile
      );
    }
    return next(createError(500, "Internal Server Error."));
  }
);

export const uploadAvatar = expressAsyncHandler(async (req, res, next) => {
  const file = req.file;

  if (!file) return next(createError(400, "No file specified."));

  const uploader = (path, folder) => cloudinaryUploadImage(path, folder);

  const uploadFile = await uploader(file.path, "avatar");

  if (uploadFile) {
    return sendResponse(
      req,
      res,
      200,
      true,
      "Image uploaded successfully",
      uploadFile
    );
  }
  return next(createError(500, "Internal Server Error."));
});

export const uploadImages = expressAsyncHandler(async (req, res, next) => {
  const files = req.files;
  const data = [];

  if (!files) return next(createError(400, "No files specified."));

  const uploader = (path, folder) => cloudinaryUploadImage(path, folder);

  for (const file of files) {
    const { path } = file;
    const fileData = await uploader(file.path, "images");

    if (fileData) {
      data.push(fileData);
      fs.unlinkSync(path);
    }
  }

  return sendResponse(req, res, 200, true, "Image uploaded successfully", data);

  return next(createError(500, "Internal Server Error."));
});

export const deleteImage = expressAsyncHandler(async (req, res, next) => {
  const id = req.body.id;

  const deleted = cloudinaryDeleteImage(id, "images");

  const message = `Image ${id} deleted successfully!`;

  return sendResponse(req, res, 200, true, message, deleted);
});
