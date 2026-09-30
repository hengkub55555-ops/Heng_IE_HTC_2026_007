import React, { useState } from 'react';
import { CalendarClock, CheckSquare, ListOrdered, Sparkles, Check, AlertCircle } from 'lucide-react';
import { ModelItem, ShiftSettings, HourlyLog } from '../types';

interface HourlyMatrixProps {
  models: ModelItem[];
  settings: ShiftSettings;
  hourlyLog: HourlyLog;
  onToggleHourDelivery: (hour: number, modelId: string) => void;
  onMarkHourComplete: (hour: number) => void;
}

export const HourlyMatrix: React.FC<HourlyMatrixProps> = ({
  models,
  settings,
  hourlyLog,
  onToggleHourDelivery,
  onMarkHourComplete
}) => {
  const [viewMode, setViewMode] = useState<'plan' | 'tracking'>('plan');
  const shiftHours = settings.shiftHours || 10;

  // Calculate clock intervals based on shiftStartTime (e.g., 08:00)
  const getHourTimeInterval = (hourIndex: number) => {
    const [startH, startM] = settings.shiftStartTime.split(':').map(Number);
    const startHour = ((startH + hourIndex - 1) % 24);
    const endHour = ((startH + hourIndex) % 24);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(startHour)}:${pad(startM || 0)} - ${pad(endHour)}:${pad(startM || 0)}`;
  };

  let grandTotalShift = 0;
  const hourlySums = new Array(shiftHours).fill(0);

  models.forEach((m) => {
    const uph = Number(m.cycles) * Number(m.pcsPerCycle);
    grandTotalShift += uph * shiftHours;
    for (let i = 1; i <= shiftHours; i++) {
      hourlySums[i - 1] += uph;
    }
  });

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 no-print">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
              <CalendarClock className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              แผนการเบิกและจัดส่ง Innerbox รายชั่วโมง (Hourly Delivery Leveling Plan)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ตารางควบคุมการป้อนงานให้สอดคล้องกับ Jig ฉีดโฟม ป้องกันปัญหาคอขวดและชิ้นงานไม่พอประกอบ (Heijunka Matrix)
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Mode switch: Plan vs Live Checklist */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('plan')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'plan'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              แผนผลิต (Heijunka Plan)
            </button>
            <button
              onClick={() => setViewMode('tracking')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'tracking'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              บันทึกการส่งมอบจริง (Live Tracking)
            </button>
          </div>

          <span
            className="text-xs bg-indigo-50 text-indigo-800 px-3.5 py-1.5 rounded-xl font-bold border border-indigo-100/80 shrink-0"
            id="badge-total-shift-pcs"
          >
            ยอดผลิตรวมทั้งกะ: {grandTotalShift.toLocaleString()} ชิ้น
          </span>
        </div>
      </div>

      {viewMode === 'tracking' && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>โหมดบันทึกการนำจ่ายกระเช้า:</strong> คลิกที่ช่องของแต่ละรุ่นเพื่อเช็คถูกเมื่อเจ้าหน้าที่นำจ่าย Innerbox เข้าไลน์ประกอบตามรอบ
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            (ข้อมูลบันทึกในเครื่องอัตโนมัติ)
          </span>
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-200">
        <table className="w-full text-center border-collapse text-xs">
          <thead>
            <tr className="bg-indigo-950 text-white">
              <th className="p-3 border border-indigo-900 text-left pl-4 sticky left-0 bg-indigo-950 z-20 min-w-[160px]">
                รุ่นสินค้า (Model Name)
              </th>
              <th className="p-3 border border-indigo-900 text-center min-w-[70px]">
                UPH
              </th>
              {Array.from({ length: shiftHours }, (_, i) => i + 1).map((hour) => (
                <th
                  key={hour}
                  className="p-2.5 border border-indigo-900 min-w-[95px] max-w-[120px]"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-white">ชั่วโมงที่ {hour}</span>
                    <span className="text-[10px] text-indigo-300 font-mono font-normal">
                      {getHourTimeInterval(hour)}
                    </span>
                    {viewMode === 'tracking' && (
                      <button
                        onClick={() => onMarkHourComplete(hour)}
                        className="mt-1 text-[9px] bg-emerald-500/80 hover:bg-emerald-400 text-white px-1.5 py-0.5 rounded font-medium transition"
                        title={`ติ๊กส่งครบทุกรุ่นในชั่วโมงที่ ${hour}`}
                      >
                        ✓ ส่งครบ ชม.นี้
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-3 border border-indigo-900 bg-indigo-900 font-extrabold min-w-[95px] text-amber-300">
                รวมกะ (Total)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {models.map((m, idx) => {
              const uph = Number(m.cycles) * Number(m.pcsPerCycle);
              const totalModelShift = uph * shiftHours;
              const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60';

              return (
                <tr key={m.id} className={`${rowBg} hover:bg-indigo-50/40 transition`}>
                  <td
                    className={`p-3 border border-slate-200 font-bold text-left text-slate-800 pl-4 sticky left-0 ${rowBg} z-10`}
                  >
                    <div className="flex items-center justify-between pr-2">
                      <span>{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({m.cycles} รอบ × {m.pcsPerCycle} ชิ้น)
                      </span>
                    </div>
                  </td>

                  <td className="p-3 border border-slate-200 font-bold text-indigo-700 bg-indigo-50/20 font-mono">
                    {uph}
                  </td>

                  {Array.from({ length: shiftHours }, (_, i) => i + 1).map((hour) => {
                    const isDelivered = hourlyLog[hour]?.[m.id]?.isDelivered;

                    if (viewMode === 'tracking') {
                      return (
                        <td
                          key={hour}
                          onClick={() => onToggleHourDelivery(hour, m.id)}
                          className={`p-2 border border-slate-200 cursor-pointer transition select-none ${
                            isDelivered
                              ? 'bg-emerald-100/70 text-emerald-900 font-bold'
                              : 'hover:bg-amber-50 text-slate-600'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <span className="font-mono">{uph} ชิ้น</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                                isDelivered
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {isDelivered ? (
                                <>
                                  <Check className="w-2.5 h-2.5" /> ส่งแล้ว
                                </>
                              ) : (
                                'รอส่ง'
                              )}
                            </span>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={hour}
                        className="p-3 border border-slate-200 text-slate-700 font-semibold font-mono"
                      >
                        {uph}
                      </td>
                    );
                  })}

                  <td className="p-3 border border-slate-200 font-extrabold bg-slate-100/90 text-slate-900 font-mono">
                    {totalModelShift.toLocaleString()}
                  </td>
                </tr>
              );
            })}

            {/* Total Hourly Summary Row */}
            <tr className="bg-indigo-50/90 font-bold text-indigo-950 border-t-2 border-indigo-200">
              <td className="p-3 border border-indigo-200 text-left pl-4 sticky left-0 bg-indigo-50 font-bold z-10">
                รวมความต้องการรายชั่วโมง (Total Request/Hr)
              </td>
              <td className="p-3 border border-indigo-200 text-indigo-700 font-extrabold font-mono">
                {models.reduce((sum, m) => sum + m.cycles * m.pcsPerCycle, 0)}
              </td>
              {Array.from({ length: shiftHours }, (_, i) => i + 1).map((hour) => (
                <td
                  key={hour}
                  className="p-3 border border-indigo-200 font-bold text-indigo-900 font-mono text-sm"
                >
                  {hourlySums[hour - 1]}
                </td>
              ))}
              <td className="p-3 border border-indigo-200 bg-indigo-100 text-indigo-950 font-black text-sm font-mono">
                {grandTotalShift.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
