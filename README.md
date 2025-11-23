# 🎫 Office Ticket Management System

A modern, full-stack ticket management system built for Le Royal Meridien Chennai to streamline support requests across departments.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## 📋 Overview

A comprehensive ticket management solution designed for hotel operations, featuring role-based access control, SLA tracking, real-time updates, and department-based organization.

**Live Demo**: [Your Vercel URL]

---

## ✨ Key Features

### 🎯 Core Functionality
- **Ticket Creation & Management** - Create, track, and resolve support tickets
- **SLA Tracking** - 40-minute resolution deadline with visual indicators
- **Role-Based Access** - 4 user roles (View Only, Dept User, Dept Manager, Admin)
- **Department Groups** - Organize users by departments
- **Real-time Dashboard** - Live analytics and ticket statistics

### 🔐 Security & Authentication
- **Email Domain Restriction** - Restricted to authorized domains
- **Password Management** - 30-day expiry with admin reset capability
- **Row Level Security (RLS)** - Supabase database security
- **Protected Routes** - Frontend route guards

### 📊 Advanced Features
- **CSV Export** - Download ticket data for reporting
- **Email Notifications** - Automated monthly reports to department managers
- **User Management** - Admin panel for user role assignment
- **Activity Logging** - Complete audit trail for all ticket actions
- **Priority Levels** - Low, Medium, High, Critical

### 🎨 UI/UX
- **Glassmorphism Design** - Modern, premium interface
- **Warm Amber Theme** - Consistent brand colors
- **Responsive Layout** - Mobile, tablet, and desktop optimized
- **Smooth Animations** - Enhanced user experience with Framer Motion

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Recharts** - Data visualization

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security
  - Edge Functions

### Key Libraries
- **Lucide React** - Icons
- **date-fns** - Date manipulation
- **clsx & tailwind-merge** - CSS utilities

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/office-ticket-management.git
cd office-ticket-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

Create `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from Supabase Dashboard → Settings → API

### 4. Database Setup

Execute the following SQL files in your Supabase SQL Editor:

1. **Main Schema**: `supabase/schema.sql`
2. **Password & Email Migration**: `supabase/migration_add_password_email.sql`

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Quick Steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **View Only** | View tickets only |
| **Dept User** | Create tickets, view department tickets, update own tickets |
| **Dept Manager** | All Dept User permissions + manage users + access Groups |
| **Admin** | Full system access, user management, password resets |

---

## 📚 Project Structure

```
office-ticket-management/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout.tsx      # Main layout with sidebar
│   │   ├── ProtectedRoute.tsx
│   │   └── PasswordResetModal.tsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx   # Analytics dashboard
│   │   ├── Tickets.tsx     # Ticket list
│   │   ├── CreateTicket.tsx
│   │   ├── TicketDetail.tsx
│   │   ├── Users.tsx       # User management (admin)
│   │   ├── Groups.tsx      # Department groups
│   │   └── Login.tsx       # Authentication
│   ├── lib/                # Utilities & configs
│   │   ├── supabase.ts     # Supabase client
│   │   └── passwordPolicy.ts
│   ├── services/           # API services
│   │   └── notification.ts
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   ├── utils/              # Helper functions
│   │   └── export.ts       # CSV export
│   ├── App.tsx             # Routes configuration
│   ├── index.css           # Global styles
│   └── main.tsx            # App entry point
├── supabase/
│   ├── schema.sql          # Database schema
│   ├── migration_add_password_email.sql
│   ├── reset_tickets.sql
│   └── functions/          # Edge Functions
│       └── send-email-digest/
├── public/                 # Static assets
├── .env                    # Environment variables
└── package.json
```

---

## 🔧 Configuration

### Departments

Default departments (modify in Supabase):
- Engineering
- IT
- Housekeeping
- IRD (In-Room Dining)

### Allowed Email Domains

Configured in `src/pages/Login.tsx`:
```typescript
const ALLOWED_DOMAINS = [
  'leroyalmeridienchennai.com', 
  'leroyalmeridien-chennai.com'
];
```

### SLA Configuration

Default: 40 minutes (modify in `src/pages/CreateTicket.tsx`)

---

## 📧 Email Notifications Setup

### Configure SMTP for Email Digests

1. **Get Gmail App Password**:
   - Enable 2FA on Gmail
   - Generate App Password
   - See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for details

2. **Set Supabase Secrets**:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

3. **Deploy Edge Function**:
```bash
supabase functions deploy send-email-digest
```

4. **Configure Cron Job** in Supabase Dashboard

---

## 🎨 Customization

### Theme Colors

Edit `src/index.css` to customize the color palette:

```css
:root {
  --color-primary: #f59e0b;      /* Amber */
  --color-secondary: #fb923c;    /* Orange */
  --color-background: #0a0a0f;   /* Dark */
}
```

### Features Overview (Login Page)

Modify the features cards in `src/pages/Login.tsx`

---

## 🧪 Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Type Check
```bash
npm run type-check
```

---

## 📖 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - GitHub & Vercel deployment
- [Supabase Docs](https://supabase.com/docs) - Database & Auth

---

## 🐛 Troubleshooting

### Common Issues

**Build Errors**: 
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database Connection Issues**:
- Verify environment variables
- Check Supabase project status
- Ensure RLS policies are configured

**Authentication Problems**:
- Verify allowed email domains
- Check Supabase redirect URLs
- Clear browser cache

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software for Le Royal Meridien Chennai.

---

## 👨‍💻 Developer

**Sathyamoorthy A**  
IT Associate, Le Royal Meridien Chennai

- [LinkedIn](https://linkedin.com/in/sathyamoorthy-offical)
- [GitHub](https://github.com/Sathyamoorthy143)

---

## 🙏 Acknowledgments

- Le Royal Meridien Chennai for project requirements
- Supabase for backend infrastructure
- React & Vite communities

---

**Made with ❤️ for Le Royal Meridien Chennai**
