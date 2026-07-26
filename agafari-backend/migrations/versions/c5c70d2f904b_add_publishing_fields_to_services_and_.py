"""add publishing fields to services and change logs

Revision ID: c5c70d2f904b
Revises: 5a9b0c7a4897
Create Date: 2026-07-26 03:32:33.059279

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c5c70d2f904b'
down_revision: Union[str, Sequence[str], None] = '5a9b0c7a4897'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'services',
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column('services', sa.Column('procedure_steps', sa.JSON(), nullable=True))

    op.add_column('change_logs', sa.Column('agency_id', sa.String(length=36), nullable=True))
    op.add_column('change_logs', sa.Column('title', sa.String(length=200), nullable=True))
    op.add_column('change_logs', sa.Column('public_notice', sa.Text(), nullable=True))
    op.add_column('change_logs', sa.Column('published_at', sa.DateTime(), nullable=True))
    op.add_column('change_logs', sa.Column('effective_date', sa.DateTime(), nullable=True))
    op.add_column('change_logs', sa.Column('origin', sa.String(length=20), nullable=True))
    op.alter_column('change_logs', 'service_id', existing_type=sa.String(length=36), nullable=True)

    # Backfill before the NOT NULL constraints go on.
    op.execute("""
        UPDATE change_logs
        SET agency_id = services.agency_id
        FROM services
        WHERE change_logs.service_id = services.id
          AND change_logs.agency_id IS NULL
    """)
    op.execute("UPDATE change_logs SET title = COALESCE(NULLIF(source_title, ''), '') WHERE title IS NULL")
    op.execute("UPDATE change_logs SET origin = 'AI_DETECTED' WHERE origin IS NULL")

    op.alter_column('change_logs', 'agency_id', existing_type=sa.String(length=36), nullable=False)
    op.alter_column('change_logs', 'title', existing_type=sa.String(length=200), nullable=False)
    op.alter_column('change_logs', 'origin', existing_type=sa.String(length=20), nullable=False)
    op.create_index(op.f('ix_change_logs_agency_id'), 'change_logs', ['agency_id'], unique=False)
    op.create_index(op.f('ix_change_logs_published_at'), 'change_logs', ['published_at'], unique=False)
    op.create_foreign_key(
        'fk_change_logs_agency_id_agencies',
        'change_logs',
        'agencies',
        ['agency_id'],
        ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Manual announcements cannot exist once service_id is mandatory again.
    op.execute("DELETE FROM change_logs WHERE service_id IS NULL")
    op.drop_constraint('fk_change_logs_agency_id_agencies', 'change_logs', type_='foreignkey')
    op.drop_index(op.f('ix_change_logs_published_at'), table_name='change_logs')
    op.drop_index(op.f('ix_change_logs_agency_id'), table_name='change_logs')
    op.alter_column('change_logs', 'service_id', existing_type=sa.String(length=36), nullable=False)
    op.drop_column('change_logs', 'origin')
    op.drop_column('change_logs', 'effective_date')
    op.drop_column('change_logs', 'published_at')
    op.drop_column('change_logs', 'public_notice')
    op.drop_column('change_logs', 'title')
    op.drop_column('change_logs', 'agency_id')

    op.drop_column('services', 'procedure_steps')
    op.drop_column('services', 'is_published')
