# SFGovTV Insights - Project Context

## Project Overview
This is an AI-powered platform that transforms long SFGovTV meeting videos (3-4 hours) into searchable, digestible content to improve civic engagement and transparency.

## Core Features

### 1. AI-Powered Search & Discovery (MVP)
- Semantic search across video content
- Search by person name, keywords, or phrases
- Returns relevant video clips with summaries and speaker attribution

### 2. Dynamic Summaries & Topic Highlighting
- AI-generated video summaries
- Clickable topic list for navigation
- "Highlights" reel of key moments

### 3. Person and Attribution Index
- Real-time speaker identification
- Speaker titles and roles
- Clickable profiles showing contributions

## Technical Stack
- **Transcription**: AssemblyAI, Descript, or OpenAI Whisper
- **Vector Database**: For semantic search via embeddings
- **LLMs**: OpenAI or Hugging Face for summarization
- **NLP**: Named Entity Recognition for speaker identification
- **Frontend**: Streamlit (based on project dependencies)
- **API**: FastAPI with Uvicorn

## Development Guidelines
- Start with data ingestion and transcription as foundation
- Focus on user-friendly, visual-first design
- Prioritize search functionality over video library browsing
- Keep interface clean and avoid information overload

## Current Project State
- Basic FastAPI application structure in place
- LangChain integrations for various LLMs (OpenAI, Anthropic, Google)
- Vector store support via FAISS
- Streamlit for frontend interface