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
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

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
def register(email: str = Form(...), password: str = Form(...), full_name: str = Form(None), db: Session = Depends(get_session)):
    if not password.strip():
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
    db.add_all([UserProfile(user_id=user.id), UserStats(user_id=user.id)])
    db.commit()
    return {"message": "registered", "email": user.email}

@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
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
def update_profile(bio: str = Form(""), avatar: str = Form("/placeholder.svg?key=9fgsv"), full_name: str = Form(None), user: User = Depends(current_user), db: Session = Depends(get_session)):
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
def put_stats(modulesCompleted: int = Form(None), avgQuizScore: float = Form(None), gamesPlayed: int = Form(None), highestGameScore: str = Form(None), user: User = Depends(current_user), db: Session = Depends(get_session)):
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

@app.post("/stats/gamification")
def add_gamification(item: str = Form(...), user: User = Depends(current_user), db: Session = Depends(get_session)):
    s = ensure_stats(db, user.id)
    arr = json.loads(s.gamificationCollection_json or "[]")
    arr.append(item)
    s.gamificationCollection_json = json.dumps(arr)
    db.add(s)
    db.commit()
    db.refresh(s)
    return {"message": "Gamification item added successfully"}

@app.post("/games/memory-progress")
def save_memory_progress(moves: int = Form(...), time: int = Form(...), pairsFound: int = Form(...), isCompleted: str = Form(...), user: User = Depends(current_user), db: Session = Depends(get_session)):
    s = ensure_stats(db, user.id)
    s.gamesPlayed = s.gamesPlayed or 0
    if isCompleted == "true":
        s.gamesPlayed += 1
        try:
            current_high = 0 if s.highestGameScore in (None, "", "N/A") else int(s.highestGameScore)
        except:
            current_high = 0
        if pairsFound > current_high:
            s.highestGameScore = str(pairsFound)
    db.add(s)
    db.commit()
    print(f"Memory progress saved: moves={moves}, time={time}, pairs={pairsFound}, user={user.email}")
    return {"message": "Progress saved successfully", "gamesPlayed": s.gamesPlayed}

@app.post("/games/memory-complete")
def memory_game_complete(moves: int = Form(...), time: int = Form(...), status: str = Form(...), user: User = Depends(current_user), db: Session = Depends(get_session)):
    s = ensure_stats(db, user.id)
    s.gamesPlayed = (s.gamesPlayed or 0) + 1
    db.add(s)
    db.commit()
    db.refresh(s)
    print(f"Memory game completed: user={user.email}, moves={moves}, time={time}")
    return {"message": "Game completion saved successfully"}

@app.post("/games/highscore")
def update_highscore(score: int = Form(...), user: User = Depends(current_user), db: Session = Depends(get_session)):
    s = ensure_stats(db, user.id)
    try:
        current_high = 0 if s.highestGameScore in (None, "", "N/A") else int(s.highestGameScore)
    except:
        current_high = 0
    if score > current_high:
        s.highestGameScore = str(score)
    s.gamesPlayed = (s.gamesPlayed or 0) + 1
    db.add(s)
    db.commit()
    db.refresh(s)
    print(f"Highscore updated: user={user.email}, score={score}")
    return {"message": "High score saved successfully", "highestGameScore": s.highestGameScore}