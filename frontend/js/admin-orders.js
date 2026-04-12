document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = '../index.html';
        return;
    }

    const loadOrders = async () => {
        const tableBody = document.querySelector('#orders-table tbody');
        try {
            const data = await orderAPI.getAllOrders();
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">No orders recorded yet.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = data.data.map(o => `
                <tr>
                    <td>${new Date(o.createdAt).toLocaleString()}</td>
                    <td>
                        <div style="font-weight:600;">${o.user ? o.user.name : 'Unknown User'}</div>
                        <div style="font-size:0.8rem; color:#888;">${o.user ? o.user.mobile : ''}</div>
                    </td>
                    <td style="font-weight:700;">₹${o.totalPrice}</td>
                    <td><span class="badge ${o.paymentMethod === 'Cash' ? 'badge-success' : 'badge-warning'}">${o.paymentMethod}</span></td>
                    <td><span class="badge ${o.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
                </tr>
            `).join('');
        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Failed to load order history.</td></tr>`;
        }
    };

    loadOrders();
});
