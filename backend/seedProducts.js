const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');
const User = require('./models/User');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krushi-kendra');
        console.log('Connected to MongoDB');
        
        await Product.deleteMany();
        console.log('Cleared existing products');
        
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.error('ERROR: No admin user found. Please create an admin account before running the seed script.');
            process.exit(1);
        }

        const products = [
            {
                name: 'Hybrid Wheat Seeds (HD 3226) - 1kg Packet',
                category: 'Seeds',
                company: 'AgriGenetics',
                description: 'HD 3226 (Pusa Yashasvi) is a highly prominent and revolutionary wheat variety engineered for supreme yield and formidable disease resistance. It boasts excellent resistance against yellow, brown, and black rusts, ensuring absolute crop safety.<br><br><b>Key Benefits:</b><ul><li>High protein content (approx. 12.8%).</li><li>High tillering capacity with extremely resilient stalks.</li><li>Ideal sowing window: First fortnight of November.</li></ul><br><i>Perfect for small-scale experimental plots and backyard farms.</i>',
                purchasePrice: 60,
                sellingPrice: 80,
                price: 80,
                stock: 150,
                unit: '1kg Packet',
                image: '../assets/products/wheat_seeds_bag_1774086362225.png'
            },
            {
                name: 'Basmati Rice Seeds (Pusa 1121) - 1kg Packet',
                category: 'Seeds',
                company: 'Bharat Seeds',
                description: 'Pusa 1121 is universally acclaimed as the world\'s longest Basmati rice grain. Upon cooking, it elongates beautifully, remains completely non-sticky, and releases an exceptional aroma that is synonymous with authentic premium Indian Basmati.<br><br><b>Cultivation Tips:</b><ul><li>Requires well-puddled and heavily levelled fields.</li><li>Nursery preparation ideally in early June.</li><li>Exhibits phenomenal response to standard nitrogen applications.</li></ul>',
                purchasePrice: 120,
                sellingPrice: 150,
                price: 150,
                stock: 100,
                unit: '1kg Packet',
                image: '../assets/products/basmati_rice_grains_1774086378617.png'
            },
            {
                name: 'Yellow Maize Seeds - 1kg Packet',
                category: 'Seeds',
                company: 'Kisan Trust',
                description: 'Premium Yellow Maize (Corn) Seeds carefully selected for vigorous Kharif and Rabi season growth. These hybrid seeds guarantee phenomenal germination rates and robust root establishment, making them highly drought-tolerant and sturdy against high winds.<br><br><b>Uses:</b> Highly sought after for both high-grade poultry feed production and premium human consumption. <i>Ensure a plant spacing of 60cm x 20cm for maximal yield.</i>',
                purchasePrice: 140,
                sellingPrice: 180,
                price: 180,
                stock: 200,
                unit: '1kg Packet',
                image: '../assets/products/yellow_maize_seeds_1774086396108.png'
            },
            {
                name: 'Cotton Seeds (Bt Cotton) - 450g Packet',
                category: 'Seeds',
                company: 'Bollgard',
                description: 'Bt Cotton represents a monumental leap in agricultural biotechnology. Engineered specifically to combat the devastating bollworm, these seeds natively secrete natural proteins that protect the cotton bolls from internal pests without requiring excessive external chemical sprays.<br><br><b>Highlights:</b><ul><li>Massively reduces pesticide expenditure.</li><li>Produces exceptionally long, strong, and bright white lint.</li><li>Highly adaptable to varying soil moisture conditions.</li></ul>',
                purchasePrice: 750,
                sellingPrice: 850,
                price: 850,
                stock: 80,
                unit: '450g Packet',
                image: '../assets/products/cotton_seeds_bolls_1774086413538.png'
            },
            {
                name: 'Urea (46% N) - 1kg Packet',
                category: 'Fertilizers',
                company: 'IFFCO',
                description: 'Urea (46% Nitrogen) is the most heavily utilized nitrogenous fertilizer in global agriculture. It provides an immediate and massive boost to leaf and stem growth, resulting in deep, rich green foliage and rapid vegetative expansion.<br><br><b>Application Guidelines:</b> Best applied in split doses—as a basal dressing during sowing, followed by top-dressing during the critical growth stages. Ensure the soil maintains adequate moisture during application for optimal root absorption.',
                purchasePrice: 20,
                sellingPrice: 30,
                price: 30,
                stock: 300,
                unit: '1kg Packet',
                image: '../assets/products/urea_fertilizer_granules_1774086435579.png'
            },
            {
                name: 'DAP (Di-Ammonium Phosphate) - 1kg Packet',
                category: 'Fertilizers',
                company: 'KRIBHCO',
                description: 'Di-Ammonium Phosphate (DAP) contains 18% Nitrogen and 46% Phosphorus, making it the universally preferred basal fertilizer worldwide. Phosphorus is absolutely critical during the initial sowing stages to establish a massive, deep, and healthy root system.<br><br><b>Why Use DAP:</b> It ensures early crop establishment, promotes rapid blooming, accelerates seed formation, and heavily influences final grain/fruit weight and market quality.',
                purchasePrice: 45,
                sellingPrice: 60,
                price: 60,
                stock: 250,
                unit: '1kg Packet',
                image: '../assets/products/dap_fertilizer_soil_1774086456388.png'
            },
            {
                name: 'Organic Vermicompost - 5kg Bag',
                category: 'Fertilizers',
                company: 'GreenEarth',
                description: '100% Organic Vermicompost—the ultimate microbial soil conditioner. Produced by employing specialized earthworms to break down organic biomass, it is incredibly rich in all essential plant macro and micro-nutrients, alongside thousands of beneficial soil microbes.<br><br><b>Unmatched Benefits:</b><ul><li>Improves soil aeration and water retention instantly.</li><li>Completely entirely non-toxic and deeply eco-friendly.</li><li>Prevents soil degradation and actively restores natural pH balance over time.</li></ul>',
                purchasePrice: 100,
                sellingPrice: 150,
                price: 150,
                stock: 150,
                unit: '5kg Bag',
                image: '../assets/products/organic_vermicompost_1774086471908.png'
            },
            {
                name: 'Chlorpyrifos 20% EC - 250ml Bottle',
                category: 'Pesticides',
                company: 'UPL',
                description: 'Chlorpyrifos 20% EC is a highly potent, broad-spectrum organophosphate insecticide. It aggressively targets and eliminates a vast range of foliage and soil-borne pests including termites, aphids, jassids, and destructive root borers.<br><br><b style="color:var(--danger-color);">Safety Precaution:</b> Highly toxic compound. Must be administered strictly via uniform foliar spray utilizing proper protective agricultural gear (gloves, mask). Do not spray during severe high winds.',
                purchasePrice: 110,
                sellingPrice: 150,
                price: 150,
                stock: 100,
                unit: '250ml Bottle',
                image: '../assets/products/chlorpyrifos_pesticide_bottle_1774086490498.png'
            },
            {
                name: 'Mancozeb 75% WP - 250g Packet',
                category: 'Pesticides',
                company: 'Bayer',
                description: 'Mancozeb 75% WP is an incredibly dependable and iconic contact fungicide utilized globally to prevent total crop devastation from blights, leaf spots, and catastrophic mildews. It creates a physical protective barrier on the leaf epidermis, preventing roaming fungal spores from successfully germinating.<br><br><b>Usage Applications:</b> Ideal for potatoes, tomatoes, vines, and most fruit orchards. The recommended dosage is generally 2 to 2.5 grams thoroughly mixed per liter of water sprayed uniformly.',
                purchasePrice: 90,
                sellingPrice: 120,
                price: 120,
                stock: 150,
                unit: '250g Packet',
                image: '../assets/products/mancozeb_fungicide_packet_1774086508066.png'
            },
            {
                name: 'Glyphosate 41% SL - 500ml Bottle',
                category: 'Pesticides',
                company: 'Monsanto',
                description: 'Glyphosate 41% SL is a heavy-duty, industrial-grade, non-selective systemic herbicide. When properly applied, it is rapidly absorbed through the leaves and transported straight to the roots, entirely destroying deep-rooted perennial weeds, tough grasses, and sedges from the inside out.<br><br><b style="color:var(--danger-color);">Crucial Warning:</b> "Non-selective" explicitly means it will lethally target ANY green plant foliage it touches. Use extreme precision, spray hoods, and directed sprays to absolutely avoid harming your main commercial crop.',
                purchasePrice: 220,
                sellingPrice: 280,
                price: 280,
                stock: 120,
                unit: '500ml Bottle',
                image: '../assets/products/glyphosate_herbicide_jug_1774086527597.png'
            }
        ];

        const productsWithOwner = products.map(p => ({ ...p, shopOwner: admin._id }));

        await Product.insertMany(productsWithOwner);
        console.log('Seeded database with high quality local images successfully!');
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('SEED SCRIPT ERROR:', err);
        process.exit(1);
    }
};

seedDB();
