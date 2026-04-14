
import http from 'http';

const endpoints = [
    '/api/users',
    '/api/orders',
    '/api/all-followers',
    '/api/votes/7BqWaG4PXUYwUuoQe13P24xe7xs1',
    '/api/user-followed-vendors/7BqWaG4PXUYwUuoQe13P24xe7xs1',
    '/api/notifications/7BqWaG4PXUYwUuoQe13P24xe7xs1'
];

async function test() {
    for (const endpoint of endpoints) {
        console.log(`Testing ${endpoint}...`);
        try {
            const res = await new Promise((resolve, reject) => {
                http.get(`http://localhost:3000${endpoint}`, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => resolve({ statusCode: res.statusCode, data }));
                }).on('error', reject);
            });
            console.log(JSON.stringify(res));
        } catch (e) {
            console.error(`Failed ${endpoint}:`, e);
        }
    }
}

test();
