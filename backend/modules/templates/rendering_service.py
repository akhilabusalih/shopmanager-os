"""
ShopManager OS — Template Rendering Service
"""

from jinja2 import Environment, BaseLoader

from backend.modules.invoices.models import Invoice
from backend.modules.settings.models import AppSettings
from backend.modules.templates.models import InvoiceTemplate


class DatabaseTemplateLoader(BaseLoader):
    """
    Load templates directly from our database model content string.
    In a more complex setup, this could query the DB, but we pass the content directly.
    """
    def __init__(self, template_content: str):
        self.template_content = template_content

    def get_source(self, environment, template):
        return self.template_content, template, lambda: True


class TemplateRenderingService:
    @staticmethod
    def render_html(template: InvoiceTemplate, invoice: Invoice, settings: AppSettings) -> str:
        """
        Takes an InvoiceTemplate, an Invoice, and AppSettings.
        Returns the compiled HTML string.
        """
        env = Environment(loader=DatabaseTemplateLoader(template.content), autoescape=True)
        
        # We also pass a format filter for currency if needed, though Jinja2 has string formatting
        jinja_template = env.get_template("invoice_template")
        
        # Serialize the SQLAlchemy models to dicts for easy access in Jinja
        # Or we can just pass the models directly since Jinja supports property access
        
        html_content = jinja_template.render(
            invoice=invoice,
            settings=settings
        )
        
        return html_content
