import os
import re
import json
from typing import Dict, Any, List, Tuple
from datetime import datetime
from app.core.config import settings
from app.services.template_service import template_service
from app.schemas.chat import ChatMessage, ChatResponse

class AIService:
    def __init__(self):
        self.openrouter_key = settings.OPENROUTER_API_KEY or os.environ.get("OPENROUTER_API_KEY", "")
        self.cerebras_key = settings.CEREBRAS_API_KEY or os.environ.get("CEREBRAS_API_KEY", "")

    async def process_chat(
        self,
        template_id: str,
        user_message: str,
        current_fields: Dict[str, Any],
        history: List[ChatMessage]
    ) -> ChatResponse:
        """
        Processes a user chat message during legal document drafting.
        First attempts Cerebras/OpenRouter inference if key is present;
        seamlessly falls back to our robust internal legal drafting engine.
        """
        template = template_service.get_template(template_id)
        if not template:
            return ChatResponse(
                reply="I could not identify the requested legal document template.",
                extracted_fields={},
                all_fields=current_fields,
                completion_percentage=0.0,
                rendered_content="# Template not found",
                is_complete=False,
                suggested_replies=[]
            )

        # Merge starting fields with defaults if starting empty
        all_fields = dict(current_fields)
        if not all_fields:
            all_fields = {f.key: f.default for f in template.fields if f.default is not None}

        extracted_fields: Dict[str, Any] = {}
        assistant_reply = ""
        suggested_replies = []

        # 1. Attempt Live LLM with Cerebras Skill if key is set
        if self.openrouter_key:
            try:
                import litellm
                system_prompt = (
                    f"You are a Senior Corporate Legal Counsel helping a client prepare a {template.name}.\n"
                    f"Available fields to extract:\n"
                    + "\n".join([f"- {f.key} ({f.label}, type: {f.type})" for f in template.fields])
                    + "\nReturn your response as a valid JSON object with two keys:\n"
                    + "1. 'extracted_fields': a dictionary of any newly extracted field values from the user's message.\n"
                    + "2. 'reply': your professional, courteous legal response advising the user and asking for the next missing details."
                )

                messages = [{"role": "system", "content": system_prompt}]
                for m in history[-6:]:
                    messages.append({"role": m.role, "content": m.content})
                messages.append({"role": "user", "content": user_message})

                # Follow exact Class 10 Cerebras skill specification
                resp = litellm.completion(
                    model=settings.CEREBRAS_MODEL,
                    messages=messages,
                    api_key=self.openrouter_key,
                    response_format={"type": "json_object"},
                    extra_body={
                        "provider": {
                            "order": ["Cerebras"],
                            "allow_fallbacks": True
                        }
                    },
                    timeout=15
                )

                raw_output = resp.choices[0].message.content
                parsed = json.loads(raw_output)
                extracted_fields = parsed.get("extracted_fields", {})
                assistant_reply = parsed.get("reply", "")
            except Exception as e:
                # Log and fallback gracefully
                extracted_fields = {}
                assistant_reply = ""

        # 2. Local Intelligent Legal Drafting Engine (ensures instant offline speed & 100% reliability)
        if not assistant_reply:
            extracted_fields, assistant_reply, suggested_replies = self._local_legal_drafter(
                template, user_message, all_fields, history
            )

        # Apply newly extracted fields
        for k, v in extracted_fields.items():
            if k in [f.key for f in template.fields] and v is not None:
                all_fields[k] = v

        # Calculate completeness & live document rendering
        pct, completed, missing = template_service.calculate_completeness(template_id, all_fields)
        rendered_doc = template_service.render_document(template_id, all_fields)
        is_complete = (pct >= 95.0 or len(missing) == 0)

        if not suggested_replies:
            suggested_replies = self._generate_suggested_replies(template, missing)

        return ChatResponse(
            reply=assistant_reply,
            extracted_fields=extracted_fields,
            all_fields=all_fields,
            completion_percentage=pct,
            rendered_content=rendered_doc,
            is_complete=is_complete,
            suggested_replies=suggested_replies
        )

    def _local_legal_drafter(
        self,
        template: Any,
        user_message: str,
        current_fields: Dict[str, Any],
        history: List[ChatMessage]
    ) -> Tuple[Dict[str, Any], str, List[str]]:
        """
        Expert rule-based legal parsing engine with conversational paralegal tone.
        Identifies entities like company names, governing jurisdictions, fees, dates,
        and provides tailored advice for legal drafts.
        """
        extracted: Dict[str, Any] = {}
        msg_lower = user_message.lower().strip()

        # Handle 'apply defaults' or 'fill with sample data'
        if any(w in msg_lower for w in ["fill defaults", "use defaults", "sample data", "auto fill", "default values"]):
            for f in template.fields:
                if f.default is not None:
                    extracted[f.key] = f.default
            reply = (
                f"I have populated the standard default parameters for this {template.name}. "
                "You can inspect the live agreement on the right side. Would you like to adjust any specific "
                "clauses, such as party names, dispute venue, or term lengths?"
            )
            return extracted, reply, ["Change Party A name", "Set governing law to New York", "Download PDF"]

        # 1. Extraction: State / Jurisdiction
        jurisdiction_match = re.search(r"\b(delaware|california|new york|texas|washington|massachusetts|florida|united states|uk|england)\b", msg_lower)
        if jurisdiction_match:
            state = jurisdiction_match.group(1).title()
            for key in ["governing_jurisdiction", "dispute_venue"]:
                if key in [f.key for f in template.fields]:
                    extracted[key] = f"State of {state}" if key == "governing_jurisdiction" else f"{state}, United States"

        # 2. Extraction: Currency / Fees / Amounts
        fee_match = re.search(r"(\$[\d,]+(?:\.\d{2})?|\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:usd|dollars|eur|gbp))", user_message, re.IGNORECASE)
        if fee_match:
            val = fee_match.group(1).strip()
            for key in ["subscription_fee_amount", "license_fee_amount", "compensation_total_cap", "max_liability_amount"]:
                if key in [f.key for f in template.fields]:
                    extracted[key] = val if val.startswith("$") else f"${val}"

        # 3. Extraction: Company / Entity Names
        # Match Party A / Party B / Provider / Customer with common corporate suffixes
        patterns = [
            ("party_a_name", r"party\s*a\s*(?:is|:|=)\s*([A-Za-z0-9\s\.\-&]+?(?:Inc\.|LLC|Corp\.|Ltd\.|Company|Corporation)?)(?=\s+(?:and\s+party|and\s+the|\band\b)|\s*;\s*|\s*,\s*|\s*\.\s+[A-Z]|\s*$)"),
            ("party_b_name", r"party\s*b\s*(?:is|:|=)\s*([A-Za-z0-9\s\.\-&]+?(?:Inc\.|LLC|Corp\.|Ltd\.|Company|Corporation)?)(?=\s+(?:and\s+party|and\s+the|\band\b)|\s*;\s*|\s*,\s*|\s*\.\s+[A-Z]|\s*$)"),
            ("client_company_name", r"client\s*(?:is|:|=)\s*([A-Za-z0-9\s\.\-&]+?(?:Inc\.|LLC|Corp\.|Ltd\.|Company|Corporation)?)(?=\s+(?:and|\band\b)|\s*;\s*|\s*,\s*|\s*\.\s+[A-Z]|\s*$)"),
            ("consultant_name_or_firm", r"consultant\s*(?:is|:|=)\s*([A-Za-z0-9\s\.\-&]+?(?:Inc\.|LLC|Corp\.|Ltd\.|Company|Corporation)?)(?=\s+(?:and|\band\b)|\s*;\s*|\s*,\s*|\s*\.\s+[A-Z]|\s*$)"),
            ("provider_company_name", r"provider\s*(?:is|:|=)\s*([A-Za-z0-9\s\.\-&]+?(?:Inc\.|LLC|Corp\.|Ltd\.|Company|Corporation)?)(?=\s+(?:and|\band\b)|\s*;\s*|\s*,\s*|\s*\.\s+[A-Z]|\s*$)"),
            ("customer_company_name", r"customer\s*(?:is|:|=)\s*([A-Za-z0-9\s\.\-&]+?(?:Inc\.|LLC|Corp\.|Ltd\.|Company|Corporation)?)(?=\s+(?:and|\band\b)|\s*;\s*|\s*,\s*|\s*\.\s+[A-Z]|\s*$)"),
        ]
        for field_key, regex_pat in patterns:
            if field_key in [f.key for f in template.fields]:
                m = re.search(regex_pat, user_message, re.IGNORECASE)
                if m:
                    extracted[field_key] = m.group(1).strip()

        # Handle 'between X and Y'
        between_m = re.search(r"between\s+([A-Za-z0-9\s\.\-&]+?)\s+and\s+([A-Za-z0-9\s\.\-&]+?)(?:\.|$)", user_message, re.IGNORECASE)
        if between_m:
            g1, g2 = between_m.group(1).strip(), between_m.group(2).strip()
            if "party_a_name" in [f.key for f in template.fields]:
                extracted["party_a_name"] = g1
            if "party_b_name" in [f.key for f in template.fields]:
                extracted["party_b_name"] = g2
            if "provider_company_name" in [f.key for f in template.fields]:
                extracted["provider_company_name"] = g1
            if "customer_company_name" in [f.key for f in template.fields]:
                extracted["customer_company_name"] = g2

        # 4. Extraction: Purpose or Scope
        purpose_match = re.search(r"(?:purpose|scope|evaluating|objective)\s*(?:is|:)\s*([^\.]+)", user_message, re.IGNORECASE)
        if purpose_match:
            val = purpose_match.group(1).strip()
            if "purpose_description" in [f.key for f in template.fields]:
                extracted["purpose_description"] = val
            elif "scope_of_services_summary" in [f.key for f in template.fields]:
                extracted["scope_of_services_summary"] = val

        # 5. Extraction: Dates (YYYY-MM-DD or Month DD, YYYY)
        date_match = re.search(r"\b(202\d-[01]\d-[0-3]\d)\b", user_message)
        if date_match:
            extracted["effective_date"] = date_match.group(1)

        # Merge for check
        temp_merged = {**current_fields, **extracted}
        pct, completed, missing = template_service.calculate_completeness(template.id, temp_merged)

        # Craft human-grade paralegal reply
        if extracted:
            confirmed_items = []
            for k, v in extracted.items():
                f_obj = next((f for f in template.fields if f.key == k), None)
                label = f_obj.label if f_obj else k.replace('_', ' ').title()
                confirmed_items.append(f"**{label}** as *\"{v}\"*")
            
            reply_header = f"I have recorded {', '.join(confirmed_items)}. "
        else:
            reply_header = "Thank you for the update. "

        if missing:
            next_field_key = missing[0]
            next_field = next((f for f in template.fields if f.key == next_field_key), None)
            field_label = next_field.label if next_field else next_field_key
            
            assistant_reply = (
                f"{reply_header}Next, could you please provide the **{field_label}**? "
                f"({next_field.placeholder if next_field and next_field.placeholder else 'Enter details'})"
            )
            suggested_replies = [f"Use standard for {field_label}", "Keep default", "Fill remaining with standard terms"]
        else:
            assistant_reply = (
                f"{reply_header}All core clauses for this **{template.name}** are now fully specified! "
                "You can review the complete agreement preview in the right pane, export it as a PDF or Markdown, "
                "or sign in to save it to your dashboard."
            )
            suggested_replies = ["Download PDF", "Export Markdown", "Review signature block"]

        return extracted, assistant_reply, suggested_replies

    def _generate_suggested_replies(self, template: Any, missing_keys: List[str]) -> List[str]:
        """Generate smart quick-reply buttons based on missing information."""
        if not missing_keys:
            return ["Download PDF", "Save to My Documents", "Export Markdown"]
        
        first_missing = missing_keys[0]
        f_obj = next((f for f in template.fields if f.key == first_missing), None)
        if f_obj and f_obj.default:
            return [f"Use \"{f_obj.default}\"", "Keep standard default", "Fill all remaining with standard terms"]
        return ["Keep standard default", "Fill all remaining with standard terms", "Help me choose"]

ai_service = AIService()
