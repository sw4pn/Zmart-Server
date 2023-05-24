import expressAsyncHandler from "express-async-handler";
import User from "../model/User.js";
import sendResponse from "../utils/responseHandler.js";
import { createError } from "../middleware/errorHandler.js";
import { validateMongoId } from "../utils/validateMongoId.js";

export const addToCart = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId, quantity, color, variant, price, finalPrice } = req.body;

  const user = await User.findById(userId);

  if (user.cart.products && user.cart.products.length > 0) {
    // Check if the product is already in the cart
    const existingProductIndex = user.cart?.products?.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingProductIndex !== -1) {
      // If the product already exists, update its quantity
      user.cart.products[existingProductIndex].quantity += quantity;
    } else {
      const cartItem = {
        product: productId,
        quantity,
        color,
        variant,
        price,
        finalPrice,
      };
      user.cart.products.push(cartItem);
    }
  } else {
    user.cart = {
      products: [],
      totalPrice: 0,
      totalAfterDiscount: 0,
    };

    const cartItem = {
      product: productId,
      quantity,
      color,
      variant,
      price,
      finalPrice,
    };
    user.cart.products = [cartItem];
  }

  // Calculate the total price based on the updated cart items
  user.cart.totalPrice = user.cart.products.reduce(
    (total, item) => total + item.finalPrice * item.quantity,
    0
  );
  //   console.log(user.cart);

  const saveUser = await user.save();

  if (saveUser)
    return sendResponse(
      req,
      res,
      200,
      true,
      "Added to cart",
      saveUser._doc.cart
    );

  return next(createError(500, "Internal server error"));
});

export const updateCartItem = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const productId = req.params.id;

  const { quantity, color, variant, price, finalPrice } = req.body;

  const user = await User.findById(userId);

  // find product
  const cartItem = user.cart.products.find(
    (item) => item.product.toString() === productId
  );

  if (cartItem) {
    // update the product
    cartItem.color = color || cartItem.color;
    cartItem.variant = variant || cartItem.variant;
    cartItem.quantity = quantity || cartItem.quantity;
    cartItem.price = price || cartItem.price;
    cartItem.finalPrice = finalPrice || cartItem.finalPrice;

    // Calculate the total price based on the updated cart items
    user.cart.totalPrice = user.cart.products.reduce(
      (total, item) => total + item.finalPrice * item.quantity,
      0
    );

    // save the updated user
    const savedUser = await user.save();

    if (savedUser)
      return sendResponse(
        req,
        res,
        200,
        true,
        "Item updated successfully.",
        savedUser._doc.cart
      );

    return next(createError(400, "Error updating item."));
  }

  return next(createError(400, "Cart item not found."));
});

export const removeItem = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const productId = req.params.id;
  validateMongoId(productId);

  const user = await User.findById(userId);

  if (user.cart.products && user.cart.products.length > 0) {
    const index = user.cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index !== -1) {
      user.cart.products.splice(index, 1);
    } else {
      return next(createError(401, "Product not in the cart."));
    }

    // recalculate the total price
    user.cart.totalPrice = user.cart.products.reduce(
      (total, product) => total + product.finalPrice * product.quantity,
      0
    );

    const deletedCart = await user.save();

    if (deletedCart)
      return sendResponse(
        req,
        res,
        200,
        true,
        "Item removed successfully",
        deletedCart._doc.cart
      );

    return next(createError(400, "Error updating cart."));
  }

  return next(createError(500, "Internal Server Error."));
});

export const emptyCart = expressAsyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await User.findById(id);

  user.cart = {
    products: [],
    totalPrice: 0,
    totalAfterDiscount: 0,
  };

  const saveUser = await user.save();

  if (saveUser)
    return sendResponse(req, res, 200, true, "success", user._doc.cart);

  return next(createError(400, "Unknown Error."));
});

export const getCart = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = req.user;
  const cart = user.cart;

  if (cart) return sendResponse(req, res, 200, true, "success", cart);

  return next(createError(400, "Error retrieving cart."));
});
