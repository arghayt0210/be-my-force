// backend/utils/cloudinary.js
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Get folder path based on model and optional subfolder
 * @param {string} relatedModel - The model name (e.g., "User", "WorksAndAchievement")
 * @param {string} subfolder - Optional subfolder name
 * @returns {string} The complete folder path
 */
const getFolderPath = (relatedModel, subfolder = "") => {
  const baseFolder = relatedModel.toLowerCase();
  return subfolder ? `${baseFolder}/${subfolder}` : baseFolder;
};

/**
 * Upload single file to Cloudinary
 * @param {Object} options
 * @param {string|Object} options.file - File to upload (URL string or file object)
 * @param {string} options.relatedModel - Related model name
 * @param {string} options.subfolder - Optional subfolder name
 * @param {string} options.userId - User ID
 * @param {string} options.relatedId - Related model instance ID
 * @returns {Promise<Object>} Upload result with asset document
 */
const uploadSingleFile = async ({
  file,
  relatedModel,
  subfolder = "",
  userId,
  relatedId,
}) => {
  try {
    if (!file) return null;

    const folder = getFolderPath(relatedModel, subfolder);
    let uploadResult;

    // Handle URL string (e.g., Google profile image)
    if (typeof file === "string" && file.startsWith("http")) {
      uploadResult = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: "auto",
      });
    }
    // Handle file upload
    else if (file.path) {
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "auto",
      });
    } else {
      throw new Error("Invalid file format");
    }

    // Create asset document
    const Asset = require("../models/Asset");
    const asset = await Asset.create({
      user: userId,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      asset_type: uploadResult.resource_type,
      related_model: relatedModel,
      related_id: relatedId,
    });

    return {
      cloudinary: uploadResult,
      asset: asset,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Object} options
 * @param {Array} options.files - Array of files to upload
 * @param {string} options.relatedModel - Related model name
 * @param {string} options.subfolder - Optional subfolder name
 * @param {string} options.userId - User ID
 * @param {string} options.relatedId - Related model instance ID
 * @returns {Promise<Array>} Array of upload results with asset documents
 */
const uploadMultipleFiles = async ({
  files,
  relatedModel,
  subfolder = "",
  userId,
  relatedId,
}) => {
  try {
    if (!files || !Array.isArray(files)) return [];

    const uploadPromises = files.map((file) =>
      uploadSingleFile({
        file,
        relatedModel,
        subfolder,
        userId,
        relatedId,
      })
    );

    const results = await Promise.all(uploadPromises);
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error("Cloudinary multiple upload error:", error);
    return [];
  }
};

/**
 * Delete file from Cloudinary and remove asset document
 * @param {string} public_id - Cloudinary public ID
 * @returns {Promise<void>}
 */
const deleteFile = async (public_id) => {
  try {
    if (!public_id) return;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Delete asset document
    const Asset = require("../models/Asset");
    await Asset.findOneAndDelete({ public_id });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
};
