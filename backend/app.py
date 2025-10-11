from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import bcrypt
import json

from database import get_session, init_db, Base, engine
from models import User, Progress, Simulation, UserProfile, UserStats

SECRET_KEY = "supersecret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(title="Civica Virtual Lab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hashed password"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_token(user_id: int, email: str):
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": email, "user_id": user_id, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)) -> User:
    data = decode_token(token)
    if not data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/auth/register")
def register(
    email: str = Form(...), 
    password: str = Form(...), 
    full_name: str = Form(None), 
    db: Session = Depends(get_session)
):
    if not password or len(password.strip()) == 0:
        raise HTTPException(status_code=400, detail="Password cannot be empty")
    
    if len(password) > 72:
        raise HTTPException(status_code=400, detail="Password is too long (max 72 characters)")
    
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(password)
    
    user = User(email=email, full_name=full_name, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)

    if not db.query(UserProfile).filter(UserProfile.user_id == user.id).first():
        db.add(UserProfile(user_id=user.id))
    if not db.query(UserStats).filter(UserStats.user_id == user.id).first():
        db.add(UserStats(user_id=user.id))
    db.commit()

    return {"message": "registered", "email": user.email}

@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user.id, user.email)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users/me")
def me(user: User = Depends(current_user), db: Session = Depends(get_session)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "bio": profile.bio if profile else "",
        "avatar": profile.avatar if profile else "/placeholder.svg?key=9fgsv",
    }

@app.get("/profile")
def get_profile(user: User = Depends(current_user), db: Session = Depends(get_session)):
    up = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not up:
        up = UserProfile(user_id=user.id)
        db.add(up)
        db.commit()
        db.refresh(up)
    return {"bio": up.bio, "avatar": up.avatar}

@app.put("/profile")
def update_profile(
    bio: str = Form(""), 
    avatar: str = Form("/placeholder.svg?key=9fgsv"),
    full_name: str = Form(None),
    user: User = Depends(current_user), 
    db: Session = Depends(get_session)
):
    up = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not up:
        up = UserProfile(user_id=user.id)
        db.add(up)
    up.bio = bio
    up.avatar = avatar
    if full_name is not None:
        user.full_name = full_name
        db.add(user)
    db.add(up)
    db.commit()
    return {"message": "profile updated"}

def ensure_stats(db: Session, user_id: int) -> UserStats:
    s = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not s:
        s = UserStats(user_id=user_id)
        db.add(s)
        db.commit()
        db.refresh(s)
    return s

@app.get("/stats")
def get_stats(user: User = Depends(current_user), db: Session = Depends(get_session)):
    s = ensure_stats(db, user.id)
    return {
        "modulesCompleted": s.modulesCompleted,
        "avgQuizScore": s.avgQuizScore,
        "gamesPlayed": s.gamesPlayed,
        "highestGameScore": s.highestGameScore,
        "quizHistory": json.loads(s.quizHistory_json or "[]"),
        "gamificationCollection": json.loads(s.gamificationCollection_json or "[]"),
        "completedModules": json.loads(s.completedModules_json or "[]"),
    }

@app.put("/stats")
def put_stats(
    modulesCompleted: int = Form(None),
    avgQuizScore: float = Form(None),
    gamesPlayed: int = Form(None),
    highestGameScore: str = Form(None),
    user: User = Depends(current_user), 
    db: Session = Depends(get_session)
):
    s = ensure_stats(db, user.id)
    if modulesCompleted is not None:
        s.modulesCompleted = modulesCompleted
    if avgQuizScore is not None:
        s.avgQuizScore = avgQuizScore
    if gamesPlayed is not None:
        s.gamesPlayed = gamesPlayed
    if highestGameScore is not None:
        s.highestGameScore = highestGameScore
    db.add(s)
    db.commit()
    return {"message": "stats updated"}

