import { z } from 'zod';

/**
 * ─────────────────────────────────────────────────────────────
 * ENUMS & CONSTANTS
 * ─────────────────────────────────────────────────────────────
 */

export const SCRAPER_ENGINES = ['aliexpress', 'ebay'] as const;
export type ScraperEngine = typeof SCRAPER_ENGINES[number];

export const PRODUCT_CATEGORIES = [
  'Laptops',
  'Phones',
  'Audio',
  'Tablets',
  'Wearables',
  'Monitors',
  'Accessories',
] as const;
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const COMPETITION_LEVELS = ['low', 'medium', 'high'] as const;
export type CompetitionLevel = typeof COMPETITION_LEVELS[number];

export const TREND_DIRECTIONS = ['rising', 'stable', 'declining'] as const;
export type TrendDirection = typeof TREND_DIRECTIONS[number];

/**
 * ─────────────────────────────────────────────────────────────
 * INTERFACES
 * ─────────────────────────────────────────────────────────────
 */

export interface ScrapedProduct {
  name: string;
  price: number;
  image: string;
  description: string;
  category: ProductCategory;
  supplierPrice: number;
  margin: number;
  demandScore: number;
  competitionLevel: CompetitionLevel;
  trend: TrendDirection;
  source: string;
  sourceUrl: string;
}

export interface CloudinaryImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export interface EnrichedScrapedProduct extends ScrapedProduct {
  cloudinaryImage?: CloudinaryImage;
}

export interface EngineCompareResult {
  engine: ScraperEngine;
  label: string;
  products: ScrapedProduct[];
  error?: string;
}

export interface ProfitCalculation {
  sellingPrice: number;
  supplierCost: number;
  shippingCost?: number;
  otherCosts?: number;
  netProfit: number;
  profitMargin: number; // percentage
  roi: number; // percentage
}

/**
 * ─────────────────────────────────────────────────────────────
 * ZOD SCHEMAS (Runtime Validation)
 * ─────────────────────────────────────────────────────────────
 */

// Scraper Query Parameters
export const ScraperSearchParamsSchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters').max(200),
  limit: z.coerce.number().int().min(1).max(24).default(12),
  engines: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.split(',').every((e) => SCRAPER_ENGINES.includes(e.trim() as ScraperEngine)),
      'Invalid engine names'
    ),
  cloudinary: z
    .preprocess(
      // Query strings are always strings; treat absent/true/1 as enabled
      (val) => val === undefined || val === true || val === 1 || val === 'true' || val === '1',
      z.boolean(),
    ),
});

export const ScraperCompareParamsSchema = z.object({
  q: z.string().min(2).max(200),
  limit: z.coerce.number().int().min(1).max(16).default(8),
});

export const MarketAnalysisParamsSchema = z.object({
  q: z.string().min(2).max(200),
  category: z.enum(PRODUCT_CATEGORIES).default('Accessories'),
});

export const SupplierFinderParamsSchema = z.object({
  q: z.string().min(2).max(200),
  category: z.enum(PRODUCT_CATEGORIES).default('Accessories'),
  count: z.coerce.number().int().min(1).max(10).default(6),
});

export const ListingOptimizerParamsSchema = z.object({
  name: z.string().min(1).max(500),
  category: z.enum(PRODUCT_CATEGORIES).default('Accessories'),
});

export const ProfitCalculatorBodySchema = z.object({
  sellingPrice: z.number().positive('Selling price must be positive'),
  supplierCost: z.number().positive('Supplier cost must be positive'),
  shippingCost: z.number().nonnegative().optional(),
  otherCosts: z.number().nonnegative().optional(),
});

export const ImportProductBodySchema = z.object({
  name: z.string().min(1).max(500),
  price: z.number().positive(),
  image: z.string().url().optional(),
  description: z.string().optional(),
  category: z.enum(PRODUCT_CATEGORIES),
  stock: z.number().nonnegative().default(0),
  sourceUrl: z.string().url().optional(),
  supplierPrice: z.number().positive().optional(),
  source: z.string().default('manual'),
});

export const CloudinaryImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
});

/**
 * ─────────────────────────────────────────────────────────────
 * TYPE EXPORTS (Generated from Zod Schemas)
 * ─────────────────────────────────────────────────────────────
 */

export type ScraperSearchParams = z.infer<typeof ScraperSearchParamsSchema>;
export type ScraperCompareParams = z.infer<typeof ScraperCompareParamsSchema>;
export type MarketAnalysisParams = z.infer<typeof MarketAnalysisParamsSchema>;
export type SupplierFinderParams = z.infer<typeof SupplierFinderParamsSchema>;
export type ListingOptimizerParams = z.infer<typeof ListingOptimizerParamsSchema>;
export type ProfitCalculatorBody = z.infer<typeof ProfitCalculatorBodySchema>;
export type ImportProductBody = z.infer<typeof ImportProductBodySchema>;
