import expressAsyncHandler from "express-async-handler";
import { createError } from "../middleware/errorHandler.js";
import bcrypt from "bcrypt";
import User from "../model/User.js";
import sendResponse from "../utils/responseHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";

export const createUser = expressAsyncHandler(async (req, res, next) => {
  const { email, firstName, lastName } = req.body;
  const userPassword = req.body?.password;

  console.log(email, firstName, lastName, userPassword);

  if (!email || !firstName || !lastName || !userPassword)
    return next(createError(400, "All fields are required."));

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(userPassword, salt);

  const user = await User.findOne({ email: email });

  if (user) return next(createError(400, "User with email already exists."));

  const newUser = await new User({
    firstName,
    lastName,
    email,
    password: hash,
  }).save();

  if (newUser) {
    const {
      password,
      passwordResetExpires,
      passwordChangedAt,
      passwordResetAt,
      passwordResetToken,
      ...userData
    } = newUser._doc;

    return sendResponse(
      req,
      res,
      200,
      true,
      "User successfully registered",
      userData
    );
  }

  return next(createError(400, "Unknown error occurred."));
});

export const getAllUsers = expressAsyncHandler(async (req, res, next) => {
  const users = await User.find();

  if (users) return sendResponse(req, res, 200, true, "success", users);

  return next(createError(400, "Unknown error occurred."));
});

export const getUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoId(id);

  const user = await User.findById(id).lean();

  if (user) return sendResponse(req, res, 200, true, "success", user);

  return next(createError(400, "User not found."));
});

export const updateUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoId(id);

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $set: req.body,
      // firstName: req.body.firstName,
      // lastName: req.body.lastName,
      // email: req.body.email,
      // address: req.body.address,
    },
    { new: true }
  ).lean();

  if (updatedUser)
    return sendResponse(
      req,
      res,
      200,
      true,
      "User updated successfully.",
      updatedUser
    );

  return next(createError(400, "Unknown error occurred."));
});

export const deleteUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoId(id);

  const deletedUser = await User.findByIdAndDelete(id).lean();

  if (deletedUser)
    return sendResponse(
      req,
      res,
      200,
      true,
      "User deleted successfully.",
      deletedUser
    );

  return next(createError(400, " Unknown error occurred."));
});

export const updatePassword = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { password } = req.body;
  // const { newPassword } = req.body;
  // const { confirmPassword } = req.body;

  const user = await User.findById(id);

  if (password && password !== null) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    user.password = hash;
    const updatedPassword = await User.save();

    if (!updatedPassword)
      return next(createError(400, "Error updating password"));

    return sendResponse(req, res, 200, true, "Password updated successfully.");
  }

  return next(createError(400, "No password provided"));
});

export const changePassword = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { password } = req.body;
  const { newPassword } = req.body;

  const user = await User.findById(id);
  const checkPassword = await bcrypt.compare(password, user.password);

  if (checkPassword) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    user.password = hash;

    const updatedPassword = await user.save();

    if (updatedPassword)
      return sendResponse(
        req,
        res,
        200,
        true,
        "Password updated successfully.",
        updatedPassword._doc
      );

    return next(createError(400, "Error updating password"));
  } else {
    return next(createError(400, "Your password is incorrect."));
  }

  return next(createError(400, "Unknown password."));
});

export const blockUser = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoId(id);

  const blockedUser = await User.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    { new: true }
  ).lean();

  if (blockedUser)
    return sendResponse(
      req,
      res,
      200,
      true,
      "User has been blocked",
      blockedUser
    );

  return next(createError(400, " Unknown error."));
});

export const unblockUser = expressAsyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const unblockedUser = await User.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  ).lean();

  if (unblockedUser)
    return sendResponse(
      req,
      res,
      200,
      true,
      "User has been Unblocked",
      unblockedUser
    );

  return next(createError(400, "Unknown error."));
});

export const getWishlist = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const findUser = await User.findById(id).lean().populate("wishlist");

  if (findUser)
    return sendResponse(req, res, 200, true, "success", findUser._doc.wishlist);

  return next(createError(400, "Unknown error."));
});
