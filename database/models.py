from sqlalchemy import Column, Integer, String, Text, DateTime, Interval, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from pgvector.sqlalchemy import Vector

Base = declarative_base()


class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(Integer, primary_key=True)
    meeting_id = Column(String, unique=True, nullable=False)
    clip_id = Column(String, nullable=False)
    view_id = Column(String, nullable=False)
    department = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    duration = Column(Interval)
    title = Column(Text)
    meta_data = Column("metadata", JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to chunks
    chunks = relationship("MeetingChunk", back_populates="meeting", cascade="all, delete-orphan")


class MeetingChunk(Base):
    __tablename__ = "meeting_chunks"
    
    id = Column(Integer, primary_key=True)
    meeting_id = Column(String, ForeignKey("meetings.meeting_id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(256))  # model2vec embedding dimension
    start_time = Column(Interval)
    end_time = Column(Interval)
    topics = Column(ARRAY(Text))
    meta_data = Column("metadata", JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to meeting
    meeting = relationship("Meeting", back_populates="chunks")