import React, { useState } from 'react';
import { Zap, Download, RotateCcw, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface OperationalGuidelineProps {
  onExportCSV: () => void;
  onResetDefault: () => void;
  isBottleneckRisk: boolean;
  totalUph: number;
  jigCapacityUph: number;
}

export const OperationalGuideline: React.FC<OperationalGuidelineProps> = ({
  onExportCSV,
  onResetDefault,
  isBottleneckRisk,
  totalUph,
  jigCapacityUph
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  return (
    <div className="space-y-3 no-print">
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-indigo-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              IE Operational Guideline
            </span>
            {isBottleneckRisk ? (
              <span className="inline-flex items-center gap-1 text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-lg font-semibold">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                ความเสี่ยง: ชิ้นงาน Innerbox อาจป้อน Jig ไม่ทัน
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Line Balancing สมดุลกับรอบ Jig ฉีดโฟม
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            ระบบนี้ช่วยแก้ไขปัญหา <strong className="text-white font-semibold">"ไม่มีชิ้นงานประกอบตามรอบการผลิต Jig ฉีดโฟม"</strong> ด้วยการเกลี่ยความต้องการรายชั่วโมง (Hourly Leveling) และคำนวณ Takt Time อัตโนมัติ เพื่อให้ซัพพลายเชนและไลน์ประกอบเตรียม Innerbox ได้ตรงเวลา Just-In-Time
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={onExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            title="ดาวน์โหลดรายงานเป็นไฟล์ CSV ภาษาไทยรองรับ Excel"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกข้อมูล (CSV Report)</span>
          </button>
          
          <button
            onClick={onResetDefault}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition border border-slate-700 flex items-center gap-1.5"
            title="รีเซ็ตค่าโมเดลและพารามิเตอร์ทั้งหมดกลับสู่ค่าเริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>รีเซ็ตค่าเริ่มต้น</span>
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-indigo-800/60 hover:bg-indigo-700 text-indigo-200 text-xs px-2.5 py-2.5 rounded-xl transition border border-indigo-700/60"
            title="คำแนะนำเพิ่มเติมทาง IE"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="font-bold flex items-center gap-2 text-indigo-900">
            <Info className="w-4 h-4 text-indigo-600" />
            หลักการวิศวกรรมอุตสาหการ (Industrial Engineering Key Concepts) สำหรับระบบนี้:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs">
              <span className="font-bold text-indigo-800 block mb-1">1. Heijunka (Production Leveling)</span>
              <p className="text-slate-600 leading-normal">
                กระจายคำสั่งผลิตให้สม่ำเสมอในแต่ละชั่วโมง ไม่ปล่อยให้ช่วงต้นกะผลิตน้อยแล้วเร่งช่วงท้ายกะ ซึ่งเป็นสาเหตุให้ Jig ฉีดโฟมสะดุดรอชิ้นงาน
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs">
              <span className="font-bold text-indigo-800 block mb-1">2. Takt Time Synchronization</span>
              <p className="text-slate-600 leading-normal">
                เวลาเฉลี่ยที่ต้องผลิต Innerbox 1 ชิ้นคือ <span className="font-bold text-indigo-900">{totalUph > 0 ? (3600 / totalUph).toFixed(1) : 0} วินาที</span> ต้องสัมพันธ์กับรอบ Jig โฟม ({jigCapacityUph} ชิ้น/ชม.) เพื่อให้ประกอบต่อเนื่องแบบ One-Piece Flow
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs">
              <span className="font-bold text-indigo-800 block mb-1">3. Milk-Run Delivery Cycle</span>
              <p className="text-slate-600 leading-normal">
                จัดส่งด้วยกระเช้าตามความถี่ที่กำหนด (เช่น ทุก 60 นาที หรือตามรอบรถลาก) เพื่อลดสต็อกค้างในไลน์และตรวจจับความล่าช้าได้ทันท่วงที
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
