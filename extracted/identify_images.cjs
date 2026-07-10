const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// Ensure dotenv is loaded if available, otherwise rely on environment
try {
  require('dotenv').config();
} catch (e) {}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No GEMINI_API_KEY in environment!");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const imgDir = path.join(__dirname, 'src/assets/images');
const list = fs.readdirSync(imgDir).filter(f => f.startsWith('founder_temp_'));

async function identify(filename) {
  const filepath = path.join(imgDir, filename);
  const data = fs.readFileSync(filepath);
  const base64Image = data.toString('base64');
  const mimeType = filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';

  const prompt = `Identify this person in the context of the Cherupushpa Mission League (CML), a Catholic lay association in India. 
The two founders are:
1. Sr. / Fr. Joseph Maliparambil (Spiritual Director / Priest founder, wears Catholic priest clerical attire - collar/cassock, usually elderly man in cassock).
2. Mr. P. C. Abraham Pallattukunnel (Kunjettan) (Layman founder, older Indian layman (man), usually in traditional clothing or suit/shirt, with hair brushed back or bald/senior).

Please analyze the image and respond with a strict JSON format:
{
  "recognized": true/false,
  "identity": "priest" | "layman" | "other",
  "confidence": 0.0-1.0,
  "description": "brief description of the person and clothing/attire/setting"
}
Output only the JSON block.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        prompt
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const resObj = JSON.parse(text.trim());
    console.log(`\n--- Results for ${filename} ---`);
    console.log(JSON.stringify(resObj, null, 2));
    return { filename, resObj };
  } catch (e) {
    console.error(`Error identifying ${filename}:`, e.message);
    return { filename, error: e.message };
  }
}

async function run() {
  console.log(`Identifying ${list.length} candidate files...`);
  const results = [];
  for (const filename of list) {
    const r = await identify(filename);
    results.push(r);
  }

  // Print summary to help us copy the correct ones
  console.log("\n=================== SUMMARY ===================");
  for (const r of results) {
    if (r.resObj) {
      console.log(`${r.filename}: ${r.resObj.identity.toUpperCase()} (confidence: ${r.resObj.confidence}) - Description: ${r.resObj.description}`);
    }
  }
}

run();
