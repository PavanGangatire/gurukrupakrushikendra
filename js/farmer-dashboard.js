document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || user.role !== 'farmer') {
        window.location.href = 'login.html';
        return;
    }

    // Attempt to fetch fresh user data to get updated borrow amount
    const fetchFreshUser = async () => {
        try {
            const res = await authAPI.me();
            if (res.success) {
                storage.setUser(res.data);
                document.getElementById('pending-borrow-amt').textContent = `₹${res.data.remainingBorrowAmount}`;
            }
        } catch (err) {
            console.error('Could not fetch fresh user data', err);
            // Fallback to local storage
            document.getElementById('pending-borrow-amt').textContent = `₹${user.remainingBorrowAmount || 0}`;
        }
    };

    document.getElementById('farmer-name-display').textContent = user.name;
    document.getElementById('farmer-mobile-display').textContent = user.mobile;
    
    // Initial display from storage
    document.getElementById('pending-borrow-amt').textContent = `₹${user.remainingBorrowAmount || 0}`;

    const activeShopping = document.getElementById('active-shopping-content');

    const loadMyOrders = async () => {
        const tableBody = document.querySelector('#my-orders-table tbody');
        try {
            const data = await orderAPI.getMyOrders();
            
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">You have not placed any orders yet.</td></tr>';
                return;
            }

            tableBody.innerHTML = data.data.map(order => `
                <tr>
                    <td>${new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>${order.orderItems.map(i => i.name).join(', ')}</td>
                    <td style="font-weight:700;">₹${order.totalPrice}</td>
                    <td><span class="badge ${order.paymentMethod === 'Cash' ? 'badge-success' : 'badge-warning'}">${order.paymentMethod}</span></td>
                    <td><span class="badge ${order.status === 'Completed' ? 'badge-success' : (order.status==='Cancelled'?'badge-danger':'badge-warning')}">${order.status}</span></td>
                </tr>
            `).join('');
        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Failed to load order history.</td></tr>`;
        }
    };

    const loadFeaturedProducts = async () => {
        const grid = document.getElementById('featured-products-grid');
        try {
            const data = await productAPI.getAll('?limit=8');
            if (data.data.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:30px; color:#888; background:#f9f9f9; border-radius:8px;">This shop hasn\'t uploaded any products yet.</div>';
                return;
            }
            grid.innerHTML = data.data.map(p => `
                <div style="border:1px solid #eee; border-radius:8px; padding:15px; text-align:center; background:#fff;">
                    <img src="${p.image}" style="width:100%; height:120px; object-fit:cover; border-radius:5px; margin-bottom:10px;">
                    <h4 style="margin:0 0 5px 0; font-size:1rem; color:#333;">${p.name}</h4>
                    <p style="margin:0 0 8px 0; font-weight:700; color:var(--primary-color);">₹${p.price}</p>
                    <a href="product-detail.html?id=${p._id}" onclick="localStorage.setItem('selectedProductId', '${p._id}')" class="btn btn-outline" style="display:block; padding:5px; font-size:0.8rem; text-decoration:none;">Product Details</a>
                </div>
            `).join('');
        } catch (err) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; color:red;">Failed to load products.</div>';
        }
    };

    const initDashboard = () => {
        activeShopping.style.display = 'block';
        loadFeaturedProducts();
        
        fetchFreshUser();
        loadMyOrders();
        setupProfileModal();
    };

    const setupProfileModal = () => {
        const modal = document.getElementById('profile-modal');
        const trigger = document.getElementById('profile-trigger');
        const closeBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
        const editBtn = document.getElementById('edit-profile-btn');
        const saveBtn = document.getElementById('save-profile-btn');
        const viewMode = document.getElementById('profile-view-mode');
        const editMode = document.getElementById('profile-edit-mode');
        const viewFooter = document.getElementById('view-mode-footer');
        const editFooter = document.getElementById('edit-mode-footer');

        if (!modal || !trigger) return;

        const toggleMode = (mode) => {
            if (mode === 'edit') {
                viewMode.style.display = 'none';
                viewFooter.style.display = 'none';
                editMode.style.display = 'block';
                editBtn.style.display = 'none';
                
                // Fill inputs with current data
                const userData = storage.getUser();
                document.getElementById('edit-name').value = userData.name;
                document.getElementById('edit-town').value = userData.village || userData.town || '';
                document.getElementById('edit-taluka').value = userData.taluka || '';
                document.getElementById('edit-district').value = userData.district || '';
                document.getElementById('edit-state').value = userData.state || '';
            } else {
                viewMode.style.display = 'block';
                viewFooter.style.display = 'block';
                editMode.style.display = 'none';
                editBtn.style.display = 'block';
            }
        };

        trigger.addEventListener('click', () => {
            const userData = storage.getUser();
            if (!userData) return;

            // Fill view mode
            document.getElementById('modal-name').textContent = userData.name;
            document.getElementById('modal-mobile').textContent = userData.mobile;
            document.getElementById('modal-role').textContent = userData.role;
            document.getElementById('modal-town').textContent = userData.village || userData.town || 'N/A';
            document.getElementById('modal-taluka').textContent = userData.taluka || 'N/A';
            document.getElementById('modal-district').textContent = userData.district || 'N/A';
            document.getElementById('modal-state').textContent = userData.state || 'N/A';
            document.getElementById('modal-joined').textContent = new Date(userData.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            toggleMode('view');
            modal.style.display = 'flex';
        });

        editBtn.addEventListener('click', () => toggleMode('edit'));
        document.getElementById('cancel-edit-btn').addEventListener('click', () => toggleMode('view'));

        saveBtn.addEventListener('click', async () => {
            const errorDiv = document.getElementById('edit-profile-error');
            errorDiv.style.display = 'none';
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';

            const updatedData = {
                name: document.getElementById('edit-name').value,
                village: document.getElementById('edit-town').value,
                town: document.getElementById('edit-town').value,
                taluka: document.getElementById('edit-taluka').value,
                district: document.getElementById('edit-district').value,
                state: document.getElementById('edit-state').value
            };

            try {
                const res = await authAPI.updateProfile(updatedData);
                if (res.success) {
                    // Update storage
                    const currentUser = storage.getUser();
                    storage.setUser({ ...currentUser, ...res.data });
                    
                    // Update dashboard UI
                    document.getElementById('farmer-name-display').textContent = res.data.name;
                    
                    alert('Profile updated successfully!');
                    modal.style.display = 'none';
                    // Optional: location.reload() if village changes might affect shop selector
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

    initDashboard();
});
