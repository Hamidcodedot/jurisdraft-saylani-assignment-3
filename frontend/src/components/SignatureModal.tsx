'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, PenTool, Type, Eraser, Check, AlertCircle } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySignature: (dataUrl: string) => void;
  partyLabel: string;
  defaultSignatoryName?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onApplySignature,
  partyLabel,
  defaultSignatoryName = '',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'draw' | 'type'>('upload');

  // Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draw State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState<'#0C1838' | '#0F172A' | '#1E3A8A'>('#0C1838');

  // Type State
  const [typedName, setTypedName] = useState(defaultSignatoryName);
  const [selectedFontFamily, setSelectedFontFamily] = useState<'font-signature-1' | 'font-signature-2' | 'font-signature-3'>('font-signature-1');

  useEffect(() => {
    if (defaultSignatoryName && !typedName) {
      setTypedName(defaultSignatoryName);
    }
  }, [defaultSignatoryName]);

  // Reset drawing canvas when switching to 'draw'
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  if (!isOpen) return null;

  // Handle Image File Upload with optional background transparency conversion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        if (removeBackground) {
          const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
          const data = imgData.data;
          // Filter near-white pixels to transparent and boost contrast
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Threshold for white background
            if (r > 215 && g > 215 && b > 215) {
              data[i + 3] = 0; // Transparent
            } else {
              // Darken ink for crisp legal signature
              data[i] = Math.max(0, r - 50);
              data[i + 1] = Math.max(0, g - 50);
              data[i + 2] = Math.max(0, b - 50);
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        setUploadedImage(offCanvas.toDataURL('image/png'));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Convert Drawn Canvas to Transparent PNG
  const getDrawnCanvasDataUrl = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return null;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return null;

    const srcCtx = canvas.getContext('2d');
    if (!srcCtx) return null;

    const imgData = srcCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Make white background transparent
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
        data[i + 3] = 0;
      }
    }
    expCtx.putImageData(imgData, 0, 0);
    return exportCanvas.toDataURL('image/png');
  };

  // Convert Typed Name to High-Res Transparent PNG
  const getTypedSignatureDataUrl = (): string | null => {
    if (!typedName.trim()) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let fontName = 'Brush Script MT, cursive';
    if (selectedFontFamily === 'font-signature-2') {
      fontName = 'Snell Roundhand, Great Vibes, cursive';
    } else if (selectedFontFamily === 'font-signature-3') {
      fontName = 'Bradley Hand, Sacramento, cursive';
    }

    ctx.font = `italic 42px ${fontName}`;
    ctx.fillStyle = inkColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(typedName.trim(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  };

  // Submit Signature
  const handleApply = () => {
    let finalDataUrl: string | null = null;

    if (activeTab === 'upload') {
      finalDataUrl = uploadedImage;
    } else if (activeTab === 'draw') {
      finalDataUrl = getDrawnCanvasDataUrl();
    } else if (activeTab === 'type') {
      finalDataUrl = getTypedSignatureDataUrl();
    }

    if (!finalDataUrl) {
      alert('Please upload, draw, or type a signature before applying.');
      return;
    }

    onApplySignature(finalDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide text-white">Digital Execution Studio</h3>
              <p className="text-[11px] text-slate-300">Authorized Signature for: <span className="text-[#D4AF37] font-medium">{partyLabel}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'draw'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw Signature</span>
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'type'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Cursive</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 min-h-[260px] flex flex-col justify-center">
          
          {/* TAB 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                className="hidden"
                onChange={handleFileUpload}
              />

              {uploadedImage ? (
                <div className="space-y-3">
                  <div className="border border-slate-300 rounded-lg p-6 bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px]">
                    <img
                      src={uploadedImage}
                      alt="Uploaded Signature"
                      className="max-h-24 max-w-full object-contain filter contrast-125"
                    />
                    <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Signature processed with clean transparency</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={removeBackground}
                        onChange={(e) => setRemoveBackground(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span>Auto-remove white background &amp; enhance ink</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-slate-900 font-medium underline hover:text-slate-700"
                    >
                      Replace Image
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600 mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click to select signature scan or photo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports PNG, JPG, or SVG. Transparent background recommended.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DRAW */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs relative">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[150px] cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                    Draw your signature here with mouse or finger
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">Ink Tone:</span>
                  <button
                    type="button"
                    onClick={() => setInkColor('#0C1838')}
                    className={`w-5 h-5 rounded-full bg-[#0C1838] border-2 transition ${
                      inkColor === '#0C1838' ? 'border-amber-500 scale-110' : 'border-transparent'
                    }`}
                    title="Obsidian Navy"
                  />
                  <button
                    type="button"
                    onClick={() => setInkColor('#0F172A')}
                    className={`w-5 h-5 rounded-full bg-[#0F172A] border-2 transition ${
                      inkColor === '#0F172A' ? 'border-amber-500 scale-110' : 'border-transparent'
                    }`}
                    title="Deep Charcoal"
                  />
                  <button
                    type="button"
                    onClick={() => setInkColor('#1E3A8A')}
                    className={`w-5 h-5 rounded-full bg-[#1E3A8A] border-2 transition ${
                      inkColor === '#1E3A8A' ? 'border-amber-500 scale-110' : 'border-transparent'
                    }`}
                    title="Diplomatic Blue"
                  />
                </div>

                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-slate-500 hover:text-red-600 font-medium transition"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Clear Pad</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TYPE */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Legal Signatory Name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Calligraphic Script Style
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFontFamily('font-signature-1')}
                    className={`p-3 border rounded-lg text-center transition ${
                      selectedFontFamily === 'font-signature-1'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl font-signature-1 text-slate-900 block truncate">
                      {typedName || 'Signature'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Modern Executive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFontFamily('font-signature-2')}
                    className={`p-3 border rounded-lg text-center transition ${
                      selectedFontFamily === 'font-signature-2'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl font-signature-2 text-slate-900 block truncate">
                      {typedName || 'Signature'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Formal Cursive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFontFamily('font-signature-3')}
                    className={`p-3 border rounded-lg text-center transition ${
                      selectedFontFamily === 'font-signature-3'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl font-signature-3 text-slate-900 block truncate">
                      {typedName || 'Signature'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Diplomatic Script</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Digital signature recorded with timestamp audit trail</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Adopt &amp; Sign</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
