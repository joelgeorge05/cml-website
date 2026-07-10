/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Heart, Award, MapPin, Calendar, Compass, ExternalLink, Mail, Phone } from 'lucide-react';
import { PortalSettings } from '../types';
import cmlLogoImg from '../assets/images/logo.jpg';

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
            Cherupushpa Mission League is the largest lay missionary association in Asia, dedicated to spiritual renewal, missionary zeal, and active parish service across Kaliyar Mekhala.
          </p>
          <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold pt-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Motto: Love • Sacrifice • Service • Suffering</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-3 text-left">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Useful Navs</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <button onClick={() => setActiveTab('home')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <Compass className="w-3 h-3" /> Home Overview
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('bearers')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Active Office Bearers
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('units')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Find Parish Units
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('events')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Mekhala Kalolsavam 2026
              </button>
            </li>
          </ul>
        </div>

        {/* Resources / Links */}
        <div className="flex flex-col gap-3 text-left">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Resources</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <button onClick={() => setActiveTab('downloads')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Diocesan Circulars
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('downloads')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Download Form templates
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('gallery')} className="hover:text-rose-400 transition flex items-center gap-1.5">
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
              <span className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-400 font-mono text-[10.5px] transition-colors duration-150 font-medium">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                </span>
                Dev Joel
              </span>
              <span className="text-slate-800">•</span>
              <button 
                onClick={() => setActiveTab('admin')} 
                className="inline-flex items-center gap-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 hover:text-white px-2 py-0.5 rounded border border-rose-900/30 hover:border-rose-800/40 transition-all duration-150 cursor-pointer text-[9.5px] uppercase font-bold tracking-wider select-none shrink-0"
              >
                <ShieldCheck className="w-3 h-3 text-rose-500" />
                <span>Admin Console</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/40 border border-amber-500/15 shadow-[0_2px_10px_rgba(245,158,11,0.04)] text-[10.5px] sm:text-xs text-amber-200 select-none backdrop-blur-xs">
              <div className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
              </div>
              <img 
                src={cmlLogoImg} 
                alt="CML Logo" 
                className="w-4 h-4 rounded-full object-cover shrink-0 border border-slate-700/50" 
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-medium tracking-wide">
                Snehahm, Thyagam, Sevanam, Sahanam
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
