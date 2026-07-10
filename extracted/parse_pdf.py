import PyPDF2
import json
import re

pdf_path = "Mekhala-Kala-Malsarangal-list-88-122.pdf"
pdf = PyPDF2.PdfReader(pdf_path)

# Extract all text
full_text = ""
for page in pdf.pages:
    full_text += page.extract_text() + "\n"

# Print full text to file for inspection
with open("pdf_extracted.txt", "w", encoding="utf-8") as f:
    f.write(full_text)

print("✓ Full PDF extracted to: pdf_extracted.txt")
print(f"Total pages: {len(pdf.pages)}")

# Show first 2000 characters
print("\n" + "="*80)
print("EXTRACTED DATA (First 2000 chars):")
print("="*80)
print(full_text[:2000])
