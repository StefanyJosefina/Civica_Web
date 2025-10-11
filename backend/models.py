from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True, nullable=False)
    bio = Column(Text, default="")
    avatar = Column(Text, default="/placeholder.svg?key=9fgsv")

class UserStats(Base):
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True, nullable=False)
    modulesCompleted = Column(Integer, default=0)
    avgQuizScore = Column(Float, default=0.0)
    gamesPlayed = Column(Integer, default=0)
    highestGameScore = Column(String, default="N/A")
    quizHistory_json = Column(Text, default="[]")
    gamificationCollection_json = Column(Text, default="[]")
    completedModules_json = Column(Text, default="[]")

class Progress(Base):
    __tablename__ = "progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    module = Column(String, nullable=False)
    step = Column(Integer, default=0)
    percent = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    module = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    attempt = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)