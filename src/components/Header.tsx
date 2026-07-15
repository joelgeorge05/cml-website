/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, Mail, Menu, X, ShieldAlert, Award, BookOpen, Sparkles, PenTool, Star, Instagram, Home, Users, MapPin, History, Image, Download, Shield, Bell, Heart, LogOut, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { Announcement, PortalSettings } from '../types';

import cmlLogoImg from '../assets/images/logo.webp';
import thereseImg from '../assets/images/st_therese.webp';
import communityEmpowermentImg from '../assets/images/community_empowerment.webp';
import holyWritLogoImg from '../assets/images/holy_writ_media.webp';
import InstallPwaButton from './InstallPwaButton';

interface HeaderProps {
 activeTab: string;
 setActiveTab: (tab: string) => void;
 settings: PortalSettings;
 announcements: Announcement[];
 isAdminLoggedIn: boolean;
 currentUser?: any;
 onLogout: () => void;
 onOpenAdmin: () => void;
 isOfflineFallback?: boolean;
}

export default function Header({
 activeTab,
 setActiveTab,
 settings,
 announcements,
 isAdminLoggedIn,
 currentUser,
 onLogout,
 onOpenAdmin,
 isOfflineFallback
}: HeaderProps) {
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [scrollIndex, setScrollIndex] = useState(0);

 const showKalolsavam = settings?.showKalolsavam !== false;
 const showSahithyamalsaram = settings?.showSahithyamalsaram !== false;
 const showChosen = settings?.showChosen !== false;

 // Rotate scrolling announcements in header banner
 const urgentAnnouncements = announcements.filter(a => a.type === 'urgent');
 const scrollItems = urgentAnnouncements.length > 0 ? urgentAnnouncements : announcements;

 // Header debug log removed for performance

 useEffect(() => {
 if (scrollItems.length <= 1) return;
 const interval = setInterval(() => {
 setScrollIndex(prev => (prev + 1) % scrollItems.length);
 }, 5000);
 return () => clearInterval(interval);
 }, [scrollItems]);

 const navLinks = [
 { id: 'home', label: 'Home' },
 { id: 'bearers', label: 'Office Bearers' },
 { id: 'units', label: 'Shakhas' },
 { id: 'history', label: 'Legacy' },
 { id: 'gallery', label: 'Gallery' },
 { id: 'downloads', label: 'Downloads' },
 ];

 if (isAdminLoggedIn) {
 navLinks.push({ id: 'blood-donors', label: 'Pulse' });
 const isShakha = currentUser?.user_metadata?.role === 'shakha' || currentUser?.role === 'shakha';
 if (!isShakha) {
 navLinks.push({ id: 'admin', label: 'Admin Console' });
 }
 }

 const handleLinkClick = (id: string) => {
 setActiveTab(id);
 setMobileMenuOpen(false);
 };

 const getNavLinkIcon = (id: string, className: string) => {
 switch (id) {
 case 'home': return <Home className={className} />;
 case 'bearers': return <Users className={className} />;
 case 'units': return <MapPin className={className} />;
 case 'history': return <History className={className} />;
 case 'gallery': return <Image className={className} />;
 case 'downloads': return <Download className={className} />;
 case 'blood-donors': return <Heart className={className} />;
 case 'admin': return <Shield className={className} />;
 default: return null;
 }
 };

 // Reusable unified Logo Badge component to keep styling/sizing identical
 const LogoBadge = ({ 
 src, 
 alt, 
 className = "w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-[48px] md:h-[48px]", 
 spinDirection = 'normal', 
 spinSpeed = '15s',
 isContain = false
 }: { 
 src: string; 
 alt: string; 
 className?: string; 
 spinDirection?: 'normal' | 'reverse';
 spinSpeed?: string;
 isContain?: boolean;
 }) => {
 return (
 <div className="relative group shrink-0 select-none">
 {/* Outer dashed ring rotating — runs on compositor thread via CSS animation */}
 <div 
 className="absolute -inset-1 rounded-full border border-dashed border-amber-400/40 opacity-60 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" 
 style={{
 animation: `logo-spin ${spinSpeed} linear infinite ${spinDirection === 'reverse' ? 'reverse' : 'normal'}`,
 willChange: 'transform',
 }}
 />
 {/* Inner solid border */}
 <div className="absolute -inset-0.5 rounded-full border border-amber-500/20 group-hover:border-amber-400/50 pointer-events-none transition-colors duration-300" />

 {/* Logo Image */}
 <div
 className="rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-rose-500 p-[1.5px] relative z-10 select-none transition-transform duration-300 cursor-pointer group-hover:scale-105"
 >
 <img
 src={src}
 alt={alt}
 loading="lazy"
 decoding="async"
 className={`${className} rounded-full bg-slate-900/95 object-cover ${
 isContain ? 'object-contain p-1' : ''
 }`}
 />
 </div>
 </div>
 );
 };

 const CMLLogo = ({ className = "w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-[48px] md:h-[48px]" }: { className?: string }) => {
 return <LogoBadge src={cmlLogoImg} alt="CML Logo" className={className} spinDirection="reverse" spinSpeed="18s" />;
 };

 const ThereseLogo = ({ className = "w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-[48px] md:h-[48px]" }: { className?: string }) => {
 return <LogoBadge src={thereseImg} alt="Saint Therese" className={className} spinDirection="normal" spinSpeed="15s" />;
 };

 const CommunityLogo = ({ className = "w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-[48px] md:h-[48px]" }: { className?: string }) => {
 return <LogoBadge src={communityEmpowermentImg} alt="Community Empowerment" className={className} spinDirection="normal" spinSpeed="22s" isContain={true} />;
 };

 const HolyWritLogo = ({ className = "w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-[48px] md:h-[48px]" }: { className?: string }) => {
 return <LogoBadge src={holyWritLogoImg} alt="Holy Writ Media Works" className={className} spinDirection="normal" spinSpeed="20s" isContain={true} />;
 };

 return (
 <>
 <header className="sticky lg:relative top-0 z-50 w-full flex flex-col bg-slate-950 text-white shadow-2xl overflow-hidden">
 <div
 className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none shadow-[inset_120px_-20px_120px_-60px_rgba(244,63,94,0.06),inset_-120px_-20px_120px_-60px_rgba(245,158,11,0.05)]"
 />
 
 {/* Top Header Bar with sophisticated spacing */}
 <div className="w-full max-w-7xl mx-auto px-3 xs:px-4 md:px-6 py-1 md:py-1.5 flex flex-row items-center justify-between gap-1.5 xs:gap-3 md:gap-6 relative z-10">
 <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 cursor-pointer group flex-1 min-w-0" onClick={() => handleLinkClick('home')}>
 <CMLLogo className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-[56px] md:h-[56px]" />
 
 <div className="flex flex-col lg:flex-row lg:items-center min-w-0 ml-1 xs:ml-2 justify-center gap-x-6 lg:gap-x-8 gap-y-2">
  <motion.div 
  initial={{ opacity: 0, x: -10 }} 
  animate={{ opacity: 1, x: 0 }} 
  transition={{ duration: 0.6, staggerChildren: 0.1 }}
  className="flex flex-col min-w-0 relative z-10 leading-none mb-0 drop-shadow-md transform transition-all duration-300 group-hover:scale-[1.02]"
  >
  <motion.span 
  initial={{ opacity: 0, y: 5 }} 
  animate={{ opacity: 1, y: 0 }} 
  className="font-display font-black text-[9.5px] xs:text-[11px] sm:text-[14px] md:text-[17px] tracking-[0.06em] select-none uppercase text-slate-100 group-hover:text-white transition-colors"
  >
  CHERUPUSHPA
  </motion.span>
  <motion.span 
  initial={{ opacity: 0, y: 5 }} 
  animate={{ opacity: 1, y: 0 }} 
  className="font-display font-black text-[9.5px] xs:text-[11px] sm:text-[14px] md:text-[17px] tracking-[0.06em] select-none uppercase text-amber-400 group-hover:text-amber-300 transition-colors drop-shadow-[0_0_8px_rgba(251,191,36,0)] group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
  >
  MISSION
  </motion.span>
  <motion.span 
  initial={{ opacity: 0, y: 5 }} 
  animate={{ opacity: 1, y: 0 }} 
  className="font-display font-black text-[9.5px] xs:text-[11px] sm:text-[14px] md:text-[17px] tracking-[0.06em] select-none uppercase text-amber-400 group-hover:text-amber-300 transition-colors drop-shadow-[0_0_8px_rgba(251,191,36,0)] group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
  >
  LEAGUE
  </motion.span>
  <motion.div 
  initial={{ opacity: 0, y: 5 }} 
  animate={{ opacity: 1, y: 0 }} 
  className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5"
  >
  <span className="font-sans font-black text-[7px] xs:text-[8px] sm:text-[10px] md:text-[12px] tracking-[0.15em] select-none uppercase text-rose-300 drop-shadow-sm group-hover:text-rose-200 transition-colors">
  KALIYAR MEKHALA
  </span>
  
  {/* Golden Star Jewel Badge (Inline) */}
  <div className="group relative flex items-center gap-1 px-2 py-[1px] md:py-0.5 rounded-full bg-gradient-to-br from-yellow-950/50 to-slate-950/80 border border-yellow-500/20 shadow-[inset_0_1px_1px_rgba(250,204,21,0.15),0_2px_8px_rgba(0,0,0,0.4)] cursor-default select-none overflow-hidden">
  <Star className="w-2 h-2 md:w-2.5 md:h-2.5 text-yellow-400 fill-yellow-400/50 drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]" />
  <span className="text-[6px] md:text-[7.5px] font-['Outfit'] font-bold uppercase tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-500 relative z-10 whitespace-nowrap">
  GOLDEN STAR WINNER
  </span>
  </div>
  </motion.div>
  </motion.div>

 {isOfflineFallback && (
 <div className="flex mt-1.5">
 <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[7.5px] font-mono font-bold tracking-wider uppercase shadow-xs flex items-center gap-1 shrink-0">
 <span className="w-1 h-1 rounded-full bg-amber-400 inline-block animate-pulse"></span>
 Offline
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Unified premium 3 icon buttons block exactly matching the mockup */}
 <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 shrink-0 relative z-10">
 {/* Instagram Button */}
 <a 
 href="https://instagram.com/cml_kaliyar_mekhala" 
 target="_blank" 
 rel="noopener noreferrer" 
 className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/50 border border-slate-700/40 flex items-center justify-center text-pink-500 hover:text-pink-400 hover:bg-slate-800/60 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.35)] transition-all duration-300 relative group cursor-pointer"
 >
 <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-rose-500/5 to-transparent rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
 <Instagram className="w-[13px] h-[13px] xs:w-[15px] xs:h-[15px] sm:w-4.5 sm:h-4.5 transform group-hover:scale-110 transition-transform duration-300" />
 </a>

 {/* Symmetrical branding logos shared glass deck */}
 <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-1.5 py-1 rounded-full bg-slate-900/45 border border-slate-800/85 shadow-[inset_0_1px_5px_rgba(0,0,0,0.55)] select-none">
 {/* St Therese Concentric Aura Rose Badge */}
 <ThereseLogo className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-[56px] md:h-[56px]" />

 {/* Community Empowerment Badge */}
 <CommunityLogo className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-[56px] md:h-[56px]" />

 {/* Holy Writ Media Works Badge (Hidden on very small screens to save space) */}
 <HolyWritLogo className="hidden xs:block w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-[56px] md:h-[56px]" />
 </div>

 {/* Hamburger Menu Toggle Button */}
 <button
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/50 border border-slate-700/40 text-slate-200 hover:text-white hover:bg-slate-800/60 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all duration-300 relative group cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95"
 >
 <div className="absolute inset-0 bg-slate-800/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 {mobileMenuOpen ? (
 <X className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 relative z-10 transform rotate-90 transition-all duration-300" />
 ) : (
 <div className="flex flex-col gap-[3px] relative z-10 w-[12px] xs:w-[15px] sm:w-4.5 items-center justify-center">
 <span className="w-full h-[1.5px] xs:h-[2px] bg-slate-300 rounded-full"></span>
 <span className="w-full h-[1.5px] xs:h-[2px] bg-slate-300 rounded-full"></span>
 <span className="w-full h-[1.5px] xs:h-[2px] bg-slate-300 rounded-full"></span>
 </div>
 )}
 </button>
 </div>
 </div>

 {/* Sleek dashboard-like sub-bar for secondary meta-data and motto (Tablet/Desktop only) */}
 <div className="hidden md:flex w-full border-t border-slate-900 bg-slate-950/70 py-2 px-6 relative z-10 select-none">
 <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
 
 {/* Left Side: Championship & Live Date badges */}
 <div className="flex items-center gap-2.5">
 {/* Glassmorphic Live Date Obsidian Card */}
 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 text-[8.5px] font-mono font-bold tracking-wider text-slate-350 shadow-[0_1px_8px_rgba(255,255,255,0.02)] relative overflow-hidden group">
 <div className="absolute inset-0 w-[40px] h-full bg-white/5" style={{ animation: 'shimmer 4s infinite linear' }} />
 <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b] shrink-0"></span>
 <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
 </div>
 </div>

 {/* Right Side: The official brand motto in elegant gold lettering */}
 <div className="flex items-center gap-3.5 py-1.5 px-5.5 rounded-full bg-gradient-to-r from-amber-500/5 via-slate-900/75 to-amber-500/5 border border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.08)] relative overflow-hidden group">
 {/* Shimmer sweep reflection on hover */}
 <div className="absolute inset-0 w-[40px] h-full bg-white/5 opacity-0 group-hover:opacity-100" style={{ animation: 'shimmer 4s infinite linear' }} />
 <div className="flex items-center gap-3 text-[8.5px] font-['Outfit'] font-bold uppercase tracking-[0.24em] drop-shadow-[0_0_4px_rgba(245,158,11,0.25)] relative z-10 select-none">
 <span className="text-amber-300 hover:text-white transition-colors duration-300 cursor-default">Love</span>
 <span className="w-[1.5px] h-2.5 bg-gradient-to-b from-transparent via-rose-500/35 to-transparent self-center mx-0.5"></span>
 <span className="text-amber-300 hover:text-white transition-colors duration-300 cursor-default">Sacrifice</span>
 <span className="w-[1.5px] h-2.5 bg-gradient-to-b from-transparent via-rose-500/35 to-transparent self-center mx-0.5"></span>
 <span className="text-amber-300 hover:text-white transition-colors duration-300 cursor-default">Service</span>
 <span className="w-[1.5px] h-2.5 bg-gradient-to-b from-transparent via-rose-500/35 to-transparent self-center mx-0.5"></span>
 <span className="text-amber-300 hover:text-white transition-colors duration-300 cursor-default">Suffering</span>
 </div>
 </div>

 </div>
 </div>

 {/* Shimmery animated color shifting gradient border line */}
 <div 
 className="w-full h-[1.5px] relative z-10 opacity-60"
 style={{
 background: 'linear-gradient(90deg, transparent, #fbbf24, #f43f5e, #8b5cf6, transparent)',
 backgroundSize: '200% 100%',
 animation: 'headerBorderGlow 5s infinite linear'
 }}
 />

 {/* Red Ribbon: Scrolling Announcements */}
 <div className="w-full bg-rose-900 border-y border-rose-950 flex items-center overflow-hidden h-11 select-none">
 <div className="h-full bg-gradient-to-r from-rose-850 to-rose-750 text-amber-300 font-black px-3.5 sm:px-5 text-[10px] sm:text-[11px] tracking-[0.18em] flex items-center justify-center gap-2 shrink-0 uppercase shadow-[2px_0_10px_rgba(0,0,0,0.3)] z-20 font-sans border-r border-rose-800/60 select-none">
 <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce shrink-0" style={{ animationDuration: '2s' }} />
 <span className="sm:hidden text-amber-200">UPDATES</span>
 <span className="hidden sm:inline text-amber-200">LATEST UPDATES</span>
 </div>
 <div className="flex-1 relative flex items-center overflow-hidden h-full">
 <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-rose-900 to-transparent pointer-events-none z-10" />
 <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-rose-900 to-transparent pointer-events-none z-10" />
 
 {scrollItems.length > 0 && (
 <div className="flex gap-16 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer text-xs md:text-sm font-medium text-rose-100 items-center justify-start shrink-0 select-text pr-16">
 {/* Part 1 */}
 {scrollItems.map((item, idx) => (
 <div key={`part1-${idx}`} className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 inline-block animate-pulse"></span>
 <span>{item.text}</span>
 {item.date && (
 <span className="text-[9px] font-bold text-rose-300 bg-rose-950/65 font-mono px-2 py-0.5 rounded-md border border-rose-800/40 shrink-0">
 {item.date}
 </span>
 )}
 </div>
 ))}
 {/* Part 2: Identical Twin for Seamless Loop */}
 {scrollItems.map((item, idx) => (
 <div key={`part2-${idx}`} className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 inline-block animate-pulse"></span>
 <span>{item.text}</span>
 {item.date && (
 <span className="text-[9px] font-bold text-rose-300 bg-rose-950/65 font-mono px-2 py-0.5 rounded-md border border-rose-800/40 shrink-0">
 {item.date}
 </span>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Mobile Drawer Menu */}
 {mobileMenuOpen && (
 <div className="lg:hidden w-full bg-slate-950 border-t border-slate-800 p-4 flex flex-col gap-2 shadow-2xl relative z-40 animate-slide-down">
 {navLinks.map((link) => {
 const isActive = activeTab === link.id;
 return (
 <button
 key={link.id}
 onClick={() => handleLinkClick(link.id)}
 className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-['Outfit'] font-bold uppercase tracking-wider transition-all duration-200 ${
 isActive
 ? 'bg-gradient-to-r from-rose-950/60 to-amber-950/40 border-l-4 border-amber-500 text-amber-200 pl-6 shadow-inner'
 : 'text-slate-400 hover:bg-slate-900/60 hover:text-white pl-4'
 }`}
 >
 {link.label}
 </button>
 );
 })}

 {isAdminLoggedIn ? (
 <button
 onClick={() => {
 onLogout();
 setMobileMenuOpen(false);
 }}
 className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-['Outfit'] font-bold uppercase tracking-wider text-rose-455 hover:bg-rose-950/40 hover:text-white pl-4 border border-rose-900/40 transition-all duration-200 flex items-center gap-2 cursor-pointer mt-2"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Logout</span>
 </button>
 ) : (
 <button
 onClick={() => {
 handleLinkClick('admin');
 }}
 className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-['Outfit'] font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-950/40 hover:text-white pl-4 border border-emerald-900/40 transition-all duration-200 flex items-center gap-2 cursor-pointer mt-2"
 >
 <LogIn className="w-3.5 h-3.5" />
 <span>Login</span>
 </button>
 )}

 <div className="mt-4 pt-4 border-t border-slate-900 flex justify-center">
 <InstallPwaButton className="w-full !py-3" />
 </div>

 {/* Quick Special Category Anchors */}
 {!isAdminLoggedIn && (showKalolsavam || showSahithyamalsaram || showChosen) && (
 <div className={`grid gap-2 mt-3 pt-3.5 border-t border-slate-900 ${
 [showKalolsavam, showSahithyamalsaram, showChosen].filter(Boolean).length === 3
 ? 'grid-cols-3'
 : [showKalolsavam, showSahithyamalsaram, showChosen].filter(Boolean).length === 2
 ? 'grid-cols-2'
 : 'grid-cols-1'
 }`}>
 {showKalolsavam && (
 <button
 onClick={() => handleLinkClick('kalolsavam')}
 className={`flex flex-col items-center justify-center py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95 cursor-pointer relative overflow-hidden group ${
 activeTab === 'kalolsavam'
 ? 'bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] border-2 border-rose-400 scale-105'
 : 'bg-rose-950/40 text-rose-400 border-[1.5px] border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.25)] hover:border-rose-400 hover:bg-rose-900/60 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'
 }`}
 >
 <span className="leading-none font-sans relative z-10">KALOLSAVAM</span>
 </button>
 )}
 
 {showSahithyamalsaram && (
 <button
 onClick={() => handleLinkClick('sahithyamalsaram')}
 className={`flex flex-col items-center justify-center py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95 cursor-pointer relative overflow-hidden group ${
 activeTab === 'sahithyamalsaram'
 ? 'bg-amber-500 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] border-2 border-amber-400 scale-105'
 : 'bg-amber-950/40 text-amber-400 border-[1.5px] border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:border-amber-400 hover:bg-amber-900/60 hover:text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]'
 }`}
 >
 <span className="leading-none font-sans relative z-10">SAHITYAM</span>
 </button>
 )}

 {showChosen && (
 <button
 onClick={() => handleLinkClick('chosen')}
 className={`flex flex-col items-center justify-center py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95 cursor-pointer relative overflow-hidden group ${
 activeTab === 'chosen'
 ? 'bg-indigo-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.6)] border-2 border-indigo-400 scale-105'
 : 'bg-indigo-950/40 text-indigo-400 border-[1.5px] border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:border-indigo-400 hover:bg-indigo-900/60 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
 }`}
 >
 <span className="leading-none font-sans relative z-10">CHOSEN</span>
 </button>
 )}
 </div>
 )}
 </div>
 )}
 </header>

 {/* Desktop Main Rounded Pill Navbar - Redesigned to premium glassmorphic dark theme */}
 <div className={`hidden lg:block sticky top-2 z-50 w-full bg-transparent py-4 px-6 pointer-events-none ${activeTab === 'admin' ? 'lg:pl-64' : ''}`}>
 <div
 id="desktop-pill-nav-container"
 className="w-fit mx-auto pointer-events-auto bg-slate-950 rounded-full p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.4)] border-[1.5px] border-slate-600/70 hover:border-slate-400/80 hover:scale-[1.005] flex items-center justify-center transition-all duration-300"
 >
 <div className="flex items-center justify-center gap-1 xl:gap-2 px-2">
 {navLinks.map((link) => {
 const isActive = activeTab === link.id;
 return (
 <button
 key={link.id}
 onClick={() => handleLinkClick(link.id)}
 className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-[11px] xl:text-[12px] font-['Outfit'] font-bold uppercase tracking-wider transition-all duration-200 relative whitespace-nowrap cursor-pointer shrink-0 select-none ${
 isActive
 ? 'text-amber-100 bg-gradient-to-r from-rose-500/30 via-slate-900/80 to-amber-500/30 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
 : 'text-slate-100 hover:text-white hover:bg-slate-700/60 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] border-2 border-transparent'
 }`}
 >
 {isActive && (
 <div className="relative flex h-1.5 w-1.5 shrink-0">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,1)]"></span>
 </div>
 )}
 <span>{link.label}</span>
 </button>
 );
 })}

 {!isAdminLoggedIn && (showKalolsavam || showSahithyamalsaram || showChosen) && (
 <>
 <div className="h-6 w-px bg-slate-800 mx-1 xl:mx-2 shrink-0"></div>

 {/* Special styled highlight keys with glorious accents and high-contrast premium visibility */}
 <div className="relative flex items-center gap-1.5 xl:gap-3 shrink-0">
 {/* Kalolsavam Tab Button */}
 {showKalolsavam && (
 <div className="relative group text-center flex flex-col items-center">
 <button
 onClick={() => handleLinkClick('kalolsavam')}
 className={`flex items-center gap-1.5 px-3.5 xl:px-5 py-2 xl:py-2.5 rounded-full text-[11px] xl:text-[11.5px] font-['Outfit'] font-bold tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 border-2 select-none ${
 activeTab === 'kalolsavam'
 ? 'bg-rose-600 border-rose-500 text-white hover:bg-rose-700 hover:border-rose-600 shadow-md shadow-rose-600/30 ring-2 ring-rose-500/20'
 : 'bg-rose-900/40 border-rose-500/80 text-rose-100 hover:text-white hover:bg-rose-900/60 hover:border-rose-400 shadow-sm'
 }`}
 >
 <span>KALOLSAVAM 2026</span>
 </button>
 {activeTab === 'kalolsavam' && (
 <span className="absolute -bottom-2.5 w-10 h-1 bg-rose-600 rounded-full animate-pulse shadow-xs" />
 )}
 </div>
 )}

 {/* Sahithyamalsaram Tab Button */}
 {showSahithyamalsaram && (
 <div className="relative group text-center flex flex-col items-center">
 <button
 onClick={() => handleLinkClick('sahithyamalsaram')}
 className={`flex items-center gap-1.5 px-3.5 xl:px-5 py-2 xl:py-2.5 rounded-full text-[11px] xl:text-[11.5px] font-['Outfit'] font-bold tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 border-2 select-none ${
 activeTab === 'sahithyamalsaram'
 ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500 text-white shadow-lg shadow-amber-600/40 hover:from-amber-700 hover:to-amber-800 hover:border-amber-600 ring-2 ring-amber-500/20'
 : 'bg-amber-900/40 border-amber-500/80 text-amber-100 hover:text-white hover:bg-amber-900/60 hover:border-amber-400 shadow-sm'
 }`}
 >
 <span>SAHITHYAMALSARAM 2026</span>
 </button>
 {activeTab === 'sahithyamalsaram' && (
 <span className="absolute -bottom-2.5 w-10 h-1 bg-amber-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(217,119,6,0.8)]" />
 )}
 </div>
 )}

 {/* Chosen Tab Button */}
 {showChosen && (
 <div className="relative group text-center flex flex-col items-center">
 <button
 onClick={() => handleLinkClick('chosen')}
 className={`flex items-center gap-1.5 px-3.5 xl:px-5 py-2 xl:py-2.5 rounded-full text-[11px] xl:text-[11.5px] font-['Outfit'] font-bold tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 border-2 select-none ${
 activeTab === 'chosen'
 ? 'bg-indigo-650 border-indigo-500 text-white shadow-lg shadow-indigo-650/40 hover:bg-indigo-750 hover:border-indigo-600 ring-2 ring-indigo-500/20'
 : 'bg-indigo-900/40 border-indigo-500/80 text-indigo-100 hover:text-white hover:bg-indigo-900/60 hover:border-indigo-400 shadow-sm'
 }`}
 >
 <span>CHOSEN 2026</span>
 </button>
 {activeTab === 'chosen' && (
 <span className="absolute -bottom-2.5 w-10 h-1 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
 )}
 </div>
 )}
 </div>
 </>
 )}

 {isAdminLoggedIn ? (
 <>
 <div className="h-6 w-px bg-slate-800 mx-1 xl:mx-2 shrink-0"></div>
 <button
 onClick={() => {
 onLogout();
 }}
 className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-[11px] xl:text-[12px] font-['Outfit'] font-bold uppercase tracking-wider text-rose-400 hover:text-white hover:bg-rose-950/60 border-2 border-rose-900/50 hover:border-rose-500 shadow-sm transition-all duration-200 cursor-pointer shrink-0 select-none"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Logout</span>
 </button>
 </>
 ) : (
 <>
 <div className="h-6 w-px bg-slate-800 mx-1 xl:mx-2 shrink-0"></div>
 <button
 onClick={() => handleLinkClick('admin')}
 className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-[11px] xl:text-[12px] font-['Outfit'] font-bold uppercase tracking-wider text-emerald-400 hover:text-white hover:bg-emerald-950/60 border-2 border-emerald-900/50 hover:border-emerald-500 shadow-sm transition-all duration-200 cursor-pointer shrink-0 select-none"
 >
 <LogIn className="w-3.5 h-3.5" />
 <span>Login</span>
 </button>
 </>
 )}
 </div>
 </div>
 </div>

 </>
 );
}
