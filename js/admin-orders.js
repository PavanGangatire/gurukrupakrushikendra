document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = '../index.html';
        return;
    }

    window.allOrders = [];

    const loadOrders = async () => {
        const tableBody = document.querySelector('#orders-table tbody');
        try {
            const data = await orderAPI.getAllOrders();
            window.allOrders = data.data || [];
            
            if (window.allOrders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">No orders recorded yet.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = window.allOrders.map(o => `
                <tr>
                    <td>${new Date(o.createdAt).toLocaleString()}</td>
                    <td>
                        <div style="font-weight:600;">${o.user ? o.user.name : 'Unknown User'}</div>
                        <div style="font-size:0.8rem; color:#888;">${o.user ? o.user.mobile : ''}</div>
                    </td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="viewOrderItems('${o._id}')">View Items (${o.orderItems ? o.orderItems.length : 0})</button>
                    </td>
                    <td style="font-weight:700;">₹${o.totalPrice}</td>
                    <td><span class="badge ${o.paymentMethod === 'Cash' ? 'badge-success' : 'badge-warning'}">${o.paymentMethod}</span></td>
                    <td><span class="badge ${o.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
                </tr>
            `).join('');
        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Failed to load order history.</td></tr>`;
        }
    };

    window.viewOrderItems = (orderId) => {
        const order = window.allOrders.find(o => o._id === orderId);
        if (!order) return;
        
        const modal = document.getElementById('order-details-modal');
        const contentDiv = document.getElementById('order-details-content');
        
        let html = `
            <div style="margin-bottom:20px; padding:15px; background:#f9f9f9; border-radius:8px; border-left:4px solid var(--primary-color);">
                <div style="font-weight:700; color:#555; margin-bottom:5px; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px;">Shipping Address</div>
                <div style="color:#333; line-height:1.4;">${order.shippingAddress || 'Not Provided'}</div>
            </div>
            <div style="font-weight:700; color:#555; margin-bottom:10px; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px;">Order Items</div>
        `;

        if (order.orderItems && order.orderItems.length > 0) {
            html += order.orderItems.map(item => `
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #f5f5f5;">
                    <div style="flex:1;">
                        <strong style="color:#333;">${item.name}</strong>
                    </div>
                    <div style="text-align:right; min-width:100px; color:#555;">
                        <span style="display:inline-block; margin-right:10px;">x${item.qty}</span> ₹${item.price * item.qty}
                    </div>
                </div>
            `).join('');
            html += `
                <div style="text-align:right; font-size:1.1rem; font-weight:700; color:var(--primary-dark); margin-top:20px; padding-top:10px; border-top:2px solid #eee;">
                    Total: ₹${order.totalPrice}
                </div>
            `;
        } else {
            html += '<p style="text-align:center; color:#888;">No items found.</p>';
        }
        
        contentDiv.innerHTML = html;
        modal.style.display = 'flex';
    };

    window.closeOrderModal = () => {
        document.getElementById('order-details-modal').style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = (e) => {
        const modal = document.getElementById('order-details-modal');
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    };

    loadOrders();
});
