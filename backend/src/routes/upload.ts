import { Router, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// POST /api/upload — Admin only, upload image to Cloudinary
router.post('/', protect, adminOnly, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'techstore/products', resource_type: 'image', transformation: [{ width: 800, crop: 'limit', quality: 'auto' }] },
        (err, result) => { if (err || !result) reject(err); else resolve(result); }
      ).end(req.file!.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err });
  }
});

export default router;
