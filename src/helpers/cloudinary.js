const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFiletoCloudinary = async (image) => {
  try {
    const result = await cloudinary.uploader.upload(image.tempFilePath);
    return result.secure_url;
  } catch (err) {
    throw err;
  }
};

const removeFileToCloudinary = async (urlIcon) => {
  try {
    let url = urlIcon.split("/");
    await cloudinary.uploader.destroy(`${url[url.length - 1].slice(0, -4)}`);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  uploadFiletoCloudinary,
  removeFileToCloudinary,
};
