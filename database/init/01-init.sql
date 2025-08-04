-- Initialize pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create database user with necessary privileges
-- (User is already created by Docker environment variables)

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE sf10x TO sf10x_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO sf10x_user;