document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = '../index.html';
        return;
    }

    // Extract farmer ID from URL query parameters or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    let farmerId = urlParams.get('id');

    if (!farmerId || farmerId === 'undefined') {
        farmerId = sessionStorage.getItem('currentFarmerId');
    }

    if (!farmerId || farmerId === 'undefined') {
        alert("No farmer selected.");
        window.location.href = 'admin-farmers.html';
        return;
    }

    const loadFarmerDetails = async () => {
        try {
            const res = await adminAPI.getFarmerDetails(farmerId);
            const { farmer, orders } = res.data;

            // Populate Summary Card
            document.getElementById('page-title').textContent = `${farmer.name}'s Profile`;
            document.getElementById('farmer-name').textContent = farmer.name;
            document.getElementById('farmer-mobile').textContent = "+91 " + farmer.mobile;
            document.getElementById('farmer-village').textContent = farmer.village || 'No village specified';
            document.getElementById('farmer-join-date').textContent = new Date(farmer.createdAt).toLocaleDateString('en-IN');

            // Calculate exact stats based on history
            let totalSpent = 0;
            orders.forEach(o => {
                if(o.paymentMethod !== 'Borrow' || o.isPaid) {
                    totalSpent += o.totalPrice; // Actual money received
                }
            });

            document.getElementById('stat-total-orders').textContent = orders.length;
            document.getElementById('stat-total-spent').textContent = `₹${totalSpent}`;
            
            const debtEl = document.getElementById('stat-current-debt');
            const currentDebt = res.data.shopSpecificBorrow !== undefined ? res.data.shopSpecificBorrow : (farmer.remainingBorrowAmount || 0);
            debtEl.textContent = `₹${currentDebt}`;
            if (currentDebt > 0) {
                debtEl.style.color = "var(--danger-color)";
            } else {
                debtEl.style.color = "var(--success-color)";
            }

            // Populate Historical Table
            const tableBody = document.querySelector('#history-table tbody');
            if (orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">No orders recorded for this farmer.</td></tr>';
                return;
            }

            tableBody.innerHTML = orders.map(order => {
                // Formatting items: "2x Fertilizer, 1x Seed"
                const itemsSummary = order.orderItems.map(item => `${item.qty}x ${item.name}`).join('<br>');
                
                // Badge color based on payment method
                let methodBadge = '';
                if(order.paymentMethod === 'Borrow') {
                    methodBadge = `<span class="badge badge-warning">Borrow (Credit)</span>`;
                } else if(order.paymentMethod === 'Online') {
                    methodBadge = `<span class="badge badge-info"><i class="fa-solid fa-credit-card"></i> Online</span>`;
                } else {
                    methodBadge = `<span class="badge badge-success"><i class="fa-solid fa-money-bill"></i> Cash</span>`;
                }

                // Status badge
                let statusBadge = order.status === 'Completed' 
                    ? `<span style="color:var(--success-color); font-weight:600;"><i class="fa-solid fa-check-circle"></i> Completed</span>`
                    : `<span style="color:var(--danger-color); font-weight:600;"><i class="fa-solid fa-clock"></i> Pending</span>`;

                // If Borrow is now fully paid
                if (order.paymentMethod === 'Borrow' && order.isPaid) {
                    statusBadge = `<span style="color:var(--success-color); font-weight:600;"><i class="fa-solid fa-check-double"></i> Settled</span>`;
                }

                return `
                    <tr>
                        <td style="white-space:nowrap;">
                            <strong>${new Date(order.createdAt).toLocaleDateString('en-IN')}</strong><br>
                            <small style="color:#888;">${new Date(order.createdAt).toLocaleTimeString()}</small>
                        </td>
                        <td>${itemsSummary}</td>
                        <td style="font-weight:600;">₹${order.totalPrice}</td>
                        <td>${methodBadge}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            }).join('');

        } catch (err) {
            console.error(err);
            document.querySelector('#history-table tbody').innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Failed to load history data.</td></tr>`;
        }
    };

    loadFarmerDetails();
});
