/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  ArrowRight,
  Award,
  Users,
  History,
  FileText,
  Sparkles,
  Calendar,
  Heart,
  Flame,
  BookOpen,
  Gift,
  Trophy,
  CheckCircle,
  HeartHandshake,
  ArrowUpRight,
  MapPin,
  Bell,
  Download,
  Info,
  UserCheck
} from 'lucide-react';
import {
  OfficeBearer,
  ParishUnit,
  CMLEvent,
  Announcement,
  NewsItem,
  GalleryAlbum,
  DownloadItem,
  PortalSettings
} from '../types';

import flagImg from '../assets/images/flag.png';
import logoImg from '../assets/images/logo.jpg';
import chosenImg from '../assets/images/chosen_leaders.webp';

import thereseImg from '../assets/images/st_therese.png';
const groupPhotoImg = chosenImg;
const cmlLogoImg = logoImg;
import founderPriestImg from '../assets/images/director.png';
import founderLaymanImg from '../assets/images/founder.png';
const saintLittleFlowerImg = thereseImg;

interface HomeViewProps {
  settings: PortalSettings;
  announcements: Announcement[];
  news: NewsItem[];
  bearers: OfficeBearer[];
  units: ParishUnit[];
  events: CMLEvent[];
  albums: GalleryAlbum[];
  downloads: DownloadItem[];
  setActiveTab: (tab: string) => void;
}

