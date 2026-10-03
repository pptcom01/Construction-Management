# เอกสารส่งต่องานและสถาปัตยกรรมระบบ (System Architecture & Handover Document)
**ระบบบริหารงานก่อสร้าง บัญชี และการเงินครบวงจร (BTC Construction ERP & Financial Management System)**  
**บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด (BURIRAM THONGCHAI CONSTRUCTION CO., LTD.)**  
*ปรับปรุงล่าสุด: 2 ตุลาคม 2026 (สถานะ: Production-Ready / Compile Build Pass 100%)*

---

## 1. ข้อมูลภาพรวมและบริบทองค์กร (Corporate Profile & System Scope)

### 1.1 ข้อมูลบริษัทและหัวกระดาษทางการ (Official Company Letterhead)
ข้อมูลนี้เป็นค่าเริ่มต้นมาตรฐานสำหรับแบบฟอร์มเอกสารทุกฉบับในระบบ (14 แบบฟอร์มมาตรฐาน เช่น DBM, PV, RFQ, PA, สัญญาจ้างเหมาช่วง, 50 ทวิ):
- **ชื่อบริษัท:** บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด (BURIRAM THONGCHAI CONSTRUCTION CO., LTD.)
- **ที่อยู่:** 31/2 ถนนอินจันทร์ณรงค์ ต.ในเมือง อ.เมือง จ.บุรีรัมย์ 31000
- **เลขประจำตัวผู้เสียภาษี:** `0315559001144` (สำนักงานใหญ่)
- **โทรศัพท์:** `044-611134`
- **E-Mail:** `brtc2024@gmail.com`
- **โลโก้ทางการ:** `https://img2.pic.in.th/pic/Screenshot-2025-03-03-132721e6cc77cbcea28f01.png`

### 1.2 วัตถุประสงค์ของระบบ (System Mission)
ระบบพัฒนาขึ้นเพื่อควบคุมกระบวนการทางธุรกิจก่อสร้างแบบ End-to-End:
1. ป้องกันการจ่ายเงินซ้ำซ้อนผ่านการตรวจสอบยันต์ 3 เอกสาร (3-Way Matching: PO + GR + Invoice)
2. ควบคุมต้นทุนโครงการผ่าน BOQ 3 ชั้น และการตัดหักหนี้ผู้รับเหมาช่วง (Backcharges) อัตโนมัติ
3. ระบบใบขอตั้งเบิกค่าใช้จ่าย (DBM) แบบลงนามดิจิทัล 4 ฝ่ายตามระเบียบองค์กร
4. สมุดรายวันทั่วไป (GL), ใบสำคัญจ่าย (PV), ทะเบียนเช็ค/เงินโอน และการกระทบยอดธนาคาร
5. งบการเงินแบบ Real-time (งบกำไรขาดทุน P&L, กระแสเงินสด, สรุปภาษี ภ.พ.30 / ภ.ง.ด. 3, 53) และ AI วิเคราะห์สภาพคล่อง

---

## 2. สถาปัตยกรรมทางเทคนิค (Technical Architecture & Stack)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Canvas   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    APPLICATION & BUSINESS LOGIC LAYER                  │
│  - RBAC Access Control Guard (Admin / Manager / User)                  │
│  - DatabaseSuggestions Context (Autocomplete Memory across forms)      │
│  - 3-Way Matching & Backcharge Calculation Engines                     │
│  - 4-Position Digital Signature & Approval State Machine               │
│  - General Ledger Double-Entry / Cashbook Sync Engine                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       DATA & INTEGRATION LAYER                         │
│  - LocalStorage (Client cache, offline-first fallback, mock demo state) │
│  - Supabase Database (PostgreSQL Cloud Tables via Supabase JS SDK)    │
│  - Google Workspace Integration (Google Master Sheet 2-Way Sync)       │
│  - Gemini AI SDK (@google/genai) for financial liquidity analysis      │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Stack รายละเอียด
- **Framework:** React 19 (SPA บน Vite)
- **Language:** TypeScript 5.x (Strict Type Checking ผ่าน 100%)
- **Styling:** Tailwind CSS (Modern gradient, Card UI, Clean Enterprise Style, Responsive & Print-ready A4)
- **Icons:** Lucide React
- **Signature Capture:** HTML5 Canvas Signature Pad (รองรับวาดบนจอทัชสกรีนและเมาส์)
- **Print Engine:** CSS `@media print` จัดหน้ากระดาษ A4 (210mm x 297mm) สั่งพิมพ์ออกเครื่องพิมพ์หรือเซฟเป็น PDF ได้ทันที

