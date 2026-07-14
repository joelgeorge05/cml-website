import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { 
 Users, 
 Search, 
 Trash2, 
 Edit, 
 Plus, 
 FileText, 
 CheckCircle, 
 X, 
 Filter, 
 AlertTriangle,
 Award,
 Calendar,
 Layers,
 Sparkles,
 Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { extractTextFromPdf, parseParticipantsFromText } from '../lib/pdfParser';

// Helper function to match age sections / categories safely and robustly
export function matchesSection(regSection: string, filterSection: string): boolean {
 if (!regSection || !filterSection) return false;
 const rs = regSection.trim().toLowerCase();
 const fs = filterSection.trim().toLowerCase();
 
 if (fs === 'all' || fs === '') return true;
 
 if (fs === 'sub junior') {
 return rs.startsWith('sub j') || rs.includes('sub junior') || rs.includes('sub-junior');
 }
 if (fs === 'junior') {
 return (rs.includes('junior') || rs.startsWith('j')) && !rs.includes('sub');
 }
 if (fs === 'senior') {
 return (rs.includes('senior') || rs.startsWith('s')) && !rs.includes('super');
 }
 if (fs === 'super senior') {
 return rs.includes('super') || rs.startsWith('sup');
 }
 if (fs === 'group items') {
 return rs === 'group items' || rs.includes('group');
 }
 
 return rs.includes(fs) || fs.includes(rs);
}

// Helper function to extract gender and group category out of section or event name
export function getParticipantGenderAndGroup(reg: any): 'boy' | 'girl' | 'group' {
 if (!reg) return 'boy';
 const sec = (reg.section || '').toLowerCase();
 const evt = (reg.eventName || '').toLowerCase();
 
 if (
 sec.includes('group') || 
 sec.includes('chorus') || 
 sec.includes('drama') || 
 sec.includes('skit') || 
 sec.includes('duet') ||
 evt.includes('group') || 
 evt.includes('chorus') || 
 evt.includes('drama') || 
 evt.includes('skit') || 
 evt.includes('duet')
 ) {
 return 'group';
 }
 if (sec.includes('girl') || evt.includes('girl')) {
 return 'girl';
 }
 if (sec.includes('boy') || evt.includes('boy')) {
 return 'boy';
 }
 return 'boy'; // Fallback
}

interface ParticipantsManagerProps {
 dbData: any;
 currentUser: any;
 onSaveDatabase: (data: any, action: string, target: string) => Promise<boolean>;
 triggerToast: (msg: string) => void;
}

export default function ParticipantsManager({ dbData, currentUser, onSaveDatabase, triggerToast }: ParticipantsManagerProps) {
 const [results, setResults] = useState<any[]>([]);
 const [registrations, setRegistrations] = useState<any[]>([]);
 const [isLoadingData, setIsLoadingData] = useState(true);

 React.useEffect(() => {
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

 // Local active states
 const [isUploading, setIsUploading] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCompetition, setSelectedCompetition] = useState<'All' | 'Kalolsavam' | 'Sahithyamalsaram'>('All');
 const [selectedSection, setSelectedSection] = useState<string>('All');
 const [selectedUnit, setSelectedUnit] = useState<string>('All');
 const [genderFilter, setGenderFilter] = useState<'all' | 'boys' | 'girls' | 'group'>('all');

 // Modal forms states
 const [isAddOpen, setIsAddOpen] = useState(false);
 const [isEditOpen, setIsEditOpen] = useState(false);
 const [isDeleteOpen, setIsDeleteOpen] = useState(false);
 const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
 const [deleteAllConfirmationWord, setDeleteAllConfirmationWord] = useState('');
 const [isWinnersPdfGenerating, setIsWinnersPdfGenerating] = useState(false);

 // Form states
 const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
 const [formName, setFormName] = useState('');
 const [formHouse, setFormHouse] = useState('');
 const [formDob, setFormDob] = useState('2012-01-01');
 const [formCmlId, setFormCmlId] = useState('');
 const [formShakhaId, setFormShakhaId] = useState('');
 const [formEventName, setFormEventName] = useState('');
 const [formSection, setFormSection] = useState('SUB JUNIOR BOYS');
 const [formCompetition, setFormCompetition] = useState<'Kalolsavam' | 'Sahithyamalsaram'>('Kalolsavam');

 const categories = [
 'SUB JUNIOR BOYS', 
 'SUB JUNIOR GIRLS', 
 'JUNIOR BOYS', 
 'JUNIOR GIRLS', 
 'SENIOR BOYS', 
 'SENIOR GIRLS', 
 'SUPER SENIOR BOYS', 
 'SUPER SENIOR GIRLS', 
 'GROUP ITEMS'
 ];
 
 const editCategories = useMemo(() => {
 let list = [...categories];
 if (formCompetition === 'Sahithyamalsaram') {
 list = list.filter(c => c !== 'GROUP ITEMS');
 }
 if (formSection && !list.some(c => c.toLowerCase() === formSection.toLowerCase())) {
 list.push(formSection);
 }
 return list;
 }, [formSection, formCompetition]);
 
 // Custom unit mappings for elegant visuals
 const unitCodeMapping: Record<string, string> = {
 'KYR01': 'Kaliyar',
 'KYR02': 'Kadavoor',
 'KYR03': 'Kodikulam',
 'KYR04': 'Koduvely',
 'KYR05': 'Mullaringad',
 'KYR06': 'Mundanmudy',
 'KYR07': 'Njarakkad',
 'KYR08': 'Paingottoor',
 'KYR09': 'Punnamattam',
 'KYR10': 'Rajagiri',
 'KYR11': 'Thennathoor',
 'KYR12': 'Thommankuthu',
 'KYR13': 'Vannappuram'
 };

 const getUnitName = (shakhaId: string) => {
 if (!shakhaId) return 'Unknown Shakha';
 const cleanId = shakhaId.toUpperCase().trim();
 if (unitCodeMapping[cleanId]) return unitCodeMapping[cleanId];
 // fallback to db units if matches u.id
 const dbUnit = dbData.units?.find((u: any) => u.id === shakhaId || u.name?.toLowerCase().includes(shakhaId.toLowerCase()));
 if (dbUnit) return dbUnit.name;
 return shakhaId;
 };

 // Derive unique unit codes currently in registrations list
 const activeRegistrations = registrations || [];

 const registrationUnits = useMemo(() => {
 const list = new Set<string>();
 activeRegistrations.forEach((r: any) => {
 if (r.shakhaId) list.add(r.shakhaId.toUpperCase());
 });
 return Array.from(list).sort();
 }, [activeRegistrations]);

 // Handle PDF upload trigger for active view tab
 const [uploadCompType, setUploadCompType] = useState<'Kalolsavam' | 'Sahithyamalsaram'>('Kalolsavam');

 const handleFileUpload = async (e: any) => {
 const file = e.target.files[0];
 if (!file) return;

 if (!file.type.includes('pdf')) {
 triggerToast('✗ Please select a valid PDF file.');
 return;
 }

 setIsUploading(true);
 triggerToast(`📄 Extracting text from PDF and parsing registrations for ${uploadCompType}...`);

 try {
 // 1. Extract text client-side
 const text = await extractTextFromPdf(file);
 if (!text || text.trim().length === 0) {
 triggerToast('✗ PDF file is empty or contains no readable text.');
 setIsUploading(false);
 return;
 }

 // 2. Parse text into participant structures
 const parsed = parseParticipantsFromText(text, uploadCompType);
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
 `Uploaded PDF manifest for ${uploadCompType}`
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

 // Download registration sheet template CSV directly
 const downloadCsvTemplate = () => {
 try {
 const headers = "Competitor Name,CML ID,Parish Unit Code,Competition,Age Section,Event Name,House Name,DOB\n";
 const sample1 = "DEON SIJO,KYR0700404,KYR07,Kalolsavam,SUB JUNIOR BOYS,BIBLE READING,THENGANAKUNNEL,2013-02-06\n";
 const sample2 = "ALAN ROY,KYR01-023,KYR01,Kalolsavam,SUB JUNIOR BOYS,BIBLE READING,Vadakkekuttu,2012-05-15\n";
 const sample3 = "LIYA BOBBY,KYR03-012,KYR03,Sahithyamalsaram,JUNIOR GIRLS,SPEECH,Puthenveettil,2008-09-22\n";
 const sample4 = "SHALU JOSE,KYR04-106,KYR04,Kalolsavam,SENIOR GIRLS,SPEECH,Vadakkemuriyil,2006-04-12\n";
 const content = headers + sample1 + sample2 + sample3 + sample4;
 const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
 const url = URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.setAttribute("href", url);
 link.setAttribute("download", "CML_Registration_Sheet_Template_2026.csv");
 link.style.visibility = "hidden";
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 triggerToast("✓ Downloaded CSV Registration Template Successfully!");
 } catch (e: any) {
 console.error("Template download error:", e);
 triggerToast("✗ Template download failed.");
 }
 };

 // Safe manual addition
 const handleAddParticipant = async (e: React.FormEvent) => {
 e.preventDefault();

 if (!formEventName.trim()) {
 triggerToast('⚠ Please specify an Event Name');
 return;
 }

 const cleanCmlId = formCmlId.toUpperCase().trim();
 // Default Shakha code
 const derivedShakha = formShakhaId || cleanCmlId.substring(0, 5) || 'KYR01';

 let finalName = formName.trim();
 
 // Direct User Intent Enforcement: "for group items only register the name of the shakha dont need to register the whole name of the participant"
 if (formSection && formSection.toUpperCase() === 'GROUP ITEMS') {
 const shakhaName = getUnitName(derivedShakha);
 finalName = shakhaName || 'Group Shakha';
 }

 if (!finalName) {
 triggerToast('⚠ Please specify a participant name.');
 return;
 }

 const newParticipant = {
 id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
 competition: formCompetition,
 eventName: formEventName.toUpperCase().trim(),
 section: formSection,
 competitorName: finalName,
 houseName: formSection && formSection.toUpperCase() === 'GROUP ITEMS' ? '' : formHouse.trim(),
 dob: formSection && formSection.toUpperCase() === 'GROUP ITEMS' ? '' : formDob,
 cmlId: cleanCmlId || `KYR01-${Math.floor(Math.random() * 900 + 100)}`,
 shakhaId: derivedShakha
 };

 const updated = { ...dbData };
 if (!updated.registrations) updated.registrations = [];
 
 // Check duplicates
 const duplicate = updated.registrations.find(
 (r: any) => r.cmlId === newParticipant.cmlId && 
 r.eventName === newParticipant.eventName && 
 r.competition === newParticipant.competition
 );

 if (duplicate) {
 triggerToast('⚠ Duplicate registration detected (Same CML ID, event Name, and competition)!');
 return;
 }

 // Write to Supabase
 const { error: dbErr } = await supabase.from('registrations').insert({
 id: newParticipant.id,
 competition: newParticipant.competition,
 event_name: newParticipant.eventName,
 section: newParticipant.section,
 competitor_name: newParticipant.competitorName,
 house_name: newParticipant.houseName || '',
 dob: newParticipant.dob || '',
 cml_id: newParticipant.cmlId || '',
 shakha_id: newParticipant.shakhaId || '',
 status: 'Upcoming'
 });
 if (dbErr) { triggerToast(`✗ DB Error: ${dbErr.message}`); return; }

 updated.registrations.push(newParticipant);
 const success = await onSaveDatabase(updated, 'ADD_PARTICIPANT', `${newParticipant.competitorName} registered for ${newParticipant.eventName}`);
 if (success) {
 setIsAddOpen(false);
 resetForm();
 }
 };

 // Save selected edited participant
 const handleEditParticipant = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!activeParticipantId) return;

 if (!formEventName.trim()) {
 triggerToast('⚠ Please specify an Event Name');
 return;
 }

 const cleanCmlId = formCmlId.toUpperCase().trim();
 const derivedShakha = formShakhaId || cleanCmlId.substring(0, 5) || 'KYR01';

 let finalName = formName.trim();
 if (formSection && formSection.toUpperCase() === 'GROUP ITEMS') {
 const shakhaName = getUnitName(derivedShakha);
 finalName = shakhaName || 'Group Shakha';
 }

 if (!finalName) {
 triggerToast('⚠ Name is required');
 return;
 }

 const updated = { ...dbData };
 updated.registrations = (updated.registrations || []).map((r: any) => {
 if (r.id !== activeParticipantId) return r;
 return {
 ...r,
 competition: formCompetition,
 eventName: formEventName.toUpperCase().trim(),
 section: formSection,
 competitorName: finalName,
 houseName: formSection && formSection.toUpperCase() === 'GROUP ITEMS' ? '' : formHouse.trim(),
 dob: formSection && formSection.toUpperCase() === 'GROUP ITEMS' ? '' : formDob,
 cmlId: cleanCmlId,
 shakhaId: derivedShakha
 };
 });

 // Write edit to Supabase
 const edited = updated.registrations.find((r: any) => r.id === activeParticipantId);
 if (edited) {
 const { error: dbErr } = await supabase.from('registrations').upsert({
 id: edited.id,
 competition: edited.competition,
 event_name: edited.eventName,
 section: edited.section,
 competitor_name: edited.competitorName,
 house_name: edited.houseName || '',
 dob: edited.dob || '',
 cml_id: edited.cmlId || '',
 shakha_id: edited.shakhaId || '',
 status: edited.status || 'Upcoming'
 });
 if (dbErr) { triggerToast(`✗ DB Error: ${dbErr.message}`); return; }
 }

 const success = await onSaveDatabase(updated, 'EDIT_PARTICIPANT', `Edited record for ${finalName}`);
 if (success) {
 setIsEditOpen(false);
 resetForm();
 }
 };

 // Delete designated participant
 const handleDeleteParticipant = async () => {
 if (!activeParticipantId) return;

 const targetParticipant = (registrations || []).find((r: any) => r.id === activeParticipantId);
 if (!targetParticipant) return;

 const updated = { ...dbData };
 // Remove registration record
 updated.registrations = (updated.registrations || []).filter((r: any) => r.id !== activeParticipantId);
 // Also remove any corresponding graded result to preserve referral safety
 updated.results = (updated.results || []).filter((r: any) => r.registrationId !== activeParticipantId);

 // Delete from Supabase
 await supabase.from('registrations').delete().eq('id', activeParticipantId);
 await supabase.from('results').delete().eq('registration_id', activeParticipantId);

 const success = await onSaveDatabase(
 updated,
 'DELETE_PARTICIPANT',
 `Removed ${targetParticipant.competitorName} from ${targetParticipant.competition}`
 );

 if (success) {
 setIsDeleteOpen(false);
 setActiveParticipantId(null);
 }
 };

 // Delete all participants and results
 const handleDeleteAllParticipants = async () => {
 if (deleteAllConfirmationWord.toUpperCase().trim() !== 'DELETE ALL') {
 triggerToast('⚠ Access Denied! Please type the text "DELETE ALL" to authorize.');
 return;
 }

 const updated = { ...dbData };
 const oldCount = (updated.registrations || []).length;
 updated.registrations = [];
 updated.results = []; // Cascade wipe of scores

 const success = await onSaveDatabase(
 updated, 
 'WIPE_ALL_PARTICIPANTS', 
 `Wiped all ${oldCount} participants and active results registries`
 );

 if (success) {
 triggerToast(`✓ Deleted all registered ${oldCount} participants and active score tables successfully!`);
 setIsDeleteAllOpen(false);
 setDeleteAllConfirmationWord('');
 } else {
 triggerToast('✗ Local Storage fallback save completed.');
 }
 };

 // Open Edit Dialog
 const openEdit = (p: any) => {
 setActiveParticipantId(p.id);
 setFormName(p.competitorName);
 setFormHouse(p.houseName || '');
 setFormDob(p.dob || '2012-01-01');
 setFormCmlId(p.cmlId || '');
 setFormShakhaId(p.shakhaId || '');
 setFormEventName(p.eventName || '');
 setFormSection(p.section || 'Sub Junior');
 setFormCompetition(p.competition || 'Kalolsavam');
 setIsEditOpen(true);
 };

 // Open Delete Dialog
 const openDelete = (p: any) => {
 setActiveParticipantId(p.id);
 setIsDeleteOpen(true);
 };

 // Reset form inputs
 const resetForm = () => {
 setActiveParticipantId(null);
 setFormName('');
 setFormHouse('');
 setFormDob('2012-01-01');
 setFormCmlId('');
 setFormShakhaId('');
 setFormEventName('');
 setFormSection('SUB JUNIOR BOYS');
 setFormCompetition('Kalolsavam');
 };

 // Computed / Filtered results
 const filteredParticipants = useMemo(() => {
 return (registrations || []).filter((r: any) => {
 // 1. Competition Filter
 if (selectedCompetition !== 'All' && r.competition !== selectedCompetition) {
 return false;
 }
 // 2. Section/Category Filter
 if (selectedSection !== 'All' && !matchesSection(r.section, selectedSection)) {
 return false;
 }
 // 3. Shakha Filter
 if (selectedUnit !== 'All' && r.shakhaId?.toUpperCase() !== selectedUnit.toUpperCase()) {
 return false;
 }
 // 4. Boy/Girl/Group Filter
 if (genderFilter !== 'all') {
 const classification = getParticipantGenderAndGroup(r);
 if (genderFilter === 'boys' && classification !== 'boy') return false;
 if (genderFilter === 'girls' && classification !== 'girl') return false;
 if (genderFilter === 'group' && classification !== 'group') return false;
 }
 // 5. Search Filter
 if (searchQuery.trim()) {
 const query = searchQuery.toLowerCase();
 const nameMatch = r.competitorName?.toLowerCase().includes(query);
 const codeMatch = r.cmlId?.toLowerCase().includes(query);
 const eventMatch = r.eventName?.toLowerCase().includes(query);
 const houseMatch = r.houseName?.toLowerCase().includes(query);
 return nameMatch || codeMatch || eventMatch || houseMatch;
 }
 return true;
 });
 }, [registrations, selectedCompetition, selectedSection, selectedUnit, genderFilter, searchQuery]);


 // ─── Winners PDF Generator ────────────────────────────────────────────────
 const handleDownloadWinnersPDF = async () => {
 const results: any[] = dbData.results || [];
 const registrations: any[] = dbData.registrations || [];

 const winners = results.filter((r: any) =>
 r.position === '1st' || r.position === '2nd' || r.position === '3rd'
 );

 if (winners.length === 0) {
 triggerToast('No winners (1st/2nd/3rd) found in results yet.');
 return;
 }

 setIsWinnersPdfGenerating(true);

 try {
 const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
 const pageW = 210, pageH = 297;
 const marginX = 14;
 const contentW = pageW - marginX * 2;

 const positionOrder: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3 };
 const sorted = [...winners].sort((a, b) => {
 if (a.competition !== b.competition) return a.competition.localeCompare(b.competition);
 if (a.eventName !== b.eventName) return a.eventName.localeCompare(b.eventName);
 return (positionOrder[a.position] || 9) - (positionOrder[b.position] || 9);
 });

 const posColors: Record<string, [number, number, number]> = {
 '1st': [180, 130, 0],
 '2nd': [100, 116, 140],
 '3rd': [154, 103, 61],
 };
 const posLabels: Record<string, string> = { '1st': '1ST PLACE', '2nd': '2ND PLACE', '3rd': '3RD PLACE' };

 const ITEMS_PER_PAGE = 20;
 const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;
 let currentPage = 1;

 const drawPageHeader = (pageNum: number) => {
 doc.setFillColor(159, 18, 57);
 doc.rect(marginX, 10, contentW, 1.5, 'F');
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(11);
 doc.setTextColor(15, 23, 42);
 doc.text('CHERUPUSHPA MISSION LEAGUE — KALIYAR MEKHALA', marginX, 20);
 doc.setFontSize(8.5);
 doc.setTextColor(159, 18, 57);
 doc.text('COMPETITION WINNERS REPORT — 1ST / 2ND / 3RD POSITION', marginX, 26);
 doc.setDrawColor(226, 232, 240);
 doc.setLineWidth(0.3);
 doc.line(marginX, 31, pageW - marginX, 31);
 doc.setFillColor(248, 250, 252);
 doc.roundedRect(marginX, 33, contentW, 10, 1.5, 1.5, 'F');
 doc.setDrawColor(241, 245, 249);
 doc.roundedRect(marginX, 33, contentW, 10, 1.5, 1.5, 'D');
 doc.setFontSize(7);
 doc.setTextColor(100, 116, 140);
 doc.setFont('helvetica', 'normal');
 doc.text(`Winners: ${winners.length} | Kalolsavam: ${winners.filter((w:any)=>w.competition==='Kalolsavam').length} | Sahithyamalsaram: ${winners.filter((w:any)=>w.competition==='Sahithyamalsaram').length} | ${new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}`, marginX + 3, 39.5);
 doc.setFontSize(7);
 doc.text(`Page ${pageNum} of ${totalPages}`, pageW - marginX - 3, 39.5, { align: 'right' });
 doc.setDrawColor(226, 232, 240);
 doc.line(marginX, pageH - 12, pageW - marginX, pageH - 12);
 doc.setFont('helvetica', 'normal');
 doc.setFontSize(6.5);
 doc.setTextColor(148, 163, 184);
 doc.text('CML Kaliyar Mekhala — Confidential Admin Report', marginX, pageH - 8);
 doc.text(`Page ${pageNum} / ${totalPages}`, pageW - marginX, pageH - 8, { align: 'right' });
 };

 const drawTableHeader = (y: number) => {
 doc.setFillColor(241, 245, 249);
 doc.roundedRect(marginX, y, contentW, 7, 1, 1, 'F');
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(6.5);
 doc.setTextColor(71, 85, 105);
 doc.text('#', marginX + 2, y + 4.8);
 doc.text('POSITION', marginX + 8, y + 4.8);
 doc.text('COMPETITOR NAME', marginX + 32, y + 4.8);
 doc.text('UNIT / SHAKHA', marginX + 85, y + 4.8);
 doc.text('EVENT', marginX + 122, y + 4.8);
 doc.text('SECTION', marginX + 153, y + 4.8);
 return y + 8;
 };

 drawPageHeader(currentPage);
 let y = 47;
 let rowIdx = 0;

 for (const competition of ['Kalolsavam', 'Sahithyamalsaram']) {
 const compWinners = sorted.filter((w: any) => w.competition === competition);
 if (compWinners.length === 0) continue;

 if (y > pageH - 40) {
 doc.addPage(); currentPage++; drawPageHeader(currentPage); y = 47;
 }

 const compColor: [number,number,number] = competition === 'Kalolsavam' ? [99, 102, 241] : [244, 63, 94];
 doc.setFillColor(...compColor);
 doc.roundedRect(marginX, y, contentW, 7, 1.5, 1.5, 'F');
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(8);
 doc.setTextColor(255, 255, 255);
 doc.text(`${competition.toUpperCase()} — ${compWinners.length} WINNERS`, marginX + 3, y + 5);
 y += 10;
 y = drawTableHeader(y);

 for (const w of compWinners) {
 if (y > pageH - 20) {
 doc.addPage(); currentPage++; drawPageHeader(currentPage); y = 47;
 y = drawTableHeader(y);
 }

 if (rowIdx % 2 === 0) {
 doc.setFillColor(250, 250, 255); doc.rect(marginX, y, contentW, 7, 'F');
 }

 const [pr, pg, pb] = posColors[w.position] || [71, 85, 105];
 doc.setFillColor(pr, pg, pb);
 doc.roundedRect(marginX + 7, y + 1.2, 20, 4.6, 1, 1, 'F');
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(6);
 doc.setTextColor(255, 255, 255);
 doc.text(posLabels[w.position] || w.position, marginX + 17, y + 4.2, { align: 'center' });

 doc.setFont('helvetica', 'normal');
 doc.setFontSize(6.5);
 doc.setTextColor(148, 163, 184);
 doc.text(String(rowIdx + 1), marginX + 2, y + 4.8);

 const reg = registrations.find((r: any) => r.cmlId === w.registrationId || r.cmlId === w.cmlId || r.competitorName === w.competitorName);
 const name = (w.competitorName || reg?.competitorName || '—').substring(0, 30);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(7);
 doc.setTextColor(15, 23, 42);
 doc.text(name, marginX + 32, y + 4.8);

 const unitName = (w.unitName || getUnitName(w.unitId || reg?.shakhaId || reg?.shakha) || w.unitId || '—').substring(0, 18);
 doc.setFont('helvetica', 'normal');
 doc.setFontSize(6.5);
 doc.setTextColor(71, 85, 105);
 doc.text(unitName, marginX + 85, y + 4.8);
 doc.text((w.eventName || '—').substring(0, 16), marginX + 122, y + 4.8);
 doc.text((w.section || reg?.section || '—').substring(0, 22), marginX + 153, y + 4.8);

 y += 7.5;
 rowIdx++;
 }
 y += 6;
 }

 doc.save(`CML_Kaliyar_Winners_${new Date().toISOString().slice(0, 10)}.pdf`);
 triggerToast('✅ Winners PDF downloaded successfully!');
 } catch (err) {
 console.error('PDF generation error:', err);
 triggerToast('❌ Error generating PDF. Please try again.');
 } finally {
 setIsWinnersPdfGenerating(false);
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in text-left">
 
 {/* Tab Banner */}
 <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4 sticky top-0 z-30 bg-white/90 pt-4 shadow-sm -mt-4 px-2 rounded-b-2xl">
 <div className="flex flex-col gap-1">
 <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">CML CENTRAL REGISTER</span>
 <h3 className="font-sans font-extrabold text-xl text-slate-900 flex items-center gap-2">
 <Users className="w-5 h-5 text-rose-500" /> Competitions Participant Directory
 </h3>
 <p className="text-slate-600 text-xs">
 Admin ledger console to upload manifests, edit registrations, delete, or add participants for Kalolsavam & Sahithyamalsaram.
 </p>
 </div>

 {/* Quick manual entry triggers */}
 <div className="flex items-center gap-3.5 flex-wrap">
 {activeRegistrations.length > 0 && (
 <button 
 onClick={() => { setDeleteAllConfirmationWord(''); setIsDeleteAllOpen(true); }}
 className="px-5 py-2.5 bg-white border-2 border-red-400 hover:bg-red-50 text-red-500 hover:text-red-600 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer select-none transition"
 id="participants-btn-wipe-all"
 >
 <Trash2 className="w-4 h-4" /> Wipe All Registered
 </button>
 )}

 <button 
 onClick={downloadCsvTemplate}
 className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer select-none transition"
 >
 <Download className="w-4 h-4" /> Download Template (CSV)
 </button>

 <button
 onClick={handleDownloadWinnersPDF}
 disabled={isWinnersPdfGenerating}
 className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-60 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer select-none transition"
 >
 <Award className="w-4 h-4" /> {isWinnersPdfGenerating ? 'Generating...' : 'Download Winners PDF'}
 </button>

 <button 
 onClick={() => { resetForm(); setIsAddOpen(true); }}
 className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 cursor-pointer select-none transition"
 >
 <Plus className="w-4 h-4" /> Add Participant Manually
 </button>
 </div>
 </div>

 {/* Grid of upload fields / stats */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 
 {/* PDF Manifest Upload Card */}
 <div className="md:col-span-2 bg-white/80 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
 <div className="flex flex-col gap-1.5">
 <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-widest">⚡ AUTOMATED PDF IMPORTER</span>
 <p className="text-xs text-slate-600 leading-relaxed font-medium">
 Import entire sheets of registrations straight from the diocesan printed manifest. Select your target competition tab, then upload.
 </p>
 </div>

 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
 <div className="flex flex-col min-w-[150px]">
 <label className="text-[9px] uppercase font-bold text-slate-500 mb-1">Target Competition</label>
 <select 
 value={uploadCompType} 
 onChange={e => setUploadCompType(e.target.value as any)} 
 className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg p-2 focus:outline-none focus:border-rose-500"
 >
 <option value="Kalolsavam">Kalolsavam</option>
 <option value="Sahithyamalsaram">Sahithyamalsaram</option>
 </select>
 </div>

 <div className="flex-1 flex items-center justify-center border border-slate-200 border-dashed rounded-xl bg-slate-50 px-4 py-3 hover:border-slate-300 transition relative">
 <input 
 type="file" 
 accept="application/pdf" 
 id="participant-excel-pdf-upload" 
 onChange={handleFileUpload} 
 className="hidden" 
 disabled={isUploading}
 />
 <label 
 htmlFor="participant-excel-pdf-upload" 
 className="cursor-pointer text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-2"
 >
 <FileText className="w-4 h-4 text-rose-500" />
 {isUploading ? 'Extracting manifest lines...' : `Upload Official PDF for ${uploadCompType}`}
 </label>
 </div>
 </div>
 </div>

 {/* Dynamic Telemetry Metric Card */}
 <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3">
 <div className="flex flex-col">
 <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">LEDGER QUANTUM</span>
 <span className="text-4xl font-extrabold text-slate-900 font-sans mt-2 tracking-tight">
 {activeRegistrations.length}
 </span>
 <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Total Registrations Cache</span>
 </div>

 <div className="grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3 text-[10px]">
 <div>
 <span className="text-slate-500 block">Kalolsavam</span>
 <span className="text-amber-400 font-black">{activeRegistrations.filter((r: any) => r.competition === 'Kalolsavam').length} entries</span>
 </div>
 <div>
 <span className="text-slate-500 block">Sahithyamalsaram</span>
 <span className="text-rose-400 font-black">{activeRegistrations.filter((r: any) => r.competition === 'Sahithyamalsaram').length} entries</span>
 </div>
 </div>
 </div>
 </div>

 {/* Filter and Search Suite */}
 <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 flex flex-col gap-4">
 
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
 <Filter className="w-4 h-4 text-rose-500" /> Filter Criteria
 </div>
 {/* Quick reset option */}
 {(searchQuery || selectedCompetition !== 'All' || selectedSection !== 'All' || selectedUnit !== 'All' || genderFilter !== 'all') && (
 <button 
 onClick={() => { setSearchQuery(''); setSelectedCompetition('All'); setSelectedSection('All'); setSelectedUnit('All'); setGenderFilter('all'); }}
 className="text-[10px] uppercase font-black tracking-wide text-rose-400 hover:underline hover:text-rose-300 bg-none border-none cursor-pointer"
 >
 Reset Filters
 </button>
 )}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
 
 {/* 1. Search name/events */}
 <div className="flex flex-col gap-1">
 <label className="text-[9px] uppercase font-bold text-slate-500">Query Competitor / Event</label>
 <div className="relative">
 <input 
 type="text" 
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 placeholder="Name, CML ID, or Church code..."
 className="w-full bg-white border border-slate-200/80 text-slate-900 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-rose-500"
 />
 <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
 </div>
 </div>

 {/* 2. Competition Filter */}
 <div className="flex flex-col gap-1">
 <label className="text-[9px] uppercase font-bold text-slate-500">Competition Category</label>
 <select 
 value={selectedCompetition} 
 onChange={e => setSelectedCompetition(e.target.value as any)}
 className="w-full bg-white border border-slate-200/80 text-slate-900 rounded-lg p-2 focus:outline-none focus:border-rose-500 font-semibold text-slate-700"
 >
 <option value="All">All Competitions</option>
 <option value="Kalolsavam">Kalolsavam</option>
 <option value="Sahithyamalsaram">Sahithyamalsaram</option>
 </select>
 </div>

 {/* 3. Section Filter */}
 <div className="flex flex-col gap-1">
 <label className="text-[9px] uppercase font-bold text-slate-500">Age Section / Criteria</label>
 <select 
 value={selectedSection} 
 onChange={e => setSelectedSection(e.target.value)}
 className="w-full bg-white border border-slate-200/80 text-slate-900 rounded-lg p-2 focus:outline-none focus:border-rose-500 font-semibold text-slate-700"
 >
 <option value="All">All Sections / Age groups</option>
 {categories.map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>

 {/* 4. Unit / Shakha Filter */}
 <div className="flex flex-col gap-1">
 <label className="text-[9px] uppercase font-bold text-slate-500">Parish Unit (Shakha)</label>
 <select 
 value={selectedUnit} 
 onChange={e => setSelectedUnit(e.target.value)}
 className="w-full bg-white border border-slate-200/80 text-slate-900 rounded-lg p-2 focus:outline-none focus:border-rose-500 font-semibold text-slate-700"
 >
 <option value="All">All CML Parish Units</option>
 {registrationUnits.map(unitCode => (
 <option key={unitCode} value={unitCode}>
 {unitCode} - {getUnitName(unitCode)}
 </option>
 ))}
 </select>
 </div>

 </div>

 {/* Styled Segmented Toggles: Boys, Girls, Group, All */}
 <div className="flex flex-wrap items-center gap-3 border-t border-slate-200/40 pt-4 mt-1">
 <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5 select-none text-slate-500">
 <Filter className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Toggles:
 </span>
 
 <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-inner flex-wrap gap-1">
 <button
 type="button"
 onClick={() => setGenderFilter('all')}
 className={`px-3.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all duration-200 select-none ${
 genderFilter === 'all'
 ? 'bg-rose-600 text-white shadow-md font-black'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/45'
 }`}
 >
 All / Combined
 </button>
 <button
 type="button"
 onClick={() => setGenderFilter('boys')}
 className={`px-3.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all duration-200 select-none ${
 genderFilter === 'boys'
 ? 'bg-sky-600 text-white shadow-md font-black'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/45'
 }`}
 >
 Boys only
 </button>
 <button
 type="button"
 onClick={() => setGenderFilter('girls')}
 className={`px-3.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all duration-200 select-none ${
 genderFilter === 'girls'
 ? 'bg-pink-600 text-white shadow-md font-black'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/45'
 }`}
 >
 Girls only
 </button>
 <button
 type="button"
 onClick={() => setGenderFilter('group')}
 className={`px-3.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all duration-200 select-none ${
 genderFilter === 'group'
 ? 'bg-amber-600 text-white shadow-md font-black'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/45'
 }`}
 >
 Group Events
 </button>
 </div>
 </div>

 </div>

 {/* Main Table Segment */}
 <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
 <div className="p-4 border-b border-slate-200 bg-slate-50/40 flex justify-between items-center flex-wrap gap-2 text-xs">
 <span className="font-bold text-slate-700">
 Registered Contingents Ledger ({filteredParticipants.length} parsed items match criteria)
 </span>
 </div>

 {filteredParticipants.length === 0 ? (
 <div className="p-16 text-center text-slate-500 hover:text-slate-600 transition-colors flex flex-col items-center justify-center gap-2">
 <Users className="w-12 h-12 stroke-1 opacity-20 text-rose-500 mb-2" />
 <p className="font-bold text-slate-600">No participants registered in current filters</p>
 <p className="text-[11px] text-slate-600">Manual insertion or printed PDF parsing is operational.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50/60 text-slate-600 font-mono text-[9px] uppercase tracking-wider border-b border-slate-200">
 <th className="p-3">Competitor Name</th>
 <th className="p-3">CML ID</th>
 <th className="p-3">Unit Name</th>
 <th className="p-3">Competition</th>
 <th className="p-3">Event (Category)</th>
 <th className="p-3 text-center">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-850">
 {filteredParticipants.map((reg: any) => {
 const unitName = getUnitName(reg.shakhaId || reg.shakha);
 const isGroup = reg.section && reg.section.toUpperCase() === 'GROUP ITEMS';

 return (
 <tr key={reg.id} className="hover:bg-slate-50/30 transition-colors">
 <td className="p-3 font-semibold text-slate-900">
 <div className="flex flex-col">
 <span className="font-cinzel font-black text-slate-800 text-[13px] tracking-wider uppercase">
 {reg.competitorName}
 </span>
 {!isGroup && reg.houseName && (
 <span className="text-[10px] text-slate-600 italic block mt-0.5">House: {reg.houseName}</span>
 )}
 {!isGroup && reg.dob && (
 <span className="text-[9px] font-mono text-slate-550 block mt-0.5">DOB: {reg.dob}</span>
 )}
 {isGroup && (
 <span className="px-2 py-0.5 bg-rose-950/50 text-rose-400 text-[9px] font-extrabold uppercase rounded-md tracking-wider inline-block mt-1 w-max">
 Group Item Contingent
 </span>
 )}
 </div>
 </td>
 <td className="p-3 font-mono text-indigo-600 font-bold text-xs tracking-wider">
 {reg.cmlId || '-'}
 </td>
 <td className="p-3">
 <div className="flex flex-col">
 <span className="text-slate-800 font-cinzel font-black tracking-wider text-[13px] leading-normal uppercase drop-shadow-sm">
 {unitName}
 </span>
 <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-1 bg-white px-1.5 py-0.5 rounded border border-slate-200/80 w-max inline-block">
 Code: {reg.shakhaId || reg.shakha || 'KYR'}
 </span>
 </div>
 </td>
 <td className="p-3">
 <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg tracking-wider border shadow-sm ${
 reg.competition === 'Sahithyamalsaram' 
 ? 'bg-rose-100 text-rose-700 border-rose-300' 
 : 'bg-violet-100 text-violet-700 border-violet-300'
 }`}>
 {reg.competition || 'Kalolsavam'}
 </span>
 </td>
 <td className="p-3">
 <div className="flex flex-col">
 <span className="text-emerald-400 font-extrabold font-mono text-[11px] tracking-wide">
 {reg.eventName}
 </span>
 <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider block mt-0.5">
 {reg.section}
 </span>
 </div>
 </td>
 <td className="p-3 text-center">
 <div className="flex items-center justify-center gap-1.5">
 <button 
 onClick={() => openEdit(reg)}
 className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-md flex items-center gap-1 cursor-pointer transition text-[10px]"
 title="Edit participant details"
 >
 <Edit className="w-3.5 h-3.5 text-slate-600" /> Edit
 </button>
 <button 
 onClick={() => openDelete(reg)}
 className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 font-bold rounded-md flex items-center gap-1 cursor-pointer transition text-[10px]"
 title="Remove participant"
 >
 <Trash2 className="w-3.5 h-3.5" /> Delete
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* MODAL 1: ADD PARTICIPANT */}
 <AnimatePresence>
 {isAddOpen && (
 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
 >
 <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-5">
 <div className="flex items-center gap-2">
 <Plus className="w-5 h-5 text-rose-500" />
 <h3 className="text-base font-black text-slate-900">Create New Participant</h3>
 </div>
 <button onClick={() => setIsAddOpen(false)} className="text-slate-500 hover:text-slate-900 transition">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleAddParticipant} className="flex flex-col gap-4 text-xs">
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Competition Type</label>
 <select 
 value={formCompetition} 
 onChange={e => {
 const val = e.target.value as any;
 setFormCompetition(val);
 if (val === 'Sahithyamalsaram' && formSection === 'GROUP ITEMS') {
 setFormSection('SUB JUNIOR BOYS');
 }
 }}
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
 >
 <option value="Kalolsavam">Kalolsavam</option>
 <option value="Sahithyamalsaram">Sahithyamalsaram</option>
 </select>
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Age Section</label>
 <select 
 value={formSection} 
 onChange={e => setFormSection(e.target.value)}
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
 >
 {editCategories.map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Parish Unit / Shakha Code</label>
 <select 
 value={formShakhaId} 
 onChange={e => {
 setFormShakhaId(e.target.value);
 if (formSection && formSection.toUpperCase() === 'GROUP ITEMS') {
 // Auto replace name for group item
 setFormName(getUnitName(e.target.value) + ' Shakha');
 }
 }}
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
 required
 >
 <option value="">-- Choose Parish Unit --</option>
 {Object.entries(unitCodeMapping).map(([code, name]) => (
 <option key={code} value={code}>{code} - {name}</option>
 ))}
 {/* Plus any custom keys parsed from raw PDF */}
 {registrationUnits.map(code => (
 !unitCodeMapping[code] && <option key={code} value={code}>{code} (Parsed)</option>
 ))}
 </select>
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">CML Membership ID</label>
 <input 
 type="text" 
 value={formCmlId} 
 onChange={e => setFormCmlId(e.target.value)}
 placeholder="e.g. KYR01-023"
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-rose-500"
 />
 </div>
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Registered Event Name</label>
 <input 
 type="text" 
 value={formEventName} 
 onChange={e => setFormEventName(e.target.value)}
 placeholder="e.g. BIBLE READING, SPEECH, ESSAY WRITING..."
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-rose-500 font-mono"
 required
 />
 </div>

 <div className="flex flex-col gap-1.5 p-3.5 bg-white rounded-xl border border-slate-200">
 <div className="flex justify-between items-center mb-1">
 <label className="font-bold text-rose-400 uppercase tracking-wide">
 {formSection && formSection.toUpperCase() === 'GROUP ITEMS' ? 'Shakha Name (Group Contest)' : 'Competitor Name'}
 </label>
 {formSection && formSection.toUpperCase() === 'GROUP ITEMS' && (
 <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest font-mono">
 Group Rule Applied
 </span>
 )}
 </div>
 
 {formSection && formSection.toUpperCase() === 'GROUP ITEMS' ? (
 <div className="text-slate-700 font-black p-2 bg-slate-50 border border-rose-950 text-xs rounded-lg flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-amber-500" />
 {formShakhaId ? `${getUnitName(formShakhaId)} Unit` : 'Select a Parish Unit above to register its name'}
 </div>
 ) : (
 <input 
 type="text" 
 value={formName} 
 onChange={e => setFormName(e.target.value)}
 placeholder="e.g. ALAN ROY"
 className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 font-extrabold placeholder-slate-400 focus:outline-none focus:border-rose-500"
 required
 />
 )}

 {formSection && formSection.toUpperCase() === 'GROUP ITEMS' ? (
 <p className="text-[10px] text-slate-500 leading-normal mt-1">
 ℹ For group items only register the name of the Shakha/Parish Unit. We disable specific kid name registration fields.
 </p>
 ) : (
 <p className="text-[10px] text-slate-500 leading-normal mt-1">
 Enter the full name of the single participant.
 </p>
 )}
 </div>

 {/* Hide personal specifications if group items is checked */}
 {(!formSection || formSection.toUpperCase() !== 'GROUP ITEMS') && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">House / Family Name</label>
 <input 
 type="text" 
 value={formHouse} 
 onChange={e => setFormHouse(e.target.value)}
 placeholder="e.g. Vadakkekuttu"
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
 />
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Date of Birth (DOB)</label>
 <input 
 type="date" 
 value={formDob} 
 onChange={e => setFormDob(e.target.value)}
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-900 focus:outline-none focus:border-rose-500"
 />
 </div>
 </div>
 )}

 <div className="flex justify-end gap-2.5 border-t border-slate-200 pt-4 mt-2">
 <button 
 type="button" 
 onClick={() => setIsAddOpen(false)}
 className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition"
 >
 Cancel
 </button>
 <button 
 type="submit" 
 className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition"
 >
 Register Entry
 </button>
 </div>

 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL 2: EDIT PARTICIPANT */}
 <AnimatePresence>
 {isEditOpen && (
 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
 >
 <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-5">
 <div className="flex items-center gap-2">
 <Edit className="w-5 h-5 text-rose-500" />
 <h3 className="text-base font-black text-slate-900">Modify Participant Details</h3>
 </div>
 <button onClick={() => setIsEditOpen(false)} className="text-slate-500 hover:text-slate-900 transition">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleEditParticipant} className="flex flex-col gap-4 text-xs">
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Competition Type</label>
 <select 
 value={formCompetition} 
 onChange={e => {
 const val = e.target.value as any;
 setFormCompetition(val);
 if (val === 'Sahithyamalsaram' && formSection === 'GROUP ITEMS') {
 setFormSection('SUB JUNIOR BOYS');
 }
 }}
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
 >
 <option value="Kalolsavam">Kalolsavam</option>
 <option value="Sahithyamalsaram">Sahithyamalsaram</option>
 </select>
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Age Section</label>
 <select 
 value={formSection} 
 onChange={e => {
 setFormSection(e.target.value);
 if (e.target.value === 'Group Items' && formShakhaId) {
 setFormName(getUnitName(formShakhaId) + ' Shakha');
 }
 }}
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
 >
 {editCategories.map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Parish Unit / Shakha Code</label>
 <select 
 value={formShakhaId} 
 onChange={e => {
 setFormShakhaId(e.target.value);
 if (formSection === 'Group Items') {
 setFormName(getUnitName(e.target.value) + ' Shakha');
 }
 }}
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
 required
 >
 {Object.entries(unitCodeMapping).map(([code, name]) => (
 <option key={code} value={code}>{code} - {name}</option>
 ))}
 {registrationUnits.map(code => (
 !unitCodeMapping[code] && <option key={code} value={code}>{code} (Parsed)</option>
 ))}
 </select>
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">CML Membership ID</label>
 <input 
 type="text" 
 value={formCmlId} 
 onChange={e => setFormCmlId(e.target.value)}
 placeholder="e.g. KYR02-012"
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-rose-500"
 />
 </div>
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Registered Event Name</label>
 <input 
 type="text" 
 value={formEventName} 
 onChange={e => setFormEventName(e.target.value)}
 placeholder="e.g. MARGAM KALI, SPEECH, BIBLE QUIZ..."
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-rose-500 font-mono"
 required
 />
 </div>

 <div className="flex flex-col gap-1.5 p-3.5 bg-white rounded-xl border border-slate-200">
 <div className="flex justify-between items-center mb-1">
 <label className="font-bold text-rose-400 uppercase tracking-wide">
 {formSection && formSection.toUpperCase() === 'GROUP ITEMS' ? 'Shakha Name (Group Contest)' : 'Competitor Name'}
 </label>
 {formSection && formSection.toUpperCase() === 'GROUP ITEMS' && (
 <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest font-mono font-black">
 Group Rule Applied
 </span>
 )}
 </div>
 
 {formSection && formSection.toUpperCase() === 'GROUP ITEMS' ? (
 <div className="text-slate-700 font-black p-2 bg-slate-50 border border-rose-950 text-xs rounded-lg flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-amber-500" />
 {formShakhaId ? `${getUnitName(formShakhaId)} Unit` : 'Select Parish unit above'}
 </div>
 ) : (
 <input 
 type="text" 
 value={formName} 
 onChange={e => setFormName(e.target.value)}
 placeholder="e.g. LIYA BOBBY"
 className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-900 font-extrabold placeholder-slate-400 focus:outline-none focus:border-rose-500"
 required
 />
 )}

 {formSection && formSection.toUpperCase() === 'GROUP ITEMS' && (
 <p className="text-[10px] text-slate-500 leading-normal mt-1 text-slate-450">
 ℹ For group items only register the name of the Shakha/Parish Unit. Personal name details are omitted.
 </p>
 )}
 </div>

 {(!formSection || formSection.toUpperCase() !== 'GROUP ITEMS') && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">House / Family Name</label>
 <input 
 type="text" 
 value={formHouse} 
 onChange={e => setFormHouse(e.target.value)}
 placeholder="e.g. Mundackal"
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
 />
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-600 uppercase tracking-wide">Date of Birth (DOB)</label>
 <input 
 type="date" 
 value={formDob} 
 onChange={e => setFormDob(e.target.value)}
 className="bg-white border border-slate-200 p-3 rounded-lg text-slate-900 focus:outline-none focus:border-rose-500"
 />
 </div>
 </div>
 )}

 <div className="flex justify-end gap-2.5 border-t border-slate-200 pt-4 mt-2">
 <button 
 type="button" 
 onClick={() => setIsEditOpen(false)}
 className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition"
 >
 Cancel
 </button>
 <button 
 type="submit" 
 className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition"
 >
 Save Changes
 </button>
 </div>

 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL 3: DELETE PARTICIPANT */}
 <AnimatePresence>
 {isDeleteOpen && (
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 className="bg-slate-50 border border-red-900/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
 >
 <div className="flex items-center gap-3 mb-4 text-xs font-mono">
 <div className="p-2.5 bg-red-900/20 text-red-400 rounded-lg">
 <AlertTriangle className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Confirm Delete Record</h3>
 </div>

 <p className="text-slate-600 text-xs mb-4 leading-relaxed font-semibold">
 Are you sure you want to permanently delete this participant? 
 This will automatically remove any graded results associated with their entry.
 </p>

 <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 mb-5 text-[11px] leading-relaxed text-slate-700">
 <span className="text-slate-500 uppercase font-mono block text-[9px]">Competitor Name:</span>
 <span className="font-bold text-slate-900 block">
 {activeParticipantId && (registrations || []).find((r: any) => r.id === activeParticipantId)?.competitorName}
 </span>
 <span className="text-slate-500 uppercase font-mono block text-[9px] mt-2">Shakha / Parish Unit:</span>
 <span className="font-bold text-slate-800 block font-cinzel tracking-wide uppercase text-[11px]">
 {activeParticipantId && (() => { const r = (registrations || []).find((r: any) => r.id === activeParticipantId); return getUnitName(r?.shakhaId || r?.shakha) || r?.shakhaId || '-'; })()}
 </span>
 <span className="text-slate-500 uppercase font-mono block text-[9px] mt-2">Registered Event:</span>
 <span className="font-medium text-slate-600 block font-mono">
 {activeParticipantId && (registrations || []).find((r: any) => r.id === activeParticipantId)?.eventName}
 </span>
 <span className="text-slate-500 uppercase font-mono block text-[9px] mt-2">Category / Section:</span>
 <span className="font-medium text-slate-600 block font-mono">
 {activeParticipantId && (registrations || []).find((r: any) => r.id === activeParticipantId)?.section}
 </span>
 </div>

 <div className="flex gap-2.5">
 <button 
 onClick={() => setIsDeleteOpen(false)}
 className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs transition"
 >
 Cancel
 </button>
 <button 
 onClick={handleDeleteParticipant}
 className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-lg shadow-rose-600/30 cursor-pointer transition"
 >
 <Trash2 className="w-4 h-4" /> Drop Record
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL 4: DESTRUCTIVE WIPE ALL REGISTRY */}
 <AnimatePresence>
 {isDeleteAllOpen && (
 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 className="bg-white border border-red-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
 id="modal-wipe-all-gateway"
 >
 {/* Alert Warning Upper Blur Glow */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-red-500/10 blur-2xl z-0"></div>
 
 <div className="relative z-10">
 <div className="flex items-center gap-3.5 mb-5">
 <div className="p-3 bg-red-950 text-red-500 border border-red-900/50 rounded-2xl">
 <AlertTriangle className="w-6 h-6 animate-pulse" />
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest leading-none mb-1">Irreversible Administration Tool</span>
 <h3 className="text-lg font-sans font-black text-slate-900 leading-none">Wipe Entire Directory?</h3>
 </div>
 </div>

 <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl mb-6 text-xs text-red-200 leading-relaxed font-medium">
 <strong>⚠️ CRITICAL HAZARD WARNING:</strong> This will completely delete all <strong>{(registrations || []).length} registered participants</strong> and wipe all corresponding Kalolsavam and Sahithyamalsaram graded score entries. This action cannot be undone.
 </div>

 <div className="flex flex-col gap-2 mb-6">
 <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
 Type <span className="text-red-400 font-mono font-black select-all">DELETE ALL</span> to confirm:
 </label>
 <input 
 type="text" 
 value={deleteAllConfirmationWord}
 onChange={e => setDeleteAllConfirmationWord(e.target.value)}
 placeholder="Type DELETE ALL precisely"
 className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-900 font-mono placeholder-slate-400 text-sm focus:outline-none focus:border-red-500 text-center tracking-wider uppercase font-extrabold"
 />
 </div>

 <div className="flex gap-3">
 <button 
 onClick={() => setIsDeleteAllOpen(false)}
 className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-900 font-bold rounded-xl text-xs transition"
 >
 Cancel
 </button>
 <button 
 onClick={handleDeleteAllParticipants}
 disabled={deleteAllConfirmationWord.toUpperCase().trim() !== 'DELETE ALL'}
 className={`flex-1 py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition duration-200 cursor-pointer ${
 deleteAllConfirmationWord.toUpperCase().trim() === 'DELETE ALL'
 ? 'bg-red-700 hover:bg-red-650 text-white shadow-red-950/20'
 : 'bg-slate-50 text-slate-600 border border-slate-200 cursor-not-allowed opacity-50'
 }`}
 >
 <Trash2 className="w-4 h-4" /> WIPE ALL RECORDS
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </div>
 );
}
