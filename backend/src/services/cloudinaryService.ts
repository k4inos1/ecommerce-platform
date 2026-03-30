import cloudinary from '../config/cloudinary';
import fetch from 'node-fetch';
import type { Response } from 'node-fetch';
export { isAllowedImageUrl } from './cloudinary';

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Sube una imagen a Cloudinary desde una URL externa
 * @param imageUrl URL de la imagen (e.g., de AliExpress, eBay, Amazon)
 * @param folder Carpeta en Cloudinary (e.g., "products/competitors")
 * @returns Objeto con URL de Cloudinary, publicId y dimensiones
 */
export const uploadImageFromUrl = async (
  imageUrl: string,
  folder: string = 'products/competitors'
): Promise<UploadResult> => {
  try {
    // Validar que la URL sea válida
    if (!imageUrl || !imageUrl.startsWith('http')) {
      throw new Error('URL de imagen inválida');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
          tags: ['scraped-product'],
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload error: ${error.message}`));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
            });
          }
        }
      );

      // Descargar la imagen desde la URL y pasarla a Cloudinary
      fetch(imageUrl)
        .then((res: Response) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          res.body!.pipe(uploadStream);
        })
        .catch((error: Error) => {
          uploadStream.destroy();
          reject(new Error(`Image download failed: ${error.message}`));
        });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload image to Cloudinary: ${errorMessage}`);
  }
};

/**
 * Sube múltiples imágenes en paralelo
 * @param imageUrls Array de URLs de imágenes
 * @param folder Carpeta en Cloudinary
 * @returns Array con resultados de upload
 */
export const uploadMultipleImages = async (
  imageUrls: string[],
  folder: string = 'products/competitors'
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = imageUrls
      .filter((url) => url && url.startsWith('http'))
      .map((url) => uploadImageFromUrl(url, folder));

    return await Promise.allSettled(uploadPromises).then((results) => {
      return results
        .map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            console.warn(`Image upload failed at index ${index}:`, result.reason);
            return null;
          }
        })
        .filter((result) => result !== null) as UploadResult[];
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload multiple images: ${errorMessage}`);
  }
};

/**
 * Elimina una imagen de Cloudinary
 * @param publicId ID público de la imagen
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to delete image from Cloudinary: ${errorMessage}`);
  }
};

/**
 * Obtiene la URL optimizada de una imagen en Cloudinary
 * @param publicId ID público de la imagen
 * @param width Ancho (opcional)
 * @param height Alto (opcional)
 * @returns URL optimizada
 */
export const getOptimizedImageUrl = (
  publicId: string,
  width?: number,
  height?: number
): string => {
  let url = cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    width,
    height,
    crop: 'fit',
  });

  return url;
};
