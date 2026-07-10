/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, Mail, Menu, X, ShieldAlert, Award, BookOpen, Sparkles, PenTool, Star, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { Announcement, PortalSettings } from '../types';

import cmlLogoImg from '../assets/images/logo.jpg';
import thereseImg from '../assets/images/st_therese.png';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: PortalSettings;
  announcements: Announcement[];
  isAdminLoggedIn: boolean;
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

  console.log('HEADER DEBUG:', { isAdminLoggedIn, showKalolsavam, showSahithyamalsaram, settings });

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
    { id: 'units', label: 'Units' },
    { id: 'history', label: 'History' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'downloads', label: 'Downloads' },
  ];

  if (isAdminLoggedIn) {
    navLinks.push({ id: 'admin', label: 'Admin Console' });
  }

  const handleLinkClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  // CML Crest Logo SVG/HTML matching styling from redesigned mockup
  const CMLLogo = ({ className = "w-11 h-11 xs:w-13 xs:h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]" }: { className?: string }) => {
    return (
      <div id="header-cml-logo-container" className="relative group shrink-0 select-none">
        {/* Divine halo glow */}
        <div className="absolute inset-x-0 inset-y-0 bg-amber-500/25 blur-xl rounded-full scale-125 opacity-80 group-hover:scale-135 group-hover:opacity-100 transition-all duration-300" />
        <div className="absolute inset-x-0 inset-y-0 bg-red-600/15 blur-md rounded-full scale-110" />
        
        {/* Gold concentric double ring structure matching the mockup */}
        <div className="absolute -inset-1 rounded-full border border-amber-400/45 opacity-55 group-hover:opacity-95 pointer-events-none transition-all duration-300" />
        
        {/* Premium Badge Body */}
        <div
          className={`${className} rounded-full bg-radial from-[#7a0212] via-[#3d0107] to-slate-950 border-2 border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.25)] relative z-10 flex flex-col items-center justify-center text-center select-none transform transition-all duration-300 cursor-pointer group-hover:scale-105`}
        >
          <span className="text-[12px] xs:text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-tight text-pink-105 leading-none drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] uppercase">
            CML
          </span>
          <span className="text-[14px] xs:text-[16px] sm:text-[18px] lg:text-[20px] text-amber-300 leading-none mt-0.5 filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)] select-none transform group-hover:scale-110 transition-transform">
            ⚜
          </span>
        </div>
      </div>
    );
  };

  // Saint Therese Image Component with graceful fallback
  const ThereseLogo = ({ className = "w-11 h-11 xs:w-13 xs:h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]" }: { className?: string }) => {
    return (
      <div className="relative group shrink-0 select-none">
        {/* Divine halo glow */}
        <div className="absolute inset-x-0 inset-y-0 bg-rose-500/25 blur-xl rounded-full scale-125 opacity-80 group-hover:scale-135 group-hover:opacity-100 transition-all duration-300" />
        <div className="absolute inset-x-0 inset-y-0 bg-amber-500/15 blur-md rounded-full scale-110" />
        
        {/* Gold concentric double ring structure */}
        <div className="absolute -inset-1 rounded-full border border-amber-400/40 opacity-55 group-hover:opacity-95 pointer-events-none transition-all duration-300" />
        
        {/* Burgundy / Crimson Rose Badge matching screenshot perfectly */}
        <div
          className={`${className} rounded-full border-2 border-amber-400 bg-radial from-[#7a0212] via-[#3d0107] to-slate-950 relative z-10 flex items-center justify-center select-none transform transition-all duration-300 cursor-pointer group-hover:scale-105 shadow-[0_0_15px_rgba(251,191,36,0.25)]`}
        >
          <span className="text-[17px] xs:text-[19px] sm:text-[21px] lg:text-[23px] leading-none filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)] select-none transform group-hover:scale-115 group-hover:rotate-6 transition-all duration-300">
            🌷
          </span>
        </div>
      </div>
    );
  };

  return (
    <header className="w-full flex flex-col bg-slate-950 text-white shadow-2xl relative overflow-hidden">
      {/* Dynamic Cosmic Soft Atmosphere */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar with sophisticated spacing */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-row items-center justify-between gap-2.5 xs:gap-4 md:gap-6 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2.5 xs:gap-3.5 sm:gap-4 md:gap-5 cursor-pointer group flex-1 min-w-0" onClick={() => handleLinkClick('home')}>
          <CMLLogo className="w-11 h-11 xs:w-13 xs:h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]" />
          <div className="flex flex-col min-w-0 ml-2 xs:ml-3">
            {/* Brand Heading styled in elegant uppercase serif display */}
            <div className="flex flex-col min-w-0">
              <h1 className="font-display font-black text-[12px] xs:text-[15px] sm:text-[18px] md:text-xl lg:text-[24px] tracking-[0.03em] text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 select-none uppercase leading-tight">
                Cherupushpa Mission
              </h1>
              <h2 className="font-display font-black text-[10px] xs:text-[13px] sm:text-[15px] md:text-lg lg:text-[21px] tracking-[0.24em] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-350 to-amber-500 select-none uppercase leading-none mt-1">
                League
              </h2>
            </div>
            
            {/* Sub-badge exactly from redesigned mockup */}
            <div className="mt-2.5 flex items-center">
              <span className="px-3.5 py-1 rounded-full bg-[#1c0206] border border-rose-955/50 hover:border-amber-500/20 text-amber-300 font-sans font-black uppercase text-[7px] xs:text-[8.5px] sm:text-[9.5px] tracking-widest shadow-[0_2px_8px_rgba(190,18,60,0.1)] shrink-0 flex items-center gap-1.5 backdrop-blur-md relative overflow-hidden transition-all duration-300 h-fit select-none">
                <span className="absolute inset-x-0 -bottom-px h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.95)]"></span>
                </span>
                <span className="relative z-10 font-sans">KALIYAR MEKHALA</span>
              </span>
            </div>

            {isOfflineFallback && (
              <div className="flex mt-1">
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[7.5px] md:text-[9.5px] font-mono font-bold tracking-wider uppercase shadow-xs flex items-center gap-1 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-amber-400 inline-block animate-pulse"></span>
                  Offline Mode
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Unified premium 3 icon buttons block exactly matching the mockup */}
        <div className="flex items-center gap-2 xs:gap-3.5 sm:gap-4 shrink-0">
          {/* Instagram Button */}
          <a 
            href="https://instagram.com/cml_kaliyar_mekhala" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-11 h-11 xs:w-13 xs:h-13 sm:w-14 sm:h-14 rounded-[20px] bg-slate-900/90 border border-slate-800/80 flex items-center justify-center text-pink-500 hover:text-pink-400 hover:bg-slate-855 hover:shadow-[0_4px_16px_rgba(236,72,153,0.15)] transition-all duration-300 relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-rose-500/5 to-transparent rounded-[20px] opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            <Instagram className="w-[18px] h-[18px] xs:w-5 xs:h-5 sm:w-5.5 sm:h-5.5 transform group-hover:scale-110 transition-transform duration-300" />
          </a>

          {/* St Therese Concentric Aura Rose Badge */}
          <ThereseLogo className="w-11 h-11 xs:w-13 xs:h-13 sm:w-14 sm:h-14" />

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-11 h-11 xs:w-13 xs:h-13 sm:w-14 sm:h-14 rounded-[20px] bg-slate-900/90 border border-slate-800/80 text-slate-350 hover:text-white hover:bg-slate-855 transition-all duration-300 relative group cursor-pointer flex items-center justify-center active:scale-95"
          >
            <div className="absolute inset-0 bg-slate-800/20 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {mobileMenuOpen ? (
              <X className="w-[18px] h-[18px] xs:w-5 xs:h-5 sm:w-5.5 sm:h-5.5 relative z-10 transform rotate-90 transition-all duration-300" />
            ) : (
              <Menu className="w-[18px] h-[18px] xs:w-5 xs:h-5 sm:w-5.5 sm:h-5.5 relative z-10" />
            )}
          </button>
        </div>
      </div>

      {/* Red Ribbon: Scrolling Announcements */}
      <div className="w-full bg-rose-900 border-y border-rose-950 flex items-center overflow-hidden h-11 select-none">
        <div className="h-full bg-rose-700 text-amber-200 font-extrabold px-2 sm:px-3.5 text-[9.5px] sm:text-[10px] md:text-xs tracking-wider flex items-center shrink-0 uppercase shadow-md shadow-rose-950/40 z-20 font-sans border-r border-rose-800 select-none">
          <span className="sm:hidden">🔔 UPDATES</span>
          <span className="hidden sm:inline">🔔 LATEST UPDATES</span>
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

      {/* Desktop Main Rounded Pill Navbar - Inspired exactly by Image */}
      <div className="hidden lg:block w-full bg-slate-950/40 py-4 px-6 border-b border-slate-800/40 backdrop-blur-xs">
        <div
          id="desktop-pill-nav-container"
          className="max-w-6xl xl:max-w-7xl mx-auto bg-white/95 backdrop-blur-xl rounded-full p-2 shadow-[0_10px_40px_rgba(244,63,94,0.15)] flex items-center justify-between border-2 border-rose-200/60 ring-4 ring-amber-500/10 transition-all duration-300"
        >
          <div className="w-full flex items-center justify-between gap-1 xl:gap-2 px-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-2 xl:px-3.5 py-2 xl:py-2.5 rounded-full text-xs xl:text-sm font-extrabold tracking-tight xl:tracking-wide transition-all duration-200 relative whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === link.id
                    ? 'text-rose-800 bg-rose-50/90 shadow-2xs border border-rose-100/50'
                    : 'text-slate-700 hover:text-rose-700 hover:bg-rose-50/40'
                }`}
              >
                {link.label}
              </button>
            ))}

            {!isAdminLoggedIn && (showKalolsavam || showSahithyamalsaram || showChosen) && (
              <>
                <div className="h-6 w-px bg-slate-200 mx-1 xl:mx-2 shrink-0"></div>

                {/* Special styled highlight keys with glorious accents and high-contrast premium visibility */}
                <div className="relative flex items-center gap-1.5 xl:gap-3 shrink-0">
                  {/* Kalolsavam Tab Button */}
                  {showKalolsavam && (
                    <div className="relative group text-center flex flex-col items-center">
                      <button
                        onClick={() => handleLinkClick('kalolsavam')}
                        className={`flex items-center gap-1.5 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-[11px] xl:text-xs font-black tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 border-2 select-none ${
                          activeTab === 'kalolsavam'
                            ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700 hover:border-rose-700 shadow-md shadow-rose-600/25 ring-2 ring-rose-500/15'
                            : 'bg-rose-50/90 border-rose-400 text-rose-700 hover:text-rose-800 hover:bg-rose-100/95 hover:border-rose-500 shadow-5xs'
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
                        className={`flex items-center gap-1.5 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-[11px] xl:text-xs font-black tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 border-2 select-none ${
                          activeTab === 'sahithyamalsaram'
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-600 text-white shadow-lg shadow-amber-600/40 hover:from-amber-700 hover:to-amber-800 hover:border-amber-700 ring-2 ring-amber-500/15'
                            : 'bg-amber-50/90 border-amber-400 text-amber-900 hover:text-amber-950 hover:bg-amber-100/95 hover:border-amber-500 shadow-5xs'
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
                        className={`flex items-center gap-1.5 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-[11px] xl:text-xs font-black tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 border-2 select-none ${
                          activeTab === 'chosen'
                              ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/35 hover:bg-slate-800 hover:border-slate-800 ring-2 ring-slate-900/15'
                            : 'bg-indigo-50/90 border-indigo-300 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100/95 hover:border-indigo-400 shadow-5xs'
                        }`}
                      >
                        <span>CHOSEN 2026</span>
                      </button>
                      {activeTab === 'chosen' && (
                        <span className="absolute -bottom-2.5 w-10 h-1 bg-slate-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(15,23,42,0.8)]" />
                      )}
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-slate-950 border-t border-slate-800 p-4 flex flex-col gap-2 shadow-2xl relative z-40 animate-slide-down">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === link.id
                  ? 'bg-rose-950/50 border-l-4 border-rose-500 text-rose-300 pl-6'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}

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
                  className={`flex flex-col items-center justify-center py-3.5 rounded-2xl text-[9.5px] font-extrabold uppercase tracking-widest transition-all duration-300 transform active:scale-95 cursor-pointer border ${
                    activeTab === 'kalolsavam'
                      ? 'bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-[0_8px_20px_rgba(244,63,94,0.35)] border-rose-400'
                      : 'bg-slate-900/60 text-rose-200 border-rose-950/80 hover:border-rose-900/60 hover:bg-rose-950/20 hover:text-white'
                  }`}
                >
                  <span className="leading-none font-sans">KALOLSAVAM</span>
                </button>
              )}
              
              {showSahithyamalsaram && (
                <button
                  onClick={() => handleLinkClick('sahithyamalsaram')}
                  className={`flex flex-col items-center justify-center py-3.5 rounded-2xl text-[9.5px] font-extrabold uppercase tracking-widest transition-all duration-300 transform active:scale-95 cursor-pointer border ${
                    activeTab === 'sahithyamalsaram'
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 shadow-[0_8px_20px_rgba(245,158,11,0.35)] border-amber-400'
                      : 'bg-slate-900/60 text-amber-200 border-amber-950/80 hover:border-amber-900/60 hover:bg-amber-950/20 hover:text-white'
                  }`}
                >
                  <span className="leading-none font-sans">SAHITYAM</span>
                </button>
              )}

              {showChosen && (
                <button
                  onClick={() => handleLinkClick('chosen')}
                  className={`flex flex-col items-center justify-center py-3.5 rounded-2xl text-[9.5px] font-extrabold uppercase tracking-widest transition-all duration-300 transform active:scale-95 cursor-pointer border ${
                    activeTab === 'chosen'
                      ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] border-indigo-400'
                      : 'bg-slate-900/60 text-indigo-200 border-indigo-950/80 hover:border-indigo-900/60 hover:bg-indigo-950/20 hover:text-white'
                  }`}
                >
                  <span className="leading-none font-sans">CHOSEN</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
