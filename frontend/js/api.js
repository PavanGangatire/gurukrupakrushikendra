// Base configuration for API requests
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.startsWith('192.168.') || 
                window.location.hostname.startsWith('10.') || 
                window.location.hostname.startsWith('172.') ||
                window.location.protocol === 'file:';
const API_URL = isLocal ? 'http://127.0.0.1:5000/api' : 'https://gurukrupakrushikendra.onrender.com/api';

console.log('Environment:', isLocal ? 'Local' : 'Production');
console.log('API Endpoint:', API_URL);

// Utility functions for localStorage
const storage = {
    setToken: (token) => localStorage.setItem('token', token),
    getToken: () => localStorage.getItem('token'),
    removeToken: () => localStorage.removeItem('token'),
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    removeUser: () => localStorage.removeItem('user'),
    clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

// Generic fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const token = storage.getToken();
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.message || data.error || 'Something went wrong';
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// Auth API calls
const authAPI = {
    login: async (mobile, password) => {
        return await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ mobile, password })
        });
    },
    register: async (userData) => {
        return await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    me: async () => {
        return await apiFetch('/auth/me', {
            method: 'GET'
        });
    },
    updateProfile: async (userData) => {
        return await apiFetch('/auth/updatedetails', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
};

// Product API calls
const productAPI = {
    getAll: async (queryParams = '') => {
        let url = `/products${queryParams}`;
        return await apiFetch(url, {
            method: 'GET'
        });
    },
    getById: async (id) => {
        return await apiFetch(`/products/${id}`, {
            method: 'GET'
        });
    }
};

// Shop / Vendor API calls
const shopAPI = {
    getNearMe: async (location = {}) => {
        const { town, district, state, taluka } = location;
        let query = '?role=admin';
        if (town) query += `&town=${encodeURIComponent(town)}`;
        if (district) query += `&district=${encodeURIComponent(district)}`;
        if (state) query += `&state=${encodeURIComponent(state)}`;
        if (taluka) query += `&taluka=${encodeURIComponent(taluka)}`;
        
        return await apiFetch(`/auth/shops${query}`, {
            method: 'GET'
        });
    }
};

// Order API calls
const orderAPI = {
    create: async (orderData) => {
        return await apiFetch('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },
    pay: async (orderId, paymentResult) => {
        return await apiFetch(`/orders/${orderId}/pay`, {
            method: 'PUT',
            body: JSON.stringify(paymentResult)
        });
    },
    verifyPayment: async (paymentData) => {
        return await apiFetch('/orders/verify', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    },
    getRazorpayKey: async () => {
        const response = await fetch(`${API_URL}/config/razorpay`);
        return await response.text();
    },
    getOrder: async (id) => {
        return await apiFetch(`/orders/${id}`, {
            method: 'GET'
        });
    },
    getMyOrders: async () => {
        return await apiFetch('/orders/myorders', {
            method: 'GET'
        });
    },
    getAllOrders: async () => {
        return await apiFetch('/orders', {
            method: 'GET'
        });
    },
    payOrder: async (id) => {
        return await apiFetch(`/orders/${id}/pay`, {
            method: 'PUT'
        });
    }
};

// Admin API calls
const adminAPI = {
    getDashboard: async () => {
        return await apiFetch('/admin/dashboard', {
            method: 'GET'
        });
    },
    getFinancials: async () => {
        return await apiFetch('/admin/financials', {
            method: 'GET'
        });
    },
    getFarmers: async () => {
        return await apiFetch('/admin/farmers', {
            method: 'GET'
        });
    },
    getFarmerDetails: async (id) => {
        return await apiFetch(`/admin/farmers/${id}`, {
            method: 'GET'
        });
    },
    settleCredit: async (id, amount) => {
        return await apiFetch(`/admin/farmers/${id}/settle`, {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
    }
};

const issueAPI = {
    create: async (issueData) => {
        return await apiFetch('/issues', {
            method: 'POST',
            body: JSON.stringify(issueData)
        });
    },
    getMyIssues: async () => {
        return await apiFetch('/issues/myissues', {
            method: 'GET'
        });
    },
    getAll: async () => {
        return await apiFetch('/issues', {
            method: 'GET'
        });
    },
    respond: async (id, responseData) => {
        return await apiFetch(`/issues/${id}/respond`, {
            method: 'PUT',
            body: JSON.stringify(responseData)
        });
    }
};

const uploadAPI = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const token = storage.getToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers,
            body: formData
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Image upload failed');
        }

        return await response.json();
    }
};

const purchaseAPI = {
    getAll: async () => {
        return await apiFetch('/purchases', {
            method: 'GET'
        });
    },
    create: async (purchaseData) => {
        return await apiFetch('/purchases', {
            method: 'POST',
            body: JSON.stringify(purchaseData)
        });
    },
    bulkCreate: async (purchaseItems) => {
        return await apiFetch('/purchases/bulk', {
            method: 'POST',
            body: JSON.stringify({ items: purchaseItems })
        });
    }
};

const expenseAPI = {
    getAll: async () => {
        return await apiFetch('/expenses', {
            method: 'GET'
        });
    },
    create: async (expenseData) => {
        return await apiFetch('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
    }
};
