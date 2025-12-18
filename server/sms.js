const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

async function sendSMS(to, body) {
    if (!accountSid || !authToken || !twilioNumber) {
        console.warn("[SMS WARNING] Twilio credentials missing. Converting to console log.");
        console.log(`[SMS SIMULATION] To ${to}: ${body}`);
        return { success: false, error: "Missing config" };
    }

    try {
        const client = twilio(accountSid, authToken);

        // Default country code assumption (+91) if missing
        const formattedTo = to.startsWith('+') ? to : `+91${to}`;

        const message = await client.messages.create({
            body: body,
            from: twilioNumber,
            to: formattedTo
        });

        console.log(`[SMS SENT] SID: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error("[SMS ERROR]", error);
        // Fallback
        console.log(`[SMS FALLBACK] To ${to}: ${body}`);
        return { success: false, error: error };
    }
}

module.exports = { sendSMS };
