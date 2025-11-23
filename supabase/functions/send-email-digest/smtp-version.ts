// Alternative 3: Using SMTP (Gmail, Outlook, etc.)
// Free with existing email account, works with any SMTP server

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587');
const SMTP_USER = Deno.env.get('SMTP_USER') || '';
const SMTP_PASS = Deno.env.get('SMTP_PASS') || '';

// ... (same ticket fetching logic)

async function sendEmailSMTP(to: string, deptName: string, html: string): Promise<any> {
    if (!SMTP_USER || !SMTP_PASS) {
        console.log('SMTP credentials not configured');
        return { to, status: 'skipped' };
    }

    try {
        const client = new SmtpClient();

        await client.connectTLS({
            hostname: SMTP_HOST,
            port: SMTP_PORT,
            username: SMTP_USER,
            password: SMTP_PASS
        });

        await client.send({
            from: SMTP_USER,
            to: to,
            subject: `[Ticket System] Monthly Report - ${deptName} Department`,
            content: html,
            html: html
        });

        await client.close();
        return { to, status: 'sent' };
    } catch (error) {
        return { to, status: 'failed', error: error.message };
    }
}

// For Gmail:
// 1. Enable "Less secure app access" OR
// 2. Use App Password (Settings → Security → App passwords)
