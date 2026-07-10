const fs = require('fs');
const file = 'src/components/HomeView.tsx';
let content = fs.readFileSync(file, 'utf8');

// The file has badly messed up tags around lines 567-657.
// I'll replace everything between {/* Content */} and {/* Footer */} for all three blocks.

// Block 1: Director
let start = content.indexOf('{/* Content */}');
let end = content.indexOf('{/* Footer */}', start);
if (start > -1 && end > -1) {
  content = content.substring(0, start) + `{/* Content */}
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-black text-stone-800 text-[16px] tracking-tight font-malayalam">
                    സന്ദേശം
                  </h3>
                </div>
                <p className="text-stone-600 text-[14px] leading-relaxed font-malayalam line-clamp-6">
                  "സഭയെ സ്നേഹിക്കുക, ലോകത്തിൽ സാക്ഷികളാകുക എന്ന ഈ വർഷത്തെ ആപ്തവാക്യം നമ്മുടെ ജീവിതത്തിനുള്ള മനോഹരമായ വിളിയാണ്. സഭയോടുള്ള സ്നേഹം ഹൃദയത്തിൽ വളർത്തി, ക്രിസ്തുവിന്റെ സാക്ഷികളായി ലോകത്തിലേക്ക് ഇറങ്ങിച്ചെല്ലുവാനാണ് ഈ വചനം നമ്മെ ഓർമ്മപ്പെടുത്തുന്നത്."
                </p>
              </div>
              
              ` + content.substring(end);
}

// Block 2: Assistant Director
start = content.indexOf('{/* Content */}', end + 10);
end = content.indexOf('{/* Footer */}', start);
if (start > -1 && end > -1) {
  content = content.substring(0, start) + `{/* Content */}
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-black text-stone-800 text-[16px] tracking-tight font-malayalam">
                    ആശംസ
                  </h3>
                </div>
                <p className="text-stone-600 text-[14px] leading-relaxed font-malayalam line-clamp-6">
                  "കുട്ടികളുടെ ഹൃദയങ്ങളിൽ സഭയോടുള്ള സ്നേഹവും മിഷനറി ചൈതന്യവും വളർത്തുക എന്ന മഹത്തായ ദൗത്യമാണ് സി.എം.എൽ സംഘടന നിർവഹിക്കുന്നത്. സുവിശേഷം വാക്കുകളിലൂടെ മാത്രം അല്ല, ജീവിതത്തിലൂടെ പ്രഘോഷിക്കപ്പെടേണ്ടതാണ് എന്ന തിരിച്ചറിവ് കുട്ടികളിൽ വളർത്തുവാൻ ഈ സംഘടനയുടെ പ്രവർത്തനങ്ങൾക്ക് സാധിക്കുന്നു."
                </p>
              </div>
              
              ` + content.substring(end);
}

// Block 3: President
start = content.indexOf('{/* Content */}', end + 10);
end = content.indexOf('{/* Footer */}', start);
if (start > -1 && end > -1) {
  content = content.substring(0, start) + `{/* Content */}
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-black text-stone-800 text-[16px] tracking-tight font-malayalam">
                    ആമുഖം
                  </h3>
                </div>
                <p className="text-stone-600 text-[14px] leading-relaxed font-malayalam line-clamp-6">
                  "വിശ്വാസജീവിതത്തെ കൂടുതൽ ആഴത്തിലാക്കുകയും, സഭാസ്നേഹത്തിലും മിഷനറി ചൈതന്യത്തിലും പുതുതലമുറയെ വളർത്തുകയും ചെയ്യുക എന്ന മഹത്തായ ദൗത്യവുമായി മുന്നേറുന്ന ചെറുപുഷ്പ മിഷൻ ലീഗ് കാളിയാർ മേഖലയുടെ ഈ പ്രവർത്തനവർഷം, ദൈവാനുഗ്രഹപൂർണമായ ഒരു ആത്മീയ യാത്രയുടെ തുടക്കമാണ്."
                </p>
              </div>
              
              ` + content.substring(end);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed JSX structure blocks.');
