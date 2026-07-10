/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { Shield, Lock, Mail, ServerCrash, Loader2, Sparkles, ArrowLeft, Home } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import OfficeBearersView from './components/OfficeBearersView';
import UnitsView from './components/UnitsView';
import HistoryView from './components/HistoryView';
const GalleryView = React.lazy(() => import('./components/GalleryView'));
import DownloadsView from './components/DownloadsView';
const KalolsavamView = React.lazy(() => import('./components/KalolsavamView'));
const SahithyamalsaramView = React.lazy(() => import('./components/SahithyamalsaramView'));
const ChosenView = React.lazy(() => import('./components/ChosenView'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
import { shakhaExecutives } from './data/shakha_executives';
import cmlLogo from '/logo.png';

export default function App() {
  const getInitialTab = () => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    return path || 'home';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    window.history.pushState({}, '', tab === 'home' ? '/' : `/${tab}`);
    if (tab === 'admin') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const [dbData, setDbData] = useState<any>({
    settings: {
      supportDesk: '',
      email: '',
      mottoPrimary: '',
      mottoSecondary: '',
      heroIntro: '',
      parishUnitsCount: 0,
    },
    announcements: [],
    news: [],
    officeBearers: [],
    units: [],
    events: [],
    galleryAlbums: [],
    galleryImages: [],
    downloads: [],
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Restore Supabase session on mount and subscribe to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setCurrentUser(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    fetchData();
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    // 1. Instantly load from local cache if available to prevent buffering
    const cachedData = localStorage.getItem('cml_db_cache');
    if (cachedData) {
      setDbData(JSON.parse(cachedData));
      setIsLoading(false); // Remove loading screen instantly
    }

    try {
      if (!cachedData) setIsLoading(true); // Only show loader on very first visit ever
      
      const [settings, announcements, news, officeBearers, units, events, galleryAlbums, downloads] =
        await Promise.all([
          supabase.from('settings').select('id, support_desk, email, motto_primary, motto_secondary, hero_intro, parish_units_count, show_kalolsavam, show_sahithyamalsaram, show_overall_leaderboard, show_chosen, hero_slides, hero_interval').single(),
          supabase.from('announcements').select('id, text, type, date, is_sticky').order('date', { ascending: false }).limit(20),
          supabase.from('news').select('id, title, body, category, image_url, date, is_featured').order('date', { ascending: false }).limit(10),
          supabase.from('office_bearers').select('id, name, designation, photo_url, contact, email, service_period, order_index, house_name, unit').order('order_index'),
          supabase.from('units').select('id, name, patron_saint, contact_number, bg_photo, order_index, joint_director_name, joint_director_phone, director_name, director_phone, president_name, president_phone, stats_members, stats_families, stats_directors_count, description').order('order_index'),
          supabase.from('events').select('id, title, type, date, time, venue, description, image_url, summary').order('date', { ascending: false }).limit(10),
          supabase.from('gallery_albums').select('id, title, category, description, cover_image_url'),
          supabase.from('downloads').select('id, title, type, size, date, file_url, description').order('date', { ascending: false }),
        ]);

      if (settings.error) throw settings.error;

      // Map snake_case DB columns back to the camelCase shape the components expect
      const s = settings.data;
      const freshData = {
        settings: {
          id: s.id,
          supportDesk: s.support_desk,
          email: s.email,
          mottoPrimary: s.motto_primary,
          mottoSecondary: s.motto_secondary,
          heroIntro: s.hero_intro,
          parishUnitsCount: s.parish_units_count,
          showKalolsavam: s.show_kalolsavam !== false,
          showSahithyamalsaram: s.show_sahithyamalsaram !== false,
          showOverallLeaderboard: s.show_overall_leaderboard !== false,
          showChosen: s.show_chosen !== false,
          heroSlides: s.hero_slides,
          heroInterval: s.hero_interval,
        },
        announcements: (announcements.data ?? []).map((a: any) => ({ ...a, isSticky: a.is_sticky })),
        news: (news.data ?? []).map((n: any) => ({ ...n, imageUrl: n.image_url, isFeatured: n.is_featured })),
        officeBearers: (officeBearers.data ?? []).map((o: any) => ({ ...o, photoUrl: o.photo_url, servicePeriod: o.service_period, orderIndex: o.order_index, houseName: o.house_name })),
        units: (units.data ?? []).map((u: any) => {
          // Find matching local executive data
          const localExec = Object.entries(shakhaExecutives).find(([k, v]) => u.name?.toLowerCase().includes(k.toLowerCase()))?.[1] || {};
          
          return { 
            ...u, 
            patronSaint: u.patron_saint, 
            contactNumber: u.contact_number, 
            bgPhoto: u.bg_photo, 
            orderIndex: u.order_index, 
            jointDirectorName: localExec.jointDirectorName || u.joint_director_name, 
            jointDirectorPhone: localExec.jointDirectorPhone || u.joint_director_phone, 
            directorName: localExec.directorName || u.director_name,
            directorPhone: localExec.directorPhone || u.director_phone,
            presidentName: localExec.presidentName || u.president_name,
            presidentPhone: localExec.presidentPhone || u.president_phone,
            stats: { 
              members: u.stats_members, 
              families: u.stats_families, 
              directorsCount: u.stats_directors_count 
            } 
          };
        }),
        events: (events.data ?? []).map((e: any) => ({ ...e, imageUrl: e.image_url })),
        galleryAlbums: (galleryAlbums.data ?? []).map((a: any) => ({ ...a, coverImageUrl: a.cover_image_url })),
        downloads: (downloads.data ?? []).map((d: any) => ({ 
          ...d, 
          category: d.type, 
          fileSize: d.size, 
          uploadDate: d.date, 
          downloadUrl: d.file_url 
        })),
        users: localStorage.getItem('cml_dynamic_admins') ? JSON.parse(localStorage.getItem('cml_dynamic_admins')!) : [],
        chosenRegistrations: (() => {
          return localStorage.getItem('cml_chosen_registrations') ? 
            JSON.parse(localStorage.getItem('cml_chosen_registrations')!) : 
            (JSON.parse(localStorage.getItem('cml_db_cache') || '{}').chosenRegistrations || []);
        })()
      };

      // Update state silently in background and save to cache
      setDbData(freshData);
      localStorage.setItem('cml_db_cache', JSON.stringify(freshData));
      setIsOfflineFallback(false);
    } catch (e) {
      console.error('Error fetching from Supabase:', e);
      if (!cachedData) setIsOfflineFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save function: optimistically updates local state; actual DB writes are handled per-component via supabase client
  const handleSaveDatabase = async (updatedData: any, action: string, target: string): Promise<boolean> => {
    setDbData(updatedData);
    localStorage.setItem('cml_db_cache', JSON.stringify(updatedData));
    if (updatedData.users) {
      localStorage.setItem('cml_dynamic_admins', JSON.stringify(updatedData.users));
    }
    if (updatedData.chosenRegistrations) {
      localStorage.setItem('cml_chosen_registrations', JSON.stringify(updatedData.chosenRegistrations));
    }
    
    // Sync Chosen Registrations with Supabase using the registrations table
    if (action === 'ADD_CHOSEN_REGISTRATION' || action === 'DELETE_CHOSEN_REGISTRATION' || action === 'CLEAR_CHOSEN_REGISTRATIONS') {
      try {
        if (action === 'ADD_CHOSEN_REGISTRATION') {
          // target is the participantName. We need to find the new delegate from updatedData
          // It's usually the first one or the one matching the target.
          const newDelegate = updatedData.chosenRegistrations?.[0]; // AdminDashboard prepends it
          if (newDelegate) {
            await supabase.from('registrations').insert({
              id: newDelegate.id,
              competition: 'Summit',
              event_name: 'Chosen Delegate',
              section: newDelegate.className,
              competitor_name: newDelegate.participantName,
              house_name: `${newDelegate.houseName} | ${newDelegate.fatherName}`,
              dob: `${newDelegate.gender}|`,
              cml_id: `${newDelegate.contactNumber}|${newDelegate.parentsContactNumber}`,
              shakha_id: newDelegate.shakha,
              status: newDelegate.position
            });
          }
        } else if (action === 'DELETE_CHOSEN_REGISTRATION') {
          // target is the delegate ID to delete
          await supabase.from('registrations').delete().eq('id', target);
        } else if (action === 'CLEAR_CHOSEN_REGISTRATIONS') {
          await supabase.from('registrations').delete().eq('competition', 'Summit');
        }
      } catch (err) {
        console.error('Failed to sync Chosen Registration with Supabase:', err);
      }
    }
    
    // Also save to the local JSON file database for persistence in the filesystem
    try {
      const token = localStorage.getItem('cml_jwt_token');
      await fetch('/api/save-database', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          updatedData,
          userEmail: currentUser?.email || 'Anonymous',
          action,
          target
        })
      });
    } catch (e) {
      console.warn('Failed to sync with local db.json server backend:', e);
    }
    
    return true;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('cml_jwt_token');
    setCurrentUser(null);
    handleSetActiveTab('home');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError(null);

    // Check dynamic local admin accounts first to bypass Supabase Auth limitations
    try {
      const cachedStr = localStorage.getItem('cml_dynamic_admins');
      if (cachedStr) {
        const dynamicAdmins = JSON.parse(cachedStr);
        const localUser = dynamicAdmins.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password.trim());
        if (localUser) {
          setCurrentUser({
            id: 'dynamic-' + localUser.email,
            email: localUser.email,
            user_metadata: { name: localUser.name, role: localUser.role },
            role: localUser.role
          } as any);
          handleSetActiveTab('admin');
          setEmail('');
          setPassword('');
          setIsLoggingIn(false);
          return;
        }
      }
    } catch (e) {
      console.error('Error parsing dynamic admins', e);
    }

    try {
      // Authenticate with local secure backend to get JWT token
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password: password.trim() })
        });
        const json = await res.json();
        if (json.success && json.token) {
          localStorage.setItem('cml_jwt_token', json.token);
        } else if (!json.success && json.error) {
          console.warn('Backend auth rejected:', json.error);
        }
      } catch (backendErr) {
        console.error('Backend auth failed:', backendErr);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setLoginError(error.message || 'Invalid username or password credentials.');
      } else if (data.user) {
        setCurrentUser(data.user);
        handleSetActiveTab('admin');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error('Login request error:', err);
      setLoginError('Could not reach the authentication server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Render proper loader when app loads for the first time
  if (isLoading && (!dbData || !dbData.settings || !dbData.settings.mottoPrimary)) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center font-sans gap-4 p-4 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="hidden md:block absolute top-0 left-1/4 w-[600px] h-[300px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="hidden md:block absolute top-0 right-1/4 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative flex flex-col items-center z-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white border border-rose-100/80 flex items-center justify-center shadow-lg shadow-rose-100/40 overflow-hidden mb-4 p-1">
            <img src={cmlLogo} alt="CML logo" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <Loader2 className="w-8 h-8 text-rose-700 animate-spin mb-4" />
          <h2 className="text-lg font-black tracking-[0.12em] uppercase font-cinzel text-slate-800 leading-none">
            Cherupushpa Mission League
          </h2>
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-2">
            Kaliyar Mekhala
          </p>
        </div>
      </div>
    );
  }

  // Fallback if data fetching fails completely
  if (isOfflineFallback) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="p-6 rounded-full bg-red-100 text-red-600 mb-4 border border-red-250">
          <ServerCrash className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-none">Database Offline</h2>
        <p className="text-stone-600 max-w-md mt-3 mb-6 text-sm">
          Failed to load application registry from the local store. Please check server logs or restart the development container.
        </p>
        <button 
          onClick={fetchData}
          className="px-6 py-2.5 bg-rose-700 text-white font-semibold text-sm rounded-xl hover:bg-rose-800 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Render actual route component dynamically
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            settings={dbData.settings}
            announcements={dbData.announcements}
            news={dbData.news}
            bearers={dbData.officeBearers}
            units={dbData.units}
            events={dbData.events}
            albums={dbData.galleryAlbums}
            downloads={dbData.downloads}
            setActiveTab={handleSetActiveTab}
          />
        );
      case 'bearers':
        return (
          <OfficeBearersView
            bearers={dbData.officeBearers}
            dbData={dbData}
            isAdminLoggedIn={!!currentUser}
            onSaveDatabase={handleSaveDatabase}
          />
        );
      case 'units':
        return (
          <UnitsView
            units={dbData.units}
            dbData={dbData}
            onSaveDatabase={handleSaveDatabase}
          />
        );
      case 'history':
        return <HistoryView />;
      case 'gallery':
        return (
          <GalleryView
            albums={dbData.galleryAlbums}
          />
        );
      case 'downloads':
        return <DownloadsView downloads={dbData.downloads} />;
      case 'kalolsavam':
        return (
          <KalolsavamView
            dbData={dbData}
            isAdminLoggedIn={!!currentUser}
            onSaveDatabase={handleSaveDatabase}
            currentUser={currentUser}
          />
        );
      case 'sahithyamalsaram':
        return (
          <SahithyamalsaramView
            dbData={dbData}
            isAdminLoggedIn={!!currentUser}
            onSaveDatabase={handleSaveDatabase}
            currentUser={currentUser}
          />
        );
      case 'chosen':
        return (
          <ChosenView
            dbData={dbData}
            onSaveDatabase={handleSaveDatabase}
          />
        );
      case 'poster':
        return (
          <div className="w-full max-w-5xl mx-auto px-4 py-12 flex flex-col items-center gap-6 text-center animate-fade-in">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">CML CENTRAL PROMOTIONS</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-cinzel">Official Campaign Poster</h2>
              <p className="text-sm text-slate-600 max-w-xl">
                This is the updated official poster featuring the live preview of the landing page embedded inside the laptop screen.
              </p>
            </div>
            <div className="w-full border border-slate-200 rounded-3xl overflow-hidden shadow-2xl bg-white p-4">
              <img src="/poster.png" alt="CML Kaliyar Mekhala Poster" className="w-full max-h-[80vh] object-contain rounded-2xl" />
            </div>
            <a 
              href="/poster.png" 
              download="cml_poster.png"
              className="mt-4 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-rose-500/20"
            >
              Download Poster Image
            </a>
          </div>
        );
      case 'admin':
        if (!currentUser) {
          // Render elegant login interface in-place
          return (
            <div className="w-full min-h-[70vh] flex items-center justify-center py-12 px-4 bg-[#fdfbf7]">
              <div className="w-full max-w-md bg-white rounded-3xl border border-rose-150/60 shadow-[0_10px_40px_rgba(244,63,94,0.06)] p-8 relative overflow-hidden flex flex-col gap-6 text-left">
                {/* Visual top design ribbon */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-800 via-amber-400 to-rose-900" />
                
                <div className="flex flex-col items-center text-center gap-1.5 mt-2">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-rose-100 flex items-center justify-center shadow-sm shadow-rose-100/50 overflow-hidden">
                    <img src={cmlLogo} alt="CML logo" className="w-full h-full object-contain" />
                  </div>
                  <h2 className="text-xl font-black font-cinzel text-slate-900 tracking-[0.08em] leading-none uppercase mt-2">
                    Administrator Authentication
                  </h2>
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed">
                    ⚠️ {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#5c030c] font-sans">
                      Username / Email ID
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@cmlkaliyarmekhala.live"
                        className="w-full pl-11 pr-4 py-3 bg-[#fdfbf7] border border-stone-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/5 transition font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#5c030c] font-sans">
                      Security Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-[#fdfbf7] border border-stone-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/5 transition font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-[#5c030c] hover:bg-[#850411] active:scale-98 text-amber-200 font-bold py-3.5 rounded-2xl text-sm uppercase tracking-widest hover:text-white shadow-md shadow-rose-955/25 select-none transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-75 disabled:pointer-events-none"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        <span>Verifying Security Clearence...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>AUTHORIZE LOGIN</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          );
        }

        const mappedUser = {
          ...currentUser,
          name: (dbData?.users || []).find((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase())?.name || currentUser?.user_metadata?.name || '',
          role: (dbData?.users || []).find((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase())?.role || currentUser?.user_metadata?.role || 'Admin',
        };

        return (
          <AdminDashboard
            dbData={dbData}
            currentUser={mappedUser}
            onSaveDatabase={handleSaveDatabase}
            onLogout={handleLogout}
            onGoToTab={(tab) => handleSetActiveTab(tab)}
          />
        );
      default:
        return (
          <div className="py-20 text-center font-sans">
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-stone-500 mt-2">The selected tab does not exist.</p>
            <button 
              onClick={() => handleSetActiveTab('home')}
              className="mt-4 px-4 py-2 bg-rose-700 text-white rounded-lg text-sm"
            >
              Go Home
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-between selection:bg-rose-500 selection:text-white overflow-x-clip">
      {/* Universal Website Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        settings={dbData.settings}
        announcements={dbData.announcements || []}
        isAdminLoggedIn={!!currentUser}
        onLogout={handleLogout}
        onOpenAdmin={() => handleSetActiveTab('admin')}
        isOfflineFallback={isOfflineFallback}
      />

      {/* Main Dynamic Viewport Frame */}
      <main className="flex-grow flex flex-col relative">
        {activeTab !== 'home' && activeTab !== 'admin' && (
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 -mb-2 flex lg:hidden justify-start z-30">
            <button
              onClick={() => handleSetActiveTab('home')}
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 hover:bg-slate-950 border border-stone-200/80 hover:border-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-amber-200 shadow-xs hover:shadow-[0_8px_25px_rgba(15,23,42,0.15)] active:scale-95 transition-all duration-300 ease-out cursor-pointer backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 group-hover:-translate-x-1 transition-all duration-300" />
              <span>Back to Home</span>
            </button>
          </div>
        )}
        <Suspense fallback={
          <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh] bg-[#fdfbf7]">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="mt-4 text-stone-500 font-sans text-xs font-bold animate-pulse tracking-widest uppercase">Loading Module...</p>
          </div>
        }>
          {renderTabContent()}
        </Suspense>

        {/* Floating Back to Home button for quick mobile reachability */}
        {activeTab !== 'home' && activeTab !== 'admin' && (
          <button
            onClick={() => handleSetActiveTab('home')}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 bg-slate-950/95 hover:bg-[#5c030c] border border-amber-500/30 text-amber-200 hover:text-white rounded-full shadow-[0_10px_35px_rgba(92,3,12,0.3)] backdrop-blur-md transition-all duration-350 ease-out group cursor-pointer active:scale-95 text-[10px] font-black uppercase tracking-widest md:hidden"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:text-white group-hover:-translate-x-1 transition-all duration-300" />
            <Home className="w-4 h-4 text-amber-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
            <span>Home</span>
          </button>
        )}
      </main>

      {/* Universal Website Footer */}
      <Footer
        setActiveTab={handleSetActiveTab}
        settings={dbData.settings}
      />
    </div>
  );
}
