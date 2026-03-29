import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an image buffer to Cloudinary
 * @param buffer - Image buffer from Multer
 * @param folder - Cloudinary folder to store the image
 * @returns Promise with secure URL and public ID
 */
export const uploadImage = (buffer: Buffer, folder: string = 'products'): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Cloudinary upload failed with no result'));
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Error deleting image from Cloudinary:', err);
  }
};

export default cloudinary;
