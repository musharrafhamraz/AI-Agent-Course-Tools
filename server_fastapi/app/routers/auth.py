from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse, GoogleAuth
from app.utils.security import verify_password, get_password_hash, create_access_token
# pyrefly: ignore [missing-import]
import asyncpg
import httpx
from uuid import uuid4

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: asyncpg.Connection = Depends(get_db)):
    """
    Register a new user
    """
    try:
        print(f"Registration attempt - Email: {user_data.email}, Password length: {len(user_data.password)}")
        
        # Check if user exists
        check_query = "SELECT id FROM users WHERE email = $1"
        result = await db.fetchval(check_query, user_data.email)
        
        if result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        print(f"About to hash password: {len(user_data.password)} chars")
        password_hash = get_password_hash(user_data.password)
        print(f"Password hashed successfully")
        
        # Create user
        insert_query = """
            INSERT INTO users (email, password_hash, full_name)
            VALUES ($1, $2, $3)
            RETURNING id, email, full_name, created_at
        """
        user = await db.fetchrow(
            insert_query,
            user_data.email,
            password_hash,
            user_data.full_name
        )
        
        # Initialize user streak
        await db.execute(
            "INSERT INTO user_streaks (user_id) VALUES ($1)",
            user['id']
        )
        
        # Generate JWT token
        token = create_access_token(data={"userId": user['id']})
        
        return TokenResponse(
            message="User registered successfully",
            token=token,
            user=UserResponse(
                id=user['id'],
                email=user['email'],
                full_name=user['full_name'],
                created_at=user['created_at']
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Registration error: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: asyncpg.Connection = Depends(get_db)):
    """
    Login user
    """
    try:
        # Find user
        query = "SELECT * FROM users WHERE email = $1"
        user = await db.fetchrow(query, credentials.email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify password
        if not verify_password(credentials.password, user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Generate JWT token
        token = create_access_token(data={"userId": user['id']})
        
        return TokenResponse(
            message="Login successful",
            token=token,
            user=UserResponse(
                id=user['id'],
                email=user['email'],
                full_name=user['full_name']
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error"
        )

@router.post("/google", response_model=TokenResponse)
async def google_login(payload: GoogleAuth, db: asyncpg.Connection = Depends(get_db)):
    """
    Authenticate or register user via Google access token or ID token.
    """
    try:
        # Try to verify as ID token first, then fall back to access token
        async with httpx.AsyncClient() as client:
            # First, try to get user info using the token as an access token
            user_info_resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {payload.id_token}"}
            )
            
            if user_info_resp.status_code == 200:
                # Token is an access token
                token_info = user_info_resp.json()
            else:
                # Try as ID token
                token_info_resp = await client.get(
                    "https://oauth2.googleapis.com/tokeninfo",
                    params={"id_token": payload.id_token}
                )
                if token_info_resp.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid Google token"
                    )
                token_info = token_info_resp.json()

        email = token_info.get("email")
        full_name = token_info.get("name", "Google User")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google token missing email"
            )

        # Check if user exists
        user = await db.fetchrow("SELECT * FROM users WHERE email = $1", email)
        if not user:
            # Create a new user with a random password
            random_password = uuid4().hex
            password_hash = get_password_hash(random_password)
            insert_query = """
                INSERT INTO users (email, password_hash, full_name)
                VALUES ($1, $2, $3)
                RETURNING id, email, full_name, created_at
            """
            user = await db.fetchrow(insert_query, email, password_hash, full_name)
            # Initialize user streak
            await db.execute("INSERT INTO user_streaks (user_id) VALUES ($1)", user['id'])

        # Generate JWT token
        token = create_access_token(data={"userId": user['id']})
        return TokenResponse(
            message="Google authentication successful",
            token=token,
            user=UserResponse(
                id=user['id'],
                email=user['email'],
                full_name=user['full_name'],
                created_at=user.get('created_at')
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google login error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )
