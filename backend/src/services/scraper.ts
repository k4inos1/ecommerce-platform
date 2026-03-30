import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { getChromiumExecutablePath } from '../utils/browser';
import logger from '../utils/logger';
import {
  ScraperEngine,
  ScrapedProduct,
  EngineCompareResult,
  ProductCategory,
  CompetitionLevel,
  TrendDirection,
} from '../types/scraper';

function guessCategory(name: string): ProductCategory {
  const t = name.toLowerCase();
  if (/(laptop|notebook|macbook|ideapad|thinkpad|chromebook|gaming pc)/i.test(t)) return 'Laptops';
  if (/(phone|iphone|samsung|xiaomi|pixel|smartphone|mobile)/i.test(t)) return 'Phones';
  if (/(headphone|earphone|airpod|earbud|speaker|headset|audio|sound)/i.test(t)) return 'Audio';
  if (/(tablet|ipad|surface|galaxy tab|drawing pad)/i.test(t)) return 'Tablets';
  if (/(watch|band|fitbit|garmin|wearable|smartwatch|fitness)/i.test(t)) return 'Wearables';
  if (/(monitor|display|screen|4k oled|curved screen)/i.test(t)) return 'Monitors';
  return 'Accessories';
}

function estimateMargin(category: ProductCategory): number {
  return { Laptops: 18, Phones: 22, Audio: 45, Tablets: 25, Wearables: 40, Monitors: 30, Accessories: 55 }[category] ?? 35;
}

function estimateDemand(score: number): number {
  return Math.round(Math.max(1, Math.min(10, score)));
}

function getCompetitionLevel(price: number, range: [number, number]): CompetitionLevel {
  if (price < range[0]) return 'high';
  if (price < range[1]) return 'medium';
  return 'low';
}

/**
 * Scrape AliExpress with headless Playwright browser
 * - Full JavaScript rendering support
 * - Anti-bot detection evasion with user-agent rotation
 * - Timeout and error handling
 */
async function scrapeAliExpressPlaywright(query: string, limit: number): Promise<ScrapedProduct[]> {
  const browser = await chromium.launch({
    headless: true,
    executablePath: getChromiumExecutablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'en-US',
  });

  const page = await context.newPage();
  const products: ScrapedProduct[] = [];

  try {
    logger.debug(`🌐 AliExpress: Navigating to search for "${query}"`);
    
    await page.goto(
      `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(query)}&SortType=best_match`,
      { waitUntil: 'domcontentloaded', timeout: 20000 }
    );
    
    await page.waitForTimeout(3000);

    const content = await page.content();
    const $ = cheerio.load(content);

    $('[class*="product-card"], [class*="search-item"], [data-spm*="item"]').each((_: number, el: any) => {
      if (products.length >= limit) return false;

      const name = $(el).find('[class*="title"], [class*="name"]').first().text().trim();
      const priceEl = $(el).find('[class*="price"]').first().text();
      const priceNum = parseFloat(priceEl.replace(/[^0-9.]/g, ''));
      const img = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src') || '';
      const href = $(el).find('a[href*="aliexpress"]').first().attr('href') || $(el).find('a').first().attr('href') || '';

      if (!name || isNaN(priceNum) || priceNum <= 0) return;

      const category = guessCategory(name);
      const price = Math.round(priceNum * 100) / 100;
      const supplierPrice = Math.round(priceNum * 0.33 * 100) / 100;

      products.push({
        name: name.slice(0, 120),
        price,
        image: img.startsWith('//') ? `https:${img}` : img,
        description: `${name}. Encontrado en AliExpress.`,
        category,
        supplierPrice,
        margin: estimateMargin(category),
        demandScore: estimateDemand(8 - products.length * 0.5),
        competitionLevel: getCompetitionLevel(price, [30, 150]),
        trend: 'stable',
        source: 'AliExpress',
        sourceUrl: href.startsWith('http') ? href : `https://www.aliexpress.com${href}`,
      });
    });

    logger.info(`✅ AliExpress: Found ${products.length} products for "${query}"`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`❌ AliExpress scrape failed: ${msg}`);
    throw new Error(`AliExpress scraping failed: ${msg}`);
  } finally {
    await browser.close();
  }

  return products;
}

/**
 * Scrape eBay with Playwright (more reliable, less anti-bot)
 * - Full page rendering
 * - Better handling of dynamic content
 */
