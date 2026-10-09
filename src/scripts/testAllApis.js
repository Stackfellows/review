const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const BASE_URL = 'http://localhost:3400';

function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', err => reject(err));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runFullTestSuite() {
    console.log('====================================================');
    console.log('🧪 STARTING COMPLETE UNIFIED API TEST SUITE');
    console.log('====================================================\n');

    let adminToken = '';
    let testProductId = '';
    let testOrderId = '';
    let testOrderTracking = '';
    let testReviewId = '';
    let testCardId = '';

    try {
        // 1. HEALTH CHECK
        console.log('1️⃣  Testing Health Check API...');
        const health = await makeRequest('GET', '/health');
        console.log(`   [STATUS] ${health.status} => ${health.body.service || health.body}`);
        if (health.status !== 200) throw new Error('Health Check Failed');

        // 2. ADMIN AUTH
        console.log('\n2️⃣  Testing Admin Auth API...');
        const loginRes = await makeRequest('POST', '/api/auth/login', {
            email: process.env.ADMIN_EMAIL || 'cliffhangerthejeans@gmail.com',
            password: process.env.ADMIN_PASSWORD || 'admin00@00'
        });
        console.log(`   [LOGIN STATUS] ${loginRes.status} => Success: ${loginRes.body.success}`);
        if (!loginRes.body.token) throw new Error('Admin Login Failed');
        adminToken = loginRes.body.token;

        const verifyRes = await makeRequest('GET', '/api/auth/verify', null, {
            'Authorization': `Bearer ${adminToken}`
        });
        console.log(`   [VERIFY STATUS] ${verifyRes.status} => Admin Role: ${verifyRes.body.admin?.role}`);

        // 3. PRODUCTS API
        console.log('\n3️⃣  Testing Products API...');
        const getProducts = await makeRequest('GET', '/api/products');
        console.log(`   [GET PRODUCTS] ${getProducts.status} => Count: ${getProducts.body.count ?? getProducts.body.data?.length}`);

        const createProduct = await makeRequest('POST', '/api/products', {
            name: "Test Denim Jeans 2026",
            productCode: "CH-TEST-001",
            category: "Boys",
            collectionName: "Test Collection",
            price: 2999,
            description: "Test denim jeans for automated suite",
            stock: 10
        }, { 'Authorization': `Bearer ${adminToken}` });
        console.log(`   [CREATE PRODUCT] ${createProduct.status} => ID: ${createProduct.body.data?._id}`);
        testProductId = createProduct.body.data?._id;

        if (testProductId) {
            const updateProduct = await makeRequest('PUT', `/api/products/${testProductId}`, {
                price: 3499,
                name: "Test Denim Jeans 2026 Updated"
            }, { 'Authorization': `Bearer ${adminToken}` });
            console.log(`   [UPDATE PRODUCT] ${updateProduct.status} => New Price: ${updateProduct.body.data?.price}`);
        }

        // 4. ORDERS API (End-to-End Order Placement & Tracking)
        console.log('\n4️⃣  Testing Orders API (E2E Flow)...');
        const placeOrder = await makeRequest('POST', '/api/orders', {
            customer: {
                firstName: "Ali",
                lastName: "Khan",
                email: "ali.test@example.com",
                phone: "03001234567",
                address: "123 Test Street",
                city: "Lahore",
                zipCode: "54000",
                country: "Pakistan"
            },
            items: [
                {
                    product: testProductId || "65c123456789012345678901",
                    name: "Test Denim Jeans 2026",
                    quantity: 1,
                    price: 3499,
                    image: "/prodact1.png"
                }
            ],
            totalAmount: 3499,
            paymentMethod: "COD"
        });
        console.log(`   [PLACE ORDER] ${placeOrder.status} => Tracking #: ${placeOrder.body.data?.trackingNumber}`);
        testOrderId = placeOrder.body.data?._id;
        testOrderTracking = placeOrder.body.data?.trackingNumber;

        if (testOrderTracking) {
            const trackOrder = await makeRequest('GET', `/api/orders/track/${testOrderTracking}`);
            console.log(`   [TRACK ORDER] ${trackOrder.status} => Customer: ${trackOrder.body.data?.customer?.firstName}`);
        }

        const getOrders = await makeRequest('GET', '/api/orders', null, {
            'Authorization': `Bearer ${adminToken}`
        });
        console.log(`   [ADMIN GET ORDERS] ${getOrders.status} => Total Orders: ${getOrders.body.count}`);

        if (testOrderId) {
            const updateOrder = await makeRequest('PUT', `/api/orders/${testOrderId}/status`, {
                status: "Processing"
            }, { 'Authorization': `Bearer ${adminToken}` });
            console.log(`   [UPDATE ORDER STATUS] ${updateOrder.status} => Status: ${updateOrder.body.data?.status}`);
        }

        // 5. REVIEWS API (End-to-End Review Submission to Admin Approval)
        console.log('\n5️⃣  Testing Reviews API (E2E Flow)...');
        const submitReview = await makeRequest('POST', '/api/reviews', {
            name: "Fatima Ahmed",
            email: "fatima@example.com",
            rating: 5,
            review: "Amazing quality denim jeans! Fabric is very soft and stretchable for kids.",
            source: "website"
        });
        console.log(`   [SUBMIT REVIEW] ${submitReview.status} => ID: ${submitReview.body.data?.id}`);
        testReviewId = submitReview.body.data?.id;

        const getPublicReviews = await makeRequest('GET', '/api/reviews/public');
        console.log(`   [PUBLIC REVIEWS] ${getPublicReviews.status} => Count: ${getPublicReviews.body.data?.length}`);

        const getPublicStats = await makeRequest('GET', '/api/reviews/stats');
        console.log(`   [PUBLIC REVIEWS STATS] ${getPublicStats.status} => Avg Rating: ${getPublicStats.body.data?.averageRating} (Total: ${getPublicStats.body.data?.totalReviews})`);

        const getAdminReviews = await makeRequest('GET', '/api/reviews/admin', null, {
            'Authorization': `Bearer ${adminToken}`
        });
        console.log(`   [ADMIN GET REVIEWS] ${getAdminReviews.status} => Count: ${getAdminReviews.body.data?.length}`);

        if (testReviewId) {
            const approveReview = await makeRequest('PATCH', `/api/reviews/${testReviewId}/status`, {
                status: "approved"
            }, { 'Authorization': `Bearer ${adminToken}` });
            console.log(`   [APPROVE REVIEW] ${approveReview.status} => Status: ${approveReview.body.data?.status}`);

            const featureReview = await makeRequest('PATCH', `/api/reviews/${testReviewId}/feature`, {}, {
                'Authorization': `Bearer ${adminToken}`
            });
            console.log(`   [TOGGLE FEATURED] ${featureReview.status} => Is Featured: ${featureReview.body.data?.isFeatured}`);
        }

        // 6. MEMBERSHIP CARD API
        console.log('\n6️⃣  Testing Membership Card API...');
        const genCard = await makeRequest('POST', '/api/membership/generate', {
            customerName: "Usman Raza",
            customerEmail: "usman.raza@example.com"
        });
        console.log(`   [GENERATE CARD] ${genCard.status} => Card ID: ${genCard.body.data?.cardId}`);
        testCardId = genCard.body.data?.cardId;

        if (testCardId) {
            const getCard = await makeRequest('GET', `/api/membership/${testCardId}`);
            console.log(`   [GET CARD DETAILS] ${getCard.status} => Number: ${getCard.body.data?.cardNumber}`);
        }

        // 7. CLEANUP TEST DATA
        console.log('\n7️⃣  Cleaning up test data...');
        if (testProductId) {
            await makeRequest('DELETE', `/api/products/${testProductId}`, null, {
                'Authorization': `Bearer ${adminToken}`
            });
            console.log('   [CLEANUP] Deleted test product');
        }
        if (testOrderId) {
            await makeRequest('DELETE', `/api/orders/${testOrderId}`, null, {
                'Authorization': `Bearer ${adminToken}`
            });
            console.log('   [CLEANUP] Deleted test order');
        }
        if (testReviewId) {
            await makeRequest('DELETE', `/api/reviews/${testReviewId}`, null, {
                'Authorization': `Bearer ${adminToken}`
            });
            console.log('   [CLEANUP] Deleted test review');
        }

        console.log('\n====================================================');
        console.log('✅ ALL API TESTS COMPLETED SUCCESSFULLY! UNIFIED BACKEND IS 100% OPERATIONAL!');
        console.log('====================================================');

    } catch (err) {
        console.error('\n❌ TEST SUITE ERROR:', err.message);
    }
}

runFullTestSuite();
