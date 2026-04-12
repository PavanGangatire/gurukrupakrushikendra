document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = '../index.html';
        return;
    }

    const form = document.getElementById('purchase-form');
    const productSelect = document.getElementById('productSelect');
    const purchasesContainer = document.getElementById('purchases-container');
    const msgDiv = document.getElementById('msg');

    const loadProductsForSelect = async () => {
        try {
            const data = await productAPI.getAll();
            productSelect.innerHTML = '<option value="">-- Choose Product --</option>' + 
                data.data.map(p => `<option value="${p._id}">${p.name} (${p.category}) - Current Stock: ${p.stock} ${p.unit}</option>`).join('');
        } catch (err) {
            productSelect.innerHTML = '<option value="">Failed to load products</option>';
        }
    };

    const loadPurchases = async () => {
        try {
            const data = await purchaseAPI.getAll();
            if (data.data.length === 0) {
                purchasesContainer.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">No purchases recorded yet.</div>';
                return;
            }

            // Group purchases mathematically by invoice Number
            const grouped = {};
            data.data.forEach(p => {
                const inv = p.invoiceNumber || 'Unknown';
                if (!grouped[inv]) {
                    grouped[inv] = {
                        supplierName: p.supplierName,
                        date: p.purchaseDate,
                        items: [],
                        totalGross: 0
                    };
                }
                grouped[inv].items.push(p);
                grouped[inv].totalGross += p.totalCost;
            });

            purchasesContainer.innerHTML = Object.keys(grouped).map(invNo => {
                const group = grouped[invNo];
                const dateStr = new Date(group.date).toLocaleDateString('en-IN');
                
                const itemsHtml = group.items.map(p => `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${p.product ? p.product.name : 'Unknown Product'}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${p.quantity}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">₹${p.costPerUnit}</td>
                        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right; font-weight:600;">₹${p.totalCost}</td>
                    </tr>
                `).join('');

                return `
                    <div style="background:#fff; border:1px solid #ddd; border-radius:8px; margin-bottom:20px; overflow:hidden;">
                        <div style="background:#f9f9f9; padding:15px 20px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-size:0.9rem; color:#888;">Invoice No:</span> <strong style="color:var(--primary-dark); font-size:1.1rem; margin-right:20px;">${invNo}</strong>
                                <span style="font-size:0.9rem; color:#888;">Supplier:</span> <strong style="margin-right:20px;">${group.supplierName}</strong>
                                <span style="font-size:0.9rem; color:#888;">Date:</span> <strong>${dateStr}</strong>
                            </div>
                            <div style="background:#e8f5e9; color:var(--primary-dark); padding:5px 15px; border-radius:20px; font-weight:600;">
                                Total: ₹${group.totalGross}
                            </div>
                        </div>
                        <div style="padding:0;">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead>
                                    <tr style="background:#fafafa;">
                                        <th style="padding:10px; text-align:left; color:#666; font-size:0.9rem;">Product</th>
                                        <th style="padding:10px; text-align:center; color:#666; font-size:0.9rem;">Qty</th>
                                        <th style="padding:10px; text-align:right; color:#666; font-size:0.9rem;">Unit Cost</th>
                                        <th style="padding:10px; text-align:right; color:#666; font-size:0.9rem;">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            purchasesContainer.innerHTML = `<div style="color:red; text-align:center; padding:20px;">Failed to load data: ${err.message}</div>`;
        }
    };

    let invoiceItems = [];
    const invoiceListEl = document.getElementById('invoice-items-list');
    
    document.getElementById('add-item-btn').addEventListener('click', () => {
        const productSelectElem = document.getElementById('productSelect');
        const product = productSelectElem.value;
        const productName = productSelectElem.options[productSelectElem.selectedIndex].text;
        const quantity = document.getElementById('qty').value;
        const costPerUnit = document.getElementById('cost').value;

        if (!product || !quantity || !costPerUnit) {
            alert('Please select a product, quantity, and cost per unit.');
            return;
        }

        invoiceItems.push({
            id: Date.now(),
            product,
            productName,
            quantity: parseInt(quantity, 10),
            costPerUnit: parseFloat(costPerUnit)
        });

        renderInvoiceItems();
        
        // Reset item fields
        productSelectElem.value = '';
        document.getElementById('qty').value = '';
        document.getElementById('cost').value = '';
    });

    window.removeInvoiceItem = (id) => {
        invoiceItems = invoiceItems.filter(item => item.id !== id);
        renderInvoiceItems();
    };

    const renderInvoiceItems = () => {
        if (invoiceItems.length === 0) {
            invoiceListEl.innerHTML = '<li style="padding:15px; border:1px dashed #ccc; border-radius:5px; text-align:center; color:#888;">No items staged yet. Select a product above and click "Stage Item".</li>';
            return;
        }

        invoiceListEl.innerHTML = invoiceItems.map(item => `
            <li style="padding:10px 15px; border:1px solid #eee; border-radius:5px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; background:#fff;">
                <div>
                    <strong>${item.productName.split(' - ')[0]}</strong>
                    <span style="margin-left:10px; color:#555; font-size:0.9rem;">Qty: ${item.quantity} | Unit Cost: ₹${item.costPerUnit} | Total: ₹${item.quantity * item.costPerUnit}</span>
                </div>
                <button type="button" onclick="removeInvoiceItem(${item.id})" style="background:none; border:none; color:var(--danger-color); cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </li>
        `).join('');
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const supplierName = document.getElementById('supplierName').value;
        const invoiceNumber = document.getElementById('invoiceNumber').value;
        const purchaseDate = document.getElementById('purchaseDate').value || undefined;

        if (invoiceItems.length === 0) {
            alert('Please stage at least one item before saving the invoice.');
            return;
        }

        // Map UI tracking items to backend payload items
        const payloadItems = invoiceItems.map(item => ({
            supplierName,
            invoiceNumber,
            product: item.product,
            quantity: item.quantity,
            costPerUnit: item.costPerUnit,
            purchaseDate
        }));

        try {
            const btn = document.getElementById('save-invoice-btn');
            btn.disabled = true;
            btn.textContent = 'Saving...';
            
            await purchaseAPI.bulkCreate(payloadItems);
            
            msgDiv.textContent = 'Invoice recorded and stocks correctly updated!';
            msgDiv.style.color = 'var(--success-color)';
            msgDiv.style.background = '#e8f5e9';
            msgDiv.style.display = 'block';
            
            form.reset();
            invoiceItems = [];
            renderInvoiceItems();
            loadPurchases();
            loadProductsForSelect(); // Refresh stock dynamically
            setTimeout(() => { msgDiv.style.display = 'none'; }, 5000);
        } catch (err) {
            msgDiv.textContent = err.message || 'Failed to record purchase invoice';
            msgDiv.style.color = 'var(--danger-color)';
            msgDiv.style.background = '#ffebee';
            msgDiv.style.display = 'block';
        } finally {
            const btn = document.getElementById('save-invoice-btn');
            btn.disabled = false;
            btn.textContent = 'Save Full Invoice & Update Stocks';
        }
    });

    loadProductsForSelect();
    loadPurchases();
});
