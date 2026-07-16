import React, { useState, useMemo, useEffect } from 'react';
import { 
 MapPin, 
 Home, 
 Search, 
 Award, 
 Mail, 
 Sparkles, 
 Copy, 
 Check, 
 X, 
 ExternalLink,
 Filter,
 Users,
 Phone,
 Edit,
 Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OfficeBearer } from '../types';

interface OfficeBearersViewProps {
  bearers: OfficeBearer[];
  dbData: any;
  isAdminLoggedIn: boolean;
  onSaveDatabase: (key: string, data: any) => Promise<void>;
}

function getObPositionClass(name: string, designation: string, photoUrl: string, isModal = false): string {
 const n = name || '';
 const d = designation || '';
 
 let scaleClass = 'scale-100';
 let translateClass = '';
 let objectPos = 'object-center';
 let hoverScaleClass = isModal ? '' : 'group-hover:scale-110';

 // Custom adjustments requested by the user:
 if (n.includes('Joel')) {
 scaleClass = 'scale-[1.3]';
 translateClass = 'translate-y-5';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[1.4]';
 } else if (n.includes('Alphonsa')) {
 scaleClass = 'scale-[1.2]';
 translateClass = '';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[1.3]';
 } else if (n.includes('Eliz')) {
 scaleClass = 'scale-[1.2]';
 translateClass = '';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[1.3]';
 } else if (n.includes('Ann Mariya')) {
 scaleClass = 'scale-[1.2]';
 translateClass = '';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[1.3]';
 } else if (n.includes('Binil Binoy')) {
 scaleClass = 'scale-100';
 translateClass = '';
 objectPos = 'object-top';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-110';
 } else if (n.includes('Christo')) {
 scaleClass = 'scale-100';
 translateClass = '';
 objectPos = 'object-top';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-110';
 } else if (n.includes('Mathew')) {
 scaleClass = 'scale-100';
 translateClass = '';
 objectPos = 'object-top';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-110';
 } else if (photoUrl?.includes('_optimized.webp')) {
 // Default optimized image
 scaleClass = 'scale-100';
 translateClass = '';
 objectPos = 'object-center';
 } else {
 // Legacy positions for unoptimized / local images
 objectPos = ['Alan Roshy', 'Abel George Joseph', 'Christy Johnson', 'Helen Thomas'].includes(n) ? 'object-center' : 'object-top';

 if (d === 'Director') {
 scaleClass = isModal ? 'scale-[1.5]' : 'scale-[2.5]';
 translateClass = '-translate-y-2';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[2.6]';
 } else if (d === 'Joint Director') {
 scaleClass = 'scale-[2.2]';
 translateClass = 'translate-y-4 translate-x-3';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[2.3]';
 } else if (d === 'Assistant Director') {
 scaleClass = 'scale-[1.4]';
 translateClass = '-translate-y-4';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[1.5]';
 } else if (d === 'President') {
 scaleClass = isModal ? 'scale-[1.4]' : 'scale-[1.8]';
 translateClass = 'translate-y-6';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[1.9]';
 } else if (n.includes('Alphonsa')) {
 scaleClass = 'scale-[3.2]';
 translateClass = '-translate-y-2';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[3.3]';
 } else if (n.toLowerCase().includes('tijo')) {
 scaleClass = 'scale-[2.5]';
 translateClass = 'translate-y-8';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[2.6]';
 } else if (['Ann Mariya Vincent', 'Alnamol Linoj', 'Eliz Philip', 'Amal Joshy'].includes(n)) {
 scaleClass = 'scale-[2.5]';
 translateClass = '-translate-y-8';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[2.6]';
 } else if (d === 'Joint Secretary') {
 scaleClass = 'scale-[2.0]';
 translateClass = 'translate-y-12';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[2.1]';
 } else if (n === 'Christy Johnson') {
 scaleClass = 'scale-[1.6]';
 translateClass = 'translate-y-2';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[1.7]';
 objectPos = 'object-center';
 } else if (n === 'Helen Thomas') {
 scaleClass = 'scale-[1.4]';
 translateClass = 'translate-y-2';
 hoverScaleClass = isModal ? '' : 'group-hover:scale-[1.5]';
 objectPos = 'object-center';
 }
 }

 return `${scaleClass} ${translateClass} ${hoverScaleClass} ${objectPos}`;
}

