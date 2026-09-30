import React, { useState } from 'react';
import { Activity, Flame, ShieldAlert, CheckCircle2, Sliders, ArrowRight, Gauge, Layers } from 'lucide-react';
import { ModelItem, ShiftSettings } from '../types';

interface FoamJigSimulationProps {
  models: ModelItem[];
  settings: ShiftSettings;
  totalUph: number;
}

export const FoamJigSimulation: React.FC<FoamJigSimulationProps> = ({
  models,
  settings,
  totalUph
}) => {
  const [jigCuringTimeSec, setJigCuringTimeSec] = useState<number>(180); // เวลาอบโฟมใน Jig (วินาที)
  const [numJigStations, setNumJigStations] = useState<number>(8); // จำนวนช่อง Jig ฉีดโฟม
  const [safetyBufferMinutes, setSafetyBufferMinutes] = useState<number>(30); // สต็อกสำรองหน้า Jig (นาที)

  // Jig throughput calculation:
  // If 1 jig takes 180s, and there are 8 jigs, effective cycle time = 180 / 8 = 22.5s/unit -> 160 UPH
  const effectiveJigCycleSec = numJigStations > 0 ? jigCuringTimeSec / numJigStations : 0;
  const jigCapacityUph = effectiveJigCycleSec > 0 ? Math.round(3600 / effectiveJigCycleSec) : 0;

  // Comparison
  const balanceRatio = jigCapacityUph > 0 ? (totalUph / jigCapacityUph) * 100 : 0;
  const bufferUnitsRequired = Math.round((totalUph / 60) * safetyBufferMinutes);

  let status: 'balanced' | 'starving' | 'overburden' = 'balanced';
  if (totalUph < jigCapacityUph * 0.9) {
    status = 'starving'; // Innerbox feed rate is lower than Jig demand -> Jig is waiting!
  } else if (totalUph > jigCapacityUph * 1.1) {
    status = 'overburden'; // Feed rate is higher than Jig capacity -> Line accumulates overflow
  }

  return (
    <div className="space-y-6 no-print animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-800/40 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-xl text-xs font-bold">
              <Activity className="w-4 h-4 text-indigo-400" />
              การซิงโครไนซ์รอบผลิต (Line Balancing & Foaming Jig Synchronization)
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              วิเคราะห์และแก้ปัญหา Jig ฉีดโฟมขาดแคลนชิ้นงาน Innerbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ในสายการผลิตตู้เย็น/ตู้แช่ ปัญหาหลักคือ <strong>"Jig ฉีดโฟมว่างงาน (Idle Time)"</strong> เนื่องจากกระเช้าส่ง Innerbox มาไม่ทันรอบเวลาบ่มโฟม (Foam Curing Time) เครื่องมือนี้ช่วยคำนวณอัตราสมดุลและความต้องการสต็อกกันชน (Buffer Stock) หน้ารอบฉีดโฟม
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[200px]">
            <span className="text-xs text-indigo-200 font-medium block">อัตราความสมดุลสายการผลิต</span>
            <div className="text-3xl font-black mt-1 text-white font-mono">
              {balanceRatio.toFixed(1)}%
            </div>
            <span
              className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-2 ${
                status === 'balanced'
                  ? 'bg-emerald-500 text-white'
                  : status === 'starving'
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {status === 'balanced'
                ? '✓ สมดุล ป้อนงานทัน Jig'
                : status === 'starving'
                ? '⚠️ เสี่ยง Jig รอชิ้นงาน (Starvation)'
                : '⚠️ ป้อนงานเกินรอบ Jig'}
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Inputs & Key Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Foaming Jig Parameters */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              พารามิเตอร์ Jig ฉีดโฟม (Foam Jig Parameters)
            </h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เวลาอบโฟมต่อตู้ใน Jig (วินาที/รอบ)
              </label>
              <input
                type="number"
                value={jigCuringTimeSec}
                onChange={(e) => setJigCuringTimeSec(Math.max(10, Number(e.target.value) || 10))}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                มาตรฐานอุตสาหกรรมตู้เย็น: 150 - 240 วินาที
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนช่อง Jig ฉีดโฟม (Jig Stations)
              </label>
              <input
                type="number"
                value={numJigStations}
                onChange={(e) => setNumJigStations(Math.max(1, Number(e.target.value) || 1))}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                จำนวนแท่น Jig ฉีดโฟมที่ทำงานพร้อมกันในสถานี
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เป้าหมายสต็อกกันชนหน้า Jig (Buffer Time - นาที)
              </label>
              <input
                type="number"
                value={safetyBufferMinutes}
                onChange={(e) => setSafetyBufferMinutes(Math.max(5, Number(e.target.value) || 5))}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                เวลาเผื่อกรณีรถส่งกระเช้าสะดุดหรือชะลอตัว
              </span>
            </div>
          </div>
        </div>

        {/* Comparison: Innerbox Feed vs Jig Capacity */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Gauge className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">
                เปรียบเทียบอัตราป้อนงาน vs ความสามารถ Jig
              </h3>
            </div>

            <div className="space-y-4 mt-4">
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100">
                <span className="text-xs text-indigo-700 font-semibold block">
                  1. อัตราส่งมอบ Innerbox รวมทุกรุ่น (Feed Rate)
                </span>
                <div className="text-2xl font-black text-indigo-950 font-mono mt-0.5">
                  {totalUph} <span className="text-xs font-normal text-slate-600">ชิ้น/ชม.</span>
                </div>
                <span className="text-[11px] text-indigo-600">
                  Takt Time = {totalUph > 0 ? (3600 / totalUph).toFixed(1) : 0} วินาที/ชิ้น
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-700 font-semibold block">
                  2. กำลังการผลิตของ Jig ฉีดโฟม (Jig Capacity)
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {jigCapacityUph} <span className="text-xs font-normal text-slate-600">ชิ้น/ชม.</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  รอบปล่อยงาน = {effectiveJigCycleSec.toFixed(1)} วินาที/ตู้
                </span>
              </div>
            </div>
          </div>

          {/* Balance Alert Box */}
          <div
            className={`p-3 rounded-xl border text-xs leading-normal flex items-start gap-2.5 ${
              status === 'balanced'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : status === 'starving'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {status === 'balanced' && (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>ความเร็วสมดุลดีเยี่ยม:</strong> Innerbox ป้อนงานทันรอบ Jig ฉีดโฟมพอดี ไม่เกิดขยะจากการรอคอย (Waiting Waste)
                </div>
              </>
            )}
            {status === 'starving' && (
              <>
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Jig ฉีดโฟมมีความเสี่ยงรอชิ้นงาน:</strong> รอบกระเช้า Innerbox ป้อนได้เพียง {totalUph} ชิ้น/ชม. แต่ Jig ต้องการ {jigCapacityUph} ชิ้น/ชม. แนะนำเพิ่มรอบกระเช้าหรือจำนวนชิ้น/รอบ
                </div>
              </>
            )}
            {status === 'overburden' && (
              <>
                <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Innerbox ป้อนเร็วกว่ารอบ Jig:</strong> แนะนำลดรอบจัดส่งหรือปรับเกลี่ยงานเพื่อไม่ให้กองสต็อกหน้าไลน์บวม
                </div>
              </>
            )}
          </div>
        </div>

        {/* Safety Buffer Stock Calculator */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">
                สต็อกกันชนที่แนะนำ (Buffer Stock Sizing)
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600">
                ตามหลัก Little's Law ของ IE เพื่อป้องกัน Jig หยุดเดินเครื่องระหว่างรอรถลากกระเช้า ควรมี Innerbox สำรองหน้า Jig อย่างน้อย:
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center">
                <span className="text-xs text-indigo-700 font-semibold block">
                  จำนวนชิ้นงานสำรองหน้าไลน์ (Safety Buffer)
                </span>
                <div className="text-3xl font-extrabold text-indigo-950 font-mono mt-1">
                  {bufferUnitsRequired} <span className="text-xs font-normal text-slate-600">ชิ้น</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  เทียบเท่า ~{(bufferUnitsRequired / (settings.defaultPcsCycle || 5)).toFixed(0)} กระเช้า
                  (ครอบคลุมการทำงาน {safetyBufferMinutes} นาที)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
            💡 <strong>คำแนะนำหน้างาน:</strong> จัดวางกระเช้าสำรองไว้ที่จุด staging area ก่อนเข้า Jig ล่วงหน้า 1 ชั่วโมงก่อนเริ่มกะการผลิต
          </div>
        </div>
      </div>

      {/* Model Breakdown & Delivery Frequency Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span>📋 ลำดับความสำคัญในการจัดส่ง Innerbox สู่ Jig ฉีดโฟม (Dispatch Priority Ranking)</span>
        </h3>
        <p className="text-xs text-slate-500">
          รุ่นที่มีอัตราการบริโภคสูงต้องจัดรอบส่งแบบถี่สม่ำเสมอ เพื่อไม่ให้ Jig สะดุด
        </p>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">รุ่นสินค้า</th>
                <th className="p-3 text-center">UPH (ชิ้น/ชม.)</th>
                <th className="p-3 text-center">สัดส่วนต่อไลน์ (%)</th>
                <th className="p-3 text-center">รอบกระเช้า (รอบ/ชม.)</th>
                <th className="p-3 text-center">เวลาห่างต่อรอบส่ง (นาที)</th>
                <th className="p-3 text-center">ระดับความสำคัญ (Priority)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...models]
                .sort((a, b) => b.cycles * b.pcsPerCycle - a.cycles * a.pcsPerCycle)
                .map((m, idx) => {
                  const uph = m.cycles * m.pcsPerCycle;
                  const ratio = totalUph > 0 ? ((uph / totalUph) * 100).toFixed(1) : '0';
                  const interval = m.cycles > 0 ? (60 / m.cycles).toFixed(1) : '-';
                  const isHigh = idx < 2 || Number(m.cycles) >= 5;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-800">
                        {m.name}
                      </td>
                      <td className="p-3 text-center font-bold text-indigo-900 font-mono">
                        {uph}
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-700 font-mono">
                        {ratio}%
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-700 font-mono">
                        {m.cycles}
                      </td>
                      <td className="p-3 text-center text-slate-700 font-mono">
                        ทุก {interval} นาที
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isHigh
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isHigh ? '🔥 วิกฤต (ห้ามขาด)' : 'ปกติ'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
