/**
 * Renders a 2D pixel array to a base64 DataURL
 * @param pixels - 2D array of color strings (hex colors, rgba, etc.)
 * @param size - Canvas size (24 or 32 pixels)
 * @returns Base64 DataURL string for use in CSS background-image
 */
export function renderPixelArtToDataURL(
  pixels: string[][],
  size: number
): string {
  // Create off-screen canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context from canvas");
  }

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, size, size);

  // Draw each pixel
  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      const color = pixels[y][x];

      // Skip transparent or empty pixels
      if (!color || color === "transparent" || color === "") {
        continue;
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Convert canvas to base64 DataURL
  return canvas.toDataURL("image/png");
}

/**
 * Creates an empty pixel grid initialized with transparent pixels
 * @param size - Grid size (8, 16, 24, or 32)
 * @returns 2D array filled with transparent pixels
 */
export function createEmptyPixelGrid(size: 8 | 16 | 24 | 32): string[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "transparent")
  );
}

/**
 * Validates a pixel grid structure
 * @param pixels - 2D pixel array to validate
 * @param expectedSize - Expected grid size
 * @returns true if valid, false otherwise
 */
export function isValidPixelGrid(
  pixels: string[][],
  expectedSize: number
): boolean {
  if (!Array.isArray(pixels) || pixels.length !== expectedSize) {
    return false;
  }

  return pixels.every(
    (row) => Array.isArray(row) && row.length === expectedSize
  );
}
