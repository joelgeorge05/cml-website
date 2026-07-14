import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { Droplet, Search, MapPin, Phone, Calendar, Heart, ShieldAlert, Activity, CheckCircle2, XCircle, X, User, Map, Briefcase } from 'lucide-react';

export default function AdminBloodDonors() {
 const [donors, setDonors] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedShakha, setSelectedShakha] = useState('All');
 const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
 const [selectedDonor, setSelectedDonor] = useState<any | null>(null);
 
 const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

 useEffect(() => {
 fetchDonors();
 }, []);

 const fetchDonors = async () => {
 setIsLoading(true);
 try {
 const { data, error } = await supabase.from('blood_donors').select('*').order('created_at', { ascending: false });
 if (error) throw error;
 setDonors(data || []);
 } catch (err) {
 console.error("Error fetching blood donors:", err);
 } finally {
 setIsLoading(false);
 }
 };

 const shakhaCounts = useMemo(() => {
 const counts: Record<string, number> = {};
 donors.forEach(donor => {
 const parish = donor.parish || 'Unknown';
 counts[parish] = (counts[parish] || 0) + 1;
 });
 return Object.entries(counts).sort((a, b) => b[1] - a[1]);
 }, [donors]);

 const filteredDonors = useMemo(() => {
 return donors.filter(donor => {
 const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 donor.blood_group.toLowerCase().includes(searchQuery.toLowerCase()) ||
 donor.phone.includes(searchQuery);
 const matchesShakha = selectedShakha === 'All' || donor.parish === selectedShakha;
 const matchesBloodGroup = selectedBloodGroup === 'All' || donor.blood_group === selectedBloodGroup;
 return matchesSearch && matchesShakha && matchesBloodGroup;
 });
 }, [donors, searchQuery, selectedShakha, selectedBloodGroup]);

 const allShakhas = ['All', ...Array.from(new Set(donors.map(d => d.parish)))].filter(Boolean).sort();

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 
 {/* Header & Stats */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-1 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl p-6 text-white shadow-xl shadow-rose-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2.5 bg-white/20 rounded-xl">
 <Droplet className="w-6 h-6 text-white" />
 </div>
 <div>
 <h2 className="text-xl font-bold">Total Donors</h2>
 <p className="text-rose-100 text-sm">Across all shakhas</p>
 </div>
 </div>
 <div className="text-5xl font-black mt-2">
 {donors.length}
 </div>
 <p className="mt-4 text-sm text-rose-100 flex items-center gap-2">
 <Activity className="w-4 h-4" /> Actively managed directory
 </p>
 </div>

 <div className="lg:col-span-2 bg-white/70 rounded-3xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/5 to-orange-500/5 blur-3xl -z-10 group-hover:from-rose-500/10 transition-colors duration-500" />
 <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
 <MapPin className="w-5 h-5 text-rose-500" />
 Registrations by Shakha
 </h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
 {shakhaCounts.length === 0 ? (
 <div className="col-span-full py-4 text-center">
 <p className="text-slate-500 text-sm font-medium">No registrations yet.</p>
 </div>
 ) : (
 shakhaCounts.map(([shakha, count]) => {
 const maxCount = Math.max(...shakhaCounts.map(s => s[1]));
 const percentage = Math.max(5, (count / maxCount) * 100);
 return (
 <div key={shakha} className="flex flex-col gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
 <div className="flex items-center justify-between gap-2">
 <span className="text-xs font-bold text-slate-700 truncate">{shakha}</span>
 <span className="bg-gradient-to-br from-rose-500 to-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
 {count}
 </span>
 </div>
 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
 <div 
 className="bg-gradient-to-r from-rose-400 to-rose-500 h-full rounded-full" 
 style={{ width: `${percentage}%` }}
 />
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 </div>

 {/* Main Table Section */}
 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
 <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
 <Heart className="w-5 h-5 text-rose-500" />
 Donor Directory
 </h3>
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative">
 <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 placeholder="Search donors..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 w-full sm:w-64"
 />
 </div>
 <select
 value={selectedBloodGroup}
 onChange={(e) => setSelectedBloodGroup(e.target.value)}
 className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-slate-700 font-medium bg-white"
 >
 <option value="All">All Blood Groups</option>
 {BLOOD_GROUPS.map(bg => (
 <option key={bg} value={bg}>{bg}</option>
 ))}
 </select>
 <select
 value={selectedShakha}
 onChange={(e) => setSelectedShakha(e.target.value)}
 className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-slate-700 font-medium bg-white"
 >
 {allShakhas.map(s => (
 <option key={s} value={s}>{s === 'All' ? 'All Shakhas' : s}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="overflow-x-auto">
 {isLoading ? (
 <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
 <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
 Loading donors...
 </div>
 ) : filteredDonors.length === 0 ? (
 <div className="p-8 text-center text-slate-500">
 No donors found matching your criteria.
 </div>
 ) : (
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
 <th className="px-6 py-4 font-semibold">Name & Blood Group</th>
 <th className="px-6 py-4 font-semibold">Contact Info</th>
 <th className="px-6 py-4 font-semibold">Parish / Address</th>
 <th className="px-6 py-4 font-semibold text-center">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {filteredDonors.map((donor) => (
 <tr key={donor.id} onClick={() => setSelectedDonor(donor)} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold border border-rose-100">
 {donor.blood_group}
 </div>
 <div>
 <div className="font-bold text-slate-800">{donor.name}</div>
 <div className="text-xs text-slate-500 mt-0.5">
 {donor.dob ? `DOB: ${new Date(donor.dob).toLocaleDateString('en-GB')}` : 'No DOB'}
 </div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
 <Phone className="w-3.5 h-3.5 text-slate-400" />
 {donor.phone}
 </div>
 {donor.alt_phone && (
 <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
 <Phone className="w-3 h-3" />
 {donor.alt_phone}
 </div>
 )}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-start gap-2 text-sm text-slate-700">
 <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
 <div>
 <div className="font-semibold">{donor.parish}</div>
 {donor.house_name && <div className="text-xs text-slate-500 mt-0.5"><span className="text-[10px] font-bold text-slate-400 mr-1">HOUSE:</span>{donor.house_name}</div>}
 {donor.permanent_address && donor.permanent_address !== donor.parish && <div className="text-xs text-slate-500 mt-0.5"><span className="text-[10px] font-bold text-slate-400 mr-1">PERMANENT:</span>{donor.permanent_address}</div>}
 {donor.employment_status && <div className="text-xs text-slate-500 mt-0.5"><span className="text-[10px] font-bold text-slate-400 mr-1">EMPLOYMENT:</span>{donor.employment_status} {donor.employment_address && `(${donor.employment_address})`}</div>}
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex flex-col items-center gap-2">
 {donor.is_available ? (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
 <CheckCircle2 className="w-3.5 h-3.5" /> Available
 </span>
 ) : (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
 <XCircle className="w-3.5 h-3.5" /> Unavailable
 </span>
 )}
 {donor.last_donated_date && (
 <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1">
 <Calendar className="w-3 h-3" /> 
 {new Date(donor.last_donated_date).toLocaleDateString('en-GB')}
 </span>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </div>

 {/* Donor Details Modal */}
 {selectedDonor && createPortal(
 <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 animate-in fade-in duration-200">
 <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 animate-in zoom-in-95 duration-300">
 {/* Modal Header */}
 <div className="relative flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white/50">
 <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl -z-10 rounded-full" />
 <div className="flex items-center gap-3 z-10">
 <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-rose-200/50 border border-rose-400/20">
 {selectedDonor.blood_group}
 </div>
 <div className="flex flex-col gap-0.5 sm:gap-1">
 <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{selectedDonor.name}</h3>
 <div className="flex items-center gap-2">
 {selectedDonor.is_available ? (
 <span className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-widest bg-emerald-100/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-200/50 shadow-sm">
 <CheckCircle2 className="w-3.5 h-3.5" /> Available to Donate
 </span>
 ) : (
 <span className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-slate-200 shadow-sm">
 <XCircle className="w-3.5 h-3.5" /> Unavailable
 </span>
 )}
 </div>
 </div>
 </div>
 <button
 onClick={() => setSelectedDonor(null)}
 className="p-2 sm:p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 active:scale-95 z-10"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Modal Body */}
 <div className="p-3 sm:p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 relative z-10">
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
 <div className="space-y-3">
 {/* Contact Group */}
 <div className="flex flex-col gap-2">
 <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
 <div className="p-1.5 bg-rose-50 rounded-md"><Phone className="w-2.5 h-2.5" /></div> Contact Information
 </h4>
 <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1 hover:shadow-md transition-shadow">
 <div className="text-sm font-bold text-slate-800">{selectedDonor.phone}</div>
 {selectedDonor.alt_phone && (
 <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
 <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">ALT</span> {selectedDonor.alt_phone}
 </div>
 )}
 </div>
 </div>

 {/* Personal Group */}
 <div className="flex flex-col gap-2">
 <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
 <div className="p-1.5 bg-rose-50 rounded-md"><User className="w-2.5 h-2.5" /></div> Personal Details
 </h4>
 <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
 <div>
 <span className="text-[9px] font-bold text-slate-400 block mb-0.5">DATE OF BIRTH</span>
 <span className="text-sm font-semibold text-slate-700">{selectedDonor.dob ? new Date(selectedDonor.dob).toLocaleDateString('en-GB') : 'Not Provided'}</span>
 </div>
 <div className="h-px w-full bg-slate-50" />
 <div>
 <span className="text-[9px] font-bold text-slate-400 block mb-0.5">LAST DONATED</span>
 <span className="text-sm font-semibold text-slate-700">{selectedDonor.last_donated_date ? new Date(selectedDonor.last_donated_date).toLocaleDateString('en-GB') : 'Never / Unknown'}</span>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-3">
 {/* Location Group */}
 <div className="flex flex-col gap-2">
 <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
 <div className="p-1.5 bg-rose-50 rounded-md"><Map className="w-2.5 h-2.5" /></div> Location
 </h4>
 <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
 <div>
 <span className="text-[9px] font-bold text-slate-400 block mb-0.5">PARISH (SHAKHA)</span>
 <span className="text-sm font-bold text-slate-800">{selectedDonor.parish || 'Unknown'}</span>
 </div>
 {selectedDonor.house_name && (
 <>
 <div className="h-px w-full bg-slate-50" />
 <div>
 <span className="text-[9px] font-bold text-slate-400 block mb-0.5">HOUSE NAME</span>
 <span className="text-sm font-semibold text-slate-700">{selectedDonor.house_name}</span>
 </div>
 </>
 )}
 {selectedDonor.permanent_address && (
 <>
 <div className="h-px w-full bg-slate-50" />
 <div>
 <span className="text-[9px] font-bold text-slate-400 block mb-0.5">PERMANENT ADDRESS</span>
 <span className="text-sm font-medium text-slate-600 leading-snug">{selectedDonor.permanent_address}</span>
 </div>
 </>
 )}
 </div>
 </div>

 {/* Profession Group */}
 {selectedDonor.employment_status && (
 <div className="flex flex-col gap-2">
 <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
 <div className="p-1.5 bg-rose-50 rounded-md"><Briefcase className="w-2.5 h-2.5" /></div> Profession
 </h4>
 <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
 <div>
 <span className="text-[9px] font-bold text-slate-400 block mb-0.5">STATUS / JOB</span>
 <span className="text-sm font-semibold text-slate-700">{selectedDonor.employment_status}</span>
 </div>
 {selectedDonor.employment_address && (
 <>
 <div className="h-px w-full bg-slate-50" />
 <div>
 <span className="text-[9px] font-bold text-slate-400 block mb-0.5">WORK ADDRESS</span>
 <span className="text-xs font-medium text-slate-600 leading-snug">{selectedDonor.employment_address}</span>
 </div>
 </>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 
 <div className="p-3 sm:p-4 border-t border-slate-100/60 bg-slate-50/50 flex justify-end">
 <button 
 onClick={() => setSelectedDonor(null)}
 className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-slate-200"
 >
 Close Profile
 </button>
 </div>
 </div>
 </div>,
 document.body
 )}
 </div>
 );
}
