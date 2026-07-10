import PyPDF2
import re

# Extract text from the newly created PDF
pdf_path = 'Mekhala-Kala-Malsarangal-formatted.pdf'
pdf = PyPDF2.PdfReader(pdf_path)

full_text = ""
for page in pdf.pages:
    full_text += page.extract_text() + "\n"

print("✓ Extracted text from PDF (first 1000 chars):")
print("="*80)
print(full_text[:1000])
print("="*80)

# Test the server's regex pattern
regex = r'(?:^|\n)\s*(\d+)\.\s+(.+?)\s+(Sub Junior|Junior|Senior|Super Senior|Group Items)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})\s+(KYR\d+)'

matches = []
match = None
for match in re.finditer(regex, full_text):
    matches.append(match)

print(f"\n✓ Regex matches found: {len(matches)}")
print(f"\nFirst 5 matches:")
for i, match in enumerate(matches[:5]):
    print(f"\nMatch {i+1}:")
    print(f"  #: {match.group(1)}")
    print(f"  Event: {match.group(2)}")
    print(f"  Section: {match.group(3)}")
    print(f"  Name: {match.group(4)[:50]}")
    print(f"  DOB: {match.group(5)}")
    print(f"  CML ID: {match.group(6)}")

if len(matches) > 0:
    print(f"\n✅ SUCCESS! The PDF is correctly formatted for the server.")
    print(f"   Ready to upload: {len(matches)} participants will be imported.")
else:
    print(f"\n❌ No matches found. The PDF format still doesn't match the regex.")
    print(f"\nDebugging - showing raw text:")
    lines = full_text.split('\n')
    for line in lines[1:10]:
        print(f"  '{line}'")
