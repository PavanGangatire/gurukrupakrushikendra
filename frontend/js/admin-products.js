document.addEventListener('DOMContentLoaded', () => {
    const user = storage.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        window.location.href = '../index.html';
        return;
    }

    const loadProducts = async () => {
        const tableBody = document.querySelector('#products-table tbody');
        try {
            const data = await productAPI.getAll();
            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">No products found.</td></tr>';
                return;
            }
            
            tableBody.innerHTML = data.data.map(p => `
                <tr>
                    <td style="display:flex; align-items:center; gap:15px;">
                        <img src="${p.image}" style="width:40px; height:40px; border-radius:5px; object-fit:cover;">
                        <div>
                            <div style="font-weight:600;">${p.name}</div>
                            <div style="font-size:0.8rem; color:#888;">${p.unit}</div>
                        </div>
                    </td>
                    <td style="text-transform:capitalize;">${p.category}</td>
                    <td style="font-weight:600;">₹${p.price}</td>
                    <td>
                        <span class="badge ${p.stock > 10 ? 'badge-success' : (p.stock > 0 ? 'badge-warning' : 'badge-danger')}">
                            ${p.stock} units
                        </span>
                    </td>
                    <td>
                        <button onclick="editProduct('${p._id}')" class="btn btn-outline btn-sm" style="margin-right:5px;"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteProduct('${p._id}')" class="btn btn-primary btn-sm" style="background:var(--danger-color); border-color:var(--danger-color);"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Failed to load products.</td></tr>`;
        }
    };

    window.toggleAddProductForm = () => {
        const form = document.getElementById('add-product-form');
        if (form.style.display === 'block') {
            form.style.display = 'none';
            document.getElementById('product-form').reset();
            document.getElementById('edit-product-id').value = '';
        } else {
            form.style.display = 'block';
        }
    };

    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-product-id').value;
        const productData = {
            name: document.getElementById('p-name').value,
            category: document.getElementById('p-category').value,
            description: document.getElementById('p-desc').value,
            price: document.getElementById('p-price').value,
            stock: document.getElementById('p-stock').value,
            unit: document.getElementById('p-unit').value,
            image: document.getElementById('p-image').value
        };

        try {
            if (id) {
                await productAPI.update(id, productData);
                alert('Product updated successfully!');
            } else {
                await productAPI.create(productData);
                alert('Product created successfully!');
            }
            toggleAddProductForm();
            loadProducts();
        } catch (err) {
            alert('Error saving product: ' + err.message);
        }
    });

    window.deleteProduct = async (id) => {
        if(confirm('Are you sure you want to delete this product?')) {
            try {
                await productAPI.delete(id);
                loadProducts();
            } catch(err) {
                alert('Failed to delete: ' + err.message);
            }
        }
    };
    
    // Globally expose product data for edit mode
    window.editProduct = async (id) => {
        try {
            const res = await productAPI.getById(id);
            const p = res.data;
            document.getElementById('edit-product-id').value = p._id;
            document.getElementById('p-name').value = p.name;
            document.getElementById('p-category').value = p.category;
            document.getElementById('p-desc').value = p.description;
            document.getElementById('p-price').value = p.price;
            document.getElementById('p-stock').value = p.stock;
            document.getElementById('p-unit').value = p.unit;
            document.getElementById('p-image').value = p.image;
            
            document.getElementById('add-product-form').style.display = 'block';
            document.getElementById('add-product-form').scrollIntoView({behavior: 'smooth'});
        } catch(err) {
            alert('Failed to fetch product details.');
        }
    };

    loadProducts();
});
