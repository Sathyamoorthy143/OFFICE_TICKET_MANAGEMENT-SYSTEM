// Alternative 2: Using Amazon SES (Cheapest - $0.10 per 1,000 emails)
// Setup: Enable SES in AWS Console, verify domain

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AWS_ACCESS_KEY = Deno.env.get('AWS_ACCESS_KEY_ID') || '';
const AWS_SECRET_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY') || '';
const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';

// ... (same ticket fetching logic)

async function sendEmailSES(to: string, deptName: string, html: string): Promise<any> {
    if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
        console.log('AWS credentials not configured');
        return { to, status: 'skipped' };
    }

    try {
        // AWS SES requires signing - using AWS SDK
        const AWS = await import('https://esm.sh/@aws-sdk/client-ses@3');
        const client = new AWS.SESClient({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY,
                secretAccessKey: AWS_SECRET_KEY
            }
        });

        const command = new AWS.SendEmailCommand({
            Source: 'noreply@leroyalmeridienchennai.com',
            Destination: { ToAddresses: [to] },
            Message: {
                Subject: { Data: `[Ticket System] Monthly Report - ${deptName} Department` },
                Body: { Html: { Data: html } }
            }
        });

        await client.send(command);
        return { to, status: 'sent' };
    } catch (error) {
        return { to, status: 'failed', error: error.message };
    }
}
