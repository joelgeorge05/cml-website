from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
import json

# Load the parsed data
with open('parsed_data.json', 'r', encoding='utf-8') as f:
    records = json.load(f)

# Create PDF
pdf_filename = 'Mekhala-Kala-Malsarangal-list-formatted.pdf'
doc = SimpleDocTemplate(pdf_filename, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)

# Create styles
styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=14,
    textColor=colors.black,
    spaceAfter=12,
    alignment=1  # Center
)

# Build content
elements = []

# Title
elements.append(Paragraph("MEKHALA KALA MALSARANGAL", title_style))
elements.append(Paragraph("Mission Quiz & Bible Reading - Participant List", styles['Normal']))
elements.append(Spacer(1, 0.2*inch))

# Create table data with proper formatting
table_data = [['#', 'Event', 'Section', 'Name', 'Location', 'DOB', 'CML ID']]

for record in records:
    # Extract section components
    if 'SUB JUNIOR' in record['section']:
        grade = 'Sub Junior'
    elif 'JUNIOR' in record['section']:
        grade = 'Junior'
    elif 'SENIOR' in record['section']:
        grade = 'Senior'
    else:
        grade = 'Junior'
    
    # Extract event type
    event_type = record['section'].split('-')[0].strip().split()[0:2]
    event_type = ' '.join(event_type) if len(event_type) > 0 else 'Event'
    
    table_data.append([
        record['number'],
        event_type[:20],  # Truncate if too long
        grade,
        record['name'][:25],  # Truncate if too long
        record['location'][:20],  # Truncate if too long
        record['dob'],
        record['id']
    ])

# Create table
table = Table(table_data, colWidths=[0.5*inch, 1.2*inch, 1*inch, 1.5*inch, 1.2*inch, 0.9*inch, 1*inch])
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 8),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('FONTSIZE', (0, 1), (-1, -1), 7),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
]))

elements.append(table)

# Build PDF
doc.build(elements)

print(f"✓ Created formatted PDF: {pdf_filename}")
print(f"✓ Total records: {len(records)}")
print(f"✓ File size: Check the generated PDF")
print("\nThis PDF is now ready to be uploaded to the admin system.")
