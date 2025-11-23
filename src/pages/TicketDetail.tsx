import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Ticket } from '../types';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { sendWhatsAppNotification } from '../services/notification';

export default function TicketDetail() {
    const { id } = useParams<{ id: string }>();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (id) fetchTicket(id);
    }, [id]);

    const fetchTicket = async (ticketId: string) => {
        const { data, error } = await supabase
            .from('tickets')
            .select(`
        *,
        creator:profiles!creator_id(full_name),
        assigned_dept:departments!assigned_dept_id(name),
        assigned_user:profiles!assigned_user_id(full_name)
      `)
            .eq('id', ticketId)
            .single();

        if (error) {
            console.error(error);
            navigate('/tickets');
            return;
        }

        setTicket(data);
        setEditDescription(data.description || '');
        setLoading(false);
    };

    const handleResolve = async () => {
        if (!ticket) return;

        const { error } = await supabase
            .from('tickets')
            .update({ status: 'resolved', resolved_at: new Date().toISOString() })
            .eq('id', ticket.id);

        if (!error) {
            await sendWhatsAppNotification('Admin@leroyalmeridienchennai.com', `Ticket ${ticket.id} resolved.`);
            fetchTicket(ticket.id);
        }
    };

    const handleUpdate = async () => {
        if (!ticket) return;

        const { error } = await supabase
            .from('tickets')
            .update({ description: editDescription })
            .eq('id', ticket.id);

        if (!error) {
            setIsEditing(false);
            fetchTicket(ticket.id);
        }
    };

    const canEdit = () => {
        if (!ticket) return false;
        // Check if within 20 mins of creation
        const minutesSinceCreation = differenceInMinutes(new Date(), new Date(ticket.created_at));
        return minutesSinceCreation <= 20;
    };

    if (loading || !ticket) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/tickets')}
                className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back to Tickets</span>
            </button>

            <div className="card">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono text-[var(--color-text-muted)]">#{ticket.id.slice(0, 8)}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border border-current ${ticket.status === 'resolved' ? 'text-green-500' : 'text-blue-500'
                                }`}>
                                {ticket.status.toUpperCase()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold">{ticket.title}</h1>
                    </div>

                    {ticket.status !== 'resolved' && (
                        <button
                            onClick={handleResolve}
                            className="btn bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CheckCircle size={18} />
                            Resolve Ticket
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Description</h3>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full h-32 p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleUpdate} className="btn btn-primary btn-sm">Save</button>
                                        <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            )}

                            {!isEditing && canEdit() && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-2 text-sm text-[var(--color-primary)] hover:underline"
                                >
                                    Edit Description (Available for {20 - differenceInMinutes(new Date(), new Date(ticket.created_at))} more mins)
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-[var(--color-surface-hover)] rounded-lg space-y-4">
                            <div>
                                <span className="text-xs text-[var(--color-text-muted)] block">Assigned Department</span>
                                <span className="font-medium">{ticket.assigned_dept?.name}</span>
                            </div>
                            <div>
                                <span className="text-xs text-[var(--color-text-muted)] block">Priority</span>
                                <span className={`font-medium capitalize ${ticket.priority === 'critical' ? 'text-red-500' : 'text-[var(--color-text)]'
                                    }`}>{ticket.priority}</span>
                            </div>
                            <div>
                                <span className="text-xs text-[var(--color-text-muted)] block">Created By</span>
                                <span className="font-medium">{ticket.creator?.full_name}</span>
                            </div>
                            <div>
                                <span className="text-xs text-[var(--color-text-muted)] block">Created At</span>
                                <span className="font-medium">{new Date(ticket.created_at).toLocaleString()}</span>
                            </div>

                            {ticket.sla_deadline && (
                                <div className={`pt-4 border-t border-[var(--color-border)] ${new Date(ticket.sla_deadline) < new Date() && ticket.status !== 'resolved' ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock size={16} />
                                        <span className="text-xs font-bold">SLA Deadline</span>
                                    </div>
                                    <span className="font-medium">{new Date(ticket.sla_deadline).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
