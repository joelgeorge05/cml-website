const fs = require('fs');
const file = 'src/components/HomeView.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

lines[572] = `                    "സഭയെ സ്നേഹിക്കുക, ലോകത്തിൽ സാക്ഷികളാകുക എന്ന ഈ വർഷത്തെ ആപ്തവാക്യം നമ്മുടെ ജീവിതത്തിനുള്ള മനോഹരമായ വിളിയാണ്. സഭയോടുള്ള സ്നേഹം ഹൃദയത്തിൽ വളർത്തി, ക്രിസ്തുവിന്റെ സാക്ഷികളായി ലോകത്തിലേക്ക് ഇറങ്ങിച്ചെല്ലുവാനാണ് ഈ വചനം നമ്മെ ഓർമ്മപ്പെടുത്തുന്നത്."`;

lines[612] = `                    "കുട്ടികളുടെ ഹൃദയങ്ങളിൽ സഭയോടുള്ള സ്നേഹവും മിഷനറി ചൈതന്യവും വളർത്തുക എന്ന മഹത്തായ ദൗത്യമാണ് സി.എം.എൽ സംഘടന നിർവഹിക്കുന്നത്. സുവിശേഷം വാക്കുകളിലൂടെ മാത്രം അല്ല, ജീവിതത്തിലൂടെ പ്രഘോഷിക്കപ്പെടേണ്ടതാണ് എന്ന തിരിച്ചറിവ് കുട്ടികളിൽ വളർത്തുവാൻ ഈ സംഘടനയുടെ പ്രവർത്തനങ്ങൾക്ക് സാധിക്കുന്നു."`;

lines[653] = `                    "വിശ്വാസജീവിതത്തെ കൂടുതൽ ആഴത്തിലാക്കുകയും, സഭാസ്നേഹത്തിലും മിഷനറി ചൈതന്യത്തിലും പുതുതലമുറയെ വളർത്തുകയും ചെയ്യുക എന്ന മഹത്തായ ദൗത്യവുമായി മുന്നേറുന്ന ചെറുപുഷ്പ മിഷൻ ലീഗ് കാളിയാർ മേഖലയുടെ ഈ പ്രവർത്തനവർഷം, ദൈവാനുഗ്രഹപൂർണമായ ഒരു ആത്മീയ യാത്രയുടെ തുടക്കമാണ്."`;

// Headings
for (let i = 560; i < 650; i++) {
  if (lines[i].includes('font-malayalam')) {
    if (i < 590) lines[i] = `                  <h4 className="font-black text-stone-900 text-lg leading-tight tracking-tight font-malayalam">ഫാ. ജേക്കബ് റാത്തപ്പിള്ളി</h4>`;
    else if (i < 630) lines[i] = `                  <h4 className="font-black text-stone-900 text-lg leading-tight tracking-tight font-malayalam">ഫാ. ആന്റണി മുട്ടത്തുകുടിയിൽ</h4>`;
    else lines[i] = `                  <h4 className="font-black text-stone-900 text-lg leading-tight tracking-tight font-malayalam">ജോയൽ ജോർജ്</h4>`;
  }
}

// Ensure the first line doesn't have an unwanted character
if (lines[0].charCodeAt(0) === 0xFFFD) lines[0] = lines[0].substring(1);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Fixed JSX texts successfully.');
