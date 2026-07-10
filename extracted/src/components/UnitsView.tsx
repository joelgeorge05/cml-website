/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Phone } from 'lucide-react';
import { ParishUnit } from '../types';

interface UnitsViewProps {
  units: ParishUnit[];
  dbData?: any;
  onSaveDatabase?: (updatedData: any, action: string, target: string) => Promise<boolean>;
}

export default function UnitsView({ units }: UnitsViewProps) {
  return (
    <div className="w-full bg-slate-50 py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 text-left">
        
        {/* Title / Search layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-5">
          <div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
              Shakha Directory
            </h2>
          </div>
        </div>

        {/* Directory Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {units.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 font-medium text-sm">No parish units available.</p>
            </div>
          ) : (
            units.map((un) => {
              return (
                <div
                  key={un.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col group hover:border-slate-300 hover:shadow-sm transition text-left"
                >
                  {/* Card Cover Picture */}
                  <div role="img" aria-label={un.name} className="h-32 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10"></div>
                    <img
                      src={un.bgPhoto}
                      alt={un.name}
                      className="w-full h-full object-cover absolute inset-0 z-0 opacity-60 scale-102 transform group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute bottom-3 left-4 right-4 z-20">
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-slate-950/75 border border-slate-800/80 px-2 py-0.5 rounded shadow">
                        Saint: {un.patronSaint}
                      </span>
                      <h4 className="font-display font-black text-sm md:text-base text-white mt-1 leading-tight truncate" title={un.name}>
                        {un.name}
                      </h4>
                    </div>
                  </div>

                  {/* Elegant Readonly Contact View */}
                  <div className="p-4 flex flex-col flex-1 gap-4 justify-between bg-white">
                    <div className="flex flex-col gap-4 text-left">
                      
                      {/* CML Director Section */}
                      <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-rose-750 block mb-1">
                          Director
                        </label>
                        <div className="w-full bg-slate-50/50 border border-slate-100 rounded-lg px-2.5 py-2 flex flex-col justify-center min-h-[56px]">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {un.directorName || <span className="text-slate-400 italic font-normal">No Director Assigned</span>}
                          </div>
                          {un.directorPhone ? (
                            <a
                              href={`tel:${un.directorPhone}`}
                              className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-rose-600 hover:text-rose-500 mt-1 select-all transition-colors"
                              title={`Click to call ${un.directorName}`}
                            >
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{un.directorPhone}</span>
                            </a>
                          ) : (
                            un.directorName && <span className="text-[10px] text-slate-400 italic mt-0.5">No Phone Number</span>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100" />

                      {/* CML President Section */}
                      <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-amber-750 block mb-1">
                          President
                        </label>
                        <div className="w-full bg-slate-50/50 border border-slate-100 rounded-lg px-2.5 py-2 flex flex-col justify-center min-h-[56px]">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {un.presidentName || <span className="text-slate-400 italic font-normal">No President Assigned</span>}
                          </div>
                          {un.presidentPhone ? (
                            <a
                              href={`tel:${un.presidentPhone}`}
                              className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-700 hover:text-amber-600 mt-1 select-all transition-colors"
                              title={`Click to call ${un.presidentName}`}
                            >
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{un.presidentPhone}</span>
                            </a>
                          ) : (
                            un.presidentName && <span className="text-[10px] text-slate-400 italic mt-0.5">No Phone Number</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Card container padding buffer */}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
