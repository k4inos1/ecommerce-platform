/**
 * @deprecated Use `../services/cloudinary` directly.
 * This re-export exists only for backward compatibility.
 * The canonical Cloudinary configuration lives in services/cloudinary.ts
 * which uses lazy initialization to avoid crashing the server on startup
 * when Cloudinary credentials are missing.
 */
export { default } from '../services/cloudinary';
