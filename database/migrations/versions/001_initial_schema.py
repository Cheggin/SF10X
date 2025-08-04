"""Initial schema with meetings and chunks tables

Revision ID: 001
Revises: 
Create Date: 2025-08-02 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create meetings table
    op.create_table('meetings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meeting_id', sa.String(), nullable=False),
        sa.Column('clip_id', sa.String(), nullable=False),
        sa.Column('view_id', sa.String(), nullable=False),
        sa.Column('department', sa.String(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('duration', sa.Interval(), nullable=True),
        sa.Column('title', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('meeting_id')
    )
    
    # Create meeting_chunks table
    op.create_table('meeting_chunks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meeting_id', sa.String(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('chunk_text', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(1536), nullable=True),
        sa.Column('start_time', sa.Interval(), nullable=True),
        sa.Column('end_time', sa.Interval(), nullable=True),
        sa.Column('topics', sa.ARRAY(sa.Text()), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['meeting_id'], ['meetings.meeting_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create pgvector index for similarity search
    op.execute('CREATE INDEX ON meeting_chunks USING ivfflat (embedding vector_cosine_ops)')


def downgrade() -> None:
    op.drop_table('meeting_chunks')
    op.drop_table('meetings')