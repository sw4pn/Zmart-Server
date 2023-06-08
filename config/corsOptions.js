import dotenv from "dotenv";
dotenv.config();

const allowedOrigins = JSON.parse(process.env.ALLOWED_ORIGINS);

const corsOptions = {
  // origin: (origin, callback) => {
  //   if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error("Not allowed by CORS"));
  //   }
  // },
  origin: "https://zmart-ecom.netlify.app",
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
