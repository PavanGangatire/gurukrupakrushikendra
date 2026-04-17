document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    const showError = (msg, containerId = 'error-msg') => {
        const errorEl = document.getElementById(containerId);
        if(errorEl) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
            setTimeout(() => { errorEl.style.display = 'none'; }, 6000);
        }
    };

    const handleAuthSuccess = (data) => {
        storage.setToken(data.token);
        storage.setUser(data.user);
        
        // Redirect based on role
        if (data.user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (data.user.role === 'staff') {
            window.location.href = 'staff-dashboard.html';
        } else {
            // New logic: If farmer has no shop selected, stay on dashboard for shop selection
            window.location.href = 'farmer-dashboard.html';
        }
    };

    // Unified login handler
    const loginHandler = async (e) => {
        e.preventDefault();
        const mobile = document.getElementById('mobile').value.trim();
        const password = document.getElementById('password').value.trim();
        const roleEl = document.getElementById('login-role') || document.getElementById('role');
        const role = roleEl ? roleEl.value : 'farmer';
        const btn = document.getElementById('login-btn');
        const isAdminPortal = (role === 'admin' || role === 'staff');
        
        try {
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'Verifying Account...';
            
            console.log(`Attempting login for ${mobile} on ${role} portal...`);
            const data = await authAPI.login(mobile, password);
            
            // Validate role matches toggle
            if (isAdminPortal && data.user.role !== 'admin' && data.user.role !== 'staff') {
                console.warn('Role mismatch: User is not an admin/staff');
                throw new Error('Invalid credentials.');
            }
            if (!isAdminPortal && data.user.role !== 'farmer') {
                console.warn('Role mismatch: User is an admin/staff trying to login as farmer');
                throw new Error('Invalid credentials.');
            }

            handleAuthSuccess(data);
        } catch (err) {
            console.error('Login error:', err.message);
            showError(err.message || 'Login failed', 'error-msg');
            btn.disabled = false;
            btn.textContent = 'Retry Login';
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', loginHandler);
    }

    if (signupForm) {
        const roleInput = document.getElementById('role');
        const roleFarmerBtn = document.getElementById('role-farmer');
        const roleAdminBtn = document.getElementById('role-admin');
        const shopGroup = document.getElementById('shop-name-group');

        // Toggle UI
        if(roleFarmerBtn && roleAdminBtn) {
            roleFarmerBtn.onclick = () => {
                roleInput.value = 'farmer';
                shopGroup.style.display = 'none';
                roleFarmerBtn.style.background = 'var(--primary-color)';
                roleFarmerBtn.style.color = '#fff';
                roleAdminBtn.style.background = 'transparent';
                roleAdminBtn.style.color = '#555';
            };
            roleAdminBtn.onclick = () => {
                roleInput.value = 'admin';
                shopGroup.style.display = 'block';
                roleAdminBtn.style.background = '#1a237e';
                roleAdminBtn.style.color = '#fff';
                roleFarmerBtn.style.background = 'transparent';
                roleFarmerBtn.style.color = '#555';
            };
        }

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Helper to get value or undefined
            const val = (id) => {
                const el = document.getElementById(id);
                return el ? el.value.trim() : undefined;
            };

            const payload = {
                name: val('name'),
                mobile: val('mobile'),
                state: val('state'),
                district: val('district'),
                taluka: val('taluka'),
                town: val('town'),
                village: val('village'),
                password: val('password'),
                role: roleInput.value
            };

            if (payload.role === 'admin') {
                payload.shopName = val('shopName') || val('shop-name');
                // Don't block if shopName is missing here, the backend will catch it if required, 
                // but let's be safe for owner portal
                if(!payload.shopName && document.getElementById('shopName')) {
                    return showError('Shop Name is required for owners', 'error-msg');
                }
            }
            
            try {
                const btn = document.getElementById('signup-btn');
                btn.disabled = true;
                btn.textContent = 'Creating Account...';
                const data = await authAPI.register(payload);
                handleAuthSuccess(data);
            } catch (err) {
                showError(err.message || 'Registration failed', 'error-msg');
                document.getElementById('signup-btn').disabled = false;
                document.getElementById('signup-btn').textContent = 'Register & Start Browsing';
            }
        });
    }

    // Auth check on protected pages
    const checkAuthStatus = () => {
        const token = storage.getToken();
        const user = storage.getUser();
        
        // Setup navbar login/logout
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            if (token && user) {
                const isPages = window.location.pathname.includes('/pages/');
                const cartLink = isPages ? 'cart' : 'pages/cart';
                const dashboardLink = user.role === 'admin' ? 
                    (isPages ? 'admin-dashboard' : 'pages/admin-dashboard') : 
                    (isPages ? 'farmer-dashboard' : 'pages/farmer-dashboard');

                let cartHtml = '';
                if (user.role === 'farmer') {
                    cartHtml = `
                        <a href="${cartLink}" style="position:relative; margin-right: 25px; font-size: 1.4rem; color: var(--primary-dark); display: flex; align-items: center;">
                            <i class="fa-solid fa-cart-shopping"></i>
                            <span id="cart-count" style="position:absolute; top:-8px; right:-12px; background:var(--danger-color); color:#fff; font-size:11px; font-weight:bold; height:20px; width:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; border: 2px solid #fff;">0</span>
                        </a>
                    `;
                }

                navActions.innerHTML = `
                    <div style="display:flex; align-items:center;">
                        ${cartHtml}
                        <span style="font-weight:500; margin-right: 15px;">Hi, ${user.name}</span>
                        <a href="${dashboardLink}" class="btn btn-outline" style="margin-right:10px;">Dashboard</a>
                        <button onclick="logout()" class="btn btn-primary">Logout</button>
                    </div>
                `;
            } else {
                navActions.innerHTML = `
                    <a href="pages/login.html" class="btn btn-outline">Login</a>
                    <a href="#categories" class="btn btn-primary">Browse Products</a>
                `;
                // Try adjusting path if already in pages directory
                if(window.location.pathname.includes('/pages/')) {
                    navActions.innerHTML = `
                        <a href="login.html" class="btn btn-outline">Login</a>
                        <a href="products.html" class="btn btn-primary">Browse Products</a>
                    `;
                }
            }
        }
    };

    // Export logout globally
    window.logout = () => {
        storage.clearAuth();
        window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
    };

    checkAuthStatus();
});
