import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageFile: File | null;
  aspectRatio?: number; // 1 for square (Bearers), 16/9 or something for background (Units)
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropperModal({
  isOpen,
  imageFile,
  aspectRatio = 1,
  onClose,
  onCropComplete
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert File to Data URL for the cropper
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImageSrc(null);
    }
    // reset state
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [imageFile]);

  const onCropCompleteHandler = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Crop Image</h3>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-200/50 hover:bg-slate-200 text-slate-500 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cropper Area */}
          <div className="relative w-full h-[300px] sm:h-[400px] bg-stone-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
              objectFit="vertical-cover"
            />
          </div>

          {/* Controls */}
          <div className="p-4 flex flex-col gap-4 bg-white">
            <div className="flex items-center gap-3">
              <ZoomOut className="w-5 h-5 text-slate-400" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
              <ZoomIn className="w-5 h-5 text-slate-400" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="px-6 py-2 flex items-center gap-2 font-bold text-sm text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition shadow-md shadow-rose-200 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : (
                  <>
                    <Check className="w-4 h-4" /> Save Crop
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
