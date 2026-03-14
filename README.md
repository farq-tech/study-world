# عالم الدراسة — Study World

منصة تعليمية عربية متكاملة للصف الثالث الابتدائي في المملكة العربية السعودية.

A full-stack Arabic educational platform for Saudi Grade 3 students.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| AI | Claude API (Anthropic) |
| Charts | Recharts |
| Auth | JWT + bcryptjs |
| Jobs | node-cron |
| Deployment | Vercel (frontend) + Render (backend + DB) |

---

## Project Structure

```
study-world/
├── frontend/          # Next.js 14 app
│   └── src/
│       ├── app/
│       │   ├── login/
│       │   ├── student/   # 10 student pages
│       │   └── admin/     # 10 admin pages
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
└── backend/           # Express API
    ├── src/
    │   ├── config/
    │   ├── jobs/
    │   ├── lib/
    │   ├── middleware/
    │   ├── routes/
    │   ├── services/
    │   ├── types/
    │   └── validators/
    └── prisma/
        ├── schema.prisma
        └── seed.ts
```

---

## Features

### Student Features
- **Dashboard** — Points, level, streak, today's classes, pending homework
- **Weekly Schedule** — Full Sunday–Thursday timetable with subject colors
- **Homework** — View, submit, get AI explanations (Claude API)
- **Daily & Weekly Quizzes** — MCQ, True/False, Short Answer with timer & auto-grading
- **Grades** — Bar & radar charts, subject breakdown
- **AI Tutor** — Claude-powered Arabic chat tutor
- **Math Zone** — Weakness detection, AI-generated drills
- **Badges & Gamification** — Points, levels, streaks, 12+ achievement badges
- **Text-to-Speech** — Web Speech API for reading content aloud
- **Profile** — Points history, badges, activity stats

### Admin / Parent Features
- **Dashboard** — Overview stats, charts, recent activity
- **Student Management** — CRUD, view per-student details
- **Subjects** — Manage 9 subjects with icons, colors
- **Teachers** — CRUD with subject assignments
- **Schedules** — Visual timetable editor per student
- **Homework** — Assign, view submissions, grade
- **Quizzes** — Create quizzes, AI question generation
- **Grades** — Record and track grades
- **Saudi Holidays** — Manage school year holidays
- **Reports & Analytics** — Grade distributions, completion rates, charts

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY

# Run database migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@studyworld.sa | password123 |
| Parent | parent@studyworld.sa | password123 |
| Student 1 | ahmad@student.sa | password123 |
| Student 2 | abdulrahman@student.sa | password123 |

---

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `POST /api/auth/login` | Login |
| `GET /api/students` | List students |
| `GET /api/students/:id/dashboard` | Student dashboard data |
| `GET /api/subjects` | All subjects |
| `GET /api/teachers` | All teachers |
| `GET /api/schedules/student/:id` | Student's weekly schedule |
| `GET /api/homework/student/:id` | Student's homework |
| `POST /api/homework/:id/submit` | Submit homework |
| `GET /api/quizzes/available/:studentId` | Available quizzes |
| `POST /api/quizzes/:id/attempt` | Submit quiz attempt |
| `GET /api/grades/student/:id/overview` | Grade overview with charts |
| `POST /api/ai/tutoring-help` | AI tutor chat |
| `POST /api/ai/explain-homework` | AI homework explanation |
| `POST /api/ai/generate-quiz` | AI quiz generation |
| `POST /api/ai/generate-drill` | AI math drill generation |
| `GET /api/analytics/overview` | Admin overview stats |
| `GET /api/holidays` | Saudi school holidays |
| `GET /api/notifications` | User notifications |

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api`
4. Deploy

### Backend → Render

1. Push to GitHub
2. Create new Web Service in Render
3. Use `render.yaml` (Blueprint) for automatic setup
4. Add env vars: `ANTHROPIC_API_KEY`, `FRONTEND_URL`
5. Deploy — Render auto-provisions PostgreSQL

---

## Seed Data

The seed creates:
- **9 subjects**: الرياضيات، اللغة العربية، العلوم، التربية الإسلامية، القرآن الكريم، اللغة الإنجليزية، المهارات الحياتية، التربية البدنية، التربية الفنية
- **2 students**: أحمد النقيدان، عبدالرحمن بن كليب
- **7 teachers** with subject assignments
- **Full weekly schedule** (Sun–Thu, 6 periods/day)
- **Sample homework, quizzes, grades, badges**
- **Saudi public holidays**
- **12 achievement badges**

---

## License

MIT
