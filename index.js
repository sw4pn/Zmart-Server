import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// import { fileURLToPath } from "url";
// import path, { dirname } from "path";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/connectDB.js";
import corsOptions from "./config/corsOptions.js";

import { default as authRouter } from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import brandRouter from "./routes/brand.routes.js";

dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

connectDB();
// TODO: Logger

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);

app.use(notFoundHandler);
app.use(errorHandler);

//unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log("*Error: " + err.message);
  console.log("Shutting down the server due to Unhandled Promise Rejection.");
  server.close(() => {
    process.exit(1);
  });
});

// unhandled exception
process.on("uncaughtException", (err) => {
  console.log("*Error: " + err.message);
  console.log("Shutting down the server due to Uncaught Exception");

  server.close(() => {
    process.exit(1);
  });
});

app.listen(PORT, () => {
  console.log("Server is listening on port: " + PORT);
});
