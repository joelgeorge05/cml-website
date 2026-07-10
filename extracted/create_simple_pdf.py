from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle
import json

# Load the parsed data
with open('parsed_data.json', 'r', encoding='utf-8') as f:
    records = json.load(f)

pdf_filename = 'Mekhala-Kala-Malsarangal-formatted.pdf'
c = canvas.Canvas(pdf_filename, pagesize=A4)

# Page settings
page_width, page_height = A4
x_margin = 0.5 * inch
y_position = page_height - 0.5 * inch
line_height = 12
lines_per_page = int((page_height - 1 * inch) / line_height)

# Font settings
c.setFont("Helvetica", 9)

page_count = 0
line_count = 0

# Title
c.setFont("Helvetica-Bold", 12)
c.drawString(x_margin, y_position, "MEKHALA KALA MALSARANGAL - FORMATTED PARTICIPANT LIST")
y_position -= line_height * 2
c.setFont("Helvetica", 9)

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
    
    # Extract event type (first 2 words)
    section_parts = record['section'].split()
    event_type = ' '.join(section_parts[0:2]) if len(section_parts) >= 2 else section_parts[0]
    
    # Format exactly as server regex expects:
    # (#). EVENT_NAME GRADE NAME LOCATION DOB CML_ID
    name_with_location = f"{record['name']}, {record['location']}"
    
    # Build line to match regex:
    # (\d+)\.\s+(.+?)\s+(Sub Junior|Junior|Senior|Super Senior|Group Items)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})\s+(KYR\d+)
    line = f"{record['number']}. {event_type} {grade} {name_with_location} {record['dob']} {record['id']}"
    
    # Draw line
    c.drawString(x_margin, y_position, line)
    y_position -= line_height
    line_count += 1
    
    # Check if we need a new page
    if line_count >= lines_per_page:
        c.showPage()
        page_count += 1
        y_position = page_height - 0.5 * inch
        line_count = 0
        c.setFont("Helvetica", 9)

# Save the PDF
c.save()

print(f"✓ Created text-based PDF: {pdf_filename}")
print(f"✓ Total records: {len(records)}")
print(f"✓ Pages: {page_count + 1}")
print(f"\nFormat verification (first 5 lines):")

# Show sample
for i in range(min(5, len(records))):
    record = records[i]
    if 'SUB JUNIOR' in record['section']:
        grade = 'Sub Junior'
    elif 'JUNIOR' in record['section']:
        grade = 'Junior'
    else:
        grade = 'Senior'
    
    section_parts = record['section'].split()
    event_type = ' '.join(section_parts[0:2])
    name_with_location = f"{record['name']}, {record['location']}"
    line = f"{record['number']}. {event_type} {grade} {name_with_location} {record['dob']} {record['id']}"
    print(line)
