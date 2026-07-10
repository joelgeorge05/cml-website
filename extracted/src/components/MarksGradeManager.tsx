import React, { useState, useMemo } from 'react';
import { Search, Save, FileText, CheckCircle, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { getShakhaNameByCode } from '../types';
import { matchesSection } from './ParticipantsManager';

interface MarksGradeManagerProps {
  dbData: any;
  competitionType: string;
  currentUser: any;
  onSaveDatabase: (data: any, action: string, target: string) => Promise<boolean>;
  triggerToast: (msg: string) => void;
}

export default function MarksGradeManager({ dbData, competitionType, currentUser, onSaveDatabase, triggerToast }: MarksGradeManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchEvent, setSearchEvent] = useState('');
  const [localGrades, setLocalGrades] = useState<any>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes('pdf')) {
      triggerToast('✗ Please select a valid PDF file.');
      return;
    }

    setIsUploading(true);
    triggerToast('📄 Analyzing PDF and importing registrations...');
    
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`/api/parse-pdf?competition=${competitionType}`, { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success && data.participants && data.participants.length > 0) {
        triggerToast(`✓ Successfully imported ${data.count} new registrations! (${data.totalExtracted} found)`);
        // Refresh full DB to grab new registrations and update parent state
        const refreshRes = await fetch('/api/data');
        const newData = await refreshRes.json();
        if (newData && newData.registrations) {
          // Update parent component's state with new registrations without re-saving
          onSaveDatabase(newData, 'REFRESH_AFTER_PDF_UPLOAD', `Imported ${data.count} registrations`);
        }
      } else if (!data.success) {
        triggerToast(`✗ ${data.error || 'Failed to parse PDF'}`);
      } else {
        triggerToast('✗ No valid participants found in the PDF. Check the file format.');
      }
    } catch (err: any) {
      console.error('PDF Upload Error:', err);
      triggerToast(`✗ Error uploading PDF: ${err.message || 'Network error'}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const categories = ['Sub Junior', 'Junior', 'Senior', 'Super Senior', 'Group Items'];
  const events = useMemo(() => {
    const list = (dbData.registrations || []).filter((r: any) => {
      if (r.competition !== competitionType) return false;
      if (searchCategory && !matchesSection(r.section, searchCategory)) return false;
      return true;
    });
    return Array.from(new Set(list.map((r: any) => r.eventName))).sort() as string[];
  }, [dbData.registrations, searchCategory, competitionType]);

  const filteredRegistrations = useMemo(() => {
    return (dbData.registrations || []).filter((r: any) => {
      if (r.competition !== competitionType) return false;
      if (searchCategory && !matchesSection(r.section, searchCategory)) return false;
      if (searchEvent && r.eventName !== searchEvent) return false;
      return true;
    });
  }, [dbData.registrations, searchCategory, searchEvent, competitionType]);

  // Derive status key using the actual section stored in the first matched participant, fallback to searchCategory
  const actualSection = filteredRegistrations[0]?.section || searchCategory;
  const statusKey = `${competitionType}_${actualSection}_${searchEvent}`;
  const currentStatus = (dbData.competitionStatuses && dbData.competitionStatuses[statusKey]) || 'Not Started';

  const handleStatusChange = async (e: any) => {
    try {
      const newStatus = e.target.value;
      const updated = { ...dbData };
      if (!updated.competitionStatuses) updated.competitionStatuses = {};
      updated.competitionStatuses[statusKey] = newStatus;

      // Synchronize all saved results corresponding to these registrations with the new publication status
      if (!updated.results) updated.results = [];
      const regIds = new Set(filteredRegistrations.map((r: any) => r.id));
      
      updated.results = updated.results.map((r: any) => {
        const matchesEventName = r.competition === competitionType && r.eventName === searchEvent;
        const matchesSectionValue = r.section === actualSection || (actualSection && r.category?.includes(actualSection));
        if (regIds.has(r.registrationId) || (matchesEventName && matchesSectionValue)) {
          return {
            ...r,
            isPublished: newStatus === 'Result Published'
          };
        }
        return r;
      });

      const success = await onSaveDatabase(updated, 'UPDATE_STATUS', `${statusKey} to ${newStatus}`);
      if (success) {
        triggerToast(`✓ Status updated to ${newStatus}`);
      } else {
        triggerToast(`✗ Failed to update status. Please try again.`);
      }
    } catch (err: any) {
      triggerToast(`✗ Error updating status: ${err.message || 'Unknown error'}`);
    }
  };

  const handleGradeChange = (regId: string, field: string, value: string) => {
    setLocalGrades((prev: any) => ({
      ...prev,
      [regId]: { ...prev[regId], [field]: value }
    }));
  };

  const calculatePoints = (grade: string, position: string, isGroup: boolean) => {
    let p = 0;
    if (isGroup) {
      if (position === '1st') p += 10;
      else if (position === '2nd') p += 5;
      else if (position === '3rd') p += 3;

      if (grade === 'A') p += 5;
      else if (grade === 'B') p += 3;
      else if (grade === 'C') p += 1;
    } else {
      if (position === '1st') p += 5;
      else if (position === '2nd') p += 3;
      else if (position === '3rd') p += 1;

      if (grade === 'A') p += 5;
      else if (grade === 'B') p += 3;
      else if (grade === 'C') p += 1;
    }
    return p;
  };

  const handleSaveSingleParticipant = async (regId: string, publish: boolean) => {
    try {
      const reg = filteredRegistrations.find((r: any) => r.id === regId);
      if (!reg) return;

      const g = localGrades[regId];
      const existingResult = (dbData.results || []).find((r: any) => r.registrationId === regId);
      
      const gradeVal = g?.grade !== undefined ? g.grade : (existingResult?.grade || 'None');
      const posVal = g?.position !== undefined ? g.position : (existingResult?.position || 'None');

      if (gradeVal === 'None') {
        triggerToast('⚠ Please assign a grade first.');
        return;
      }

      const updated = { ...dbData };
      if (!updated.results) updated.results = [];
      if (!updated.competitionStatuses) updated.competitionStatuses = {};

      const isGroup = searchCategory === 'Group Items';
      const pts = calculatePoints(gradeVal, posVal, isGroup);

      const existingIdx = updated.results.findIndex((r: any) => r.registrationId === regId);

      const resultObj = {
        id: existingResult?.id || `res-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
        registrationId: regId,
        competitorName: reg.competitorName,
        unitId: reg.shakhaId,
        unitName: getShakhaNameByCode(reg.shakhaId, dbData.units),
        competition: competitionType,
        eventName: reg.eventName,
        section: reg.section,
        grade: gradeVal,
        position: posVal,
        totalPoints: pts,
        isPublished: publish,
        createdAt: existingResult?.createdAt || new Date().toISOString()
      };

      if (existingIdx >= 0) {
        updated.results[existingIdx] = resultObj;
      } else {
        updated.results.push(resultObj);
      }

      // Check if any results for this event are published to sync event's status key
      const eventResults = updated.results.filter((r: any) => r.competition === competitionType && r.eventName === searchEvent);
      const anyPublished = eventResults.some((r: any) => r.isPublished);
      if (anyPublished) {
        updated.competitionStatuses[statusKey] = 'Result Published';
      } else {
        updated.competitionStatuses[statusKey] = 'Completed';
      }

      const modeStr = publish ? 'Published' : 'Saved as Draft';
      const success = await onSaveDatabase(updated, 'SAVE_SINGLE_MARK', `${competitionType} - ${reg.competitorName} (${modeStr})`);
      if (success) {
        triggerToast(`✓ Successfully ${publish ? 'published' : 'saved draft for'} ${reg.competitorName}!`);
        // Clean matching local state
        setLocalGrades((prev: any) => {
          const next = { ...prev };
          if (next[regId]) {
            delete next[regId];
          }
          return next;
        });
      } else {
        triggerToast(`✗ Failed to save. Please try again.`);
      }
    } catch (err: any) {
      triggerToast(`✗ Error: ${err.message || 'Unknown error'}`);
    }
  };

  const handleSaveMarks = async (publish: boolean) => {
    try {
      if (!searchCategory || !searchEvent) {
        triggerToast('⚠ Please select a category and event to save marks.');
        return;
      }

      const updated = { ...dbData };
      if (!updated.results) updated.results = [];
      if (!updated.competitionStatuses) updated.competitionStatuses = {};
      updated.competitionStatuses[statusKey] = publish ? 'Result Published' : 'Completed';

      const isGroup = searchCategory === 'Group Items';
      let hasGradesOrChanges = false;

      filteredRegistrations.forEach((reg: any) => {
        const g = localGrades[reg.id];
        const existingResult = (dbData.results || []).find((r: any) => r.registrationId === reg.id);
        
        // If there's no new local input AND no existing result, skip
        if ((!g || !g.grade || g.grade === 'None') && !existingResult) return;
        hasGradesOrChanges = true;

        const gradeVal = g?.grade !== undefined ? g.grade : (existingResult?.grade || 'None');
        const posVal = g?.position !== undefined ? g.position : (existingResult?.position || 'None');
        const pts = calculatePoints(gradeVal, posVal, isGroup);
        
        const existingIdx = updated.results.findIndex((r: any) => r.registrationId === reg.id);
        
        const resultObj = {
          id: existingResult?.id || `res-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
          registrationId: reg.id,
          competitorName: reg.competitorName,
          unitId: reg.shakhaId,
          unitName: getShakhaNameByCode(reg.shakhaId, dbData.units),
          competition: competitionType,
          eventName: reg.eventName,
          section: reg.section,
          grade: gradeVal,
          position: posVal,
          totalPoints: pts,
          isPublished: publish,
          createdAt: existingResult?.createdAt || new Date().toISOString()
        };

        if (existingIdx >= 0) {
          updated.results[existingIdx] = resultObj;
        } else {
          updated.results.push(resultObj);
        }
      });

      if (!hasGradesOrChanges) {
        triggerToast('⚠ Please assign grades to at least one participant.');
        return;
      }

      const success = await onSaveDatabase(updated, publish ? 'PUBLISH_MARKS_ALL' : 'SAVE_MARKS_DRAFT_ALL', `${competitionType} - ${searchEvent} (${publish ? 'Published' : 'Draft'})`);
      if (success) {
        triggerToast(`✓ Successfully ${publish ? 'saved and published' : 'saved draft marks for'} ${filteredRegistrations.length} participants!`);
        setLocalGrades({}); // Reset grades after successful bulk update
      } else {
        triggerToast(`✗ Failed to update marks. Please try again.`);
      }
    } catch (err: any) {
      triggerToast(`✗ Error: ${err.message || 'Unknown error'}`);
    }
  };

  const handleClearAllRegistrations = async () => {
    try {
      const totalCount = dbData.registrations?.length || 0;
      const updated = { ...dbData };
      updated.registrations = [];
      updated.results = [];
      updated.competitionStatuses = {};
      
      const success = await onSaveDatabase(updated, 'CLEAR_ALL_REGISTRATIONS', `${competitionType} - Cleared ${totalCount} participants`);
      
      if (success) {
        setShowClearConfirm(false);
        setSearchCategory('');
        setSearchEvent('');
        setLocalGrades({});
        triggerToast(`✓ Successfully removed all ${totalCount} participants from ${competitionType}!`);
      } else {
        triggerToast(`✗ Failed to clear registrations. Please try again.`);
      }
    } catch (err: any) {
      triggerToast(`✗ Error clearing registrations: ${err.message || 'Unknown error'}`);
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 text-left">
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">COMPETITION REGISTRY</span>
        <h3 className="font-sans font-bold text-lg text-white">
          {competitionType} Registrations & Grading
        </h3>
        <p className="text-slate-500 text-xs">Upload PDFs to import registrations, then filter by event to grade participants.</p>
      </div>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 border-dashed hover:border-rose-500 transition-colors flex flex-col items-center justify-center gap-3">
        <input type="file" accept="application/pdf" id="pdf-upload" onChange={handleFileUpload} className="hidden" />
        <label htmlFor="pdf-upload" className="px-6 py-3 bg-rose-900 text-rose-300 font-bold rounded-xl cursor-pointer hover:bg-rose-800 transition shadow-lg inline-flex items-center gap-2">
          <FileText className="w-5 h-5" /> 
          {isUploading ? 'Parsing PDF...' : 'Upload Official PDF Manifest'}
        </label>
        <p className="text-xs text-slate-500">Upload the CML participant PDF to import participants into the registry.</p>
        {(dbData.registrations?.length || 0) > 0 && (
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="mt-4 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold rounded-lg flex items-center gap-2 border border-red-900/50 transition text-sm"
          >
            <Trash2 className="w-4 h-4" /> Clear All Participants ({dbData.registrations?.length || 0})
          </button>
        )}
      </div>

      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-[10px] uppercase font-bold text-slate-400">Category / Section</label>
          <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
            <option value="">-- Select Category --</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-[10px] uppercase font-bold text-slate-400">Event Name</label>
          <select value={searchEvent} onChange={e => setSearchEvent(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
            <option value="">-- Select Event --</option>
            {events.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
        </div>

        {searchCategory && searchEvent && (
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[10px] uppercase font-bold text-amber-500">Event Status</label>
            <select value={currentStatus} onChange={handleStatusChange} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-bold">
              <option value="Not Started">Not Started</option>
              <option value="Started">Started</option>
              <option value="Completed">Completed</option>
              <option value="Result Published">Result Published</option>
            </select>
          </div>
        )}
      </div>

      {searchCategory && searchEvent && filteredRegistrations.length > 0 ? (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-xs text-left">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-500" />
              {searchEvent} ({searchCategory}) - {filteredRegistrations.length} participants
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                  <th className="p-3">CML ID</th>
                  <th className="p-3">Competitor Name</th>
                  <th className="p-3">House Name</th>
                  <th className="p-3">Parish Unit</th>
                  <th className="p-3 w-[110px]">Grade</th>
                  <th className="p-3 w-[110px]">Position</th>
                  <th className="p-3">Total Pts</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Row Actions (One-by-One)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRegistrations.map((reg: any) => {
                  const existingResult = (dbData.results || []).find((r: any) => r.registrationId === reg.id);
                  const currentGrade = localGrades[reg.id]?.grade !== undefined ? localGrades[reg.id]?.grade : (existingResult?.grade || 'None');
                  const currentPosition = localGrades[reg.id]?.position !== undefined ? localGrades[reg.id]?.position : (existingResult?.position || 'None');
                  const currentPts = calculatePoints(currentGrade, currentPosition, searchCategory === 'Group Items');
                  const hasLocalChanges = localGrades[reg.id] && (localGrades[reg.id]?.grade !== undefined || localGrades[reg.id]?.position !== undefined);

                  const unitName = getShakhaNameByCode(reg.shakhaId, dbData.units);

                  let statusBadge = null;
                  if (!existingResult) {
                    statusBadge = <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-medium font-sans">Not Graded</span>;
                  } else if (existingResult.isPublished) {
                    statusBadge = <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/30 rounded text-[10px] font-bold font-sans">Published</span>;
                  } else {
                    statusBadge = <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-900/30 rounded text-[10px] font-medium font-sans">Draft (Unpub)</span>;
                  }

                  return (
                    <tr key={reg.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{reg.cmlId}</td>
                      <td className="p-3 font-bold text-white">{reg.competitorName}</td>
                      <td className="p-3 text-slate-400">{reg.houseName || '-'}</td>
                      <td className="p-3 text-amber-200/70">{unitName}</td>
                      <td className="p-2">
                        <select value={currentGrade} onChange={e => handleGradeChange(reg.id, 'grade', e.target.value)} className="w-[105px] bg-slate-900 border border-slate-700 p-1.5 rounded text-white text-[10px]">
                          <option value="None">None</option>
                          <option value="A">A Grade</option>
                          <option value="B">B Grade</option>
                          <option value="C">C Grade</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <select value={currentPosition} onChange={e => handleGradeChange(reg.id, 'position', e.target.value)} className="w-[105px] bg-slate-900 border border-slate-700 p-1.5 rounded text-white text-[10px]">
                          <option value="None">None</option>
                          <option value="1st">1st Place</option>
                          <option value="2nd">2nd Place</option>
                          <option value="3rd">3rd Place</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className="text-amber-400 font-black">{currentPts}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div>
                          {statusBadge}
                          {hasLocalChanges && (
                            <span className="block text-[8px] text-amber-400 font-extrabold animate-pulse uppercase tracking-wider mt-1 text-center font-sans">
                              Unsaved Edit
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveSingleParticipant(reg.id, false)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold font-sans rounded text-[9px] uppercase tracking-wider transition cursor-pointer"
                            title="Save as Draft (Unpublished)"
                          >
                            Save Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveSingleParticipant(reg.id, true)}
                            className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 active:scale-95 text-emerald-400 hover:text-emerald-300 border border-emerald-900/50 font-bold font-sans rounded text-[9px] uppercase tracking-wider transition cursor-pointer"
                            title="Save and Publish to stand"
                          >
                            Publish
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400 italic">Assign grades individually above or submit in bulk here:</span>
            <div className="flex gap-3">
              <button 
                onClick={() => handleSaveMarks(false)} 
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold rounded-lg flex items-center gap-2 transition cursor-pointer"
                title="Save all changes as unpublished drafts"
              >
                <Clock className="w-4 h-4 text-slate-400" /> Save All as Drafts
              </button>
              <button 
                onClick={() => handleSaveMarks(true)} 
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                title="Save and publish all changes to public stand"
              >
                <CheckCircle className="w-4 h-4" /> Save & Publish All
              </button>
            </div>
          </div>
        </div>
      ) : searchCategory && searchEvent ? (
        <div className="bg-slate-900/30 p-12 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center text-slate-500">
          <FileText className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-semibold">No participants found</p>
          <p className="text-xs mt-2">Try a different category or event combination.</p>
        </div>
      ) : (
        <div className="bg-slate-900/30 p-12 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center text-slate-500">
          <Search className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-semibold">Select a Category and Event</p>
          <p className="text-xs mt-2">Choose a category and event name above to view and grade participants.</p>
        </div>
      )}

      {/* Results Summary Section */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <h4 className="font-bold text-white text-sm">Published Results for {competitionType}</h4>
        </div>
        
        {(dbData.results || []).filter((r: any) => r.competition === competitionType && r.isPublished).length === 0 ? (
          <p className="text-xs text-slate-500 italic">No published results yet for this competition.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 font-mono uppercase tracking-wider">
                  <th className="p-2">Event</th>
                  <th className="p-2">Competitor</th>
                  <th className="p-2">Grade</th>
                  <th className="p-2">Position</th>
                  <th className="p-2">Points</th>
                  <th className="p-2">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(dbData.results || [])
                  .filter((r: any) => r.competition === competitionType && r.isPublished)
                  .sort((a: any, b: any) => parseInt(b.totalPoints || 0) - parseInt(a.totalPoints || 0))
                  .slice(0, 10)
                  .map((result: any) => (
                    <tr key={result.id} className="hover:bg-slate-900/40">
                      <td className="p-2 text-slate-400">{result.eventName}</td>
                      <td className="p-2 text-white font-bold">{result.competitorName}</td>
                      <td className="p-2"><span className="px-2 py-1 bg-amber-900/30 text-amber-400 rounded text-[10px] font-bold">{result.grade}</span></td>
                      <td className="p-2"><span className="px-2 py-1 bg-indigo-900/30 text-indigo-400 rounded text-[10px]">{result.position}</span></td>
                      <td className="p-2 text-emerald-400 font-bold">{result.totalPoints}</td>
                      <td className="p-2 text-slate-500">{result.unitName}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clear All */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-6 max-w-sm shadow-2xl shadow-red-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Clear All Participants?</h3>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">
              This will permanently remove all <span className="font-bold text-red-400">{dbData.registrations?.length || 0}</span> registered participants from <span className="font-bold">{competitionType}</span>. This action cannot be undone.
            </p>
            
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 mb-6 text-xs text-slate-300">
              <p className="font-mono">✓ All registrations will be deleted</p>
              <p className="font-mono">✓ All results and grades will be cleared</p>
              <p className="font-mono">✓ Event status will be reset</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearAllRegistrations}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
