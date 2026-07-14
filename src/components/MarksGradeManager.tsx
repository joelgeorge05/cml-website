import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Save, FileText, CheckCircle, Clock, Trash2, AlertTriangle, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { getShakhaNameByCode } from '../types';
import { matchesSection } from './ParticipantsManager';
import { supabase } from '../lib/supabase';
import { extractTextFromPdf, parseParticipantsFromText } from '../lib/pdfParser';
import { motion, AnimatePresence } from 'motion/react';

interface CustomSelectProps {
 label: string;
 value: string;
 onChange: (val: string) => void;
 options: string[];
 placeholder: string;
}

function CustomSelect({ label, value, onChange, options, placeholder }: CustomSelectProps) {
 const [isOpen, setIsOpen] = useState(false);
 const containerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 }
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 return (
 <div ref={containerRef} className="flex flex-col gap-1.5 flex-1 min-w-[200px] relative text-left">
 <label className="text-[10px] uppercase font-black text-slate-600 tracking-wider select-none">{label}</label>
 <button
 type="button"
 onClick={() => setIsOpen(!isOpen)}
 className="w-full bg-white/80 border border-slate-200 hover:border-amber-500/50 rounded-xl px-4 py-2.5 text-slate-900 flex items-center justify-between hover:bg-slate-50/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm shadow-md"
 >
 <span className={value ? 'text-slate-900 font-semibold' : 'text-slate-500 font-medium'}>
 {value || placeholder}
 </span>
 <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 transition={{ duration: 0.15 }}
 className="absolute z-50 left-0 right-0 top-[calc(100%+6px)] bg-white/95 border border-slate-200/80 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin"
 >
 <div className="py-1">
 <button
 type="button"
 onClick={() => {
 onChange('');
 setIsOpen(false);
 }}
 className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 ${
 !value 
 ? 'bg-amber-500/10 text-amber-400 font-bold border-l-2 border-amber-500' 
 : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
 }`}
 >
 {placeholder}
 </button>
 
 {options.map((option) => (
 <button
 key={option}
 type="button"
 onClick={() => {
 onChange(option);
 setIsOpen(false);
 }}
 className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 ${
 value === option
 ? 'bg-amber-500/10 text-amber-400 font-bold border-l-2 border-amber-500'
 : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
 }`}
 >
 {option}
 </button>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}

interface MarksGradeManagerProps {
 dbData: any;
 competitionType: string;
 currentUser: any;
 onSaveDatabase: (data: any, action: string, target: string) => Promise<boolean>;
 triggerToast: (msg: string) => void;
}

