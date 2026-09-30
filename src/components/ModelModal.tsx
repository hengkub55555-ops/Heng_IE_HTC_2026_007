import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Edit3, Calculator } from 'lucide-react';
import { ModelItem } from '../types';

interface ModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (model: { id?: string; name: string; cycles: number; pcsPerCycle: number; notes?: string }) => void;
  initialModel?: ModelItem | null;
  defaultPcs: number;
}

export const ModelModal: React.FC<ModelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialModel,
  defaultPcs
}) => {
  const [name, setName] = useState<string>('');
  const [cycles, setCycles] = useState<number>(4);
  const [pcsPerCycle, setPcsPerCycle] = useState<number>(defaultPcs || 5);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialModel) {
      setName(initialModel.name);
      setCycles(initialModel.cycles);
      setPcsPerCycle(initialModel.pcsPerCycle);
      setNotes(initialModel.notes || '');
    } else {
      setName('');
      setCycles(4);
      setPcsPerCycle(defaultPcs || 5);
      setNotes('');
    }
    setError('');
  }, [initialModel, isOpen, defaultPcs]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อรุ่นสินค้า (Model Name)');
      return;
    }
    if (cycles <= 0) {
      setError('รอบกระเช้าส่งต้องมากกว่า 0');
      return;
    }
    if (pcsPerCycle <= 0) {
      setError('ชิ้นงานต่อรอบกระเช้าต้องมากกว่า 0');
      return;
    }

    onSave({
      id: initialModel?.id,
      name: name.trim(),
      cycles: Number(cycles),
      pcsPerCycle: Number(pcsPerCycle),
      notes: notes.trim()
    });
    onClose();
  };

  const previewUph = Number(cycles) * Number(pcsPerCycle);
  const previewCycleTime = cycles > 0 ? (60 / Number(cycles)).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              {initialModel ? <Edit3 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {initialModel ? 'แก้ไขข้อมูลรุ่นสินค้า' : 'เพิ่มรุ่นสินค้าใหม่ในระบบ'}
              </h3>
              <p className="text-xs text-slate-400">
                กำหนดจำนวนกระเช้าและชิ้นงานต่อกระเช้าสำหรับรอบผลิต
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อรุ่นสินค้า (Model Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น 150, FUF-18, TM12"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-semibold text-slate-800"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รอบกระเช้าส่ง (รอบ/ชม.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={cycles}
                onChange={(e) => setCycles(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900 bg-indigo-50/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชิ้นงานต่อกระเช้า <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={pcsPerCycle}
                onChange={(e) => setPcsPerCycle(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / ไลน์ผลิต / สถานี Jig ฉีดโฟม
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น Jig #1, ไลน์ประกอบหลัก, ตู้ 2 ประตู"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
            />
          </div>

          {/* Real-time IE Calculation Preview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-1">
            <div className="text-slate-500 font-medium flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              ผลการคำนวณอัตโนมัติ:
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-600">UPH คำนวณ:</span>
              <span className="font-extrabold text-indigo-900 text-sm">{previewUph} ชิ้น/ชม.</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">ความถี่รอบส่ง (Delivery Interval):</span>
              <span className="font-bold text-slate-800">ทุก {previewCycleTime} นาที</span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition active:scale-95"
            >
              {initialModel ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
