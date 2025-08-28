import { v2 as cloudinary } from 'cloudinary';

/**
 * Validate required Cloudinary environment variables.
 * Throws error if any are missing.
 */
function validateConfig() {
  const requiredVars = ['CLOUD_NAME', 'API_KEY', 'API_SECRET'];
  const missingVars = requiredVars.filter((v) => !process.env[v]);
  if (missingVars.length) {
    throw new Error(
      `Missing required Cloudinary environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Validate config at startup
validateConfig();

// Configure Cloudinary with env variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/**
 * Upload a file buffer or path to Cloudinary
 * @param {string|Buffer} file - Path or buffer to upload
 * @param {Object} options - Upload options, e.g. folder, public_id, transformations
 * @returns {Promise<Object>} - Cloudinary upload response
 */
async function uploadFile(file, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(file, options);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

export { cloudinary, uploadFile };
