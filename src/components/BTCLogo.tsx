import { useState } from 'react';
import { HardHat } from 'lucide-react';

interface BTCLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showPhone?: boolean;
}

export function BTCLogo({
  className = '',
  size = 'md',
  showText = true,
  showPhone = false
}: BTCLogoProps) {
  const [imageError, setImageError] = useState(false);

  // Official company logo image link
  const logoImgUrl = 'https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png';

  const logoHeights = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!imageError ? (
        <img
          src={logoImgUrl}
          alt="บจก. บุรีรัมย์ธงชัยก่อสร้าง Logo"
          referrerPolicy="no-referrer"
          className={`${logoHeights[size]} w-auto object-contain shrink-0`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex items-center gap-2.5">
          {/* Stylized Vector 3TC / BTC Badge */}
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-emerald-600 to-blue-700 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20 shrink-0 border border-emerald-400/40">
            <span className="text-base tracking-tighter font-extrabold flex items-center">
              <span className="text-emerald-300">3</span>
              <span className="text-white">T</span>
              <span className="text-blue-200">C</span>
            </span>
          </div>
          {showText && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-[#005aa9]">
                  3TC <span className="text-[#009540]">BTC</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ERP
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-700 tracking-tight leading-none">
                บจก.บุรีรัมย์ธงชัยก่อสร้าง
              </span>
              {showPhone && (
                <span className="text-[10px] font-semibold text-[#009540] mt-0.5">
                  Tel. 044-611134
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
