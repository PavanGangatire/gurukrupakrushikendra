document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = '../index.html';
        return;
    }

    let allFarmers = [];
    let allProducts = [];

    const loadCredits = async () => {
        const tableBody = document.querySelector('#credit-table tbody');
        try {
            const data = await adminAPI.getFarmers();
            allFarmers = data.data; // Store for dropdown
            
            // Filter only farmers who actually owe money
            const pendingFarmers = allFarmers.filter(f => f.remainingBorrowAmount > 0);

            if (pendingFarmers.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">No outstanding credit balances mapped currently.</td></tr>';
            } else {
                tableBody.innerHTML = pendingFarmers.map(f => `
                    <tr>
                        <td style="font-weight:600;">${f.name}</td>
                        <td><a href="tel:${f.mobile}" style="color:var(--primary-color); text-decoration:none;">${f.mobile}</a></td>
                        <td>${f.village || 'N/A'}</td>
                         <td style="font-weight:700; color:var(--danger-color); font-size:1.1rem;">₹${f.remainingBorrowAmount}</td>
                        <td>
                            <button onclick="openSettleModal('${f._id}', '${f.name}', ${f.remainingBorrowAmount})" class="btn btn-outline btn-sm" style="margin-right:8px; border-color:var(--primary-color); color:var(--primary-color);"><i class="fa-solid fa-hand-holding-dollar"></i> Settle Payment</button>
                            <button onclick="window.location.href='admin-farmer-details.html?id=${f._id}'" class="btn btn-primary btn-sm"><i class="fa-solid fa-eye"></i> Review Orders</button>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Populate farmers dropdown
            const farmerSelect = document.getElementById('credit-farmer');
            farmerSelect.innerHTML = '<option value="">Select a farmer...</option>' + 
                allFarmers.map(f => `<option value="${f._id}">${f.name} (${f.mobile})</option>`).join('');

        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Failed to resolve outstanding credit records.</td></tr>`;
        }
    };

    const loadProducts = async () => {
        try {
            const data = await productAPI.getAll();
            allProducts = data.data;
            const productSelect = document.getElementById('credit-product');
            productSelect.innerHTML = '<option value="">Select a product...</option>' + 
                allProducts.map(p => `<option value="${p._id}" data-price="${p.price}" data-name="${p.name}">
                    ${p.name} (₹${p.price})
                </option>`).join('');
        } catch (err) {
            console.error("Failed to load products for credit modal", err);
        }
    };

    const handleUrlParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const farmerId = urlParams.get('farmerId');
        if (farmerId && allFarmers.length > 0) {
            // Check both _id and id for robustness
            const farmer = allFarmers.find(f => f._id === farmerId || f.id === farmerId);
            if (farmer) {
                openSettleModal(farmer._id || farmer.id, farmer.name, farmer.remainingBorrowAmount);
            }
        }
    };

    const init = async () => {
        await Promise.all([loadCredits(), loadProducts()]);
        handleUrlParams();
    };
    init();

    // Modal logic
    const creditModal = document.getElementById('give-credit-modal');
    document.getElementById('open-credit-modal').addEventListener('click', () => {
        creditModal.style.display = 'flex';
    });
    document.getElementById('close-credit-modal').addEventListener('click', () => {
        creditModal.style.display = 'none';
        document.getElementById('give-credit-form').reset();
        document.getElementById('credit-total').value = '';
    });
    window.addEventListener('click', (e) => {
        if (e.target === creditModal) {
            creditModal.style.display = 'none';
        }
        if (e.target === settleModal) {
            settleModal.style.display = 'none';
        }
    });

    // Settle Modal Logic
    const settleModal = document.getElementById('settle-credit-modal');
    const settleForm = document.getElementById('settle-credit-form');
    
    window.openSettleModal = (id, name, amount) => {
        document.getElementById('settle-farmer-id').value = id;
        document.getElementById('settle-farmer-info').textContent = `Farmer: ${name} (Owes ₹${amount})`;
        document.getElementById('settle-amount').value = amount;
        settleModal.style.display = 'flex';
    };

    document.getElementById('close-settle-modal').onclick = () => {
        settleModal.style.display = 'none';
    };

    settleForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('settle-farmer-id').value;
        const amount = document.getElementById('settle-amount').value;
        const btn = document.getElementById('submit-settle-btn');
        const msg = document.getElementById('settle-msg');

        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            
            const res = await adminAPI.settleCredit(id, amount);
            if (res.success) {
                msg.style.color = 'var(--success-color)';
                msg.textContent = res.message;
                setTimeout(() => {
                    settleModal.style.display = 'none';
                    settleForm.reset();
                    msg.textContent = '';
                    btn.disabled = false;
                    btn.innerHTML = 'Record Payment';
                    loadCredits();
                }, 1500);
            }
        } catch (err) {
            msg.style.color = 'var(--danger-color)';
            msg.textContent = err.message || 'Settlement failed';
            btn.disabled = false;
            btn.innerHTML = 'Record Payment';
        }
    };

    // Dynamic Total Calculation
    const productSelect = document.getElementById('credit-product');
    const qtyInput = document.getElementById('credit-qty');
    const totalInput = document.getElementById('credit-total');

    const updateTotal = () => {
        const option = productSelect.options[productSelect.selectedIndex];
        if (option && option.value) {
            const price = parseFloat(option.getAttribute('data-price')) || 0;
            const qty = parseInt(qtyInput.value) || 1;
            totalInput.value = price * qty;
        } else {
            totalInput.value = '';
        }
    };

    productSelect.addEventListener('change', updateTotal);
    qtyInput.addEventListener('input', updateTotal);

    // Form Submit
    const form = document.getElementById('give-credit-form');
    const submitBtn = document.getElementById('submit-credit-btn');
    const msgEl = document.getElementById('credit-msg');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const farmerId = document.getElementById('credit-farmer').value;
        const productId = productSelect.value;
        const qty = parseInt(qtyInput.value);
        const totalPrice = parseInt(totalInput.value);
        
        const option = productSelect.options[productSelect.selectedIndex];
        const productName = option.getAttribute('data-name');
        const productPrice = parseFloat(option.getAttribute('data-price'));

        if (!farmerId || !productId || qty < 1) return;

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            
            const payload = {
                userId: farmerId,
                shopOwner: user._id || user.id, // Ensure shop owner ID is included
                orderItems: [{
                    product: productId,
                    name: productName,
                    qty: qty,
                    price: productPrice
                }],
                paymentMethod: 'Borrow',
                totalPrice: totalPrice
            };

            const prodData = allProducts.find(p => p._id === productId);
            payload.orderItems[0].image = (prodData && prodData.image) ? prodData.image : 'default.jpg';

            const res = await orderAPI.create(payload);
            if (res.success) {
                msgEl.style.color = 'var(--success-color)';
                msgEl.textContent = 'Credit assigned successfully!';
                
                setTimeout(() => {
                    creditModal.style.display = 'none';
                    form.reset();
                    msgEl.textContent = '';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Confirm Credit';
                    loadCredits();
                }, 1500);
            }
        } catch (err) {
            msgEl.style.color = 'var(--danger-color)';
            msgEl.textContent = err.message || 'Failed to assign credit.';
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Confirm Credit';
        }
    });

    // Add Farmer Modal logic
    const addFarmerModal = document.getElementById('add-farmer-modal');
    document.getElementById('show-add-farmer-btn').addEventListener('click', () => {
        addFarmerModal.style.display = 'flex';
    });
    document.getElementById('close-add-farmer-modal').addEventListener('click', () => {
        addFarmerModal.style.display = 'none';
        document.getElementById('add-farmer-form').reset();
        document.getElementById('af-msg').textContent = '';
    });

    document.getElementById('add-farmer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-farmer-btn');
        const msg = document.getElementById('af-msg');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Registering...';
        
        try {
            const res = await authAPI.register({
                name: document.getElementById('af-name').value,
                mobile: document.getElementById('af-mobile').value,
                password: 'farmer123', // Default simple password
                village: document.getElementById('af-village').value || '',
                town: document.getElementById('af-town').value,
                taluka: document.getElementById('af-taluka').value,
                district: document.getElementById('af-district').value,
                state: document.getElementById('af-state').value,
                role: 'farmer'
            });
            
            if(res.success) {
                msg.style.color = 'var(--success-color)';
                msg.textContent = 'Farmer registered successfully!';
                
                // Immediately fetch fresh list to update the dropdown
                const freshData = await adminAPI.getFarmers();
                allFarmers = freshData.data;
                const farmerSelect = document.getElementById('credit-farmer');
                farmerSelect.innerHTML = '<option value="">Select a farmer...</option>' + 
                    allFarmers.map(f => `<option value="${f._id}">${f.name} (${f.mobile})</option>`).join('');
                
                // Auto-select the newly added farmer
                const mobileRegex = document.getElementById('af-mobile').value;
                const justAdded = allFarmers.find(f => f.mobile === mobileRegex);
                if(justAdded) {
                    farmerSelect.value = justAdded._id;
                }

                setTimeout(() => {
                    addFarmerModal.style.display = 'none';
                    document.getElementById('add-farmer-form').reset();
                    msg.textContent = '';
                    btn.disabled = false;
                    btn.innerHTML = 'Register Farmer';
                    loadCredits();
                }, 1500);
            }
        } catch(err) {
            msg.style.color = 'var(--danger-color)';
            msg.textContent = err.message || 'Registration failed';
            btn.disabled = false;
            btn.innerHTML = 'Register Farmer';
        }
    });

});