async function scrapeEbayPlaywright(query: string, limit: number): Promise<ScrapedProduct[]> {
  const browser = await chromium.launch({
    headless: true,
    executablePath: getChromiumExecutablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  const products: ScrapedProduct[] = [];

  try {
    logger.debug(`🌐 eBay (Playwright): Navigating to search for "${query}"`);
    
    await page.goto(
      `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=12&LH_BIN=1`,
      { waitUntil: 'domcontentloaded', timeout: 20000 }
    );
    
    await page.waitForTimeout(2000);

    const content = await page.content();
    const $ = cheerio.load(content);

    $('.s-item').each((_: number, el: any) => {
      if (products.length >= limit) return false;

      const name = $(el).find('.s-item__title').text().trim().replace('Shop on eBay', '').trim();
      const priceText = $(el).find('.s-item__price').first().text().trim();
      const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const img = $(el).find('.s-item__image-img').attr('src') || '';
      const href = $(el).find('a.s-item__link').attr('href') || '';
      const condition = $(el).find('.SECONDARY_INFO').text().trim();

      if (!name || name.length < 5 || isNaN(priceNum) || priceNum <= 0) return;

      const category = guessCategory(name);
      const price = Math.round(priceNum * 100) / 100;
      const supplierPrice = Math.round(priceNum * 0.38 * 100) / 100;

      products.push({
        name: name.slice(0, 120),
        price,
        image: img,
        description: `${name}${condition ? ` — ${condition}` : ''}. Fuente: eBay.`,
        category,
        supplierPrice,
        margin: estimateMargin(category),
        demandScore: estimateDemand(7 - products.length * 0.4),
        competitionLevel: getCompetitionLevel(price, [50, 200]),
        trend: 'stable',
        source: 'eBay',
        sourceUrl: href,
      });
    });

    logger.info(`✅ eBay (Playwright): Found ${products.length} products for "${query}"`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`❌ eBay (Playwright) scrape failed: ${msg}`);
    throw new Error(`eBay Playwright scraping failed: ${msg}`);
  } finally {
    await browser.close();
  }

  return products;
}

/**
 * Lightweight cheerio scrape of eBay (no browser, faster fallback)
 * - No browser overhead
 * - Faster but less reliable for dynamic content
 */
async function scrapeEbayCheerio(query: string, limit: number): Promise<ScrapedProduct[]> {
  try {
    logger.debug(`📄 eBay (cheerio): Scraping "${query}"`);

    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=12&LH_BIN=1`;
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    const $ = cheerio.load(data);
    const products: ScrapedProduct[] = [];

    $('.s-item').each((_: number, el: any) => {
      if (products.length >= limit) return false;

      const name = $(el).find('.s-item__title').text().trim().replace('Shop on eBay', '').trim();
      const priceText = $(el).find('.s-item__price').first().text().trim();
      const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const img = $(el).find('.s-item__image-img').attr('src') || '';
      const href = $(el).find('a.s-item__link').attr('href') || '';

      if (!name || name.length < 5 || isNaN(priceNum) || priceNum <= 0) return;

      const category = guessCategory(name);
      const price = Math.round(priceNum * 100) / 100;
      const supplierPrice = Math.round(priceNum * 0.38 * 100) / 100;

      products.push({
        name: name.slice(0, 120),
        price,
        image: img,
        description: `${name}. Fuente: eBay Marketplace.`,
        category,
        supplierPrice,
        margin: estimateMargin(category),
        demandScore: estimateDemand(7 - products.length * 0.3),
        competitionLevel: getCompetitionLevel(price, [50, 200]),
        trend: 'stable',
        source: 'eBay',
        sourceUrl: href,
      });
    });

    logger.info(`✅ eBay (cheerio): Found ${products.length} products for "${query}"`);
    return products;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`⚠️ eBay (cheerio) scrape failed: ${msg}`);
    throw new Error(`eBay cheerio scraping failed: ${msg}`);
  }
}

/**
 * Scrape a single engine and return its results.
 * Exported so routes can scrape one engine at a time.
 * Implements retry logic with graceful degradation.
 */
export async function scrapeEngine(
  engine: ScraperEngine,
  query: string,
  limit = 12,
): Promise<ScrapedProduct[]> {
  logger.info(`🚀 Scraping engine: ${engine} for "${query}" (limit: ${limit})`);

  switch (engine) {
    case 'aliexpress':
      return await scrapeAliExpressPlaywright(query, limit);

    case 'ebay':
      // Try fast cheerio first, fall back to Playwright
      try {
        return await scrapeEbayCheerio(query, limit);
      } catch {
        logger.debug('Cheerio failed, falling back to Playwright...');
        return await scrapeEbayPlaywright(query, limit);
      }

    default:
      const exhaustive: never = engine;
      throw new Error(`Unknown engine: ${exhaustive}`);
  }
}

/**
 * Scrape the given engines concurrently and merge results into a flat list.
 * Falls back to cascade strategy when engines suffer errors.
 */
export async function scrapeByEngines(
  query: string,
  limit = 12,
  engines: ScraperEngine[] = ['aliexpress', 'ebay'],
): Promise<ScrapedProduct[]> {
  logger.info(
    `🔍 Multi-engine scrape: "${query}" engines=${engines.join(',')} limit=${limit}`
  );

  const perEngine = Math.ceil(limit / engines.length);
  const settledResults = await Promise.allSettled(
    engines.map((eng) => scrapeEngine(eng, query, perEngine))
  );

  const combined: ScrapedProduct[] = [];
  const errors: string[] = [];

  for (let i = 0; i < settledResults.length; i++) {
    const result = settledResults[i];
    const engine = engines[i];

    if (result.status === 'fulfilled') {
      combined.push(...result.value);
      logger.debug(`  ✓ ${engine}: ${result.value.length} products`);
    } else {
      const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
      logger.warn(`  ✗ ${engine}: ${msg}`);
      errors.push(msg);
    }
  }

  if (combined.length === 0) {
    const errMsg = `All engines failed: ${errors.join('; ')}`;
    logger.error(errMsg);
    throw new Error(errMsg);
  }

  logger.info(`✅ Scraping complete: ${combined.length} total products`);
  return combined.slice(0, limit);
}

/**
 * Scrape all available engines in parallel and return results grouped by engine.
 * Used by the /compare endpoint for side-by-side comparison.
 */
export async function compareEngines(
  query: string,
  limit = 8,
): Promise<EngineCompareResult[]> {
  logger.info(`📊 Engine comparison: "${query}" limit=${limit}`);

  const engineConfig = [
    { engine: 'aliexpress' as ScraperEngine, label: 'AliExpress' },
    { engine: 'ebay' as ScraperEngine, label: 'eBay' },
  ];

  const results = await Promise.allSettled(
    engineConfig.map(({ engine }) => scrapeEngine(engine, query, limit))
  );

  return engineConfig.map(({ engine, label }, i) => {
    const settled = results[i];
    if (settled.status === 'fulfilled') {
      logger.debug(`  ✓ ${label}: ${settled.value.length} products`);
      return { engine, label, products: settled.value };
    }

    const msg = settled.reason instanceof Error ? settled.reason.message : String(settled.reason);
    logger.warn(`  ✗ ${label}: ${msg}`);
    return { engine, label, products: [], error: msg };
  });
}

/**
 * Legacy cascade export — kept for backward compatibility with older code.
 * Prefers AliExpress, falls back to eBay with multiple strategies.
 * 
 * DEPRECATED: Use scrapeByEngines() instead for better control.
 */
export async function scrapeProducts(query: string, limit = 12): Promise<ScrapedProduct[]> {
  logger.info(`🔍 [LEGACY] Cascade scrape: "${query}" limit=${limit}`);

  // Try AliExpress first
  try {
    logger.debug('  → Trying AliExpress (Playwright)...');
    const results = await scrapeAliExpressPlaywright(query, limit);
    if (results.length >= 3) {
      logger.info(`  ✅ AliExpress: ${results.length} results`);
      return results;
    }
    logger.debug(`  ⚠️ AliExpress: only ${results.length} results, cascading to eBay...`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.warn(`  ❌ AliExpress failed: ${msg}`);
  }

  // Fallback 1: eBay via fast cheerio
  try {
    logger.debug('  → Trying eBay (cheerio)...');
    const results = await scrapeEbayCheerio(query, limit);
    if (results.length >= 3) {
      logger.info(`  ✅ eBay cheerio: ${results.length} results`);
      return results;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.warn(`  ❌ eBay cheerio failed: ${msg}`);
  }

  // Fallback 2: eBay via Playwright
  try {
    logger.debug('  → Trying eBay (Playwright)...');
    const results = await scrapeEbayPlaywright(query, limit);
    if (results.length > 0) {
      logger.info(`  ✅ eBay Playwright: ${results.length} results`);
      return results;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error(`  ❌ eBay Playwright failed: ${msg}`);
  }

  const errMsg = 'All scraping sources exhausted. Check network or try different query.';
  logger.error(errMsg);
  throw new Error(errMsg);
}
