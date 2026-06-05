"""alter_invoice_date_to_date

Revision ID: ff3fe63adc17
Revises: d062bf70d40d
Create Date: 2026-06-04 14:23:17.174278+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ff3fe63adc17'
down_revision: Union[str, Sequence[str], None] = 'd062bf70d40d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE invoices ALTER COLUMN invoice_date TYPE DATE USING invoice_date::DATE")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE invoices ALTER COLUMN invoice_date TYPE VARCHAR(20) USING invoice_date::VARCHAR")
