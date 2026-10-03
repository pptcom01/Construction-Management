import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check } from 'lucide-react';

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
            onClick={clearCanvas}
            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
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
            <PenTool className="w-5 h-5 opacity-40 text-[#005aa9]" />
            <span className="text-[11px] font-medium opacity-80">ใช้นิ้ว ปากกาสไตลัส หรือเมาส์ วาด/เซ็นลายมือชื่อสดในกรอบนี้</span>
          </div>
        )}

        <div className="absolute bottom-1 right-2 pointer-events-none text-[9px] text-slate-300 font-mono">
          HANDWRITTEN LIVE SIGNATURE
        </div>
      </div>

      {hasDrawn && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>บันทึกลายมือชื่อสดแล้ว ระบบจะประทับในแบบฟอร์มเอกสารขอเบิก</span>
        </div>
      )}
    </div>
  );
}
