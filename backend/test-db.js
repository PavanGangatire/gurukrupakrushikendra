const mongoose = require('mongoose');
const Product = require('./models/Product');
const purchaseController = require('./controllers/purchaseController');

async function check() {
    await mongoose.connect('mongodb://127.0.0.1:27017/krushi-kendra');
    const product = await Product.findOne();
    console.log("Before stock:", product.stock);
    
    // We will simulate a fake Express Req/Res cycle!
    const req = {
        body: {
            items: [
                {
                    supplierName: 'Bulk Corp',
                    invoiceNumber: 'BULK-999',
                    product: product._id,
                    quantity: 42,
                    costPerUnit: 10
                }
            ]
        }
    };
    const res = {
        status: function(code) {
            console.log("HTTP Status:", code);
            return this;
        },
        json: function(data) {
            console.log("HTTP Response:", data);
            return this;
        }
    };

    // run controller
    await purchaseController.bulkAddPurchases(req, res);

    // Assert update
    const checkProd = await Product.findById(product._id);
    console.log("After stock:", checkProd.stock);
    
    process.exit(0);
}
check().catch(console.error);
