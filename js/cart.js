// Simple localStorage Cart Implementation
const cartUtil = {
    getCart: () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },
    saveCart: (cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    },
    addItem: (id, name, price, image, quantity = 1) => {
        const user = storage.getUser();
        const token = storage.getToken();
        // Redirect to login if unauthenticated
        if (!user || !token) {
            window.location.href = 'login.html';
            return;
        }

        const currentCart = cartUtil.getCart();
        const existingItem = currentCart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            currentCart.push({ id, name, price, image, quantity });
        }
        
        cartUtil.saveCart(currentCart);
        alert(`${name} added to cart!`);
    },
    removeItem: (id) => {
        let cart = cartUtil.getCart();
        cart = cart.filter(item => item.id !== id);
        cartUtil.saveCart(cart);
    },
    updateQuantity: (id, change) => {
        let cart = cartUtil.getCart();
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
            cartUtil.saveCart(cart);
        }
    },
    clearCart: () => {
        localStorage.removeItem('cart');
        updateCartBadge();
    }
};

const updateCartBadge = () => {
    const cart = cartUtil.getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
    }
};

// Expose globally
window.addToCart = cartUtil.addItem;

// Initialize badge on load
document.addEventListener('DOMContentLoaded', updateCartBadge);
