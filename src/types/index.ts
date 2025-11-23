export type UserRole = 'view_only' | 'dept_user' | 'dept_manager' | 'admin';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'on_hold';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Department {
    id: string;
    name: string;
    manager_id?: string;
    manager_email?: string;
}

export interface Profile {
    id: string;
    full_name: string;
    role: UserRole;
    department_id?: string;
    email?: string; // From auth.users
    password_changed_at?: string;
    password_reset_required?: boolean;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    creator_id: string;
    assigned_dept_id?: string;
    assigned_user_id?: string;
    created_at: string;
    sla_deadline?: string;
    resolved_at?: string;

    // Joins
    creator?: Profile;
    assigned_dept?: Department;
    assigned_user?: Profile;
}

export interface TicketActivity {
    id: string;
    ticket_id: string;
    actor_id: string;
    action: string;
    details: any;
    created_at: string;
    actor?: Profile;
}
