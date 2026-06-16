from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.config import settings
from app.routers import auth, onboarding, departments, courses, progress, certificates, chat, tasks, skills, quizzes, admin
from app.database import get_pool, close_pool
from app.limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(departments.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(certificates.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# Health check
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "app": settings.APP_NAME
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "SkillBridge API is running",
        "docs": "/api/docs",
        "redoc": "/api/redoc"
    }

# Startup event
@app.on_event("startup")
async def startup():
    print(f"🚀 {settings.APP_NAME} starting...")
    print(f"📊 Database: {settings.DB_NAME}")
    print(f"🌐 CORS: {settings.FRONTEND_URL}")
    print(f"📚 API Documentation: http://localhost:5000/api/docs")
    
    # Initialize database pool
    await get_pool()
    print("✅ Database connection pool created")

# Shutdown event
@app.on_event("shutdown")
async def shutdown():
    print("🛑 Shutting down...")
    await close_pool()
    print("✅ Database connection pool closed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=5000,
        reload=settings.DEBUG
    )
