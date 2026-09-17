import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings
from app.schemas.template import TemplateDetail, TemplateSummary, TemplateField

class TemplateService:
    def __init__(self):
        self.templates_dir = settings.TEMPLATES_DIR
        self.catalog_path = settings.CATALOG_PATH
        self._catalog_cache: Optional[List[Dict[str, Any]]] = None

    def get_catalog(self) -> List[Dict[str, Any]]:
        """Load and cache the template catalog."""
        if self._catalog_cache is None or not self._catalog_cache:
            if not self.catalog_path.exists():
                return []
            with open(self.catalog_path, "r", encoding="utf-8") as f:
                self._catalog_cache = json.load(f)
        return self._catalog_cache

    def list_templates(self) -> List[TemplateSummary]:
        """Return summary list of all available templates."""
        catalog = self.get_catalog()
        summaries = []
        for item in catalog:
            summaries.append(
                TemplateSummary(
                    id=item["id"],
                    name=item["name"],
                    category=item["category"],
                    badge=item.get("badge"),
                    estimated_time=item.get("estimated_time"),
                    file_name=item["file_name"],
                    description=item["description"],
                )
            )
        return summaries

    def get_template(self, template_id: str) -> Optional[TemplateDetail]:
        """Retrieve full template metadata and raw Markdown template text."""
        catalog = self.get_catalog()
        item = next((t for t in catalog if t["id"] == template_id), None)
        if not item:
            return None

        file_path = self.templates_dir / item["file_name"]
        raw_content = ""
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                raw_content = f.read()

        fields = [TemplateField(**f) for f in item.get("fields", [])]

        return TemplateDetail(
            id=item["id"],
            name=item["name"],
            category=item["category"],
            badge=item.get("badge"),
            estimated_time=item.get("estimated_time"),
            file_name=item["file_name"],
            description=item["description"],
            fields=fields,
            raw_content=raw_content
        )

    def render_document(self, template_id: str, field_data: Dict[str, Any]) -> str:
        """
        Interpolate placeholder variables {{key}} in the template with user-provided
        field values or template defaults. Unfilled values display a styled placeholder.
        """
        template = self.get_template(template_id)
        if not template or not template.raw_content:
            return "# Document Not Found\nThe requested legal template is unavailable."

        content = template.raw_content

        # Create dictionary of default values from schema
        field_defaults = {f.key: f.default for f in template.fields if f.default is not None}
        combined_values = {**field_defaults, **field_data}

        # Replace all occurrences of {{key}}
        def replace_placeholder(match):
            key = match.group(1).strip()
            val = combined_values.get(key)
            if val is not None and str(val).strip() != "":
                return str(val)
            # Find label for clear draft visual cue
            field_obj = next((f for f in template.fields if f.key == key), None)
            label = field_obj.label if field_obj else key.replace('_', ' ').title()
            return f"[— Pending: {label} —]"

        rendered = re.sub(r"\{\{([a-zA-Z0-9_]+)\}\}", replace_placeholder, content)
        return rendered

    def calculate_completeness(self, template_id: str, field_data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
        """
        Calculate the percentage of completed fields, listing completed and remaining fields.
        """
        template = self.get_template(template_id)
        if not template or not template.fields:
            return 0.0, [], []

        total_fields = len(template.fields)
        completed_keys = []
        missing_keys = []

        for f in template.fields:
            val = field_data.get(f.key)
            if val is not None and str(val).strip() != "":
                completed_keys.append(f.key)
            else:
                missing_keys.append(f.key)

        percentage = round((len(completed_keys) / total_fields) * 100, 1) if total_fields > 0 else 100.0
        return percentage, completed_keys, missing_keys

template_service = TemplateService()
