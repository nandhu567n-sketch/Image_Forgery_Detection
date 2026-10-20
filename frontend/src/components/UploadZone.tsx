import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface UploadZoneProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  errorMessage: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onAnalyze,
  isLoading,
  selectedFile,
  onFileSelect,
  errorMessage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      onFileSelect(null);
      setPreviewUrl(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Only JPEG and PNG formats are supported for forensic analysis.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File exceeds maximum size threshold of 10 Megabytes.');
      return;
    }

    onFileSelect(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleGenerateSample = (type: 'spliced' | 'authentic') => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'spliced') {
      ctx.fillStyle = '#EBE6DE';
      ctx.fillRect(0, 0, 400, 400);
      for (let i = 0; i < 400; i += 24) {
        ctx.strokeStyle = '#DED8CF';
        ctx.strokeRect(i, i, 48, 48);
      }
      ctx.fillStyle = '#5D7052';
      ctx.fillRect(100, 120, 190, 150);
      ctx.fillStyle = '#F3F4F1';
      ctx.font = '22px Fraunces, serif';
      ctx.fillText('SAMPLE SPLICED', 115, 185);
      ctx.fillText('INSERT REGION', 115, 225);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 400, 400);
      grad.addColorStop(0, '#FDFCF8');
      grad.addColorStop(0.5, '#E6DCCD');
      grad.addColorStop(1, '#DED8CF');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#2C2C24';
      ctx.font = '22px Fraunces, serif';
      ctx.fillText('NATURAL TEXTURE', 90, 200);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample_${type}.jpg`, { type: 'image/jpeg' });
        handleFileChange(file);
      }
    }, 'image/jpeg', 0.92);
  };

  return (
    <div id="upload-section" className="w-full space-y-6">
      {/* Soft Rounded Organic Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full min-h-[240px] rounded-[2.5rem] border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 relative flex flex-col items-center justify-center shadow-soft ${
          isDragging
            ? 'bg-[#5D7052]/10 border-[#5D7052] scale-[1.01]'
            : 'bg-white/70 border-[#DED8CF] hover:bg-white hover:border-[#5D7052] hover:shadow-float'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />

        <div className="space-y-4 max-w-lg pointer-events-none">
          {/* Moss Green Soft Icon Container */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#5D7052]/10 flex items-center justify-center text-[#5D7052] transition-transform duration-300 group-hover:scale-110">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-2xl text-[#2C2C24] tracking-tight">
              {selectedFile ? 'Evidence ready for examination' : 'Deposit photograph or digital document'}
            </h3>
            <p className="text-sm text-[#78786C] font-medium mt-1.5 leading-relaxed">
              Drag and drop an image container, or browse your local storage. Supports JPEG & PNG up to 10 MB.
            </p>
          </div>

          {selectedFile && (
            <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs font-semibold text-[#5D7052]">
              <span className="px-3 py-1 rounded-full bg-[#5D7052]/10">
                {selectedFile.name}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#E6DCCD]/50 text-[#4A4A40]">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
              <span className="px-3 py-1 rounded-full bg-[#E6DCCD]/50 text-[#4A4A40]">
                {selectedFile.type.replace('image/', '').toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Selected Image Thumbnail & Details Card */}
      {selectedFile && previewUrl && (
        <div className="rounded-2xl border border-[#DED8CF] bg-[#FEFEFA] p-5 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl border border-[#DED8CF] bg-[#F0EBE5] overflow-hidden flex-shrink-0 shadow-inner">
              <img
                src={previewUrl}
                alt="Selected Evidence Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#5D7052]" />
                <span className="font-serif font-bold text-sm text-[#2C2C24]">
                  Container Ingested
                </span>
              </div>
              <p className="text-xs text-[#78786C] font-medium mt-0.5 max-w-sm truncate">
                {selectedFile.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleFileChange(null)}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#A85448] bg-[#A85448]/10 hover:bg-[#A85448] hover:text-white transition-all duration-300"
          >
            Clear Selected Media
          </button>
        </div>
      )}

      {/* Quick Test Samples as Soft Pebble Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#78786C] border-b border-[#DED8CF]/60 pb-5">
        <span className="font-semibold text-[#4A4A40]">
          Standard Verification Samples:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleGenerateSample('spliced')}
            className="px-4 py-2 rounded-full border border-[#DED8CF] bg-[#F0EBE5]/60 hover:bg-[#C18C5D] hover:text-white hover:border-[#C18C5D] transition-all duration-300 font-semibold cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            Generate Spliced Test Pattern
          </button>
          <button
            type="button"
            onClick={() => handleGenerateSample('authentic')}
            className="px-4 py-2 rounded-full border border-[#DED8CF] bg-[#F0EBE5]/60 hover:bg-[#5D7052] hover:text-white hover:border-[#5D7052] transition-all duration-300 font-semibold cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            Generate Pristine Test Pattern
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-5 rounded-2xl border border-[#A85448]/40 bg-[#A85448]/5 flex items-start space-x-3 text-[#A85448] shadow-soft">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-serif font-bold text-sm">
              Analysis Notice
            </div>
            <div className="text-[#4A4A40] leading-relaxed">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Primary Action Button: Moss Green Pill */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          disabled={!selectedFile || isLoading}
          onClick={() => selectedFile && onAnalyze(selectedFile)}
          className={`min-h-[52px] min-w-[300px] px-10 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center space-x-3 ${
            !selectedFile || isLoading
              ? 'bg-[#E6DCCD] text-[#78786C] cursor-not-allowed'
              : 'bg-[#5D7052] text-[#F3F4F1] shadow-soft hover:shadow-float hover:scale-105 active:scale-95 cursor-pointer'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#F3F4F1]" />
              <span>Synthesizing 11 Forensic Probes...</span>
            </>
          ) : (
            <span>Run Forensic Synthesis</span>
          )}
        </button>
      </div>
    </div>
  );
};
