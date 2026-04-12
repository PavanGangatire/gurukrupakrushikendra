const fs = require('fs');
const path = require('path');
// Load environment variables from .env file if it exists locally
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const apiPath = path.join(__dirname, 'js', 'api.js');

try {
    let apiJsContent = fs.readFileSync(apiPath, 'utf-8');

    // Make sure you define API_URL in your Vercel Environment Variables or local .env
    // It will default to localhost if not found.
    const newUrl = process.env.API_URL || 'http://localhost:5000/api'; 

    apiJsContent = apiJsContent.replace(
        /const API_URL = '.*';/,
        `const API_URL = '${newUrl}';`
    );

    fs.writeFileSync(apiPath, apiJsContent);
    console.log('✅ Successfully injected API_URL into frontend/js/api.js:', newUrl);
} catch (error) {
    console.error('❌ Error updating api.js:', error.message);
    process.exit(1);
}
