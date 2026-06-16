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
- **Framework**: FastAPI (Python 3.9+)
- **Database**: PostgreSQL with asyncpg
- **AI Integration**: OpenAI API / Anthropic Claude API
- **Video Integration**: YouTube Data API v3
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **API Documentation**: Auto-generated Swagger UI & ReDoc

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS + Material Design 3
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Material Symbols

## 📦 Installation

### Prerequisites
- Python 3.9 or higher
- PostgreSQL (v14 or higher)
- Node.js (v18 or higher) - for frontend
- OpenAI API key or Anthropic API key (optional)
- YouTube Data API v3 key (optional)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gov_ai_tools_course
   ```

2. **Setup FastAPI Backend**
   ```bash
   cd server_fastapi
   
   # Run automated setup (Windows)
   setup.bat
   
   # Or manual setup:
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # PowerShell
   # or .\venv\Scripts\activate  # CMD
   pip install -r requirements.txt
   ```

3. **Configure Backend Environment**
   Edit `server_fastapi/.env` with your configuration:
   ```env
   DB_HOST=localhost
   DB_NAME=career_skills_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key
   ```

4. **Setup PostgreSQL Database**
   ```bash
   # Create database
   createdb career_skills_db
   
   # Run schema
   psql -U postgres -d career_skills_db -f database-schema.sql
   ```

5. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

6. **Run the Application**
   
   ```bash
   # Backend (Terminal 1) - from server_fastapi directory
   cd server_fastapi
   .\venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload --port 5000
   
   # Or use the run script:
   run.bat
   
   # Frontend (Terminal 2) - from client directory
   cd client
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/api/docs
   - ReDoc: http://localhost:5000/api/redoc

## 🗂️ Project Structure

```
gov_ai_tools_course/
├── server_fastapi/               # FastAPI Backend
│   ├── app/
│   │   ├── routers/             # API routes
│   │   │   ├── auth.py          # Authentication
│   │   │   ├── onboarding.py    # User onboarding
│   │   │   ├── departments.py   # Department management
│   │   │   ├── tasks.py         # Task analysis
│   │   │   ├── skills.py        # Skill mapping
│   │   │   ├── courses.py       # Course generation
│   │   │   ├── progress.py      # Progress tracking
│   │   │   ├── chat.py          # AI mentor chat
│   │   │   └── certificates.py  # Certificates
│   │   ├── schemas/             # Pydantic models
│   │   │   ├── auth.py
│   │   │   ├── onboarding.py
│   │   │   └── department.py
│   │   ├── utils/               # Utilities
│   │   │   └── security.py      # JWT & password hashing
│   │   ├── config.py            # Configuration
│   │   ├── database.py          # Database connection
│   │   ├── dependencies.py      # Shared dependencies
│   │   └── main.py              # FastAPI app
│   ├── .env                     # Environment variables
│   ├── requirements.txt         # Python dependencies
│   ├── setup.bat                # Setup script
│   ├── run.bat                  # Run script
│   └── README.md
├── client/                       # React Frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth context
│   │   ├── pages/skillbridge/   # 24 React pages
│   │   │   ├── components/
│   │   │   │   ├── SideNav.jsx
│   │   │   │   └── TopNav.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MainDashboard.jsx
│   │   │   └── ...22 more pages
│   │   ├── App-Skillbridge.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js       # Material Design 3 colors
│   └── package.json
├── database-schema.sql          # PostgreSQL schema
├── FASTAPI_MIGRATION_GUIDE.md   # Migration guide
└── README.md
```

## 🚀 Development Phases

### ✅ Phase 1: Foundation & Onboarding (COMPLETED)
- [x] Project setup and database schema
- [x] FastAPI backend with asyncpg
- [x] User authentication (register/login with JWT)
- [x] Smart onboarding form
- [x] Pre-loaded government and private departments
- [x] React frontend with Material Design 3
- [x] 24 complete UI pages
- [x] Auto-generated API documentation

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

Backend environment variables (in `server_fastapi/.env`):

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=career_skills_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=10080

# CORS
FRONTEND_URL=http://localhost:5173

# App
APP_NAME=SkillBridge API
DEBUG=True

# AI Provider (optional)
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4-turbo-preview

# YouTube (optional)
YOUTUBE_API_KEY=your_youtube_key
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
