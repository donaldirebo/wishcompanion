"""Add production performance indexes

Revision ID: production_indexes
Revises: 10a3ab143140
Create Date: 2026-02-14

"""
from alembic import op
import sqlalchemy as sa

revision = 'production_indexes'
down_revision = '10a3ab143140'

def upgrade():
    # Indexes for content queries
    op.create_index('idx_posts_sentiment_created', 'posts', ['sentiment_score', 'created_at'])
    op.create_index('idx_posts_source', 'posts', ['source'])
    
    # Indexes for interactions
    op.create_index('idx_interactions_user_type', 'interactions', ['user_id', 'interaction_type'])
    op.create_index('idx_interactions_post_created', 'interactions', ['post_id', 'created_at'])
    
    # Index for preferences lookup
    op.create_index('idx_preferences_user', 'preferences', ['user_id'])

def downgrade():
    op.drop_index('idx_posts_sentiment_created')
    op.drop_index('idx_posts_source')
    op.drop_index('idx_interactions_user_type')
    op.drop_index('idx_interactions_post_created')
    op.drop_index('idx_preferences_user')
