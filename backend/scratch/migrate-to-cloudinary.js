const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find({});
    console.log(`Found ${products.length} products.`);

    const projectRoot = path.resolve(__dirname, '../../');
    let migratedCount = 0;

    for (const product of products) {
      let img = product.image;
      if (!img) continue;

      // Clean the path
      let cleanPath = img.replace(/\\/g, '/');
      if (cleanPath.startsWith('http://localhost:5000/')) {
        cleanPath = cleanPath.replace('http://localhost:5000/', '');
      } else if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }

      // Try different common locations
      const possiblePaths = [
        path.join(projectRoot, cleanPath),
        path.join(projectRoot, 'backend', cleanPath),
        path.join(projectRoot, 'assets/products', path.basename(cleanPath)),
        path.join(projectRoot, 'uploads', path.basename(cleanPath))
      ];

      let foundPath = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          foundPath = p;
          break;
        }
      }

      if (foundPath && !img.startsWith('http') || (img.includes('localhost'))) {
        console.log(`Migrating ${product.name}...`);
        const result = await cloudinary.uploader.upload(foundPath, {
          folder: 'gurukrupa-products',
        });
        
        product.image = result.secure_url;
        await product.save();
        console.log(`✅ ${product.name} -> ${result.secure_url}`);
        migratedCount++;
      }
    }

    console.log(`\nMigration completed. ${migratedCount} images migrated.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
