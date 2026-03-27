import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { getChromiumExecutablePath } from '../utils/browser';

export interface ScrapedProduct {
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  supplierPrice: number;
  margin: number;
  demandScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
  trend: 'rising' | 'stable' | 'declining';
  source: string;
  sourceUrl: string;
}

function guessCategory(name: string): string {
  const t = name.toLowerCase();
  if (/(laptop|notebook|macbook|ideapad|thinkpad|chromebook|gaming pc)/i.test(t)) return 'Laptops';
  if (/(phone|iphone|samsung|xiaomi|pixel|smartphone|mobile)/i.test(t)) return 'Phones';
  if (/(headphone|earphone|airpod|earbud|speaker|headset|audio|sound)/i.test(t)) return 'Audio';
  if (/(tablet|ipad|surface|galaxy tab|drawing pad)/i.test(t)) return 'Tablets';
  if (/(watch|band|fitbit|garmin|wearable|smartwatch|fitness)/i.test(t)) return 'Wearables';
  if (/(monitor|display|screen|4k oled|curved screen)/i.test(t)) return 'Monitors';
  return 'Accessories';
}

function estimateMargin(category: string): number {
  return { Laptops: 18, Phones: 22, Audio: 45, Tablets: 25, Wearables: 40, Monitors: 30, Accessories: 55 }[category] ?? 35;
}

function estimateDemand(score: number): number { return Math.round(Math.max(1, Math.min(10, score))); }

/**
 * Strategy 1: Scrape AliExpress with headless Playwright browser
 */