export default function OfficeBearersView({ bearers, dbData, isAdminLoggedIn, onSaveDatabase }: OfficeBearersViewProps) {
 const [copiedId, setCopiedId] = useState<string | null>(null);
 const [selectedBearer, setSelectedBearer] = useState<OfficeBearer | null>(null);

 const [editPhone, setEditPhone] = useState('');
 const [editHouse, setEditHouse] = useState('');
 const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

 useEffect(() => {
 if (selectedBearer) {
 setEditPhone(selectedBearer.contact || '');
 setEditHouse(selectedBearer.houseName || '');
 setSaveStatus('idle');
 }
 }, [selectedBearer]);

 const handleSaveInfo = async () => {
 if (!selectedBearer || !dbData || !onSaveDatabase) return;
 setSaveStatus('saving');
 
 const updatedBearers = dbData.officeBearers.map((b: OfficeBearer) => {
 if (b.id === selectedBearer.id) {
 return {
 ...b,
 contact: editPhone,
 houseName: editHouse
 };
 }
 return b;
 });

 const updatedData = {
 ...dbData,
 officeBearers: updatedBearers
 };

 try {
 await onSaveDatabase(updatedData, 'EDIT_BEARER', selectedBearer.name);
 setSaveStatus('success');
 setSelectedBearer({
 ...selectedBearer,
 contact: editPhone,
 houseName: editHouse
 });
 setTimeout(() => {
 setSelectedBearer(null);
 setSaveStatus('idle');
 }, 1000);
 } catch (err) {
 console.error('Failed to save bearer details', err);
 setSaveStatus('idle');
 }
 };

 const classifiedBearers = useMemo(() => {
 return bearers.map(b => {
 const designationLower = b.designation.toLowerCase();
 let category: 'spiritual' | 'executive' | 'others' = 'others';
 
 if (designationLower.includes('director') || designationLower.includes('priest') || designationLower.includes('sister')) {
 category = 'spiritual';
 } else if (
 designationLower.includes('president') || 
 designationLower.includes('secretary') || 
 designationLower.includes('organizer') || 
 designationLower.includes('treasurer')
 ) {
 category = 'executive';
 }
 
 return { ...b, category };
 });
 }, [bearers]);

 const filteredBearers = useMemo(() => {
 return classifiedBearers.slice().sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
 }, [classifiedBearers]);

 return (
 <div className="w-full bg-slate-50 min-h-screen pt-4 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
 {/* Ambient background orbs for premium feel - hidden on mobile to prevent scroll lag */}
 <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-rose-400/10 rounded-full blur-[100px] pointer-events-none" />
 <div className="hidden md:block absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)] pointer-events-none" />

 <div className="max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
 
 {/* Title Presentation */}
 <div className="flex flex-col items-center text-center gap-5 max-w-4xl mx-auto">
 <motion.div 
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="inline-flex items-center justify-center px-6 py-2 bg-amber-50/80 border border-amber-200/50 rounded-full shadow-sm"
 >
 <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 tracking-[0.3em] uppercase font-sans">
 Official Leadership Council
 </span>
 </motion.div>

 <motion.h2 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="font-cinzel font-black text-5xl sm:text-6xl md:text-7xl text-slate-900 tracking-wide leading-tight drop-shadow-sm"
 >
 Mekhala <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700">Executives</span>
 </motion.h2>

 {/* Elegant Divider */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.2 }}
 className="flex items-center justify-center w-full max-w-xs mt-2 opacity-80 gap-3"
 >
 <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
 <div className="w-1.5 h-1.5 rotate-45 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
 <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
 </motion.div>
 </div>

 {/* Directory Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-20 mt-2">
 {filteredBearers.map((ob, idx) => {
 const isSpiritual = ob.category === 'spiritual';
 const themeColor = isSpiritual ? 'amber' : 'rose';
 
 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4), type: 'spring', stiffness: 100 }}
 key={ob.id || idx}
 className={`group relative bg-white/60 rounded-3xl p-6 pt-24 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-${themeColor}-500/20 border border-slate-200 hover:border-${themeColor}-300 transition-all duration-500 flex flex-col items-center text-center gap-5`}
 >
 {/* Admin Edit Button */}
 {isAdminLoggedIn && (
 <button
 onClick={() => setSelectedBearer(ob)}
 className="absolute top-4 right-4 z-30 p-2.5 bg-white/90 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-700 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
 title="Edit Contact Details"
 >
 <Edit className="w-4 h-4" />
 </button>
 )}

 {/* Profile Picture (Standardized) */}
 <div className={`absolute -top-12 w-28 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 group-hover:-translate-y-2 transition-transform duration-500 ease-out z-20`}>
 <div className={`absolute inset-0 bg-gradient-to-tr ${isSpiritual ? 'from-amber-100 to-amber-50' : 'from-rose-100 to-rose-50'} animate-pulse`} />
 <img
 src={ob.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
 alt={ob.name}
 referrerPolicy="no-referrer"
 loading={idx < 4 ? "eager" : "lazy"}
 decoding="async"
 className={`w-full h-full object-cover transition-transform duration-500 ease-out relative z-10 ${
 getObPositionClass(ob.name, ob.designation, ob.photoUrl, false)
 }`}
 />
 {/* Inner glow ring on hover */}
 <div className={`absolute inset-0 rounded-2xl border border-${themeColor}-400/0 group-hover:border-${themeColor}-400/50 transition-colors duration-500 z-20 pointer-events-none`} />
 </div>

 {/* Profile Details */}
 <div className="flex flex-col gap-2 w-full mt-2 relative z-10">
 <h3 className="font-serif font-black text-slate-900 text-xl leading-tight group-hover:text-slate-700 transition-colors">
 {ob.name}
 </h3>
 <div className="flex justify-center w-full">
 <span className={`px-4 py-1.5 text-[10px] font-['Outfit'] font-black tracking-[0.15em] uppercase rounded-full border shadow-xs ${
 isSpiritual 
 ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200/50' 
 : 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200/50'
 }`}>
 {ob.designation}
 </span>
 </div>
 </div>

 {/* Contact Data Shelf */}
 <div className="flex flex-col gap-2 w-full mt-2 pt-4 border-t border-slate-200/70">
 
 {/* Parish Unit */}
 <div className="flex items-center gap-3 w-full bg-white/50 rounded-xl py-2 px-2.5 border border-slate-200 group-hover:bg-white group-hover:border-slate-300 group-hover:shadow-sm transition-all">
 <div className={`w-8 h-8 rounded-lg ${isSpiritual ? 'bg-amber-100/50 text-amber-600' : 'bg-rose-100/50 text-rose-600'} flex items-center justify-center shrink-0`}>
 <MapPin className="w-3.5 h-3.5" />
 </div>
 <div className="flex flex-col items-start min-w-0 flex-1 text-left">
 <span className="text-[9px] font-['Outfit'] font-bold text-slate-400 tracking-widest uppercase">Shakha</span>
 <span className="text-slate-800 text-[13px] font-bold truncate w-full">{ob.unit || 'Kaliyar Mekhala HQ'}</span>
 </div>
 </div>

 {/* House Name */}
 {ob.houseName && (
 <div className="flex items-center gap-3 w-full bg-white/50 rounded-xl py-2 px-2.5 border border-slate-200 group-hover:bg-white group-hover:border-slate-300 group-hover:shadow-sm transition-all">
 <div className={`w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0`}>
 <Home className="w-3.5 h-3.5" />
 </div>
 <div className="flex flex-col items-start min-w-0 flex-1 text-left">
 <span className="text-[9px] font-['Outfit'] font-bold text-slate-400 tracking-widest uppercase">House Name</span>
 <span className="text-slate-700 text-[13px] font-semibold truncate w-full">{ob.houseName}</span>
 </div>
 </div>
 )}

 {/* Phone */}
 {ob.contact && (
 <div className="flex items-center gap-3 w-full bg-white/50 rounded-xl py-2 px-2.5 border border-slate-200 group-hover:bg-white group-hover:border-slate-300 group-hover:shadow-sm transition-all">
 <div className={`w-8 h-8 rounded-lg bg-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0`}>
 <Phone className="w-3.5 h-3.5" />
 </div>
 <div className="flex flex-col items-start min-w-0 flex-1 text-left">
 <span className="text-[9px] font-['Outfit'] font-bold text-slate-400 tracking-widest uppercase">Contact</span>
 <span className="text-slate-800 text-[13px] font-mono font-bold truncate w-full">{ob.contact}</span>
 </div>
 </div>
 )}

 </div>
 </motion.div>
 );
 })}
 </div>

 {/* Empty State */}
 {filteredBearers.length === 0 && (
 <div className="p-16 text-center bg-white/80 rounded-3xl border border-slate-200 shadow-xl max-w-lg mx-auto flex flex-col items-center gap-4">
 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
 <Users className="w-8 h-8 text-slate-400" />
 </div>
 <h4 className="font-serif font-black text-slate-800 text-2xl">No Officers Found</h4>
 <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">
 No leadership committee members are currently listed in the directory database of the Mekhala.
 </p>
 </div>
 )}

 </div>

 {/* Admin Edit Modal */}
 <AnimatePresence>
 {selectedBearer && (
 <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 select-none">
 <motion.div
 initial={{ scale: 0.95, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 20 }}
 className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden relative border border-white/20 text-left flex flex-col"
 >
 {/* Modal Header Cover */}
 <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-950 relative p-5">
 <button
 onClick={() => setSelectedBearer(null)}
 className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-10"
 >
 <X className="w-4 h-4" />
 </button>
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.webp')] opacity-20 mix-blend-overlay pointer-events-none" />
 </div>

 <div className="px-6 pb-6 relative flex flex-col pt-0">
 
 {/* Floating Modal Avatar */}
 <div className="relative -mt-14 w-24 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100 mb-4 z-10 self-center">
 <img loading="lazy"
 src={selectedBearer.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
 alt={selectedBearer.name}
 referrerPolicy="no-referrer"
 className={`w-full h-full object-cover ${
 getObPositionClass(selectedBearer.name, selectedBearer.designation, selectedBearer.photoUrl, true)
 }`}
 />
 </div>

 <div className="text-center mb-6">
 <h3 className="font-serif font-black text-slate-900 text-2xl">
 {selectedBearer.name}
 </h3>
 <span className="text-[10px] font-['Outfit'] font-bold text-slate-500 uppercase tracking-widest mt-1 block">
 {selectedBearer.designation}
 </span>
 </div>

 {/* Edit Form */}
 <div className="flex flex-col gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-['Outfit'] font-black uppercase text-slate-400 tracking-wider pl-1">House Name</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
 <Home className="w-4 h-4 text-slate-400" />
 </div>
 <input
 type="text"
 value={editHouse}
 onChange={(e) => setEditHouse(e.target.value)}
 placeholder="e.g. Veliyath House"
 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 font-medium text-sm transition-all"
 />
 </div>
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-['Outfit'] font-black uppercase text-slate-400 tracking-wider pl-1">Contact Number</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
 <Phone className="w-4 h-4 text-slate-400" />
 </div>
 <input
 type="text"
 value={editPhone}
 onChange={(e) => setEditPhone(e.target.value)}
 placeholder="e.g. +91 94460 12345"
 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 font-mono font-bold text-sm transition-all"
 maxLength={16}
 />
 </div>
 </div>
 </div>

 {/* Modal Actions */}
 <div className="flex gap-3 w-full mt-8">
 <button
 onClick={() => setSelectedBearer(null)}
 className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-['Outfit'] font-black text-[11px] uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={handleSaveInfo}
 disabled={saveStatus === 'saving'}
 className="flex-1 py-3 bg-slate-900 hover:bg-black text-white font-['Outfit'] font-black text-[11px] uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
 >
 {saveStatus === 'saving' ? (
 <span className="animate-pulse">Saving...</span>
 ) : (
 <>
 <Save className="w-3.5 h-3.5" />
 Save
 </>
 )}
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