export default function HomeView({
  settings,
  announcements,
  news,
  bearers,
  units,
  events,
  albums,
  downloads,
  setActiveTab
}: HomeViewProps) {
  const latestNews = news.slice(0, 2);
  const nextEvents = events.filter(e => e.type === 'upcoming').slice(0, 2);
  const featuredNews = news.find(n => n.isFeatured) || news[0];

  const defaultSlides = [
    {
      id: 'default-1',
      imageUrl: groupPhotoImg,
      captionTitle: 'CHOSEN LEADERS MEET',
      captionSub: 'Mekhala Summit',
      captionVenue: 'VENUE: JAI RANI PUBLIC SCHOOL, KALIYAR',
      isActive: true
    },
    {
      id: 'default-2',
      imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
      captionTitle: 'MISSIONARY SPIRIT',
      captionSub: 'Love & Sacrifice',
      captionVenue: 'CML KALIYAR MEKHALA PORTAL',
      isActive: true
    }
  ];

  const activeSlides = (settings.heroSlides && settings.heroSlides.filter(s => s.isActive).length > 0)
    ? settings.heroSlides.filter(s => s.isActive)
    : defaultSlides;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const intervalSeconds = settings.heroInterval || 5;

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIdx) => (prevIdx + 1) % activeSlides.length);
    }, intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [activeSlides.length, intervalSeconds]);

  const currentIndex = currentSlideIndex % activeSlides.length;
  const currentSlide = activeSlides[currentIndex] || activeSlides[0];



  return (
    <div className="w-full bg-[#fdfbf7] text-stone-800 relative pb-20 overflow-hidden font-sans">
      
      {/* Dynamic Background Sparkles/Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-200/15 via-amber-100/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-200/10 via-rose-100/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />





      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Block: Modern Typography & Creed */}
          <div className="lg:col-span-6 flex flex-col justify-start text-center lg:text-left gap-4">
            <div className="flex flex-col gap-4">
              
              {/* Outstanding modern typography in balanced natural theme */}
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-center lg:justify-start gap-2.5 select-none">
                  <span className="text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-[0.3em] text-stone-500">
                    OUR SACRED CREED
                  </span>
                  <span className="flex-1 h-px bg-stone-200 hidden lg:block max-w-[80px]" />
                </div>
                
                <div className="flex flex-col gap-1 select-none font-malayalam leading-tight">
                  {/* Line 1: സ്നേഹം ● യായി */}
                  <div className="flex items-center justify-center lg:justify-start gap-x-2 xs:gap-x-4 sm:gap-x-5 flex-nowrap whitespace-nowrap">
                    <span className="text-stone-900 font-bold text-[34px] xs:text-4xl sm:text-6xl lg:text-[66px] tracking-normal">
                      സ്നേഹം
                    </span>
                    <span className="inline-block w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full bg-stone-900 shrink-0" />
                    <span className="text-stone-900 font-bold text-[34px] xs:text-4xl sm:text-6xl lg:text-[66px] tracking-normal">
                      ത്യാഗം
                    </span>
                  </div>
                  {/* Line 2: സേവനം ● സഹനം */}
                  <div className="flex items-center justify-center lg:justify-start gap-x-2 xs:gap-x-4 sm:gap-x-5 flex-nowrap whitespace-nowrap mt-0.5">
                    <span className="text-[#f43f5e] font-bold text-[34px] xs:text-4xl sm:text-6xl lg:text-[66px] tracking-normal">
                      സേവനം
                    </span>
                    <span className="inline-block w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full bg-[#f97316] shrink-0" />
                    <span className="text-[#f59e0b] font-bold text-[34px] xs:text-4xl sm:text-6xl lg:text-[66px] tracking-normal">
                      സഹനം
                    </span>
                  </div>
                </div>

                {/* Minimal elegant separator line */}
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="h-0.5 w-16 bg-gradient-to-r from-amber-400 to-rose-500 rounded-full" />
                </div>
              </div>

              {/* Premium Redesigned Quick Access Portals */}
              {((settings?.showKalolsavam !== false) || (settings?.showSahithyamalsaram !== false) || (settings?.showChosen !== false)) && (
                <div className="flex flex-col gap-2 mt-4 text-center lg:text-left select-none">
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 opacity-90">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-stone-500">
                      Active Quick Portals
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start mt-1">
                    {settings?.showKalolsavam !== false && (
                      <button
                        onClick={() => setActiveTab('kalolsavam')}
                        className="relative flex items-center h-14 pl-6 pr-4 w-full sm:w-[260px] rounded-2xl bg-white/90 backdrop-blur-sm border border-stone-200/90 hover:border-rose-350 hover:bg-rose-50/10 hover:shadow-[0_8px_20px_rgba(244,63,94,0.06)] transition-all duration-350 ease-out text-left cursor-pointer group transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                      >
                        {/* Elegant brand vertical strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 transition-all duration-300 group-hover:w-2" />
                        
                        {/* Labels */}
                        <div className="flex flex-col min-w-0 pr-1 flex-1">
                          <span className="text-xs font-black text-stone-800 uppercase tracking-wider group-hover:text-rose-600 transition-colors font-sans leading-none">
                            Kalolsavam
                          </span>
                        </div>
                        
                        <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 ml-auto shrink-0" />
                      </button>
                    )}

                    {settings?.showSahithyamalsaram !== false && (
                      <button
                        onClick={() => setActiveTab('sahithyamalsaram')}
                        className="relative flex items-center h-14 pl-6 pr-4 w-full sm:w-[260px] rounded-2xl bg-white/90 backdrop-blur-sm border border-stone-200/90 hover:border-amber-400 hover:bg-amber-50/10 hover:shadow-[0_8px_20px_rgba(245,158,11,0.06)] transition-all duration-350 ease-out text-left cursor-pointer group transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                      >
                        {/* Elegant brand vertical strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 transition-all duration-300 group-hover:w-2" />
                        
                        {/* Labels */}
                        <div className="flex flex-col min-w-0 pr-1 flex-1">
                          <span className="text-xs font-black text-stone-800 uppercase tracking-wider group-hover:text-amber-600 transition-colors font-sans leading-none">
                            Sahithyamalsaram
                          </span>
                        </div>
                        
                        <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 ml-auto shrink-0" />
                      </button>
                    )}

                    {settings?.showChosen !== false && (
                      <button
                        onClick={() => setActiveTab('chosen')}
                        className="relative flex items-center h-14 pl-6 pr-4 w-full sm:w-[260px] rounded-2xl bg-white/90 backdrop-blur-sm border border-stone-200/90 hover:border-indigo-400 hover:bg-indigo-50/10 hover:shadow-[0_8px_20px_rgba(99,102,241,0.06)] transition-all duration-350 ease-out text-left cursor-pointer group transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                      >
                        {/* Elegant brand vertical strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 transition-all duration-300 group-hover:w-2" />
                        
                        {/* Labels */}
                        <div className="flex flex-col min-w-0 pr-1 flex-1">
                          <span className="text-xs font-black text-stone-800 uppercase tracking-wider group-hover:text-indigo-600 transition-colors font-sans leading-none">
                            Chosen Registration
                          </span>
                        </div>
                        
                        <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 ml-auto shrink-0" />
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>



          </div>

          {/* Right Block: Magnificent Centerpiece Showcase of the Community group photo list (Dynamic) */}
          <div className="lg:col-span-6 flex flex-col justify-center items-center relative w-full gap-5">
            
            {/* The Cinematic community card with golden luxury frames */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[1.4] md:aspect-[1.5] lg:aspect-[1.35] border-[3.5px] border-amber-400 rounded-[32px] overflow-hidden shadow-2xl p-1 bg-white transform -rotate-1 hover:rotate-0 hover:scale-[1.01] transition-all duration-700 ease-out z-10 group/hero-frame">
              
              {/* Internal container with borders and live gradient layouts */}
              <div className="w-full h-full rounded-[26px] overflow-hidden bg-stone-950 relative border border-amber-150/50">
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent z-10 pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0, scale: 1.01 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={currentSlide.imageUrl}
                      alt={currentSlide.captionTitle}
                      className="w-full h-full object-cover object-center relative z-0 transform group-hover/hero-frame:scale-[1.02] transition duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Floating dynamic tags content card in bottom overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-1 bg-stone-950/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-lg select-none text-left max-w-[85%]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[10px] font-sans font-extrabold text-white uppercase tracking-wider leading-none">
                      {currentSlide.captionTitle}
                    </span>
                    {currentSlide.captionSub && (
                      <span className="text-[9px] font-sans font-bold text-amber-400 border-l border-white/20 pl-1.5 ml-0.5 uppercase tracking-wide">
                        {currentSlide.captionSub}
                      </span>
                    )}
                  </div>
                  {currentSlide.captionVenue && (
                    <span className="text-[8px] font-mono text-stone-400 leading-none uppercase mt-0.5 block">
                      {currentSlide.captionVenue}
                    </span>
                  )}
                </div>

                {/* Manual Navigation Buttons */}
                {activeSlides.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
                      className="absolute left-3.5 bottom-1/2 translate-y-1/2 z-25 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 hover:bg-amber-400 hover:text-black border border-white/10 text-white transition active:scale-95 cursor-pointer flex items-center justify-center text-xs font-bold shadow-md"
                      title="Previous Slide"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length)}
                      className="absolute right-3.5 bottom-1/2 translate-y-1/2 z-25 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 hover:bg-amber-400 hover:text-black border border-white/10 text-white transition active:scale-95 cursor-pointer flex items-center justify-center text-xs font-bold shadow-md"
                      title="Next Slide"
                    >
                      ›
                    </button>

                    {/* Navigation dot indicators */}
                    <div className="absolute bottom-4 right-4 z-20 flex gap-1 animate-fade-in">
                      {activeSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-305 ${
                            idx === currentIndex ? 'bg-amber-400 w-3' : 'bg-white/40 hover:bg-white/70'
                          }`}
                          title={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Parish Units Carousel Grid preview */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 z-10 relative">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between border-b border-stone-200/60 pb-2 text-left">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-rose-700 uppercase tracking-widest block mb-0.5">Parish Folders</span>
              <h3 className="font-sans font-black text-lg text-stone-900 tracking-tight leading-none">
                Our Active Parish Units
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('units')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-850 transition flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              All Units <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {units.slice(0, 3).map((un) => (
              <div
                key={un.id}
                className="bg-white rounded-3xl border border-stone-200/60 shadow-3xs overflow-hidden flex flex-col justify-between hover:border-stone-300 transition duration-300 group/u"
              >
                <div className="h-32 bg-stone-950 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent z-10" />
                  <img
                    alt={un.name}
                    src={un.bgPhoto}
                    className="w-full h-full object-cover opacity-60 absolute inset-0 z-0 transform group-hover/u:scale-102 transition duration-500"
                  />
                  <div className="absolute bottom-3 left-3 z-20 text-left">
                    <span className="text-[8px] uppercase font-bold text-amber-200 bg-stone-900/50 border border-stone-700 px-1.5 py-0.5 rounded">
                      Patron: {un.patronSaint}
                    </span>
                    <h4 className="font-sans font-black text-xs sm:text-sm text-white mt-0.5 dropdown-glow-amber">
                      {un.name}
                    </h4>
                  </div>
                </div>
                <div className="p-3.5 flex flex-col gap-3 flex-1 text-left justify-between bg-[#fcfbfa]/50">
                  <p className="text-[11px] text-stone-400 leading-normal line-clamp-2">
                    {un.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



    </div>
  );
}
