/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Search, MapPin, Clock, Award, Compass, Ticket, Layers } from 'lucide-react';
import { CMLEvent } from '../types';

interface EventsViewProps {
  events: CMLEvent[];
}

export default function EventsView({ events }: EventsViewProps) {
  const [selectedCalendarType, setSelectedCalendarType] = useState<'upcoming' | 'past'>('upcoming');

  const filteredEvents = events.filter((ev) => ev.type === selectedCalendarType);

  return (
    <div className="w-full bg-slate-50 py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 text-left">
        
        {/* Page title and description */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <h2 className="font-sans font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
            Mekhala Events Calendar
          </h2>
        </div>

        {/* Tab switcher for Upcoming vs Past */}
        <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl max-w-sm">
          <button
            onClick={() => setSelectedCalendarType('upcoming')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
              selectedCalendarType === 'upcoming'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            â­ Upcoming Conclaves
          </button>
          <button
            onClick={() => setSelectedCalendarType('past')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
              selectedCalendarType === 'past'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ðŸ“ Past Records
          </button>
        </div>

        {/* List render loop */}
        <div className="flex flex-col gap-6 text-left">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row items-stretch shadow-xs hover:border-slate-300 hover:shadow-md transition"
            >
              {/* Event Cover Image left panel */}
              {ev.imageUrl && (
                <div role="img" aria-label={ev.title} className="sm:w-56 bg-slate-950 relative overflow-hidden shrink-0 min-h-48 flex items-center justify-center">
                  <div className="absolute inset-0 bg-rose-950/20 mix-blend-overlay z-10"></div>
                  <img loading="lazy"
                    alt={ev.title}
                    src={ev.imageUrl}
                    className="w-full h-full object-cover scale-102"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-xs text-amber-400 font-mono text-[9px] font-bold px-2 py-1 rounded tracking-wide uppercase border border-slate-800 z-20 shadow">
                    {ev.type === 'upcoming' ? 'âŒ› Coming Soon' : 'âœ“ Completed'}
                  </div>
                </div>
              )}

              {/* Detail parameters content right panel */}
              <div className="p-6 flex flex-col justify-center flex-1 gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <h3 className="font-sans font-extrabold text-base md:text-lg text-slate-900 leading-snug">
                    {ev.title}
                  </h3>
                  <div className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wider self-start sm:self-center">
                    ðŸ—“ï¸ {ev.date}
                  </div>
                </div>

                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium mt-1">
                  {ev.description}
                </p>

                {/* If past event has dynamic summary outcomes */}
                {ev.summary && selectedCalendarType === 'past' && (
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium mt-1 text-left">
                    ðŸ… <strong>Result / Summary:</strong> {ev.summary}
                  </div>
                )}

                {/* Metadata cards */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-500 font-semibold border-t border-slate-100/60 pt-3">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>ðŸ“ {ev.venue}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>ðŸ•’ {ev.time}</span>
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Empty status check */}
        {filteredEvents.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-slate-400 text-xs">No active schedules recorded in this calendar cycle.</p>
          </div>
        )}

      </div>
    </div>
  );
}

