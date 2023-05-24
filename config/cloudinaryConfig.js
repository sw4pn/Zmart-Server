import cloudinary from "cloudinary";
import expressAsyncHandler from "express-async-handler";

// configuration

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploadImage = expressAsyncHandler(
  async (file, folder) => {
    const options = {
      folder: `zmart/${folder}`, // Set the desired folder path
      resource_type: "image",
      // upload_preset: preset,
    };
    return await cloudinary.v2.uploader
      .upload(file, options)
      .then((result) => ({
        url: result.secure_url,
        asset_id: result.asset_id,
        public_id: result.public_id,
      }))
      .catch((err) => console.log(err));
  }
);

export const cloudinaryDeleteImage = expressAsyncHandler(
  async (fileToDelete) => {
    return cloudinary.uploader
      .destroy(fileToDelete)
      .then((result) => result)
      .catch((err) => err);
  }
);
