import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import User from "../model/User.js";
import { createError } from "./errorHandler.js";

const getBearerToken = (req) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== undefined) {
    const bearer = bearerHeader.split(" ");

    return bearer[1];
  }

  return undefined;
};

export const onlyAuthorized = expressAsyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken || getBearerToken(req);

  if (!accessToken) {
    return next(createError(401, "Unauthorized! Please login again."));
  } else {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

    if (!decoded)
      return next(createError(401, "Token expired! Please login again."));

    const user = await User.findById(decoded?.id).lean();

    if (!user) {
      return next(createError(401, "Unauthorized!"));
    }

    req.user = user;
    next();
  }
});

export const onlyAdmin = expressAsyncHandler(async (req, res, next) => {
  const adminUser = req.user;

  if (adminUser.role !== "admin")
    return next(createError(401, "You are not Authorized!"));

  next();
});
