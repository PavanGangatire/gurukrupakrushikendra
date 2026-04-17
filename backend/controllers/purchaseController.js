const StockPurchase = require('../models/StockPurchase');
const Product = require('../models/Product');

// @desc    Add a stock purchase
// @route   POST /api/purchases
// @access  Private/Admin
exports.addPurchase = async (req, res) => {
    try {
        const { supplierName, supplierContact, invoiceNumber, product, quantity, costPerUnit, purchaseDate, expiryDate } = req.body;
        
        // Ensure invoice integrity WITHIN THE SHOP
        const existingInvoice = await StockPurchase.findOne({ invoiceNumber });
        if (existingInvoice) {
            const inputDateStr = purchaseDate ? new Date(purchaseDate).toDateString() : new Date().toDateString();
            const existingDateStr = new Date(existingInvoice.purchaseDate).toDateString();
            
            if (existingInvoice.supplierName.toLowerCase().trim() !== supplierName.toLowerCase().trim() || inputDateStr !== existingDateStr) {
                return res.status(400).json({ success: false, error: `Invoice number '${invoiceNumber}' already exists in your records for another supplier/date.` });
            }
        }
        
        const totalCost = quantity * costPerUnit;

        const purchase = await StockPurchase.create({
            supplierName, 
            supplierContact, 
            invoiceNumber, 
            product, 
            quantity, 
            costPerUnit, 
            totalCost,

            purchaseDate: purchaseDate || Date.now(), 
            expiryDate
        });

        // Update product stock and optionally expiry date
        const prod = await Product.findById(product);
        if (prod) {
            prod.stock += parseInt(quantity, 10);
            if (expiryDate) prod.expiryDate = expiryDate;
            await prod.save();
        }

        res.status(201).json({ success: true, data: purchase });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private/Admin
exports.getPurchases = async (req, res) => {
    try {
        const query = {};
        const purchases = await StockPurchase.find(query).populate('product', 'name category').sort('-purchaseDate');
        res.status(200).json({ success: true, count: purchases.length, data: purchases });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Add multiple stock purchases in bulk
// @route   POST /api/purchases/bulk
// @access  Private/Admin
exports.bulkAddPurchases = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, error: 'No items provided for bulk purchase' });
        }

        // Validate invoice integrity (all items in a bulk purchase share the same invoice and supplier)
        const sampleItem = items[0];
        const existingInvoice = await StockPurchase.findOne({ invoiceNumber: sampleItem.invoiceNumber });
        if (existingInvoice) {
            const inputDateStr = sampleItem.purchaseDate ? new Date(sampleItem.purchaseDate).toDateString() : new Date().toDateString();
            const existingDateStr = new Date(existingInvoice.purchaseDate).toDateString();
            
            if (existingInvoice.supplierName.toLowerCase().trim() !== sampleItem.supplierName.toLowerCase().trim() || inputDateStr !== existingDateStr) {
                return res.status(400).json({ success: false, error: `Invoice number '${sampleItem.invoiceNumber}' belongs to supplier '${existingInvoice.supplierName}' on date ${existingDateStr}. Please use a unique invoice number for this new transaction.` });
            }
        }

        const generatedPurchases = [];

        for (const item of items) {
            const { supplierName, supplierContact, invoiceNumber, product, quantity, costPerUnit, purchaseDate, expiryDate } = item;
            
            const totalCost = quantity * costPerUnit;

            const purchase = await StockPurchase.create({
                supplierName, 
                supplierContact, 
                invoiceNumber, 
                product, 
                quantity, 
                costPerUnit, 
                totalCost,

                purchaseDate: purchaseDate || Date.now(), 
                expiryDate
            });
            
            generatedPurchases.push(purchase);

            // Update product stock and optionally expiry date
            const prod = await Product.findById(product);
            if (prod) {
                prod.stock += parseInt(quantity, 10);
                if (expiryDate) prod.expiryDate = expiryDate;
                await prod.save();
            }
        }

        res.status(201).json({ success: true, count: generatedPurchases.length, data: generatedPurchases });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
