import os
import re

def patch_dashboard():
    filepath = 'src/components/AdminDashboard.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update activeTab type and default
    content = content.replace(
        "useState<'overview' | 'settings' | 'bearers' | 'units' | 'events' | 'news' | 'announcements' | 'gallery' | 'downloads' | 'logs' | 'chosen' | 'results'>('overview')",
        "useState<string>(currentUser.role === 'Kalolsavam Editor' ? 'kalolsavam-marks' : 'overview')"
    )

    # 2. Update Role type
    content = content.replace(
        "currentUser: { email: string; name: string; role: 'Super Admin' | 'Admin' | 'Editor' };",
        "currentUser: { email: string; name: string; role: 'Super Admin' | 'Admin' | 'Editor' | 'Kalolsavam Editor' };"
    )

    # 3. Update verifyPermission
    verify_old = "if (isEditorOnly && activeTab === 'settings') {"
    verify_new = """if (currentUser.role === 'Kalolsavam Editor' && activeTab !== 'kalolsavam-marks') {
      triggerToast('Permission Denied: Kalolsavam Editor can only modify Kalolsavam marks!');
      return false;
    }
    if (isEditorOnly && activeTab === 'settings') {"""
    content = content.replace(verify_old, verify_new)

    # 4. Update navItems
    nav_old = """    { id: 'downloads', label: 'Downloads', icon: <FileText className="w-4 h-4" /> },
    { id: 'results', label: 'Competition Marks', icon: <Award className="w-4 h-4" /> },
    { id: 'chosen', label: 'Chosen Delegates', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'logs', label: 'Activity Logs', icon: <Activity className="w-4 h-4" /> }
  ];"""
    nav_new = """    { id: 'downloads', label: 'Downloads', icon: <FileText className="w-4 h-4" /> },
    { id: 'kalolsavam-marks', label: 'Kalolsavam Marks', icon: <Award className="w-4 h-4" /> },
    { id: 'sahithyamalsaram-marks', label: 'Sahithyamalsaram Marks', icon: <Award className="w-4 h-4" /> },
    { id: 'chosen', label: 'Chosen Delegates', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'logs', label: 'Activity Logs', icon: <Activity className="w-4 h-4" /> }
  ].filter(item => currentUser.role === 'Kalolsavam Editor' ? item.id === 'kalolsavam-marks' : true);"""
    content = content.replace(nav_old, nav_new)

    # 5. Add bulk editing state and methods right before `return (`
    bulk_state = """
  // PDF Upload & Bulk Editing State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkEntries, setBulkEntries] = useState<ParticipantResult[]>([]);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setIsUploading(true);
    triggerToast('Analyzing PDF layout...');
    
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        // Pre-fill existing entries if they match, else new
        const competitionType = activeTab === 'kalolsavam-marks' ? 'Kalolsavam' : 'Sahithyamalsaram';
        const newEntries = data.participants.map((p: any) => ({
          id: p.id,
          competitorName: p.competitorName,
          unitId: '', // Requires manual mapping or matching
          unitName: 'Unknown Unit', // Will be updated if user selects unit manually
          competition: competitionType,
          eventName: p.eventName + ' ' + p.section,
          grade: 'None',
          position: 'None',
          totalPoints: 0,
          isPublished: true
        }));
        setBulkEntries(newEntries);
        triggerToast(`Extracted ${newEntries.length} participants from PDF!`);
      } else {
        triggerToast('Failed to parse PDF: ' + data.error);
      }
    } catch (err) {
      triggerToast('Network error during PDF parse.');
    }
    setIsUploading(false);
  };

  const addManualEntry = () => {
    const competitionType = activeTab === 'kalolsavam-marks' ? 'Kalolsavam' : 'Sahithyamalsaram';
    setBulkEntries([...bulkEntries, {
      id: 'manual_' + Date.now(),
      competitorName: '',
      unitId: '',
      unitName: '',
      competition: competitionType,
      eventName: '',
      grade: 'None',
      position: 'None',
      totalPoints: 0,
      isPublished: true
    }]);
  };

  const removeBulkEntry = (id: string) => {
    setBulkEntries(bulkEntries.filter(b => b.id !== id));
  };

  const updateBulkEntry = (id: string, field: string, value: any) => {
    setBulkEntries(bulkEntries.map(b => {
      if (b.id !== id) return b;
      const updated = { ...b, [field]: value };
      
      // Auto-assign unit name if unitId changes
      if (field === 'unitId') {
        const u = dbData.units.find(unit => unit.id === value);
        if (u) updated.unitName = u.name;
      }
      return updated as ParticipantResult;
    }));
  };

  const handleSaveBulkMarks = () => {
    if (!verifyPermission()) return;
    const competitionType = activeTab === 'kalolsavam-marks' ? 'Kalolsavam' : 'Sahithyamalsaram';
    
    // Remove all existing records for this competition type IF the user wants, or we just append/overwrite
    // Let's just append or update existing
    let updatedResults = [...(dbData.results || [])];
    
    bulkEntries.forEach(entry => {
      const existingIdx = updatedResults.findIndex(r => r.id === entry.id || (r.competitorName === entry.competitorName && r.eventName === entry.eventName && r.competition === entry.competition));
      if (existingIdx >= 0) {
        updatedResults[existingIdx] = entry;
      } else {
        updatedResults.push(entry);
      }
    });

    const updated = { ...dbData, results: updatedResults };
    saveState(updated, 'BULK_UPDATE_MARKS', competitionType);
    setBulkEntries([]);
    setPdfFile(null);
  };

  return (
"""
    content = content.replace("  return (", bulk_state)

    # 6. Replace the existing results tab UI with the new tabs
    results_ui_start = "{/* VIEW 12: RESULTS CRUD */}"
    results_ui_end = "      </div>\n    </div>\n  );\n}"
    
    # We will use Regex to rip out the entire VIEW 12 block and replace it
    pattern = re.compile(r'\{\/\* VIEW 12: RESULTS CRUD \*\/}.*?(?=      </div>\n    </div>\n  \);\n})', re.DOTALL)
    
    new_ui = """{/* NEW VIEW: KALOLSAVAM / SAHITHYAMALSARAM MARKS */}
        {(activeTab === 'kalolsavam-marks' || activeTab === 'sahithyamalsaram-marks') && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 text-left">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">COMPETITION REGISTRY</span>
              <h3 className="font-sans font-bold text-lg text-white">
                {activeTab === 'kalolsavam-marks' ? 'Kalolsavam Marks' : 'Sahithyamalsaram Marks'}
              </h3>
              <p className="text-slate-500 text-xs">Bulk entry using PDF auto-population, or manual controls.</p>
            </div>

            {/* PDF UPLOAD ZONE */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 border-dashed hover:border-rose-500 transition-colors flex flex-col items-center justify-center gap-3">
              <input type="file" accept="application/pdf" id="pdf-upload" onChange={handleFileUpload} className="hidden" />
              <label htmlFor="pdf-upload" className="px-6 py-3 bg-rose-900 text-rose-300 font-bold rounded-xl cursor-pointer hover:bg-rose-800 transition shadow-lg inline-flex items-center gap-2">
                <FileText className="w-5 h-5" /> 
                {isUploading ? 'Parsing PDF...' : 'Upload Official PDF Manifest'}
              </label>
              <p className="text-xs text-slate-500">Upload the CML participant PDF. We will automatically extract rows for grading.</p>
            </div>

            {/* BULK ENTRY TABLE */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-xs text-left">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h4 className="font-bold text-white">Bulk Marks Spreadsheet</h4>
                <div className="flex gap-2">
                  <button onClick={addManualEntry} className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg flex items-center gap-1 font-bold">
                    <Plus className="w-3 h-3" /> Add Manual Entry
                  </button>
                  <button onClick={handleSaveBulkMarks} className="px-3 py-1.5 bg-amber-500 text-slate-950 hover:bg-amber-600 rounded-lg flex items-center gap-1 font-bold shadow-md shadow-amber-500/20">
                    <Save className="w-3 h-3" /> Save All Marks to Ledger
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                      <th className="p-3">Competitor Name</th>
                      <th className="p-3">Parish Unit</th>
                      <th className="p-3">Event & Section</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Position</th>
                      <th className="p-3">Total Pts</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {bulkEntries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                          No entries loaded. Upload a PDF or add a manual entry.
                        </td>
                      </tr>
                    )}
                    {bulkEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-2">
                          <input type="text" value={entry.competitorName} onChange={e => updateBulkEntry(entry.id, 'competitorName', e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-1.5 rounded text-white" placeholder="Name" />
                        </td>
                        <td className="p-2">
                          <select value={entry.unitId} onChange={e => updateBulkEntry(entry.id, 'unitId', e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-1.5 rounded text-white truncate max-w-[150px]">
                            <option value="">Select Unit</option>
                            {dbData.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="text" value={entry.eventName} onChange={e => updateBulkEntry(entry.id, 'eventName', e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-1.5 rounded text-white" placeholder="Event" />
                        </td>
                        <td className="p-2">
                          <select value={entry.grade} onChange={e => updateBulkEntry(entry.id, 'grade', e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-1.5 rounded text-white font-bold">
                            <option value="None">-</option>
                            <option value="A">A Grade</option>
                            <option value="B">B Grade</option>
                            <option value="C">C Grade</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <select value={entry.position} onChange={e => updateBulkEntry(entry.id, 'position', e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-1.5 rounded text-white font-bold">
                            <option value="None">-</option>
                            <option value="1st">1st Place</option>
                            <option value="2nd">2nd Place</option>
                            <option value="3rd">3rd Place</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="number" value={entry.totalPoints} onChange={e => updateBulkEntry(entry.id, 'totalPoints', parseInt(e.target.value)||0)} className="w-16 bg-slate-900 border border-slate-700 p-1.5 rounded text-amber-400 font-black text-center" />
                        </td>
                        <td className="p-2 text-right">
                          <button onClick={() => removeBulkEntry(entry.id)} className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg transition" title="Delete Entry">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EXISTING RECORDS LISTING */}
            <div className="flex flex-col gap-3 mt-4 text-left">
              <h4 className="font-bold text-slate-300 text-sm">Published Live Results</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(dbData.results || []).filter(r => r.competition === (activeTab === 'kalolsavam-marks' ? 'Kalolsavam' : 'Sahithyamalsaram')).map(res => (
                  <div key={res.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2 group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => handleDeleteResult(res.id, res.competitorName)} className="p-1 bg-slate-900 text-rose-400 rounded hover:bg-rose-900 transition"><Trash className="w-3 h-3" /></button>
                    </div>
                    <span className="text-[10px] text-amber-500 font-bold uppercase">{res.eventName}</span>
                    <h5 className="font-bold text-white text-sm">{res.competitorName}</h5>
                    <span className="text-[11px] text-slate-400">{res.unitName || 'Unknown Unit'}</span>
                    <div className="flex gap-4 mt-1 text-[11px]">
                      <span className="text-emerald-400 font-bold">Grade: {res.grade}</span>
                      <span className="text-emerald-400 font-bold">Pos: {res.position}</span>
                      <span className="text-amber-400 font-black">{res.totalPoints} Pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}
"""
    content = pattern.sub(new_ui, content)

    # 7. Add `handleDeleteResult` back because it was removed by the pattern replacement
    # Oops wait, handleDeleteResult was defined outside but I need to make sure it exists
    # Actually, the original code had:
    # `const handleDeleteResult = ...` somewhere before the return? Yes, around line 350-400, wait, I can just check if it was removed. 
    # The regex only rips out `{/* VIEW 12: RESULTS CRUD */}` which is inside the `return()`.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    patch_dashboard()
