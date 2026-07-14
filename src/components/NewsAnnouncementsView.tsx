/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Newspaper, Search, ArrowRight, Compass, Megaphone, Bookmark } from 'lucide-react';
import { NewsItem, Announcement } from '../types';
import thereseImg from '../assets/images/st_therese.webp';

interface NewsAnnouncementsViewProps {
  news: NewsItem[];
  announcements: Announcement[];
}

export default function NewsAnnouncementsView({ news, announcements }: NewsAnnouncementsViewProps) {
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredNews = news.find((item) => item.isFeatured) || news[0];

  const categories = React.useMemo(() => {
    const list = new Set(news.map((n) => n.category));
    return ['All', ...Array.from(list)];
  }, [news]);

  const filteredNews = news.filter((item) => {
    const matchesCategory = selectedNewsCategory === 'All' || item.category === selectedNewsCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-slate-50 py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 text-left">
        
        {/* Page title and description */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <h2 className="font-sans font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
            News & Press Releases
          </h2>
        </div>

        {/* Featured story banner */}
        {featuredNews && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition grid grid-cols-1 lg:grid-cols-12 gap-0 text-left items-stretch">
            
            <div role="img" aria-label={featuredNews.title} className="lg:col-span-6 h-64 sm:h-80 lg:h-auto bg-slate-100 overflow-hidden relative">
              <img loading="lazy"
                src={featuredNews.imageUrl || thereseImg}
                alt={featuredNews.title}
                className="w-full h-full object-cover scale-102"
              />
              <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider shadow z-10 animate-pulse">
                🎙️ Spotlight Publication
              </div>
            </div>

            <div className="lg:col-span-6 p-6 md:p-10 flex flex-col justify-center gap-4 text-left">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded">
                  Category: {featuredNews.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">📅 {featuredNews.date}</span>
              </div>

              <h3 className="font-sans font-black text-lg md:text-xl text-slate-900 leading-tight">
                {featuredNews.title}
              </h3>

              <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
                {featuredNews.body}
              </p>

              <div className="border-t border-slate-100 pt-3 flex items-center gap-2 text-slate-400 text-xs mt-2">
                <span>By: Mekhala Editorial Desk</span>
                <span>•</span>
                <span>Diocese of Kothamangalam approved</span>
              </div>
            </div>

          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main news roll - Left 8 columns */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <h4 className="font-sans font-bold text-slate-700 text-sm uppercase tracking-wide border-b border-slate-200 pb-2">
              Recent Press Articles
            </h4>

            {/* Filter and search block */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              
              <div className="relative w-full sm:max-w-xs bg-slate-50 border border-slate-100 rounded-xl">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query press articles..."
                  className="w-full pl-9 pr-4 py-2 border-none rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto max-w-full select-none pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedNewsCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase shrink-0 transition ${
                      selectedNewsCategory === cat
                        ? 'bg-rose-700 text-white'
                        : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* News listing item loops */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden"
                >
                  {item.imageUrl && (
                    <div className="h-40 bg-slate-100 overflow-hidden relative">
                      <img loading="lazy"
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-3 text-left flex-1 justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                      </div>
                      <h4 className="font-sans font-extrabold text-sm text-slate-800 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredNews.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-slate-400 text-xs">No press releases found matching current queries.</p>
              </div>
            )}

          </div>

          {/* Quick Bulletin Panel - Right 4 columns representing the urgent announcement listings */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <h4 className="font-sans font-bold text-slate-700 text-sm uppercase tracking-wide border-b border-slate-200 pb-2">
              📢 Central Announcements
            </h4>

            <div className="flex flex-col gap-4 text-left">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-2xl border transition flex gap-3 shadow-xs items-start ${
                    ann.type === 'urgent'
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    ann.type === 'urgent' ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Megaphone className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        ann.type === 'urgent' ? 'bg-rose-800 text-rose-50 animate-pulse' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ann.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{ann.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {ann.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Strategic CML Box */}
            <div className="bg-gradient-to-br from-rose-950 to-slate-950 p-6 rounded-2xl border border-rose-900 shadow-lg text-white">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">CML MISSION PLAN</span>
              <h5 className="font-sans font-bold text-sm text-white mb-2 leading-tight">
                Prayer, Sacrifice, Study, Action
              </h5>
              <p className="text-[11px] text-slate-300 leading-normal">
                Children are formatted as little apostles of Christ. Every coin drop in the CML Mission Sandbox is verified to support diocese seminarians and peripheral missions.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

