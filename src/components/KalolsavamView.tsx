/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import logoImg from '../assets/images/logo.webp';
import { 
 Trophy, 
 Users, 
 Sparkles, 
 CheckCircle, 
 ShieldAlert, 
 Plus, 
 Trash2, 
 Edit2, 
 Save, 
 Eye, 
 EyeOff, 
 Download, 
 FileSpreadsheet,
 List,
 Star,
 Search,
 BookOpen,
 Activity,
 Award,
 Crown,
 Medal,
 TrendingUp,
 Flame,
 LayoutGrid,
 ChevronRight,
 SlidersHorizontal,
 MapPin
} from 'lucide-react';

import { getShakhaNameByCode } from '../types';

interface KalolsavamViewProps {
 dbData: any;
 isAdminLoggedIn: boolean;
 onSaveDatabase: (updatedData: any, action: string, target: string) => Promise<boolean>;
 currentUser: any;
}

export default function KalolsavamView({ dbData, isAdminLoggedIn, onSaveDatabase, currentUser }: KalolsavamViewProps) {
 const [results, setResults] = useState<any[]>([]);
 const [registrations, setRegistrations] = useState<any[]>([]);
 const [isLoadingData, setIsLoadingData] = useState(true);
 const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
 const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

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
 console.error('Error fetching kalolsavam data', err);
 } finally {
 setIsLoadingData(false);
 }
 }
 fetchLocalData();
 }, []);

 const { itemsMap, participantsList } = useMemo(() => {
 const map: Record<string, Array<{ id: string; name: string; eventName: string; status: string }>> = {
 "Sub Junior": [], "Junior": [], "Senior": [], "Super Senior": [], "Group": []
 };

 const getCanonicalCategory = (sec: string) => {
 const secLower = (sec || '').toLowerCase();
 if (secLower.includes('sub junior')) return 'Sub Junior';
 if (secLower.includes('super senior')) return 'Super Senior';
 if (secLower.includes('junior')) return 'Junior';
 if (secLower.includes('senior')) return 'Senior';
 return 'Group';
 };

 const kalResults = results.filter((res: any) => res.competition === 'Kalolsavam');
 const kalRegs = registrations.filter((reg: any) => reg.competition === 'Kalolsavam');

 kalResults.forEach((res: any) => {
 const section = res.section || res.age_category || 'Unknown';
 const eventName = res.eventName || 'Unknown Event';
 const canonicalCat = getCanonicalCategory(section);
 
 const existing = map[canonicalCat]?.find((i: any) => i.eventName === eventName && i.id.includes(section.replace(/\s+/g, '')));
 if (!existing && map[canonicalCat]) {
 const statusKey = `Kalolsavam_${section}_${eventName}`;
 const status = (dbData.competitionStatuses && dbData.competitionStatuses[statusKey]) || 'Not Started';
 map[canonicalCat].push({
 id: `event_${section}_${eventName}`.replace(/\s+/g, ''),
 name: `${eventName.toUpperCase()} - ${section.toUpperCase()}`,
 eventName: eventName,
 status: status
 });
 }
 });

 kalRegs.forEach((reg: any) => {
 const canonicalCat = getCanonicalCategory(reg.section);
 const existing = map[canonicalCat]?.find((i: any) => i.eventName === reg.eventName && i.id.includes((reg.section||'').replace(/\s+/g, '')));
 if (!existing && map[canonicalCat]) {
 const statusKey = `Kalolsavam_${reg.section}_${reg.eventName}`;
 const status = (dbData.competitionStatuses && dbData.competitionStatuses[statusKey]) || 'Not Started';
 map[canonicalCat].push({
 id: `event_${reg.section}_${reg.eventName}`.replace(/\s+/g, ''),
 name: `${reg.eventName.toUpperCase()} - ${reg.section?.toUpperCase()}`,
 eventName: reg.eventName,
 status: status
 });
 }
 });

 const pList = kalResults.map((res: any) => {
 const section = res.section || res.age_category || 'Unknown';
 const eventName = res.eventName || 'Unknown Event';
 return {
 id: res.id,
 name: res.competitorName,
 shakha: res.unitName || 'Unknown Unit',
 itemId: `event_${section}_${eventName}`.replace(/\s+/g, ''),
 categoryName: `${eventName.toUpperCase()} - ${section.toUpperCase()}`
 };
 }).concat(
 kalRegs.map((reg: any) => ({
 id: reg.id,
 name: reg.competitorName,
 shakha: getShakhaNameByCode(reg.shakhaId, dbData.units),
 itemId: `event_${reg.section}_${reg.eventName}`.replace(/\s+/g, ''),
 categoryName: `${reg.eventName.toUpperCase()} - ${reg.section?.toUpperCase()}`
 }))
 );

 return { itemsMap: map, participantsList: pList };
 }, [results, registrations, dbData.competitionStatuses, dbData.units]);

 const displayCategories = ['Sub Junior', 'Junior', 'Senior', 'Super Senior', 'Group'];

 const getActualCatKey = (displayCat: string) => {
 const search = displayCat.toLowerCase();
 if (search === 'group') return 'Group';
 if (search.includes('sub junior')) return 'Sub Junior';
 if (search.includes('super senior')) return 'Super Senior';
 if (search.includes('junior')) return 'Junior';
 if (search.includes('senior')) return 'Senior';
 return displayCat;
 };

 const [selectedCategory, setSelectedCategory] = useState<string>("Sub Junior");
 const [selectedItem, setSelectedItem] = useState<string>("All");
 const [standingsLayout, setStandingsLayout] = useState<'bento' | 'podium' | 'analytics'>('bento');
 const [leaderboardFilter, setLeaderboardFilter] = useState<'Overall' | 'Kalolsavam' | 'Sahithyamalsaram'>('Kalolsavam');

 // Unified visual Search and Filters states
 const [searchQuery, setSearchQuery] = useState('');
 const [shakhaFilter, setShakhaFilter] = useState<string>('All');
 const [isShakhaDropdownOpen, setIsShakhaDropdownOpen] = useState<boolean>(false);
 const [positionFilter, setPositionFilter] = useState<string>('All');
 const [publicationFilter, setPublicationFilter] = useState<string>('All');
 const [genderFilter, setGenderFilter] = useState<'All' | 'Boys' | 'Girls'>('All');

 // Synchronize dynamic category and event selection on database load
 useEffect(() => {
 const keys = Object.keys(itemsMap);
 if (keys.length > 0 && !keys.includes(selectedCategory)) {
 const sjKey = keys.find(k => k.toLowerCase().includes('sub junior') || k.toLowerCase().startsWith('sj')) || keys[0];
 setSelectedCategory(sjKey);
 setSelectedItem(pickDefaultItemForCategory(sjKey));
 }
 }, [dbData.registrations]);

 useEffect(() => {
 async function fetchLeaderboard() {
 setIsLeaderboardLoading(true);
 try {
 const { data, error } = await supabase.rpc('get_competition_leaderboard', { p_competition: leaderboardFilter });
 if (error) {
 console.error('Error fetching RPC leaderboard', error);
 setLeaderboardData([]);
 } else if (data) {
 const formatted = data.map((d: any) => ({
 unitId: d.unit_id,
 unitName: d.unit_name,
 totalPoints: Number(d.total_points),
 participantsCount: Number(d.participants_count),
 aGradesCount: Number(d.a_grades_count),
 firstPositionsCount: Number(d.first_positions_count),
 secondPositionsCount: Number(d.second_positions_count),
 rank: Number(d.rank)
 }));
 setLeaderboardData(formatted);
 }
 } catch (err) {
 console.error('Error fetching leaderboard', err);
 } finally {
 setIsLeaderboardLoading(false);
 }
 }
 fetchLeaderboard();
 }, [leaderboardFilter, results]); // Refetches when results updates from local fetch or filter changes

 const getGradePoints = (grade: string) => {
 if (grade === 'A') return 5;
 if (grade === 'B') return 3;
 if (grade === 'C') return 1;
 return 0;
 };

 const getPositionPoints = (pos: string, isGroup: boolean = false) => {
 if (pos === '1st') return isGroup ? 10 : 5;
 if (pos === '2nd') return isGroup ? 5 : 3;
 if (pos === '3rd') return isGroup ? 3 : 1;
 return 0;
 };

 const calculateTotalScore = (grade: string, pos: string, isGroup: boolean = false) => {
 return getGradePoints(grade) + getPositionPoints(pos, isGroup);
 };

 const getResultItemId = (row: any) => {
 const section = row.section || row.age_category || '';
 const eventName = row.eventName || row.event_name || '';
 return `event_${section}_${eventName}`.replace(/\s+/g, '');
 };

 const pickDefaultItemForCategory = (catName: string) => {
 return 'All'; // Always show all competitions by default
 };

 // Safe category switching that resets item defaults
 const handleCategorySelect = (catName: string) => {
 setSelectedCategory(catName);
 setSelectedItem(pickDefaultItemForCategory(catName));
 };

 // RPC Leaderboard takes over logic below
 const calculateLeaderboard = (mode: string) => leaderboardData;



 // High-fidelity PDF exporter
 const exportPDF = async (type: 'participant' | 'competition' | 'unit' | 'leaderboard', selectedEntity?: any) => {
 const doc = new jsPDF();
 
 doc.setFillColor(136, 19, 55); 
 doc.rect(0, 0, 210, 42, 'F');
 try {
 const img = new Image();
 img.src = logoImg;
 await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
 doc.addImage(img, 'JPEG', 15, 8, 26, 26);
 } catch(e) { console.warn(e); }
 
 doc.setTextColor(255, 255, 255);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(22);
 doc.text('CHERUPUSHPA MISSION LEAGUE', 105, 17, { align: 'center' });
 doc.setFontSize(11);
 doc.setFont('helvetica', 'normal');
 doc.text('KALIYAR MEKHALA', 105, 25, { align: 'center' });
 doc.setFontSize(9);
 doc.setTextColor(244, 63, 94);
 doc.text('AUTOMATED COMPETITION PORTAL SCORING & LEDGER CERTIFICATION', 105, 31, { align: 'center' });
 
 doc.setFontSize(8);
 doc.setTextColor(220, 220, 220);
 doc.text(`Document Released: ${new Date().toLocaleDateString()} (Virtual Registry File)`, 195, 37, { align: 'right' });
 
 let y = 55;
 
 if (type === 'leaderboard') {
 doc.setTextColor(15, 23, 42);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(14);
 doc.text(`OFFICIAL COMPREHENSIVE SCOREBOARD (${selectedEntity.toUpperCase()})`, 15, y);
 y += 4;
 doc.setDrawColor(244, 63, 94);
 doc.setLineWidth(0.6);
 doc.line(15, y, 195, y);
 y += 10;
 
 doc.setFillColor(241, 245, 249);
 doc.rect(15, y, 180, 10, 'F');
 doc.setTextColor(71, 85, 105);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(9.5);
 doc.text('Rank', 20, y + 6.5);
 doc.text('Parish Church Unit', 35, y + 6.5);
 doc.text('Points', 110, y + 6.5);
 doc.text('Cadets', 125, y + 6.5);
 doc.text('A-Grades', 145, y + 6.5);
 doc.text('1st Pos', 165, y + 6.5);
 doc.text('2nd Pos', 182, y + 6.5);
 y += 10;
 
 const rows = calculateLeaderboard(selectedEntity);
 rows.forEach((row, idx) => {
 if (y > 270) {
 doc.addPage();
 y = 30;
 }
 doc.setFillColor(idx % 2 === 0 ? 255 : 252, idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251);
 doc.rect(15, y, 180, 8.5, 'F');
 doc.setTextColor(15, 23, 42);
 if (row.rank === 1) {
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(180, 83, 9);
 } else {
 doc.setFont('helvetica', 'normal');
 }
 
 doc.text(String(row.rank), 20, y + 5.5);
 doc.text(row.unitName, 35, y + 5.5);
 doc.text(String(row.totalPoints), 110, y + 5.5);
 doc.text(String(row.participantsCount), 125, y + 5.5);
 doc.text(String(row.aGradesCount), 145, y + 5.5);
 doc.text(String(row.firstPositionsCount), 165, y + 5.5);
 doc.text(String(row.secondPositionsCount), 182, y + 5.5);
 y += 8.5;
 });
 } else if (type === 'competition') {
 doc.setTextColor(15, 23, 42);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(14);
 doc.text(`COMPETITION TRACK SPECIFICATION SHEET - ${selectedEntity}`, 15, y);
 y += 4;
 doc.setDrawColor(244, 63, 94);
 doc.line(15, y, 195, y);
 y += 10;
 
 doc.setFillColor(241, 245, 249);
 doc.rect(15, y, 180, 10, 'F');
 doc.setTextColor(71, 85, 105);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(9);
 doc.text('Participant Name', 16, y + 6.5);
 doc.text('Parish Church Unit', 65, y + 6.5);
 doc.text('Grade', 145, y + 6.5);
 doc.text('Position', 162, y + 6.5);
 doc.text('Points Claimed', 180, y + 6.5);
 y += 10;
 
 const list = (dbData?.results || []).filter((r: any) => r.competition === selectedEntity && r.isPublished);
 list.forEach((row: any, idx: number) => {
 if (y > 270) {
 doc.addPage();
 y = 30;
 }
 doc.setFont('helvetica', 'normal');
 doc.setFillColor(idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251);
 doc.rect(15, y, 180, 8.5, 'F');
 doc.setTextColor(15, 23, 42);
 doc.text(row.competitorName, 16, y + 5.5);
 doc.text(row.unitName, 65, y + 5.5);
 doc.text(row.grade, 145, y + 5.5);
 doc.text(row.position, 162, y + 5.5);
 doc.setFont('helvetica', 'bold');
 doc.text(`${row.totalPoints} Pts`, 180, y + 5.5);
 y += 8.5;
 });
 } else if (type === 'participant') {
 doc.setTextColor(15, 23, 42);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(14);
 doc.text(`INDIVIDUAL ACHIEVEMENT CERTIFICATE TRANSCRIPT`, 15, y);
 y += 4;
 doc.setDrawColor(244, 63, 94);
 doc.line(15, y, 195, y);
 y += 10;
 
 const row = selectedEntity;
 
 doc.setFillColor(254, 252, 232);
 doc.rect(15, y, 180, 52, 'F');
 
 doc.setTextColor(180, 83, 9);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(17);
 doc.text(row.competitorName, 25, y + 11);
 
 doc.setTextColor(15, 23, 42);
 doc.setFontSize(10.5);
 doc.setFont('helvetica', 'bold');
 doc.text(`Parish Unit Church: `, 25, y + 21);
 doc.setFont('helvetica', 'normal');
 doc.text(row.unitName, 65, y + 21);
 
 doc.setFont('helvetica', 'bold');
 doc.text(`Competition Class: `, 25, y + 28);
 doc.setFont('helvetica', 'normal');
 doc.text(row.competition, 65, y + 28);
 
 doc.setFont('helvetica', 'bold');
 doc.text(`Registered Event: `, 25, y + 35);
 doc.setFont('helvetica', 'normal');
 doc.text(row.eventName, 60, y + 35);
 
 doc.setFont('helvetica', 'bold');
 doc.text(`Certificate Credit: `, 25, y + 43);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(190, 18, 60);
 doc.text(`${row.totalPoints} Total Automatic Points (Grade: ${row.grade} | Pos: ${row.position})`, 60, y + 43);
 
 y += 62;
 
 doc.setFontSize(9.5);
 doc.setTextColor(100, 100, 100);
 doc.setFont('helvetica', 'bold');
 doc.text('FORMULA METRIC CALCULATIONS:', 15, y);
 y += 6;
 
 doc.setDrawColor(230, 230, 230);
 doc.rect(15, y, 180, 26);
 doc.line(15, y + 8, 195, y + 8);
 
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(50, 50, 50);
 doc.text('Assessment Field', 20, y + 5);
 doc.text('Acquired Grade/Pos', 80, y + 5);
 doc.text('Points Sum', 150, y + 5);
 
 doc.setFont('helvetica', 'normal');
 doc.text('Grade Points Weight', 20, y + 14);
 doc.text(`${row.grade} Grade`, 80, y + 14);
 doc.text(`${getGradePoints(row.grade)} Points`, 150, y + 14);
 
 doc.text('Position Placement Weight', 20, y + 21);
 doc.text(`${row.position || 'None'} Place`, 80, y + 21);
 doc.text(`${getPositionPoints(row.position, row.section === 'Group Items' || row.age_category === 'Group Items')} Points`, 150, y + 21);
 
 y += 38;
 
 doc.setFontSize(8.5);
 doc.setFont('helvetica', 'italic');
 doc.setTextColor(120, 120, 120);
 doc.text('This digital transcript is automatically computed by the CML central scoreboard database.', 15, y);
 doc.text('All points count under direct audit guidelines outlined in the Golden Jubilee Constitution.', 15, y + 4.5);
 
 y += 22;
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(50, 50, 50);
 doc.setFontSize(9.5);
 doc.text('Rev. Fr. Mathew Elanjimattom', 20, y);
 doc.setFont('helvetica', 'normal');
 doc.setFontSize(8);
 doc.text('CML Mekhala Director (Presbytery Seal)', 20, y + 4);
 
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(9.5);
 doc.text('Mr. Joel Veliyath', 140, y);
 doc.setFont('helvetica', 'normal');
 doc.setFontSize(8);
 doc.text('Mekhala Central Organizer', 140, y + 4);
 }
 
 doc.save(`cml_report_${type}_${selectedEntity?.name || selectedEntity?.competitorName || selectedEntity || 'sheet'}.pdf`);
 };

 // Build the live visual table rows including seed lists merged dynamically with database outputs
 const getVisibleParticipants = () => {
 // Current chosen items in state
 const currentItemConfigs = itemsMap[selectedCategory] || [];
 // Show all results (published and unpublished) for now; admins can control visibility via publicationFilter
 const activeResults = (dbData?.results || []);

 // Filter which item IDs are relevant based on "All" vs specific selection
 const targetItemIds = selectedItem === 'All' 
 ? currentItemConfigs.map(item => item.id)
 : [selectedItem];

 // Build unique participant list
 const list: Array<{
 id: string;
 name: string;
 shakha: string;
 category: string;
 marks: string;
 grade?: string;
 position?: string;
 points?: number;
 isDynamic?: boolean;
 dbResult?: any;
 }> = [];

 targetItemIds.forEach(itemId => {
 const itemConfig = currentItemConfigs.find(i => i.id === itemId);
 if (!itemConfig) return;

 // 1. Load active seed rows that belong to this item
 const itemSeeds = participantsList.filter(p => p.itemId === itemId);
 itemSeeds.forEach(seed => {
 // Scan for matching database override results
 const dbOverride = activeResults.find((r: any) => 
 r.registrationId === seed.id || (r.competition === 'Kalolsavam' && 
 getResultItemId(r) === itemId && 
 r.competitorName.toLowerCase().trim() === seed.name.toLowerCase().trim())
 );

 list.push({
 id: dbOverride ? dbOverride.id : seed.id,
 name: seed.name,
 shakha: seed.shakha,
 category: seed.categoryName,
 marks: dbOverride ? (dbOverride.marks || `${dbOverride.totalPoints}`) : '-',
 grade: dbOverride?.grade,
 position: dbOverride?.position,
 points: dbOverride?.totalPoints,
 isDynamic: false,
 dbResult: dbOverride
 });
 });

 // 2. Load any new entries manually created inside db.json that belong to this event of Kalolsavam
 const dbOnlyEntries = activeResults.filter((r: any) => 
 r.competition === 'Kalolsavam' && 
 getResultItemId(r) === itemId &&
 !itemSeeds.some(seed => seed.name.toLowerCase().trim() === r.competitorName.toLowerCase().trim())
 );

 dbOnlyEntries.forEach((r: any) => {
 list.push({
 id: r.id,
 name: r.competitorName.toUpperCase(),
 shakha: r.unitName.replace(' Church', '').replace('St. Marys ', '').replace('St. Sebastian ', '').replace('St. Augustine ', '').replace('St. George ', '').replace('St. Thomas ', ''),
 category: itemConfig.name,
 marks: r.marks || `${r.totalPoints}`,
 grade: r.grade,
 position: r.position,
 points: r.totalPoints,
 isDynamic: true,
 dbResult: r
 });
 });
 });

 return list;
 };

 const rawParticipants = getVisibleParticipants();
 const visibleParticipants = rawParticipants.filter(p => {
 if (searchQuery.trim() !== '') {
 const q = searchQuery.toLowerCase();
 const matchName = p.name.toLowerCase().includes(q);
 const matchShakha = p.shakha.toLowerCase().includes(q);
 const matchCategory = p.category.toLowerCase().includes(q);
 if (!matchName && !matchShakha && !matchCategory) return false;
 }
 if (shakhaFilter !== 'All') {
 if (p.shakha !== shakhaFilter) return false;
 }
 if (positionFilter !== 'All') {
 if (positionFilter === 'None') {
 if (p.position && p.position !== 'None') return false;
 } else {
 if (p.position !== positionFilter) return false;
 }
 }
 if (publicationFilter !== 'All') {
 const isPublished = p.dbResult ? p.dbResult.isPublished === true : false;
 if (publicationFilter === 'Published' && !isPublished) return false;
 if (publicationFilter === 'Unpublished' && isPublished) return false;
 }
 return true;
 });

 const parishUnitsList = dbData?.units || [];
 const activeEventsList = (itemsMap[selectedCategory] || []).filter(item => {
 if (selectedCategory.toLowerCase() === 'group') return true;
 if (genderFilter === 'All') return true;
 if (genderFilter === 'Boys') return item.name.toLowerCase().includes('boys');
 if (genderFilter === 'Girls') return item.name.toLowerCase().includes('girls');
 return true;
 });

 return (
 <div className="w-full bg-[#fafbfd] relative pb-24 overflow-hidden">
 {/* Premium subtle dotted visual background grid matching Swiss modern layout */}
 <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-75 pointer-events-none -z-10" />
 
 {/* Ambient glowing background orbs - hidden on mobile to prevent scroll lag */}
 <div className="hidden md:block absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-rose-500/5 to-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
 <div className="hidden md:block absolute top-40 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/5 to-rose-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

 <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 flex flex-col gap-8 relative z-10">
 
 {/* ── HERO BANNER ── */}
 <div className="w-full relative overflow-hidden rounded-3xl shadow-2xl" style={{background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 30%, #2d0a1e 60%, #0f0f1e 100%)'}}>
 {/* Mesh grid overlay */}
 <div className="absolute inset-0 pointer-events-none" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
 {/* Rich glow layers */}
 <div className="hidden md:block absolute top-0 left-1/4 w-[350px] h-[200px] bg-rose-500/15 rounded-full blur-[80px] pointer-events-none" />
 <div className="hidden md:block absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-violet-500/15 rounded-full blur-[80px] pointer-events-none" />
 <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
 <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
 {/* Corner ornaments */}
 <div className="absolute top-3 left-3 md:top-5 md:left-5 w-6 h-6 md:w-10 md:h-10 border-t-2 border-l-2 border-rose-500/60 rounded-tl-xl md:rounded-tl-2xl pointer-events-none" />
 <div className="absolute top-3 right-3 md:top-5 md:right-5 w-6 h-6 md:w-10 md:h-10 border-t-2 border-r-2 border-rose-500/60 rounded-tr-xl md:rounded-tr-2xl pointer-events-none" />
 <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 w-6 h-6 md:w-10 md:h-10 border-b-2 border-l-2 border-violet-500/60 rounded-bl-xl md:rounded-bl-2xl pointer-events-none" />
 <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5 w-6 h-6 md:w-10 md:h-10 border-b-2 border-r-2 border-violet-500/60 rounded-br-xl md:rounded-br-2xl pointer-events-none" />

 <div className="relative z-10 px-4 md:px-14 py-6 md:py-14 flex flex-col items-center gap-3 md:gap-6">


 {/* Main title block */}
 <div className="text-center select-none">
 <p className="font-cinzel text-[9px] sm:text-sm tracking-[0.35em] text-slate-300 uppercase mb-1">Cherupushpa Mission League</p>
 <h2 className="font-cinzel text-[11px] sm:text-xl tracking-[0.2em] text-rose-300 uppercase mb-0.5 font-bold">Kaliyar Mekhala</h2>
 <h1 className="font-cinzel font-black text-[32px] sm:text-6xl md:text-8xl uppercase leading-none tracking-wide" style={{background: 'linear-gradient(135deg, #fde68a 0%, #fb923c 30%, #f43f5e 60%, #c026d3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 4px 24px rgba(244,63,94,0.4))'}}>
 Kalolsavam
 </h1>
 </div>

 {/* Dot divider */}
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-rose-500/70" />
 <span className="w-2 h-2 rounded-full bg-amber-400/70" />
 <span className="w-2 h-2 rounded-full bg-violet-500/70" />
 </div>

 {/* Stats row */}
 <div className="flex items-center gap-2 sm:gap-6 flex-nowrap justify-center w-full">
 {[
 { label: 'Participants', value: (dbData?.registrations || []).filter((r: any) => r.competition === 'Kalolsavam').length || '—', color: 'from-amber-400 to-orange-500' },
 { label: 'Events', value: [...new Set((dbData?.registrations || []).filter((r: any) => r.competition === 'Kalolsavam').map((r: any) => r.eventName))].length || '—', color: 'from-rose-400 to-pink-500' },
 { label: 'Shakhas', value: [...new Set((dbData?.registrations || []).filter((r: any) => r.competition === 'Kalolsavam').map((r: any) => r.shakhaId).filter(Boolean))].length || '—', color: 'from-violet-400 to-indigo-500' },
 ].map((stat) => (
 <div key={stat.label} className="flex flex-col items-center gap-1 bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 sm:px-5 sm:py-3 flex-1">
 <span className={`text-2xl sm:text-3xl font-black font-cinzel bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</span>
 <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-slate-200 font-bold text-center">{stat.label}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Master Full-Width Dashboard Layout */}
 <div className="flex flex-col gap-8 items-stretch w-full">
 
 {/* Main content grids */}
 <div className="flex flex-col gap-6 w-full">
 
 {/* REDESIGNED OVERALL SHAKHA/UNIT LEADERS (Trophy Standing Card) */}
 <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-xs relative overflow-hidden">
 {/* Backglow lights for ambient premium aesthetic */}
 <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
 <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

 <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 pb-4 relative z-10">
 <div className="w-2 h-6 bg-gradient-to-b from-amber-500 via-rose-500 to-violet-600 rounded-full shadow-xs" />
 <h3 className="font-bricolage font-extrabold text-xl md:text-2xl text-slate-900 tracking-tight leading-none">
 Shakha Leaderboard
 </h3>
 </div>

 {/* DYNAMIC CONTENT AREA */}
 <AnimatePresence mode="wait">
 {standingsLayout === 'bento' && (
 <motion.div
 key="bento"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.25 }}
 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10"
 >
 {calculateLeaderboard(leaderboardFilter).map((unitRank, idx) => {
 let medalBadge = null;
 let cardStyle = "bg-white border-slate-200/80 hover:border-slate-350 shadow-2xs hover:shadow-sm";
 let rankBadgeStyle = "bg-slate-100/70 border border-slate-200 text-slate-600";
 let scoreColor = "text-[#8b5cf6]";
 let progressColor = "bg-slate-400";
 let premiumBadge = null;
 
 if (unitRank.rank === 1) {
 cardStyle = "bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white border-amber-250 hover:border-amber-400 shadow-md shadow-amber-500/5 ring-1 ring-amber-400/10 hover:shadow-amber-500/10";
 rankBadgeStyle = "bg-amber-100/80 border border-amber-300 text-amber-900 font-extrabold shadow-2xs";
 scoreColor = "text-amber-500";
 progressColor = "bg-gradient-to-r from-amber-400 to-amber-600";
 medalBadge = <Crown className="w-4.5 h-4.5 text-amber-550 fill-amber-100 animate-bounce" />;
 premiumBadge = (
 <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400 text-amber-50 text-[8px] font-black uppercase tracking-widest rounded-full shadow-xs">
 Championship Leader
 </div>
 );
 } else if (unitRank.rank === 2) {
 cardStyle = "bg-gradient-to-b from-slate-100/60 via-slate-50/10 to-white border-slate-300 hover:border-slate-400 shadow-xs hover:shadow-md";
 rankBadgeStyle = "bg-slate-150/80 border border-slate-300 text-slate-800 font-extrabold";
 scoreColor = "text-slate-600";
 progressColor = "bg-gradient-to-r from-slate-400 to-slate-500";
 medalBadge = <Medal className="w-4 h-4 text-slate-500 fill-slate-100" />;
 } else if (unitRank.rank === 3) {
 cardStyle = "bg-gradient-to-b from-orange-100/40 via-orange-50/5 to-white border-orange-200 hover:border-orange-350 shadow-xs hover:shadow-md";
 rankBadgeStyle = "bg-orange-100/80 border border-orange-300 text-orange-900 font-extrabold";
 scoreColor = "text-orange-600";
 progressColor = "bg-gradient-to-r from-orange-400 to-orange-550";
 medalBadge = <Medal className="w-4 h-4 text-orange-600 fill-orange-100" />;
 }

 const displayName = unitRank.unitName.includes(',') ? unitRank.unitName.split(',').pop().trim() : unitRank.unitName;

 const standingsList = calculateLeaderboard(leaderboardFilter);
 const maxPoints = standingsList.length > 0 ? standingsList[0].totalPoints : 1;
 const pct = maxPoints > 0 ? (unitRank.totalPoints / maxPoints) * 100 : 0;

 return (
 <div
 key={unitRank.unitId}
 className={`rounded-2xl p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-300 border relative group ${cardStyle}`}
 >
 {premiumBadge}
 <div className="flex items-center justify-between gap-1 mb-3.5">
 <span className={`text-[11px] md:text-xs font-cinzel font-black uppercase tracking-wider px-3 py-1 rounded-xl flex items-center gap-1 leading-none ${rankBadgeStyle}`}>
 RANK {unitRank.rank}
 </span>
 {medalBadge || <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:scale-125 transition" />}
 </div>
 
 <div className="flex-1 flex flex-col justify-between">
 <div>
 <h4 className="font-serif font-black italic tracking-wider text-slate-900 text-lg md:text-xl truncate group-hover:text-slate-950 transition" title={unitRank.unitName}>
 {displayName}
 </h4>
 </div>

 <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-slate-100 font-mono">
 <span className="text-[11px] text-slate-500 uppercase font-mono font-extrabold select-none tracking-wider">Points</span>
 <p className={`text-4xl md:text-5xl font-black ${scoreColor} leading-none tracking-tight flex items-center gap-1.5`}>
 {unitRank.totalPoints}
 <span className="text-[11px] text-slate-400 font-bold ml-1 font-sans">PTS</span>
 </p>
 </div>
 </div>
 </div>
 );
 })}
 </motion.div>
 )}

 {standingsLayout === 'podium' && (
 <motion.div
 key="podium"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.25 }}
 className="flex flex-col gap-8 relative z-10"
 >
 {/* Visual Arena Podium Display */}
 <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 py-6 md:pt-14 md:pb-4">
 
 {/* SILVER MEDALIST CARD (2nd Place) */}
 {(() => {
 const sList = calculateLeaderboard(leaderboardFilter);
 const secondRank = sList[1];
 if (!secondRank) return null;
 
 const displayName = secondRank.unitName.includes(',') ? secondRank.unitName.split(',').pop().trim() : secondRank.unitName;

 return (
 <div className="order-2 md:order-1 flex-1 flex flex-col items-center justify-end">
 <div className="w-full md:max-w-[200px] bg-gradient-to-b from-slate-100 to-white border border-slate-300 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs relative pt-8">
 <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-200 border border-slate-300 text-slate-800 font-mono font-black text-sm flex items-center justify-center shadow-xs">
 2
 </span>
 <Medal className="w-10 h-10 text-slate-450 fill-slate-100 mb-2" />
 <h4 className="font-cinzel tracking-wider font-black text-slate-800 text-sm md:text-base tracking-tight truncate w-full" title={secondRank.unitName}>
 {displayName}
 </h4>
 <p className="text-[9px] text-slate-400 uppercase font-black font-mono tracking-wider mt-1">
 {secondRank.participantsCount} entries • {secondRank.aGradesCount} A Grades
 </p>
 </div>
 <div className="hidden md:flex w-full md:max-w-[200px] h-28 bg-gradient-to-b from-slate-200 to-slate-100/50 border-x border-b border-slate-200 rounded-b-xl flex-col items-center justify-center p-3">
 <span className="text-3xl font-black text-slate-705 leading-none">{secondRank.totalPoints}</span>
 <span className="text-[10px] text-slate-450 font-black tracking-wider uppercase mt-1">PTS</span>
 </div>
 </div>
 );
 })()}

 {/* GOLD CHAMPIONSHIP (1st Place) */}
 {(() => {
 const sList = calculateLeaderboard(leaderboardFilter);
 const firstRank = sList[0];
 if (!firstRank) return null;
 
 const displayName = firstRank.unitName.includes(',') ? firstRank.unitName.split(',').pop().trim() : firstRank.unitName;

 return (
 <div className="order-1 md:order-2 flex-1 flex flex-col items-center justify-end">
 <div className="w-full md:max-w-[220px] bg-gradient-to-b from-amber-50 to-white border border-amber-300 rounded-2xl p-4 flex flex-col items-center text-center shadow-md relative pt-10 ring-2 ring-amber-400/20">
 <span className="absolute -top-7 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-white text-amber-950 font-mono font-black text-lg flex items-center justify-center shadow-md animate-pulse">
 <Crown className="w-6 h-6 text-amber-950 fill-amber-100" />
 </span>
 <Sparkles className="w-5 h-5 text-amber-400 absolute top-2 right-4 animate-bounce" />
 <h4 className="font-cinzel tracking-wider font-black text-amber-950 text-base tracking-tight truncate w-full" title={firstRank.unitName}>
 {displayName}
 </h4>
 <p className="text-[9px] text-amber-800/80 uppercase font-black font-mono tracking-wider mt-1">
 {firstRank.participantsCount} entries • {firstRank.aGradesCount} A Grades
 </p>
 </div>
 <div className="hidden md:flex w-full md:max-w-[220px] h-36 bg-gradient-to-b from-amber-100 to-amber-50/30 border-x border-b border-amber-200 rounded-b-xl flex-col items-center justify-center p-3 shadow-xs">
 <span className="text-4xl font-black text-amber-650 leading-none">{firstRank.totalPoints}</span>
 <span className="text-[10px] text-amber-700 font-black tracking-wider uppercase mt-1">PTS</span>
 </div>
 </div>
 );
 })()}

 {/* BRONZE MEDALIST CARD (3rd Place) */}
 {(() => {
 const sList = calculateLeaderboard(leaderboardFilter);
 const thirdRank = sList[2];
 if (!thirdRank) return null;
 
 const displayName = thirdRank.unitName.includes(',') ? thirdRank.unitName.split(',').pop().trim() : thirdRank.unitName;

 return (
 <div className="order-3 md:order-3 flex-1 flex flex-col items-center justify-end">
 <div className="w-full md:max-w-[200px] bg-gradient-to-b from-orange-50 to-white border border-orange-200 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs relative pt-8">
 <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-orange-100 border border-orange-200 text-orange-950 font-mono font-black text-sm flex items-center justify-center shadow-xs">
 3
 </span>
 <Medal className="w-10 h-10 text-orange-600 fill-orange-105 mb-2" />
 <h4 className="font-cinzel tracking-wider font-black text-slate-800 text-sm md:text-base tracking-tight truncate w-full" title={thirdRank.unitName}>
 {displayName}
 </h4>
 <p className="text-[9px] text-orange-800/70 uppercase font-black font-mono tracking-wider mt-1">
 {thirdRank.participantsCount} entries • {thirdRank.aGradesCount} A Grades
 </p>
 </div>
 <div className="hidden md:flex w-full md:max-w-[200px] h-20 bg-gradient-to-b from-orange-100/60 to-orange-50/20 border-x border-b border-orange-200 rounded-b-xl flex-col items-center justify-center p-3">
 <span className="text-2xl font-black text-orange-605 leading-none">{thirdRank.totalPoints}</span>
 <span className="text-[10px] text-orange-604 font-semibold tracking-wider uppercase mt-1">PTS</span>
 </div>
 </div>
 );
 })()}

 </div>

 {/* Stiff runners list layout below the podium arena */}
 {(() => {
 const sList = calculateLeaderboard(leaderboardFilter);
 const runners = sList.slice(3);
 if (runners.length === 0) return null;

 return (
 <div className="border-t border-slate-100 pt-6">
 <span className="text-[10px] font-black text-slate-400 font-sans uppercase tracking-[0.15em] block mb-3 text-left">
 Remaining Standings
 </span>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {runners.map((runRank) => {
 const displayName = runRank.unitName.includes(',') ? runRank.unitName.split(',').pop().trim() : runRank.unitName;

 const maxPoints = sList[0].totalPoints || 1;
 const pct = (runRank.totalPoints / maxPoints) * 100;

 return (
 <div 
 key={runRank.unitId}
 className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 hover:border-slate-350 transition rounded-2xl gap-3"
 >
 <div className="flex items-center gap-3 min-w-0">
 <span className="w-7 h-7 rounded-full bg-slate-200/70 font-mono font-bold text-slate-800 text-xs flex items-center justify-center shrink-0">
 {runRank.rank}
 </span>
 <div className="min-w-0 text-left">
 <h5 className="font-cinzel tracking-wider font-extrabold text-sm text-slate-805 truncate" title={runRank.unitName}>
 {displayName}
 </h5>
 <div className="w-24 sm:w-32 h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
 <div className="h-full bg-[#f43f5e] rounded-full" style={{ width: `${pct}%` }} />
 </div>
 </div>
 </div>
 <div className="flex flex-col items-end shrink-0 text-right">
 <span className="text-[15px] font-mono font-black text-[#8b5cf6]">{runRank.totalPoints} PTS</span>
 <span className="text-[8px] font-bold text-slate-450 uppercase">{runRank.participantsCount} entries</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 })()}
 </motion.div>
 )}

 {standingsLayout === 'analytics' && (
 <motion.div
 key="analytics"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.25 }}
 className="flex flex-col gap-2 relative z-10"
 >
 <div className="w-full overflow-x-auto rounded-2xl border border-slate-150 shadow-2xs">
 <table className="w-full text-left border-collapse min-w-[400px] bg-white">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
 <th className="py-3 px-4 w-12 text-center">Rank</th>
 <th className="py-3 px-4">shakha </th>
 <th className="py-3 px-4 text-right">Points Tally</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-left">
 {calculateLeaderboard(leaderboardFilter).map((unitRank) => {
 const displayName = unitRank.unitName.includes(',') ? unitRank.unitName.split(',').pop().trim() : unitRank.unitName;

 let badge = null;
 if (unitRank.rank === 1) badge = "🥇";
 else if (unitRank.rank === 2) badge = "🥈";
 else if (unitRank.rank === 3) badge = "🥉";

 return (
 <tr 
 key={unitRank.unitId}
 className="hover:bg-slate-50/70 transition-colors"
 >
 <td className="py-3.5 px-4 text-center font-mono font-black text-slate-800 text-xs flex items-center justify-center gap-1">
 <span>{unitRank.rank}</span>
 {badge && <span className="text-xs">{badge}</span>}
 </td>
 <td className="py-3.5 px-4 font-sans font-black text-slate-800 text-xs tracking-tight uppercase">
 {displayName}
 <span className="text-[10px] text-slate-400 capitalize font-medium font-sans block tracking-normal mt-0.5">
 {unitRank.unitName}
 </span>
 </td>
 <td className="py-3.5 px-4 text-right">
 <div className="inline-flex items-baseline gap-1 font-mono">
 <span className="text-base font-black text-[#8b5cf6]">{unitRank.totalPoints}</span>
 <span className="text-[9px] text-slate-405 font-black font-sans uppercase">PTS</span>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Class Competitive Event Selector */}
 <div className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs relative overflow-hidden">
 <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
 <div className="w-1.5 h-5 bg-gradient-to-b from-amber-500 via-rose-500 to-violet-600 rounded-full shadow-2xs" />
 <h4 className="font-cinzel tracking-wider font-black text-slate-900 text-sm uppercase tracking-wider">
 select category
 </h4>
 </div>

 {/* Age Class Category / Section Selector Tabs */}
 <div className="mb-6 bg-slate-50 p-2 rounded-2xl border border-slate-100/80">
 <div className="flex flex-wrap gap-1.5">
 {displayCategories.map((displayCat) => {
 const actualCatKey = getActualCatKey(displayCat);
 const isCatActive = selectedCategory === actualCatKey;
 const eventCount = itemsMap[actualCatKey]?.length || 0;
 return (
 <button
 key={displayCat}
 onClick={() => handleCategorySelect(actualCatKey)}
 className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 ${
 isCatActive
 ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/10'
 : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/50'
 }`}
 >
 <span>{displayCat}</span>
 <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
 isCatActive ? 'bg-rose-750 text-rose-100' : 'bg-slate-100 text-slate-500'
 }`}>
 {eventCount}
 </span>
 </button>
 );
 })}
 </div>
 
 {selectedCategory.toLowerCase() !== 'group' && (
 <div className="flex bg-slate-100/70 p-1 rounded-xl mb-4 self-start border border-slate-200/50">
 {['All', 'Boys', 'Girls'].map((g) => (
 <button
 key={g}
 onClick={() => {
 setGenderFilter(g as 'All' | 'Boys' | 'Girls');
 setSelectedItem('All');
 }}
 className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
 genderFilter === g
 ? 'bg-white text-[#8b5cf6] shadow-xs'
 : 'text-slate-500 hover:text-slate-700'
 }`}
 >
 {g}
 </button>
 ))}
 </div>
 )}
 
 <div className="flex flex-wrap gap-2.5">
 {activeEventsList.length === 0 ? null : (
 <>
 <button
 onClick={() => setSelectedItem('All')}
 className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer select-none ${
 selectedItem === 'All'
 ? 'border-rose-500 text-[#8b5cf6] bg-rose-50/40 shadow-xs'
 : 'bg-slate-50 text-slate-705 border-slate-150/40 hover:bg-slate-100/80 hover:border-slate-205'
 }`}
 >
 All Competitions
 </button>
 {activeEventsList.map((item) => {
 const isActive = selectedItem === item.id;
 let statusBadgeColor = "bg-slate-100 text-slate-600 border-slate-200/50";
 if (item.status === 'Result Published') statusBadgeColor = "bg-rose-50 text-rose-600 border-rose-100/40 font-black";
 if (item.status === 'Completed') statusBadgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100/40 font-black";
 if (item.status === 'Ongoing' || item.status === 'Started') statusBadgeColor = "bg-amber-50 text-amber-700 border-amber-100/40 font-black";

 return (
 <button
 key={item.id}
 onClick={() => setSelectedItem(item.id)}
 className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 border flex items-center gap-2.5 cursor-pointer select-none whitespace-nowrap ${
 isActive
 ? 'border-rose-500 text-[#8b5cf6] bg-rose-50/40 shadow-xs'
 : 'bg-slate-50 text-slate-705 border-slate-150/40 hover:bg-slate-100/80 hover:border-slate-205'
 }`}
 >
 <span className="tracking-tight">{item.name}</span>
 <span className={`text-[8px] font-mono px-2 py-0.5 rounded-lg border uppercase ${statusBadgeColor}`}>
 {item.status}
 </span>
 </button>
 );
 })}
 </>
 )}
 </div>


 </div>

 {/* TABLE AND RESULTS GRID (LEDGER CAPABILITIES) */}
 <div className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col gap-6">
 
 {/* Premium Header Accent Area */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
 <div className="flex items-center gap-3">
 <div className="w-1.5 h-5 bg-gradient-to-b from-amber-500 via-rose-500 to-violet-600 rounded-full shadow-2xs" />
 <div>
 <h4 className="font-cinzel tracking-wider font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
 Individual Results
 </h4>
 </div>
 </div>
 </div>



 {/* Filter and Search Box Control Bar */}
 <div className="bg-slate-50/50 p-4 sm:p-5 border border-slate-150/70 rounded-3xl flex flex-col gap-4 shadow-3xs">
 {/* Search query field */}
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search participant name, Shakha parish unit or event classification..."
 className="w-full bg-white text-slate-900 placeholder-slate-400 pl-11 pr-20 py-3.5 text-xs rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]/30 border border-slate-200/80 shadow-3xs font-sans font-semibold transition-all duration-200"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-rose-600 font-extrabold uppercase tracking-wider bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl hover:bg-rose-100 transition cursor-pointer"
 >
 clear
 </button>
 )}
 </div>

 {/* Filters selection row */}
 <div className="grid grid-cols-1 gap-3">
 {/* Shakha Dropdown */}
 <div className="relative">
 <button
 type="button"
 onClick={() => setIsShakhaDropdownOpen(!isShakhaDropdownOpen)}
 className="w-full text-left group flex items-center gap-3 bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl px-4 py-2.5 transition-all duration-200 shadow-3xs hover:shadow-2xs cursor-pointer focus:outline-none"
 >
 <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-[#8b5cf6] rounded-xl border border-slate-100 group-hover:bg-[#8b5cf6]/5 transition-all">
 <MapPin className="w-3.5 h-3.5" />
 </div>
 <div className="flex flex-col text-left flex-1 min-w-0">
 <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1 select-none">Shakha Region</span>
 <div className="text-slate-800 text-[11px] font-black uppercase tracking-wider flex items-center justify-between">
 <span>{shakhaFilter === 'All' ? 'All Shakhas' : shakhaFilter.toUpperCase()}</span>
 <span className={`ml-1 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isShakhaDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
 </div>
 </div>
 </button>

 {/* Backdrop for closing */}
 {isShakhaDropdownOpen && (
 <div 
 className="fixed inset-0 z-10 cursor-default" 
 onClick={(e) => {
 e.stopPropagation();
 setIsShakhaDropdownOpen(false);
 }} 
 />
 )}

 {/* Options Dropdown Menu */}
 {isShakhaDropdownOpen && (
 <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto p-1.5 animate-in fade-in duration-100 ease-out divide-y divide-slate-50">
 {[
 { value: "All", label: "All Shakhas" },
 { value: "Kaliyar", label: "Kaliyar" },
 { value: "Kadavoor", label: "Kadavoor" },
 { value: "Kodikulam", label: "Kodikulam" },
 { value: "Koduvely", label: "Koduvely" },
 { value: "Mullaringad", label: "Mullaringad" },
 { value: "Mundanmudy", label: "Mundanmudy" },
 { value: "Njarakkad", label: "Njarakkad" },
 { value: "Paingottoor", label: "Paingottoor" },
 { value: "Punnamattam", label: "Punnamattam" },
 { value: "Rajagiri", label: "Rajagiri" },
 { value: "Thennathoor", label: "Thennathoor" },
 { value: "Thommankuthu", label: "Thommankuthu" },
 { value: "Vannappuram", label: "Vannappuram" }
 ].map((shakha) => (
 <button
 key={shakha.value}
 type="button"
 onClick={() => {
 setShakhaFilter(shakha.value);
 setIsShakhaDropdownOpen(false);
 }}
 className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase transition duration-150 cursor-pointer flex items-center justify-between ${
 shakhaFilter === shakha.value
 ? 'bg-[#8b5cf6] text-white font-black'
 : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-none'
 }`}
 >
 <span>{shakha.label}</span>
 {shakhaFilter === shakha.value && (
 <span className="text-white text-[10px]">✓</span>
 )}
 </button>
 ))}
 </div>
 )}
 </div>

 </div>
 </div>

 {/* Table Ledger Output */}
 <div className="w-full overflow-hidden rounded-2xl border border-slate-150 shadow-2xs hidden md:block">
 <table className="w-full text-left border-collapse min-w-[700px]">
 <thead>
 <tr className="border-b border-violet-100 text-slate-800 text-[10px] font-black uppercase tracking-[0.15em] font-mono bg-gradient-to-r from-violet-50/60 via-slate-50/30 to-rose-50/60 select-none">
 <th className="py-4 px-5 font-black h-11 text-slate-850">Participant Candidate</th>
 <th className="py-4 px-5 font-black h-11 text-slate-850">Shakha</th>
 <th className="py-4 px-5 font-black h-11 text-slate-850">Category / Event</th>
 <th className="py-4 px-5 font-black text-center h-11 text-slate-850">Grade Status</th>
 <th className="py-4 px-5 font-black text-center h-11 text-slate-850">Honor Position</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {visibleParticipants.length === 0 ? (
 <tr>
 <td colSpan={5} className="py-16 text-center text-xs text-slate-400 bg-white">
 <div className="flex flex-col items-center justify-center gap-3">
 <div className="p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-300">
 <Users className="w-8 h-8 stroke-[1.5]" />
 </div>
 <span className="font-extrabold text-slate-500 text-xs">No matching ledger entries found.</span>
 </div>
 </td>
 </tr>
 ) : (
 visibleParticipants.map((p) => {
 return (
 <tr 
 key={p.id}
 className={`group transition-all duration-200 hover:bg-[#8b5cf6]/[0.02] ${
 p.dbResult && !p.dbResult.isPublished ? 'opacity-70 bg-amber-50/10' : 'bg-white'
 }`}
 >
 <td className="py-3.5 px-5 text-xs md:text-sm font-extrabold text-slate-900 tracking-wide uppercase">
 <div className="flex items-center">
 <span className="group-hover:text-[#8b5cf6] transition-colors duration-200">{p.name}</span>
 </div>
 </td>
 <td className="py-3.5 px-5 text-xs font-semibold text-slate-600 font-sans">
 {p.shakha}
 </td>
 <td className="py-3.5 px-5 text-xs text-slate-550 font-semibold font-sans max-w-[280px] truncate" title={p.category}>
 {p.category}
 </td>
 <td className="py-3.5 px-5 text-xs text-center">
 {(p.grade && p.grade !== 'None') ? (
 <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg tracking-wider uppercase inline-flex items-center gap-1.5 border ${
 p.grade === 'A' 
 ? 'bg-rose-50 border-rose-200/70 text-rose-600 shadow-2xs' 
 : p.grade === 'B'
 ? 'bg-amber-50 border-amber-200/70 text-amber-700 shadow-2xs'
 : 'bg-slate-50 border-slate-200/70 text-slate-600'
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${p.grade === 'A' ? 'bg-rose-500 animate-pulse' : p.grade === 'B' ? 'bg-amber-500' : 'bg-slate-400'}`} />
 {p.grade === 'Absent' ? 'Absent' : `Grade ${p.grade}`}
 </span>
 ) : (
 <span className="text-slate-350 font-sans font-extrabold text-xs">-</span>
 )}
 </td>
 <td className="py-3.5 px-5 text-xs text-center">
 {(p.position && p.position !== 'None') ? (
 <span className={`px-2.5 py-1 font-black text-[9px] rounded-lg tracking-wider uppercase inline-flex items-center gap-1.5 border ${
 p.position === '1st'
 ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/20 border-amber-250 text-amber-800'
 : p.position === '2nd'
 ? 'bg-gradient-to-r from-slate-100 to-slate-200/50 border-slate-300 text-slate-700'
 : 'bg-orange-500/10 border-orange-250 text-orange-900 bg-gradient-to-r from-orange-500/10 to-orange-500/20'
 }`}>
 <Award className={`w-3.5 h-3.5 ${p.position === '1st' ? 'text-amber-500 animate-pulse' : p.position === '2nd' ? 'text-slate-400' : 'text-orange-600'}`} />
 {p.position} Position
 </span>
 ) : (
 <span className="text-slate-350 font-sans font-extrabold text-xs">-</span>
 )}
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Mobile Responsive Grid List (shown only on mobile) */}
 <div className="flex flex-col gap-3.5 md:hidden">
 {visibleParticipants.length === 0 ? (
 <div className="py-16 text-center text-xs text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
 <div className="flex flex-col items-center gap-2.5">
 <Users className="w-8 h-8 text-slate-300 stroke-[1.5]" />
 <span className="font-semibold text-slate-500">No results found matching selected criteria.</span>
 </div>
 </div>
 ) : (
 visibleParticipants.map((p) => {
 const isDraftUnpublished = p.dbResult && !p.dbResult.isPublished;
 const hasGrade = p.grade && p.grade !== 'None';
 const hasPosition = p.position && p.position !== 'None';

 return (
 <div
 key={`mob-res-${p.id}`}
 className={`border rounded-2xl p-4.5 flex flex-col gap-3 transition-all duration-200 ${
 isDraftUnpublished 
 ? 'border-amber-250 bg-amber-50/5 opacity-80' 
 : 'border-slate-150 bg-slate-50/30'
 }`}
 >
 {/* Title Row */}
 <div className="flex justify-between items-start gap-2">
 <div className="flex flex-col gap-0.5">
 <h4 className="text-sm font-black text-slate-950 uppercase tracking-wide">
 {p.name}
 </h4>
 <span className="text-[10px] uppercase font-extrabold text-rose-700 tracking-wider">
 {p.shakha}
 </span>
 </div>
 {isDraftUnpublished && (
 <span className="px-2 py-0.5 text-[8.5px] font-black uppercase bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80">
 result published
 </span>
 )}
 </div>

 {/* Category */}
 <div className="text-xs text-slate-700">
 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Category Class</span>
 <span className="font-semibold text-slate-800">{p.category}</span>
 </div>

 {/* Badges / Placements Block */}
 {(hasGrade || hasPosition) && (
 <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/60">
 {hasGrade && (
 <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg tracking-wider uppercase inline-flex items-center gap-1 border ${
 p.grade === 'A' 
 ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-xs' 
 : p.grade === 'B'
 ? 'bg-amber-50 border-amber-100 text-[#b45309]'
 : 'bg-slate-50 border-slate-100 text-slate-600'
 }`}>
 🎖️ {p.grade === 'Absent' ? 'Absent' : `Grade ${p.grade}`}
 </span>
 )}
 {hasPosition && (
 <span className={`px-2.5 py-1 font-black text-[9px] rounded-lg tracking-wider uppercase inline-flex items-center gap-1 border ${
 p.position === '1st'
 ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/20 border-amber-200 text-amber-800'
 : p.position === '2nd'
 ? 'bg-slate-50 border-slate-200 text-slate-700'
 : 'bg-amber-700/10 border-amber-750/20 text-amber-900'
 }`}>
 🏆 {p.position} Place
 </span>
 )}
 </div>
 )}
 </div>
 );
 })
 )}
 </div>

 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

