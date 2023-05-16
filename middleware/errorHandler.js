import sendResponse from "../utils/responseHandler.js";
import dotenv from "dotenv";

export const createError = (statusCode, errMessage) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.message = errMessage;

  return error;
};

export const notFoundHandler = (req, res, next) => {
  return next({
    success: false,
    status: 404,
    message: "Not Found.",
    stack: `No api request available at: ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  dotenv.config();

  const errStatusCode = err.status || 500;
  const errMessage = err.message || "Something went wrong!";

  let sampleError = "";
  if (err.name === "ValidationError") {
    sampleError = handleValidationError(err, res);
    err.status = sampleError.code;
    err.message = sampleError.message;
    err.fields = sampleError.fields;
  }

  if (err.code && err.code === 11000) {
    sampleError = handleDuplicateKeyError(err, res);
    err.status = sampleError.code;
    err.message = sampleError.message;
    err.fields = sampleError.fields;
  }

  const obj = {
    error: true,
    stack: process.env.NODE_ENV === "development" ? err.stack : "",
  };

  return sendResponse(req, res, errStatusCode, false, errMessage, obj);
};

// handle email or  username duplicates
const handleDuplicateKeyError = (err, res) => {
  const field = Object.keys(err.keyValue);
  const code = 409;
  const error = `An account with that ${field} already exists.`;

  // res.status(code).send({message: error, fields: field})
  return { code: code, message: error, fields: field };
};

// handle field formatting, empty fields, and mismatched passwords
const handleValidationError = (err, res) => {
  // let errors = Object.values(err.errors).map((el) => el.message);
  // let fields = Object.values(err.errors).map((el) => el.path);
  const errors = Object.entries(err.errors).map(
    ([key, { message, path }]) => message
  );
  const fields = Object.entries(err.errors).map(
    ([key, { message, path }]) => path
  );

  const code = 400;

  if (errors.length > 1) {
    const formattedErrors = errors.join("");
    //res.status(code).send({message: formattedErrors. fields: fields});
    // return { code: code, message: formattedErrors, fields: fields };
    return { code, message: formattedErrors, fields };
  } else {
    // res.status(code).send({ message: errors, fields: fields });
    // return { code: code, message: errors, fields: fields };
    return { code, message: errors, fields };
  }
};
