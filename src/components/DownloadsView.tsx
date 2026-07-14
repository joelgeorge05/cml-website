/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Search, Download, Calendar, Layers, CheckCircle } from 'lucide-react';
import { DownloadItem } from '../types';

interface DownloadsViewProps {
  downloads: DownloadItem[];
}

export default function DownloadsView({ downloads }: DownloadsViewProps) {
  const circularDownloads: DownloadItem[] = [
   {
     id: 'circular-mekhala-june-20',
     title: 'Mekhala Circular June 20',
     category: 'circular',
     fileSize: 'PDF',
     downloadUrl: new URL('../assets/circulars/Cirucular June 20.pdf', import.meta.url).href,
     uploadDate: '2026-06-20',
     description: 'Mekhala office circular for June 20.'
   },
   {
     id: 'circular-diocese-may-2026',
     title: 'Diocese Circular May 2026',
     category: 'circular',
     fileSize: 'PDF',
     downloadUrl: new URL('../assets/circulars/Circular May 2026-1.pdf', import.meta.url).href,
     uploadDate: '2026-05-01',
     description: 'Diocese circular for May 2026.'
   },
   {
     id: 'report-form-2025-26',
     title: 'Diocese Report Form 2025-26',
     category: 'form',
     fileSize: 'PDF',
     downloadUrl: new URL('../assets/circulars/Sakha Annual Report 2025-26 (2).pdf', import.meta.url).href,
     uploadDate: '2026-06-20',
     description: 'Annual report form for the year 2025-26.'
   }
  ];

  const [selectedFileCategory, setSelectedFileCategory] = useState<string>('circular');
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filterTabs = [
   { id: 'circular', label: 'Circulars' },
   { id: 'form', label: 'Forms & Resources' },
   { id: 'All', label: 'All Files' }
  ];

  console.log('allDownloads:', [...circularDownloads, ...downloads]);
  const allDownloads = [...circularDownloads, ...downloads];
  const filteredDownloads = allDownloads.filter((item) => {
   const matchesCategory = selectedFileCategory === 'All' || item.category === selectedFileCategory;
   const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
   return matchesCategory && matchesSearch;
  });

  const handleDownloadClick = (item: DownloadItem) => {
   setSuccessToast(`Initiating File Download: "${item.title}" (${item.fileSize})`);
   setTimeout(() => {
     setSuccessToast(null);
   }, 4000);

   try {
     const link = document.createElement("a");
     if (link.download !== undefined) {
       link.setAttribute("href", item.downloadUrl);
       link.setAttribute("download", item.title.replace(/\s+/g, '_') + '.pdf');
       link.style.visibility = 'hidden';
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     }
    } catch (e) {
      console.error("Manual file download failure:", e);
    }
  };

  return (
    <div className="w-full bg-slate-50 py-12 px-4 md:px-6 relative">
      
      {/* Visual slide Toast Notification */}
      {successToast && (
        <div className="fixed top-4 right-4 bg-slate-900 border border-emerald-500/80 text-white p-4 rounded-xl shadow-2xl z-50 max-w-sm flex items-center gap-3 animate-slide-left text-left">
          <div className="p-2 bg-emerald-500 rounded-lg text-slate-950 shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-400">Download Commencing</span>
            <p className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5">{successToast}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto flex flex-col gap-8 text-left">
        
        {/* Title Presentation Block */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto w-full mb-2 border-b border-slate-200/60 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-100 rounded-full shadow-3xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-rose-800 tracking-widest uppercase">
              Important Resources
            </span>
          </div>

          <h2 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl text-black tracking-tight leading-none pb-1">
            Downloads
          </h2>

          {/* Decorative underline */}
          <div className="flex items-center gap-2 justify-center mt-1">
            <div className="w-8 sm:w-12 h-[3px] rounded-full bg-rose-400" />
            <div className="w-16 sm:w-24 h-[3px] rounded-full bg-gradient-to-r from-rose-400 to-amber-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-sm" />
            <div className="w-16 sm:w-24 h-[3px] rounded-full bg-gradient-to-l from-rose-400 to-amber-400" />
            <div className="w-8 sm:w-12 h-[3px] rounded-full bg-rose-400" />
          </div>
        </div>

        {/* Filter & Search controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          
          <div className="relative w-full sm:max-w-xs bg-slate-50 border border-slate-100 rounded-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query files or guides..."
              className="w-full pl-9 pr-4 py-2 border-none rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full select-none pb-1 sm:pb-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFileCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase shrink-0 transition ${
                  selectedFileCategory === tab.id
                    ? 'bg-rose-700 text-white'
                    : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Downloads listing loop */}
        <div className="flex flex-col gap-4 text-left">
          {filteredDownloads.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
            >
              
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-xl shrink-0 ${
                  'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  <FileText className="w-6 h-6" />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      'bg-amber-600 text-amber-50'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">📅 Released: {item.uploadDate}</span>
                  </div>
                  <h4 className="font-sans font-extrabold text-sm text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Download trigger button right */}
              <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-center justify-between sm:justify-start border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wide">
                  Size: {item.fileSize}
                </span>

                <button
                  onClick={() => handleDownloadClick(item)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" /> Save File
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Fallback empty view */}
        {filteredDownloads.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-slate-400 text-xs">No documentation assets matched current filters or queries.</p>
          </div>
        )}

      </div>
    </div>
  );
}





