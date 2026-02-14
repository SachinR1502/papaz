const fetch = global.fetch || require('node-fetch');

const API_URL = 'http://localhost:8082/api';

// Helper to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Randomized User Data
const timestamp = Date.now();
// Use seeded users for consistent state (Wallet balance etc)
const TECH_PHONE = '9999999999';
const CUST_PHONE = '9876543210';

async function request(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    console.log(`[REQ] ${method} ${endpoint}`);
    const res = await fetch(`${API_URL}${endpoint}`, options);

    // Log response status
    console.log(`[RES] ${res.status} ${res.statusText}`);

    if (res.status === 204) return null;

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Request failed');
    }
    return data && data.data ? data.data : data;
    // Handle ApiResponse structure { success: true, data: ... } or direct return
}

async function authenticate(phone, role) {
    console.log(`\n--- Authenticating ${role} (${phone}) ---`);
    // 1. Send OTP (Register flow to ensure user exists)
    await request('/auth/send-otp', 'POST', {
        phoneNumber: phone,
        role,
        isRegister: false // Seeded users exist, use login flow
    });

    // 2. Verify OTP (using default '1234' for dev environment)
    const verifyRes = await request('/auth/verify-otp', 'POST', {
        phoneNumber: phone,
        otp: '1234'
    });

    const token = verifyRes.token;
    const userId = verifyRes._id;
    console.log(`Authenticated! Token: ${token.slice(0, 15)}...`);

    // 3. Update Profile to ensure active status
    if (role === 'technician') {
        await request('/auth/profile', 'POST', {
            fullName: `Genius Tech ${phone.slice(-4)}`,
            garageName: `Garrage ${phone.slice(-4)}`,
            location: {
                latitude: 19.0760,
                longitude: 72.8777
            },
            isOnline: true,
            serviceRadius: 50
        }, token);
    } else {
        await request('/auth/profile', 'POST', {
            fullName: `Happy Customer ${phone.slice(-4)}`
        }, token);
    }

    return { token, userId, ...verifyRes };
}

