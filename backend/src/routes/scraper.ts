import { Router, Response } from 'express';
import { scrapeProducts } from '../services/scraper';
import { calculateProfit } from '../utils/profitCalculator';
import { analyzeMarket } from '../services/marketAnalysis';
import { findSuppliers } from '../services/supplierFinder';
import { optimizeListing } from '../services/listingOptimizer';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';

const router = Router();

/** GET /api/scraper/search?q=laptops&limit=12 */
router.get('/search', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = Math.min(Number(req.query.limit) || 12, 24);
    if (!query.trim()) return res.status(400).json({ message: 'Query is required' });
    const products = await scrapeProducts(query, limit);
    res.json({ products, count: products.length });
  } catch (err) {
    res.status(500).json({ message: 'Scraping failed', error: String(err) });
  }
});

/** GET /api/scraper/market?q=laptops&category=Laptops */
router.get('/market', protect, adminOnly, (req: AuthRequest, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || 'Accessories';
  if (!query.trim()) return res.status(400).json({ message: 'Query is required' });
  res.json(analyzeMarket(query, category));
});

/** GET /api/scraper/suppliers?q=wireless headphones&category=Audio */
router.get('/suppliers', protect, adminOnly, (req: AuthRequest, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || 'Accessories';
  const count = Math.min(Number(req.query.count) || 6, 10);
  if (!query.trim()) return res.status(400).json({ message: 'Query is required' });
  res.json({ suppliers: findSuppliers(query, category, count), count });
});

/** GET /api/scraper/optimize?name=Wireless Headphones&category=Audio */
router.get('/optimize', protect, adminOnly, (req: AuthRequest, res: Response) => {
  const name = (req.query.name as string) || '';
  const category = (req.query.category as string) || 'Accessories';
  if (!name.trim()) return res.status(400).json({ message: 'name is required' });
  res.json(optimizeListing(name, category));
});

/** POST /api/scraper/calculate */
router.post('/calculate', protect, adminOnly, (req: AuthRequest, res: Response) => {
  const { sellingPrice, supplierCost, shippingCost, otherCosts } = req.body;
  if (!sellingPrice || !supplierCost) return res.status(400).json({ message: 'sellingPrice and supplierCost required' });
  res.json(calculateProfit({ sellingPrice: Number(sellingPrice), supplierCost: Number(supplierCost), shippingCost: Number(shippingCost) || undefined, otherCosts: Number(otherCosts) || undefined }));
});

/** POST /api/scraper/import */
router.post('/import', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, image, description, category, stock } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'name and price required' });
    const product = await Product.create({ name, price: Number(price), image: image || '', description: description || '', category: category || 'Accessories', stock: Number(stock) || 10 });
    res.status(201).json({ message: 'Product imported successfully', product });
  } catch (err) {
    res.status(400).json({ message: 'Import failed', error: String(err) });
  }
});

export default router;