@app.post("/stats/quiz-history")
def add_quiz_history(
    item: str = Form(...), 
    user: User = Depends(current_user), 
    db: Session = Depends(get_session)
):
    s = ensure_stats(db, user.id)
    arr = json.loads(s.quizHistory_json or "[]")
    arr.append(item)
    s.quizHistory_json = json.dumps(arr)
    db.add(s)
    db.commit()
    return {"message": "added"}

@app.post("/stats/gamification")
def add_gamification(
    item: str = Form(...), 
    user: User = Depends(current_user), 
    db: Session = Depends(get_session)
):
    s = ensure_stats(db, user.id)
    arr = json.loads(s.gamificationCollection_json or "[]")
    arr.append(item)
    s.gamificationCollection_json = json.dumps(arr)
    db.add(s)
    db.commit()
    return {"message": "added"}

@app.post("/stats/completed-modules")
def add_completed_module(
    module: str = Form(...), 
    user: User = Depends(current_user), 
    db: Session = Depends(get_session)
):
    s = ensure_stats(db, user.id)
    arr = json.loads(s.completedModules_json or "[]")
    if module not in arr:
        arr.append(module)
        s.completedModules_json = json.dumps(arr)
        db.add(s)
        db.commit()
    return {"message": "added"}

@app.post("/games/highscore")
def update_highscore(
    score: int = Form(...), 
    user: User = Depends(current_user), 
    db: Session = Depends(get_session)
):
    s = ensure_stats(db, user.id)
    try:
        current_high = 0 if s.highestGameScore == "N/A" else int(s.highestGameScore)
    except:
        current_high = 0
    if score > current_high:
        s.highestGameScore = str(score)
    s.gamesPlayed += 1
    db.add(s)
    db.commit()
    return {"message": "game stats updated", "highestGameScore": s.highestGameScore, "gamesPlayed": s.gamesPlayed}

@app.post("/progress")
def save_progress(
    module: str = Form(...), 
    step: int = Form(...), 
    percent: float = Form(...),
    user: User = Depends(current_user), 
    db: Session = Depends(get_session)
):
    row = db.query(Progress).filter(
        Progress.user_id == user.id, 
        Progress.module == module
    ).first()
    if row:
        row.step = step
        row.percent = percent
        row.updated_at = datetime.utcnow()
    else:
        row = Progress(user_id=user.id, module=module, step=step, percent=percent)
        db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "user_id": row.user_id,
        "module": row.module,
        "step": row.step,
        "percent": row.percent,
        "updated_at": row.updated_at.isoformat()
    }

@app.get("/progress")
def list_progress(user: User = Depends(current_user), db: Session = Depends(get_session)):
    rows = db.query(Progress).filter(Progress.user_id == user.id).all()
    return [
        {
            "id": row.id,
            "module": row.module,
            "step": row.step,
            "percent": row.percent,
            "updated_at": row.updated_at.isoformat()
        }
        for row in rows
    ]

@app.post("/simulations")
def save_simulation(
    module: str = Form(...), 
    score: float = Form(...), 
    attempt: int = Form(1),
    user: User = Depends(current_user), 
    db: Session = Depends(get_session)
):
    sim = Simulation(user_id=user.id, module=module, score=score, attempt=attempt)
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return {
        "id": sim.id,
        "user_id": sim.user_id,
        "module": sim.module,
        "score": sim.score,
        "attempt": sim.attempt,
        "created_at": sim.created_at.isoformat()
    }

@app.get("/simulations")
def list_simulations(
    module: str = None, 
    user: User = Depends(current_user), 
    db: Session = Depends(get_session)
):
    query = db.query(Simulation).filter(Simulation.user_id == user.id)
    if module:
        query = query.filter(Simulation.module == module)
    sims = query.order_by(Simulation.created_at.desc()).all()
    return [
        {
            "id": sim.id,
            "module": sim.module,
            "score": sim.score,
            "attempt": sim.attempt,
            "created_at": sim.created_at.isoformat()
        }
        for sim in sims
    ]