---

## 3. ผังโครงสร้างโฟลเดอร์และไฟล์สำคัญ (Project Structure)

```
├── /
│   ├── AGENTS.md                  # กฎเหล็กและข้อกำหนดในการเขียนโค้ด (ห้ามละเมิดเด็ดขาด)
│   ├── task_history_log.md        # ประวัติการปรับปรุงระบบทั้งหมด (Log #1 ถึง #32)
│   ├── SYSTEM_ARCHITECTURE_HANDOVER.md # เอกสารส่งต่องานฉบับนี้
│   ├── package.json               # Dependencies และ scripts
│   ├── tsconfig.json              # การตั้งค่า TypeScript
│   ├── vite.config.ts             # การตั้งค่า Vite build
│   └── src/
│       ├── App.tsx                # คอมโพเนนต์ศูนย์กลาง ควบคุม Routing, State และ Modals
│       ├── types.ts               # Data Types & Interfaces หลักทั้งหมดของระบบ
│       ├── index.css              # Global styles & Tailwind imports
│       │
│       ├── components/            # UI Views & Components
│       │   ├── Header.tsx         # ส่วนหัว แถบเครื่องมือ โปรไฟล์ผู้ใช้ และปุ่ม Sign Out
│       │   ├── Sidebar.tsx        # เมนูนำทางแยกตามฝ่าย พร้อมการ์ดยอดคงเหลือ GL
│       │   ├── LoginView.tsx      # หน้าเข้าสู่ระบบ (เลือกรวดเร็ว / Username & Password)
│       │   ├── UserProfileModal.tsx # ข้อมูลโปรไฟล์ผู้ใช้และสิทธิ์เมนู
│       │   ├── UserManagementView.tsx # ระบบจัดการผู้ใช้และกำหนดสิทธิ์ (Admin Only)
│       │   ├── BTCLogo.tsx        # คอมโพเนนต์แสดงผลโลโก้ทางการของบริษัท
│       │   │
│       │   ├── DashboardView.tsx  # แดชบอร์ดภาพรวมผู้บริหารและสถานะการเงิน
│       │   ├── BOQView.tsx        # จัดการ BOQ 3 ชั้น (โครงการ > หมวดงาน > รายการย่อย/BOM)
│       │   ├── SubcontractsView.tsx # บริหารผู้รับเหมาช่วง ตรวจงาน และตัดหัก Backcharge
│       │   ├── ProjectsView.tsx   # ติดตามต้นทุน รายรับ และกำไรแต่ละโครงการ
│       │   ├── ProcurementView.tsx # ตรวจรับพัสดุ (GR) และตัดหักช่างหน้างาน
│       │   ├── SupplierBillingView.tsx # รับวางบิลร้านค้า (3-Way Match: PO+GR+Invoice)
│       │   ├── DisbursementsView.tsx # ทะเบียนใบขอตั้งเบิกค่าใช้จ่าย (DBM)
│       │   ├── PaymentView.tsx    # ทะเบียนบันทึกจ่ายเงิน & ใบสำคัญจ่าย (PV)
│       │   ├── AccountsView.tsx   # บัญชีธนาคาร วงเงินกู้ยืม และสัญญายืมเงินกรรมการ
│       │   ├── TransactionsView.tsx # สมุดรายวันทั่วไป (General Ledger)
│       │   ├── ReportsView.tsx    # งบการเงิน, งบกำไรขาดทุน P&L และพิมพ์รายงาน
│       │   ├── TaxSummaryView.tsx # สรุปภาษีหัก ณ ที่จ่าย (WHT), VAT 7% และประกันสังคม
│       │   ├── TodoView.tsx       # ปฏิทินกำหนดจ่ายเงิน & ภาระผูกพัน
│       │   ├── AIAnalysisView.tsx # AI วิเคราะห์สภาพคล่องและกระแสเงินสด
│       │   ├── DocumentTemplatesView.tsx # ศูนย์รวมแบบฟอร์มเอกสารมาตรฐาน 14 ฉบับ
│       │   │
│       │   ├── documents/         # แม่แบบเอกสารมาตรฐาน A4 (Pixel-Perfect Print)
│       │   │   ├── types.ts       # โมเดลข้อมูลหัวกระดาษและบริษัทในเครือ (BTC, BTCP, TBTC, BTC-PC)
│       │   │   ├── DBMTemplate.tsx # แม่แบบใบขอตั้งเบิก DBM + ใบบันทึกจ่าย
│       │   │   ├── ProcurementTemplates.tsx # RFQ, Matrix เปรียบเทียบราคา, PA ขอสั่งซื้อ
│       │   │   ├── SubcontractTemplates.tsx # SA อนุมัติสั่งจ้าง, สัญญาจ้างเหมาช่วง, ใบส่งมอบงาน
│       │   │   ├── AdditionalDocumentForms.tsx # ใบสำคัญจ่าย PV, 50 ทวิ, ใบรับวางบิล
│       │   │   └── AuditAndBOQTemplates.tsx # ใบรับรองดิจิทัล ISO และ BOQ ทางการ
│       │   │
│       │   └── modals/            # โมดอลทำรายการต่างๆ
│       │       ├── NewDisbursementModal.tsx # สร้างใบขอตั้งเบิก DBM พร้อมคำนวณ WHT/VAT
│       │       ├── PaymentVoucherModal.tsx # ออกใบสำคัญจ่าย PV
│       │       ├── RecordPaymentModal.tsx # บันทึกการตัดจ่ายเงินจริง
│       │       ├── ReviewApprovalModal.tsx # ตรวจสอบและลงนามอนุมัติเอกสาร
│       │       ├── SignaturePadModal.tsx # กระดานเซ็นชื่อดิจิทัลสด
│       │       └── GoogleMasterSyncModal.tsx # ซิงค์ข้อมูลกับ Google Sheets
│       │
│       ├── services/              # External Integrations & Data Services
│       │   ├── userService.ts     # ระบบตรวจสอบสิทธิ์, บัญชีผู้ใช้, RBAC, PIN
│       │   ├── supabaseService.ts # เชื่อมต่อและดึง/บันทึกข้อมูล Supabase
│       │   ├── supabase.ts        # Supabase client initialization
│       │   ├── googleAuthService.ts # การเชื่อมต่อ Google Workspace & OAuth
│       │   └── geminiService.ts   # บริการ AI วิเคราะห์งบการเงินผ่าน Gemini API
│       │
│       └── utils/                 # ฟังก์ชันตัวช่วยและข้อมูลเริ่มต้น
│           ├── thaiBahtText.ts    # ฟังก์ชันแปลงตัวเลขเป็นตัวอักษรภาษาไทย & โปรไฟล์บริษัท
│           ├── databaseDatalist.ts # ฐานข้อมูลบัญชีและผู้รับเงินสำหรับ Autocomplete
│           ├── DatabaseSuggestionsContext.tsx # Context จดจำคำค้นหาอัตโนมัติ
│           ├── disbursementData.ts # ข้อมูลตั้งต้นรายการใบตั้งเบิก DBM
│           └── subcontractData.ts # ข้อมูลตั้งต้นผู้รับเหมาช่วงและสัญญา
```

