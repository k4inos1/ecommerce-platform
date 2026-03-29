import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { scrapeByEngines, compareEngines, ScraperEngine } from '../services/scraper';
import { uploadImageUrl, isAllowedImageUrl } from '../services/cloudinary';
import { calculateProfit } from '../utils/profitCalculator';
import { analyzeMarket } from '../services/marketAnalysis';
import { findSuppliers } from '../services/supplierFinder';
import { optimizeListing } from '../services/listingOptimizer';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { ScrapedResult } from '../models/ScrapedResult';

const router = Router();

// Scraping routes hit external web services — limit to 10 req/min per IP to
// prevent accidental abuse and protect against compromised admin tokens.
const scraperLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes de scraping. Espera un momento e intenta de nuevo.' },
});

/**
 * Parse the `engines` query param into a validated ScraperEngine array.
 * Accepts comma-separated values, e.g. "aliexpress,ebay".
 * Falls back to both engines when the param is absent or invalid.
 */
const VALID_ENGINES: ScraperEngine[] = ['aliexpress', 'ebay'];
const DEFAULT_ENGINES: ScraperEngine[] = [...VALID_ENGINES];

function parseEngines(raw: string | undefined): ScraperEngine[] {
  if (!raw) return DEFAULT_ENGINES;
  const requested = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e): e is ScraperEngine => VALID_ENGINES.includes(e as ScraperEngine));
  return requested.length > 0 ? requested : DEFAULT_ENGINES;
}

/** GET /api/scraper/search?q=laptops&limit=12&engines=aliexpress,ebay */
router.get('/search', scraperLimiter, protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = Math.min(Number(req.query.limit) || 12, 24);
    const engines = parseEngines(req.query.engines as string | undefined);
    if (!query.trim()) return res.status(400).json({ message: 'Query is required' });
    const products = await scrapeByEngines(query, limit, engines);

    // Persist scraping results to MongoDB only when we have data (non-blocking)
    if (products.length > 0) {
      ScrapedResult.create({ query, source: products[0].source, products, count: products.length })
        .catch((e: Error) => console.warn('ScrapedResult save failed:', e.message));
    }

    res.json({ products, count: products.length, engines });
  } catch (err) {
    res.status(500).json({ message: 'Scraping failed', error: String(err) });
  }
});

/**
 * GET /api/scraper/compare?q=wireless headphones&limit=8
 * Scrapes all available engines concurrently and returns results grouped by
 * engine so the frontend can render a side-by-side price comparison.
 */
router.get('/compare', scraperLimiter, protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = Math.min(Number(req.query.limit) || 8, 16);
    if (!query.trim()) return res.status(400).json({ message: 'Query is required' });
    const results = await compareEngines(query, limit);
    res.json({ results, query });
  } catch (err) {
    res.status(500).json({ message: 'Comparison scraping failed', error: String(err) });
  }
});

/** GET /api/scraper/market?q=laptops&category=Laptops */
router.get('/market', scraperLimiter, protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const category = (req.query.category as string) || 'Accessories';
    if (!query.trim()) return res.status(400).json({ message: 'Query is required' });
    const analysis = await analyzeMarket(query, category);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: 'Market analysis failed', error: String(err) });
  }
});

/** GET /api/scraper/suppliers?q=wireless headphones&category=Audio */
router.get('/suppliers', scraperLimiter, protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const category = (req.query.category as string) || 'Accessories';
    const count = Math.min(Number(req.query.count) || 6, 10);
    if (!query.trim()) return res.status(400).json({ message: 'Query is required' });
    const suppliers = await findSuppliers(query, category, count);
    res.json({ suppliers, count: suppliers.length });
  } catch (err) {
    res.status(500).json({ message: 'Supplier scraping failed', error: String(err) });
  }
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

/** POST /api/scraper/import — saves product as draft, uploading image to Cloudinary if needed */
router.post('/import', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, image, description, category, stock, sourceUrl, supplierPrice, source } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'name and price required' });

    // Upload external image URL to Cloudinary so we own the asset.
    // Only upload from known, trusted hosts to prevent SSRF and quota abuse.
    let finalImage = image || '';
    let cloudinaryPublicId: string | undefined;
    if (image && isAllowedImageUrl(image)) {
      try {
        const uploaded = await uploadImageUrl(image, 'techstore/products');
        finalImage = uploaded.url;
        cloudinaryPublicId = uploaded.public_id;
        console.log(`☁️  Image uploaded to Cloudinary: ${finalImage}`);
      } catch (e) {
        console.warn('Cloudinary upload failed, using original URL:', (e as Error).message);
        finalImage = image;
      }
    }

    const product = await Product.create({
      name,
      price: Number(price),
      image: finalImage,
      ...(cloudinaryPublicId ? { cloudinaryPublicId } : {}),
      description: description || '',
      category: category || 'Accessories',
      stock: Number(stock) || 10,
      published: false,          // starts as draft — admin activates from panel
      source: source || 'import',
      sourceUrl: sourceUrl || '',
      supplierPrice: Number(supplierPrice) || 0,
    });
    res.status(201).json({ message: 'Product saved as draft. Activate it from the admin panel.', product });
  } catch (err) {
    res.status(400).json({ message: 'Import failed', error: String(err) });
  }
});

/** GET /api/scraper/history — returns past scraping sessions stored in MongoDB */
router.get('/history', scraperLimiter, protect, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const results = await ScrapedResult.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('query source count createdAt');
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: String(err) });
  }
});

export default router;
