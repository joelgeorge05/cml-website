/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Heart, Award, MapPin, Calendar, Compass, ExternalLink, Mail, Phone, Sparkles } from 'lucide-react';
import { PortalSettings } from '../types';
import cmlLogoImg from '../assets/images/logo.webp';
import InstallPwaButton from './InstallPwaButton';

interface FooterProps {
 setActiveTab: (tab: string) => void;
 settings: PortalSettings;
}

export default function Footer({ setActiveTab, settings }: FooterProps) {
 const currentYear = new Date().getFullYear();

 return (
 <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 font-sans mt-auto">
 {/* Upper footer */}
 <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 
 {/* Brand details */}
 <div className="flex flex-col gap-4 text-left">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
 <h4 className="font-sans font-bold text-slate-100 text-base tracking-wide">
 CML KALIYAR MEKHALA
 </h4>
 </div>
 <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
 Cherupushpa Mission League is the largest lay missionary association in Asia, dedicated to spiritual renewal and missionary zeal.
 </p>
 <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold pt-1">
 <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
 <span>Motto: Love • Sacrifice • Service • Suffering</span>
 </div>
 {/* Social Media Links */}
 <div className="flex items-center gap-3 pt-1">
 {/* Facebook */}
 <a
 href="https://www.facebook.com/share/1B72qUQ7n8/"
 target="_blank"
 rel="noopener noreferrer"
 title="CML on Facebook"
 className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700/50 hover:border-blue-500"
 >
 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
 </svg>
 </a>
 {/* Instagram */}
 <a
 href="https://www.instagram.com/cml_kaliyar_mekhala?igsh=NzR0Yjdza2lpanBl"
 target="_blank"
 rel="noopener noreferrer"
 title="CML on Instagram"
 className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-gradient-to-br hover:from-purple-600 hover:via-rose-500 hover:to-amber-400 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700/50 hover:border-rose-400"
 >
 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
 </svg>
 </a>
 {/* Threads */}
 <a
 href="https://www.threads.com/@cml_kaliyar_mekhala"
 target="_blank"
 rel="noopener noreferrer"
 title="CML on Threads"
 className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-600 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700/50 hover:border-slate-400"
 >
 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.028-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 012.591.315l-.1-.521c-.243-1.503-.985-2.274-2.205-2.293h-.03c-.75 0-1.477.29-2.046.82l-1.405-1.492C10.866 6.14 12.02 5.67 13.28 5.67h.068c2.203.033 3.812 1.366 4.268 3.517l.647 3.396c.3.142.59.295.87.462 1.354.794 2.34 1.927 2.852 3.28.749 1.97.763 5.037-1.744 7.46C18.522 23.268 15.975 24 12.186 24zm-.157-8.928c-.921.05-1.669.297-2.16.715-.39.336-.57.739-.54 1.197.056.974 1.09 1.558 2.46 1.482.967-.053 1.743-.39 2.31-1.003.545-.59.878-1.43 1-2.527a11.57 11.57 0 00-3.07.136z"/>
 </svg>
 </a>
 </div>
 </div>

 {/* Quick links */}
 <div className="flex flex-col gap-3 text-left">
 <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Useful Navs</h4>
 <ul className="flex flex-col gap-2 text-xs">
 <li>
 <button onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-rose-400 transition flex items-center gap-1.5">
 <Compass className="w-3 h-3" /> Home Overview
 </button>
 </li>
 <li>
 <button onClick={() => { setActiveTab('bearers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-rose-400 transition flex items-center gap-1.5">
 <ShieldCheck className="w-3 h-3" /> Active Office Bearers
 </button>
 </li>
 <li>
 <button onClick={() => { setActiveTab('units'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-rose-400 transition flex items-center gap-1.5">
 <MapPin className="w-3 h-3" /> Find Parish Units
 </button>
 </li>
 </ul>
 </div>

 {/* Resources / Links */}
 <div className="flex flex-col gap-3 text-left">
 <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Resources</h4>
 <ul className="flex flex-col gap-2 text-xs">
 <li>
 <a href="https://cml-kothamangalam.ac-inc.in/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition flex items-center gap-1.5">
 <ExternalLink className="w-3 h-3" /> Diocese Website
 </a>
 </li>
 <li>
 <button onClick={() => { setActiveTab('downloads'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-rose-400 transition flex items-center gap-1.5">
 <ExternalLink className="w-3 h-3" /> Diocesan Circulars
 </button>
 </li>
 <li>
 <button onClick={() => { setActiveTab('downloads'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-rose-400 transition flex items-center gap-1.5">
 <ExternalLink className="w-3 h-3" /> Download Form templates
 </button>
 </li>
 <li>
 <button onClick={() => { setActiveTab('gallery'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-rose-400 transition flex items-center gap-1.5">
 <ExternalLink className="w-3 h-3" /> Historical Photo Albums
 </button>
 </li>
 </ul>
 </div>

 {/* Support contacts */}
 <div className="flex flex-col gap-3 text-left">
 <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Contact Mekhala</h4>
 <div className="flex flex-col gap-1 text-xs mb-1">
 <span className="text-slate-400 flex items-center gap-1.5 font-medium">
 <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
 <span>Office Address:</span>
 </span>
 <p className="text-slate-500 leading-relaxed pl-5">
 Cherupushpa Mission League Kaliyar Mekhala Office<br />
 St Ritas Forane Church Kaliyar - 685607
 </p>
 </div>
 <div className="flex flex-col gap-1 text-xs">
 <span className="text-slate-400 flex items-center gap-1.5 font-medium">
 <Phone className="w-3.5 h-3.5 text-amber-500/90 shrink-0" />
 <span>Support Desk:</span>
 </span>
 <a href={`tel:${settings.supportDesk}`} className="text-amber-500 font-mono hover:underline pl-5">{settings.supportDesk}</a>
 </div>
 <div className="flex flex-col gap-1 text-xs mt-1">
 <span className="text-slate-400 flex items-center gap-1.5 font-medium">
 <Mail className="w-3.5 h-3.5 text-rose-500/90 shrink-0" />
 <span>Email:</span>
 </span>
 <a href={`mailto:${settings.email}`} className="text-rose-400 font-mono hover:underline text-xs pl-5">{settings.email}</a>
 </div>
 </div>
 </div>

 {/* Sub-footer banner */}
 <div className="w-full border-t border-slate-900 bg-slate-950 py-6 px-4">
 <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
 
 <div className="flex flex-col gap-2.5 text-center md:text-left max-w-xl">
 <p className="text-slate-400 leading-relaxed">
 © 2026 Cherupushpa Mission League Kaliyar Mekhala.
 <span className="block mt-2 text-[11px] font-semibold tracking-wide text-slate-400/95 border-l-2 border-rose-500/50 pl-2.5 transition-colors duration-200 hover:text-slate-300">
 Proudly registered under Syro Malabar Catholic Diocese Kothamangalam
 </span>
 </p>
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[10px] text-slate-500">
 <a
 href="https://www.instagram.com/j_oelgeorge?igsh=MWZ3OWR5dDA4OG5qeA=="
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-400 font-mono text-[10.5px] transition-colors duration-150 font-medium"
 >

 Dev Joel
 </a>
 <span className="text-slate-800">•</span>
 <button 
 onClick={() => setActiveTab('admin')} 
 className="inline-flex items-center gap-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 hover:text-white px-2 py-0.5 rounded border border-rose-900/30 hover:border-rose-800/40 transition-all duration-150 cursor-pointer text-[9.5px] uppercase font-bold tracking-wider select-none shrink-0"
 >
 <ShieldCheck className="w-3 h-3 text-rose-500" />
 <span>Admin Console</span>
 </button>
 <InstallPwaButton className="!px-2 !py-0.5 !text-[9.5px] !bg-amber-950/20 hover:!bg-amber-950/40 !text-amber-300 hover:!text-white !rounded !border !border-amber-900/30 hover:!border-amber-800/40 !shadow-none" />
 </div>
 </div>

 <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
 <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/5 via-slate-900/75 to-amber-500/5 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.06)] relative overflow-hidden group select-none ">
 {/* Shimmer sweep reflection on hover */}
 <div className="absolute inset-0 w-[40px] h-full bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ animation: 'shimmer 4s infinite linear' }} />
 
 {/* Pulsing Marker */}


 {/* Logo Image with Metallic Light-Rim Gradient wrapper */}
 <div className="rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-rose-500 p-[1px] shadow-[0_0_6px_rgba(251,191,36,0.25)] shrink-0">
 <img loading="lazy" 
 src={cmlLogoImg} 
 alt="CML Logo" 
 className="w-4 h-4 rounded-full object-cover bg-slate-900/90" 
 referrerPolicy="no-referrer"
 />
 </div>

 {/* Romanized Malayalam Motto with Vertical Dividers */}
 <div className="flex items-center gap-2 text-[9px] xs:text-[10px] font-sans font-black uppercase tracking-wider relative z-10 drop-shadow-[0_0_3px_rgba(245,158,11,0.2)]">
 <span className="text-amber-300 hover:text-white transition-colors duration-300 cursor-default">Sneham</span>
 <span className="w-[1.5px] h-2.5 bg-gradient-to-b from-transparent via-rose-500/35 to-transparent self-center mx-0.5"></span>
 <span className="text-amber-300 hover:text-white transition-colors duration-300 cursor-default">Thyagam</span>
 <span className="w-[1.5px] h-2.5 bg-gradient-to-b from-transparent via-rose-500/35 to-transparent self-center mx-0.5"></span>
 <span className="text-amber-300 hover:text-white transition-colors duration-300 cursor-default">Sevanam</span>
 <span className="w-[1.5px] h-2.5 bg-gradient-to-b from-transparent via-rose-500/35 to-transparent self-center mx-0.5"></span>
 <span className="text-amber-300 hover:text-white transition-colors duration-300 cursor-default">Sahanam</span>
 </div>
 </div>
 </div>

 </div>
 </div>
 </footer>
 );
}

