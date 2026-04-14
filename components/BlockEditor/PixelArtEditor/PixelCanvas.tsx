"use client";

import { useState } from "react";

interface PixelCanvasProps {
  pixels: string[][];
  onChange: (pixels: string[][]) => void;
}

// 16-color palette based on design specs
const COLOR_PALETTE = [
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FF8800", // Orange
  "#8800FF", // Purple
  "#00FF88", // Mint
  "#FF0088", // Pink
  "#88FF00", // Lime
  "#0088FF", // Sky Blue
  "#888888", // Gray
  "#transparent", // Transparent (eraser)
];

export default function PixelCanvas({ pixels, onChange }: PixelCanvasProps) {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [isDrawing, setIsDrawing] = useState(false);

  const size = pixels.length;

  const setPixel = (row: number, col: number, color: string) => {
    const newPixels = pixels.map((r, rowIndex) =>
      rowIndex === row
        ? r.map((c, colIndex) => (colIndex === col ? color : c))
        : r
    );
    onChange(newPixels);
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    setPixel(row, col, selectedColor);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) {
      setPixel(row, col, selectedColor);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (confirm("Clear all pixel art?")) {
      const emptyGrid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => "transparent")
      );
      onChange(emptyGrid);
    }
  };

  const fillCanvas = () => {
    const filledGrid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => selectedColor)
    );
    onChange(filledGrid);
  };

  return (
    <div className="space-y-3">
      {/* Color Palette */}
      <div>
        <div className="text-xs text-gray-600 mb-2">Color Palette</div>
        <div className="grid grid-cols-8 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`
                w-8 h-8 rounded-md border-2 transition-all
                ${selectedColor === color ? "border-purple-600 scale-110 shadow-lg" : "border-gray-300 hover:scale-105"}
                ${color === "transparent" ? "bg-white" : ""}
              `}
              style={{
                backgroundColor: color === "transparent" ? "white" : color,
                backgroundImage: color === "transparent"
                  ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                  : undefined,
                backgroundSize: color === "transparent" ? "8px 8px" : undefined,
                backgroundPosition: color === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0px" : undefined,
              }}
              title={color === "transparent" ? "Eraser" : color}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Selected: {selectedColor === "transparent" ? "Eraser" : selectedColor}
        </div>
      </div>

      {/* Canvas Tools */}
      <div className="flex gap-2">
        <button
          onClick={clearCanvas}
          className="flex-1 px-3 py-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition"
        >
          Clear
        </button>
        <button
          onClick={fillCanvas}
          className="flex-1 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition"
        >
          Fill
        </button>
      </div>

      {/* Pixel Grid */}
      <div
        className="inline-block border-2 border-gray-400 rounded-lg overflow-hidden bg-white select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${size}, ${size === 8 ? '20px' : '12px'})`,
            gridTemplateRows: `repeat(${size}, ${size === 8 ? '20px' : '12px'})`,
          }}
        >
          {pixels.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="border border-gray-200 cursor-crosshair hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: color === "transparent" ? "white" : color,
                  imageRendering: "pixelated",
                }}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </div>

      <div className="text-xs text-gray-600">
        {size}×{size} pixel canvas • Click and drag to draw
      </div>
    </div>
  );
}
