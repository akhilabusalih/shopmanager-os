"""add_inventory_log_and_invoice_date

Revision ID: 1862914e8b7d
Revises: 3a01c5b32abb
Create Date: 2026-06-04 13:37:00.492850+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1862914e8b7d'
down_revision: Union[str, Sequence[str], None] = '3a01c5b32abb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('invoices', sa.Column('invoice_date', sa.String(length=20), nullable=True))
    
    # We set default invoice_date for existing rows, then make it NOT NULL
    op.execute("UPDATE invoices SET invoice_date = to_char(created_at, 'YYYY-MM-DD')")
    op.alter_column('invoices', 'invoice_date', existing_type=sa.String(length=20), nullable=False)

    op.create_table(
        'inventory_log',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('product_id', sa.UUID(), nullable=False),
        sa.Column('invoice_id', sa.UUID(), nullable=True),
        sa.Column('change_type', sa.String(length=50), nullable=False),
        sa.Column('qty_before', sa.Integer(), nullable=False),
        sa.Column('qty_change', sa.Integer(), nullable=False),
        sa.Column('qty_after', sa.Integer(), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inventory_log_invoice_id'), 'inventory_log', ['invoice_id'], unique=False)
    op.create_index(op.f('ix_inventory_log_product_id'), 'inventory_log', ['product_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_inventory_log_product_id'), table_name='inventory_log')
    op.drop_index(op.f('ix_inventory_log_invoice_id'), table_name='inventory_log')
    op.drop_table('inventory_log')
    
    op.drop_column('invoices', 'invoice_date')
