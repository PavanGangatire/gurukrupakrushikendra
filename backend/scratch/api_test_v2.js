const http = require('http');

const endpoints = [
    { name: 'Root/Health', path: '/', method: 'GET' },
    { name: 'Products List', path: '/api/products', method: 'GET' },
    { name: 'Auth Check', path: '/api/auth/profile', method: 'GET' }, // Might fail without token, but check response type
];

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: endpoint.path,
            method: endpoint.method,
            timeout: 2000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    name: endpoint.name,
                    status: res.statusCode,
                    success: res.statusCode >= 200 && res.statusCode < 400,
                    data: data.slice(0, 100) + (data.length > 100 ? '...' : '')
                });
            });
        });

        req.on('error', (err) => {
            resolve({
                name: endpoint.name,
                status: 'Error',
                success: false,
                data: err.message
            });
        });

        req.end();
    });
}

async function runTests() {
    console.log('--- API Test Results ---');
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        console.log(`[${result.success ? 'PASS' : 'FAIL'}] ${result.name} (${endpoint.path}) - Status: ${result.status}`);
        if (!result.success) console.log(`   Response: ${result.data}`);
    }
    process.exit(0);
}

runTests();
