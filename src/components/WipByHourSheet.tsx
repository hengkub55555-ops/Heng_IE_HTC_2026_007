import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, Search, Download, RotateCcw, AlertTriangle, 
  CheckCircle2, AlertOctagon, TrendingDown, Layers, Edit3, 
  Info, Sparkles, Check, X, ShieldAlert, ArrowRight, CornerDownRight
} from 'lucide-react';
import { ModelItem, ShiftSettings, WipState, ModelWipData } from '../types';
import { exportWipToCSV } from '../utils/exportUtils';

interface WipByHourSheetProps {
  models: ModelItem[];
  settings: ShiftSettings;
  wipState: WipState;
  onUpdateWipState: (updater: (prev: WipState) => WipState) => void;
  onResetWip: () => void;
}

interface EditingCell {
  modelId: string;
  hour: number;
  modelName: string;
  currentInflow: number;
  currentOutflow: number;
  currentEndingWip: number;
  manualEndingWip?: number;
  notes?: string;
}

export const WipByHourSheet: React.FC<WipByHourSheetProps> = ({
  models,
  settings,
  wipState,
  onUpdateWipState,
  onResetWip
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'detailed'>('matrix');
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');

  const shiftHours = settings.shiftHours || 10;

  // Format shift hour interval (e.g., 08:00 - 09:00)
  const getHourTimeInterval = (hourIndex: number) => {
    const [startH, startM] = (settings.shiftStartTime || '08:00').split(':').map(Number);
    const startHour = (startH + hourIndex - 1) % 24;
    const endHour = (startH + hourIndex) % 24;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(startHour)}:${pad(startM || 0)} - ${pad(endHour)}:${pad(startM || 0)}`;
  };

  // Compute full WIP simulation for every model
  const { computedWip, modelHourlyDetails, totalWipByHour, criticalCount, outOfStockCount } = useMemo(() => {
    const compWip: Record<string, number[]> = {};
    const details: Record<string, { in: number; out: number; end: number; isManual: boolean; notes?: string }[]> = {};
    const hourTotals = new Array(shiftHours).fill(0);
    let crit = 0;
    let outStock = 0;

    models.forEach((m) => {
      const defaultUph = Number(m.cycles) * Number(m.pcsPerCycle);
      const mData: ModelWipData = wipState[m.id] || {
        initialWip: defaultUph > 0 ? Math.round(defaultUph * 0.5) : 15,
        minSafeWip: 5,
        hours: {}
      };

      const initial = mData.initialWip ?? 15;
      const minSafe = mData.minSafeWip ?? 5;
      let prevBal = initial;
      const balances: number[] = [];
      const hourDetailList = [];

      let hasCritical = false;
      let hasOutOfStock = false;

      for (let h = 1; h <= shiftHours; h++) {
        const hData = mData.hours?.[h];
        // Default Inflow = planned UPH
        const inflow = hData?.inflow !== undefined ? hData.inflow : defaultUph;
        // Default Outflow = planned UPH
        const outflow = hData?.outflow !== undefined ? hData.outflow : defaultUph;

        let ending: number;
        let isManual = false;

        if (hData?.manualEndingWip !== undefined && hData.manualEndingWip !== null) {
          ending = Number(hData.manualEndingWip);
          isManual = true;
        } else {
          ending = prevBal + inflow - outflow;
        }

        balances.push(ending);
        hourTotals[h - 1] += ending;
        hourDetailList.push({
          in: inflow,
          out: outflow,
          end: ending,
          isManual,
          notes: hData?.notes
        });

        if (ending <= 0) {
          hasOutOfStock = true;
        } else if (ending <= minSafe) {
          hasCritical = true;
        }

        prevBal = ending;
      }

      if (hasOutOfStock) outStock++;
      else if (hasCritical) crit++;

      compWip[m.id] = balances;
      details[m.id] = hourDetailList;
    });

    return {
      computedWip: compWip,
      modelHourlyDetails: details,
      totalWipByHour: hourTotals,
      criticalCount: crit,
      outOfStockCount: outStock
    };
  }, [models, wipState, shiftHours]);

  // Update initial WIP or minSafeWip
  const handleUpdateModelParam = (modelId: string, field: 'initialWip' | 'minSafeWip', value: number) => {
    onUpdateWipState((prev) => {
      const current = prev[modelId] || {
        initialWip: 15,
        minSafeWip: 5,
        hours: {}
      };
      return {
        ...prev,
        [modelId]: {
          ...current,
          [field]: Math.max(0, value)
        }
      };
    });
  };

  // Open inline cell editor
  const handleCellClick = (model: ModelItem, hour: number) => {
    const defaultUph = Number(model.cycles) * Number(model.pcsPerCycle);
    const mData = wipState[model.id];
    const hData = mData?.hours?.[hour];
    const computedEnd = computedWip[model.id]?.[hour - 1] ?? 0;

    setEditingCell({
      modelId: model.id,
      hour,
      modelName: model.name,
      currentInflow: hData?.inflow !== undefined ? hData.inflow : defaultUph,
      currentOutflow: hData?.outflow !== undefined ? hData.outflow : defaultUph,
      currentEndingWip: computedEnd,
      manualEndingWip: hData?.manualEndingWip,
      notes: hData?.notes || ''
    });
  };

  // Save cell edit
  const handleSaveCellEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;

    const { modelId, hour, currentInflow, currentOutflow, manualEndingWip, notes } = editingCell;

    onUpdateWipState((prev) => {
      const mData = prev[modelId] || {
        initialWip: 15,
        minSafeWip: 5,
        hours: {}
      };

      const updatedHours = {
        ...mData.hours,
        [hour]: {
          inflow: Number(currentInflow),
          outflow: Number(currentOutflow),
          manualEndingWip: manualEndingWip !== undefined && !isNaN(manualEndingWip) ? Number(manualEndingWip) : undefined,
          notes: notes?.trim() || undefined
        }
      };

      return {
        ...prev,
        [modelId]: {
          ...mData,
          hours: updatedHours
        }
      };
    });

    setEditingCell(null);
  };

  // Auto-fill inflow from delivery plan
  const handleAutoSyncInflow = () => {
    if (window.confirm('ต้องการซิงค์ยอดรับเข้า (Inflow) ทุกชั่วโมงตามรอบแผนการจัดส่งกระเช้าใช่หรือไม่?')) {
      onUpdateWipState((prev) => {
        const nextState = { ...prev };
        models.forEach((m) => {
          const plannedUph = m.cycles * m.pcsPerCycle;
          const current = nextState[m.id] || { initialWip: Math.round(plannedUph * 0.5), minSafeWip: 5, hours: {} };
          const newHours = { ...current.hours };
          for (let h = 1; h <= shiftHours; h++) {
            newHours[h] = {
              ...(newHours[h] || {}),
              inflow: plannedUph,
              outflow: plannedUph
            };
          }
          nextState[m.id] = { ...current, hours: newHours };
        });
        return nextState;
      });
    }
  };

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeInspectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner and Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-indigo-800/40">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-xl text-xs font-bold">
              <ClipboardList className="w-4 h-4 text-amber-400" />
              ระบบควบคุมยอดคงเหลือหน้าไลน์ (Hourly WIP Balance & Line Stock Control)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ตรวจนับและติดตามยอดคงเหลือ WIP รายชั่วโมง (WIP By Hour)
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              ช่วยตรวจสอบจำนวนชิ้นงาน Innerbox ที่เหลืออยู่จริงหน้าไลน์และสถานี Jig ฉีดโฟมในแต่ละชั่วโมง สามารถพิมพ์แก้ไขสต็อกยกมา ปรับยอดรับ-จ่าย หรือป้อนยอดนับจริง (Physical Count) ได้ทันที
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
            <button
              onClick={() => exportWipToCSV(models, settings, wipState, computedWip)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
              title="ส่งออกรายงานยอดคงเหลือ WIP เป็นไฟล์ Excel CSV ภาษาไทย"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก WIP (CSV)</span>
            </button>
            <button
              onClick={handleAutoSyncInflow}
              className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
              title="คำนวณรับเข้าและใช้ไปตามรอบส่งของแต่ละชั่วโมงอัตโนมัติ"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ซิงค์แผนส่งเข้า WIP</span>
            </button>
            <button
              onClick={onResetWip}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition border border-slate-700 flex items-center gap-1.5"
              title="รีเซ็ตยอดตรวจนับทั้งหมดเป็นค่าเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ต</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Current WIP Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              ยอดคงเหลือ WIP รวมปลายกะ
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-950 font-mono">
                {(totalWipByHour[shiftHours - 1] ?? 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-semibold">ชิ้น</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              ยอดรวมทุกรุ่น ณ ชั่วโมงที่ {shiftHours}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl text-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              รุ่นที่ชิ้นงานขาด (WIP = 0 ชิ้น)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${outOfStockCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                {outOfStockCount}
              </span>
              <span className="text-xs text-slate-500 font-semibold">รุ่นสินค้า</span>
            </div>
            <span className="text-[10px] text-rose-600 font-medium mt-0.5 block">
              {outOfStockCount > 0 ? '⚠️ เสี่ยง Jig ฉีดโฟมหยุดเดินเครื่อง!' : '✓ ไม่มีรุ่นที่ของขาด'}
            </span>
          </div>
          <div className={`p-3 rounded-2xl text-xl ${outOfStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              รุ่นที่อยู่ระดับเตือนภัย (ต่ำกว่า Min)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${criticalCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {criticalCount}
              </span>
              <span className="text-xs text-slate-500 font-semibold">รุ่นสินค้า</span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
              {criticalCount > 0 ? 'ควรเร่งรอบส่งกระเช้าเสริม' : '✓ ระดับสต็อกปลอดภัย'}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl text-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              สถานะความพร้อม Jig ฉีดโฟม
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-lg sm:text-xl font-bold ${outOfStockCount === 0 && criticalCount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {outOfStockCount === 0 && criticalCount === 0 ? 'พร้อมผลิตต่อเนื่อง' : 'ต้องเฝ้าระวังรอบส่ง'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              ตรวจสอบรอบกระเช้าทุก 60 นาที
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden no-print">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/60">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <ClipboardList className="w-4 h-4" />
              </span>
              ตารางยอดคงเหลือ WIP รายชั่วโมง แยกตามรุ่นสินค้า (Hourly WIP Balance Matrix)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกที่ช่องเวลาเพื่อแก้ไขยอดตรวจนับจริง หรือพิมพ์ปรับสต็อกยกมา (Initial WIP) และจุดเตือนขั้นต่ำ (Min Safe) ได้ทันที
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === 'matrix' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ตารางยอดคงเหลือ (Matrix)
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === 'detailed' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                แจกแจง รับ-จ่าย-คงเหลือ (Detailed)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหารุ่นสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center flex-wrap gap-4 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-700">สัญลักษณ์สถานะสต็อก:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span>ของหมด (WIP ≤ 0 ชิ้น)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span>เสี่ยงขาด (WIP ≤ Min Safe)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>ระดับปกติ ปลอดภัย</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block"></span>
            <span>สต็อกสะสมหนาแน่น</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400 ml-auto">
            <Edit3 className="w-3 h-3" /> คลิกที่ตัวเลขเพื่อแก้ไข
          </span>
        </div>

        {/* Mode 1: Compact Matrix Table */}
        {viewMode === 'matrix' && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-indigo-950 text-white">
                  <th className="p-3 border border-indigo-900 text-left pl-4 sticky left-0 bg-indigo-950 z-20 min-w-[170px]">
                    รุ่นสินค้า (MODEL NAME)
                  </th>
                  <th className="p-2.5 border border-indigo-900 min-w-[95px] bg-indigo-900">
                    <div className="flex flex-col items-center">
                      <span>สต็อกยกมา</span>
                      <span className="text-[10px] text-indigo-300 font-normal">Initial WIP</span>
                    </div>
                  </th>
                  <th className="p-2.5 border border-indigo-900 min-w-[85px] bg-indigo-900">
                    <div className="flex flex-col items-center">
                      <span>จุดเตือนต่ำสุด</span>
                      <span className="text-[10px] text-amber-300 font-normal">Min Safe</span>
                    </div>
                  </th>
                  {Array.from({ length: shiftHours }, (_, i) => i + 1).map((h) => (
                    <th key={h} className="p-2.5 border border-indigo-900 min-w-[105px]">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">ชม.ที่ {h}</span>
                        <span className="text-[10px] text-indigo-300 font-mono font-normal">
                          {getHourTimeInterval(h)}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 border border-indigo-900 bg-indigo-900 font-extrabold min-w-[100px] text-amber-300">
                    คงเหลือสิ้นกะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModels.map((m, idx) => {
                  const mData = wipState[m.id] || { initialWip: 15, minSafeWip: 5, hours: {} };
                  const initial = mData.initialWip ?? 15;
                  const minSafe = mData.minSafeWip ?? 5;
                  const balances = computedWip[m.id] || [];
                  const lastBalance = balances[shiftHours - 1] ?? initial;
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

                  return (
                    <tr key={m.id} className={`${rowBg} hover:bg-indigo-50/30 transition`}>
                      {/* Model Name */}
                      <td className={`p-3 border border-slate-200 font-bold text-left text-slate-800 pl-4 sticky left-0 ${rowBg} z-10`}>
                        <div className="flex items-center justify-between pr-2">
                          <span className="text-sm font-bold text-indigo-950">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {m.cycles}r × {m.pcsPerCycle}p
                          </span>
                        </div>
                      </td>

                      {/* Editable Initial WIP */}
                      <td className="p-2 border border-slate-200 bg-slate-50/80">
                        <input
                          type="number"
                          min="0"
                          value={initial}
                          onChange={(e) => handleUpdateModelParam(m.id, 'initialWip', Number(e.target.value) || 0)}
                          className="w-16 text-center py-1 border border-slate-300 rounded-lg text-xs font-bold text-indigo-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          title="แก้ไขสต็อกยกมาต้นกะของรุ่นนี้"
                        />
                      </td>

                      {/* Editable Min Safe WIP */}
                      <td className="p-2 border border-slate-200 bg-amber-50/30">
                        <input
                          type="number"
                          min="1"
                          value={minSafe}
                          onChange={(e) => handleUpdateModelParam(m.id, 'minSafeWip', Number(e.target.value) || 1)}
                          className="w-14 text-center py-1 border border-amber-300 rounded-lg text-xs font-bold text-amber-900 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                          title="จุดเตือนสต็อกต่ำสุด (หากต่ำกว่านี้จะแสดงสีส้ม)"
                        />
                      </td>

                      {/* Hourly Balances */}
                      {Array.from({ length: shiftHours }, (_, i) => i + 1).map((h) => {
                        const bal = balances[h - 1] ?? initial;
                        const isManual = wipState[m.id]?.hours?.[h]?.manualEndingWip !== undefined;
                        const note = wipState[m.id]?.hours?.[h]?.notes;

                        // Health status
                        let statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                        let badgeColor = 'bg-emerald-500 text-white';

                        if (bal <= 0) {
                          statusColor = 'bg-rose-100/90 text-rose-900 border-rose-300 font-black animate-pulse';
                          badgeColor = 'bg-rose-600 text-white';
                        } else if (bal <= minSafe) {
                          statusColor = 'bg-amber-100/80 text-amber-900 border-amber-300 font-bold';
                          badgeColor = 'bg-amber-500 text-white';
                        } else if (bal > minSafe * 3) {
                          statusColor = 'bg-indigo-50 text-indigo-900 border-indigo-200';
                          badgeColor = 'bg-indigo-500 text-white';
                        }

                        return (
                          <td
                            key={h}
                            onClick={() => handleCellClick(m, h)}
                            className={`p-2 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:ring-inset transition select-none ${statusColor}`}
                            title={`คลิกเพื่อแก้ไขยอดตรวจนับหรือ In/Out ชม.ที่ ${h}`}
                          >
                            <div className="flex flex-col items-center justify-center gap-0.5">
                              <span className="font-extrabold text-sm font-mono tracking-tight">
                                {bal}
                              </span>
                              <div className="flex items-center gap-1">
                                {isManual && (
                                  <span className="text-[9px] bg-indigo-700 text-white px-1 py-0.2 rounded font-semibold">
                                    นับจริง
                                  </span>
                                )}
                                {note && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title={note}></span>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}

                      {/* Ending Shift Balance */}
                      <td className="p-3 border border-slate-200 font-extrabold bg-slate-100 text-indigo-950 font-mono text-sm">
                        {lastBalance} ชิ้น
                      </td>
                    </tr>
                  );
                })}

                {/* Total Summary Row */}
                <tr className="bg-indigo-50/90 font-bold text-indigo-950 border-t-2 border-indigo-200">
                  <td className="p-3 border border-indigo-200 text-left pl-4 sticky left-0 bg-indigo-50 font-extrabold z-10">
                    ยอดรวม WIP ทุกรุ่น (Total Shift WIP)
                  </td>
                  <td className="p-3 border border-indigo-200 font-mono text-indigo-900">
                    {models.reduce((sum, m) => sum + (wipState[m.id]?.initialWip ?? 15), 0)}
                  </td>
                  <td className="p-3 border border-indigo-200 font-mono text-amber-800">
                    {models.reduce((sum, m) => sum + (wipState[m.id]?.minSafeWip ?? 5), 0)}
                  </td>
                  {Array.from({ length: shiftHours }, (_, i) => i + 1).map((h) => (
                    <td key={h} className="p-3 border border-indigo-200 font-extrabold text-indigo-950 font-mono text-sm">
                      {totalWipByHour[h - 1] ?? 0}
                    </td>
                  ))}
                  <td className="p-3 border border-indigo-200 bg-indigo-100 font-black text-indigo-950 font-mono text-sm">
                    {totalWipByHour[shiftHours - 1] ?? 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Mode 2: Detailed Inflow / Outflow Breakdown for Inspected Model */}
        {viewMode === 'detailed' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">เลือกรุ่นสินค้าเพื่อดูรายละเอียด:</span>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="bg-white border border-slate-300 text-indigo-950 font-bold rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (UPH {m.cycles * m.pcsPerCycle} ชิ้น)
                    </option>
                  ))}
                </select>
              </div>

              {activeInspectedModel && (
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span>
                    สต็อกยกมา: <strong className="text-indigo-950">{wipState[activeInspectedModel.id]?.initialWip ?? 15}</strong> ชิ้น
                  </span>
                  <span>
                    จุดเตือนต่ำสุด: <strong className="text-amber-700">{wipState[activeInspectedModel.id]?.minSafeWip ?? 5}</strong> ชิ้น
                  </span>
                </div>
              )}
            </div>

            {activeInspectedModel && (
              <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3 text-left pl-4">ชั่วโมง (Hour)</th>
                      <th className="p-3">ช่วงเวลา</th>
                      <th className="p-3 text-emerald-700">รับเข้าจากกระเช้า (+In)</th>
                      <th className="p-3 text-rose-700">ใช้เข้า Jig ฉีดโฟม (-Out)</th>
                      <th className="p-3 text-indigo-950 bg-indigo-50/60 font-black">
                        ยอดคงเหลือปลาย ชม. (Ending WIP)
                      </th>
                      <th className="p-3">ประเภทข้อมูล</th>
                      <th className="p-3 text-left">หมายเหตุ</th>
                      <th className="p-3">แก้ไข</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.from({ length: shiftHours }, (_, i) => i + 1).map((h) => {
                      const detail = modelHourlyDetails[activeInspectedModel.id]?.[h - 1] || { in: 0, out: 0, end: 0, isManual: false };
                      const minSafe = wipState[activeInspectedModel.id]?.minSafeWip ?? 5;

                      let statusBadge = (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                          ปกติ
                        </span>
                      );
                      if (detail.end <= 0) {
                        statusBadge = (
                          <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                            ของหมด!
                          </span>
                        );
                      } else if (detail.end <= minSafe) {
                        statusBadge = (
                          <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">
                            เสี่ยงขาด
                          </span>
                        );
                      }

                      return (
                        <tr key={h} className="hover:bg-slate-50 transition">
                          <td className="p-3 text-left pl-4 font-bold text-slate-800">
                            ชั่วโมงที่ {h}
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            {getHourTimeInterval(h)}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700">
                            +{detail.in} ชิ้น
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-600">
                            -{detail.out} ชิ้น
                          </td>
                          <td className="p-3 font-mono font-black text-indigo-950 text-sm bg-indigo-50/40">
                            <div className="flex items-center justify-center gap-2">
                              <span>{detail.end} ชิ้น</span>
                              {statusBadge}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${detail.isManual ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                              {detail.isManual ? 'ตรวจนับจริง (Override)' : 'คำนวณตามแผน'}
                            </span>
                          </td>
                          <td className="p-3 text-left text-slate-500">
                            {detail.notes || '-'}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleCellClick(activeInspectedModel, h)}
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold text-[11px] transition"
                            >
                              แก้ไข
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Inline Cell Editing Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    บันทึกตรวจนับ WIP: {editingCell.modelName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ชั่วโมงที่ {editingCell.hour} ({getHourTimeInterval(editingCell.hour)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCellEdit} className="space-y-4">
              {/* Option A: Direct Physical Count Override */}
              <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-indigo-950">
                    ยอดตรวจนับจริงหน้าไลน์ (Physical Count Override)
                  </label>
                  <span className="text-[10px] text-indigo-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                    แนะนำ
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="พิมพ์จำนวนชิ้นที่นับได้จริงหน้างาน..."
                  value={editingCell.manualEndingWip !== undefined ? editingCell.manualEndingWip : ''}
                  onChange={(e) =>
                    setEditingCell({
                      ...editingCell,
                      manualEndingWip: e.target.value === '' ? undefined : Number(e.target.value)
                    })
                  }
                  className="w-full border border-indigo-200 rounded-xl px-3.5 py-2 text-sm font-bold text-indigo-950 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
                <span className="text-[10px] text-slate-500 block">
                  หากกรอกช่องนี้ ระบบจะใช้ยอดนี้เป็นยอดคงเหลือปลายชั่วโมงทันที (ไม่ต้องคำนวณ In/Out)
                </span>
              </div>

              {/* Option B: Inflow & Outflow adjustment */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-emerald-800 mb-1">
                    รับเข้าจากกระเช้า (+In)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingCell.currentInflow}
                    onChange={(e) =>
                      setEditingCell({
                        ...editingCell,
                        currentInflow: Math.max(0, Number(e.target.value) || 0)
                      })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-rose-800 mb-1">
                    ใช้เข้า Jig ฉีดโฟม (-Out)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingCell.currentOutflow}
                    onChange={(e) =>
                      setEditingCell({
                        ...editingCell,
                        currentOutflow: Math.max(0, Number(e.target.value) || 0)
                      })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-rose-800 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมายเหตุหน้างาน (เช่น กระเช้ามาช้า, Jig ฉีดโฟมค้าง)
                </label>
                <input
                  type="text"
                  placeholder="เช่น Jig #1 รอของ, สต็อกบวมเกินหน้าไลน์"
                  value={editingCell.notes || ''}
                  onChange={(e) => setEditingCell({ ...editingCell, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                {editingCell.manualEndingWip !== undefined && (
                  <button
                    type="button"
                    onClick={() => setEditingCell({ ...editingCell, manualEndingWip: undefined })}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    ล้างยอดนับจริง (กลับไปใช้สูตร In/Out)
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>บันทึกยอด</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
