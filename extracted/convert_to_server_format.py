import json

# Load the extracted data
with open('parsed_data.json', 'r', encoding='utf-8') as f:
    records = json.load(f)

# Convert to format the server expects
# Pattern: # Event Name Section Name DOB CML ID
formatted_lines = []
formatted_lines.append("MEKHALA KALA MALSARANGAL - FORMATTED FOR SYSTEM IMPORT\n")

for record in records:
    # Extract section components
    section_parts = record['section'].split('-')
    event_type = section_parts[0].strip()  # e.g., "BIBLE READING"
    
    # Extract grade level (Sub Junior, Junior, Senior, etc.)
    if 'SUB JUNIOR' in record['section']:
        grade = 'Sub Junior'
    elif 'JUNIOR' in record['section']:
        grade = 'Junior'
    elif 'SENIOR' in record['section']:
        grade = 'Senior'
    else:
        grade = 'Junior'
    
    # Format the line matching server regex:
    # (\d+)\.\s+(.+?)\s+(Sub Junior|Junior|Senior|Super Senior|Group Items)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})\s+(KYR\d+)
    
    name_and_location = f"{record['name']}, {record['location']}"
    dob = record['dob']
    cml_id = record['id']
    
    # Format: number. event_name grade name_location dob cml_id
    line = f"{record['number']}. {event_type} {grade} {name_and_location} {dob} {cml_id}"
    formatted_lines.append(line)

# Save as text file that matches server's expected format
with open('formatted_for_upload.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(formatted_lines))

print(f"✓ Converted {len(records)} records to server format")
print(f"✓ Saved to: formatted_for_upload.txt")
print("\nSample output:")
for line in formatted_lines[1:6]:
    print(line)