export default function MarksGradeManager({ dbData, competitionType, currentUser, onSaveDatabase, triggerToast }: MarksGradeManagerProps) {
 const [results, setResults] = useState<any[]>([]);
 const [registrations, setRegistrations] = useState<any[]>([]);
 const [isLoadingData, setIsLoadingData] = useState(true);

 useEffect(() => {
 async function fetchLocalData() {
 setIsLoadingData(true);
 try {
 const [res, reg] = await Promise.all([
 supabase.from('results').select('id, registration_id, competitor_name, unit_id, unit_name, competition, event_name, age_category, grade, position, total_points, is_published, created_at').order('created_at', { ascending: false }),
 supabase.from('registrations').select('id, competition, event_name, section, competitor_name, house_name, dob, cml_id, shakha_id, status').order('created_at', { ascending: false })
 ]);
 
 if (res.data) {
 setResults(res.data.map((r: any) => ({
 id: r.id,
 registrationId: r.registration_id,
 competitorName: r.competitor_name,
 unitId: r.unit_id,
 unitName: r.unit_name,
 competition: r.competition,
 eventName: r.event_name,
 section: r.age_category,
 grade: r.grade,
 position: r.position,
 totalPoints: r.total_points,
 isPublished: r.is_published,
 createdAt: r.created_at,
 })));
 }
 
 if (reg.data) {
 setRegistrations(reg.data.map((r: any) => ({
 id: r.id,
 competition: r.competition,
 eventName: r.event_name,
 section: r.section,
 competitorName: r.competitor_name,
 houseName: r.house_name || '',
 dob: r.dob || '',
 cmlId: r.cml_id || '',
 shakhaId: r.shakha_id || '',
 status: r.status || 'Upcoming',
 })));
 }
 } catch (err) {
 console.error('Error fetching admin data', err);
 } finally {
 setIsLoadingData(false);
 }
 }
 fetchLocalData();
 }, []);

 const [isUploading, setIsUploading] = useState(false);
 const [searchCategory, setSearchCategory] = useState('');
 const [searchEvent, setSearchEvent] = useState('');
 const [genderFilter, setGenderFilter] = useState<'All' | 'Boys' | 'Girls'>('All');
 const [localGrades, setLocalGrades] = useState<any>({});

 useEffect(() => {
 if (competitionType === 'Sahithyamalsaram' && searchCategory === 'Group Items') {
 setSearchCategory('');
 }
 }, [competitionType, searchCategory]);
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
 triggerToast(`📄 Extracting text from PDF and parsing registrations for ${competitionType}...`);
 
 try {
 // 1. Extract text client-side
 const text = await extractTextFromPdf(file);
 if (!text || text.trim().length === 0) {
 triggerToast('✗ PDF file is empty or contains no readable text.');
 setIsUploading(false);
 return;
 }

 // 2. Parse text into participant structures
 const parsed = parseParticipantsFromText(text, competitionType);
 if (parsed.length === 0) {
 triggerToast('✗ No valid participant records found in the PDF. Please check the layout/format.');
 setIsUploading(false);
 return;
 }

 // 3. Query existing entries from Supabase to filter duplicates
 const { data: existingRegs, error: queryErr } = await supabase
 .from('registrations')
 .select('cml_id, event_name, competition');

 if (queryErr) {
 triggerToast(`✗ Failed to query existing database: ${queryErr.message}`);
 setIsUploading(false);
 return;
 }

 const toInsert: any[] = [];
 const updated = JSON.parse(JSON.stringify(dbData));

 for (const p of parsed) {
 const isDuplicate = (existingRegs || []).some(
 (r: any) => r.cml_id === p.cmlId && r.event_name === p.eventName && r.competition === p.competition
 );
 if (!isDuplicate) {
 toInsert.push({
 id: p.id,
 competition: p.competition,
 event_name: p.eventName,
 section: p.section,
 competitor_name: p.competitorName,
 house_name: p.houseName || '',
 dob: p.dob || '',
 cml_id: p.cmlId,
 shakha_id: p.shakhaId,
 status: 'Upcoming'
 });
 }
 }

 if (toInsert.length === 0) {
 triggerToast('✓ Checked PDF: All participants are already registered (no new entries to add).');
 setIsUploading(false);
 return;
 }

 // 4. Batch insert new participants into Supabase
 const { error: insertErr } = await supabase
 .from('registrations')
 .insert(toInsert);

 if (insertErr) {
 triggerToast(`✗ Database insert failed: ${insertErr.message}`);
 setIsUploading(false);
 return;
 }

 // 5. Update local state copy with successful inserts and call save
 toInsert.forEach(p => {
 updated.registrations.push({
 id: p.id,
 competition: p.competition,
 eventName: p.event_name,
 section: p.section,
 competitorName: p.competitor_name,
 houseName: p.house_name,
 dob: p.dob,
 cmlId: p.cml_id,
 shakhaId: p.shakha_id,
 status: 'Upcoming'
 });
 });

 const saveSuccess = await onSaveDatabase(
 updated,
 'REFRESH_AFTER_PDF_UPLOAD',
 `Uploaded PDF manifest for ${competitionType}`
 );

 if (saveSuccess) {
 triggerToast(`✓ Successfully imported ${toInsert.length} new registrations! (${parsed.length} total extracted)`);
 }

 } catch (err: any) {
 console.error('PDF Client-side Upload/Parse Error:', err);
 triggerToast(`✗ PDF Parse Error: ${err.message || 'Check browser permissions or format.'}`);
 } finally {
 setIsUploading(false);
 e.target.value = '';
 }
 };

 const categories = competitionType === 'Sahithyamalsaram'
 ? ['Sub Junior', 'Junior', 'Senior', 'Super Senior']
 : ['Sub Junior', 'Junior', 'Senior', 'Super Senior', 'Group Items'];
 const events = useMemo(() => {
 const list = (registrations || []).filter((r: any) => {
 if (r.competition !== competitionType) return false;
 if (searchCategory && !matchesSection(r.section, searchCategory)) return false;
 return true;
 });
 return Array.from(new Set(list.map((r: any) => r.eventName))).sort() as string[];
 }, [registrations, searchCategory, competitionType]);

 const filteredRegistrations = useMemo(() => {
 return (registrations || []).filter((r: any) => {
 if (r.competition !== competitionType) return false;
 if (searchCategory && !matchesSection(r.section, searchCategory)) return false;
 if (searchEvent && r.eventName !== searchEvent) return false;
 if (genderFilter !== 'All') {
 const sectionLower = (r.section || '').toLowerCase();
 const eventLower = (r.eventName || '').toLowerCase();
 if (genderFilter === 'Boys' && !(sectionLower.includes('boys') || eventLower.includes('boys') || r.gender?.toLowerCase() === 'male')) return false;
 if (genderFilter === 'Girls' && !(sectionLower.includes('girls') || eventLower.includes('girls') || r.gender?.toLowerCase() === 'female')) return false;
 }
 return true;
 });
 }, [registrations, searchCategory, searchEvent, competitionType, genderFilter]);

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
 setLocalGrades((prev: any) => {
 const existing = prev[regId] || {};
 const updated = { ...existing, [field]: value };
 
 // If we mark as Absent, force position to 'None'
 if (field === 'grade' && value === 'Absent') {
 updated.position = 'None';
 }
 
 return {
 ...prev,
 [regId]: updated
 };
 });
 };

 const calculatePoints = (grade: string, position: string, isGroup: boolean) => {
 if (grade === 'Absent') return 0;
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
 const existingResult = (results || []).find((r: any) => r.registrationId === regId);
 
 const gradeVal = g?.grade !== undefined ? g.grade : (existingResult?.grade || 'None');
 const posVal = g?.position !== undefined ? g.position : (existingResult?.position || 'None');

 const isGroup = searchCategory === 'Group Items';
 const isAbsent = gradeVal === 'Absent';

 if (!isAbsent && gradeVal === 'None') {
 triggerToast('⚠ Please assign a grade first (or mark as Absent).');
 return;
 }

 const updated = { ...dbData };
 if (!updated.results) updated.results = [];
 if (!updated.competitionStatuses) updated.competitionStatuses = {};

 const pts = calculatePoints(gradeVal, isAbsent ? 'None' : posVal, isGroup);

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
 position: isAbsent ? 'None' : posVal,
 totalPoints: pts,
 isPublished: publish,
 isAbsent: isAbsent,
 createdAt: existingResult?.createdAt || new Date().toISOString()
 };

 // Write to Supabase results table
 const { error: dbError } = await supabase.from('results').upsert({
 id: resultObj.id,
 registration_id: resultObj.registrationId,
 competitor_name: resultObj.competitorName,
 unit_id: resultObj.unitId,
 unit_name: resultObj.unitName,
 competition: resultObj.competition,
 event_name: resultObj.eventName,
 age_category: resultObj.section || '',
 grade: resultObj.grade,
 position: resultObj.position,
 
 is_published: resultObj.isPublished,
 created_at: resultObj.createdAt
 });
 if (dbError) throw dbError;

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
 setLocalGrades((prev: any) => {
 const next = { ...prev };
 if (next[regId]) delete next[regId];
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

 const upsertRows: any[] = [];
 filteredRegistrations.forEach((reg: any) => {
 const g = localGrades[reg.id];
 const existingResult = (results || []).find((r: any) => r.registrationId === reg.id);
 
 // If there's no new local input AND no existing result, skip
 if ((!g || !g.grade || g.grade === 'None') && !existingResult) return;
 hasGradesOrChanges = true;

 const gradeVal = g?.grade !== undefined ? g.grade : (existingResult?.grade || 'None');
 const posVal = gradeVal === 'Absent' ? 'None' : (g?.position !== undefined ? g.position : (existingResult?.position || 'None'));
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

 upsertRows.push({
 id: resultObj.id,
 registration_id: resultObj.registrationId,
 competitor_name: resultObj.competitorName,
 unit_id: resultObj.unitId,
 unit_name: resultObj.unitName,
 competition: resultObj.competition,
 event_name: resultObj.eventName,
 age_category: resultObj.section || '',
 grade: resultObj.grade,
 position: resultObj.position,
 
 is_published: resultObj.isPublished,
 created_at: resultObj.createdAt
 });

 if (existingIdx >= 0) {
 updated.results[existingIdx] = resultObj;
 } else {
 updated.results.push(resultObj);
 }
 });

 // Bulk upsert to Supabase
 if (upsertRows.length > 0) {
 const { error: dbError } = await supabase.from('results').upsert(upsertRows);
 if (dbError) throw dbError;
 }

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
 const totalCount = registrations?.length || 0;
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
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4 text-left sticky top-0 z-30 bg-white/90 pt-4 shadow-sm -mt-4 px-2 rounded-b-2xl">
 <div className="flex flex-col gap-1">
 <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">COMPETITION REGISTRY</span>
 <h3 className="font-sans font-bold text-lg text-slate-900">
 {competitionType} Registrations & Grading
 </h3>
 <p className="text-slate-500 text-xs">Upload PDFs to import registrations, then filter by event to grade participants.</p>
 </div>
 
 <button
 onClick={async () => {
 const newVisibility = !(dbData.settings?.showOverallLeaderboard);
 const updated = { ...dbData, settings: { ...dbData.settings, showOverallLeaderboard: newVisibility } };
 onSaveDatabase(updated, 'TOGGLE_LEADERBOARD_VISIBILITY', newVisibility ? 'Published' : 'Hidden');
 
 // Actually persist to Supabase
 const targetId = dbData.settings?.id || '8333e21d-084a-47e8-a316-9cf17220e79f';
 await supabase.from('settings').update({ show_overall_leaderboard: newVisibility }).eq('id', targetId);
 }}
 className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition self-start shadow-sm flex items-center gap-2 border ${dbData.settings?.showOverallLeaderboard ? 'bg-emerald-50 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 border-emerald-200' : 'bg-amber-50 text-amber-600 hover:text-amber-700 hover:bg-amber-100 border-amber-200'}`}
 title="Toggle public visibility of the overall Shakha leaderboard"
 >
 {dbData.settings?.showOverallLeaderboard ? (
 <><Eye className="w-3.5 h-3.5" /> Publicly Visible</>
 ) : (
 <><EyeOff className="w-3.5 h-3.5" /> Hidden from Public</>
 )}
 </button>
 </div>

 <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center gap-4 transition-all">
 <input type="file" accept="application/pdf" id="pdf-upload" onChange={handleFileUpload} className="hidden" />
 <label htmlFor="pdf-upload" className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl cursor-pointer hover:bg-rose-700 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2">
 <FileText className="w-5 h-5" /> 
 {isUploading ? 'Parsing PDF...' : 'Upload Official PDF Manifest'}
 </label>
 <p className="text-xs text-slate-500 font-medium">Upload the CML participant PDF to import participants into the registry.</p>
 {(registrations?.length || 0) > 0 && (
 <div className="w-full h-px bg-slate-200/60 my-2" />
 )}
 {(registrations?.length || 0) > 0 && (
 <button 
 onClick={() => setShowClearConfirm(true)}
 className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 font-bold rounded-lg flex items-center gap-2 border border-red-200 hover:border-red-300 transition-all text-sm shadow-sm"
 >
 <Trash2 className="w-4 h-4" /> Clear All Participants ({registrations?.length || 0})
 </button>
 )}
 </div>

 <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-end">
 <CustomSelect
 label="Category / Section"
 value={searchCategory}
 onChange={setSearchCategory}
 options={categories}
 placeholder="-- Select Category --"
 />
 <CustomSelect
 label="Event Name"
 value={searchEvent}
 onChange={setSearchEvent}
 options={events}
 placeholder="-- Select Event --"
 />

 {/* Gender Filter Toggle */}
 <div className="flex flex-col gap-1.5">
 <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Gender</span>
 <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-white h-[38px]">
 {(['All', 'Boys', 'Girls'] as const).map((g) => (
 <button
 key={g}
 onClick={() => setGenderFilter(g)}
 className={`px-4 h-full text-[11px] font-bold transition-all select-none cursor-pointer ${
 genderFilter === g
 ? g === 'Boys'
 ? 'bg-blue-500 text-white'
 : g === 'Girls'
 ? 'bg-rose-500 text-white'
 : 'bg-slate-700 text-white'
 : 'text-slate-500 hover:bg-slate-50'
 }`}
 >
 {g === 'Boys' ? 'Boys' : g === 'Girls' ? 'Girls' : 'All'}
 </button>
 ))}
 </div>
 </div>

 {searchCategory && searchEvent && (
 <CustomSelect
 label="Event Status"
 value={currentStatus}
 onChange={(val) => handleStatusChange({ target: { value: val } } as any)}
 options={['Not Started', 'Started', 'Completed', 'Result Published']}
 placeholder="Not Started"
 />
 )}
 </div>

 {searchCategory && searchEvent && filteredRegistrations.length > 0 ? (
 <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs text-left">
 <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
 <h4 className="font-bold text-slate-900 flex items-center gap-2">
 <Search className="w-4 h-4 text-amber-500" />
 {searchEvent} ({searchCategory}) - {filteredRegistrations.length} participants
 </h4>
 </div>
 
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50/80 text-slate-600 font-mono text-[9px] uppercase tracking-wider">
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
 <tbody className="divide-y divide-slate-200">
 {filteredRegistrations.map((reg: any) => {
 const existingResult = (results || []).find((r: any) => r.registrationId === reg.id);
 const currentGrade = localGrades[reg.id]?.grade !== undefined ? localGrades[reg.id]?.grade : (existingResult?.grade || 'None');
 const currentPosition = localGrades[reg.id]?.position !== undefined ? localGrades[reg.id]?.position : (existingResult?.position || 'None');
 const currentPts = calculatePoints(currentGrade, currentPosition, searchCategory === 'Group Items');
 const hasLocalChanges = localGrades[reg.id] && (localGrades[reg.id]?.grade !== undefined || localGrades[reg.id]?.position !== undefined);

 const unitName = getShakhaNameByCode(reg.shakhaId, dbData.units);

 const isAbsent = currentGrade === 'Absent' || existingResult?.isAbsent;

 let statusBadge = null;
 if (isAbsent) {
 statusBadge = <span className="px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 rounded text-[10px] font-bold font-sans whitespace-nowrap">Absent</span>;
 } else if (!existingResult) {
 statusBadge = <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium font-sans whitespace-nowrap">Not Graded</span>;
 } else if (existingResult.isPublished) {
 statusBadge = <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold font-sans whitespace-nowrap">Published</span>;
 } else {
 statusBadge = <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded text-[10px] font-medium font-sans whitespace-nowrap">Draft (Unpub)</span>;
 }

 return (
 <tr key={reg.id} className={`transition-colors ${isAbsent ? 'bg-orange-50/60 opacity-70' : 'hover:bg-slate-50/40'}`}>
 <td className="p-3 font-mono text-slate-600">{reg.cmlId}</td>
 <td className="p-3 font-bold text-slate-900">{reg.competitorName}</td>
 <td className="p-3 text-slate-600">{reg.houseName || '-'}</td>
 <td className="p-3 text-amber-600 font-medium">{unitName}</td>
 <td className="p-2">
 <select value={currentGrade} onChange={e => handleGradeChange(reg.id, 'grade', e.target.value)} className={`w-[105px] border p-1.5 rounded text-[10px] ${currentGrade === 'Absent' ? 'bg-orange-50 border-orange-300 text-orange-700 font-bold' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
 <option value="None">None</option>
 <option value="A">A Grade</option>
 <option value="B">B Grade</option>
 <option value="C">C Grade</option>
 <option value="Absent">⚫ Absent</option>
 </select>
 </td>
 <td className="p-2">
 <select 
 value={currentGrade === 'Absent' ? 'None' : currentPosition} 
 disabled={currentGrade === 'Absent'} 
 onChange={e => handleGradeChange(reg.id, 'position', e.target.value)} 
 className={`w-[105px] border p-1.5 rounded text-[10px] ${
 currentGrade === 'Absent' 
 ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
 : 'bg-slate-50 border-slate-300 text-slate-900'
 }`}
 >
 <option value="None">None</option>
 <option value="1st">1st Place</option>
 <option value="2nd">2nd Place</option>
 <option value="3rd">3rd Place</option>
 </select>
 </td>
 <td className="p-3">
 <span className="text-amber-600 font-black">{currentPts}</span>
 </td>
 <td className="p-3 text-center">
 <div className="flex flex-col items-center justify-center">
 {statusBadge}
 {hasLocalChanges && (
 <span className="block text-[8px] text-amber-600 font-extrabold animate-pulse uppercase tracking-wider mt-1 text-center font-sans whitespace-nowrap">
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
 className="px-2 py-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold font-sans rounded text-[9px] uppercase tracking-wider transition cursor-pointer"
 title="Save as Draft (Unpublished)"
 >
 Save Draft
 </button>
 <button
 type="button"
 onClick={() => handleSaveSingleParticipant(reg.id, true)}
 className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 active:scale-95 text-emerald-400 hover:text-emerald-300 border border-emerald-200/50 font-bold font-sans rounded text-[9px] uppercase tracking-wider transition cursor-pointer"
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

 <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
 <span className="text-xs text-slate-600 italic">Assign grades individually above or submit in bulk here:</span>
 <div className="flex gap-3">
 <button 
 onClick={() => handleSaveMarks(false)} 
 className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 hover:text-slate-900 font-bold rounded-lg flex items-center gap-2 transition cursor-pointer"
 title="Save all changes as unpublished drafts"
 >
 <Clock className="w-4 h-4 text-slate-600" /> Save All as Drafts
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
 <div className="bg-slate-50/30 p-12 rounded-2xl border border-slate-200/50 flex flex-col items-center justify-center text-slate-500">
 <FileText className="w-12 h-12 mb-4 opacity-20" />
 <p className="font-semibold">No participants found</p>
 <p className="text-xs mt-2">Try a different category or event combination.</p>
 </div>
 ) : (
 <div className="bg-slate-50/30 p-12 rounded-2xl border border-slate-200/50 flex flex-col items-center justify-center text-slate-500">
 <Search className="w-12 h-12 mb-4 opacity-20" />
 <p className="font-semibold">Select a Category and Event</p>
 <p className="text-xs mt-2">Choose a category and event name above to view and grade participants.</p>
 </div>
 )}

 {/* Results Summary Section */}
 <div className="bg-white rounded-2xl border border-slate-200 p-6">
 <div className="flex items-center gap-2 mb-4">
 <CheckCircle className="w-5 h-5 text-emerald-500" />
 <h4 className="font-bold text-slate-900 text-sm">Published Results for {competitionType}</h4>
 </div>
 
 {(results || []).filter((r: any) => r.competition === competitionType && r.isPublished).length === 0 ? (
 <p className="text-xs text-slate-500 italic">No published results yet for this competition.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50/80 text-slate-600 font-mono uppercase tracking-wider">
 <th className="p-2">Event</th>
 <th className="p-2">Competitor</th>
 <th className="p-2">Grade</th>
 <th className="p-2">Position</th>
 <th className="p-2">Points</th>
 <th className="p-2">Unit</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200">
 {(results || [])
 .filter((r: any) => r.competition === competitionType && r.isPublished)
 .sort((a: any, b: any) => parseInt(b.totalPoints || 0) - parseInt(a.totalPoints || 0))
 .slice(0, 10)
 .map((result: any) => (
 <tr key={result.id} className="hover:bg-slate-50/40">
 <td className="p-2 text-slate-600">{result.eventName}</td>
 <td className="p-2 text-slate-900 font-bold">{result.competitorName}</td>
 <td className="p-2"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">{result.grade}</span></td>
 <td className="p-2"><span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-[10px]">{result.position}</span></td>
 <td className="p-2 text-emerald-600 font-bold">{result.totalPoints}</td>
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
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
 <div className="bg-slate-50 border border-red-900/50 rounded-2xl p-6 max-w-sm shadow-2xl shadow-red-900/20">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 bg-red-900/30 rounded-lg">
 <AlertTriangle className="w-6 h-6 text-red-400" />
 </div>
 <h3 className="text-lg font-bold text-slate-900">Clear All Participants?</h3>
 </div>
 
 <p className="text-slate-600 text-sm mb-4">
 This will permanently remove all <span className="font-bold text-red-400">{registrations?.length || 0}</span> registered participants from <span className="font-bold">{competitionType}</span>. This action cannot be undone.
 </p>
 
 <div className="bg-white0 border border-slate-200 rounded-lg p-3 mb-6 text-xs text-slate-700">
 <p className="font-mono">✓ All registrations will be deleted</p>
 <p className="font-mono">✓ All results and grades will be cleared</p>
 <p className="font-mono">✓ Event status will be reset</p>
 </div>

 <div className="flex gap-3">
 <button 
 onClick={() => setShowClearConfirm(false)}
 className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg transition"
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