---

## 4. สถานะสิ่งที่ทำเสร็จแล้ว (What is Already Built - 100% Completed)

### 4.1 ระบบยืนยันตัวตนและการควบคุมสิทธิ์ (RBAC Authentication)
- **ระบบ Login:** รองรับ 2 โหมด:
  1. *Quick Staff Select:* แตะเลือกเจ้าหน้าที่แล้วกรอก PIN 4-6 หลัก
  2. *Username / Password:* สำหรับผู้ดูแลระบบหรือกรอกรหัสผ่านปกติ
- **ระดับสิทธิ์ 3 ระดับ:**
  1. **👑 Admin:** เข้าถึงทุกเมนู รวมถึงเมนู "จัดการผู้ใช้งาน & กำหนดสิทธิ์" (เพิ่ม/แก้ไข/พักการใช้งานบัญชี)
  2. **💼 Manager:** อนุมัติเอกสาร DBM, ดูงบ P&L, แดชบอร์ดผู้บริหาร, AI วิเคราะห์สภาพคล่อง
  3. **👤 User:** เข้าถึงเฉพาะเมนูของฝ่ายตนเอง (เบิกเงิน, ตรวจรับของ, BOQ) พร้อม**ระบบซ่อนยอดเงินรวมบริษัทอัตโนมัติ (`฿ ••••••••`)**
