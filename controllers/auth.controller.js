import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

import User from "../model/User.js";
import { createError } from "../middleware/errorHandler.js";
import generateRefreshToken from "../config/refreshToken.js";
import sendResponse from "../utils/responseHandler.js";

export const loginUser = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("password");

  if (!user) return next(createError(404, "User not found"));

  const checkPassword = await bcrypt.compare(password, user.password);
  console.log(checkPassword, user.password);

  if (user && checkPassword) {
    // --- generate refresh token
    const refreshToken = generateRefreshToken(user.id);

    // --- set refresh token
    const setRefreshToken = await User.findByIdAndUpdate(
      user.id,
      { refreshToken },
      { new: true }
    ).lean();

    // --- set cookie (refresh token)
    if (!setRefreshToken) {
      return next(createError(400, "Error while updating refresh token."));
    }

    // --- set cookie (refresh token)
    const setCookie = res.cookie("accessToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
      path: "/",
    });

    // --- get and return data
    if (!setCookie)
      return next(createError(400, "Error while setting refresh token."));

    const { password, isActive, role, ...userData } = setRefreshToken;

    return sendResponse(req, res, 200, true, "Login successful.", {
      ...userData,
      token: generateRefreshToken(user.id),
    });
  }

  return next(createError(400, "Wrong email or password."));
});

export const forgotPassword = expressAsyncHandler(() => {});

export const logout = expressAsyncHandler(async (req, res, next) => {
  const cookie = req.cookies;
  const refreshToken = cookie?.accessToken;
  if (!refreshToken)
    return next(createError(401, "User not logged in. (No refresh token)"));

  const user = await User.findOne({ refreshToken });

  const removedCookie = res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  if (!removedCookie)
    return next(
      createError(401, "User not available. Please clear your cookies.")
    );

  if (removedCookie && user)
    return sendResponse(req, res, 200, true, "User logged out successfully.");

  return next(createError(204, "Forbidden."));
});

// export const refreshToken = expressAsyncHandler(() => {});
export const resetPassword = expressAsyncHandler(() => {});
// export const verifyToken = expressAsyncHandler(() => {});
export const verifyUser = expressAsyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!user) return next(createError(401, "User verification failed."));

  const { isActive, ...userData } = user;

  return sendResponse(req, res, 200, true, "success", userData);
});

export const sendMail = expressAsyncHandler(async (req, res, next) => {
  return sendResponse(req, res, 200, true, "Message Sent successfully", {});
});
