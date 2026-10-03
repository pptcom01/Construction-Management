import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  Package, 
  Percent, 
  FileSpreadsheet, 
  Trash2, 
  CheckCircle2, 
  SlidersHorizontal,
  X,
  Upload,
  ArrowRight,
  HardHat,
  ChevronDown,
  ChevronRight,
  Edit3,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ProjectBOQItem, BOQMaterialItem } from '../types';
import { formatCurrency } from '../utils/accounting';
import { SearchableCombobox } from './SearchableCombobox';

interface BOQManagementViewProps {
  boqItems: ProjectBOQItem[];
  uniqueProjects: string[];
  selectedProjectFilter?: string;
  onSelectProject?: (p: string) => void;
  onAddBOQItem: (item: Omit<ProjectBOQItem, 'id' | 'subcontractAllocatedQty' | 'completedQty'>) => void;
  onUpdateBOQItem?: (id: string, updated: Partial<ProjectBOQItem>) => void;
  onDeleteBOQItem: (id: string) => void;
  onAddMaterialToBOQ: (boqId: string, material: Omit<BOQMaterialItem, 'id'>) => void;
  onDeleteMaterialFromBOQ?: (boqId: string, materialId: string) => void;
  onUpdateMaterialWithdrawal: (boqId: string, materialId: string, newWithdrawnQty: number) => void;
  onNavigateToSubcontracts?: () => void;
}