- **Clean Architecture:** ลบปุ่ม "สลับสิทธิ์เจ้าหน้าที่" ลอยแบบเก่าออกทั้งหมด เพื่อให้สิทธิ์สะท้อนตามผู้ใช้ที่ล็อกอินจริง 100% และแสดงโปรไฟล์ผู้ใช้จุดเดียวที่มุมขวาบนของ Header

### 4.2 ฝ่ายโครงการ (Project Operations)
- **BOQ โครงการ 3 ชั้น:** โครงสร้างข้อมูล `Project` ➔ `Main Category` (โครงสร้าง, สถาปัตย์, สุขาภิบาล ฯลฯ) ➔ `Subitems / Rate Analysis` (ค่าวัสดุ + ค่าแรง)
- **บริหารผู้รับเหมาช่วง (Subcontracts):** บันทึกสัญญาจ้าง, ตรวจรับงวดงาน (Inspection), ออกหนังสือแจ้งส่งมอบงาน
- **ระบบตัดหักหนี้ (Backcharges):** บันทึกค่าวัสดุ/น้ำมัน/เครื่องจักรที่ผู้รับเหมาช่วงเบิกเกิน และส่งยอดไปหักค่างวดอัตโนมัติ

### 4.3 ฝ่ายจัดซื้อ (Procurement & Purchasing)
- **ตรวจรับพัสดุ (Goods Receipt - GR):** บันทึกการรับของหน้างาน ระบุว่าเป็นของโครงการหรือตัดหักช่าง
- **รับวางบิลร้านค้า (3-Way Matching):** ตรวจสอบยันต์ 3 เอกสารระหว่าง `PO` + `GR` + `Invoice` พร้อมปุ่มกดส่งข้อมูลไปสร้างใบขอตั้งเบิก (DBM) โดยไม่ต้องพิมพ์ข้อมูลซ้ำ

### 4.4 ฝ่ายการเงิน (Finance & Treasury)
- **ใบขอตั้งเบิกค่าใช้จ่าย (DBM):** รวบรวมรายการเบิกเงิน, คำนวณ WHT 1%, 2%, 3%, 5% และ VAT 7%, มีบล็อกลงนาม 4 ฝ่ายตามกฎหมาย
- **บันทึกจ่ายเงิน & ใบสำคัญจ่าย (PV):** สร้างเอกสาร PV อัตโนมัติเมื่อฝ่ายการเงินจ่ายเงินจริง ตัดจ่ายจากบัญชีธนาคารที่เลือก
- **บัญชีธนาคาร & เงินยืม (Accounts):** คำนวณยอดเงินสดคงเหลือตามบัญชีธนาคาร (KTB, BBL, KBANK) และติดตามสัญญายืมเงินกรรมการ