async function runTest() {
    try {
        console.log("=== STARTING WALK-IN FLOW TEST ===");

        // 1. Setup Technician
        const tech = await authenticate(TECH_PHONE, 'technician');
        // Need to get the Technician Profile ID (not User ID) for job assignment
        // The verify response includes 'profile' if it exists.
        let techProfileId = tech.profile?._id || tech.profile?.id;

        if (!techProfileId) {
            // Profile might have been created in the updateProfile step, let's fetch 'me'
            const me = await request('/auth/me', 'GET', null, tech.token);
            techProfileId = me.profile._id;
        }
        console.log(`Technician Profile ID: ${techProfileId}`);


        // 2. Setup Customer
        const customer = await authenticate(CUST_PHONE, 'customer');

        // 3. Create Vehicle for Customer
        console.log("\n--- Creating Vehicle ---");
        const vehicle = await request('/customer/vehicles', 'POST', {
            make: 'Toyota',
            model: 'Corolla',
            registrationNumber: `MH02${timestamp.toString().slice(-6)}`,
            year: 2022,
            vehicleType: 'Car',
            fuelType: 'Petrol'
        }, customer.token);
        console.log(`Vehicle Created: ${vehicle.make} ${vehicle.model} (${vehicle.id || vehicle._id})`);
        const vehicleId = vehicle.id || vehicle._id;

        // 4. Create "Walk-in" Job
        console.log("\n--- Creating Walk-in Job ---");
        const job = await request('/customer/jobs', 'POST', {
            vehicleId: vehicleId,
            description: "Check engine light is on (Walk-in Test)",
            serviceType: 'repairs',
            serviceMethod: 'walk_in',
            isBroadcast: false, // Critical for walk-in/direct
            technicianId: techProfileId, // Direct assignment
            location: {
                latitude: 19.0760,
                longitude: 72.8777,
                address: "Mumbai Central"
            }
        }, customer.token);

        console.log(`Job Created! ID: ${job.id || job._id}`);
        console.log(`Job Status: ${job.status}`);
        console.log(`Job Tech ID: ${job.technician}`);

        if (job.status !== 'pending') throw new Error(`Expected status 'pending', got '${job.status}'`);
        if (job.technician !== techProfileId) throw new Error(`Expected technician '${techProfileId}', got '${job.technician}'`);

        // --- End Walk-in Flow ---


        // 5. Create "On-Spot" Job (Broadcast)
        console.log("\n--- Creating On-Spot Job (Broadcast) ---");
        const onSpotJob = await request('/customer/jobs', 'POST', {
            vehicleId: vehicleId,
            description: "Flat tire (On-Spot Test)",
            serviceType: 'repairs',
            serviceMethod: 'on_spot',
            isBroadcast: true, // Should be broadcast
            // No technicianId for broadcast
            location: {
                latitude: 19.0760,
                longitude: 72.8777,
                address: "Highway Road"
            }
        }, customer.token);

        console.log(`On-Spot Job Created! ID: ${onSpotJob.id || onSpotJob._id}`);
        console.log(`Is Broadcast: ${onSpotJob.isBroadcast}`);
        console.log(`Technician: ${onSpotJob.technician}`);

        if (onSpotJob.isBroadcast !== true) throw new Error("Expected isBroadcast to be true for On-Spot");
        if (onSpotJob.technician !== null) throw new Error("Expected technician to be null for Broadcast job");


        // 6. Create "Home Pickup" Job (Broadcast)
        console.log("\n--- Creating Home Pickup Job (Broadcast) ---");
        const pickupJob = await request('/customer/jobs', 'POST', {
            vehicleId: vehicleId,
            description: "General Service (Pickup Test)",
            serviceType: 'maintenance',
            serviceMethod: 'home_pickup',
            isBroadcast: true, // Should be broadcast by default unless specific garage picked
            location: {
                latitude: 19.0760,
                longitude: 72.8777,
                address: "Home Address"
            }
        }, customer.token);

        console.log(`Pickup Job Created! ID: ${pickupJob.id || pickupJob._id}`);
        if (pickupJob.isBroadcast !== true) throw new Error("Expected isBroadcast to be true for Home Pickup");


        // 7. Technician Fetches Jobs
        console.log("\n--- Technician Checking Jobs ---");
        const techJobs = await request('/technician/jobs', 'GET', null, tech.token);

        // Check "My Jobs" or "available" (Direct assignments should ideally be in myJobs or available but visible)
        // Based on controller: myJobs = ServiceRequest.find({ technician: technician._id })
        const myJobs = techJobs.myJobs || [];
        const available = techJobs.available || [];

        console.log(`My Jobs: ${myJobs.length}, Available: ${available.length}`);

        console.log(`My Jobs IDs: ${myJobs.map(j => j._id || j.id).join(', ')}`);

        // Validation:
        // Walk-In Job -> Should be in My Jobs (Direct)
        // On-Spot Job -> Should be in Available (Broadcast)
        // Pickup Job -> Should be in Available (Broadcast)

        const foundWalkIn = myJobs.find(j => String(j._id || j.id) === String(job.id || job._id));
        const foundOnSpot = available.find(j => String(j._id || j.id) === String(onSpotJob.id || onSpotJob._id));
        const foundPickup = available.find(j => String(j._id || j.id) === String(pickupJob.id || pickupJob._id));

        if (!foundWalkIn) throw new Error("Technician cannot see the Walk-in job in 'My Jobs'!");
        console.log("SUCCESS: Walk-in job found in 'My Jobs'");

        if (!foundOnSpot) throw new Error("Technician cannot see the On-Spot job in 'Available'!");
        console.log("SUCCESS: On-Spot job found in 'Available'");

        if (!foundPickup) throw new Error("Technician cannot see the Pickup job in 'Available'!");
        console.log("SUCCESS: Pickup job found in 'Available'");


        // 8. Technician Accepts On-Spot Job
        console.log("\n--- Technician Accepting On-Spot Job ---");
        const acceptedOnSpot = await request(`/technician/jobs/${onSpotJob.id || onSpotJob._id}/accept`, 'POST', null, tech.token);
        console.log(`On-Spot Job Accepted! New Status: ${acceptedOnSpot.status}`);
        if (acceptedOnSpot.status !== 'accepted') throw new Error(`Expected status 'accepted', got '${acceptedOnSpot.status}'`);



        // 9. Technician Sends Quote
        console.log("\n--- Technician Sending Quote ---");
        const quoteItems = [
            {
                description: "On-Spot Service Fee",
                quantity: 1,
                unitPrice: 199,
                total: 199,
                isCustom: false,
                isNote: false
            },
            {
                description: "Oil Filter",
                quantity: 1,
                unitPrice: 350,
                total: 350,
                isCustom: false,
                isNote: false
            },
            {
                description: "Important Note: Engine needs checkup",
                quantity: 1,
                unitPrice: 9999, // Should be ignored
                total: 9999,     // Should be ignored/reset to 0
                isCustom: true,
                isNote: true
            }
        ];

        console.log("Sending Quote with Note item (testing backend enforcement of 0 total)...");

        await request(`/technician/jobs/${acceptedOnSpot.id || acceptedOnSpot._id}/quote`, 'POST', {
            items: quoteItems,
            laborAmount: 500,
            note: "Checking engine health",
            photos: [],
            voiceNote: null
        }, tech.token);
        console.log("Quote Sent Successfully!");

        // 10. Customer Checks Quote
        console.log("\n--- Customer Checking Quote ---");
        // Customer fetches job details
        // Customer typically uses getDashboard or getJob specific endpoint if exists. 
        // Based on customerRoutes, getDashboard returns active job or recent jobs. Or getJobHistory.
        // Actually, there isn't a direct GET /jobs/:id for customer in the routes list above, 
        // but typically dashboard or history would return it.

        const custDashboard = await request('/customer/dashboard', 'GET', null, customer.token);
        const activeJobs = custDashboard && custDashboard.activeJobs ? custDashboard.activeJobs : [];
        const activeJob = activeJobs.find(j => String(j.id || j._id) === String(acceptedOnSpot.id || acceptedOnSpot._id));

        if (!activeJob) {
            console.log("Warning: Specific active job not found in dashboard list.");
        } else {
            if (activeJob.status !== 'quote_pending') throw new Error(`Expected status 'quote_pending', got '${activeJob.status}'`);
            console.log("Customer sees status: quote_pending");

            // Check Quote Items
            if (activeJob.quote && activeJob.quote.items) {
                const qItems = activeJob.quote.items;
                if (qItems.length !== 3) throw new Error(`Expected 3 quote items, got ${qItems.length}`);

                // Verify Service Fee
                const feeItem = qItems.find(i => i.description === 'On-Spot Service Fee');
                if (!feeItem || feeItem.total !== 199) throw new Error('Service Fee verification failed');

                // Verify Note Item
                const noteItem = qItems.find(i => i.isNote === true);
                if (!noteItem || noteItem.description !== 'Important Note: Engine needs checkup') throw new Error('Note item verification failed');
                if (noteItem.total !== 0) throw new Error(`Note item should have 0 total, got ${noteItem.total}`);

                console.log("Quote items verified successfully (Fee, Standard, Note)");

                // Verify Quote Total
                // 199 + 350 + 500 (Labor) = 1049
                if (activeJob.quote.totalAmount !== 1049) throw new Error(`Expected Quote Total 1049, got ${activeJob.quote.totalAmount}`);
            }
        }

        // 11. Customer Accepts Quote
        console.log("\n--- Customer Accepting Quote ---");
        await request(`/customer/jobs/${acceptedOnSpot.id || acceptedOnSpot._id}/quote/respond`, 'POST', {
            action: 'accept_with_parts'
        }, customer.token);
        console.log("Quote Accepted!");

        // 12. Technician Sends Bill
        console.log("\n--- Technician Sending Bill ---");
        // Reuse same items (including note) for bill
        await request(`/technician/jobs/${acceptedOnSpot.id || acceptedOnSpot._id}/bill`, 'POST', {
            items: quoteItems,
            laborAmount: 500,
            note: "Job completed",
            photos: [],
            voiceNote: null
        }, tech.token);
        console.log("Bill Sent Successfully!");

        // 13. Customer Checks Bill
        console.log("\n--- Customer Checking Bill ---");
        const custDashboard2 = await request('/customer/dashboard', 'GET', null, customer.token);
        const activeJobs2 = custDashboard2 && custDashboard2.activeJobs ? custDashboard2.activeJobs : [];
        const activeJob2 = activeJobs2.find(j => String(j.id || j._id) === String(acceptedOnSpot.id || acceptedOnSpot._id));

        if (activeJob2) {
            console.log(`Job Status after bill: ${activeJob2.status}`);
            if (activeJob2.status !== 'billing_pending') throw new Error(`Expected status 'billing_pending', got '${activeJob2.status}'`);

            // Verify Bill Total
            // 199 + 350 + 0 + 500 = 1049
            const expectedTotal = 1049;
            if (activeJob2.bill.totalAmount !== expectedTotal) {
                throw new Error(`Expected bill total ${expectedTotal}, got ${activeJob2.bill.totalAmount}`);
            }
            console.log(`Bill Verified! Total: ${activeJob2.bill.totalAmount}`);
            console.log(`Bill Verified! Total: ${activeJob2.bill.totalAmount}`);
        } else {
            console.log("Warning: Job not found to verify bill.");
        }

        // 14. Customer Pays Bill (Wallet)
        console.log("\n--- Customer Paying Bill (Wallet) ---");
        await request(`/customer/jobs/${acceptedOnSpot.id || acceptedOnSpot._id}/bill/respond`, 'POST', {
            action: 'approve',
            paymentMethod: 'wallet'
        }, customer.token);
        console.log("Payment Successful via Wallet!");

        // 15. Verify Job Completed
        console.log("\n--- Verifying Job Completion ---");
        const custDashboard3 = await request('/customer/dashboard', 'GET', null, customer.token);
        // Completed jobs might not be in activeJobs, check history if separate endpoint exists
        // But dashboard usually returns active jobs. If status is completed, it might disappear from active list.
        // Let's check history endpoint if available or check if it's still in activeJobs with status 'completed'

        // Based on controller, activeJobs filters status: { $ne: 'completed' }
        // So it should be GONE from activeJobs.

        const activeJobs3 = custDashboard3 && custDashboard3.activeJobs ? custDashboard3.activeJobs : [];
        const activeJob3 = activeJobs3.find(j => String(j.id || j._id) === String(acceptedOnSpot.id || acceptedOnSpot._id));

        if (activeJob3) {
            throw new Error(`Job should be removed from active jobs, but found with status: ${activeJob3.status}`);
        }
        console.log("Job correctly removed from Active Jobs list (Completed).");

        console.log("\n=== ALL TEST SCENARIOS PASSED SUCCESSFULLY ===");

    } catch (error) {
        console.error("\n!!! TEST FAILED !!!");
        console.error(error);
    }
}

runTest();
