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
 UserCheck,
 X
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

import flagImg from '../assets/images/flag.webp';
import logoImg from '../assets/images/logo.webp';
import chosenImg from '../assets/images/chosen_leaders_meet.webp';

// Leadership Images
import directorImg from '../assets/images/director.webp';
import asstDirectorImg from '../assets/images/assistant Director.webp';
import presidentImg from '../assets/images/Preseident.webp';

import thereseImg from '../assets/images/st_therese.webp';

import reloopVideo from '../assets/images/reloop video.mp4';
import halfYearlyCouncilImg from '../assets/images/half yearly council.webp';
import chosen2Img from '../assets/images/chosen 2.webp';
import orphanageImg from '../assets/images/Orphange visit.webp';
import chosen3Img from '../assets/images/chosen 3.webp';
import alterBoysImg from '../assets/images/alter boys meeting.webp';
import goldenStarImg from '../assets/images/golden_star.webp';
const groupPhotoImg = chosenImg;
const cmlLogoImg = logoImg;
import founderPriestImg from '../assets/images/founder_director.webp';
import founderLaymanImg from '../assets/images/founder.webp';
const saintLittleFlowerImg = thereseImg;

const LEADERSHIP_MESSAGES: Record<string, { title: string, name: string, role: string, image: string, theme: string, content: string[] }> = {
 director: {
 title: "സന്ദേശം",
 name: "ഫാ. ജേക്കബ് റാത്തപ്പിള്ളി",
 role: "Director",
 image: directorImg,
 theme: "amber",
 content: [
 "\"സഭയെ സ്നേഹിക്കുക, ലോകത്തിൽ സാക്ഷികളാകുക എന്ന ഈ വർഷത്തെ ആപ്തവാക്യം നമ്മുടെ ജീവിതത്തിനുള്ള മനോഹരമായ വിളിയാണ്. സഭയോടുള്ള സ്നേഹം ഹൃദയത്തിൽ വളർത്തി, ക്രിസ്തുവിന്റെ സാക്ഷികളായി ലോകത്തിലേക്ക് ഇറങ്ങിച്ചെല്ലുവാനാണ് ഈ വചനം നമ്മെ ഓർമ്മപ്പെടുത്തുന്നത്.\"",
 "സി.എം.എൽ സംഘടനയുടെ ആപ്തവാക്യമായ 'സ്നേഹം, ത്യാഗം, സേവനം, സഹനം' എന്ന നാല് മൂല്യങ്ങൾ ഈ ദൗത്യത്തിന് ശക്തമായ അടിത്തറയാണ്. പരസ്പരം സ്നേഹിക്കുകയും, മറ്റുള്ളവർക്കായി ത്യാഗം സഹിക്കുകയും, ആവശ്യത്തിലിരിക്കുന്നവരെ സേവിക്കുകയും, പ്രതിസന്ധികളിൽ ക്ഷമയോടെയും സഹനത്തോടെയും നിലകൊള്ളുകയും ചെയ്യുമ്പോൾ നാം യഥാർത്ഥ ക്രിസ്തീയ സാക്ഷികളാകുന്നു.",
 "കുട്ടികളുടെയും യുവജനങ്ങളുടെയും ഹൃദയങ്ങളിൽ ഈ മൂല്യങ്ങൾ ആഴത്തിൽ വേരുറപ്പിക്കട്ടെ. കുടുംബത്തിലും വിദ്യാലയത്തിലും സമൂഹത്തിലും നല്ല മനസ്സോടെയും വിശ്വാസധീരതയോടെയും ജീവിച്ച്, സഭയ്ക്ക് അഭിമാനവും ലോകത്തിന് പ്രത്യാശയും നൽകുന്ന തലമുറയായി വളരാൻ സാധിക്കട്ടെ.",
 "സി.എം.എൽ മേഖലയുടെ എല്ലാ പ്രവർത്തനങ്ങൾക്കും ദൈവത്തിന്റെ അനുഗ്രഹം ഉണ്ടാകട്ടെ. ഈ പുതിയ പ്രവർത്തനവർഷം സ്നേഹത്തിന്റെയും സേവനത്തിന്റെയും വിശ്വാസസാക്ഷ്യത്തിന്റെയും മനോഹരമായ അനുഭവമാകട്ടെ എന്ന് ആശംസിക്കുന്നു."
 ]
 },
 assistant: {
 title: "ആശംസ",
 name: "ഫാ. ആന്റണി മുട്ടത്തുകുടിയിൽ",
 role: "Assistant Director",
 image: asstDirectorImg,
 theme: "rose",
 content: [
 "കുട്ടികളുടെ ഹൃദയങ്ങളിൽ സഭയോടുള്ള സ്നേഹവും മിഷനറി ചൈതന്യവും വളർത്തുക എന്ന മഹത്തായ ദൗത്യമാണ് സി.എം.എൽ സംഘടന നിർവഹിക്കുന്നത്. സുവിശേഷം വാക്കുകളിലൂടെ മാത്രം അല്ല, ജീവിതത്തിലൂടെ പ്രഘോഷിക്കപ്പെടേണ്ടതാണ് എന്ന തിരിച്ചറിവ് കുട്ടികളിൽ വളർത്തുവാൻ ഈ സംഘടനയുടെ പ്രവർത്തനങ്ങൾക്ക് സാധിക്കുന്നു.",
 "\"സഭയെ സ്നേഹിക്കുക, ലോകത്തിനു സാക്ഷികളാകുക\" എന്ന ആശയം ഈ ദൗത്യത്തിന് കൂടുതൽ അർത്ഥം നൽകുന്നു. സഭയോടുള്ള സ്നേഹം ഹൃദയത്തിൽ സൂക്ഷിച്ചുകൊണ്ട്, ക്രിസ്തുവിന്റെ സ്നേഹവും കരുണയും നന്മയും മറ്റുള്ളവരിലേക്ക് പകരുമ്പോഴാണ് നാം ലോകത്തിൽ യഥാർത്ഥ സാക്ഷികളാകുന്നത്.",
 "സി.എം.എൽ ആപ്തവാക്യമായ സ്നേഹം, ത്യാഗം, സേവനം, സഹനം ഓരോ അംഗത്തിന്റെയും ജീവിതമൂല്യങ്ങളായി മാറട്ടെ. സ്നേഹത്തോടെ മറ്റുള്ളവരെ സ്വീകരിക്കാനും, ചെറിയ ത്യാഗങ്ങളിലൂടെ വലിയ നന്മകൾ ചെയ്യാനും, ആവശ്യത്തിലിരിക്കുന്നവരെ സേവിക്കാനും, പ്രതിസന്ധികളിൽ ക്ഷമയോടെ നിലകൊള്ളാനും കുട്ടികൾ പരിശീലിക്കട്ടെ.",
 "വീട്ടിലും വിദ്യാലയത്തിലും ഇടവകയിലും നല്ല പ്രവൃത്തികളിലൂടെ ക്രിസ്തുവിനെ പരിചയപ്പെടുത്തുന്ന ചെറു മിഷനറിമാരായി ഓരോ കുട്ടിയും വളരട്ടെ. സി.എം.എൽ മേഖലയുടെ എല്ലാ പ്രവർത്തനങ്ങൾക്കും ദൈവാനുഗ്രഹം സമൃദ്ധമായി ലഭിക്കട്ടെ എന്നും, ഈ പ്രവർത്തനവർഷം വിശ്വാസത്തിന്റെയും സേവനത്തിന്റെയും സന്തോഷപൂർണമായ അനുഭവമാകട്ടെ എന്നും ആശംസിക്കുന്നു."
 ]
 },
 president: {
 title: "ആമുഖം",
 name: "ജോയൽ ജോർജ്",
 role: "President",
 image: presidentImg,
 theme: "indigo",
 content: [
 "വിശ്വാസജീവിതത്തെ കൂടുതൽ ആഴത്തിലാക്കുകയും, സഭാസ്നേഹത്തിലും മിഷനറി ചൈതന്യത്തിലും പുതുതലമുറയെ വളർത്തുകയും ചെയ്യുക എന്ന മഹത്തായ ദൗത്യവുമായി മുന്നേറുന്ന ചെറുപുഷ്പ മിഷൻ ലീഗ് കാളിയാർ മേഖലയുടെ ഈ പ്രവർത്തനവർഷം, ദൈവാനുഗ്രഹപൂർണമായ ഒരു ആത്മീയ യാത്രയുടെ തുടക്കമാണ്. \"സഭയെ സ്നേഹിക്കുക, ലോകത്തിൽ സാക്ഷികളാകുക\" എന്ന ഈ വർഷത്തെ ആപ്തവാക്യം, ഓരോ സി.എം.എൽ അംഗത്തിന്റെയും ഹൃദയത്തിൽ വിശ്വാസത്തിന്റെ തീപ്പൊരി തെളിയിക്കുന്ന ആത്മീയ ആഹ്വാനമായി മാറുന്നു. സഭയോടുള്ള ആത്മാർത്ഥമായ സ്നേഹം ജീവിതത്തിൽ വളർത്തി, ക്രിസ്തുവിന്റെ സ്നേഹവും സത്യവും കരുണയും പ്രവർത്തികളിലൂടെ ലോകത്തിനു സാക്ഷ്യപ്പെടുത്തുക എന്ന ദൗത്യത്തിലേക്കാണ് ഈ ആപ്തവാക്യം നമ്മെ നയിക്കുന്നത്.",
 "സി.എം.എൽ സംഘടനയുടെ ആത്മാവായി നിലകൊള്ളുന്ന 'സ്നേഹം, ത്യാഗം, സേവനം, സഹനം' എന്ന നാല് മഹത്തായ മൂല്യങ്ങൾ, ഈ പ്രവർത്തനവർഷത്തിലെ ഓരോ പ്രവർത്തനത്തിനും പഠനത്തിനും അടിത്തറയാകുന്നു. സ്നേഹത്തോടെ മറ്റുള്ളവരെ സ്വീകരിക്കാനും, ത്യാഗത്തിലൂടെ നന്മയുടെ വഴികൾ തുറക്കാനും, സേവനത്തിലൂടെ ക്രിസ്തുവിന്റെ കരുണയെ പകരാനും, സഹനത്തിലൂടെ വിശ്വാസത്തിൽ ഉറച്ചു നിൽക്കാനും കുട്ടികളെയും യുവജനങ്ങളെയും പരിശീലിപ്പിക്കുന്ന ആത്മീയ ശിക്ഷണവേദിയായാണ് സി.എം.എൽ കാളിയാർ മേഖല തന്റെ പ്രവർത്തനങ്ങളെ രൂപപ്പെടുത്തുന്നത്. ഓരോ അംഗത്തിന്റെയും ജീവിതത്തിൽ ഈ മൂല്യങ്ങൾ വെറും ആശയങ്ങളായി മാത്രമല്ല, ദിനചര്യയിൽ പ്രകടമാകുന്ന ജീവിതസാക്ഷ്യങ്ങളായിത്തീരണം എന്നതാണ് ഈ പ്രവർത്തനവർഷത്തിന്റെ ആഗ്രഹം.",
 "ഈ വർഷത്തെ പഠനവിഷയവും മേഖലാതല പ്രവർത്തനങ്ങളും കുട്ടികളുടെയും യുവജനങ്ങളുടെയും ആത്മീയ വളർച്ചയ്ക്കും സഭാബോധത്തിനും സാമൂഹിക പ്രതിബദ്ധതയ്ക്കും പുതുവഴികൾ തുറക്കുന്നതായിരിക്കട്ടെ. കുടുംബത്തിലും വിദ്യാലയത്തിലും ഇടവകയിലും സമൂഹത്തിലും നല്ല പ്രവൃത്തികളിലൂടെ ക്രിസ്തുവിനെ പരിചയപ്പെടുത്തുന്ന ചെറു മിഷനറിമാരായി ഓരോ അംഗവും വളരട്ടെ. വിശ്വാസത്തിൽ ദൃഢതയും സേവനത്തിൽ സമർപ്പണവും സ്നേഹത്തിൽ സൗമ്യതയും ജീവിതത്തിൽ സാക്ഷ്യവും പ്രകടമാക്കുന്ന ഒരു തലമുറയെ രൂപപ്പെടുത്താൻ ചെറുപുഷ്പ മിഷൻ ലീഗ് കാളിയാർ മേഖല നടത്തുന്ന ഈ ശ്രമങ്ങൾ അനുഗ്രഹീതമായ ഫലങ്ങൾ നൽകട്ടെ.",
 "പഠനത്തിന്റെയും പ്രാർത്ഥനയുടെയും പ്രവർത്തനസമർപ്പണത്തിന്റെയും ഈ പുതിയ വർഷം, മേഖലയുടെ ഓരോ യൂണിറ്റിനും അംഗങ്ങൾക്കും നവോന്മേഷം പകരുന്ന അനുഗ്രഹകാലമാകട്ടെ. കാളിയാർ മേഖലയിൽ സംഘടിപ്പിക്കുന്ന എല്ലാ ശിക്ഷണപരിപാടികളും പഠനസമ്മേളനങ്ങളും ആത്മീയ പ്രവർത്തനങ്ങളും കുട്ടികളുടെയും യുവജനങ്ങളുടെയും ജീവിതത്തിൽ ക്രിസ്തുവിന്റെ വെളിച്ചം നിറയ്ക്കുകയും, സഭയ്ക്കും സമൂഹത്തിനും അഭിമാനകരമായ വിശ്വാസസാക്ഷികളെ രൂപപ്പെടുത്തുകയും ചെയ്യട്ടെ. വിശുദ്ധ ചെറുപുഷ്പത്തിന്റെ മാധ്യസ്ഥ്യവും ദൈവത്തിന്റെ അളവറ്റ അനുഗ്രഹവും ഈ പ്രവർത്തനവർഷമൊട്ടാകെ കാളിയാർ മേഖലയെ നയിക്കട്ടെ എന്ന പ്രാർത്ഥനയോടും പ്രത്യാശയോടും കൂടി."
 ]
 }
};

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

 const defaultSlides: any[] = [
 {
 id: 'default-0',
 type: 'image',
 imageUrl: goldenStarImg,
 captionTitle: 'Golden Star',
 captionVenue: 'Nirmala Public School',
 isActive: true
 },
 {
 id: 'default-1',
 type: 'image',
 imageUrl: chosenImg,
 captionTitle: 'Chosen Leaders Meet',
 captionVenue: 'Jai Rani Public School, Kaliyar',
 isActive: true
 },

 {
 id: 'default-3',
 type: 'image',
 imageUrl: halfYearlyCouncilImg,
 captionTitle: 'Half Yearly Council',
 captionVenue: "St. Rita's Forane Church, Kaliyar",
 isActive: true
 },
 {
 id: 'default-4',
 type: 'image',
 imageUrl: chosen2Img,
 captionTitle: 'Chosen Leaders Meet',
 captionVenue: 'Jai Rani Public School, Kaliyar',
 isActive: true
 },
 {
 id: 'default-5',
 type: 'image',
 imageUrl: orphanageImg,
 captionTitle: 'Orphanage Visit',
 captionVenue: 'Jeevakarunya Bhavan',
 isActive: true
 },
 {
 id: 'default-6',
 type: 'image',
 imageUrl: chosen3Img,
 captionTitle: 'Chosen Leaders Meet',
 captionVenue: 'Jai Rani Public School, Kaliyar',
 isActive: true
 },
 {
 id: 'default-7',
 type: 'image',
 imageUrl: alterBoysImg,
 captionTitle: 'Altar Boys Meeting',
 captionVenue: "St. Rita's Forane Church, Kaliyar",
 isActive: true
 }
 ];

 const activeSlides = (settings.heroSlides && settings.heroSlides.filter(s => s.isActive).length > 0)
 ? settings.heroSlides.filter(s => s.isActive)
 : defaultSlides;

 const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
 const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
 const intervalSeconds = settings.heroInterval || 8;

 useEffect(() => {
 if (activeSlides.length <= 1) return;
 const timer = setInterval(() => {
 setCurrentSlideIndex((prevIdx) => (prevIdx + 1) % activeSlides.length);
 }, intervalSeconds * 1000);
 return () => clearInterval(timer);
 }, [activeSlides.length, intervalSeconds]);

 const currentIndex = currentSlideIndex % activeSlides.length;
 const currentSlide = activeSlides[currentIndex] || activeSlides[0];

 const renderStudyTopicBanner = (className: string) => (
 <div className={`w-full max-w-lg ${className}`}>
 <div className="bg-white/80 border border-amber-500/30 rounded-[24px] px-5 py-4 shadow-[0_12px_40px_rgba(244,63,94,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] flex flex-row items-center justify-start gap-4 transform transition-all duration-300 hover:shadow-[0_16px_50px_rgba(244,63,94,0.12)] hover:border-amber-500/55 hover:-translate-y-0.5 cursor-default group relative overflow-hidden">
 <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
 <div className="flex items-center justify-center w-[52px] h-[52px] rounded-[18px] bg-gradient-to-tr from-rose-500 via-rose-450 to-amber-400 shrink-0 shadow-lg shadow-rose-500/25 group-hover:rotate-[-5deg] group-hover:scale-105 transition-transform duration-300 relative z-10">
 <BookOpen className="w-5 h-5 text-white" />
 </div>
 <div className="flex flex-col items-start flex-1 min-w-0 z-10">
 <span className="text-[9px] font-mono font-black text-rose-600 uppercase tracking-[0.25em] mb-1">
 Study Topic
 </span>
 <span className="font-malayalam font-extrabold text-[16px] sm:text-[18px] text-stone-900 leading-snug w-full whitespace-normal drop-shadow-xs">
 സഭയെ സ്നേഹിക്കാം, ലോകത്തിൽ സാക്ഷികളാകാം
 </span>
 </div>
 </div>
 </div>
 );

 return (
 <div className="w-full bg-[#fdfbf7] text-stone-800 relative pb-20 overflow-hidden font-sans">
 
 {/* Dynamic Background Sparkles/Orbs */}
 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-200/15 via-amber-100/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
 <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-200/10 via-rose-100/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />





 {/* Hero Section */}
 <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-5 min-h-[calc(100vh-260px)] flex flex-col z-10">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6 items-stretch w-full">
 {/* Left Block: Modern Typography & Creed */}
 <div className="lg:col-span-6 flex flex-col justify-start lg:pt-2 text-center items-center gap-2">
 <div className="flex flex-col items-center gap-2 w-full">
 
 {/* Outstanding modern typography in balanced natural theme */}
 <div className="flex flex-col items-center gap-3 w-full">
 <div className="flex items-center justify-center select-none mb-1">
 <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-stone-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
 <span className="w-1.5 h-1.5 rotate-45 bg-amber-500 shrink-0" />
 <span className="text-[9px] sm:text-[10px] font-sans font-black uppercase tracking-[0.3em] text-stone-600 pl-[0.3em] select-none">
 OUR SACRED CREED
 </span>
 <span className="w-1.5 h-1.5 rotate-45 bg-rose-500 shrink-0" />
 </div>
 </div>
 
 <div className="relative group w-full max-w-[96%] mx-auto mt-1 mb-1">
 {/* Subtle outer glow for the card */}
 <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-amber-200/40 via-white/40 to-rose-200/40 rounded-[2.5rem] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
 
 {/* Main Elegant Card Container */}
 <div className="relative bg-white/70 border border-stone-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[2rem] p-3 xs:p-4 sm:p-5 flex flex-col items-center gap-3 sm:gap-4 overflow-hidden transition-all duration-300 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] group-hover:border-stone-300/60">
 
 {/* Decorative Top Flourish Line */}
 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 opacity-90" />

 <div className="flex flex-col gap-2 sm:gap-3 select-none font-malayalam leading-tight relative z-10 w-full">
 {/* Line 1: സ്നേഹം, ത്യാഗം */}
 <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 xs:gap-x-4 sm:gap-x-6 w-full max-w-[420px] xl:max-w-[480px] mx-auto">
 <span className="text-stone-900 font-black text-[26px] xs:text-[32px] sm:text-[48px] lg:text-[42px] xl:text-[52px] tracking-normal drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02] text-right leading-tight">
 സ്നേഹം
 </span>
 {/* Decorative Separator Column */}
 <div className="flex flex-col items-center justify-center gap-1 opacity-90">
 <span className="inline-block w-1 h-1 rounded-full bg-rose-300" />
 <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
 <span className="inline-block w-1 h-1 rounded-full bg-amber-300" />
 </div>
 <span className="text-stone-900 font-black text-[26px] xs:text-[32px] sm:text-[48px] lg:text-[42px] xl:text-[52px] tracking-normal drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02] text-left leading-tight">
 ത്യാഗം
 </span>
 </div>
 
 {/* Inner Horizontal Divider */}
 <div className="flex items-center justify-center w-full opacity-50 my-0.5">
 <div className="h-[1.5px] w-full max-w-[140px] xs:max-w-[180px] sm:max-w-[200px] bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
 </div>

 {/* Line 2: സേവനം, സഹനം */}
 <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 xs:gap-x-4 sm:gap-x-6 w-full max-w-[420px] xl:max-w-[480px] mx-auto">
 <span className="text-[#f43f5e] font-black text-[26px] xs:text-[32px] sm:text-[48px] lg:text-[42px] xl:text-[52px] tracking-normal drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02] text-right leading-tight">
 സേവനം
 </span>
 {/* Decorative Separator Column */}
 <div className="flex flex-col items-center justify-center gap-1 opacity-90">
 <span className="inline-block w-1 h-1 rounded-full bg-amber-300" />
 <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
 <span className="inline-block w-1 h-1 rounded-full bg-rose-300" />
 </div>
 <span className="text-[#f59e0b] font-black text-[26px] xs:text-[32px] sm:text-[48px] lg:text-[42px] xl:text-[52px] tracking-normal drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02] text-left leading-tight">
 സഹനം
 </span>
 </div>
 </div>

 {/* Elegant Corner Accents */}
 <div className="absolute top-4 left-4 w-4 h-4 sm:w-5 sm:h-5 border-t-[1.5px] border-l-[1.5px] border-amber-400/40 rounded-tl-xl transition-all duration-300 group-hover:border-amber-400/70 group-hover:w-6 group-hover:h-6" />
 <div className="absolute top-4 right-4 w-4 h-4 sm:w-5 sm:h-5 border-t-[1.5px] border-r-[1.5px] border-rose-400/40 rounded-tr-xl transition-all duration-300 group-hover:border-rose-400/70 group-hover:w-6 group-hover:h-6" />
 <div className="absolute bottom-4 left-4 w-4 h-4 sm:w-5 sm:h-5 border-b-[1.5px] border-l-[1.5px] border-rose-400/40 rounded-bl-xl transition-all duration-300 group-hover:border-rose-400/70 group-hover:w-6 group-hover:h-6" />
 <div className="absolute bottom-4 right-4 w-4 h-4 sm:w-5 sm:h-5 border-b-[1.5px] border-r-[1.5px] border-amber-400/40 rounded-br-xl transition-all duration-300 group-hover:border-amber-400/70 group-hover:w-6 group-hover:h-6" />
 </div>
 </div>
 </div>

 {/* Premium Redesigned Quick Access Portals */}
 {((settings?.showKalolsavam !== false) || (settings?.showSahithyamalsaram !== false) || (settings?.showChosen !== false)) && (
 <div className="flex lg:hidden flex-col gap-2 mt-4 text-center select-none w-full">
 <div className="flex items-center justify-center gap-1.5 opacity-90">
 <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-stone-500">
 Active Quick Portals
 </span>
 </div>
 
 <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mt-3 px-4 w-full">
 {settings?.showKalolsavam !== false && (
 <button
 onClick={() => setActiveTab('kalolsavam')}
 className="group relative flex items-center justify-between h-[52px] pl-6 pr-2 w-full sm:w-auto min-w-[240px] rounded-full bg-rose-500/5 border-[1.5px] border-rose-400/50 hover:border-transparent hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 shadow-[0_8px_16px_-6px_rgba(244,63,94,0.15)] hover:shadow-[0_12px_40px_-8px_rgba(244,63,94,0.8)] transition-all duration-500 ease-out text-left cursor-pointer transform hover:-translate-y-1.5 overflow-hidden"
 >
 <span className="relative text-[11px] sm:text-[12px] font-black text-rose-600 uppercase tracking-widest group-hover:text-white transition-colors duration-400">
 Kalolsavam Results
 </span>
 <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-rose-500 text-white shadow-lg group-hover:bg-white group-hover:text-rose-500 transition-colors duration-500 ml-4 group-hover:scale-110">
 <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500" />
 </div>
 </button>
 )}

 {settings?.showSahithyamalsaram !== false && (
 <button
 onClick={() => setActiveTab('sahithyamalsaram')}
 className="group relative flex items-center justify-between h-[52px] pl-6 pr-2 w-full sm:w-auto min-w-[240px] rounded-full bg-amber-500/5 border-[1.5px] border-amber-400/50 hover:border-transparent hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 shadow-[0_8px_16px_-6px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_-8px_rgba(245,158,11,0.8)] transition-all duration-500 ease-out text-left cursor-pointer transform hover:-translate-y-1.5 overflow-hidden"
 >
 <span className="relative text-[11px] sm:text-[12px] font-black text-amber-600 uppercase tracking-widest group-hover:text-white transition-colors duration-400">
 Sahithyamalsaram Results
 </span>
 <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-amber-500 text-white shadow-lg group-hover:bg-white group-hover:text-amber-500 transition-colors duration-500 ml-4 group-hover:scale-110">
 <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500" />
 </div>
 </button>
 )}

 {settings?.showChosen !== false && (
 <button
 onClick={() => setActiveTab('chosen')}
 className="group relative flex items-center justify-between h-[52px] pl-6 pr-2 w-full sm:w-auto min-w-[240px] rounded-full bg-indigo-500/5 border-[1.5px] border-indigo-400/50 hover:border-transparent hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 shadow-[0_8px_16px_-6px_rgba(99,102,241,0.15)] hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.8)] transition-all duration-500 ease-out text-left cursor-pointer transform hover:-translate-y-1.5 overflow-hidden"
 >
 <span className="relative text-[11px] sm:text-[12px] font-black text-indigo-600 uppercase tracking-widest group-hover:text-white transition-colors duration-400">
 Chosen Registration
 </span>
 <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-indigo-500 text-white shadow-lg group-hover:bg-white group-hover:text-indigo-500 transition-colors duration-500 ml-4 group-hover:scale-110">
 <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500" />
 </div>
 </button>
 )}
 </div>
 </div>
 )}

 {/* Study Topic Banner */}
 <div className="flex flex-col gap-2 mt-0 w-full items-center select-none font-sans">
 {renderStudyTopicBanner("hidden lg:block mx-auto")}
 
 {/* Scroll Down Indicator (Desktop) */}
 <div 
 className="hidden lg:flex mt-1 flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer z-20" 
 onClick={() => {
 const nextSection = document.getElementById('parish-units-section');
 if (nextSection) {
 const offset = 80;
 const bodyRect = document.body.getBoundingClientRect().top;
 const elementRect = nextSection.getBoundingClientRect().top;
 const elementPosition = elementRect - bodyRect;
 const offsetPosition = elementPosition - offset;
 window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
 } else {
 window.scrollBy({ top: 500, behavior: 'smooth' });
 }
 }}
 >
 <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-stone-500">Discover More</span>
 <div className="w-[20px] h-[34px] rounded-full border-[1.5px] border-stone-400/60 flex justify-center pt-1.5 relative shadow-sm bg-white/30">
 <div className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" />
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Right Block: Magnificent Showcase of the Community (Dynamic Carousel) */}
 <div className="lg:col-span-6 flex flex-col justify-center items-center relative w-full gap-3">
 
 {/* Atmospheric background glow halo behind showcase */}
 <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-amber-500/10 rounded-[40px] blur-3xl pointer-events-none scale-105 z-0" />

 {/* The Cinematic community card with elegant glassmorphic double-outline frame */}
 <div className="relative w-full aspect-[4/3] sm:aspect-[1.4] md:aspect-[1.5] lg:aspect-[1.62] xl:aspect-[1.65] border-[3.5px] border-yellow-400 bg-white/60 p-1 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:scale-[1.01] hover:border-yellow-500 hover:shadow-[0_25px_60px_rgba(234,179,8,0.15)] transition-all duration-500 ease-out z-10 group/hero-frame">
 
 {/* Internal container with golden outline and rounded corners */}
 <div className="w-full h-full rounded-[26px] overflow-hidden bg-stone-950 relative border border-yellow-500/35">
 <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent z-10 pointer-events-none" />
 
 <AnimatePresence>
 <motion.div
 key={currentSlide.id}
 initial={{ x: '100%', opacity: 0 }}
 animate={{ x: '0%', opacity: 1 }}
 exit={{ x: '-100%', opacity: 0 }}
 transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
 className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
 >
 {currentSlide.type === 'video' ? (
 <video
 src={currentSlide.imageUrl}
 className={`min-w-full min-h-full object-cover z-0 ${currentSlide.rotate ? '-rotate-90 scale-[1.8]' : ''}`}
 autoPlay
 muted
 loop
 playsInline
 />
 ) : (
 <>
 {currentSlide.fit === 'object-contain' && (
 <img loading="lazy"
 src={currentSlide.imageUrl}
 alt=""
 className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-70 scale-110 z-0"
 referrerPolicy="no-referrer"
 />
 )}
 <img loading="lazy"
 src={currentSlide.imageUrl}
 alt={currentSlide.captionTitle}
 className={`w-full h-full ${currentSlide.fit || 'object-cover'} ${currentSlide.position || 'object-center'} relative z-10 transform ${currentSlide.zoomClass || 'scale-100 group-hover/hero-frame:scale-[1.02]'} transition duration-700 ease-out`}
 referrerPolicy="no-referrer"
 />
 </>
 )}
 </motion.div>
 </AnimatePresence>

 {/* Caption bar - Ultra Premium Glassmorphic Design */}
 <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-max max-w-[90%] z-20 select-none">
 <div className="group relative overflow-hidden rounded-xl bg-black/30 border border-white/10 shadow-2xl px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-6 transition-all duration-500 hover:bg-black/40 hover:border-white/30">
 
 {/* Atmospheric Glow */}
 <div className="absolute -left-12 -top-12 w-40 h-40 bg-rose-500/20 rounded-full blur-[40px] group-hover:bg-rose-500/30 transition-all duration-700 pointer-events-none"></div>
 <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-amber-500/20 rounded-full blur-[40px] group-hover:bg-amber-500/30 transition-all duration-700 pointer-events-none"></div>

 {/* Left Section: Content */}
 <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1 pr-2">
 {/* Premium vertical accent */}
 <div className="w-[3px] h-7 rounded-full bg-gradient-to-b from-amber-400 via-rose-400 to-indigo-500 shadow-[0_0_10px_rgba(251,191,36,0.5)] group-hover:scale-y-110 transition-transform duration-500 shrink-0" />
 
 <div className="flex flex-col gap-1 min-w-0 w-full">
 <h4 className="text-white text-[10.5px] sm:text-[13px] font-black tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight whitespace-nowrap" style={{ fontFamily: 'system-ui, sans-serif' }}>
 {currentSlide.captionTitle}
 </h4>
 {currentSlide.captionVenue && (
 <div className="flex items-start gap-1 mt-0.5 min-w-0 w-full">
 <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-rose-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
 <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.076 3.218-4.442 3.218-7.327C19.5 6.036 16.14 2.5 12 2.5S4.5 6.036 4.5 10.5c0 2.885 1.274 5.25 3.218 7.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
 </svg>
 <span className="text-[7.5px] sm:text-[9px] text-white/60 font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
 {currentSlide.captionVenue}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Right Section: Branding label */}
 <div className="shrink-0 flex flex-col items-end gap-1 relative z-10 border-l border-white/10 pl-2">
 <div className="flex items-center justify-center px-1.5 py-1 rounded-md bg-white/5 border border-white/10 ">
 <span className="text-[6.5px] sm:text-[8px] font-black bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent tracking-wider uppercase whitespace-nowrap">
 CML Kaliyar Mekhala
 </span>
 </div>
 </div>

 </div>
 </div>

 {/* Manual Navigation Buttons */}
 {activeSlides.length > 1 && (
 <>
 <button
 onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
 className="absolute left-3.5 bottom-1/2 translate-y-1/2 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 hover:bg-amber-400 hover:text-black border border-white/10 text-white transition active:scale-95 cursor-pointer flex items-center justify-center text-xs font-bold shadow-md"
 title="Previous Slide"
 >
 ⬹
 </button>
 <button
 onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length)}
 className="absolute right-3.5 bottom-1/2 translate-y-1/2 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 hover:bg-amber-400 hover:text-black border border-white/10 text-white transition active:scale-95 cursor-pointer flex items-center justify-center text-xs font-bold shadow-md"
 title="Next Slide"
 >
 ⬺
 </button>

 {/* Navigation dot indicators */}
 <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-1.5 animate-fade-in pointer-events-auto">
 {activeSlides.map((_, idx) => (
 <button
 key={idx}
 onClick={(e) => {
 e.stopPropagation();
 setCurrentSlideIndex(idx);
 }}
 className="p-1 cursor-pointer group flex items-center justify-center"
 title={`Go to slide ${idx + 1}`}
 >
 <div className={`rounded-full transition-all duration-305 ${
 idx === currentIndex ? 'bg-amber-400 w-3.5 h-1.5' : 'bg-white/40 group-hover:bg-white/70 w-1.5 h-1.5'
 }`} />
 </button>
 ))}
 </div>
 </>
 )}

 </div>
 </div>

 {/* Study Topic Banner (Prominent on Mobile below image) */}
 {renderStudyTopicBanner("lg:hidden mt-3 mx-auto")}

 </div>
 </div>

 </section>


 {/* Leadership Messages Section */}
 <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 lg:pt-16 lg:pb-12 z-10 relative">
 <div className="flex flex-col gap-8 lg:gap-12">
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
 {/* Director's Message (സന്ദേശം) */}
 <div 
 className="bg-white/80 rounded-[2.5rem] p-7 sm:p-9 border-[1.5px] border-stone-200/50 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] hover:border-amber-300/60 transition-all duration-500 flex flex-col relative group overflow-hidden cursor-pointer"
 onClick={() => setActiveMessageId('director')}
 >
 {/* Decorative Quote Mark */}
 <div className="absolute -right-4 -top-8 text-[160px] leading-none text-amber-500/5 font-serif group-hover:text-amber-500/10 transition-colors duration-500 select-none">"</div>
 
 {/* Author Info */}
 <div className="flex items-center gap-4 mb-6 relative z-10">
 <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center border-2 border-amber-200 shadow-sm overflow-hidden shrink-0">
 <img loading="lazy" src={directorImg} alt="Director" className="w-full h-full object-cover" />
 </div>
 <div className="flex flex-col">
 <h4 className="font-black text-stone-900 text-lg leading-tight tracking-tight font-malayalam">ഫാ. ജേക്കബ് റാത്തപ്പിള്ളി</h4>
 <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Director</p>
 </div>
 </div>
 
 {/* Content */}
 <div className="flex-1 relative z-10">
 <div className="flex items-center gap-2 mb-2">
 <h3 className="font-black text-stone-800 text-[16px] tracking-tight font-malayalam">
 സന്ദേശം
 </h3>
 </div>
 <p className="text-stone-600 text-[14px] leading-relaxed font-malayalam line-clamp-6">
 "സഭയെ സ്നേഹിക്കുക, ലോകത്തിൽ സാക്ഷികളാകുക എന്ന ഈ വർഷത്തെ ആപ്തവാക്യം നമ്മുടെ ജീവിതത്തിനുള്ള മനോഹരമായ വിളിയാണ്. സഭയോടുള്ള സ്നേഹം ഹൃദയത്തിൽ വളർത്തി, ക്രിസ്തുവിന്റെ സാക്ഷികളായി ലോകത്തിലേക്ക് ഇറങ്ങിച്ചെല്ലുവാനാണ് ഈ വചനം നമ്മെ ഓർമ്മപ്പെടുത്തുന്നത്."
 </p>
 </div>
 
 {/* Footer */}
 <div className="mt-6 pt-5 border-t border-stone-100/80 flex items-center justify-between relative z-10">
 <button 
 className="text-[10px] font-bold text-stone-400 group-hover:text-amber-600 uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 cursor-pointer"
 onClick={() => setActiveMessageId('director')}
 >
 Read Message <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
 </button>
 </div>
 </div>

 {/* Assistant Director's Message (ആശംസ) */}
 <div 
 className="bg-white/80 rounded-[2.5rem] p-7 sm:p-9 border-[1.5px] border-stone-200/50 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.15)] hover:border-rose-300/60 transition-all duration-500 flex flex-col relative group overflow-hidden cursor-pointer"
 onClick={() => setActiveMessageId('assistant')}
 >
 {/* Decorative Quote Mark */}
 <div className="absolute -right-4 -top-8 text-[160px] leading-none text-rose-500/5 font-serif group-hover:text-rose-500/10 transition-colors duration-500 select-none">"</div>
 
 {/* Author Info */}
 <div className="flex items-center gap-4 mb-6 relative z-10">
 <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center border-2 border-rose-200 shadow-sm overflow-hidden shrink-0">
 <img loading="lazy" src={asstDirectorImg} alt="Assistant Director" className="w-full h-full object-cover" />
 </div>
 <div className="flex flex-col">
 <h4 className="font-black text-stone-900 text-lg leading-tight tracking-tight font-malayalam">ഫാ. ആന്റണി മുട്ടത്തുകുടിയിൽ</h4>
 <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Assistant Director</p>
 </div>
 </div>
 
 {/* Content */}
 <div className="flex-1 relative z-10">
 <div className="flex items-center gap-2 mb-2">
 <h3 className="font-black text-stone-800 text-[16px] tracking-tight font-malayalam">
 ആശംസ
 </h3>
 </div>
 <p className="text-stone-600 text-[14px] leading-relaxed font-malayalam line-clamp-6">
 "കുട്ടികളുടെ ഹൃദയങ്ങളിൽ സഭയോടുള്ള സ്നേഹവും മിഷനറി ചൈതന്യവും വളർത്തുക എന്ന മഹത്തായ ദൗത്യമാണ് സി.എം.എൽ സംഘടന നിർവഹിക്കുന്നത്. സുവിശേഷം വാക്കുകളിലൂടെ മാത്രം അല്ല, ജീവിതത്തിലൂടെ പ്രഘോഷിക്കപ്പെടേണ്ടതാണ് എന്ന തിരിച്ചറിവ് കുട്ടികളിൽ വളർത്തുവാൻ ഈ സംഘടനയുടെ പ്രവർത്തനങ്ങൾക്ക് സാധിക്കുന്നു."
 </p>
 </div>
 
 {/* Footer */}
 <div className="mt-6 pt-5 border-t border-stone-100/80 flex items-center justify-between relative z-10">
 <button 
 className="text-[10px] font-bold text-stone-400 group-hover:text-rose-600 uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 cursor-pointer"
 onClick={() => setActiveMessageId('assistant')}
 >
 Read Message <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
 </button>
 </div>
 </div>

 {/* President's Message (ആമുഖം) */}
 <div 
 className="bg-white/80 rounded-[2.5rem] p-7 sm:p-9 border-[1.5px] border-stone-200/50 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] hover:border-indigo-300/60 transition-all duration-500 flex flex-col relative group overflow-hidden cursor-pointer md:col-span-2 lg:col-span-1"
 onClick={() => setActiveMessageId('president')}
 >
 {/* Decorative Quote Mark */}
 <div className="absolute -right-4 -top-8 text-[160px] leading-none text-indigo-500/5 font-serif group-hover:text-indigo-500/10 transition-colors duration-500 select-none">"</div>
 
 {/* Author Info */}
 <div className="flex items-center gap-4 mb-6 relative z-10">
 <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center border-2 border-indigo-200 shadow-sm overflow-hidden shrink-0">
 <img loading="lazy" src={presidentImg} alt="President" className="w-full h-full object-cover object-top" />
 </div>
 <div className="flex flex-col">
 <h4 className="font-black text-stone-900 text-lg leading-tight tracking-tight font-malayalam">ജോയൽ ജോർജ്</h4>
 <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">President</p>
 </div>
 </div>
 
 {/* Content */}
 <div className="flex-1 relative z-10">
 <div className="flex items-center gap-2 mb-2">
 <h3 className="font-black text-stone-800 text-[16px] tracking-tight font-malayalam">
 ആമുഖം
 </h3>
 </div>
 <p className="text-stone-600 text-[14px] leading-relaxed font-malayalam line-clamp-6">
 "വിശ്വാസജീവിതത്തെ കൂടുതൽ ആഴത്തിലാക്കുകയും, സഭാസ്നേഹത്തിലും മിഷനറി ചൈതന്യത്തിലും പുതുതലമുറയെ വളർത്തുകയും ചെയ്യുക എന്ന മഹത്തായ ദൗത്യവുമായി മുന്നേറുന്ന ചെറുപുഷ്പ മിഷൻ ലീഗ് കാളിയാർ മേഖലയുടെ ഈ പ്രവർത്തനവർഷം, ദൈവാനുഗ്രഹപൂർണമായ ഒരു ആത്മീയ യാത്രയുടെ തുടക്കമാണ്."
 </p>
 </div>
 
 {/* Footer */}
 <div className="mt-6 pt-5 border-t border-stone-100/80 flex items-center justify-between relative z-10">
 <button 
 className="text-[10px] font-bold text-stone-400 group-hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 cursor-pointer"
 onClick={() => setActiveMessageId('president')}
 >
 Read Message <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
 </button>
 </div>
 </div>

 </div>
 </div>
 </section>


 {/* Parish Units Carousel Grid preview */}
 <section id="parish-units-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 z-10 relative">
 <div className="flex flex-col gap-4">
 <div className="flex items-end justify-between border-b border-stone-200/60 pb-2 text-left">
 <div className="flex flex-col">
 <span className="text-[9px] font-bold text-rose-700 uppercase tracking-widest block mb-0.5">Parish Folders</span>
 <h3 className="font-sans font-black text-lg text-stone-900 tracking-tight leading-none">
 Our Active Parish Units
 </h3>
 </div>
 <a
 href="#units"
 onClick={(e) => { e.preventDefault(); setActiveTab('units'); }}
 className="text-xs font-semibold text-rose-700 hover:text-rose-850 transition flex items-center gap-0.5 cursor-pointer hover:underline"
 >
 All Units <ArrowRight className="w-3.5 h-3.5" />
 </a>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
 {units.slice(0, 4).map((un) => (
 <a
 key={un.id}
 href="#units"
 onClick={(e) => { e.preventDefault(); setActiveTab('units'); }}
 className="bg-white rounded-3xl border border-stone-200/60 shadow-3xs overflow-hidden flex flex-col justify-between hover:border-rose-300 hover:shadow-md transition duration-300 group/u cursor-pointer no-underline"
 >
 <div className="h-32 bg-stone-950 relative overflow-hidden flex items-center justify-center">
 <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent z-10" />
 <img loading="lazy"
 alt={un.name}
 src={un.bgPhoto}
 className="w-full h-full object-cover opacity-60 absolute inset-0 z-0 transform group-hover/u:scale-102 transition duration-500"
 />
 <div className="absolute bottom-3 left-3 z-20 text-left">
 <span className="text-[8px] uppercase font-bold text-amber-200 bg-stone-900/50 border border-stone-700 px-1.5 py-0.5 rounded">
 Patron: {un.patronSaint}
 </span>
 <h4 className="font-sans font-black text-xs sm:text-sm text-white mt-0.5 dropdown-glow-amber group-hover/u:text-amber-200 transition-colors duration-300">
 {un.name}
 </h4>
 </div>
 </div>
 <div className="p-3.5 flex flex-col gap-3 flex-1 text-left justify-between bg-[#fcfbfa]/50">
 <p className="text-[11px] text-stone-500 leading-normal">
 {un.description}
 </p>
 </div>
 </a>
 ))}
 </div>
 </div>
 </section>

 {/* Leadership Message Modal */}
 <AnimatePresence>
 {activeMessageId && LEADERSHIP_MESSAGES[activeMessageId] && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ margin: 0 }}>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-stone-900/40 "
 onClick={() => setActiveMessageId(null)}
 />
 
 {/* Modal Content */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 transition={{ type: "spring", duration: 0.5, bounce: 0 }}
 className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10"
 >
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-${LEADERSHIP_MESSAGES[activeMessageId].theme}-200 shadow-sm shrink-0`}>
 <img loading="lazy" src={LEADERSHIP_MESSAGES[activeMessageId].image} alt="Author" className="w-full h-full object-cover object-top" />
 </div>
 <div>
 <h3 className="font-black text-stone-900 text-lg leading-tight font-malayalam">{LEADERSHIP_MESSAGES[activeMessageId].name}</h3>
 <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">{LEADERSHIP_MESSAGES[activeMessageId].role}</p>
 </div>
 </div>
 <button 
 onClick={() => setActiveMessageId(null)}
 className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Scrollable Content */}
 <div className="p-6 sm:p-8 overflow-y-auto">
 <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-${LEADERSHIP_MESSAGES[activeMessageId].theme}-500 to-${LEADERSHIP_MESSAGES[activeMessageId].theme}-600 rounded-full text-white text-[12px] font-bold tracking-wide font-malayalam mb-6 shadow-sm shadow-${LEADERSHIP_MESSAGES[activeMessageId].theme}-500/30`}>
 <BookOpen className="w-3.5 h-3.5 text-white/90" />
 {LEADERSHIP_MESSAGES[activeMessageId].title}
 </div>
 
 <div className="space-y-4">
 {LEADERSHIP_MESSAGES[activeMessageId].content.map((paragraph, idx) => (
 <p key={idx} className="text-stone-700 text-[15px] sm:text-[16px] leading-relaxed font-malayalam">
 {paragraph}
 </p>
 ))}
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </div>
 );
}


