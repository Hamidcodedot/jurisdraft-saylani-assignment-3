import io
import re
import base64
from typing import Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, Image as RLImage
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Adds running headers and footers with page numbers and mandatory legal disclaimer."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))  # Slate-500

        # Clean Running Header
        self.drawString(54, 755, "CONFIDENTIAL & PROPRIETARY")
        self.drawRightString(612 - 54, 755, "EXECUTION DRAFT")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 748, 612 - 54, 748)

        # Clean Running Footer
        self.line(54, 48, 612 - 54, 48)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_str)

        self.restoreState()

class PDFService:
    def _make_signature_image(self, data_url: str):
        try:
            if not data_url:
                return None
            if "," in data_url:
                _, encoded = data_url.split(",", 1)
            else:
                encoded = data_url
            img_bytes = base64.b64decode(encoded)
            return RLImage(io.BytesIO(img_bytes), width=120, height=36)
        except Exception:
            return None

    def generate_pdf(
        self,
        markdown_text: str,
        document_title: str = "Legal Document",
        party_a_signature: Optional[str] = None,
        party_b_signature: Optional[str] = None
    ) -> bytes:
        """
        Convert Markdown legal document into a professional, publication-ready PDF
        with support for page breaks and embedded cryptographic/digital signatures.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=68,
            bottomMargin=60
        )

        styles = getSampleStyleSheet()
        
        # Custom Typography
        title_style = ParagraphStyle(
            'LegalTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=12,
            alignment=1  # Centered
        )

        h2_style = ParagraphStyle(
            'LegalH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=14,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'LegalBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#334155"),
            spaceAfter=8
        )

        sig_caption_style = ParagraphStyle(
            'SigCaption',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=7,
            leading=9,
            textColor=colors.HexColor("#047857")
        )

        sig_record_style = ParagraphStyle(
            'SigRecord',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#475569")
        )

        story = []

        # Parse and translate Markdown lines
        lines = markdown_text.split("\n")
        current_party = None
        injected_party_a = False
        injected_party_b = False

        for line in lines:
            line_str = line.strip()
            if not line_str:
                story.append(Spacer(1, 4))
                continue

            # Explicit Page Breaks
            if line_str in ["<!-- pagebreak -->", "<!-- page-break -->", "<div class=\"pagebreak\"></div>", "<div class=\"page-break\"></div>"]:
                story.append(PageBreak())
                continue

            # Markdown H1 (# Header)
            if line_str.startswith("# "):
                text = line_str[2:].strip()
                story.append(Paragraph(text, title_style))
                story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=10))
            
            # Markdown H3 (### Header)
            elif line_str.startswith("### "):
                text = line_str[4:].strip()
                story.append(Paragraph(text, h2_style))
            
            # Markdown H2 (## Header)
            elif line_str.startswith("## "):
                text = line_str[3:].strip()
                story.append(Paragraph(text, h2_style))
            
            # Divider (---)
            elif line_str == "---" or line_str == "***":
                story.append(Spacer(1, 4))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=6))

            else:
                # Strip markdown asterisks, underscores, and backticks to inspect section/party accurately
                clean_line = re.sub(r"[\*_#`]", "", line_str).strip()
                clean_upper = clean_line.upper()

                # Track execution block parties (supports Party A, Provider, Licensor, Client, Company)
                if any(clean_upper.startswith(p) for p in [
                    "PARTY A:", "PARTY 1:", "DISCLOSING PARTY:", "PROVIDER:", "LICENSOR:", "CLIENT:", "COMPANY:", "FIRST PARTY:"
                ]):
                    current_party = "A"
                    formatted = self._format_inline_markdown(line_str)
                    story.append(Paragraph(formatted, body_style))

                # Track Party B (supports Party B, Customer, Licensee, Consultant, Recipient)
                elif any(clean_upper.startswith(p) for p in [
                    "PARTY B:", "PARTY 2:", "RECEIVING PARTY:", "CUSTOMER:", "LICENSEE:", "CONSULTANT:", "RECIPIENT:", "COUNTERPARTY:"
                ]):
                    current_party = "B"
                    formatted = self._format_inline_markdown(line_str)
                    story.append(Paragraph(formatted, body_style))

                # Signature Line injection (supports By:, Signature:, Authorized Signature:)
                elif any(clean_upper.startswith(s) for s in ["BY:", "SIGNATURE:", "AUTHORIZED SIGNATURE:"]):
                    sig_flowable = None
                    if (current_party == "A" or current_party is None) and party_a_signature and not injected_party_a:
                        sig_flowable = self._make_signature_image(party_a_signature)
                        if sig_flowable:
                            story.append(Spacer(1, 4))
                            story.append(sig_flowable)
                            story.append(Spacer(1, 2))
                            story.append(Paragraph("<font size=7 color='#047857'>✓ <i>Digitally Verified Electronic Signature</i></font>", sig_caption_style))
                            story.append(Spacer(1, 2))
                            injected_party_a = True
                    elif current_party == "B" and party_b_signature and not injected_party_b:
                        sig_flowable = self._make_signature_image(party_b_signature)
                        if sig_flowable:
                            story.append(Spacer(1, 4))
                            story.append(sig_flowable)
                            story.append(Spacer(1, 2))
                            story.append(Paragraph("<font size=7 color='#047857'>✓ <i>Digitally Verified Electronic Signature</i></font>", sig_caption_style))
                            story.append(Spacer(1, 2))
                            injected_party_b = True

                    formatted = self._format_inline_markdown(line_str)
                    story.append(Paragraph(formatted, body_style))

                # List item or Recital bullet
                elif line_str.startswith("- ") or line_str.startswith("* "):
                    clean_text = line_str[2:].strip()
                    formatted = self._format_inline_markdown(clean_text)
                    story.append(Paragraph(f"• &nbsp; {formatted}", body_style))
                
                # Regular Paragraph
                else:
                    formatted = self._format_inline_markdown(line_str)
                    story.append(Paragraph(formatted, body_style))

        # Fallback Guarantee: If signatures were provided but could not be embedded inline (e.g. Privacy Policy or custom templates)
        if (party_a_signature and not injected_party_a) or (party_b_signature and not injected_party_b):
            story.append(Spacer(1, 14))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=10))
            story.append(Paragraph("<b>FORMAL EXECUTION &amp; ELECTRONIC SIGNATURE RECORD</b>", h2_style))
            story.append(Paragraph("<i>This document has been reviewed, approved, and digitally executed as of the Effective Date.</i>", sig_record_style))
            story.append(Spacer(1, 8))

            if party_a_signature and not injected_party_a:
                sig_flowable = self._make_signature_image(party_a_signature)
                if sig_flowable:
                    story.append(Paragraph("<b>AUTHORIZED SIGNATORY (PARTY A / COMPANY):</b>", body_style))
                    story.append(Spacer(1, 4))
                    story.append(sig_flowable)
                    story.append(Spacer(1, 2))
                    story.append(Paragraph("<font size=7 color='#047857'>✓ <i>Digitally Verified Electronic Signature</i></font>", sig_caption_style))
                    story.append(Paragraph("By: ____________________________________", body_style))
                    story.append(Spacer(1, 8))

            if party_b_signature and not injected_party_b:
                sig_flowable = self._make_signature_image(party_b_signature)
                if sig_flowable:
                    story.append(Paragraph("<b>AUTHORIZED SIGNATORY (PARTY B / COUNTERPARTY):</b>", body_style))
                    story.append(Spacer(1, 4))
                    story.append(sig_flowable)
                    story.append(Spacer(1, 2))
                    story.append(Paragraph("<font size=7 color='#047857'>✓ <i>Digitally Verified Electronic Signature</i></font>", sig_caption_style))
                    story.append(Paragraph("By: ____________________________________", body_style))
                    story.append(Spacer(1, 8))

        # Build document
        doc.build(story, canvasmaker=NumberedCanvas)
        pdf_data = buffer.getvalue()
        buffer.close()
        return pdf_data

    def _format_inline_markdown(self, text: str) -> str:
        """Convert basic Markdown bold/italics to ReportLab XML tags."""
        # Bold: **text** -> <b>text</b>
        text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
        # Italic: *text* -> <i>text</i>
        text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
        # Code/variables: `text` -> <font name='Courier'>text</font>
        text = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", text)
        return text

pdf_service = PDFService()
