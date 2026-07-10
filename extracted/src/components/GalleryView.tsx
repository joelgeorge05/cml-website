/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Image, Search, ChevronRight, Share2, Compass, Layers, Minimize } from 'lucide-react';
import { GalleryAlbum, GalleryImage } from '../types';

interface GalleryViewProps {
  albums: GalleryAlbum[];
  images: GalleryImage[];
}

export default function GalleryView({ albums, images }: GalleryViewProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('All');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const filteredImages = selectedAlbumId === 'All'
    ? images
    : images.filter((img) => img.albumId === selectedAlbumId);

  const albumsMap = React.useMemo(() => {
    return albums.reduce((acc, alb) => {
      acc[alb.id] = alb.title;
      return acc;
    }, {} as Record<string, string>);
  }, [albums]);

  return (
    <div className="w-full bg-slate-50 py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 text-left">
        
        {/* Page title and description */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <h2 className="font-sans font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
            Mekhala Media Gallery
          </h2>
        </div>

        {/* Album / Category Filter Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin select-none">
          <button
            onClick={() => setSelectedAlbumId('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase shrink-0 transition ${
              selectedAlbumId === 'All'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 bg-white hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Images ({images.length})
          </button>

          {albums.map((alb) => {
            const count = images.filter(img => img.albumId === alb.id).length;
            return (
              <button
                key={alb.id}
                onClick={() => setSelectedAlbumId(alb.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase shrink-0 transition flex items-center gap-1.5 ${
                  selectedAlbumId === alb.id
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-slate-600 bg-white hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>📁 {alb.title}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  selectedAlbumId === alb.id ? 'bg-rose-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Masonry-like image grid display */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setLightboxImage(img)}
              className="break-inside-avoid bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden group cursor-pointer hover:border-slate-300 hover:shadow-md transition duration-200 relative"
            >
              <img
                src={img.imageUrl}
                alt={img.title}
                className="w-full object-cover max-h-[420px] scale-100 group-hover:scale-102 transition duration-500"
              />
              {/* Image title overlay header on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col justify-end p-4 text-left">
                <span className="text-[9px] uppercase font-bold text-amber-400">
                  Album: {albumsMap[img.albumId] || 'Miscellaneous'}
                </span>
                <h4 className="font-sans font-bold text-sm text-white mt-1 leading-snug">
                  {img.title}
                </h4>
                <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                  Published: {img.createdAt}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty status check */}
        {filteredImages.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-slate-400 text-xs">No media files captured inside this portfolio album yet.</p>
          </div>
        )}

        {/* Lightbox Modal overlay */}
        {lightboxImage && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-50 animate-fade-in select-none">
            
            {/* Header controls inside lightbox */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-4 text-slate-300">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-amber-500">
                  Album: {albumsMap[lightboxImage.albumId] || 'Miscellaneous'}
                </span>
                <h3 className="font-sans font-bold text-base text-white mt-0.5 leading-tight">
                  {lightboxImage.title}
                </h3>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 border border-slate-800 hover:bg-slate-900 rounded-full text-slate-300 hover:text-white transition"
                title="Close Lightbox"
              >
                ✕ Close
              </button>
            </div>

            {/* Main high resolution picture renderer */}
            <div className="relative max-w-4xl max-h-[75vh] overflow-hidden rounded-2xl border border-slate-900 bg-black flex items-center justify-center">
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title}
                className="max-w-full max-h-[75vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Description footer panel inside lightbox */}
            <div className="w-full max-w-4xl flex items-center justify-between mt-4 border-t border-slate-900 pt-3 text-slate-500 text-[11px] font-medium">
              <span>Published timestamp: {lightboxImage.createdAt}</span>
              <span className="flex items-center gap-1 text-slate-400">
                ⭐ Kaliyar Mekhala Official Archives
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
