const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testStaffDeletion() {
    try {
        console.log("1. Creating Dummy Doctor...");
        const staffRes = await axios.post(`${API_URL}/admin/staff`, {
            name: "Test Doctor DELETE_ME",
            role: "DOCTOR",
            specialization: "General",
            passcode: "0000",
            displayId: "DOC-TEST-DEL"
        });

        if (!staffRes.data.success) throw new Error("Failed to create staff");
        const staffId = staffRes.data.user.id;
        console.log(`   > Created Staff ID: ${staffId}`);

        console.log("2. Creating Dummy Patient Appointment linked to Doctor...");
        // We need a patient first or guest details
        const bookRes = await axios.post(`${API_URL}/patient/book`, {
            doctorId: staffId,
            date: new Date().toISOString(),
            guestDetails: {
                name: "Test Patient",
                phone: "9999999999",
                age: 30,
                sex: "Male"
            }
        });

        if (!bookRes.data.success) throw new Error("Failed to book appointment: " + bookRes.data.error);
        console.log(`   > Appointment Created: ${bookRes.data.appointment.id}`);

        console.log("3. Attempting to Delete Staff (Triggering Cascade)...");
        const delRes = await axios.delete(`${API_URL}/admin/staff/${staffId}`);

        if (delRes.data.success) {
            console.log("✅ SUCCESS: Staff and linked data deleted successfully.");
        } else {
            console.error("❌ FAILED: API returned success=false", delRes.data.error);
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error.response?.data || error.message);
    }
}

testStaffDeletion();
