import React from 'react';
import { Settings2, CheckCircle2, Clock3 } from 'lucide-react';
import { ShiftSettings } from '../types';

interface ParameterSettingsProps {
  settings: ShiftSettings;
  onChange: (key: keyof ShiftSettings, value: number | string) => void;
  onApplyPreset: (hours: number) => void;
}

export const ParameterSettings: React.FC<ParameterSettingsProps> = ({
  settings,
  onChange,
  onApplyPreset
}) => {
  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 no-print">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              การตั้งค่าพารามิเตอร์การผลิต (Global Shift & Target Settings)
            </h2>
            <p className="text-[11px] text-slate-500">
              กำหนดระยะเวลากะการทำงาน รอบการวิ่งกระเช้า และเป้าหมายการผลิตรายชั่วโมง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl font-medium border border-emerald-200/60 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            บันทึกอัตโนมัติ (Browser Storage Active)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shift Hours with Quick Presets */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-slate-700">
              เวลาทำงานต่อกะ (ชม./กะ)
            </label>
            <div className="flex items-center gap-1">
              {[8, 10, 12].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => onApplyPreset(hrs)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition ${
                    settings.shiftHours === hrs
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`ตั้งค่ากะ ${hrs} ชั่วโมง`}
                >
                  {hrs}h
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            value={settings.shiftHours}
            min={1}
            max={24}
            className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-bold text-indigo-950 bg-indigo-50/20"
            onChange={(e) => onChange('shiftHours', Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
          />
          <span className="text-[10px] text-slate-400 block">
            กะมาตรฐานโรงงาน (เช่น 8 ชม. ปกติ, 10 ชม. รวม OT 2 ชม.)
          </span>
        </div>

        {/* Delivery Interval */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            รอบการจัดส่งมาตรฐาน (นาที/รอบ)
          </label>
          <input
            type="number"
            value={settings.deliveryInterval}
            min={10}
            max={240}
            className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-semibold text-slate-800"
            onChange={(e) => onChange('deliveryInterval', Math.max(5, Number(e.target.value) || 10))}
          />
          <span className="text-[10px] text-slate-400 block">
            ความถี่รอบรถขนส่งกระเช้า Innerbox (เช่น 60 นาที)
          </span>
        </div>

        {/* Default Pcs per Cycle */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            ชิ้นงาน/รอบกระเช้ามาตรฐาน
          </label>
          <input
            type="number"
            value={settings.defaultPcsCycle}
            min={1}
            max={100}
            className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-semibold text-slate-800"
            onChange={(e) => onChange('defaultPcsCycle', Math.max(1, Number(e.target.value) || 1))}
          />
          <span className="text-[10px] text-slate-400 block">
            ความจุบรรจุกล่องหรือกระเช้าจัดส่งมาตรฐาน (Pcs/Basket)
          </span>
        </div>

        {/* Target UPH */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-slate-700">
              UPH เป้าหมายรวม (Target UPH)
            </label>
            <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
              <Clock3 className="w-3 h-3" /> เริ่มกะ: {settings.shiftStartTime}
            </span>
          </div>
          <input
            type="number"
            value={settings.targetUph}
            className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2 text-sm font-extrabold text-indigo-950 outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => onChange('targetUph', Number(e.target.value) || 0)}
          />
          <span className="text-[10px] text-slate-400 block">
            เป้าหมายกำลังการผลิตรวมทุกรุ่นต่อชั่วโมง
          </span>
        </div>
      </div>
    </section>
  );
};
