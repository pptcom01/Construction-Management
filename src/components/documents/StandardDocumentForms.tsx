/**
 * src/components/documents/StandardDocumentForms.tsx
 * รวมแบบฟอร์มเอกสารมาตรฐาน 9 ฉบับ ตรงตามต้นฉบับ HTML 100%
 * รองรับการแสดงผล พิมพ์ A4 และนำไปผูกข้อมูลระบบจริง
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  Award, 
  Building2, 
  DollarSign, 
  Layers, 
  ShieldCheck, 
  FileCheck, 
  BarChart2
} from 'lucide-react';
import { CompanyInfo, DEFAULT_SAMPLE_COMPANY } from './types';

// Import all 9 standard templates
import {
  RFQFormTemplate,
  ComparisonMatrixTemplate,
  PAApprovalTemplate
} from './ProcurementTemplates';

import {
  SAApprovalTemplate,
  SubcontractorContractTemplate,
  DeliveryNoteTemplate,
  SubcontractorBillingTemplate
} from './SubcontractTemplates';

import {
  ProjectBOQTemplate,
  DigitalCertificateTemplate
} from './AuditAndBOQTemplates';

import { DBMTemplate } from './DBMTemplate';

// Re-export for system-wide consumption
export {
  DEFAULT_SAMPLE_COMPANY,
  RFQFormTemplate,
  ComparisonMatrixTemplate,
  PAApprovalTemplate,
  SAApprovalTemplate,
  SubcontractorContractTemplate,
  DeliveryNoteTemplate,
  SubcontractorBillingTemplate,
  ProjectBOQTemplate,
  DigitalCertificateTemplate,
  DBMTemplate
};

// -------------------------------------------------------------------------
// Standalone Gallery สำหรับเรียกดูและสั่งพิมพ์ทั้ง 9 ฟอร์มมาตรฐาน
// -------------------------------------------------------------------------
export function StandardDocumentsGallery() {
  const [activeDoc, setActiveDoc] = useState<string>('rfq_form');

  const docList = [
    { id: 'rfq_form', title: '1. ใบขอสอบราคา (RFQ)', sub: 'Request for Quotation', icon: FileCheck },
    { id: 'comparison_matrix', title: '2. ตารางเปรียบเทียบราคา', sub: 'Quotation Comparison Matrix', icon: BarChart2 },
    { id: 'pa_approval', title: '3. ใบอนุมัติสั่งซื้อวัสดุ (PA)', sub: 'Procurement Approval', icon: CheckCircle2 },
    { id: 'sa_approval', title: '4. ใบอนุมัติสั่งจ้างเหมา (SA)', sub: 'Subcontract Approval', icon: Award },
    { id: 'subcontractor_contract', title: '5. สัญญาจ้างเหมาช่วง', sub: 'Subcontract Agreement', icon: FileText },
    { id: 'delivery_note', title: '6. ใบส่งของ / ตรวจรับพัสดุ (GRN)', sub: 'Goods Receiving Note', icon: Building2 },
    { id: 'subcontractor_billing', title: '7. ใบเบิกค่างวดงาน (IPC)', sub: 'Payment Certificate', icon: DollarSign },
    { id: 'project_boq', title: '8. ใบถอดปริมาณงาน & BOM', sub: 'BOQ & BOM Comprehensive', icon: Layers },
    { id: 'digital_certificate', title: '9. ใบรับรองลงนามดิจิทัล & Audit', sub: 'Certificate of Completion', icon: ShieldCheck },
    { id: 'dbm_voucher', title: '10. ใบขอตั้งเบิกและบันทึกจ่าย (DBM)', sub: 'Disbursement & Payment Voucher', icon: DollarSign },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start p-4 bg-slate-100 min-h-screen">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-80 shrink-0 bg-slate-900 p-4 rounded-xl text-white space-y-3 print:hidden shadow-lg">
        <div className="border-b border-slate-800 pb-2.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            แบบฟอร์มเอกสารมาตรฐาน 9 ฉบับ
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            ตรงตามมาตรฐานแบบฟอร์มจัดซื้อ-จ้างเหมา-ควบคุมงาน
          </p>
        </div>

        <div className="space-y-1">
          {docList.map((doc) => {
            const Icon = doc.icon;
            const isActive = activeDoc === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id)}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-white/20' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold leading-tight">{doc.title}</div>
                  <div className="text-[9.5px] opacity-75 font-mono truncate">{doc.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-md hover:shadow-lg active:scale-98"
          >
            <Printer className="w-4 h-4" />
            พิมพ์เอกสารฉบับนี้ (Print / PDF)
          </button>
        </div>
      </div>

      {/* Document View Preview Container */}
      <div className="flex-1 w-full max-w-5xl bg-white rounded-xl shadow-md overflow-hidden print:shadow-none print:m-0 print:max-w-none">
        {activeDoc === 'rfq_form' && <RFQFormTemplate />}
        {activeDoc === 'comparison_matrix' && <ComparisonMatrixTemplate />}
        {activeDoc === 'pa_approval' && <PAApprovalTemplate />}
        {activeDoc === 'sa_approval' && <SAApprovalTemplate />}
        {activeDoc === 'subcontractor_contract' && <SubcontractorContractTemplate />}
        {activeDoc === 'delivery_note' && <DeliveryNoteTemplate />}
        {activeDoc === 'subcontractor_billing' && <SubcontractorBillingTemplate />}
        {activeDoc === 'project_boq' && <ProjectBOQTemplate />}
        {activeDoc === 'digital_certificate' && <DigitalCertificateTemplate />}
        {activeDoc === 'dbm_voucher' && <DBMTemplate />}
      </div>
    </div>
  );
}

// Default export
export default StandardDocumentsGallery;
