import React from 'react';
import { User, Phone, MapPin } from 'lucide-react';
import { ParishUnit } from '../types';
import { motion } from 'motion/react';

interface UnitsViewProps {
 units: ParishUnit[];
 dbData?: any;
 onSaveDatabase?: (updatedData: any, action: string, target: string) => Promise<boolean>;
}

export default function UnitsView({ units }: UnitsViewProps) {
 console.log('UnitsView rendered with units:', units);
 return (
 <div className="w-full bg-slate-50 min-h-screen pt-4 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
 {/* Ambient background orbs for premium feel - hidden on mobile to prevent scroll lag */}
 <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-rose-400/10 rounded-full blur-[100px] pointer-events-none" />
 <div className="hidden md:block absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)] pointer-events-none" />

 <div className="max-w-7xl mx-auto flex flex-col gap-4 text-left relative z-10">
 
 {/* Title Presentation */}
 <div className="flex flex-col items-center text-center gap-3 max-w-4xl mx-auto mt-1">


 <motion.h2 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="font-cinzel font-black text-5xl sm:text-6xl md:text-7xl text-slate-900 tracking-wide leading-tight drop-shadow-sm"
 >
 Shakha <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700">Directory</span>
 </motion.h2>

 {/* Elegant Divider */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.2 }}
 className="flex items-center justify-center w-full max-w-xs mt-1 opacity-80 gap-3"
 >
 <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
 <div className="w-1.5 h-1.5 rotate-45 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
 <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
 </motion.div>
 </div>

 {/* Directory Card Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 items-stretch mt-1">
 {units.length === 0 ? (
 <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
 <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
 <p className="text-slate-400 font-medium text-sm">No parish units available.</p>
 </div>
 ) : (
 units.map((un, idx) => {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "100px" }}
 transition={{ duration: 0.4 }}
 key={un.id}
 className="bg-white/70 rounded-[32px] border border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.04)] flex flex-col group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 text-left"
 >
 {/* Card Cover Picture */}
 <div role="img" aria-label={un.name} className="h-48 rounded-t-[32px] bg-slate-100 relative overflow-hidden flex items-center justify-center">
 {/* Subtle gradient just for the top badge visibility */}
 <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-10" />
 {/* Static placeholder shown while image loads */}
 <div className="absolute inset-0 bg-slate-200 z-0" />
 <img
 src={un.bgPhoto}
 alt={un.name}
 loading={idx < 2 ? "eager" : "lazy"}
 decoding="async"
 className={`w-full h-full absolute inset-0 z-0 transition-transform duration-700 transform-gpu ${
 un.name.includes('Koduvely') ? 'object-cover object-top scale-100 group-hover:scale-110' :
 un.name.includes('Mundanmudy') ? 'object-cover object-bottom scale-125 group-hover:scale-150' :
 un.name.includes('Thennathoor') ? 'object-cover object-[center_60%] scale-100 group-hover:scale-105' :
 'object-cover object-center scale-100 group-hover:scale-110'
 }`}
 />
 
 <div className="absolute top-4 right-4 z-20">
 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/50 border border-white/10 rounded-full text-[9px] uppercase font-bold tracking-widest text-white shadow-lg">
 {un.patronSaint}
 </span>
 </div>
 </div>

 {/* Elegant Readonly Contact View */}
 <div className="p-6 rounded-b-[32px] flex flex-col gap-6 bg-gradient-to-b from-white/40 to-slate-50/40">
 
 {/* Unit Title Block */}
 <div className="flex flex-col gap-2.5">
 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/50 border border-amber-200/60 rounded-md w-fit">
 <MapPin className="w-3 h-3 text-amber-600" />
 <span className="text-[9px] font-sans font-black tracking-widest text-amber-700 uppercase">Unit</span>
 </div>
 <h4 className="font-serif font-bold text-lg text-slate-800 leading-tight" title={un.name}>
 {un.name}
 </h4>
 </div>

 <div className="h-px w-full bg-gradient-to-r from-slate-200/80 via-slate-200/80 to-transparent" />

  {/* Leader List */}
  <div className="flex flex-col gap-3">
  
  {/* CML Director Section */}
  <div className="relative overflow-hidden flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-rose-50/40 to-transparent border border-rose-100/60 hover:border-rose-200 hover:shadow-md hover:-translate-y-0.5 transition-all group/leader cursor-default">
  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-rose-600 opacity-0 group-hover/leader:opacity-100 transition-opacity" />
  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-rose-100 text-rose-500 flex items-center justify-center shrink-0 group-hover/leader:scale-110 transition-transform">
  <User className="w-4 h-4" />
  </div>
  <div className="flex-1 flex flex-col min-w-0 z-10">
  <label className="text-[9px] uppercase font-bold tracking-widest text-rose-500/80 mb-0.5">Director</label>
  <div className="text-[13px] font-bold text-slate-800 leading-tight">
  {un.directorName || <span className="text-slate-400 italic font-normal">Not Assigned</span>}
  </div>
  {un.directorPhone && (
  <div className="text-[11px] font-medium text-slate-500 mt-0.5 tracking-wide">
  {un.directorPhone}
  </div>
  )}
  </div>
  {un.directorPhone && (
  <a
  href={`tel:${un.directorPhone}`}
  className="w-8 h-8 rounded-full bg-white shadow-sm border border-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shrink-0 z-10"
  >
  <Phone className="w-3.5 h-3.5" />
  </a>
  )}
  </div>

  {/* CML Joint Director Section */}
  <div className="relative overflow-hidden flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-50/40 to-transparent border border-indigo-100/60 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all group/leader cursor-default">
  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-600 opacity-0 group-hover/leader:opacity-100 transition-opacity" />
  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-indigo-100 text-indigo-500 flex items-center justify-center shrink-0 group-hover/leader:scale-110 transition-transform">
  <User className="w-4 h-4" />
  </div>
  <div className="flex-1 flex flex-col min-w-0 z-10">
  <label className="text-[9px] uppercase font-bold tracking-widest text-indigo-500/80 mb-0.5">Joint Director</label>
  <div className="text-[13px] font-bold text-slate-800 leading-tight">
  {un.jointDirectorName || <span className="text-slate-400 italic font-normal">Not Assigned</span>}
  </div>
  {un.jointDirectorPhone && (
  <div className="text-[11px] font-medium text-slate-500 mt-0.5 tracking-wide">
  {un.jointDirectorPhone}
  </div>
  )}
  </div>
  {un.jointDirectorPhone && (
  <a
  href={`tel:${un.jointDirectorPhone}`}
  className="w-8 h-8 rounded-full bg-white shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors shrink-0 z-10"
  >
  <Phone className="w-3.5 h-3.5" />
  </a>
  )}
  </div>

  {/* CML President Section */}
  <div className="relative overflow-hidden flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-50/40 to-transparent border border-amber-100/60 hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 transition-all group/leader cursor-default">
  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600 opacity-0 group-hover/leader:opacity-100 transition-opacity" />
  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-amber-100 text-amber-500 flex items-center justify-center shrink-0 group-hover/leader:scale-110 transition-transform">
  <User className="w-4 h-4" />
  </div>
  <div className="flex-1 flex flex-col min-w-0 z-10">
  <label className="text-[9px] uppercase font-bold tracking-widest text-amber-500/80 mb-0.5">President</label>
  <div className="text-[13px] font-bold text-slate-800 leading-tight">
  {un.presidentName || <span className="text-slate-400 italic font-normal">Not Assigned</span>}
  </div>
  {un.presidentPhone && (
  <div className="text-[11px] font-medium text-slate-500 mt-0.5 tracking-wide">
  {un.presidentPhone}
  </div>
  )}
  </div>
  {un.presidentPhone && (
  <a
  href={`tel:${un.presidentPhone}`}
  className="w-8 h-8 rounded-full bg-white shadow-sm border border-amber-100 flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-white transition-colors shrink-0 z-10"
  >
  <Phone className="w-3.5 h-3.5" />
  </a>
  )}
  </div>
  </div>

 </div>
 </motion.div>
 );
 })
 )}
 </div>
 </div>
 </div>
 );
}
