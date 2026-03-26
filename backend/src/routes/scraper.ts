import { Router, Response } from 'express';
import { scrapeAliExpress } from '../services/scraper';
import { calculateProfit } from '../utils/profitCalculator';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';

const router = Router();

/**
 * GET /api/scraper/search?q=laptops&limit=12
 * Search and return scraped/research products (admin only)
 */
router.get('/search', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = Math.min(Number(req.query.limit) || 12, 24);

    if (!query.trim()) return res.status(400).json({ message: 'Query is required' });

    const products = await scrapeAliExpress(query, limit);
    res.json({ products, count: products.length });
  } catch (err) {
    res.status(500).json({ message: 'Scraping failed', error: String(err) });
  }
});

/**
 * POST /api/scraper/calculate
 * Calculate profit margin and ROI for a product
 */
router.post('/calculate', protect, adminOnly, (req: AuthRequest, res: Response) => {
  try {
    const { sellingPrice, supplierCost, shippingCost, otherCosts } = req.body;
    if (!sellingPrice || !supplierCost) return res.status(400).json({ message: 'sellingPrice and supplierCost required' });
    const result = calculateProfit({ sellingPrice: Number(sellingPrice), supplierCost: Number(supplierCost), shippingCost: Number(shippingCost) || undefined, otherCosts: Number(otherCosts) || undefined });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Calculation failed', error: String(err) });
  }
});

/**
 * POST /api/scraper/import
 * Import a scraped product directly into MongoDB (admin only)
 */
router.post('/import', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, image, description, category, stock } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'name and price required' });

    const product = await Product.create({
      name, price: Number(price), image: image || '',
      description: description || '', category: category || 'Accessories',
      stock: Number(stock) || 10,
    });

    res.status(201).json({ message: 'Product imported successfully', product });
  } catch (err) {
    res.status(400).json({ message: 'Import failed', error: String(err) });
  }
});

export default router;
