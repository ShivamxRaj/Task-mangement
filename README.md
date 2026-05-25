# TaskFlow — Collaborative Task Management Portal

A production-ready, collaborative task management application built as an internship project. The portal features secure Google OAuth 2.0 logins, interactive task tracking dashboards, real-time sync, and automated email notifications via SMTP.

---

## 🏛️ ARCHITECTURE (Strict MCP Pattern)

The application follows the **Model-Controller-Provider (MCP)** architecture pattern to isolate business domains, query controllers, and external system integrations:

```
├── backend/                       # Python Flask REST API
│   ├── models/                    # Data shapes & DB schemas
│   ├── controllers/               # Route endpoints & request processors
│   │   ├── auth_controller.py     # Auth verification controller
│   │   ├── task_controller.py     # CRUD task controller
│   │   └── user_controller.py     # Workspace user directories
│   ├── providers/                 # External system wrappers (Supabase, Gmail SMTP)
│   │   ├── supabase_provider.py   # Database client integration
│   │   └── email_provider.py      # SMTP client mail dispatches
│   ├── app.py                     # Entry point
│   ├── requirements.txt           # Pip dependencies
│   └── Dockerfile                 # Docker setup
│
├── frontend/                      # Next.js 14 Web Portal
│   ├── app/                       # Routing (App Router)
│   ├── components/                # Modular UI components
│   │   ├── auth/                  # Authentication widgets
│   │   ├── layout/                # Navbars, Sidebars & Shells
│   │   ├── tasks/                 # Task Cards, Forms & Lists
│   │   └── ui/                    # Reusable elements (Buttons, Modals)
│   ├── context/                   # React State Contexts (AuthContext)
│   ├── hooks/                     # Custom React Hooks (useAuth, useTasks)
│   ├── lib/                       # API clients & configuration (supabase, fetch)
│   ├── types/                     # TypeScript Interfaces
│   └── Dockerfile                 # Multi-stage Docker builder
```

---

## ⚙️ DATABASE SCHEMA (Supabase PostgreSQL)

Configure the following tables in the Supabase SQL Editor:

### 1. `profiles` Table
Stores user data. Synchronized automatically with Supabase `auth.users` metadata via Postgres triggers.
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "Allow public profiles read access" on public.profiles for select using (true);
```

### 2. `tasks` Table
Stores workspace task items.
```sql
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  status text check (status in ('todo', 'in_progress', 'completed')) default 'todo' not null,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium' not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tasks enable row level security;

-- RLS Policies
create policy "Authenticated users can select tasks" on public.tasks 
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert tasks" on public.tasks 
  for insert with check (auth.uid() = created_by);

create policy "Creators can modify tasks" on public.tasks 
  for update using (auth.uid() = created_by);

create policy "Assignees can modify task status" on public.tasks 
  for update using (auth.uid() = assigned_to);

create policy "Creators can delete tasks" on public.tasks 
  for delete using (auth.uid() = created_by);
```

### 3. Automated User Profile Synchronization Trigger
Create a database trigger to insert/sync user data from the OAuth payload into the `public.profiles` directory on login:
```sql
-- Profile sync function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set 
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution bind
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 📧 GMAIL SMTP NOTIFICATION SETUP

The application triggers email alerts when tasks are created, assigned, or completed. Follow these steps to generate SMTP credentials:

1. **Activate Google Account Two-Factor Verification**:
   - Go to your Google Account -> **Security**.
   - Under *How you sign in to Google*, activate **2-Step Verification**.

2. **Generate an App Password**:
   - Go to the **2-Step Verification** details page (scroll to bottom).
   - Click on **App passwords**.
   - Enter a descriptive name (e.g. `TaskFlow Portal`).
   - Copy the generated **16-character password** (remove spaces).

3. **Configure Environment Variables**:
   Add this credentials block into your `backend/.env` file:
   ```env
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   GMAIL_EMAIL=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-password
   ```

---

## ⚡ RUNNING LOCALLY

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Supabase Project Database

### Setup Backend API
1. Open the backend folder:
   ```bash
   cd backend
   ```
2. Create virtual environment and activate:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment template and configure keys:
   ```bash
   copy .env.example .env
   ```
5. Spin up Flask server:
   ```bash
   python app.py
   ```

### Setup Frontend
1. Open the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Copy environment template and configure client keys:
   ```bash
   copy .env.example .env.local
   ```
3. Run developmental server:
   ```bash
   npm run dev
   ```
4. Access app portal on `http://localhost:3000`.

---

## 🐳 DOCKER COMPOSE ORCHESTRATION

To spin up the production build bundle using Docker Compose:

1. Configure `.env` in the backend folder and `.env.local` in the frontend folder.
2. Run command at the workspace root:
   ```bash
   docker-compose up --build
   ```
3. The frontend container will expose port `3000`, backend will expose port `5000`.
