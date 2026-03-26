import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// ─── PUBLIC ─────────────────────────────────────────────────────────────────

// GET /api/products — only published products for the store
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const query: Record<string, unknown> = { published: true };

    if (search) query.$text = { $search: search as string };
    if (category && category !== 'All') query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET /api/products/:id — public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// ─── ADMIN ──────────────────────────────────────────────────────────────────

// GET /api/products/admin/all — ALL products (published + drafts) for admin panel
router.get('/admin/all', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, published, page = 1, limit = 20 } = req.query;
    const query: Record<string, unknown> = {};

    if (search) query.$text = { $search: search as string };
    if (category && category !== 'All') query.category = category;
    if (published !== undefined) query.published = published === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST /api/products — admin: create manually (published: true by default for manual)
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.create({ published: true, source: 'manual', ...req.body });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err });
  }
});

// PUT /api/products/:id — admin: full update
router.put('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err });
  }
});

// PATCH /api/products/:id/publish — toggle published state
router.patch('/:id/publish', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { published } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { published: Boolean(published) },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: `Product ${published ? 'published' : 'unpublished'}`, product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// DELETE /api/products/:id — admin
router.delete('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
