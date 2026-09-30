import React from 'react';
import { TrendingUp, Layers, ShoppingCart, Timer, Box, Flame } from 'lucide-react';

interface KPICardsProps {
  totalUph: number;
  totalModels: number;
  totalCycles: number;
  avgTaktTime: number;
  totalShiftPcs: number;
  foamJigCapacityUph: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  totalUph,
  totalModels,
  totalCycles,
  avgTaktTime,
  totalShiftPcs,
  foamJigCapacityUph
}) => {
  const isFoamBalanced = totalUph >= foamJigCapacityUph * 0.95;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 no-print">
      {/* Total UPH */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/90 flex items-center justify-between hover:border-indigo-300 transition group">
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">
            ยอดรวม UPH ทุกรุ่น (Total UPH)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight">
              {totalUph.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">ชิ้น/ชม.</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-medium block mt-0.5">
            อัตราความต้องการรวม
          </span>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xl group-hover:scale-110 transition shrink-0">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      {/* Total Models */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/90 flex items-center justify-between hover:border-emerald-300 transition group">
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">
            จำนวนรุ่นสินค้าในระบบ
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {totalModels}
            </span>
            <span className="text-xs text-slate-500 font-semibold">รุ่นสินค้า</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
            Active Innerbox Models
          </span>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xl group-hover:scale-110 transition shrink-0">
          <Layers className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* Total Cycles */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/90 flex items-center justify-between hover:border-amber-300 transition group">
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">
            รอบกระเช้าส่งรวม (Total Cycles)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {totalCycles.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-semibold">รอบ/ชม.</span>
          </div>
          <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
            เฉลี่ย {(60 / (totalCycles || 1)).toFixed(1)} นาที/เที่ยว
          </span>
        </div>
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl text-xl group-hover:scale-110 transition shrink-0">
          <ShoppingCart className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Average Takt Time */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/90 flex items-center justify-between hover:border-blue-300 transition group">
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Takt Time เฉลี่ย (Line Pace)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight font-mono">
              {avgTaktTime > 0 ? avgTaktTime.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">วินาที/ชิ้น</span>
          </div>
          <span className="text-[10px] text-blue-600 font-medium block mt-0.5">
            ความเร็วป้อนงานต่อตู้
          </span>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl text-xl group-hover:scale-110 transition shrink-0">
          <Timer className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Total Shift Target */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/90 flex items-center justify-between hover:border-purple-300 transition group">
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">
            ยอดแผนจัดส่งรวมทั้งกะ
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight">
              {totalShiftPcs.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">ชิ้น</span>
          </div>
          <span className="text-[10px] text-purple-700 font-medium flex items-center gap-1 mt-0.5">
            <Flame className="w-3 h-3 text-amber-500" />
            {isFoamBalanced ? 'ทันรอบ Jig ฉีดโฟม' : 'เสี่ยงชิ้นงานขาด'}
          </span>
        </div>
        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl text-xl group-hover:scale-110 transition shrink-0">
          <Box className="w-6 h-6 text-purple-600" />
        </div>
      </div>
    </div>
  );
};
