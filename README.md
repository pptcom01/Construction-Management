<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ระบบบริหารงานก่อสร้าง บัญชี และการเงิน (BTC Construction ERP)
**บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด (BURIRAM THONGCHAI CONSTRUCTION CO., LTD.)**

> 📖 **เอกสารส่งต่องานและสถาปัตยกรรมระบบฉบับสมบูรณ์ (Handover & Architecture Document):**  
> โปรดอ่านรายละเอียดทั้งหมดที่ไฟล์ [`SYSTEM_ARCHITECTURE_HANDOVER.md`](./SYSTEM_ARCHITECTURE_HANDOVER.md)  
> และกฎเหล็กการเขียนโค้ดที่ไฟล์ [`AGENTS.md`](./AGENTS.md)

---

## การรันระบบในเครื่อง (Run Locally)

**Prerequisites:** Node.js 18+

1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
2. ตั้งค่าคีย์ตัวแปรสภาพแวดล้อมใน `.env` (ดูตัวอย่างใน `.env.example`)
3. รันเซิร์ฟเวอร์พัฒนา:
   ```bash
   npm run dev
   ```
4. ตรวจสอบโค้ดและทดสอบ Build:
   ```bash
   npm run lint
   npm run build
   ```
