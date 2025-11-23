// Alternative 1: Using Resend (Recommended - Modern & Developer-friendly)
// Sign up at https://resend.com - Free tier: 3,000 emails/month

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// ... (same ticket fetching logic as before)

async function sendEmailResend(to: string, deptName: string, html: string): Promise<any> {
    if (!RESEND_API_KEY) {
        console.log('Resend API key not configured');
        return { to, status: 'skipped' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Ticket System <noreply@leroyalmeridienchennai.com>',
                to: [to],
                subject: `[Ticket System] Monthly Report - ${deptName} Department`,
                html: html
            })
        });

        const result = await response.json();
        return { to, status: response.ok ? 'sent' : 'failed', result };
    } catch (error) {
        return { to, status: 'failed', error: error.message };
    }
}
