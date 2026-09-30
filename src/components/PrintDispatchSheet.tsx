import React from 'react';
import { ModelItem, ShiftSettings } from '../types';

interface PrintDispatchSheetProps {
  models: ModelItem[];
  settings: ShiftSettings;
  totalUph: number;
}

export const PrintDispatchSheet: React.FC<PrintDispatchSheetProps> = ({
  models,
  settings,
  totalUph
}) => {
  const shiftHours = settings.shiftHours || 10;
  const grandTotal = totalUph * shiftHours;

  return (
    <div className="hidden print:block p-6 text-black bg-white">
      <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            ใบกำกับการจัดส่ง INNERBOX ประจำกะ (DAILY HEIJUNKA DISPATCH SHEET)
          </h1>
          <p className="text-xs text-slate-700">
            ระบบควบคุมรอบการจัดส่งชิ้นงาน & แก้ปัญหา Jig ฉีดโฟมไม่ทันรอบผลิต (IE Professional Control)
          </p>
        </div>
        <div className="text-right text-xs">
          <p><strong>วันที่:</strong> {new Date().toLocaleDateString('th-TH')}</p>
          <p><strong>เวลาเริ่มกะ:</strong> {settings.shiftStartTime} ({shiftHours} ชม.)</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 text-xs mb-4 p-3 border border-black rounded-lg">
        <div><strong>เป้าหมาย UPH รวม:</strong> {totalUph} ชิ้น/ชม.</div>
        <div><strong>จำนวนรุ่นสินค้า:</strong> {models.length} รุ่น</div>
        <div><strong>รอบส่งมาตรฐาน:</strong> ทุก {settings.deliveryInterval} นาที</div>
        <div><strong>ยอดรวมทั้งกะ:</strong> {grandTotal.toLocaleString()} ชิ้น</div>
      </div>

      <table className="w-full text-center border-collapse border border-black text-xs mb-6">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-black p-2 text-left">รุ่นสินค้า (Model)</th>
            <th className="border border-black p-2">รอบ/ชม.</th>
            <th className="border border-black p-2">ชิ้น/รอบ</th>
            <th className="border border-black p-2">UPH</th>
            {Array.from({ length: shiftHours }, (_, i) => i + 1).map((h) => (
              <th key={h} className="border border-black p-1">H{h}</th>
            ))}
            <th className="border border-black p-2">รวมกะ</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => {
            const uph = m.cycles * m.pcsPerCycle;
            return (
              <tr key={m.id}>
                <td className="border border-black p-2 text-left font-bold">{m.name}</td>
                <td className="border border-black p-2">{m.cycles}</td>
                <td className="border border-black p-2">{m.pcsPerCycle}</td>
                <td className="border border-black p-2 font-bold">{uph}</td>
                {Array.from({ length: shiftHours }, (_, i) => i + 1).map((h) => (
                  <td key={h} className="border border-black p-1">{uph}</td>
                ))}
                <td className="border border-black p-2 font-bold">{uph * shiftHours}</td>
              </tr>
            );
          })}
          <tr className="font-bold bg-slate-100">
            <td colSpan={3} className="border border-black p-2 text-left">รวมความต้องการรายชั่วโมง</td>
            <td className="border border-black p-2">{totalUph}</td>
            {Array.from({ length: shiftHours }, (_, i) => i + 1).map((h) => (
              <td key={h} className="border border-black p-1">{totalUph}</td>
            ))}
            <td className="border border-black p-2">{grandTotal.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-6 text-xs text-center pt-8 border-t border-black">
        <div>
          <div className="border-b border-black w-40 mx-auto mb-2 h-10"></div>
          <p>ผู้ควบคุมรอบส่ง (Material Handler)</p>
        </div>
        <div>
          <div className="border-b border-black w-40 mx-auto mb-2 h-10"></div>
          <p>หัวหน้าสถานี Jig ฉีดโฟม (Foam Station Leader)</p>
        </div>
        <div>
          <div className="border-b border-black w-40 mx-auto mb-2 h-10"></div>
          <p>วิศวกร IE ควบคุมสายการผลิต (IE Engineer)</p>
        </div>
      </div>
    </div>
  );
};
