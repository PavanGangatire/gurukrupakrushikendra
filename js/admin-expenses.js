document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = '../index.html';
        return;
    }

    const form = document.getElementById('expense-form');
    const expensesContainer = document.getElementById('categorized-expenses-container');
    const msgDiv = document.getElementById('msg');
    const totalDisplay = document.getElementById('total-expense-display');

    // Default date to today
    document.getElementById('expenseDate').valueAsDate = new Date();

    const getCategoryBadge = (cat) => {
        const colors = {
            'Staff Salary': 'background:#e3f2fd; color:#1976d2;',
            'Rent': 'background:#e8f5e9; color:#388e3c;',
            'Electricity': 'background:#fff3e0; color:#f57c00;',
            'Transport': 'background:#f3e5f5; color:#7b1fa2;',
            'Maintenance': 'background:#ffebee; color:#d32f2f;',
            'Other': 'background:#eeeeee; color:#616161;'
        };
        return `<span class="badge" style="${colors[cat] || colors['Other']}">${cat}</span>`;
    };

    let allExpenses = [];

    const loadExpenses = async () => {
        try {
            const data = await expenseAPI.getAll();
            allExpenses = data.data || [];
            
            if (allExpenses.length === 0) {
                expensesContainer.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">No expenses recorded.</div>';
                totalDisplay.textContent = '₹0';
                return;
            }

            let total = 0;
            const categoryGroups = {};
            
            // Group expenses by category
            allExpenses.forEach(exp => {
                total += exp.amount;
                if (!categoryGroups[exp.category]) {
                    categoryGroups[exp.category] = [];
                }
                categoryGroups[exp.category].push(exp);
            });

            // Generate HTML for each group distinctly
            let containerHTML = '';
            for (const [cat, exps] of Object.entries(categoryGroups)) {
                let tableRows = exps.map(exp => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px;">${new Date(exp.date).toLocaleDateString('en-IN')}</td>
                        <td style="padding: 12px;"><strong>${exp.title}</strong><div style="font-size:0.8rem;color:#888;">${exp.description || ''}</div></td>
                        <td style="padding: 12px;">${exp.recordedBy ? exp.recordedBy.name : 'Unknown User'}</td>
                        <td style="padding: 12px; color:var(--danger-color); font-weight:700;">₹${exp.amount}</td>
                    </tr>
                `).join('');

                containerHTML += `
                    <div style="margin-bottom: 30px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                        <div style="background: #f9f9f9; padding: 15px 20px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #eee;">
                            <h4 style="margin: 0; color: var(--primary-dark); font-size:1.1rem;">${cat}</h4>
                            ${getCategoryBadge(cat)}
                        </div>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="padding: 12px; text-align: left; background: #fff; color: #888; border-bottom: 1px solid #eee; font-weight:500;">Date</th>
                                        <th style="padding: 12px; text-align: left; background: #fff; color: #888; border-bottom: 1px solid #eee; font-weight:500;">Title</th>
                                        <th style="padding: 12px; text-align: left; background: #fff; color: #888; border-bottom: 1px solid #eee; font-weight:500;">Logged By</th>
                                        <th style="padding: 12px; text-align: left; background: #fff; color: #888; border-bottom: 1px solid #eee; font-weight:500;">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }

            expensesContainer.innerHTML = containerHTML;
            totalDisplay.textContent = `₹${total}`;
        } catch (err) {
            expensesContainer.innerHTML = `<div style="color:red; text-align:center; padding:20px;">Failed to load data: ${err.message}</div>`;
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            title: document.getElementById('expenseTitle').value,
            category: document.getElementById('expenseCategory').value,
            amount: document.getElementById('expenseAmount').value,
            date: document.getElementById('expenseDate').value,
            description: document.getElementById('expenseDesc').value
        };

        try {
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Saving...';
            
            await expenseAPI.create(payload);
            
            msgDiv.textContent = 'Expense recorded successfully!';
            msgDiv.style.color = 'var(--success-color)';
            msgDiv.style.background = '#e8f5e9';
            msgDiv.style.display = 'block';
            
            form.reset();
            document.getElementById('expenseDate').valueAsDate = new Date(); // reset date
            loadExpenses();
            setTimeout(() => { msgDiv.style.display = 'none'; }, 5000);
        } catch (err) {
            msgDiv.textContent = err.message || 'Failed to record expense';
            msgDiv.style.color = 'var(--danger-color)';
            msgDiv.style.background = '#ffebee';
            msgDiv.style.display = 'block';
        } finally {
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = false;
            btn.textContent = 'Save Expense';
        }
    });

    loadExpenses();

    document.getElementById('total-expense-card').addEventListener('click', () => {
        const modal = document.getElementById('monthly-expense-modal');
        const content = document.getElementById('monthly-expense-content');
        
        if (allExpenses.length === 0) {
            content.innerHTML = '<p style="text-align:center; color:#888;">No expenses recorded yet.</p>';
            modal.style.display = 'flex';
            return;
        }

        // Group by month and category
        const monthlyData = {};
        allExpenses.forEach(exp => {
            const d = new Date(exp.date);
            const monthYear = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = { total: 0, categories: {} };
            }
            monthlyData[monthYear].total += exp.amount;
            
            if (!monthlyData[monthYear].categories[exp.category]) {
                monthlyData[monthYear].categories[exp.category] = 0;
            }
            monthlyData[monthYear].categories[exp.category] += exp.amount;
        });

        // Generate HTML
        let html = '';
        // Sort descending by date roughly by relying on object keys or we can just iterate
        // A better approach is to sort the array first, or just render. Since data is already sorted by backend usually, let's just render.
        for (const [month, data] of Object.entries(monthlyData)) {
            html += `<div style="margin-bottom:20px; border:1px solid #eee; border-radius:8px; padding:15px; box-shadow:0 2px 5px rgba(0,0,0,0.02)">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:10px;">
                    <h4 style="margin:0; color:var(--primary-dark); font-size:1.1rem;">${month}</h4>
                    <span style="color:var(--danger-color); font-weight:700;">₹${data.total}</span>
                </div>
                <div>`;
            
            for (const [cat, amt] of Object.entries(data.categories)) {
                html += `<div style="display:flex; justify-content:space-between; margin-bottom:8px; align-items:center;">
                    <div>${getCategoryBadge(cat)}</div>
                    <div style="color:#555; font-weight:500;">₹${amt}</div>
                </div>`;
            }
            html += `</div></div>`;
        }
        
        content.innerHTML = html;
        modal.style.display = 'flex';
    });
});
