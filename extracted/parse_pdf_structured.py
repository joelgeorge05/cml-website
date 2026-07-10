import PyPDF2
import json
import csv
import re

def parse_pdf_to_structured_data():
    pdf_path = "Mekhala-Kala-Malsarangal-list-88-122.pdf"
    pdf = PyPDF2.PdfReader(pdf_path)
    
    # Extract all text
    full_text = ""
    for page in pdf.pages:
        full_text += page.extract_text() + "\n"
    
    lines = full_text.split('\n')
    records = []
    current_section = ""
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines
        if not line:
            i += 1
            continue
        
        # Detect section header
        if 'BIBLE READING' in line or 'MISSION QUIZ' in line:
            current_section = line
            i += 1
            continue
        
        # Skip header rows
        if line.startswith('#Name') or line == 'Kaliyar' or 'KALIYAR REGION' in line:
            i += 1
            continue
        
        # Parse numbered entries (e.g., "1. NAME")
        match = re.match(r'^(\d+)\.\s+(.+)', line)
        if match:
            entry_num = match.group(1)
            first_name_part = match.group(2).strip()
            
            # Collect full name (may span multiple lines)
            full_name = first_name_part
            i += 1
            
            # Keep collecting lines until we find location + DOB + numbers
            location = ""
            dob = ""
            false_id = ""
            record_id = ""
            
            while i < len(lines):
                next_line = lines[i].strip()
                if not next_line:
                    i += 1
                    continue
                
                # Check if this line contains location/date/IDs pattern
                # Pattern: LOCATION DOB FALSEID ID
                # Location has capital letters, DOB is YYYY-MM-DD, then two numbers
                date_pattern = r'(\d{4}-\d{2}-\d{2})'
                id_pattern = r'(KYR\d+|[0-9]{4,5})'
                
                if re.search(date_pattern, next_line):
                    # This line has the details
                    parts = next_line.split()
                    
                    # Find DOB
                    dob_match = re.search(date_pattern, next_line)
                    if dob_match:
                        dob = dob_match.group(1)
                        # Everything before DOB is location
                        before_dob = next_line[:dob_match.start()].strip()
                        location = before_dob
                        
                        # Everything after DOB - extract IDs
                        after_dob = next_line[dob_match.end():].strip()
                        id_parts = after_dob.split()
                        if len(id_parts) >= 2:
                            false_id = id_parts[0]
                            record_id = id_parts[1]
                        elif len(id_parts) == 1:
                            record_id = id_parts[0]
                    
                    records.append({
                        'number': entry_num,
                        'section': current_section,
                        'name': full_name,
                        'location': location,
                        'dob': dob,
                        'false_id': false_id,
                        'id': record_id
                    })
                    i += 1
                    break
                else:
                    # Part of the name/location
                    full_name += " " + next_line
                    i += 1
        else:
            i += 1
    
    return records

# Parse data
records = parse_pdf_to_structured_data()

# Save as JSON
with open('parsed_data.json', 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

# Save as CSV
if records:
    with open('parsed_data.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['number', 'section', 'name', 'location', 'dob', 'false_id', 'id'])
        writer.writeheader()
        writer.writerows(records)

print(f"✓ Parsed {len(records)} records")
print(f"✓ Saved to: parsed_data.json")
print(f"✓ Saved to: parsed_data.csv")
print("\n" + "="*80)
print("SAMPLE DATA (First 5 records):")
print("="*80)
for r in records[:5]:
    print(f"\n{r['number']}. {r['name']}")
    print(f"   Location: {r['location']}")
    print(f"   DOB: {r['dob']}")
    print(f"   ID: {r['id']}")
    print(f"   Section: {r['section']}")
