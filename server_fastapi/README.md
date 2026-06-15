# SkillBridge FastAPI Backend

## Quick Start

### 1. Install Python 3.9+
```bash
python --version
```

### 2. Create Virtual Environment
```bash
# Navigate to server_fastapi directory
cd server_fastapi

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Or Windows CMD
.\venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=career_skills_db
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_key_here
```

### 5. Run the Server
```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --port 5000

# Or use Python directly
python -m app.main
```

### 6. Access API Documentation
- **Swagger UI**: http://localhost:5000/api/docs
- **ReDoc**: http://localhost:5000/api/redoc
- **Health Check**: http://localhost:5000/api/health

## Project Structure
```
server_fastapi/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── database.py          # Database connection
│   ├── dependencies.py      # Shared dependencies
│   ├── routers/            # API routes
│   │   ├── auth.py
│   │   ├── onboarding.py
│   │   ├── departments.py
│   │   └── ...
│   ├── schemas/            # Pydantic models
│   │   ├── auth.py
│   │   ├── onboarding.py
│   │   └── ...
│   └── utils/              # Utilities
│       └── security.py
├── .env                    # Environment variables
├── requirements.txt        # Python dependencies
└── README.md
```

## Available Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Onboarding
- `GET /api/onboarding/profile` - Get user profile (requires auth)
- `POST /api/onboarding/profile` - Create/update profile (requires auth)
- `POST /api/onboarding/complete` - Complete onboarding (requires auth)

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/{id}` - Get department by ID

### Future Routes (Placeholders)
- `/api/courses` - Course management
- `/api/progress` - Progress tracking
- `/api/certificates` - Certificate generation
- `/api/chat` - AI mentor chat
- `/api/tasks` - Task management
- `/api/skills` - Skills tracking

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "full_name": "Test User"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Get Departments
```bash
curl http://localhost:5000/api/departments
```

### Create Profile (with auth token)
```bash
curl -X POST http://localhost:5000/api/onboarding/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "sector_type": "Government",
    "organization_name": "FIA",
    "department_id": 1,
    "job_title": "Data Analyst",
    "years_experience": 5,
    "current_tools": ["Excel", "Python"]
  }'
```

## Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:5000
```

### Docker (Optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:5000"]
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database `career_skills_db` exists

### Import Errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

### Port Already in Use
- Change port: `uvicorn app.main:app --port 8000`
