const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Function to create a PNG icon with text
function createIcon(size, backgroundColor, textColor, text) {
  const png = new PNG({
    width: size,
    height: size,
    bitDepth: 8,
    colorType: 2, // RGB
    inputColorType: 2,
    inputHasAlpha: false,
  });

  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) * 4;
      
      // Parse background color
      const r = parseInt(backgroundColor.slice(1, 3), 16);
      const g = parseInt(backgroundColor.slice(3, 5), 16);
      const b = parseInt(backgroundColor.slice(5, 7), 16);
      
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }

  // Draw a simple cross pattern (for religious context)
  const crossWidth = Math.floor(size * 0.1);
  const crossArmWidth = Math.floor(size * 0.08);
  const centerX = Math.floor(size / 2);
  const centerY = Math.floor(size / 2);
  
  // Parse text color
  const tr = parseInt(textColor.slice(1, 3), 16);
  const tg = parseInt(textColor.slice(3, 5), 16);
  const tb = parseInt(textColor.slice(5, 7), 16);
  
  // Draw vertical line of cross
  for (let y = Math.floor(size * 0.2); y < Math.floor(size * 0.8); y++) {
    for (let x = centerX - crossWidth; x <= centerX + crossWidth; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (size * y + x) * 4;
        png.data[idx] = tr;
        png.data[idx + 1] = tg;
        png.data[idx + 2] = tb;
      }
    }
  }
  
  // Draw horizontal line of cross
  for (let y = centerY - crossArmWidth; y <= centerY + crossArmWidth; y++) {
    for (let x = Math.floor(size * 0.3); x < Math.floor(size * 0.7); x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (size * y + x) * 4;
        png.data[idx] = tr;
        png.data[idx + 1] = tg;
        png.data[idx + 2] = tb;
      }
    }
  }

  return PNG.sync.write(png);
}

// Create icons
const iconsDir = path.join(__dirname, '..', 'public');

// Generate 192x192 icon
const icon192 = createIcon(192, '#4a6fa5', '#ffffff', '');
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), icon192);

// Generate 512x512 icon
const icon512 = createIcon(512, '#4a6fa5', '#ffffff', '');
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), icon512);

console.log('Icons generated successfully!');
console.log('Icon sizes: 192x192, 512x512');
console.log('Color: Blue (#4a6fa5) with white cross symbol');