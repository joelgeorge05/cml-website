/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Image, Search, ChevronRight, Share2, Compass, Layers, Minimize, Loader2 } from 'lucide-react';
import { GalleryAlbum, GalleryImage } from '../types';
import { supabase } from '../lib/supabase';

interface GalleryViewProps {
  albums: GalleryAlbum[];
}

export default function GalleryView({ albums }: GalleryViewProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('All');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchImages() {
      setIsLoading(true);
      try {
        let query = supabase.from('gallery_images').select('id, album_id, title, image_url, created_at').order('created_at', { ascending: false }).limit(50);
        
        if (selectedAlbumId !== 'All') {
          query = query.eq('album_id', selectedAlbumId);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        setImages((data || []).map((i: any) => ({
          id: i.id,
          albumId: i.album_id,
          title: i.title,
          imageUrl: i.image_url,
          createdAt: i.created_at
        })));
      } catch (err) {
        console.error('Error fetching gallery images:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchImages();
  }, [selectedAlbumId]);

  const filteredImages = images;

  const albumsMap = React.useMemo(() => {
    return albums.reduce((acc, alb) => {
      acc[alb.id] = alb.title;
      return acc;
    }, {} as Record<string, string>);
  }, [albums]);

  return (
    <div className="w-full bg-slate-50 py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 text-left">
        
        {/* Title Presentation Block */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto w-full mb-2 border-b border-slate-200/60 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-100 rounded-full shadow-3xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-rose-800 tracking-widest uppercase">
              Visual Archives & Memories
            </span>
          </div>

          <h2 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl text-black tracking-tight leading-none pb-1">
            Mekhala Media Gallery
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

        {/* Album / Category Filter Cards Removed */}

        {/* Masonry-like image grid display */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        ) : (
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
                  loading="lazy"
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
        )}

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
                âœ• Close
              </button>
            </div>

            {/* Main high resolution picture renderer */}
            <div className="relative max-w-4xl max-h-[75vh] overflow-hidden rounded-2xl border border-slate-900 bg-black flex items-center justify-center">
              <img loading="lazy"
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
                â­ Kaliyar Mekhala Official Archives
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

