import jwt from "jsonwebtoken";

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "3d" });
};

export default generateRefreshToken;
