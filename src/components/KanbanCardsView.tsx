import React from 'react';
import { Printer, Tag, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { ModelItem, ShiftSettings } from '../types';

interface KanbanCardsViewProps {
  models: ModelItem[];
  settings: ShiftSettings;
  onPrint: () => void;
}

export const KanbanCardsView: React.FC<KanbanCardsViewProps> = ({
  models,
  settings,
  onPrint
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top action header (no-print) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              บัตรนำจ่ายกระเช้ามาตรฐาน (Innerbox Delivery Kanban Cards)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            พิมพ์บัตรสำหรับติดบนกระเช้าหรือรถลากขนส่ง เพื่อควบคุมรอบการป้อนงานเข้า Jig ฉีดโฟม
          </p>
        </div>

        <button
          onClick={onPrint}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>สั่งพิมพ์บัตร Kanban (Print Cards)</span>
        </button>
      </div>

      {/* Grid of Kanban Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((m, idx) => {
          const uph = m.cycles * m.pcsPerCycle;
          const intervalMins = m.cycles > 0 ? (60 / m.cycles).toFixed(1) : '-';

          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl border-2 border-slate-800 shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:border-black"
            >
              {/* Card Header */}
              <div className="bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center print:bg-black">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-wider">KANBAN TICKET</span>
                  <span className="text-[10px] bg-indigo-600 px-1.5 py-0.2 rounded font-mono">
                    #{idx + 1}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-300">
                  IE-INNERBOX-CTRL
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        MODEL NAME / รุ่นสินค้า
                      </span>
                      <h3 className="text-2xl font-black text-indigo-950 tracking-tight">
                        {m.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        PCS/BASKET
                      </span>
                      <span className="text-xl font-extrabold text-emerald-700 font-mono">
                        {m.pcsPerCycle} ชิ้น
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">รอบส่งต่อชั่วโมง</span>
                      <span className="font-extrabold text-indigo-900 font-mono text-sm">
                        {m.cycles} รอบ/ชม.
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">ความถี่ส่งมอบ</span>
                      <span className="font-extrabold text-slate-800 font-mono text-sm">
                        ทุก {intervalMins} นาที
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-indigo-700 block font-semibold">
                        สถานีปลายทาง (Destination)
                      </span>
                      <span className="font-bold text-indigo-950">
                        {m.notes || 'สถานี Jig ฉีดโฟม (Infeed Station)'}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>

                {/* Footer Barcode Simulation */}
                <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                  <div className="flex items-center gap-1 font-mono">
                    <QrCode className="w-5 h-5 text-slate-700" />
                    <span>ID: {m.id.toUpperCase()}-UPH{uph}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>QC PASS & LEVELING</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
