import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER

export async function sendSMS(to: string, body: string) {
    if (!accountSid || !authToken || !twilioNumber) {
        console.warn("[SMS WARNING] Twilio credentials missing.")
        return { success: false, error: "Missing config" }
    }

    try {
        const client = twilio(accountSid, authToken)

        const formattedTo = to.startsWith('+') ? to : `+91${to}` // Defaulting to +91

        const message = await client.messages.create({
            body: body,
            from: twilioNumber,
            to: formattedTo
        })

        console.log(`[SMS SENT] SID: ${message.sid}`)
        return { success: true, sid: message.sid }
    } catch (error: any) {
        console.error("[SMS ERROR]", error)
        return { success: false, error: error }
    }
}
