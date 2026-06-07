# AI-Powered Career Skills Development Platform

An intelligent web application that analyzes employee job roles, generates personalized learning paths, and provides AI tool training with progress tracking and certification.

## 🎯 Project Overview

This platform helps employees from both private companies and government departments:
- **Analyze** their day-to-day job tasks using AI
- **Identify** skill gaps and relevant AI tools
- **Learn** through personalized courses with curated YouTube tutorials
- **Track** progress with quizzes, streaks, and an AI mentor
- **Earn** verifiable certificates upon completion

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API / Anthropic Claude API
- **Video Integration**: YouTube Data API v3
- **Job Queue**: BullMQ with Redis
- **Authentication**: JWT
- **PDF Generation**: PDFKit

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- OpenAI API key or Anthropic API key
- YouTube Data API v3 key

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-career-skills-platform
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual configuration:
   - Database credentials
   - JWT secret
   - OpenAI or Anthropic API key
   - YouTube API key
   - Redis configuration

5. **Setup PostgreSQL database**
   ```bash
   # Create database
   createdb career_skills_db
   
   # Run migrations
   psql -U postgres -d career_skills_db -f database-schema.sql
   ```

6. **Start Redis server**
   ```bash
   redis-server
   ```

7. **Run the application**
   
   Development mode (runs both backend and frontend):
   ```bash
   npm run dev
   ```
   
   Or run separately:
   ```bash
   # Backend (Terminal 1)
   npm run server
   
   # Frontend (Terminal 2)
   npm run client
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🗂️ Project Structure

```
ai-career-skills-platform/
├── server/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── onboarding.js        # User onboarding
│   │   ├── departments.js       # Department management
│   │   ├── tasks.js             # Task analysis (Phase 2)
│   │   ├── skills.js            # Skill mapping (Phase 4)
│   │   ├── courses.js           # Course generation (Phase 5)
│   │   ├── progress.js          # Progress tracking (Phase 6)
│   │   ├── chat.js              # AI mentor chat (Phase 6)
│   │   └── certificates.js      # Certificate generation (Phase 7)
│   └── index.js                 # Main server file
├── client/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── Onboarding.jsx   # Onboarding form
│   │   │   └── Dashboard.jsx    # Main dashboard
│   │   ├── App.jsx              # App router
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── database-schema.sql          # Database schema
├── .env.example                 # Environment variables template
├── package.json
├── project-plan.md              # Detailed project plan
└── README.md
```

## 🚀 Development Phases

### ✅ Phase 1: Foundation & Onboarding (Current)
- [x] Project setup and database schema
- [x] User authentication (register/login)
- [x] Smart onboarding form
- [x] Pre-loaded government and private departments
- [x] Basic UI/UX framework

### 📋 Phase 2: AI Job Analysis Engine
- [ ] LLM integration for task generation
- [ ] Structured prompt engineering
- [ ] Task storage and categorization
- [ ] Generate 25-30 tasks per role

### ✔️ Phase 3: Human-in-the-Loop Approval
- [ ] Editable task checklist interface
- [ ] Custom task addition
- [ ] Task approval and locking mechanism

### 🎯 Phase 4: Skill & Tool Mapping
- [ ] Skill taxonomy database
- [ ] Task-to-skill-to-tool mapping engine
- [ ] Difficulty level assignment
- [ ] AI tool database

### 📚 Phase 5: Course Generation
- [ ] YouTube API integration
- [ ] LLM-generated how-to guides
- [ ] Productivity use case generation
- [ ] Course structure builder

### 📈 Phase 6: Learning Experience
- [ ] Progress tracking system
- [ ] Quiz generation and evaluation
- [ ] AI mentor chatbot
- [ ] Daily reminders and streaks
- [ ] Practice sandbox prompts

### 🏆 Phase 7: Certification
- [ ] PDF certificate generation
- [ ] SHA-256 verification system
- [ ] Shareable profiles

## 🔑 Key Features

### Smart Onboarding
- Sector type selection (Private/Government)
- Searchable department dropdown
- Pre-loaded government departments (FIA, IB, NADRA, Power & Works, etc.)
- Job title and experience capture
- Current tools tracking

### AI-Powered Analysis (Coming Soon)
- Intelligent job task generation
- Role-specific task categorization
- Skill gap identification
- Tool recommendations

### Personalized Learning (Coming Soon)
- Custom course generation
- Curated YouTube tutorials
- AI-generated guides
- Interactive quizzes
- Practice prompts

### Progress Tracking (Coming Soon)
- Learning streaks
- Module completion tracking
- Quiz scores
- Time spent analytics

### Certification (Coming Soon)
- Verifiable PDF certificates
- Unique verification IDs
- Shareable profiles

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=career_skills_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# AI Provider (choose one)
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4-turbo-preview
# OR
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# YouTube
YOUTUBE_API_KEY=your_youtube_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Onboarding
- `GET /api/onboarding/profile` - Get user profile
- `POST /api/onboarding/profile` - Create/update profile
- `POST /api/onboarding/complete` - Mark onboarding complete

### Departments
- `GET /api/departments` - List departments (with filters)
- `GET /api/departments/:id` - Get department details

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 📄 Database Schema

The platform uses PostgreSQL with the following main tables:
- `users` - User accounts
- `user_profiles` - Onboarding data
- `departments` - Pre-loaded departments
- `job_tasks` - AI-generated tasks
- `skill_taxonomy` - Skill mappings
- `ai_tools` - Tool database
- `courses` - Personalized courses
- `lessons` - Course content
- `quizzes` - Assessments
- `certificates` - Completion certificates

See `database-schema.sql` for the complete schema.

## 🤝 Contributing

This is a phased development project. Each phase builds upon the previous one.

Current phase: **Phase 1 - Foundation & Onboarding** ✅

## 📞 Support

For issues or questions, please open an issue in the repository.

## 📜 License

ISC

---

**Built with ❤️ to empower professionals with AI skills**
