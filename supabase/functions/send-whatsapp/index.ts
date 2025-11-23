// Follow this setup guide to integrate the Deno runtime into your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This function uses Twilio to send WhatsApp messages.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER') // e.g., 'whatsapp:+14155238886'

serve(async (req) => {
    try {
        const { to, message } = await req.json()

        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
            throw new Error('Missing Twilio Environment Variables')
        }

        // Transform 'to' number if needed (ensure it has whatsapp: prefix)
        // Assuming 'to' comes in as '+1234567890'
        const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`

        const form = new FormData()
        form.append('To', toFormatted)
        form.append('From', TWILIO_FROM_NUMBER)
        form.append('Body', message)

        // Basic Auth for Twilio
        const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                },
                body: form,
            }
        )

        const data = await response.json()

        return new Response(
            JSON.stringify(data),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }
})
