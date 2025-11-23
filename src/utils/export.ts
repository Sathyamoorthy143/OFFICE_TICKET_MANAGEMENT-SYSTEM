import type { Ticket } from '../types';

export const exportTicketsToCSV = (tickets: Ticket[]) => {
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Department', 'Creator', 'Created At', 'SLA Deadline'];

    const rows = tickets.map(t => [
        t.id,
        t.title,
        t.status,
        t.priority,
        t.assigned_dept?.name || '',
        t.creator?.full_name || '',
        new Date(t.created_at).toLocaleString(),
        t.sla_deadline ? new Date(t.sla_deadline).toLocaleString() : ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