async function scrapeAliExpressPlaywright(query: string, limit: number): Promise<ScrapedProduct[]> {
  const browser = await chromium.launch({ headless: true, executablePath: getChromiumExecutablePath(), args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();
  const products: ScrapedProduct[] = [];

  try {
    await page.goto(`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(query)}&SortType=best_match`, {
      waitUntil: 'domcontentloaded', timeout: 20000,
    });
    await page.waitForTimeout(3000);

    // Try to extract JSON from the search results embedded in HTML
    const content = await page.content();
    const $ = cheerio.load(content);

    $('[class*="product-card"], [class*="search-item"], [data-spm*="item"]').each((_, el) => {
      if (products.length >= limit) return false;
      const name = $(el).find('[class*="title"], [class*="name"]').first().text().trim();
      const priceEl = $(el).find('[class*="price"]').first().text();
      const priceNum = parseFloat(priceEl.replace(/[^0-9.]/g, ''));
      const img = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src') || '';
      const href = $(el).find('a[href*="aliexpress"]').first().attr('href') || $(el).find('a').first().attr('href') || '';

      if (!name || isNaN(priceNum) || priceNum <= 0) return;
      const category = guessCategory(name);
      products.push({
        name: name.slice(0, 120),
        price: Math.round(priceNum * 100) / 100,
        image: img.startsWith('//') ? `https:${img}` : img,
        description: `${name}. Encontrado en AliExpress.`,
        category,
        supplierPrice: Math.round(priceNum * 0.33 * 100) / 100,
        margin: estimateMargin(category),
        demandScore: estimateDemand(8 - products.length * 0.5),
        competitionLevel: priceNum < 30 ? 'high' : priceNum < 150 ? 'medium' : 'low',
        trend: 'stable',
        source: 'AliExpress',
        sourceUrl: href.startsWith('http') ? href : `https://www.aliexpress.com${href}`,
      });
    });
  } finally {
    await browser.close();
  }
  return products;
}

/**
 * Strategy 2: Scrape eBay with Playwright (more reliable, less anti-bot)
 */
async function scrapeEbayPlaywright(query: string, limit: number): Promise<ScrapedProduct[]> {
  const browser = await chromium.launch({ headless: true, executablePath: getChromiumExecutablePath(), args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const products: ScrapedProduct[] = [];

  try {
    await page.goto(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=12&LH_BIN=1`, {
      waitUntil: 'domcontentloaded', timeout: 20000,
    });
    await page.waitForTimeout(2000);

    const content = await page.content();
    const $ = cheerio.load(content);

    $('.s-item').each((_, el) => {
      if (products.length >= limit) return false;
      const name = $(el).find('.s-item__title').text().trim().replace('Shop on eBay', '').trim();
      const priceText = $(el).find('.s-item__price').first().text().trim();
      const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const img = $(el).find('.s-item__image-img').attr('src') || '';
      const href = $(el).find('a.s-item__link').attr('href') || '';
      const condition = $(el).find('.SECONDARY_INFO').text().trim();

      if (!name || name.length < 5 || isNaN(priceNum) || priceNum <= 0) return;
      const category = guessCategory(name);
      // eBay prices are closer to retail — estimate supplier at 35-50% of retail
      const supplierPrice = Math.round(priceNum * 0.38 * 100) / 100;

      products.push({
        name: name.slice(0, 120),
        price: Math.round(priceNum * 100) / 100,
        image: img,
        description: `${name}${condition ? ` — ${condition}` : ''}. Fuente: eBay.`,
        category,
        supplierPrice,
        margin: estimateMargin(category),
        demandScore: estimateDemand(7 - products.length * 0.4),
        competitionLevel: priceNum < 50 ? 'high' : priceNum < 200 ? 'medium' : 'low',
        trend: 'stable',
        source: 'eBay',
        sourceUrl: href,
      });
    });
  } finally {
    await browser.close();
  }
  return products;
}

/**
 * Strategy 3: Lightweight cheerio scrape of eBay (no browser, faster)
 */
async function scrapeEbayCheerio(query: string, limit: number): Promise<ScrapedProduct[]> {
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=12&LH_BIN=1`;
  const { data } = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  const $ = cheerio.load(data);
  const products: ScrapedProduct[] = [];

  $('.s-item').each((_, el) => {
    if (products.length >= limit) return false;
    const name = $(el).find('.s-item__title').text().trim().replace('Shop on eBay', '').trim();
    const priceText = $(el).find('.s-item__price').first().text().trim();
    const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    const img = $(el).find('.s-item__image-img').attr('src') || '';
    const href = $(el).find('a.s-item__link').attr('href') || '';

    if (!name || name.length < 5 || isNaN(priceNum) || priceNum <= 0) return;
    const category = guessCategory(name);

    products.push({
      name: name.slice(0, 120),
      price: Math.round(priceNum * 100) / 100,
      image: img,
      description: `${name}. Fuente: eBay Marketplace.`,
      category,
      supplierPrice: Math.round(priceNum * 0.38 * 100) / 100,
      margin: estimateMargin(category),
      demandScore: estimateDemand(7 - products.length * 0.3),
      competitionLevel: priceNum < 50 ? 'high' : priceNum < 200 ? 'medium' : 'low',
      trend: 'stable',
      source: 'eBay',
      sourceUrl: href,
    });
  });

  return products;
}

/**
 * Main export: tries sources in cascade order
 * 1. AliExpress via Playwright
 * 2. eBay via cheerio (fast, reliable)
 * 3. eBay via Playwright (JS-rendered)
 */
export async function scrapeProducts(query: string, limit = 12): Promise<ScrapedProduct[]> {
  console.log(`🔍 Scraping "${query}" — limit ${limit}`);

  // Try AliExpress with Playwright first
  try {
    console.log('  → Trying AliExpress (Playwright)...');
    const results = await scrapeAliExpressPlaywright(query, limit);
    if (results.length >= 3) {
      console.log(`  ✅ AliExpress: ${results.length} products found`);
      return results;
    }
    console.log(`  ⚠️ AliExpress: only ${results.length} results, trying eBay...`);
  } catch (e) {
    console.warn('  ❌ AliExpress Playwright failed:', (e as Error).message);
  }

  // Fallback 1: eBay via fast cheerio
  try {
    console.log('  → Trying eBay (cheerio)...');
    const results = await scrapeEbayCheerio(query, limit);
    if (results.length >= 3) {
      console.log(`  ✅ eBay cheerio: ${results.length} products found`);
      return results;
    }
  } catch (e) {
    console.warn('  ❌ eBay cheerio failed:', (e as Error).message);
  }

  // Fallback 2: eBay via Playwright
  try {
    console.log('  → Trying eBay (Playwright)...');
    const results = await scrapeEbayPlaywright(query, limit);
    if (results.length > 0) {
      console.log(`  ✅ eBay Playwright: ${results.length} products found`);
      return results;
    }
  } catch (e) {
    console.warn('  ❌ eBay Playwright failed:', (e as Error).message);
  }

  throw new Error('All scraping sources failed. Check network access or try a different query.');
}
