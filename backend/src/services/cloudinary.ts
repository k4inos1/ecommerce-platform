import { v2 as cloudinary } from 'cloudinary';

// Lazy-initialise: configure only on the first actual usage so the server
// can start (and pass health-checks) even when Cloudinary env vars are absent.
let _configured = false;

function ensureConfigured(): void {
  if (_configured) return;
  _configured = true;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload an image buffer to Cloudinary.
 * @param buffer - Image buffer from Multer
 * @param folder - Cloudinary folder to store the image
 * @returns Promise with secure URL and public ID
 */
export const uploadImage = (
  buffer: Buffer,
  folder: string = 'techstore/products',
): Promise<{ url: string; public_id: string }> => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) {
            resolve({ url: result.secure_url, public_id: result.public_id });
          } else {
            reject(new Error('Cloudinary upload returned no results'));
          }
        },
      )
      .end(buffer);
  });
};

/**
 * Upload an external image URL to Cloudinary (re-host the asset).
 * Only call this with URLs already validated by the caller (SSRF prevention).
 * @param imageUrl  - Remote image URL
 * @param folder    - Cloudinary folder
 */
export const uploadImageUrl = async (
  imageUrl: string,
  folder: string = 'techstore/products',
): Promise<{ url: string; public_id: string }> => {
  ensureConfigured();
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder,
    resource_type: 'image',
    transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
  });
  return { url: result.secure_url, public_id: result.public_id };
};

/**
 * Delete an image from Cloudinary by its public ID.
 * @param publicId - Public ID returned when the image was uploaded
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  ensureConfigured();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary deleteImage error:', err);
  }
};

// Export the pre-configured client for routes that need it directly.
export default cloudinary;

// ─── SSRF Guard ──────────────────────────────────────────────────────────────
// Allowed image host patterns for Cloudinary uploads.
// Only these known, trusted CDN hosts may be re-hosted to prevent SSRF and
// quota abuse when uploading external product images.
const ALLOWED_IMAGE_HOSTS = [
  'ae01.alicdn.com', 'ae02.alicdn.com', 'ae03.alicdn.com', 'ae04.alicdn.com',
  'i.ebayimg.com',
  'images-na.ssl-images-amazon.com', 'm.media-amazon.com',
  'images.unsplash.com',
];

/**
 * Returns true only when the URL comes from a known, trusted image CDN.
 * Use this guard before calling uploadImageUrl() with an external URL.
 *
 * Exact hostname matching is used: the URL hostname must equal one of the
 * allowed hosts exactly (prevents "evil.ae01.alicdn.com.attacker.com" bypass).
 */
export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      ALLOWED_IMAGE_HOSTS.some((host) => parsed.hostname === host)
    );
  } catch {
    return false;
  }
}
