document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = '../index.html';
        return;
    }

    const loadFarmers = async () => {
        const tableBody = document.querySelector('#farmers-table tbody');
        try {
            const res = await adminAPI.getFarmers();
            
            if (res.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">No farmers registered yet.</td></tr>';
                return;
            }

            tableBody.innerHTML = res.data.map(farmer => `
                <tr>
                    <td style="font-weight:600;">${farmer.name}</td>
                    <td>${farmer.mobile}</td>
                    <td>${farmer.village || 'N/A'}</td>
                    <td>${new Date(farmer.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                         <span style="font-weight:700; ${(farmer.shopSpecificBorrow > 0 || farmer.remainingBorrowAmount > 0) ? 'color:var(--danger-color);' : 'color:var(--success-color);'}">
                            ₹${farmer.shopSpecificBorrow !== undefined ? farmer.shopSpecificBorrow : (farmer.remainingBorrowAmount || 0)}
                        </span>
                    </td>
                    <td>
                        <button onclick="viewHistory('${farmer._id || farmer.id}')" class="btn btn-primary" style="padding: 5px 12px; font-size: 0.85rem; border-radius: 5px; cursor: pointer; border: none;"><i class="fa-solid fa-clock-rotate-left"></i> History</button>
                    </td>
                </tr>
            `).join('');
            
        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Failed to load farmers.</td></tr>`;
        }
    };

    loadFarmers();
});

window.viewHistory = (id) => {
    sessionStorage.setItem('currentFarmerId', id);
    window.location.href = 'admin-farmer-details';
};
