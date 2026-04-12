# Implementation Plan: Gurukrupa Krushi Kendra

We will build a full-stack agricultural management application using Vanilla HTML/CSS/JS for the frontend and Node.js/Express/MongoDB for the backend. The application will be organized into two main directories: `frontend/` and `backend/` inside the project workspace.

## User Review Required
> [!IMPORTANT]  
> Please review the proposed directory structure and technology choices. 
> Do you have a MongoDB Atlas connection string ready, or should I use a generic placeholder/local MongoDB connection for now? 
> Are you perfectly fine with standard fetch requests from the frontend to the backend REST API?

## Proposed Architecture

### Backend (`backend/`)
- **Node.js + Express**: RESTful API
- **Mongoose**: MongoDB object modeling
- **JWT + Bcrypt**: Secure role-based authentication
- **Multer**: For handling future image uploads (crop issues, products)

### Frontend (`frontend/`)
- **Vanilla web technologies**: HTML5, CSS3, ES6 JavaScript
- **Fetch API**: For communicating with the Node.js backend
- **Modular components**: Shared CSS and JS utilities
- **Responsive Design**: Mobile-first approach with a green agriculture-centric theme

## Implementation Phases

1. **Phase 1: Project Setup & Landing Page**
   - Initialize `frontend/` and `backend/` structures.
   - Build a responsive landing page with an auto-changing hero slider.
   - Implement the core agriculture-themed design system variables in CSS.

2. **Phase 2: Authentication System**
   - Build backend models for Users (Farmer, Admin, Staff).
   - Implement login/signup API with JWT generation and validation.
   - Create frontend authentication pages and wire them to the API (storing tokens in localStorage).

3. **Phase 3: Product & Catalog**
   - Create models and APIs for Products and Categories.
   - Build frontend product catalog and detail pages.

4. **Phase 4: Cart, Checkout, and Borrow System**
   - Implement localStorage cart.
   - Build order processing with options for "Pay at shop" and "Borrow" (Credit).
   - Update Farmer Dashboards to reflect outstanding borrow balances.

5. **Phase 5: Basic Admin Dashboard**
   - Create a secure admin layout with a sidebar.
   - Display basic statistics, product management (add/edit/delete), and order tracking.
   -give the admin the ability to add/edit/delete products and categories.
   -show the pending payments who took the products on credit
   -give the admin the ability to add/edit/delete staff members
   -give the admin the ability to add/edit/delete farmers
   -give the admin the ability to add/edit/delete orders
   -give the admin the ability to add/edit/delete products and categories.
   

## Verification Plan
### Automated Tests
- For backend: Use simple JS test runner scripts or node native `node:test` along with `supertest` to verify core API behavior.
- Use cURL or Postman equivalence to test endpoints during development.

### Manual Verification
1. **Landing Page**: Visually verify responsiveness and hero slider functionality in the browser.
2. **Auth Flow**: Register a Farmer, register an Admin, log in individually and check JWT presence in localStorage. 
3. **Core Functionality**: Create test products from Admin panel, add to cart as a Farmer, checkout using Borrow options, and verify that the Admin dashboard reflects the updated limits and stock.
