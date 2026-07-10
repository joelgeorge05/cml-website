/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, ServerCrash, Loader2, Sparkles } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import OfficeBearersView from './components/OfficeBearersView';
import UnitsView from './components/UnitsView';
import HistoryView from './components/HistoryView';
import GalleryView from './components/GalleryView';
import DownloadsView from './components/DownloadsView';
import KalolsavamView from './components/KalolsavamView';
import SahithyamalsaramView from './components/SahithyamalsaramView';
import ChosenView from './components/ChosenView';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const [dbData, setDbData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Load persistent user and fetch current database
  useEffect(() => {
    const savedUser = localStorage.getItem('cml_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('cml_user');
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setDbData(data);
        setIsOfflineFallback(false);
      } else {
        console.error('Failed to receive static dataset from API');
        setIsOfflineFallback(true);
      }
    } catch (e) {
      console.error('Error fetching database:', e);
      setIsOfflineFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDatabase = async (updatedData: any, action: string, target: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/save-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updatedData,
          userEmail: currentUser?.email || 'Anonymous',
          action,
          target
        })
      });
      if (response.ok) {
        setDbData(updatedData);
        return true;
      } else {
        console.error('Save failed on the back-end host');
        return false;
      }
    } catch (e) {
      console.error('Failed to make save-database fetch request:', e);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cml_user');
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

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('cml_user', JSON.stringify(data.user));
          handleSetActiveTab('admin');
          setEmail('');
          setPassword('');
        } else {
          setLoginError(data.error || 'Authentication failed');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setLoginError(errorData.error || 'Invalid username or password credentials.');
      }
    } catch (err) {
      console.error('Login request error:', err);
      setLoginError('Could not reach the authentication host server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Render proper loader when app loads for first time
  if (isLoading && !dbData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-sans gap-4 p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative flex flex-col items-center z-10">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
          <h2 className="text-xl font-bold tracking-wider uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mt-2">
            Cherupushpa Mission League
          </h2>
          <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-mono">
            Loading Holy Ledger Session...
          </p>
        </div>
      </div>
    );
  }

  // Fallback if data is missing completely
  if (!dbData) {
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
            images={dbData.galleryImages || []}
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
      case 'admin':
        if (!currentUser) {
          // Render elegant login interface in-place
          return (
            <div className="w-full min-h-[70vh] flex items-center justify-center py-12 px-4 bg-[#fdfbf7]">
              <div className="w-full max-w-md bg-white rounded-3xl border border-rose-150/60 shadow-[0_10px_40px_rgba(244,63,94,0.06)] p-8 relative overflow-hidden flex flex-col gap-6 text-left">
                {/* Visual top design ribbon */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-800 via-amber-400 to-rose-900" />
                
                <div className="flex flex-col items-center text-center gap-1.5 mt-2">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shadow-sm shadow-rose-100/50">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight leading-none uppercase mt-2">
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
                        placeholder="e.g. joelveliyath05@gmail.com"
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

        return (
          <AdminDashboard
            dbData={dbData}
            currentUser={currentUser}
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
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-between selection:bg-rose-500 selection:text-white">
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
      <main className="flex-grow flex flex-col">
        {renderTabContent()}
      </main>

      {/* Universal Website Footer */}
      <Footer
        setActiveTab={handleSetActiveTab}
        settings={dbData.settings}
      />
    </div>
  );
}