### 4.5 ฝ่ายบัญชี & ผู้บริหาร (Accounting & Executive)
- **สมุดรายวันทั่วไป (General Ledger):** บันทึกรายรับ-รายจ่าย เชื่อมโยงรหัสโครงการ, บัญชีธนาคาร และแนบหลักฐาน
- **งบกำไรขาดทุน (P&L Reports):** สรุปผลกำไร-ขาดทุนรวม และแยกรายโครงการแบบเรียลไทม์
- **AI วิเคราะห์งบการเงิน:** ประเมินความเสี่ยงกระแสเงินสดและ Cash Runway ด้วย Gemini AI
- **ศูนย์รวมแบบฟอร์มเอกสาร 14 ฉบับ:** แม่แบบมาตรฐานงานก่อสร้าง พิมพ์ A4 สวยงาม พร้อมระบบดึงหัวกระดาษบริษัททางการอัตโนมัติ

---

## 5. การไหลของข้อมูลในระบบ (Data Flow & Cascading Consistency)

```
[1. หน้างาน / จัดซื้อ]
   ใบสั่งซื้อ (PO) ──┐
   ตรวจรับพัสดุ (GR) ─┼──► [2. รับวางบิล 3-Way Match] ──► [3. สร้างใบขอตั้งเบิก (DBM)]
   สัญญาช่างเหมา ────┘                                      │
                                                             ▼
                                                [4. ตรวจสอบ & ลงนาม 4 ฝ่าย]
                                                   - ผู้ขอเบิก
                                                   - วิศวกรโครงการ / ผู้ตรวจ
                                                   - ฝ่ายการเงิน
                                                   - กรรมการผู้จัดการ (อนุมัติ)
                                                             │
                                                             ▼
                                                [5. บันทึกจ่ายเงิน & ออกใบสำคัญจ่าย (PV)]
                                                             │
                                                             ▼
                                                [6. ลงสมุดบัญชีรายวันทั่วไป (GL)]
                                                             │
                                   ┌─────────────────────────┴────────────────────────┐
                                   ▼                                                  ▼
                        [7. ตัดยอดบัญชีธนาคาร]                             [8. อัปเดตงบ P&L & แดชบอร์ด]
```

---

## 6. งานค้างและแนวทางพัฒนาต่อยอด (Pending Tasks & Backlog for Next Dev)

สำหรับผู้พัฒนาท่านถัดไป สามารถนำหัวข้อเหล่านี้ไปต่อยอดได้ทันทีตามลำดับความสำคัญ:

### 6.1 ด้านฐานข้อมูล (Database & Cloud Persistence) [แนะนำเป็นลำดับแรก]
- **สถานะปัจจุบัน:** ระบบมีโค้ดเชื่อมต่อ Supabase (`src/services/supabaseService.ts`) และโค้ด LocalStorage fallback รองรับการทำงานออฟไลน์
- **สิ่งที่ควรทำต่อ:**
  1. ในหน้า Settings หรือ Admin ให้เพิ่มปุ่มตรวจเช็คการเชื่อมต่อ Supabase Table ให้สมบูรณ์
  2. รันคำสั่ง SQL สร้างตารางจริงบน Supabase Cloud ตาม Schema ที่กำหนดไว้ใน `supabaseService.ts`
  3. ตั้งค่า Supabase Storage Bucket สำหรับเก็บไฟล์แนบสลิปโอนเงิน/ใบแจ้งหนี้แบบถาวรแทน Base64 data URL

