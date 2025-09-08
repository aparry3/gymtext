#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/gymtext_logo.png');
const publicDir = path.join(__dirname, '../public');
const appDir = path.join(__dirname, '../src/app');

// Favicon sizes to generate
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' }
];

async function generateFavicons() {
  try {
    console.log('🚀 Starting favicon generation from gymtext_logo.png...');
    
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      throw new Error('Logo file not found at: ' + logoPath);
    }

    // Generate various sizes
    for (const { size, name } of faviconSizes) {
      const outputPath = path.join(publicDir, name);
      
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Generate ICO favicon for src/app
    const icoPath = path.join(appDir, 'favicon.ico');
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(icoPath.replace('.ico', '.png'));
    
    // Rename to .ico (Sharp doesn't directly support ICO, but browsers accept PNG with .ico extension)
    if (fs.existsSync(icoPath.replace('.ico', '.png'))) {
      fs.renameSync(icoPath.replace('.ico', '.png'), icoPath);
      console.log(`✅ Generated favicon.ico for Next.js app`);
    }

    // Generate web app manifest
    const manifest = {
      name: "GymText",
      short_name: "GymText", 
      description: "Daily Personalized Workouts via Text",
      start_url: "/",
      display: "standalone",
      theme_color: "#2563EB",
      background_color: "#ffffff",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/android-chrome-512x512.png", 
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };

    const manifestPath = path.join(publicDir, 'site.webmanifest');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Generated site.webmanifest');

    console.log('🎉 All favicons generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();