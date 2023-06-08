import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

import User from "../model/User.js";
import { createError } from "../middleware/errorHandler.js";
import generateRefreshToken from "../config/refreshToken.js";
import sendResponse from "../utils/responseHandler.js";
import { sendEmail } from "../utils/emailHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";

export const loginUser = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("password");

  if (!user) return next(createError(404, "User not found"));

  const checkPassword = await bcrypt.compare(password, user.password);

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
      domain: "zmart-ecom.netlify.com",
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

export const forgotPassword = expressAsyncHandler(async (req, res, next) => {
  const email = req.body.email;

  const user = await User.findOne({ email: email }).lean();

  if (!user)
    return next(createError(400, "No user exist with this email address."));

  const resetToken = await User.getResetPasswordToken();

  if (!resetToken) return next(createError(400, "Error updating token"));

  const htmlMessage = `<p>Hi, you have requested to reset your password, if this is not you, ignore this message.</p>
<p>

Please follow the link to reset your password. 
The link is valid for 10 minutes from now. <a href="http://localhost:5173/reset-password/${resetToken}">Click Here</a>
</p>
`;

  const data = {
    to: email,
    subject: "Forgot password | zmart",
    html: htmlMessage,
    text: `Hey ${user.firstName} ${user.lastName}`,
  };

  if (sendEmail(data))
    return sendResponse(req, res, 200, true, "Email sent successfully.");

  return next(createError(400, "Error sending email."));
});

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
  if (!removedCookie) {
    const setCookie = res.cookie("accessToken", refreshToken, {
      httpOnly: true,
      maxAge: 1,
      sameSite: "None",
      secure: true,
      path: "/",
    });

    if (setCookie)
      return sendResponse(req, res, 200, true, "User logged out successfully.");

    return next(
      createError(401, "User not available. Please clear your cookies.")
    );
  }

  if (removedCookie && user)
    return sendResponse(req, res, 200, true, "Logged out successfully.");

  return next(createError(204, "Forbidden."));
});

// export const refreshToken = expressAsyncHandler(() => {});
export const resetPassword = expressAsyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(createError(400, "Token expired, Please try again."));

  user.password = hashedToken;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  const saveUser = await user.save();

  if (saveUser) return sendResponse(req, res, 200, true, "success", user);

  return next(createError(400, "Error updating password, please try again."));
});

// export const verifyToken = expressAsyncHandler(() => {});
export const verifyUser = expressAsyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!user) return next(createError(401, "User verification failed."));

  const { isActive, ...userData } = user;

  return sendResponse(req, res, 200, true, "success", userData);
});

export const getWishlist = expressAsyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = req.user;

  const wishlist = user?.wishlist;

  if (wishlist) return sendResponse(req, res, 200, true, "success", wishlist);

  return next(createError(400, "unknown error."));
});

export const toggleWishlist = expressAsyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const { productId } = req.body;
  validateMongoId(productId);

  const user = req.user;

  const alreadyAdded = user.wishlist.find(
    (item) => item._id.toString() === productId
  );

  if (alreadyAdded) {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $pull: {
          wishlist: productId,
        },
      },
      { new: true }
    ).lean();

    if (updatedUser)
      return sendResponse(
        req,
        res,
        200,
        true,
        "Product removed from wishlist.",
        updatedUser
      );
  } else {
    const addedUser = await User.findByIdAndUpdate(
      id,
      {
        $push: { wishlist: productId },
      },
      { new: true }
    ).lean();

    if (addedUser)
      return sendResponse(
        req,
        res,
        200,
        true,
        "Product added to wishlist.",
        addedUser
      );
  }

  return next(createError(400, "Unknown error occurred."));
});
