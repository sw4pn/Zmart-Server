import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import User from "../model/User.js";
import { createError } from "./errorHandler.js";

export const onlyAuthorized = expressAsyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return next(createError(401, "Unauthorized! Please login again."));
  } else {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded?.id).lean();

    if (!user) {
      return next(createError(401, "Unauthorized!"));
    }

    req.user = user;
    next();
  }
});

export const onlyAdmin = expressAsyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email: email });

  if (adminUser.role !== "admin")
    return next(createError(401, "You are not Authorized!"));

  next();
});
