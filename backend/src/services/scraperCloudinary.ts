import { uploadImageFromUrl } from './cloudinaryService';
import { ScrapedProduct, EnrichedScrapedProduct } from '../types/scraper';

const logger = {
  info: (message: string) => console.log(`[scraperCloudinary] ${message}`),
  warn: (message: string) => console.warn(`[scraperCloudinary] ${message}`),
  error: (message: string) => console.error(`[scraperCloudinary] ${message}`),
};

/**
 * Procesa un producto scraped: sube la imagen a Cloudinary y enriquece el producto
 * @param product Producto scraped original
 * @param folder Carpeta en Cloudinary
 * @returns Producto con metadata de Cloudinary añadida
 */
export const enrichProductWithCloudinary = async (
  product: ScrapedProduct,
  folder: string = `products/${product.source.toLowerCase()}`
): Promise<EnrichedScrapedProduct> => {
  const enriched: EnrichedScrapedProduct = { ...product };

  // Si no hay imagen, saltar upload
  if (!product.image) {
    logger.warn(`No image for product: ${product.name}`);
    return enriched;
  }

  try {
    logger.info(`Uploading image for: ${product.name}`);
    const uploadResult = await uploadImageFromUrl(product.image, folder);

    enriched.cloudinaryImage = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      width: uploadResult.width,
      height: uploadResult.height,
    };

    logger.info(`Image uploaded successfully: ${uploadResult.publicId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(
      `Failed to upload image for product "${product.name}": ${errorMessage}`
    );
    // Continuar sin fallar — el producto se guarda sin Cloudinary image
  }

  return enriched;
};

/**
 * Procesa múltiples productos: sube imágenes a Cloudinary en paralelo
 * @param products Array de productos scraped
 * @param folder Carpeta en Cloudinary
 * @returns Array de productos enriquecidos con metadata de Cloudinary
 */
export const enrichProductsWithCloudinary = async (
  products: ScrapedProduct[],
  folder: string = 'products/competitors'
): Promise<EnrichedScrapedProduct[]> => {
  logger.info(`Uploading ${products.length} product images to Cloudinary...`);

  try {
    // Procesar en paralelo pero controlar concurrencia (máximo 5 uploads simultáneos)
    const batchSize = 5;
    const enrichedProducts: EnrichedScrapedProduct[] = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const enrichedBatch = await Promise.all(
        batch.map((product) => enrichProductWithCloudinary(product, folder))
      );
      enrichedProducts.push(...enrichedBatch);
      logger.info(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)} completed`);
    }

    const successCount = enrichedProducts.filter((p) => p.cloudinaryImage).length;
    logger.info(
      `Image upload completed: ${successCount}/${enrichedProducts.length} successful`
    );

    return enrichedProducts;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to enrich products with Cloudinary: ${errorMessage}`);
    // Retornar productos sin enriquecer para no fallar completamente
    return products;
  }
};

/**
 * Obtiene la URL optimizada de una imagen de Cloudinary
 * Útil para mostrar imágenes en diferentes tamaños en el frontend
 * @param publicId ID público de Cloudinary
 * @param size 'thumbnail' (200px) | 'medium' (500px) | 'large' (1000px)
 * @returns URL optimizada
 */
export const getOptimizedProductImageUrl = (
  publicId: string,
  size: 'thumbnail' | 'medium' | 'large' = 'medium'
): string => {
  const sizes = {
    thumbnail: 200,
    medium: 500,
    large: 1000,
  };
  const width = sizes[size];

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/w_${width},q_auto,f_auto/${publicId}`;
};
