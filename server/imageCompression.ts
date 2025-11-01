/**
 * Módulo de compressão de imagens para planos Basic
 * Reduz resolução e qualidade para HD (1920x1080) mantendo proporção
 */

import sharp from 'sharp';

/**
 * Comprime uma imagem para qualidade HD (1920x1080)
 * @param imageBuffer - Buffer da imagem original
 * @param format - Formato de saída (jpg, png, webp, avif)
 * @returns Buffer da imagem comprimida
 */
export async function compressImageToHD(
  imageBuffer: Buffer,
  format: 'jpg' | 'png' | 'webp' | 'avif' = 'jpg'
): Promise<Buffer> {
  try {
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;

    // Obter metadados da imagem
    const metadata = await sharp(imageBuffer).metadata();
    const { width = 0, height = 0 } = metadata;

    console.log(`[ImageCompression] Original size: ${width}x${height}`);

    // Se a imagem já é menor que HD, não comprimir
    if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
      console.log(`[ImageCompression] Image already HD or smaller, skipping compression`);
      return imageBuffer;
    }

    // Calcular nova dimensão mantendo proporção
    let newWidth = width;
    let newHeight = height;

    if (width > MAX_WIDTH) {
      newWidth = MAX_WIDTH;
      newHeight = Math.round((height * MAX_WIDTH) / width);
    }

    if (newHeight > MAX_HEIGHT) {
      newHeight = MAX_HEIGHT;
      newWidth = Math.round((width * MAX_HEIGHT) / height);
    }

    console.log(`[ImageCompression] Compressing to: ${newWidth}x${newHeight}`);

    // Comprimir imagem
    let pipeline = sharp(imageBuffer).resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    // Aplicar compressão baseada no formato
    switch (format) {
      case 'jpg':
        pipeline = pipeline.jpeg({ quality: 85, progressive: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality: 85, compressionLevel: 8 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: 85 });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality: 80 });
        break;
    }

    const compressedBuffer = await pipeline.toBuffer();
    
    const originalSize = imageBuffer.length;
    const compressedSize = compressedBuffer.length;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    console.log(`[ImageCompression] Size reduced by ${reduction}% (${originalSize} → ${compressedSize} bytes)`);

    return compressedBuffer;
  } catch (error) {
    console.error('[ImageCompression] Error compressing image:', error);
    // Em caso de erro, retornar imagem original
    return imageBuffer;
  }
}

/**
 * Baixa uma imagem de uma URL e retorna o buffer
 * @param url - URL da imagem
 * @returns Buffer da imagem
 */
export async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[ImageCompression] Error downloading image:', error);
    throw error;
  }
}

