document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort-select');
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    const clearFiltersBtn = document.getElementById('clear-filters');

    let currentFilters = {
        category: '',
        search: '',
        sort: '-createdAt'
    };

    // Pre-select category from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    if (catParam) {
        currentFilters.category = catParam.charAt(0).toUpperCase() + catParam.slice(1);
        const categoryRadios = document.querySelectorAll('input[name="category"]');
        categoryRadios.forEach(radio => {
            if (radio.value === currentFilters.category) radio.checked = true;
        });
    }

    // Check for active shop
    const selectedShopId = localStorage.getItem('selectedShopId');
    const selectedShopName = localStorage.getItem('selectedShopName');

    if (!selectedShopId && !window.location.pathname.includes('admin')) {
        // If not admin and no shop selected, redirect to dashboard for selection
        window.location.href = 'farmer-dashboard.html';
        return;
    }

    const loadProducts = async () => {
        if(!productsContainer) return;
        
        // Update header if exists
        const header = document.querySelector('.page-header h2');
        if (header && selectedShopName) {
            header.innerHTML = `<i class="fa-solid fa-store"></i> ${selectedShopName}`;
            const sub = document.createElement('p');
            sub.style.fontSize = '1rem';
            sub.style.opacity = '0.8';
            sub.textContent = 'Browsing local inventory';
            header.appendChild(sub);
        }

        productsContainer.innerHTML = '<div class="loader"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>';
        
        try {
            // Build query string safely
            let params = [];
            if (currentFilters.category) params.push(`category=${encodeURIComponent(currentFilters.category)}`);
            if (currentFilters.search) params.push(`search=${encodeURIComponent(currentFilters.search)}`);
            if (currentFilters.sort) params.push(`sort=${encodeURIComponent(currentFilters.sort)}`);
            
            let query = params.length > 0 ? '?' + params.join('&') : '';

            const data = await productAPI.getAll(query, selectedShopId);
            
            if (data.data.length === 0) {
                productsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; background:#fff; border-radius:10px;"><h3>No products found perfectly matching your criteria.</h3></div>';
                return;
            }

            renderProducts(data.data);
        } catch (err) {
            productsContainer.innerHTML = `<div style="grid-column: 1/-1; color:red; text-align:center;">Failed to load products: ${err.message}</div>`;
        }
    };

    const renderProducts = (products) => {
        if(!productsContainer) return;
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-img" style="object-fit:cover;">
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">₹${product.price} <span style="font-size:0.8rem; color:#888;">per ${product.unit || 'unit'}</span></div>
                    <div class="product-actions" style="display:flex; gap:10px; align-items:center;">
                        <input type="number" id="qty-${product._id}" value="1" min="1" style="width: 50px; padding: 8px 5px; text-align: center; border: 1px solid #ddd; border-radius: 5px; flex-shrink: 0;" title="Quantity">
                        <button class="btn btn-primary btn-add-cart" style="flex:1;" onclick="addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image}', parseInt(document.getElementById('qty-${product._id}').value) || 1)">Add to Cart</button>
                        <a href="product-detail?id=${product._id}" class="btn btn-outline" style="text-align:center; text-decoration:none; padding: 8px 12px;" title="View Information"><i class="fa-solid fa-circle-info"></i></a>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // Event Listeners
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentFilters.search = searchInput.value;
            loadProducts();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                currentFilters.search = searchInput.value;
                loadProducts();
            }
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sort = e.target.value;
            loadProducts();
        });
    }

    categoryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            loadProducts();
        });
    });

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentFilters = { category: '', search: '', sort: '-createdAt' };
            searchInput.value = '';
            sortSelect.value = '-createdAt';
            categoryRadios.forEach(radio => {
                if (radio.value === '') radio.checked = true;
            });
            loadProducts();
        });
    }

    // Initialize
    loadProducts();
});
