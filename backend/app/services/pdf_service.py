import io
import re
from typing import Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
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

        # Running Header
        self.drawString(54, 755, "JURISDRAFT — ENTERPRISE CONTRACT REPOSITORY")
        self.drawRightString(612 - 54, 755, "PRELIMINARY DRAFT")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 748, 612 - 54, 748)

        # Running Footer with Legal Disclaimer (PL-7 requirement)
        self.line(54, 48, 612 - 54, 48)
        disclaimer_text = "DRAFT ONLY • NOT LEGAL ADVICE • SUBJECT TO FORMAL REVIEW BY QUALIFIED LEGAL COUNSEL"
        self.setFont("Helvetica-Bold", 7)
        self.setFillColor(colors.HexColor("#DC2626"))  # Subtle red for disclaimer
        self.drawString(54, 36, disclaimer_text)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_str)

        self.restoreState()

class PDFService:
    def generate_pdf(self, markdown_text: str, document_title: str = "Legal Document") -> bytes:
        """
        Convert Markdown legal document into a professional, publication-ready PDF.
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

        disclaimer_box_style = ParagraphStyle(
            'DisclaimerBox',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#7F1D1D"),
            alignment=1
        )

        story = []

        # Top Disclaimer Callout Banner
        disclaimer_content = [
            [Paragraph(
                "<b>MANDATORY LEGAL DISCLAIMER:</b> This document was compiled via the JurisDraft automated platform. "
                "It is a preliminary draft provided for transactional convenience only and does not "
                "constitute attorney-client communication or legal representation. Review by qualified legal counsel "
                "is strictly recommended prior to execution.",
                disclaimer_box_style
            )]
        ]
        disclaimer_table = Table(disclaimer_content, colWidths=[504])
        disclaimer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF2F2")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#FCA5A5")),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(disclaimer_table)
        story.append(Spacer(1, 16))

        # Parse and translate Markdown lines
        lines = markdown_text.split("\n")
        in_witness_block = False

        for line in lines:
            line_str = line.strip()
            if not line_str:
                story.append(Spacer(1, 4))
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
            
            # List item or Recital bullet
            elif line_str.startswith("- ") or line_str.startswith("* "):
                clean_text = line_str[2:].strip()
                formatted = self._format_inline_markdown(clean_text)
                story.append(Paragraph(f"• &nbsp; {formatted}", body_style))
            
            # Regular Paragraph
            else:
                formatted = self._format_inline_markdown(line_str)
                story.append(Paragraph(formatted, body_style))

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