export function BOQManagementView({
  boqItems,
  uniqueProjects,
  selectedProjectFilter = 'all',
  onSelectProject,
  onAddBOQItem,
  onUpdateBOQItem,
  onDeleteBOQItem,
  onAddMaterialToBOQ,
  onDeleteMaterialFromBOQ,
  onUpdateMaterialWithdrawal,
  onNavigateToSubcontracts
}: BOQManagementViewProps) {
  const [selectedProject, setSelectedProject] = useState<string>(selectedProjectFilter);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expanded rows state (Set of boqItem ids)
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isAddBOQModalOpen, setIsAddBOQModalOpen] = useState(false);
  const [editingBOQItem, setEditingBOQItem] = useState<ProjectBOQItem | null>(null);
  const [selectedBOQForMaterial, setSelectedBOQForMaterial] = useState<ProjectBOQItem | null>(null);
  const [withdrawingMaterial, setWithdrawingMaterial] = useState<{ boqId: string; material: BOQMaterialItem } | null>(null);
  const [withdrawInputQty, setWithdrawInputQty] = useState<number>(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  // Toggle single row expand/collapse with auto-collapse of previous item and auto-focus
  const toggleRow = (id: string) => {
    const isCurrentlyExpanded = expandedRowIds.has(id);
    
    // Auto-collapse previous opened item and focus on the newly selected item
    setExpandedRowIds(prev => {
      if (prev.has(id)) {
        return new Set(); // If clicking currently open item, collapse it
      }
      return new Set([id]); // Otherwise close all others and expand only this new item
    });

    // Smoothly scroll and focus on the newly expanded row
    if (!isCurrentlyExpanded) {
      setTimeout(() => {
        const rowEl = document.getElementById(`boq-row-${id}`);
        if (rowEl) {
          rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 70);
    }
  };

  // Expand all rows
  const handleExpandAll = (itemsToExpand: ProjectBOQItem[]) => {
    setExpandedRowIds(new Set(itemsToExpand.map(item => item.id)));
  };

  // Collapse all rows
  const handleCollapseAll = () => {
    setExpandedRowIds(new Set());
  };

  // Handle project filter
  const handleProjectChange = (p: string) => {
    setSelectedProject(p);
    if (onSelectProject) onSelectProject(p);
  };

  // Filtered BOQ Items
  const filteredBOQItems = useMemo(() => {
    return boqItems.filter(item => {
      const matchProj = selectedProject === 'all' || item.project === selectedProject;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        item.itemNo.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.project.toLowerCase().includes(q);
      return matchProj && matchQuery;
    });
  }, [boqItems, selectedProject, searchQuery]);

  // Aggregate Metrics for selected project or all
  const summaryMetrics = useMemo(() => {
    let totalContractAmount = 0;
    let totalEngineerAmount = 0;
    let totalSubcontractAllocatedAmount = 0;
    let totalMaterialBudget = 0;
    let totalMaterialUsedBudget = 0;

    filteredBOQItems.forEach(item => {
      totalContractAmount += item.contractAmount || (item.contractQty * item.contractUnitRate);
      totalEngineerAmount += item.engineerAmount || (item.engineerQty * item.engineerUnitCost);
      
      const allocatedQty = item.subcontractAllocatedQty || 0;
      totalSubcontractAllocatedAmount += allocatedQty * item.engineerUnitCost;

      item.materials.forEach(mat => {
        totalMaterialBudget += (mat.totalRequiredQty || 0) * (mat.unitPrice || 0);
        totalMaterialUsedBudget += (mat.withdrawnQty || 0) * (mat.unitPrice || 0);
      });
    });

    const plannedGrossProfit = totalContractAmount - totalEngineerAmount;
    const plannedMarginPercent = totalContractAmount > 0 ? (plannedGrossProfit / totalContractAmount) * 100 : 0;
    const allocationPercent = totalEngineerAmount > 0 ? (totalSubcontractAllocatedAmount / totalEngineerAmount) * 100 : 0;

    return {
      totalContractAmount,
      totalEngineerAmount,
      plannedGrossProfit,
      plannedMarginPercent,
      totalSubcontractAllocatedAmount,
      allocationPercent,
      totalMaterialBudget,
      totalMaterialUsedBudget,
      itemCount: filteredBOQItems.length
    };
  }, [filteredBOQItems]);

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-[#005aa9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                BOQ โครงการ (3-Tier BOQ & BOM)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#005aa9]">
                {filteredBOQItems.length} รายการ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ชั้นที่ 1: สัญญาประมูล &bull; ชั้นที่ 2: งบวิศวะหน้างาน &bull; ชั้นที่ 3: โควตาถอดแบบวัสดุ (BOM)
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedProject}
              onChange={e => handleProjectChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">ทุกโครงการทั้งหมด ({uniqueProjects.length})</option>
              {uniqueProjects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Import CSV */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>นำเข้า BOQ</span>
          </button>

          {/* Add BOQ Item */}
          <button
            onClick={() => setIsAddBOQModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#005aa9] hover:bg-blue-900 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ เพิ่มหมวดงาน BOQ</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tier 1: Contract Value */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">ชั้น 1: สัญญาประมูลรวม</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Contract Value
            </span>
          </div>
          <div className="text-lg font-black text-slate-900 font-mono">
            {formatCurrency(summaryMetrics.totalContractAmount)} <span className="text-xs font-sans font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>จำนวน {summaryMetrics.itemCount} หมวดงาน</span>
            <span className="text-blue-900 font-bold">100% รายได้ประมูล</span>
          </div>
        </div>

        {/* Tier 2: Site Budget */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">ชั้น 2: เพดานงบวิศวะหน้างาน</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Target Budget
            </span>
          </div>
          <div className="text-lg font-black text-slate-900 font-mono">
            {formatCurrency(summaryMetrics.totalEngineerAmount)} <span className="text-xs font-sans font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>ต้นทุนเป้าหมายสูงสุด</span>
            <span className="text-amber-800 font-bold">
              {summaryMetrics.totalContractAmount > 0 
                ? ((summaryMetrics.totalEngineerAmount / summaryMetrics.totalContractAmount) * 100).toFixed(1) 
                : 0}% ของสัญญา
            </span>
          </div>
        </div>

        {/* Planned Profit */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">กำไรขั้นต้นตามแผน (GP)</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Planned GP
            </span>
          </div>
          <div className="text-lg font-black text-emerald-800 font-mono">
            +{formatCurrency(summaryMetrics.plannedGrossProfit)} <span className="text-xs font-sans font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>เป้าหมายกำไรโครงการ</span>
            <span className="text-emerald-800 font-bold font-mono">
              +{summaryMetrics.plannedMarginPercent.toFixed(1)}% Margin
            </span>
          </div>
        </div>

        {/* Tier 3: Subcontract & BOM Allocation */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">จัดสรรสัญญาช่างเหมาแล้ว</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200">
              Subcontract Allocated
            </span>
          </div>
          <div className="text-lg font-black text-purple-900 font-mono">
            {formatCurrency(summaryMetrics.totalSubcontractAllocatedAmount)} <span className="text-xs font-sans font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>จัดสรรไปแล้ว {summaryMetrics.allocationPercent.toFixed(1)}%</span>
            <span className="text-slate-500">คงเหลือ {formatCurrency(summaryMetrics.totalEngineerAmount - summaryMetrics.totalSubcontractAllocatedAmount)}</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Collapsible Table Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาข้อ BOQ, รายการงาน, หรือโครงการ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Expand All / Collapse All Buttons */}
          <button
            onClick={() => handleExpandAll(filteredBOQItems)}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ขยายทุกแถวเพื่อดูรายละเอียดวิศวกรรมและวัสดุ BOM"
          >
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
            <span>ขยายทั้งหมด</span>
          </button>

          <button
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ยุบทุกแถวเพื่อดูภาพรวมแบบกระชับ"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span>ยุบทั้งหมด</span>
          </button>

          <span className="text-xs text-slate-500 px-2 py-1 bg-slate-100 rounded-md font-mono">
            แสดง {filteredBOQItems.length} รายการ (เปิดดู {expandedRowIds.size})
          </span>

          {onNavigateToSubcontracts && (
            <button
              onClick={onNavigateToSubcontracts}
              className="text-xs font-bold text-[#005aa9] hover:underline flex items-center gap-1 shrink-0 ml-1 cursor-pointer"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>สัญญาช่างเหมา &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Collapsible BOQ & BOM Hierarchical Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredBOQItems.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">ไม่พบรายการ BOQ ที่ตรงกับเงื่อนไข</h3>
            <p className="text-xs text-slate-500 mt-1">
              ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "+ เพิ่มหมวดงาน BOQ" ด้านบนเพื่อเพิ่มรายการใหม่
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {/* Table Grouped Header */}
              <thead>
                <tr className="bg-slate-100/90 text-[11px] font-bold text-slate-700 border-b border-slate-300 divide-x divide-slate-200">
                  <th colSpan={4} className="py-2.5 px-3 text-left">
                    ข้อมูลหมวดงาน & ขอบเขต
                  </th>
                  <th colSpan={3} className="py-2.5 px-3 text-center bg-blue-50/70 text-[#005aa9]">
                    ชั้นที่ 1: BOQ สัญญาประมูล (Contract)
                  </th>
                  <th colSpan={3} className="py-2.5 px-3 text-center bg-amber-50/70 text-amber-900">
                    ชั้นที่ 2: งบวิศวะหน้างาน (Target Budget)
                  </th>
                  <th colSpan={2} className="py-2.5 px-3 text-center bg-slate-100">
                    วิเคราะห์กำไร & สัญญาช่างเหมา
                  </th>
                  <th className="py-2.5 px-3 text-center w-28">
                    จัดการ
                  </th>
                </tr>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200 divide-x divide-slate-100">
                  <th className="py-2 px-2.5 text-center w-12">ขยาย</th>
                  <th className="py-2 px-2.5 text-center w-16">ข้อ (WBS)</th>
                  <th className="py-2 px-3 min-w-[200px]">รายการงาน / โครงการ</th>
                  <th className="py-2 px-2.5 text-center w-14">หน่วย</th>
                  
                  {/* Tier 1 */}
                  <th className="py-2 px-2.5 text-right font-mono text-slate-700">ปริมาณสัญญา</th>
                  <th className="py-2 px-2.5 text-right font-mono text-slate-700">ราคา/หน่วย</th>
                  <th className="py-2 px-3 text-right font-mono font-bold text-[#005aa9] bg-blue-50/30">รวมสัญญา (บาท)</th>

                  {/* Tier 2 */}
                  <th className="py-2 px-2.5 text-right font-mono text-slate-700">ปริมาณสำรวจ</th>
                  <th className="py-2 px-2.5 text-right font-mono text-slate-700">ต้นทุน/หน่วย</th>
                  <th className="py-2 px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/30">งบวิศวะ (บาท)</th>

                  {/* Profit & Allocation */}
                  <th className="py-2 px-3 text-right font-mono text-emerald-800">กำไรตามแผน (GP)</th>
                  <th className="py-2 px-3 min-w-[140px] text-left">จัดสรรช่างเหมา</th>

                  {/* Actions */}
                  <th className="py-2 px-2.5 text-center">แก้ไข / จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredBOQItems.map(boq => {
                  const isExpanded = expandedRowIds.has(boq.id);
                  const contractAmt = boq.contractAmount || (boq.contractQty * boq.contractUnitRate);
                  const engineerAmt = boq.engineerAmount || (boq.engineerQty * boq.engineerUnitCost);
                  const plannedMargin = contractAmt - engineerAmt;
                  const plannedMarginPct = contractAmt > 0 ? (plannedMargin / contractAmt) * 100 : 0;
                  const allocatedPct = boq.engineerQty > 0 ? (boq.subcontractAllocatedQty / boq.engineerQty) * 100 : 0;
                  const isOverAllocated = boq.subcontractAllocatedQty > boq.engineerQty;

                  return (
                    <React.Fragment key={boq.id}>
                      {/* Main Collapsible Row */}
                      <tr 
                        id={`boq-row-${boq.id}`}
                        className={`transition-colors hover:bg-blue-50/30 divide-x divide-slate-100 ${
                          isExpanded ? 'bg-blue-50/40 font-medium ring-1 ring-blue-300 ring-inset' : 'bg-white'
                        }`}
                      >
                        {/* Toggle Icon */}
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => toggleRow(boq.id)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title={isExpanded ? "กดยุบแถวนี้" : "กดขยายดูรายละเอียดและ BOM"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#005aa9]" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* WBS Item No */}
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-xs text-slate-800">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {boq.itemNo}
                          </span>
                        </td>

                        {/* Description & Project Badge */}
                        <td className="py-2.5 px-3">
                          <div 
                            onClick={() => toggleRow(boq.id)}
                            className="cursor-pointer group"
                          >
                            <div className="font-semibold text-slate-900 group-hover:text-[#005aa9] transition-colors line-clamp-2">
                              {boq.description}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                {boq.project}
                              </span>
                              {boq.materials.length > 0 && (
                                <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-0.5">
                                  <Package className="w-3 h-3" />
                                  {boq.materials.length} วัสดุ BOM
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Unit */}
                        <td className="py-2.5 px-2.5 text-center text-slate-600 font-mono">
                          {boq.unit}
                        </td>

                        {/* Tier 1: Contract Qty */}
                        <td className="py-2.5 px-2.5 text-right font-mono text-slate-800">
                          {boq.contractQty.toLocaleString()}
                        </td>

                        {/* Tier 1: Contract Unit Rate */}
                        <td className="py-2.5 px-2.5 text-right font-mono text-slate-800">
                          {formatCurrency(boq.contractUnitRate)}
                        </td>

                        {/* Tier 1: Total Contract Amount */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#005aa9] bg-blue-50/20">
                          {formatCurrency(contractAmt)}
                        </td>

                        {/* Tier 2: Engineer Qty */}
                        <td className="py-2.5 px-2.5 text-right font-mono text-slate-800">
                          {boq.engineerQty.toLocaleString()}
                        </td>

                        {/* Tier 2: Engineer Unit Cost */}
                        <td className="py-2.5 px-2.5 text-right font-mono text-slate-800">
                          {formatCurrency(boq.engineerUnitCost)}
                        </td>

                        {/* Tier 2: Total Engineer Amount */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/20">
                          {formatCurrency(engineerAmt)}
                        </td>

                        {/* Planned GP */}
                        <td className="py-2.5 px-3 text-right font-mono">
                          <div className="font-bold text-emerald-700">
                            +{formatCurrency(plannedMargin)}
                          </div>
                          <div className="text-[10px] text-emerald-600">
                            +{plannedMarginPct.toFixed(1)}%
                          </div>
                        </td>

                        {/* Subcontract Allocated */}
                        <td className="py-2.5 px-3">
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-600">{boq.subcontractAllocatedQty.toLocaleString()} {boq.unit}</span>
                              <span className={`font-bold ${isOverAllocated ? 'text-red-600' : 'text-slate-700'}`}>
                                {allocatedPct.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${isOverAllocated ? 'bg-red-500' : 'bg-[#005aa9]'}`}
                                style={{ width: `${Math.min(allocatedPct, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-2.5 px-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Edit BOQ Button */}
                            <button
                              onClick={() => setEditingBOQItem(boq)}
                              className="p-1 text-slate-600 hover:text-[#005aa9] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="แก้ไขข้อมูลข้อ BOQ นี้"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Add Material Button */}
                            <button
                              onClick={() => setSelectedBOQForMaterial(boq)}
                              className="p-1 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="เพิ่มรายการวัสดุ BOM"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete BOQ Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`ต้องการลบข้อ BOQ ${boq.itemNo} (${boq.description}) ใช่หรือไม่?`)) {
                                  onDeleteBOQItem(boq.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="ลบรายการนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Sub-Row (Tier 1 vs 2 Summary & Tier 3 Material BOM Table) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={13} className="p-4">
                            <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-xs space-y-4">
                              {/* Detail Header Ribbon */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-blue-100 text-[#005aa9] font-mono font-bold text-xs rounded">
                                      ข้อ {boq.itemNo}
                                    </span>
                                    <h4 className="font-bold text-slate-900 text-sm">
                                      {boq.description}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    โครงการ: <strong className="text-slate-700">{boq.project}</strong> &bull; หน่วยนับงานหลัก: <strong className="font-mono text-slate-700">{boq.unit}</strong>
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => setEditingBOQItem(boq)}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-blue-700" />
                                    <span>แก้ไขข้อมูล BOQ ข้อนี้</span>
                                  </button>
                                  <button
                                    onClick={() => setSelectedBOQForMaterial(boq)}
                                    className="px-3 py-1.5 text-xs font-semibold text-[#005aa9] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ เพิ่มวัสดุ BOM</span>
                                  </button>
                                </div>
                              </div>

                              {/* Comparison Cards: Tier 1 vs Tier 2 */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-200/80 text-xs space-y-1">
                                  <span className="font-bold text-[#005aa9] block text-[11px]">ชั้นที่ 1: BOQ สัญญาประมูล</span>
                                  <div className="flex justify-between font-mono">
                                    <span className="text-slate-600">ปริมาณตามสัญญา:</span>
                                    <strong className="text-slate-900">{boq.contractQty.toLocaleString()} {boq.unit}</strong>
                                  </div>
                                  <div className="flex justify-between font-mono">
                                    <span className="text-slate-600">ราคาต่อหน่วย:</span>
                                    <strong className="text-slate-900">{formatCurrency(boq.contractUnitRate)} บาท/{boq.unit}</strong>
                                  </div>
                                  <div className="flex justify-between font-mono pt-1 border-t border-blue-100 font-bold">
                                    <span className="text-[#005aa9]">มูลค่าสัญญารวม:</span>
                                    <span className="text-[#005aa9]">{formatCurrency(contractAmt)} บาท</span>
                                  </div>
                                </div>

                                <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-200/80 text-xs space-y-1">
                                  <span className="font-bold text-amber-900 block text-[11px]">ชั้นที่ 2: งบวิศวะหน้างาน (Target Budget)</span>
                                  <div className="flex justify-between font-mono">
                                    <span className="text-slate-600">ปริมาณสำรวจจริง:</span>
                                    <strong className="text-slate-900">{boq.engineerQty.toLocaleString()} {boq.unit}</strong>
                                  </div>
                                  <div className="flex justify-between font-mono">
                                    <span className="text-slate-600">ต้นทุนเป้าหมาย:</span>
                                    <strong className="text-slate-900">{formatCurrency(boq.engineerUnitCost)} บาท/{boq.unit}</strong>
                                  </div>
                                  <div className="flex justify-between font-mono pt-1 border-t border-amber-100 font-bold">
                                    <span className="text-amber-900">งบประมาณวิศวะ:</span>
                                    <span className="text-amber-900">{formatCurrency(engineerAmt)} บาท</span>
                                  </div>
                                </div>

                                <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-200/80 text-xs space-y-1">
                                  <span className="font-bold text-emerald-900 block text-[11px]">ส่วนต่างกำไร & จัดสรรช่างเหมา</span>
                                  <div className="flex justify-between font-mono">
                                    <span className="text-slate-600">กำไรขั้นต้นตามแผน:</span>
                                    <strong className="text-emerald-700">+{formatCurrency(plannedMargin)} บาท ({plannedMarginPct.toFixed(1)}%)</strong>
                                  </div>
                                  <div className="flex justify-between font-mono">
                                    <span className="text-slate-600">ทำสัญญาช่างเหมา:</span>
                                    <strong className={isOverAllocated ? 'text-red-600' : 'text-slate-800'}>
                                      {boq.subcontractAllocatedQty.toLocaleString()} / {boq.engineerQty.toLocaleString()} {boq.unit}
                                    </strong>
                                  </div>
                                  <div className="flex justify-between font-mono pt-1 border-t border-emerald-100">
                                    <span className="text-slate-600">สัดส่วนจัดสรร:</span>
                                    <span className={`font-bold ${isOverAllocated ? 'text-red-600' : 'text-emerald-800'}`}>
                                      {allocatedPct.toFixed(1)}% {isOverAllocated && '(เกินโควตา!)'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Tier 3: Material BOM Table */}
                              <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="bg-slate-100/90 px-3 py-2 flex items-center justify-between border-b border-slate-200">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                    <Package className="w-3.5 h-3.5 text-blue-700" />
                                    <span>ชั้นที่ 3: รายการถอดแบบวัสดุ (Material Bill of Materials - BOM)</span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    มี {boq.materials.length} รายการวัสดุ
                                  </span>
                                </div>

                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                                    <tr>
                                      <th className="py-2 px-3">ชื่อรายการวัสดุ</th>
                                      <th className="py-2 px-3 text-center">อัตราส่วนต่อ {boq.unit}</th>
                                      <th className="py-2 px-3 text-right">โควตารวมที่ต้องใช้</th>
                                      <th className="py-2 px-3 text-right">เบิกใช้จริงแล้ว</th>
                                      <th className="py-2 px-3 text-right">โควตาคงเหลือ</th>
                                      <th className="py-2 px-3 text-right">ราคาต่อหน่วย</th>
                                      <th className="py-2 px-3 text-right">มูลค่างบวัสดุ</th>
                                      <th className="py-2 px-3 text-center">จัดการ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-mono">
                                    {boq.materials.length === 0 ? (
                                      <tr>
                                        <td colSpan={8} className="py-4 px-3 text-center text-slate-400 font-sans text-xs">
                                          ยังไม่มีรายการวัสดุ BOM ในหมวดนี้ &bull; กด "+ เพิ่มวัสดุ BOM" ด้านบนเพื่อถอดแบบวัสดุ
                                        </td>
                                      </tr>
                                    ) : (
                                      boq.materials.map(mat => {
                                        const remaining = mat.totalRequiredQty - mat.withdrawnQty;
                                        const isExceeded = remaining < 0;
                                        const totalMatBudget = mat.totalRequiredQty * (mat.unitPrice || 0);

                                        return (
                                          <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                                              {mat.materialName}
                                            </td>
                                            <td className="py-2 px-3 text-center text-slate-600">
                                              {mat.standardRatioPerUnit} {mat.unit}/{boq.unit}
                                            </td>
                                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                                              {mat.totalRequiredQty.toLocaleString()} {mat.unit}
                                            </td>
                                            <td className="py-2 px-3 text-right text-blue-900 font-bold">
                                              {mat.withdrawnQty.toLocaleString()} {mat.unit}
                                            </td>
                                            <td className={`py-2 px-3 text-right font-bold ${isExceeded ? 'text-red-600' : 'text-emerald-700'}`}>
                                              {remaining.toLocaleString()} {mat.unit}
                                            </td>
                                            <td className="py-2 px-3 text-right text-slate-700">
                                              {formatCurrency(mat.unitPrice)}/{mat.unit}
                                            </td>
                                            <td className="py-2 px-3 text-right text-slate-800 font-bold">
                                              {formatCurrency(totalMatBudget)}
                                            </td>
                                            <td className="py-2 px-3 text-center font-sans">
                                              <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                  onClick={() => {
                                                    setWithdrawingMaterial({ boqId: boq.id, material: mat });
                                                    setWithdrawInputQty(mat.withdrawnQty);
                                                  }}
                                                  className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded border border-blue-200 transition-colors cursor-pointer"
                                                >
                                                  บันทึกเบิกใช้
                                                </button>
                                                {onDeleteMaterialFromBOQ && (
                                                  <button
                                                    onClick={() => {
                                                      if (window.confirm(`ต้องการลบรายการวัสดุ ${mat.materialName} ใช่หรือไม่?`)) {
                                                        onDeleteMaterialFromBOQ(boq.id, mat.id);
                                                      }
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                                    title="ลบรายการวัสดุนี้"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* Table Footer with Summary Totals */}
              <tfoot>
                <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300 divide-x divide-slate-200">
                  <td colSpan={4} className="py-3 px-3 text-slate-800 font-semibold">
                    รวมทั้งสิ้น ({filteredBOQItems.length} หมวดงาน)
                  </td>
                  <td colSpan={2} className="py-3 px-2.5 text-right font-mono text-slate-600">
                    มูลค่าสัญญารวม:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#005aa9] font-black text-sm bg-blue-50/50">
                    {formatCurrency(summaryMetrics.totalContractAmount)}
                  </td>
                  <td colSpan={2} className="py-3 px-2.5 text-right font-mono text-slate-600">
                    งบวิศวะรวม:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-900 font-black text-sm bg-amber-50/50">
                    {formatCurrency(summaryMetrics.totalEngineerAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-800 font-black text-sm">
                    +{formatCurrency(summaryMetrics.plannedGrossProfit)}
                    <span className="block text-[10px] text-emerald-600 font-normal">
                      (+{summaryMetrics.plannedMarginPercent.toFixed(1)}%)
                    </span>
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-center text-slate-600 font-mono text-[11px]">
                    จัดสรรช่างเหมาแล้ว {summaryMetrics.allocationPercent.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL 1: ADD BOQ ITEM ================= */}
      {isAddBOQModalOpen && (
        <AddBOQModal
          isOpen={isAddBOQModalOpen}
          onClose={() => setIsAddBOQModalOpen(false)}
          uniqueProjects={uniqueProjects}
          defaultProject={selectedProject !== 'all' ? selectedProject : uniqueProjects[0] || ''}
          onSave={(itemData) => {
            onAddBOQItem(itemData);
            setIsAddBOQModalOpen(false);
          }}
        />
      )}

      {/* ================= MODAL 1.5: EDIT BOQ ITEM ================= */}
      {editingBOQItem && (
        <EditBOQModal
          isOpen={!!editingBOQItem}
          onClose={() => setEditingBOQItem(null)}
          boqItem={editingBOQItem}
          uniqueProjects={uniqueProjects}
          onSave={(updatedData) => {
            if (onUpdateBOQItem) {
              onUpdateBOQItem(editingBOQItem.id, updatedData);
            }
            setEditingBOQItem(null);
          }}
        />
      )}

      {/* ================= MODAL 2: ADD MATERIAL TO BOQ ================= */}
      {selectedBOQForMaterial && (
        <AddMaterialModal
          isOpen={!!selectedBOQForMaterial}
          onClose={() => setSelectedBOQForMaterial(null)}
          boqItem={selectedBOQForMaterial}
          onSave={(materialData) => {
            onAddMaterialToBOQ(selectedBOQForMaterial.id, materialData);
            setSelectedBOQForMaterial(null);
          }}
        />
      )}

      {/* ================= MODAL 3: WITHDRAW MATERIAL ================= */}
      {withdrawingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                บันทึกปริมาณเบิกใช้วัสดุ
              </h3>
              <button 
                onClick={() => setWithdrawingMaterial(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 text-xs space-y-2">
              <p className="text-slate-600 font-semibold">
                รายการ: <span className="text-slate-900 font-bold">{withdrawingMaterial.material.materialName}</span>
              </p>
              <p className="text-slate-500">
                โควตารวมที่ต้องใช้ตาม BOQ: <strong className="font-mono text-slate-900">{withdrawingMaterial.material.totalRequiredQty.toLocaleString()} {withdrawingMaterial.material.unit}</strong>
              </p>
              
              <div className="pt-2">
                <label className="block text-slate-700 font-bold mb-1">
                  ปริมาณที่เบิกใช้งานสะสมใหม่ ({withdrawingMaterial.material.unit}):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={withdrawInputQty}
                  onChange={e => setWithdrawInputQty(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setWithdrawingMaterial(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onUpdateMaterialWithdrawal(withdrawingMaterial.boqId, withdrawingMaterial.material.id, withdrawInputQty);
                  setWithdrawingMaterial(null);
                }}
                className="px-4 py-1.5 bg-[#005aa9] text-white rounded font-bold hover:bg-blue-900"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: IMPORT CSV BOQ ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#005aa9]" />
                นำเข้าข้อมูล BOQ (CSV / Text Format)
              </h3>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 text-xs space-y-3">
              <p className="text-slate-600 leading-relaxed">
                คัดลอกข้อมูลจาก Excel หรือไฟล์ CSV มาวางในช่องด้านล่าง โดยเรียงตามคอลัมน์ดังนี้:<br />
                <code className="bg-slate-100 text-blue-900 px-1 py-0.5 rounded font-mono text-[11px] block mt-1">
                  ข้อ, รายการงาน, หน่วยนับ, ปริมาณสัญญา, ราคาต่อหน่วยสัญญา, ปริมาณวิศวะ, ต้นทุนต่อหน่วยวิศวะ
                </code>
              </p>

              <textarea
                rows={6}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="ตัวอย่าง:&#10;1.1, งานขุดดินเปิดร่อง, ลบ.ม., 5000, 65, 5200, 48&#10;1.2, งานวางท่อระบายน้ำ คสล., ม., 1200, 3850, 1200, 3100"
                className="w-full border border-slate-300 rounded p-2 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (!importText.trim()) return;
                  const lines = importText.trim().split('\n');
                  const currentProj = selectedProject !== 'all' ? selectedProject : (uniqueProjects[0] || 'โครงการทั่วไป');
                  lines.forEach(line => {
                    const parts = line.split(/,|\t/).map(p => p.trim());
                    if (parts.length >= 7) {
                      const itemNo = parts[0];
                      const description = parts[1];
                      const unit = parts[2];
                      const contractQty = Number(parts[3]) || 0;
                      const contractUnitRate = Number(parts[4]) || 0;
                      const engineerQty = Number(parts[5]) || contractQty;
                      const engineerUnitCost = Number(parts[6]) || contractUnitRate * 0.85;

                      onAddBOQItem({
                        project: currentProj,
                        itemNo,
                        description,
                        unit,
                        contractQty,
                        contractUnitRate,
                        contractAmount: contractQty * contractUnitRate,
                        engineerQty,
                        engineerUnitCost,
                        engineerAmount: engineerQty * engineerUnitCost,
                        materials: []
                      });
                    }
                  });
                  setIsImportModalOpen(false);
                  setImportText('');
                }}
                className="px-4 py-1.5 bg-[#005aa9] text-white rounded font-bold hover:bg-blue-900 cursor-pointer"
              >
                นำเข้าข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-Component: Add BOQ Modal
function AddBOQModal({
  isOpen,
  onClose,
  uniqueProjects,
  defaultProject,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  uniqueProjects: string[];
  defaultProject: string;
  onSave: (item: Omit<ProjectBOQItem, 'id' | 'subcontractAllocatedQty' | 'completedQty'>) => void;
}) {
  const [project, setProject] = useState(defaultProject);
  const [itemNo, setItemNo] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('ม.');
  
  // Tier 1
  const [contractQty, setContractQty] = useState<number>(1000);
  const [contractUnitRate, setContractUnitRate] = useState<number>(1500);

  // Tier 2
  const [engineerQty, setEngineerQty] = useState<number>(1000);
  const [engineerUnitCost, setEngineerUnitCost] = useState<number>(1200);

  const commonWorkCategories = [
    'งานถางป่าและขุดตอ',
    'งานขุดดินและตัดคันทาง',
    'งานถมคันทางด้วยวัสดุคัดเลือก',
    'งานรองพื้นทาง (Subbase)',
    'งานพื้นทางหินคลุก (Crushed Rock Base)',
    'งานผิวทางแอสฟัลต์คอนกรีต Binder Course',
    'งานผิวทางแอสฟัลต์คอนกรีต Wearing Course',
    'งานวางท่อระบายน้ำ คสล. ชั้น 3 dia 1.00 ม.',
    'งานท่อเหลี่ยม คสล.',
    'งานทางเท้าและคันหิน คสล.',
    'งานไฟฟ้าส่องสว่างและหม้อแปลง',
    'งานป้ายจราจรและตีเส้นเทอร์โมพลาสติก'
  ];

  const commonUnits = ['ม.', 'ตร.ม.', 'ลบ.ม.', 'ตัน', 'จุด', 'แห่ง', 'ชุด', 'กม.', 'งาน'];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      project,
      itemNo,
      description,
      unit,
      contractQty,
      contractUnitRate,
      contractAmount: contractQty * contractUnitRate,
      engineerQty,
      engineerUnitCost,
      engineerAmount: engineerQty * engineerUnitCost,
      materials: []
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-5 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#005aa9]" />
            เพิ่มหมวดงาน BOQ 3 ชั้นใหม่
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 text-xs space-y-3">
          <div>
            <SearchableCombobox
              label="เลือกโครงการ"
              required
              value={project}
              onChange={(val) => setProject(val)}
              options={uniqueProjects}
              placeholder="เลือกหรือพิมพ์โครงการ"
              allowCustom={true}
              accentColor="blue"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1">ข้อที่ (WBS) *</label>
              <input
                type="text"
                placeholder="เช่น 1.1"
                required
                value={itemNo}
                onChange={e => setItemNo(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
              />
            </div>
            <div className="col-span-2">
              <SearchableCombobox
                label="หน่วยนับ"
                required
                value={unit}
                onChange={(val) => setUnit(val)}
                options={commonUnits}
                placeholder="เลือกหรือพิมพ์หน่วยนับ"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
          </div>

          <div>
            <SearchableCombobox
              label="รายการงาน / ขอบเขตงาน"
              required
              value={description}
              onChange={(val) => setDescription(val)}
              options={commonWorkCategories}
              placeholder="เลือกหรือพิมพ์รายละเอียดงาน"
              allowCustom={true}
              accentColor="blue"
            />
          </div>

          {/* Tier 1 Box */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-[11px]">ชั้นที่ 1: BOQ ตามสัญญาประมูล (Contract)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 mb-0.5">ปริมาณตามสัญญา</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={contractQty}
                  onChange={e => setContractQty(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">ราคาต่อหน่วยสัญญา (บาท)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={contractUnitRate}
                  onChange={e => setContractUnitRate(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono bg-white"
                />
              </div>
            </div>
            <div className="text-right text-[11px] font-bold text-[#005aa9]">
              รวมมูลค่าสัญญา: {formatCurrency(contractQty * contractUnitRate)} บาท
            </div>
          </div>

          {/* Tier 2 Box */}
          <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 space-y-2">
            <span className="font-bold text-amber-900 block text-[11px]">ชั้นที่ 2: BOQ สำรวจจริงหน้างาน (Target Budget)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 mb-0.5">ปริมาณสำรวจจริง</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={engineerQty}
                  onChange={e => setEngineerQty(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">ต้นทุนเป้าหมายต่อหน่วย (บาท)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={engineerUnitCost}
                  onChange={e => setEngineerUnitCost(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono bg-white"
                />
              </div>
            </div>
            <div className="text-right text-[11px] font-bold text-amber-900">
              รวมงบประมาณวิศวะ: {formatCurrency(engineerQty * engineerUnitCost)} บาท
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#005aa9] text-white rounded font-bold hover:bg-blue-900 cursor-pointer"
            >
              บันทึกหมวดงาน BOQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-Component: Edit BOQ Modal
function EditBOQModal({
  isOpen,
  onClose,
  boqItem,
  uniqueProjects,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  boqItem: ProjectBOQItem;
  uniqueProjects: string[];
  onSave: (updated: Partial<ProjectBOQItem>) => void;
}) {
  const [project, setProject] = useState(boqItem.project);
  const [itemNo, setItemNo] = useState(boqItem.itemNo);
  const [description, setDescription] = useState(boqItem.description);
  const [unit, setUnit] = useState(boqItem.unit);
  
  const [contractQty, setContractQty] = useState(boqItem.contractQty);
  const [contractUnitRate, setContractUnitRate] = useState(boqItem.contractUnitRate);
  
  const [engineerQty, setEngineerQty] = useState(boqItem.engineerQty);
  const [engineerUnitCost, setEngineerUnitCost] = useState(boqItem.engineerUnitCost);

  const commonWorkCategories = [
    'งานถางป่าและขุดตอ',
    'งานขุดดินและตัดคันทาง',
    'งานถมคันทางด้วยวัสดุคัดเลือก',
    'งานรองพื้นทาง (Subbase)',
    'งานพื้นทางหินคลุก (Crushed Rock Base)',
    'งานผิวทางแอสฟัลต์คอนกรีต Binder Course',
    'งานผิวทางแอสฟัลต์คอนกรีต Wearing Course',
    'งานวางท่อระบายน้ำ คสล. ชั้น 3 dia 1.00 ม.',
    'งานท่อเหลี่ยม คสล.',
    'งานทางเท้าและคันหิน คสล.',
    'งานไฟฟ้าส่องสว่างและหม้อแปลง',
    'งานป้ายจราจรและตีเส้นเทอร์โมพลาสติก'
  ];

  const commonUnits = ['ม.', 'ตร.ม.', 'ลบ.ม.', 'ตัน', 'จุด', 'แห่ง', 'ชุด', 'กม.', 'งาน'];

  if (!isOpen) return null;

  const contractTotal = contractQty * contractUnitRate;
  const engineerTotal = engineerQty * engineerUnitCost;
  const plannedMargin = contractTotal - engineerTotal;
  const marginPct = contractTotal > 0 ? (plannedMargin / contractTotal) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      project,
      itemNo,
      description,
      unit,
      contractQty,
      contractUnitRate,
      contractAmount: contractTotal,
      engineerQty,
      engineerUnitCost,
      engineerAmount: engineerTotal
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-5 border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#005aa9]" />
            <h3 className="font-bold text-sm text-slate-900">
              แก้ไขข้อมูลหมวดงาน BOQ (ข้อ {boqItem.itemNo})
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* Row 1: Project & WBS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <SearchableCombobox
                label="โครงการ"
                required
                value={project}
                onChange={(val) => setProject(val)}
                options={uniqueProjects}
                placeholder="เลือกหรือพิมพ์โครงการ"
                allowCustom={true}
                accentColor="blue"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ข้อที่ (WBS Item No)</label>
              <input
                type="text"
                required
                value={itemNo}
                onChange={e => setItemNo(e.target.value)}
                placeholder="เช่น 1.1, 2.3"
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Description & Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <SearchableCombobox
                label="รายการงาน (Description)"
                required
                value={description}
                onChange={(val) => setDescription(val)}
                options={commonWorkCategories}
                placeholder="เลือกหรือพิมพ์รายละเอียดงาน"
                allowCustom={true}
                accentColor="blue"
              />
            </div>

            <div>
              <SearchableCombobox
                label="หน่วยนับ"
                required
                value={unit}
                onChange={(val) => setUnit(val)}
                options={commonUnits}
                placeholder="เลือกหรือพิมพ์หน่วยนับ"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
          </div>

          {/* Tier 1 Box */}
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-[#005aa9]">
              <span>ชั้นที่ 1: BOQ สัญญาประมูล (Contract Target)</span>
              <span className="text-[10px] bg-blue-100 text-[#005aa9] px-1.5 py-0.5 rounded">Tier 1</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-0.5">ปริมาณตามสัญญา ({unit})</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={contractQty}
                  onChange={e => setContractQty(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">ราคาต่อหน่วยสัญญา (บาท)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={contractUnitRate}
                  onChange={e => setContractUnitRate(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono bg-white"
                />
              </div>
            </div>
            <div className="text-right text-[11px] font-bold text-[#005aa9]">
              รวมมูลค่าสัญญา: {formatCurrency(contractTotal)} บาท
            </div>
          </div>

          {/* Tier 2 Box */}
          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-900">
              <span>ชั้นที่ 2: งบวิศวะหน้างาน (Engineering Target Budget)</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Tier 2</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-0.5">ปริมาณสำรวจจริง ({unit})</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={engineerQty}
                  onChange={e => setEngineerQty(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-0.5">ต้นทุนเป้าหมายต่อหน่วย (บาท)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={engineerUnitCost}
                  onChange={e => setEngineerUnitCost(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono bg-white"
                />
              </div>
            </div>
            <div className="text-right text-[11px] font-bold text-amber-900">
              รวมงบประมาณวิศวะ: {formatCurrency(engineerTotal)} บาท
            </div>
          </div>

          {/* Margin Preview */}
          <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>ผลกำไรขั้นต้นตามแผน (Planned GP):</span>
            <span className="font-mono text-emerald-800">
              +{formatCurrency(plannedMargin)} บาท (+{marginPct.toFixed(1)}%)
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#005aa9] text-white rounded font-bold hover:bg-blue-900 cursor-pointer"
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-Component: Add Material to BOQ Modal
function AddMaterialModal({
  isOpen,
  onClose,
  boqItem,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  boqItem: ProjectBOQItem;
  onSave: (mat: Omit<BOQMaterialItem, 'id'>) => void;
}) {
  const [materialName, setMaterialName] = useState('');
  const [standardRatioPerUnit, setStandardRatioPerUnit] = useState<number>(1.0);
  const [unit, setUnit] = useState('ชิ้น');
  const [unitPrice, setUnitPrice] = useState<number>(100);

  const commonMaterials = [
    'ท่อ คสล. มอก. ชั้น 3 dia 1.00 ม.',
    'ยางแอสฟัลต์คอนกรีต AC 60/70',
    'คอนกรีตผสมเสร็จ 240 ksc',
    'คอนกรีตผสมเสร็จ 280 ksc',
    'หินคลุก (Crushed Rock Base)',
    'ทรายหยาบถมคันทาง',
    'ลูกรังคัดเลือก (Select Material)',
    'เหล็กเส้นกลม RB9 มอก.',
    'เหล็กข้ออ้อย DB12 มอก.',
    'เหล็กข้ออ้อย DB16 มอก.',
    'สีเทอร์โมพลาสติกสะท้อนแสง',
    'เสาไฟฟ้ากิ่งเดี่ยว 9 ม.'
  ];

  const commonUnits = ['ชิ้น', 'ท่อน', 'ลบ.ม.', 'ตัน', 'กก.', 'ตร.ม.', 'ชุด', 'เส้น', 'ถุง'];

  if (!isOpen) return null;

  const totalRequiredQty = (boqItem.engineerQty || boqItem.contractQty) * standardRatioPerUnit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      materialName,
      standardRatioPerUnit,
      unit,
      totalRequiredQty,
      withdrawnQty: 0,
      unitPrice
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#005aa9]" />
            เพิ่มวัสดุ BOM (ชั้นที่ 3)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 text-xs space-y-3">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-500 block">ผูกกับหมวดงาน BOQ:</span>
            <strong className="text-slate-800 block text-xs mt-0.5">
              ข้อ {boqItem.itemNo} - {boqItem.description} ({boqItem.engineerQty} {boqItem.unit})
            </strong>
          </div>

          <div>
            <SearchableCombobox
              label="ชื่อรายการวัสดุ"
              required
              value={materialName}
              onChange={(val) => setMaterialName(val)}
              options={commonMaterials}
              placeholder="เลือกหรือพิมพ์ชื่อวัสดุ"
              allowCustom={true}
              accentColor="blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1">อัตราส่วนต่อหน่วยงานหลัก *</label>
              <input
                type="number"
                step="any"
                min="0.001"
                required
                value={standardRatioPerUnit}
                onChange={e => setStandardRatioPerUnit(Number(e.target.value))}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">เช่น 1 ม. ใช้ 1.0 ท่อน</span>
            </div>
            <div>
              <SearchableCombobox
                label="หน่วยนับวัสดุ"
                required
                value={unit}
                onChange={(val) => setUnit(val)}
                options={commonUnits}
                placeholder="เลือกหรือพิมพ์หน่วยนับ"
                allowCustom={true}
                accentColor="blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">ราคาต่อหน่วยประมาณการ (บาท)</label>
            <input
              type="number"
              step="any"
              min="0"
              required
              value={unitPrice}
              onChange={e => setUnitPrice(Number(e.target.value))}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
            />
          </div>

          <div className="bg-blue-50 p-2.5 rounded border border-blue-200 text-slate-800 space-y-1">
            <div className="flex justify-between">
              <span>โควตาคำนวณได้รวม:</span>
              <strong className="font-mono text-[#005aa9]">{totalRequiredQty.toLocaleString()} {unit}</strong>
            </div>
            <div className="flex justify-between">
              <span>มูลค่างบประมาณวัสดุ:</span>
              <strong className="font-mono text-slate-900">{formatCurrency(totalRequiredQty * unitPrice)} บาท</strong>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#005aa9] text-white rounded font-bold hover:bg-blue-900 cursor-pointer"
            >
              บันทึกวัสดุ BOM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
