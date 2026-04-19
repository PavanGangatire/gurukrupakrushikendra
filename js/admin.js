document.addEventListener('DOMContentLoaded', () => {
    // Check if user is admin
    const user = storage.getUser();
    console.log('Current Dashboard User:', user);
    if (!user || user.role === 'farmer') {
        console.warn('Unauthorized access redirect. User Data:', user);
        alert('Unauthorized access. Redirecting...');
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('admin-name').textContent = user.name;

    const loadDashboard = async () => {
        try {
            console.log('Fetching dashboard stats...');
            const response = await adminAPI.getDashboard();
            const data = response.data;
            console.log('Dashboard Data Received:', data);

            // DOM Elements
            const statFarmers = document.getElementById('stat-farmers');
            const statSales = document.getElementById('stat-sales');
            const statBorrow = document.getElementById('stat-borrow');
            const statProducts = document.getElementById('stat-products');
            
            const borrowTbody = document.querySelector('#borrow-table tbody');
            const ordersTbody = document.querySelector('#orders-table tbody');

            // Set Stats
            statFarmers.textContent = data.totalFarmers;
            statSales.textContent = `₹${data.todaySales}`;
            statBorrow.textContent = `₹${data.totalPendingBorrow}`;
            statProducts.textContent = data.totalProducts;

            // Render Borrow Table
            if (data.farmersWithBorrow.length === 0) {
                borrowTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888; padding:30px;">No pending payments found.</td></tr>';
            } else {
                borrowTbody.innerHTML = data.farmersWithBorrow.map(farmer => `
                    <tr>
                        <td style="font-weight:600; color:#333;">${farmer.name}</td>
                        <td>${farmer.mobile}</td>
                        <td>${farmer.village || 'N/A'}</td>
                        <td style="color:var(--danger-color); font-weight:700;">₹${farmer.remainingBorrowAmount}</td>
                        <td>
                            <button class="btn btn-primary" style="padding: 5px 12px; font-size: 0.85rem;" onclick="openPaymentModal('${farmer.id}')">Settle</button>
                        </td>
                    </tr>
                `).join('');
            }

            // Render Orders Table
            if (data.recentOrders.length === 0) {
                ordersTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#888; padding:30px;">No recent orders.</td></tr>';
            } else {
                ordersTbody.innerHTML = data.recentOrders.map(order => `
                    <tr>
                        <td style="font-weight:500; color:#333;">${order.user}</td>
                        <td style="font-weight:700; color:var(--primary-dark);">₹${order.totalPrice}</td>
                        <td><span class="badge ${order.paymentMethod === 'Cash' ? 'badge-success' : 'badge-warning'}">${order.paymentMethod}</span></td>
                        <td><span class="badge ${order.status === 'Completed' ? 'badge-success' : 'badge-danger'}">${order.status}</span></td>
                    </tr>
                `).join('');
            }

        } catch (err) {
            console.error('CRITICAL: Error loading admin dashboard', err);
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div style="text-align:center; padding:50px; background:#fff; border-radius:12px; margin:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size:4rem; color:var(--danger-color); margin-bottom:20px;"></i>
                        <h3 style="color:#333;">Dashboard Connection Error</h3>
                        <p style="color:#666; margin:15px 0;">We couldn't retrieve the latest statistics. This usually happens if the backend server is restarting or if there is a data integrity issue.</p>
                        <code style="display:block; background:#f4f4f4; padding:15px; border-radius:8px; color:var(--danger-color); font-family:monospace; margin:20px 0;">Error: ${err.message}</code>
                        <button onclick="location.reload()" class="btn btn-primary">Try Refreshing Page</button>
                    </div>
                `;
            }
        }
    };

    let currentFarmerId = null;
    window.openPaymentModal = (farmerId) => {
        currentFarmerId = farmerId;
        const modal = document.getElementById('payment-modal');
        modal.style.display = 'flex';
    };

    const confirmPayBtn = document.getElementById('confirm-pay-btn');
    if (confirmPayBtn) {
        confirmPayBtn.addEventListener('click', () => {
            if (currentFarmerId) {
                window.location.href = `admin-credit.html?farmerId=${currentFarmerId}`;
            }
        });
    }

    const setupProfileModal = () => {
        const modal = document.getElementById('admin-profile-modal');
        const trigger = document.getElementById('admin-profile-trigger');
        const closeBtns = document.querySelectorAll('.close-admin-modal, #close-admin-profile, #cancel-admin-edit');
        const editBtn = document.getElementById('edit-admin-profile-btn');
        const saveBtn = document.getElementById('save-admin-profile');
        const viewMode = document.getElementById('admin-view-mode');
        const editMode = document.getElementById('admin-edit-mode');
        const viewFooter = document.getElementById('admin-view-footer');

        if (!modal || !trigger) return;

        const toggleMode = (mode) => {
            if (mode === 'edit') {
                viewMode.style.display = 'none';
                viewFooter.style.display = 'none';
                editMode.style.display = 'block';
                editBtn.style.display = 'none';
                
                // Fill inputs with current data
                const userData = storage.getUser();
                document.getElementById('edit-admin-name').value = userData.name;
                document.getElementById('edit-shop-name').value = userData.shopName || '';
                document.getElementById('edit-admin-town').value = userData.town || '';
                document.getElementById('edit-admin-taluka').value = userData.taluka || '';
                document.getElementById('edit-admin-district').value = userData.district || '';
                document.getElementById('edit-admin-state').value = userData.state || '';
            } else {
                viewMode.style.display = 'block';
                viewFooter.style.display = 'block';
                editMode.style.display = 'none';
                editBtn.style.display = 'block';
            }
        };

        trigger.addEventListener('click', async () => {
            // Fetch fresh data before showing modal
            try {
                const res = await authAPI.me();
                if (res.success) {
                    storage.setUser(res.data);
                }
            } catch (err) { console.error('Failed to sync profile', err); }

            const userData = storage.getUser();
            if (!userData) return;

            // Fill view mode
            document.getElementById('modal-admin-name').textContent = userData.name;
            document.getElementById('modal-admin-shop').textContent = userData.shopName || 'Not Set';
            document.getElementById('modal-admin-mobile').textContent = userData.mobile;
            document.getElementById('modal-admin-town').textContent = userData.town || 'N/A';
            document.getElementById('modal-admin-taluka').textContent = userData.taluka || 'N/A';
            document.getElementById('modal-admin-district').textContent = userData.district || 'N/A';
            document.getElementById('modal-admin-state').textContent = userData.state || 'N/A';

            toggleMode('view');
            modal.style.display = 'flex';
        });

        editBtn.addEventListener('click', () => toggleMode('edit'));

        saveBtn.addEventListener('click', async () => {
            const errorDiv = document.getElementById('edit-admin-error');
            errorDiv.style.display = 'none';
            
            const updatedData = {
                name: document.getElementById('edit-admin-name').value.trim(),
                shopName: document.getElementById('edit-shop-name').value.trim(),
                town: document.getElementById('edit-admin-town').value.trim(),
                taluka: document.getElementById('edit-admin-taluka').value.trim(),
                district: document.getElementById('edit-admin-district').value.trim(),
                state: document.getElementById('edit-admin-state').value.trim()
            };

            // Basic Validation
            if (!updatedData.name || !updatedData.shopName || !updatedData.state || !updatedData.district) {
                errorDiv.textContent = 'Please fill in all required fields (Name, Shop Name, District, State)';
                errorDiv.style.display = 'block';
                return;
            }

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';

            try {
                const res = await authAPI.updateProfile(updatedData);
                if (res.success) {
                    // Update storage
                    const currentUser = storage.getUser();
                    storage.setUser({ ...currentUser, ...res.data });
                    
                    // Update dashboard UI
                    const nameEl = document.getElementById('admin-name');
                    if(nameEl) nameEl.textContent = res.data.name;
                    
                    alert('Profile updated successfully!');
                    modal.style.display = 'none';
                }
            } catch (err) {
                errorDiv.textContent = err.message || 'Failed to update profile';
                errorDiv.style.display = 'block';
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Changes';
            }
        });

        closeBtns.forEach(btn => {
            btn.onclick = () => { modal.style.display = 'none'; };
        });

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    };

    setupProfileModal();
    loadDashboard();
});
