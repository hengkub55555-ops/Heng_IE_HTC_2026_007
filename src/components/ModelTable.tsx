import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Copy, BarChart3, AlertCircle } from 'lucide-react';
import { ModelItem } from '../types';

interface ModelTableProps {
  models: ModelItem[];
  onUpdateModel: (id: string, field: 'cycles' | 'pcsPerCycle' | 'name', value: number | string) => void;
  onEditModel: (model: ModelItem) => void;
  onDeleteModel: (id: string, name: string) => void;
  onDuplicateModel: (model: ModelItem) => void;
  onOpenAddModal: () => void;
}

export const ModelTable: React.FC<ModelTableProps> = ({
  models,
  onUpdateModel,
  onEditModel,
  onDeleteModel,
  onDuplicateModel,
  onOpenAddModal
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden no-print">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </span>
            ตารางคำนวณ UPH จากรอบกระเช้าส่ง × ชิ้นงานต่อรอบกระเช้า
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            พิมพ์เพิ่มรอบกระเช้าส่งหรือชิ้นงานต่อรอบได้ทันที ระบบจะคำนวณ UPH ให้อัตโนมัติ (แก้ไขได้ทั้งหมด)
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหารุ่นสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <button
            onClick={onOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรุ่นสินค้า</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 text-xs uppercase font-bold border-b border-slate-200 tracking-wider">
              <th className="p-3.5 pl-5 w-16">ลำดับ</th>
              <th className="p-3.5 min-w-[180px]">ชื่อรุ่นสินค้า (MODEL NAME)</th>
              <th className="p-3.5 text-center min-w-[130px]">รอบกระเช้าส่ง (รอบ/ชม.)</th>
              <th className="p-3.5 text-center min-w-[130px]">ชิ้นงาน/รอบกระเช้า</th>
              <th className="p-3.5 text-center min-w-[140px]">UPH คำนวณ (ชิ้น/ชม.)</th>
              <th className="p-3.5 text-center min-w-[130px]">เวลาต่อรอบ (นาที)</th>
              <th className="p-3.5 text-center w-28">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-slate-100">
            {filteredModels.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <span>ไม่พบข้อมูลรุ่นสินค้าที่ตรงกับคำค้นหา "{searchTerm}"</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredModels.map((m, idx) => {
                const uph = Number(m.cycles) * Number(m.pcsPerCycle);
                const cycleTimeMins = Number(m.cycles) > 0 ? (60 / Number(m.cycles)).toFixed(1) : '-';
                const isHeavy = Number(m.cycles) >= 5;

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-indigo-50/30 transition border-b border-slate-100 group"
                  >
                    <td className="p-3.5 pl-5 font-bold text-slate-500">
                      #{idx + 1}
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          {m.name}
                          {isHeavy && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-medium">
                              รุ่นหลัก
                            </span>
                          )}
                        </span>
                        {m.notes && (
                          <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {m.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={m.cycles}
                        onChange={(e) =>
                          onUpdateModel(m.id, 'cycles', Math.max(0, Number(e.target.value) || 0))
                        }
                        className="w-24 text-center border border-slate-300 rounded-xl py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50/40 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                      />
                    </td>

                    <td className="p-3.5 text-center">
                      <input
                        type="number"
                        min="1"
                        value={m.pcsPerCycle}
                        onChange={(e) =>
                          onUpdateModel(m.id, 'pcsPerCycle', Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-24 text-center border border-slate-300 rounded-xl py-1.5 text-xs font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                      />
                    </td>

                    <td className="p-3.5 text-center font-extrabold text-indigo-950 text-sm">
                      <span className="bg-indigo-50/80 text-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-100/60 font-mono">
                        {uph} <span className="text-[10px] font-normal text-indigo-600">ชิ้น/ชม.</span>
                      </span>
                    </td>

                    <td className="p-3.5 text-center text-slate-600 font-semibold">
                      <span className="font-mono text-slate-800">{cycleTimeMins}</span> นาที
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditModel(m)}
                          className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition"
                          title="แก้ไขรายละเอียด"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateModel(m)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="ทำสำเนารุ่นนี้"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteModel(m.id, m.name)}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
