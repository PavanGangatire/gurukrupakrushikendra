document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = '../index.html';
        return;
    }

    const finContent = document.getElementById('fin-content');

    const loadFinancials = async () => {
        try {
            const response = await adminAPI.getFinancials();
            const { totalSales, totalPurchases, totalExpenses, totalPendingCredit, netProfit } = response.data;

            finContent.innerHTML = `
                <div class="financial-grid">
                    <div class="fin-card net-profit">
                        <div>
                            <h3 style="color:#fff;">Net Profit/Loss</h3>
                            <p style="opacity:0.8; margin-top:5px; color:#fff;">(Total Sales - Purchases - Expenses)</p>
                        </div>
                        <h2>₹${netProfit}</h2>
                    </div>

                    <div class="fin-card">
                        <i class="fa-solid fa-sack-dollar text-success"></i>
                        <h3>Total Gross Sales</h3>
                        <h2>₹${totalSales}</h2>
                    </div>

                    <div class="fin-card">
                        <i class="fa-solid fa-cart-flatbed text-primary"></i>
                        <h3>Inventory Purchases</h3>
                        <h2>₹${totalPurchases}</h2>
                    </div>

                    <div class="fin-card">
                        <i class="fa-solid fa-file-invoice-dollar" style="color:var(--danger-color);"></i>
                        <h3>Shop Expenses</h3>
                        <h2>₹${totalExpenses}</h2>
                    </div>

                    <div class="fin-card">
                        <i class="fa-solid fa-handshake-angle" style="color:#f57c00;"></i>
                        <h3>Farmer Pending Credit (Borrow)</h3>
                        <h2>₹${totalPendingCredit}</h2>
                    </div>
                </div>
            `;
        } catch (err) {
            finContent.innerHTML = `<div style="text-align:center; padding:50px; color:var(--danger-color);"><h3>Failed to load financial data.</h3><p>${err.message}</p></div>`;
        }
    };

    loadFinancials();
});
