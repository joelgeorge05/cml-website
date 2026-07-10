import os

def patch_file(filepath, is_kalolsavam=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add import for logoImg
    if "import logoImg from '../assets/images/logo.jpg';" not in content:
        content = content.replace("import jsPDF from 'jspdf';", "import jsPDF from 'jspdf';\nimport logoImg from '../assets/images/logo.jpg';")
        content = content.replace("import { jsPDF } from 'jspdf';", "import { jsPDF } from 'jspdf';\nimport logoImg from '../assets/images/logo.jpg';")

    # 2. Make exportPDF async and inject image
    old_export = "const exportPDF = (type:"
    new_export = "const exportPDF = async (type:"
    content = content.replace(old_export, new_export)

    if "doc.addImage" not in content:
        injection_point = "doc.rect(0, 0, 210, 42, 'F');"
        injection_point2 = "doc.rect(15, y, 180, 26, 'F');"
        
        if is_kalolsavam and injection_point in content:
            img_code = """doc.rect(0, 0, 210, 42, 'F');
    try {
      const img = new Image();
      img.src = logoImg;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      doc.addImage(img, 'JPEG', 15, 8, 26, 26);
    } catch(e) { console.warn(e); }"""
            content = content.replace(injection_point, img_code)
            
        elif not is_kalolsavam and injection_point2 in content:
            # For Sahithyamalsaram
            img_code = """doc.rect(15, y, 180, 26, 'F');
    try {
      const img = new Image();
      img.src = logoImg;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      doc.addImage(img, 'JPEG', 18, y + 3, 20, 20);
    } catch(e) { console.warn(e); }"""
            content = content.replace(injection_point2, img_code)

    # 3. Remove "CENTRAL COMMITTEE"
    if is_kalolsavam:
        content = content.replace("'KALIYAR MEKHALA CENTRAL COMMITTEE'", "'KALIYAR MEKHALA'")
    else:
        # For Sahithyamalsaram, user wanted to remove "central commite".
        # It says: 'CML MEKHALA ACADEMIC BOARD • JURY DESK TRANSCRIPT'
        # Or maybe they only meant Kalolsavam where it explicitly said "CENTRAL COMMITTEE".
        pass

    # 4. Adjust X coordinates to fix overlapping
    if is_kalolsavam:
        # Leaderboard
        content = content.replace("doc.text('Parish Church Unit', 45, y + 6.5);", "doc.text('Parish Church Unit', 35, y + 6.5);")
        content = content.replace("doc.text(row.unitName, 45, y + 5.5);", "doc.text(row.unitName, 35, y + 5.5);")
        
        content = content.replace("doc.text('Points', 105, y + 6.5);", "doc.text('Points', 110, y + 6.5);")
        content = content.replace("doc.text(String(row.totalPoints), 105, y + 5.5);", "doc.text(String(row.totalPoints), 110, y + 5.5);")

        # Competition
        content = content.replace("doc.text('Participant Name', 20, y + 6.5);", "doc.text('Participant Name', 16, y + 6.5);")
        content = content.replace("doc.text(row.competitorName, 20, y + 5.5);", "doc.text(row.competitorName, 16, y + 5.5);")

        content = content.replace("doc.text('Parish Church Unit', 75, y + 6.5);", "doc.text('Parish Church Unit', 65, y + 6.5);")
        content = content.replace("doc.text(row.unitName, 75, y + 5.5);", "doc.text(row.unitName, 65, y + 5.5);")

        content = content.replace("doc.text('Grade', 125, y + 6.5);", "doc.text('Grade', 145, y + 6.5);")
        content = content.replace("doc.text(row.grade, 125, y + 5.5);", "doc.text(row.grade, 145, y + 5.5);")
        
        content = content.replace("doc.text('Position', 145, y + 6.5);", "doc.text('Position', 162, y + 6.5);")
        content = content.replace("doc.text(row.position, 145, y + 5.5);", "doc.text(row.position, 162, y + 5.5);")
        
        content = content.replace("doc.text('Points Claimed', 168, y + 6.5);", "doc.text('Points Claimed', 180, y + 6.5);")
        content = content.replace("doc.text(`${row.totalPoints} Pts`, 168, y + 5.5);", "doc.text(`${row.totalPoints} Pts`, 180, y + 5.5);")
    
    else:
        # Sahithyamalsaram
        content = content.replace("doc.text('CHEV. GEEVARGHESE JOSEPH CO-FOUNDERS MEMORIAL SHIELD', 24, y + 8);", "doc.text('CHEV. GEEVARGHESE JOSEPH CO-FOUNDERS MEMORIAL SHIELD', 42, y + 8);")
        content = content.replace("doc.text('CML MEKHALA ACADEMIC BOARD • JURY DESK TRANSCRIPT', 24, y + 15);", "doc.text('CML MEKHALA ACADEMIC BOARD • JURY DESK TRANSCRIPT', 42, y + 15);")
        content = content.replace("doc.text(`Official Jubilee Ledger Document Verification • Issued: ${new Date().toLocaleDateString()}`, 24, y + 21);", "doc.text(`Official Jubilee Ledger Document Verification • Issued: ${new Date().toLocaleDateString()}`, 42, y + 21);")
        
        # Competition
        content = content.replace("doc.text('Participant Name', 20, y + 6.5);", "doc.text('Participant Name', 16, y + 6.5);")
        content = content.replace("doc.text(row.competitorName, 20, y + 5.5);", "doc.text(row.competitorName, 16, y + 5.5);")

        content = content.replace("doc.text('Parish Church Unit', 75, y + 6.5);", "doc.text('Parish Church Unit', 65, y + 6.5);")
        content = content.replace("doc.text(row.unitName, 75, y + 5.5);", "doc.text(row.unitName, 65, y + 5.5);")

        content = content.replace("doc.text('Grade', 125, y + 6.5);", "doc.text('Grade', 145, y + 6.5);")
        content = content.replace("doc.text(row.grade, 125, y + 5.5);", "doc.text(row.grade, 145, y + 5.5);")
        
        content = content.replace("doc.text('Position', 145, y + 6.5);", "doc.text('Position', 162, y + 6.5);")
        content = content.replace("doc.text(row.position || 'None', 145, y + 5.5);", "doc.text(row.position || 'None', 162, y + 5.5);")
        
        content = content.replace("doc.text('Points Claimed', 168, y + 6.5);", "doc.text('Points Claimed', 180, y + 6.5);")
        content = content.replace("doc.text(`${row.totalPoints}`, 172, y + 5.5);", "doc.text(`${row.totalPoints}`, 180, y + 5.5);")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('src/components/KalolsavamView.tsx', True)
patch_file('src/components/SahithyamalsaramView.tsx', False)

print("Patch applied successfully.")
