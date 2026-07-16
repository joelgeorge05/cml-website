import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Phone, MapPin, Calendar, Heart, Droplets, X, Trash2, Edit2, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BloodDonor } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// Helper to calculate age from DOB
const calculateAge = (dobString?: string) => {
 if (!dobString) return null;
 const today = new Date();
 const birthDate = new Date(dobString);
 let age = today.getFullYear() - birthDate.getFullYear();
 const m = today.getMonth() - birthDate.getMonth();
 if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
 age--;
 }
 return age;
};

const STATUS_OPTIONS = ['Student', 'Employed', 'Unemployed', 'House wife'];

interface BloodDonorsViewProps {
 bloodDonors: BloodDonor[];
 isAdminLoggedIn: boolean;
 currentUser?: { email: string; name: string; role: string } | null;
 onGoToTab: (tab: string) => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodDonorsView({ bloodDonors: initialDonors, isAdminLoggedIn, currentUser }: BloodDonorsViewProps) {
 const [localDonors, setLocalDonors] = useState<BloodDonor[]>([]);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedGroup, setSelectedGroup] = useState<string>('All');
 
 // Modal states
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingDonor, setEditingDonor] = useState<BloodDonor | null>(null);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [toastMessage, setToastMessage] = useState('');
 const [isFormDropdownOpen, setIsFormDropdownOpen] = useState(false);
 const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
 const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
 const [sameAsCommunication, setSameAsCommunication] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const statusDropdownRef = useRef<HTMLDivElement>(null);
 const filterDropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsFormDropdownOpen(false);
 }
 if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
 setIsStatusDropdownOpen(false);
 }
 if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
 setIsFilterDropdownOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const handleSameAddressChange = (checked: boolean) => {
 setSameAsCommunication(checked);
 if (checked) {
 setFormData(prev => ({
 ...prev,
 permanent_address: prev.parish
 }));
 }
 };

 // Form states
 const [formData, setFormData] = useState({
 name: '',
 blood_group: '',
 phone: '',
 alt_phone: '',
 parish: '', // Used as Communication Address
 permanent_address: '',
 house_name: '',
 dob: '',
 employment_status: '',
 employment_address: '',
 last_donated_date: '',
 is_available: true
 });

 useEffect(() => {
 setLocalDonors(initialDonors || []);
 }, [initialDonors]);

 const filteredDonors = useMemo(() => {
  return localDonors.filter(donor => {
  // Role-based visibility check: Shakha Admins can only see donors they created
  const canSee = currentUser?.role !== 'Shakha Admin' || donor.created_by_email === currentUser?.email;
  if (!canSee) return false;

  const matchesSearch = donor?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) || 
  donor?.parish?.toLowerCase()?.includes(searchQuery.toLowerCase());
  const matchesGroup = selectedGroup === 'All' || donor.blood_group === selectedGroup;
  return matchesSearch && matchesGroup;
  });
  }, [localDonors, searchQuery, selectedGroup, currentUser]);

 const showToast = (msg: string) => {
 setToastMessage(msg);
 setTimeout(() => setToastMessage(''), 3000);
 };

 const openAddModal = () => {
 setEditingDonor(null);
 setFormData({ name: '', blood_group: '', phone: '', alt_phone: '', parish: '', permanent_address: '', house_name: '', dob: '', employment_status: '', employment_address: '', last_donated_date: '', is_available: true });
 setSameAsCommunication(false);
 setIsModalOpen(true);
 };

 const openEditModal = (donor: BloodDonor) => {
 setEditingDonor(donor);
 const isSame = !donor.permanent_address || donor.permanent_address === donor.parish;
 setFormData({
 name: donor.name,
 blood_group: donor.blood_group,
 phone: donor.phone,
 alt_phone: donor.alt_phone || '',
 parish: donor.parish,
 house_name: donor.house_name || '',
 permanent_address: donor.permanent_address || (isSame ? donor.parish : ''),
 dob: donor.dob || '',
 employment_status: donor.employment_status || '',
 employment_address: donor.employment_address || '',
 last_donated_date: donor.last_donated_date || '',
 is_available: donor.is_available
 });
 setSameAsCommunication(isSame);
 setIsModalOpen(true);
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);

 try {
 if (editingDonor) {
 const { data, error } = await supabase.from('blood_donors').update({
 ...formData,
 last_donated_date: formData.last_donated_date || null
 }).eq('id', editingDonor.id).select().single();
 if (error) throw error;
 setLocalDonors(prev => prev.map(d => d.id === editingDonor.id ? data : d));
 showToast('Donor updated successfully');
 } else {
 const { data, error } = await supabase.from('blood_donors').insert([{
 ...formData,
 last_donated_date: formData.last_donated_date || null,
 created_by_email: currentUser?.email || null
 }]).select().single();
 if (error) throw error;
 setLocalDonors(prev => [data, ...prev]);
 showToast('Donor added successfully');
 }
 setIsModalOpen(false);
 } catch (err: any) {
 alert('Error: ' + err.message);
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async (id: string) => {
 if (!window.confirm('Are you sure you want to remove this donor?')) return;
 try {
 const { error } = await supabase.from('blood_donors').delete().eq('id', id);
 if (error) throw error;
 setLocalDonors(prev => prev.filter(d => d.id !== id));
 showToast('Donor removed successfully');
 } catch (err: any) {
 alert('Error: ' + err.message);
 }
 };

 const toggleAvailability = async (donor: BloodDonor) => {
 try {
 const newStatus = !donor.is_available;
 const { data, error } = await supabase.from('blood_donors').update({ is_available: newStatus }).eq('id', donor.id).select().single();
 if (error) throw error;
 setLocalDonors(prev => prev.map(d => d.id === donor.id ? data : d));
 } catch (err: any) {
 alert('Error: ' + err.message);
 }
 };

 if (isModalOpen) {
 return (
 <div className="min-h-screen bg-slate-50 pb-24">
 {/* Inline Form Header */}
 <div className="bg-white/95 border-b border-slate-200/50 sticky top-0 z-20 shadow-sm">
 <div className="max-w-3xl mx-auto px-4 py-4 md:py-4.5 flex items-center justify-between relative">
 {/* Spacer for centering */}
 <div className="w-20 sm:w-24 shrink-0"></div>
 
 {/* Centered Title */}
 <div className="text-center flex-grow">
 <h2 className="text-lg md:text-xl font-extrabold font-display text-slate-900 tracking-tight">
 {editingDonor ? 'Edit Donor Details' : 'Add New Donor'}
 </h2>
 <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 hidden xs:block">
 {editingDonor ? 'Update donor information' : 'Register a new blood donor'}
 </p>
 </div>
 
 {/* Cancel Button */}
 <div className="w-20 sm:w-24 flex justify-end shrink-0">
 <button 
 onClick={() => setIsModalOpen(false)} 
 className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm px-3 py-2 rounded-xl transition-all active:scale-95 border border-slate-200/50 shadow-sm"
 >
 <X className="w-3.5 h-3.5 text-slate-500" /> 
 <span>Cancel</span>
 </button>
 </div>
 </div>
 </div>

 {/* Form Container */}
 <div className="max-w-3xl mx-auto px-4 py-8">
 <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col gap-6">
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
 <input
 required
 type="text"
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-slate-900 font-medium"
 placeholder="Enter donor name"
 />
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div ref={dropdownRef} className="relative">
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</label>
 <div 
 onClick={() => setIsFormDropdownOpen(!isFormDropdownOpen)}
 className={`w-full px-4 py-3 sm:py-4 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isFormDropdownOpen ? 'border-rose-500 ring-2 ring-rose-500' : 'border-slate-200'}`}
 >
 <span className={`font-bold ${formData.blood_group ? 'text-rose-600' : 'text-slate-400'}`}>
 {formData.blood_group || 'Select Blood Group'}
 </span>
 <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isFormDropdownOpen ? 'rotate-180 text-rose-500' : ''}`} />
 </div>
 
 {/* Hidden Native Select for Required validation */}
 <select
 required
 value={formData.blood_group}
 onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
 className="opacity-0 absolute pointer-events-none w-full bottom-0 left-0 h-1"
 >
 <option value="" disabled>Select</option>
 {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
 </select>

 <AnimatePresence>
 {isFormDropdownOpen && (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 10 }}
 className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
 >
 <div className="max-h-[240px] overflow-y-auto cml-scrollbar">
 {BLOOD_GROUPS.map(bg => (
 <div
 key={bg}
 onClick={() => {
 setFormData({...formData, blood_group: bg});
 setIsFormDropdownOpen(false);
 }}
 className={`px-4 py-3 cursor-pointer font-bold transition-colors ${formData.blood_group === bg ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50 hover:text-rose-600'}`}
 >
 {bg}
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Availability</label>
 <div className="flex items-center h-[50px] sm:h-[58px] px-4 bg-slate-50 border border-slate-200 rounded-xl">
 <label className="flex items-center gap-3 cursor-pointer w-full">
 <input
 type="checkbox"
 checked={formData.is_available}
 onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
 className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 border-slate-300"
 />
 <span className="font-semibold text-slate-700">{formData.is_available ? 'Available' : 'Hidden'}</span>
 </label>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
 <input
 required
 type="tel"
 value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 font-medium"
 placeholder="e.g. +91 9876543210"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alternative Phone</label>
 <input
 required
 type="tel"
 value={formData.alt_phone}
 onChange={(e) => setFormData({...formData, alt_phone: e.target.value})}
 className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 font-medium"
 placeholder="e.g. +91 9876543211"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Communication Address</label>
 <input
 required
 type="text"
 value={formData.parish}
 onChange={(e) => {
 const val = e.target.value;
 setFormData(prev => ({
 ...prev,
 parish: val,
 permanent_address: sameAsCommunication ? val : prev.permanent_address
 }));
 }}
 className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 font-medium"
 placeholder="e.g. Kaliyar"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">House Name</label>
 <input
 required
 type="text"
 value={formData.house_name}
 onChange={(e) => setFormData({...formData, house_name: e.target.value})}
 className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 font-medium"
 placeholder="e.g. Pulickal House"
 />
 </div>
 </div>

 <div className="flex flex-col gap-4">
 <label className="flex items-center gap-2.5 cursor-pointer w-fit">
 <input
 type="checkbox"
 checked={sameAsCommunication}
 onChange={(e) => handleSameAddressChange(e.target.checked)}
 className="w-4.5 h-4.5 text-rose-600 rounded focus:ring-rose-500 border-slate-300"
 />
 <span className="text-sm font-semibold text-slate-600">Permanent Address is same as Communication Address</span>
 </label>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Permanent Address</label>
 <input
 required
 type="text"
 value={formData.permanent_address}
 disabled={sameAsCommunication}
 onChange={(e) => setFormData({...formData, permanent_address: e.target.value})}
 className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-medium transition-all ${
 sameAsCommunication 
 ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
 : 'bg-slate-50 border-slate-200 text-slate-900'
 }`}
 placeholder={sameAsCommunication ? "Same as Communication Address" : "Enter permanent address"}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
 <input
 required
 type="date"
 value={formData.dob}
 onChange={(e) => setFormData({...formData, dob: e.target.value})}
 className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-700 font-medium"
 />
 </div>

 <div ref={statusDropdownRef} className="relative">
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Status</label>
 <div 
 onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
 className={`w-full px-4 py-3 sm:py-4 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isStatusDropdownOpen ? 'border-rose-500 ring-2 ring-rose-500' : 'border-slate-200'}`}
 >
 <span className={`font-bold ${formData.employment_status ? 'text-slate-900' : 'text-slate-400'}`}>
 {formData.employment_status || 'Select Status'}
 </span>
 <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180 text-rose-500' : ''}`} />
 </div>
 
 <select
 required
 value={formData.employment_status}
 onChange={(e) => setFormData({...formData, employment_status: e.target.value})}
 className="opacity-0 absolute pointer-events-none w-full bottom-0 left-0 h-1"
 >
 <option value="" disabled>Select</option>
 {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
 </select>

 <AnimatePresence>
 {isStatusDropdownOpen && (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 10 }}
 className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
 >
 <div className="max-h-[240px] overflow-y-auto cml-scrollbar">
 {STATUS_OPTIONS.map(status => (
 <div
 key={status}
 onClick={() => {
 setFormData({...formData, employment_status: status});
 setIsStatusDropdownOpen(false);
 }}
 className={`px-4 py-3 cursor-pointer font-bold transition-colors ${formData.employment_status === status ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50 hover:text-rose-600'}`}
 >
 {status}
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>

 {['Student', 'Employed'].includes(formData.employment_status) && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
 {formData.employment_status === 'Student' ? 'School / College Name & Address' : 'Office / Workplace Name & Address'}
 </label>
 <input
 required
 type="text"
 value={formData.employment_address}
 onChange={(e) => setFormData({...formData, employment_address: e.target.value})}
 className="w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 font-medium"
 placeholder={formData.employment_status === 'Student' ? "Enter school/college details" : "Enter office/company details"}
 />
 </motion.div>
 )}


 <div className="pt-6 border-t border-slate-100 mt-2">
 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full sm:w-auto sm:px-12 sm:ml-auto py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
 >
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
 {isSubmitting ? 'Saving...' : (editingDonor ? 'Save Changes' : 'Add Donor')}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-slate-50 pb-24">
 {/* Header & Search */}
 <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
 <div className="max-w-4xl mx-auto px-4 py-4 md:py-5">
 <div className="flex items-center justify-between gap-4 mb-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md shadow-rose-100">
 <Heart className="w-5 h-5 text-white fill-white" />
 </div>
 <div>
 <h1 className="text-xl md:text-2xl font-extrabold font-display text-slate-900 tracking-tight">Pulse</h1>
 <p className="text-xs md:text-sm text-slate-500 hidden xs:block">Find and contact available donors</p>
 </div>
 </div>
 {isAdminLoggedIn && (
 <button
 onClick={openAddModal}
 className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-rose-200/80 transition-all hover:shadow-lg hover:shadow-rose-200 active:scale-95 shrink-0"
 >
 <Plus className="w-4 h-4" />
 <span className="hidden sm:inline">Add Donor</span>
 <span className="sm:hidden">Add</span>
 </button>
 )}
 </div>

 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative flex-grow">
 <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 placeholder="Search by name or address..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none text-base sm:text-sm font-medium transition-all shadow-sm placeholder:text-slate-400 text-slate-800"
 />
 </div>
 
 <div ref={filterDropdownRef} className="relative min-w-[140px]">
 <div 
 onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
 className={`py-2.5 px-4 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-sm select-none ${
 isFilterDropdownOpen ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200/80'
 }`}
 >
 <span className="text-sm font-bold text-slate-700">
 {selectedGroup === 'All' ? 'All Groups' : selectedGroup}
 </span>
 <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isFilterDropdownOpen ? 'rotate-180 text-rose-500' : ''}`} />
 </div>
 
 <AnimatePresence>
 {isFilterDropdownOpen && (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 10 }}
 className="absolute top-[calc(100%+8px)] right-0 w-full min-w-[140px] bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden"
 >
 <div className="max-h-[240px] overflow-y-auto cml-scrollbar">
 <div
 onClick={() => {
 setSelectedGroup('All');
 setIsFilterDropdownOpen(false);
 }}
 className={`px-4 py-2.5 cursor-pointer font-bold text-sm transition-colors ${
 selectedGroup === 'All' ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50 hover:text-rose-600'
 }`}
 >
 All Groups
 </div>
 {BLOOD_GROUPS.map(bg => (
 <div
 key={bg}
 onClick={() => {
 setSelectedGroup(bg);
 setIsFilterDropdownOpen(false);
 }}
 className={`px-4 py-2.5 cursor-pointer font-bold text-sm transition-colors ${
 selectedGroup === bg ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50 hover:text-rose-600'
 }`}
 >
 {bg}
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 </div>

 {/* Donors List */}
 <div className="max-w-4xl mx-auto px-4 py-6">
 {filteredDonors.length === 0 ? (
 <div className="text-center py-20">
 <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-4" />
 <h3 className="text-lg font-bold text-slate-700">No donors found</h3>
 <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <AnimatePresence>
 {filteredDonors.map((donor) => (
 <motion.div
 layout
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 key={donor.id}
 className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
 >
 <div className="flex justify-between items-start mb-3 gap-3">
 <div className="min-w-0 flex-1">
 <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{donor.name}</h3>
 <div className="flex flex-col gap-1.5 sm:gap-2 mt-2">
 <div className="flex items-start gap-2 text-slate-600">
 <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
 <div className="flex flex-col">
 {donor.permanent_address && donor.permanent_address !== donor.parish ? (
 <>
 <span className="text-sm font-medium"><span className="text-slate-400 text-xs font-bold mr-1">CONTACT:</span>{donor.parish}</span>
 <span className="text-xs text-slate-500 font-medium mt-0.5"><span className="text-slate-400 text-[10px] font-bold mr-1">PERMANENT:</span>{donor.permanent_address}</span>
 </>
 ) : (
 <span className="text-sm font-medium">{donor.parish}</span>
 )}
 </div>
 </div>
 {donor.house_name && (
 <div className="flex items-center gap-2 text-slate-500 pl-6">
 <span className="text-xs">House: {donor.house_name}</span>
 </div>
 )}
 {donor.dob && (
 <div className="flex items-center gap-2 text-slate-500 pl-6">
 <span className="text-xs">
 DOB: {new Date(donor.dob).toLocaleDateString()} 
 {calculateAge(donor.dob) !== null && ` (Age: ${calculateAge(donor.dob)})`}
 </span>
 </div>
 )}
 {donor.employment_status && (
 <div className="flex items-center gap-2 text-slate-500 pl-6">
 <span className="text-xs">Status: {donor.employment_status}</span>
 </div>
 )}
 {donor.employment_address && (
 <div className="flex items-center gap-2 text-slate-500 pl-6">
 <span className="text-xs">
 {donor.employment_status === 'Student' ? 'Institution: ' : 'Workplace: '}
 {donor.employment_address}
 </span>
 </div>
 )}
 
 <div className="flex items-center gap-2 text-slate-600">
 <Phone className="w-4 h-4 shrink-0 text-slate-400" />
 <a href={`tel:${donor.phone}`} className="text-sm font-medium hover:text-rose-600 transition-colors">
 {donor.phone}
 </a>
 </div>
 {donor.alt_phone && (
 <div className="flex items-center gap-2 text-slate-500 pl-6">
 <a href={`tel:${donor.alt_phone}`} className="text-xs hover:text-rose-600 transition-colors">
 Alt: {donor.alt_phone}
 </a>
 </div>
 )}
 </div>
 </div>
 <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center font-black text-rose-600 text-lg border border-rose-100 shrink-0 shadow-inner">
 {donor.blood_group}
 </div>
 </div>

 <div className="flex flex-col gap-2 mt-4">
 {donor.last_donated_date && (
 <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
 <Calendar className="w-3.5 h-3.5" />
 <span>Last donated: {new Date(donor.last_donated_date).toLocaleDateString()}</span>
 </div>
 )}
 </div>

 <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="relative flex h-2.5 w-2.5">
 {donor.is_available && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
 <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${donor.is_available ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
 </span>
 <span className={`text-xs font-bold uppercase tracking-wider ${donor.is_available ? 'text-emerald-600' : 'text-slate-400'}`}>
 {donor.is_available ? 'Available' : 'Unavailable'}
 </span>
 </div>

 {(isAdminLoggedIn && (
  (currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Blood Donor Admin') ||
  (currentUser?.role === 'Shakha Admin' && donor.created_by_email === currentUser?.email)
  )) && (
 <div className="flex items-center gap-1">
 <button onClick={() => toggleAvailability(donor)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Toggle Status">
 <CheckCircle2 className="w-4 h-4" />
 </button>
 <button onClick={() => openEditModal(donor)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
 <Edit2 className="w-4 h-4" />
 </button>
 <button onClick={() => handleDelete(donor.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 )}
 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 )}
 </div>

 {/* FAB for Admin */}


 {/* Toast Notification */}
 <AnimatePresence>
 {toastMessage && (
 <motion.div
 initial={{ opacity: 0, y: 50 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 50 }}
 className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl flex items-center gap-2"
 >
 <CheckCircle2 className="w-4 h-4 text-emerald-400" />
 {toastMessage}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}

