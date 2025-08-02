# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack AI application with a Python FastAPI backend and React TypeScript frontend:

- **Backend (`/app`)**: FastAPI server providing LLM-powered news RAG (Retrieval-Augmented Generation) API
- **Frontend (`/frontend`)**: React + TypeScript + Vite application (currently default template)

## Development Commands

### Backend (Python/FastAPI)
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
cd app && python main.py
# Server runs on http://0.0.0.0:8000 with hot reload and 4 workers

# Run server with uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (React/TypeScript)
```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Backend Architecture

The backend is built around a centralized `LLMGenerator` class that supports multiple LLM providers:

- **`LLMGenerator`** (`llm_generator.py`): Core orchestrator that manages multiple LLM models concurrently
  - Supports OpenAI GPT-4o, Google Gemini 2.0, and Perplexity models (Sonar variants)
  - Handles both structured output (Pydantic models) and raw text responses
  - Uses ThreadPoolExecutor for parallel model execution
  - Supports LangChain tools and agent-based workflows

- **Model Selection** (`select_model.py`): Factory pattern for creating LLM instances
  - Centralized configuration for different model providers
  - Environment variable-based API key management

- **API Structure** (`main.py`): FastAPI application with single endpoint
  - `/generate` POST endpoint accepting `NewsRagRequest`
  - Global LLMGenerator instance initialized at startup
  - Session-based conversation support

- **Request Schema** (`schemas/schema.py`): Pydantic models for API contracts
  - `NewsRagRequest`: Contains `session_id` and `user_query`

### Key Features

- **Multi-model Support**: Concurrent execution across multiple LLM providers
- **RAG System**: Template-based prompting system with context injection
- **Session Management**: Support for multi-turn conversations via session IDs
- **Structured Output**: Optional Pydantic model validation for responses
- **Tool Integration**: LangChain tool calling and agent execution support

### Environment Configuration

The application requires API keys in environment variables:
- `OPENAI_API_KEY` for GPT-4o
- `GOOGLE_API_KEY` for Gemini models  
- `PERPLEXITY_API_KEY` for Sonar models
- `ANTHROPIC_API_KEY` for Claude models (configured but not in constants)

### Prompt System

- System and user prompts are stored as text files in `/app/prompts/`
- `rag_chatbot_system_prompt.txt`: Base system instructions for RAG functionality
- `rag_chatbot_user_prompt.txt`: User prompt template with context placeholder