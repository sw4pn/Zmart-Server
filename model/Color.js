import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema();

export default mongoose.model("Color", ColorSchema);
