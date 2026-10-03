import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label?: string;
  subLabel?: string;
  badge?: string;
  meta?: any;
}

interface SearchableComboboxProps {
  id?: string;
  label?: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  options: (string | ComboboxOption)[];
  placeholder?: string;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  onAddNew?: (newVal: string) => void;
  onSelectOption?: (opt: ComboboxOption) => void;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  helperText?: string;
  badge?: string;
  accentColor?: 'blue' | 'emerald' | 'rose' | 'amber';
  datalistId?: string;
}

/**
 * SearchableCombobox: พิมพ์แล้วกรองตัวเลือกได้ทันที (Direct-Type & Instant Filter)
 * - ผู้ใช้สามารถคลิกแล้วเริ่มพิมพ์ข้อความในช่องได้ทันที ไม่ต้องกดขยายดรอปดาวน์ก่อน
 * - ขณะพิมพ์ ตัวเลือกด้านล่างจะกรองตามคำที่พิมพ์แบบ Real-time
 * - สามารถใช้ปุ่มลูกศรขึ้น/ลง และกด Enter เพื่อเลือก หรือคลิกเลือกด้วยเมาส์
 * - รองรับการพิมพ์ค่าใหม่เอง (Custom Value) ได้ทันที
 * - มีปุ่มลูกศร (Chevron) สำหรับคลิกเปิดดูตัวเลือกทั้งหมด และปุ่ม (X) สำหรับล้างค่า
 */
