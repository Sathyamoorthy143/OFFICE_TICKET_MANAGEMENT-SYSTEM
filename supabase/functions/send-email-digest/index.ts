// Supabase Edge Function: send-email-digest (SMTP Version)
// Purpose: Send email digest to department managers for tickets older than 30 days
// Uses: Gmail SMTP (Free)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587');
const SMTP_USER = Deno.env.get('SMTP_USER') || '';
const SMTP_PASS = Deno.env.get('SMTP_PASS') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

interface Ticket {
    id: string;
    title: string;
    status: string;
    created_at: string;
    creator?: { full_name: string };
}

interface DepartmentDigest {
    deptId: string;
    deptName: string;
    managerEmail: string;
    tickets: Ticket[];
}

serve(async (req) => {
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Fetch tickets older than 30 days that are still open or in progress
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: tickets, error: ticketError } = await supabase
            .from('tickets')
            .select(`
        id,
        title,
        status,
        created_at,
        assigned_dept_id,
        creator:profiles!creator_id(full_name),
        assigned_dept:departments!assigned_dept_id(id, name, manager_email)
      `)
            .lt('created_at', thirtyDaysAgo.toISOString())
            .in('status', ['open', 'in_progress']);

        if (ticketError) {
            console.error('Error fetching tickets:', ticketError);
            return new Response(JSON.stringify({ error: 'Failed to fetch tickets' }), { status: 500 });
        }

        // Group tickets by department
        const deptMap = new Map<string, DepartmentDigest>();

        tickets?.forEach((ticket: any) => {
            const dept = ticket.assigned_dept;
            if (!dept || !dept.manager_email) return;

            if (!deptMap.has(dept.id)) {
                deptMap.set(dept.id, {
                    deptId: dept.id,
                    deptName: dept.name,
                    managerEmail: dept.manager_email,
                    tickets: []
                });
            }

            deptMap.get(dept.id)?.tickets.push({
                id: ticket.id,
                title: ticket.title,
                status: ticket.status,
                created_at: ticket.created_at,
                creator: ticket.creator
            });
        });

        // Send emails to each department manager
        const emailResults = [];
        for (const digest of deptMap.values()) {
            const html = generateEmailHTML(digest);
            const result = await sendEmailSMTP(digest.managerEmail, digest.deptName, html);
            emailResults.push(result);
        }

        return new Response(
            JSON.stringify({
                success: true,
                departmentCount: deptMap.size,
                results: emailResults
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Function error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

function generateEmailHTML(digest: DepartmentDigest): string {
    const ticketRows = digest.tickets.map(t => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; color: #6b7280; font-family: monospace; font-size: 12px;">
        #${t.id.slice(0, 8)}
      </td>
      <td style="padding: 12px; color: #111827; font-weight: 500;">
        ${t.title}
      </td>
      <td style="padding: 12px;">
        <span style="padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background-color: ${t.status === 'open' ? '#fef3c7' : '#dbeafe'}; color: ${t.status === 'open' ? '#92400e' : '#1e40af'};">
          ${t.status.toUpperCase()}
        </span>
      </td>
      <td style="padding: 12px; color: #6b7280; font-size: 14px;">
        ${new Date(t.created_at).toLocaleDateString()}
      </td>
    </tr>
  `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px;">Le Royal Meridien Chennai</h1>
          <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Ticket Management System</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="margin: 0 0 10px; color: #111827;">Monthly Ticket Report - ${digest.deptName}</h2>
          <p style="margin: 0 0 20px; color: #6b7280;">You have <strong>${digest.tickets.length}</strong> ticket(s) older than 30 days that require attention.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">ID</th>
                <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Title</th>
                <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Status</th>
                <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Created</th>
              </tr>
            </thead>
            <tbody>
              ${ticketRows}
            </tbody>
          </table>
          
          <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px;">
            Please review and resolve these tickets at your earliest convenience.
          </p>
        </div>
        
        <div style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from the Ticket Management System.<br>
            Do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

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
