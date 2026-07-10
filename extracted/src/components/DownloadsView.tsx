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
  const [selectedFileCategory, setSelectedFileCategory] = useState<'All' | 'circular' | 'form' | 'report'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filterTabs = [
    { id: 'All', label: 'All Files' },
    { id: 'circular', label: 'Circulars 📜' },
    { id: 'form', label: 'Forms 📋' },
    { id: 'report', label: 'Reports 📊' }
  ];

  const filteredDownloads = downloads.filter((item) => {
    const matchesCategory = selectedFileCategory === 'All' || item.category === selectedFileCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDownloadClick = (item: DownloadItem) => {
    // Show a high fidelity, beautiful custom download feedback notice
    setSuccessToast(`Initiating File Download: "${item.title}" (${item.fileSize})`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);

    // Create a physical downloadable file anchor dynamically
    try {
      let content = "";
      let mimeType = "text/csv;charset=utf-8;";
      let filename = "template.csv";

      if (item.title.toLowerCase().includes("registration sheet") || item.category === "form") {
        content = "Competitor Name,CML ID,Parish Unit Code,Competition,Age Section,Event Name,House Name,DOB\n" +
                  "DEON SIJO,KYR0700404,KYR07,Kalolsavam,SUB JUNIOR BOYS,BIBLE READING,THENGANAKUNNEL,2013-02-06\n" +
                  "ALAN ROY,KYR01-023,KYR01,Kalolsavam,SUB JUNIOR BOYS,BIBLE READING,Vadakkekuttu,2012-05-15\n" +
                  "LIYA BOBBY,KYR03-012,KYR03,Sahithyamalsaram,JUNIOR GIRLS,SPEECH,Puthenveettil,2008-09-22\n" +
                  "SHALU JOSE,KYR04-106,KYR04,Kalolsavam,SENIOR GIRLS,SPEECH,Vadakkemuriyil,2006-04-12\n";
        filename = "CML_Registration_Sheet_Template_2026.csv";
      } else if (item.title.toLowerCase().includes("calendar") || item.title.toLowerCase().includes("planner")) {
        mimeType = "text/plain;charset=utf-8;";
        content = "========================================================================\n" +
                  "       CML KALIYAR MEKHALA CALENDAR & ACTIVITIES PLANNER 2026           \n" +
                  "========================================================================\n\n" +
                  "1. MEKHALA CORE COUNCIL PLANNER\n" +
                  "   - Date: January 10, 2026\n" +
                  "   - Venue: Kaliyar Mekhala Office\n" +
                  "   - Priority: Year-plan approvals and budget approvals\n\n" +
                  "2. PARISH UNIT DIRECTIVE TIMELINE\n" +
                  "   - February 15, 2026: Box Collection submissions\n" +
                  "   - April 20, 2026: Midterm report layout release\n" +
                  "   - May 28, 2026: Kalolsavam delegate allocations\n" +
                  "   - June 12-14, 2026: Chosen Summit Program\n\n" +
                  "3. SCHOLARSHIP EXAM TIMELINE\n" +
                  "   - October 18, 2026: Parish wise Bible Quiz Exams\n\n" +
                  "This is an authorized CML Mekhala circular. Please implement directives carefully.\n";
        filename = "CML_Kaliyar_Mekhala_Calendar_Planner_2026.txt";
      } else {
        content = "REPORT FIELD,METRICS VALUE,FREQUENCY\n" +
                  "Parish Unit Code,e.g. KYR01,Required\n" +
                  "Total Active Members,e.g. 120,Required\n" +
                  "Missionary Boxes Dispersed,e.g. 60,Required\n" +
                  "Total Box Collection In INR,e.g. 4500,Required\n" +
                  "Midterm General Meetings Conducted,e.g. 4,Required\n" +
                  "Remarks,,Optional\n";
        filename = "CML_Midterm_Report_Template_June_2026.csv";
      }

      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
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
        
        {/* Page title and description */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <h2 className="font-sans font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
            Downloads & Office Circulars
          </h2>
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
                  item.category === 'circular' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  item.category === 'form' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                  'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  <FileText className="w-6 h-6" />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      item.category === 'circular' ? 'bg-amber-600 text-amber-50' :
                      item.category === 'form' ? 'bg-rose-700 text-rose-50' :
                      'bg-blue-700 text-blue-50'
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