export function SearchableCombobox({
  id,
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder = '-- พิมพ์ค้นหาหรือเลือก --',
  searchPlaceholder,
  allowCustom = true,
  onAddNew,
  onSelectOption,
  className = '',
  inputClassName = '',
  disabled = false,
  helperText,
  badge,
  accentColor = 'blue',
  datalistId
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // คำนวณทิศทางการกางของ Dropdown (ขึ้นหรือลง) ตามตำแหน่งจริงบนจอ เพื่อไม่ให้หลุดขอบล่างหรือโดนบัง
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // แปลง options ทุกแบบให้เป็นโครงสร้าง ComboboxOption ที่มีมาตรฐานเดียวกัน
  const normalizedOptions: ComboboxOption[] = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return {
        value: opt.value,
        label: opt.label || opt.value,
        subLabel: opt.subLabel,
        badge: opt.badge,
        meta: opt.meta
      };
    });
  }, [options]);

  // ตัวเลือกที่ผ่านการกรอง: หากผู้ใช้กำลังพิมพ์ จะกรองตามคำค้นหาทันที
  // หากไม่ได้พิมพ์ (เช่น เพิ่งคลิกเปิด) จะแสดงรายการทั้งหมด
  const filteredOptions = useMemo(() => {
    if (!isTyping || !value?.trim()) return normalizedOptions;
    const term = value.toLowerCase().trim();
    return normalizedOptions.filter(opt => {
      const matchVal = opt.value.toLowerCase().includes(term);
      const matchLabel = opt.label?.toLowerCase().includes(term);
      const matchSub = opt.subLabel?.toLowerCase().includes(term);
      const matchBadge = opt.badge?.toLowerCase().includes(term);
      return matchVal || matchLabel || matchSub || matchBadge;
    });
  }, [normalizedOptions, value, isTyping]);

  // ตรวจสอบว่ามีตัวเลือกที่ตรงกับข้อความที่พิมพ์อยู่เป๊ะๆ หรือไม่
  const exactMatchExists = useMemo(() => {
    const term = (value || '').trim().toLowerCase();
    if (!term) return false;
    return normalizedOptions.some(opt => 
      opt.value.toLowerCase() === term || opt.label?.toLowerCase() === term
    );
  }, [normalizedOptions, value]);

  // ปิด Dropdown เมื่อคลิกนอกขอบเขต Component
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsTyping(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // เลื่อนตำแหน่ง Scroll ไปยังตัวเลือกที่ถูกไฮไลต์ด้วยแป้นพิมพ์
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // เมื่อเลือกตัวเลือกจากรายการ
  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.value);
    if (onSelectOption) onSelectOption(opt);
    setIsOpen(false);
    setIsTyping(false);
  };

  // จัดการการพิมพ์ใน input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
    setIsTyping(true);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  // เมื่อคลิกหรือ Focus ช่อง input
  const handleInputFocus = () => {
    setIsOpen(true);
    setIsTyping(false);
    setHighlightedIndex(0);
  };

  // แป้นพิมพ์ลัดสำหรับเลื่อนเลือกและกด Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        setIsTyping(false);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setIsTyping(false);
        return;
      }
      setHighlightedIndex(prev => (prev + 1 >= filteredOptions.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setIsTyping(false);
        return;
      }
      setHighlightedIndex(prev => (prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (isOpen) {
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (allowCustom && value.trim()) {
          setIsOpen(false);
          setIsTyping(false);
          if (onAddNew) onAddNew(value.trim());
        } else {
          setIsOpen(false);
          setIsTyping(false);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setIsTyping(false);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setIsTyping(false);
    }
  };

  const ringClasses = {
    blue: 'focus-within:ring-2 focus-within:ring-[#005aa9] focus-within:border-[#005aa9]',
    emerald: 'focus-within:ring-2 focus-within:ring-[#009540] focus-within:border-[#009540]',
    rose: 'focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-rose-500',
    amber: 'focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500'
  }[accentColor];

  const primaryBtnClasses = {
    blue: 'bg-blue-50 text-[#005aa9] hover:bg-blue-100 border-blue-200',
    emerald: 'bg-emerald-50 text-[#009540] hover:bg-emerald-100 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200',
    amber: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
  }[accentColor];

  return (
    <div
      className={`relative ${className} ${isOpen ? 'z-50' : ''}`}
      ref={containerRef}
      id={id}
      style={{ zIndex: isOpen ? 9999 : undefined }}
    >
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="font-bold text-slate-700 text-xs block">
            {label} {required && <span className="text-rose-600">*</span>}
          </label>
          {badge && (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Direct-type Input Wrapper: พิมพ์ได้โดยตรงบนแบบฟอร์มทันที */}
      <div
        className={`w-full min-h-[36px] bg-white border border-slate-300 rounded-lg text-xs font-semibold cursor-text transition-all flex items-center justify-between gap-1 shadow-2xs ${ringClasses} ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'hover:border-slate-400'
        } ${inputClassName}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full h-full px-2.5 py-1.5 bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400 placeholder:font-normal font-semibold truncate"
        />

        <div className="flex items-center gap-0.5 pr-1.5 shrink-0 text-slate-400">
          {value && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                onChange('');
                setIsTyping(false);
                setIsOpen(true);
                inputRef.current?.focus();
                if (onSelectOption) onSelectOption({ value: '', label: '' });
              }}
              className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="ล้างค่า"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              if (!disabled) {
                setIsOpen(prev => !prev);
                setIsTyping(false);
                if (!isOpen) {
                  inputRef.current?.focus();
                }
              }
            }}
            className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="เปิด/ปิดรายการตัวเลือก"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#005aa9]' : ''}`} />
          </button>
        </div>
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-400 mt-1">{helperText}</p>
      )}

      {/* Floating Dropdown List: แสดงผลอยู่ใต้ input ทันที พร้อมกรองตามคำที่พิมพ์ */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          } z-[9999] bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[240px]`}
        >
          
          {/* Quick Add Custom Item button หากพิมพ์ค่าใหม่ที่ไม่ตรงกับในลิสต์ */}
          {allowCustom && isTyping && value.trim() && !exactMatchExists && (
            <div className="p-1.5 border-b border-slate-100 bg-slate-50/70">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  setIsTyping(false);
                  if (onAddNew) onAddNew(value.trim());
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border cursor-pointer transition-colors ${primaryBtnClasses}`}
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <div className="flex-1 truncate">
                  <span>+ ใช้ค่าที่พิมพ์นี้: </span>
                  <span className="underline font-black">"{value.trim()}"</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 bg-white rounded shadow-2xs text-slate-600">
                  Enter ↵
                </span>
              </button>
            </div>
          )}

          {/* รายการตัวเลือก */}
          <div ref={listRef} className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                {value.trim() ? `ไม่พบรายการที่ตรงกับ "${value}"` : 'ไม่มีรายการตัวเลือก'}
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={`${opt.value}-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                      isSelected 
                        ? 'bg-blue-50/90 text-blue-900 font-semibold' 
                        : isHighlighted 
                          ? 'bg-slate-100 text-slate-900' 
                          : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-normal shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.subLabel && (
                        <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                          {opt.subLabel}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#005aa9] shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* แถบสรุปจำนวนรายการ */}
          <div className="px-2.5 py-1 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>
              {isTyping && value.trim() ? `ผลการค้นหา: ${filteredOptions.length} รายการ` : `ตัวเลือกทั้งหมด: ${filteredOptions.length} รายการ`}
            </span>
            <span className="text-slate-400">พิมพ์ค้นหาหรือเลือกจากรายการ</span>
          </div>
        </div>
      )}
    </div>
  );
}
