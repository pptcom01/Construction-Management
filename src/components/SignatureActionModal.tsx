import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  RotateCcw, 
  Check, 
  UserCheck, 
  X, 
  ShieldCheck, 
  FileText,
  CreditCard,
  AlertCircle
} from 'lucide-react';

export interface SignatureActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureDataUrl: string) => void;
  title?: string;
  subtitle?: string;
  signerName: string;
  signerRole?: string;
  docNo?: string;
  docTitle?: string;
  amount?: number;
  actionType?: 'save' | 'approve' | 'review' | 'pay' | 'sign';
  confirmButtonText?: string;
  initialSignature?: string;
}

export function SignatureActionModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'ลงนามด้วยลายมือชื่อสด (Handwritten Live Signature)',
  subtitle = 'กรุณาใช้ปากกาสไตลัส นิ้วมือ หรือเมาส์ เซ็นลายมือชื่อสดลงในกรอบเพื่อยืนยันเอกสาร',
  signerName,
  signerRole = 'ผู้มีอำนาจลงนาม',
  docNo,
  docTitle,
  amount,
  actionType = 'sign',
  confirmButtonText,
  initialSignature = ''
}: SignatureActionModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string>(initialSignature);

  // Initialize or re-render canvas whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow modal DOM layout to settle and measure rect accurately
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.8;

      if (initialSignature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
        img.src = initialSignature;
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, initialSignature]);

  if (!isOpen) return null;

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
      e.preventDefault();
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
  };

  const handleConfirm = () => {
    // Strictly require live handwritten signature
    if (!hasDrawn && !currentSignature) {
      alert('กรุณาใช้ปากกา นิ้วมือ หรือเมาส์ เซ็นลายมือชื่อสดลงในกรอบก่อนกดยืนยัน');
      return;
    }

    onConfirm(currentSignature);
    onClose();
  };

  // Dynamic button text & styling
  const getDefaultButtonText = () => {
    switch (actionType) {
      case 'approve':
        return 'ยืนยันลายมือชื่อสดและอนุมัติ';
      case 'review':
        return 'ยืนยันลายมือชื่อสดและรับรอง';
      case 'pay':
        return 'ยืนยันลายมือชื่อสดและบันทึกจ่ายเงิน';
      case 'save':
        return 'ยืนยันลายมือชื่อสดและบันทึกเอกสาร';
      default:
        return 'ยืนยันลายมือชื่อสด';
    }
  };

  const finalConfirmText = confirmButtonText || getDefaultButtonText();

  const getHeaderIcon = () => {
    switch (actionType) {
      case 'approve':
      case 'review':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'pay':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      default:
        return <PenTool className="w-5 h-5 text-[#005aa9]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              {getHeaderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                {docNo && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md font-mono">
                    {docNo}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Summary Details Strip */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10.5px] text-slate-500 block">ผู้ลงนาม (Signer)</span>
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#005aa9]" />
                  <span>{signerName || 'ผู้มีอำนาจลงนาม'}</span>
                  <span className="text-[10px] font-normal text-slate-500">({signerRole})</span>
                </span>
              </div>
              {amount !== undefined && amount > 0 && (
                <div className="text-right">
                  <span className="text-[10.5px] text-slate-500 block">ยอดเงินที่เกี่ยวข้อง</span>
                  <span className="font-black text-emerald-700 text-sm font-mono">
                    {amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
              )}
            </div>

            {docTitle && (
              <div className="pt-1.5 border-t border-slate-200/70 text-[11px] text-slate-600 truncate flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{docTitle}</span>
              </div>
            )}
          </div>

          {/* Signature Pad Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                <PenTool className="w-3.5 h-3.5 text-[#005aa9]" />
                <span>พื้นที่เซ็นลายมือชื่อสด (Handwritten Live Signature)</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ล้างลายเซ็น</span>
                </button>
              </div>
            </div>

            {/* Canvas Box */}
            <div className="relative bg-white border-2 border-dashed border-blue-300 rounded-xl overflow-hidden touch-none group shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 cursor-crosshair bg-white"
              />

              {/* Baseline Guideline */}
              <div className="absolute left-6 right-6 bottom-8 border-b border-slate-200/80 pointer-events-none" />

              {!hasDrawn && !currentSignature && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                  <PenTool className="w-6 h-6 opacity-40 text-[#005aa9]" />
                  <span className="text-xs font-bold text-slate-600">
                    กรุณาใช้ปากกาสไตลัส นิ้วมือ หรือเมาส์ เซ็นลายมือชื่อสดในกรอบนี้
                  </span>
                  <span className="text-[10.5px] text-slate-400">
                    (ระบบบังคับเซ็นสดจริง ไม่ใช้ลายเซ็นฟอนต์ดิจิทัล)
                  </span>
                </div>
              )}

              <div className="absolute bottom-1 right-2 pointer-events-none text-[8.5px] text-slate-300 font-mono tracking-wider">
                LIVE HANDWRITTEN SIGNATURE
              </div>
            </div>

            {hasDrawn || currentSignature ? (
              <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>ตรวจพบลายมือชื่อสดเรียบร้อยแล้ว พร้อมประทับลงในเอกสาร</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10.5px] text-amber-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>ต้องลงลายมือชื่อสดให้เรียบร้อยก่อนกดยืนยัน</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-xs cursor-pointer transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.01] ${
              actionType === 'approve'
                ? 'bg-[#009540] hover:bg-[#007e36] text-white shadow-emerald-700/20'
                : actionType === 'pay'
                ? 'bg-[#005aa9] hover:bg-[#004887] text-white shadow-blue-700/20'
                : 'bg-[#005aa9] hover:bg-[#004887] text-white shadow-blue-700/20'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{finalConfirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default SignatureActionModal;
