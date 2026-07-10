/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseParticipantsFromText(text: string, competition: string = 'Kalolsavam'): any[] {
  const knownUnits = [
    'Kaliyar', 'Kadavoor', 'Kodikulam', 'Koduvely', 'Mullaringad', 'Mundanmudy',
    'Njarakkad', 'Paingottoor', 'Punnamattam', 'Rajagiri', 'Thennathoor',
    'Thommankuthu', 'Vannappuram'
  ];

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
  const participants: any[] = [];
  let currentEvent = '';

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (/ - KALIYAR REGION$/i.test(line) || /^(BIBLE READING|MISSION QUIZ|SOLO|SPEECH|DEBATE)/i.test(line)) {
      currentEvent = line;
      continue;
    }

    if (/^#\s*Name/i.test(line)) {
      continue;
    }

    const rowMatch = line.match(/^(\d+)\.\s*(.*)$/);
    if (!rowMatch) {
      continue;
    }

    const entryLines = [rowMatch[2]];
    let nextIndex = index + 1;
    while (
      nextIndex < lines.length &&
      !/^(\d+)\./.test(lines[nextIndex]) &&
      !/ - KALIYAR REGION$/i.test(lines[nextIndex]) &&
      !/^#\s*Name/i.test(lines[nextIndex])
    ) {
      entryLines.push(lines[nextIndex]);
      nextIndex += 1;
    }
    index = nextIndex - 1;

    const detailLine = entryLines[entryLines.length - 1];
    const cmlIdMatch = detailLine.match(/\bKYR\d+\b/i);
    const dobMatch = detailLine.match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (!cmlIdMatch || !dobMatch) {
      continue;
    }

    const cmlId = cmlIdMatch[0].toUpperCase();
    const dob = dobMatch[0];
    const unitMatch = knownUnits.find((unit) => new RegExp('\\b' + escapeRegex(unit) + '\\b', 'i').test(detailLine));
    const unit = unitMatch || '';

    const prefixLines = entryLines.slice(0, -1);
    let nameLines = prefixLines;
    let houseLines: string[] = [];
    const commaLineIndex = prefixLines.findIndex((l) => /,\s*$/.test(l));

    if (commaLineIndex >= 0) {
      nameLines = prefixLines.slice(0, commaLineIndex + 1);
      houseLines = prefixLines.slice(commaLineIndex + 1);
    } else if (prefixLines.length > 1) {
      nameLines = [prefixLines[0]];
      houseLines = prefixLines.slice(1);
    }

    let competitorName = nameLines.join(' ').replace(/\s+/g, ' ').replace(/,\s*$/g, '').trim();
    let houseName = houseLines.join(' ').replace(/\s+/g, ' ').trim();

    if (!houseName) {
      houseName = detailLine
        .replace(cmlId, '')
        .replace(dob, '')
        .replace(unit, '')
        .replace(/\b\d+\b/g, '')
        .trim();
    }

    let section = '';
    const sectionMatch = currentEvent.match(/\b(SUB JUNIOR|SUPER SENIOR|JUNIOR|SENIOR)\b\s*(BOYS|GIRLS)?/i);
    if (sectionMatch) {
      section = sectionMatch[0].trim();
    } else {
      section = 'Group Items';
    }

    if (section === 'Group Items' || /GROUP|CHORUS|DRAMA|SKIT|DUET/i.test(currentEvent)) {
      competitorName = unit ? `${unit} Unit` : 'Group Shakha';
    }

    participants.push({
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      competition,
      eventName: currentEvent,
      section,
      competitorName,
      houseName,
      dob,
      cmlId,
      shakhaId: cmlId.substring(0, 5)
    });
  }

  return participants;
}

export const loadPdfJs = (): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjs);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join('\n');
    fullText += pageText + '\n';
  }
  
  return fullText;
};