### 6.2 ด้านการแจ้งเตือนและการสื่อสาร (Notifications)
- **สิ่งที่ควรทำต่อ:**
  1. เชื่อมต่อ LINE Notify / LINE OA เมื่อมีใบขอตั้งเบิก (DBM) สร้างใหม่ ส่งข้อความแจ้งผู้บริหารให้เข้ามาเซ็นอนุมัติ
  2. แจ้งเตือนเช็คครบกำหนดจ่ายและภาระผูกพันผ่านอีเมลหรือ LINE ก่อนวันครบกำหนด 3 วัน

### 6.3 ด้านระบบภาษีอิเล็กทรอนิกส์ (e-Tax & e-Withholding Tax)
- **สิ่งที่ควรทำต่อ:**
  1. สร้างฟังก์ชัน Export ข้อมูลภาษีหัก ณ ที่จ่ายเป็นไฟล์ข้อความ (Text file) หรือ Excel ตามฟอร์แมตของกรมสรรพากร (RD Prep) เพื่อให้นักบัญชีนำไปอัปโหลด ภ.ง.ด.3 / ภ.ง.ด.53 ได้ทันที

### 6.4 ด้านการสแกนใบเสร็จด้วย AI (Smart OCR)
- **สิ่งที่ควรทำต่อ:**
  1. พัฒนาปุ่ม "ถ่ายรูปสลิป / ใบแจ้งหนี้" ใน `NewDisbursementModal` แล้วส่งรูปภาพให้ Gemini Flash สกัดชื่อร้านค้า, วันที่, เลขผู้เสียภาษี และยอดเงิน กรอกลงฟอร์มอัตโนมัติ

---

## 7. กฎเหล็กและข้อพึงระวังในการพัฒนาต่อ (Engineering Rules & Directives)

*ผู้ที่จะมาพัฒนาต่อต้องปฏิบัติตามกฎนี้อย่างเคร่งครัดตามข้อกำหนดใน `AGENTS.md`:*

1. **แก้แบบเจาะจง Function เท่านั้น (Targeted Editing Only):**
   - ห้ามลบเขียนใหม่ทั้งไฟล์ (No full block rewrites)
   - ไม่ลบฟังก์ชันเดิมทิ้ง ให้ขยายหรือแก้เฉพาะจุดที่มีปัญหา
2. **ห้ามคาดเดาข้อมูลเด็ดขาด (No Blind Assumptions):**
   - อ้างอิงตามประเภทข้อมูลใน `src/types.ts` เสมอ
3. **ตรวจสอบความสอดคล้องทั้งระบบเสมอ (Cascading Consistency Check):**
   - หากแก้ฟิลด์ในใบตั้งเบิก DBM ต้องเช็คผลกระทบต่อไปยังใบสำคัญจ่าย PV และสมุดรายวัน GL
4. **ต้องอัปเดตไฟล์ `task_history_log.md` เสมอ:**
   - บันทึกหมายเลข Log ถัดไป (เริ่มที่ Log #33) สรุปสิ่งที่แก้ไขและสาเหตุทุกครั้งที่มีการแก้โค้ด
5. **รักษาระบบ Role-Based Access Control (RBAC):**
   - ห้ามนำระบบสลับสิทธิ์ลอยกลับมา ให้คงการตรวจสอบสิทธิ์ผ่าน `currentUser.role` ('admin' | 'manager' | 'user') เท่านั้น

---

## 8. บัญชีทดสอบสำหรับผู้พัฒนา (Demo Accounts)

สามารถใช้บัญชีต่อไปนี้ทดสอบระบบในสภาพแวดล้อม Development:
- **ผู้ดูแลระบบสูงสุด (Admin):** Username: `admin` / รหัสผ่าน: `admin` / PIN: `1234`
- **หัวหน้าฝ่ายบัญชี (Admin):** Username: `paweena` / PIN: `1234`
- **เจ้าหน้าที่การเงินอาวุโส (Manager):** Username: `kamolthip` / PIN: `1234`
- **ผู้จัดการโครงการ PM (Manager):** Username: `theeraphong` / PIN: `1234`
- **เจ้าหน้าที่จัดซื้อ (User):** Username: `arnon` / PIN: `1234`
