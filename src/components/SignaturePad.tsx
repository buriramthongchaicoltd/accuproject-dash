import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, Sparkles, UserCheck } from 'lucide-react';

interface SignaturePadProps {
  signerName: string;
  signatureDataUrl?: string;
  onSaveSignature: (dataUrl: string) => void;
  title?: string;
}

export function SignaturePad({
  signerName,
  signatureDataUrl,
  onSaveSignature,
  title = 'ลงนามสดผู้ขอเบิก (Requester Live Signature)'
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string>(signatureDataUrl || '');

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    // If existing signature passed in, draw it or set image
    if (signatureDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = signatureDataUrl;
    }
  }, [signatureDataUrl]);

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

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if ('touches' in e) {
      e.preventDefault(); // prevent scroll on touch devices
    }

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setCurrentSignature(dataUrl);
      onSaveSignature(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setCurrentSignature('');
    onSaveSignature('');
  };

  // Preset quick signature generator based on name
  const useDefaultStoredSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = 'italic bold 28px "Caveat", "Brush Script MT", "Sarabun", cursive, sans-serif';
    ctx.fillStyle = '#005aa9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw stylish stylized signature
    const displayName = signerName || 'ผู้ขอเบิก';
    ctx.fillText(displayName, rect.width / 2, rect.height / 2);

    // Decorative underline flourish
    ctx.beginPath();
    ctx.strokeStyle = '#005aa9';
    ctx.lineWidth = 2;
    ctx.moveTo(rect.width / 2 - 70, rect.height / 2 + 18);
    ctx.quadraticCurveTo(rect.width / 2, rect.height / 2 + 26, rect.width / 2 + 75, rect.height / 2 + 14);
    ctx.stroke();
    ctx.restore();

    setHasDrawn(true);
    const dataUrl = canvas.toDataURL('image/png');
    setCurrentSignature(dataUrl);
    onSaveSignature(dataUrl);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-[#005aa9]" />
          <span className="font-bold text-slate-800 text-xs">{title}</span>
          <span className="text-[11px] text-slate-500 font-medium">({signerName || 'กรุณาระบุชื่อผู้ขอเบิก'})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={useDefaultStoredSignature}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <UserCheck className="w-3 h-3" />
            <span>ใช้ลายเซ็นประจำตัว</span>
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ล้างลายเซ็น</span>
          </button>
        </div>
      </div>

      {/* Signature Canvas Box */}
      <div className="relative bg-white border-2 border-dashed border-slate-300 rounded-xl overflow-hidden touch-none group">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-28 cursor-crosshair bg-white"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1">
            <PenTool className="w-5 h-5 opacity-40" />
            <span className="text-[11px] font-medium opacity-70">ใช้นิ้ว ปากกา หรือเมาส์วาดลายเซ็นในกรอบนี้</span>
          </div>
        )}

        <div className="absolute bottom-1 right-2 pointer-events-none text-[9px] text-slate-300 font-mono">
          E-SIGNATURE COMPLIANT
        </div>
      </div>

      {hasDrawn && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>บันทึกลายเซ็นดิจิทัลแล้ว ระบบจะประทับในแบบฟอร์มเอกสารขอเบิก</span>
        </div>
      )}
    </div>
  );
}
