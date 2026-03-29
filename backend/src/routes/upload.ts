import { Router, Response } from 'express';
import multer from 'multer';
import { uploadImage } from '../services/cloudinary';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// POST /api/upload — Admin only, upload image to Cloudinary
router.post('/', protect, adminOnly, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const { url, public_id } = await uploadImage(req.file.buffer);
    res.json({ url, public_id });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: String(err) });
  }
});

export default router;
