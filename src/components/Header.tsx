import React, { useState, useEffect } from 'react';
import { Package, Clock, ShieldCheck, Factory, FileSpreadsheet, Kanban, Activity, Printer, ClipboardList } from 'lucide-react';
import { AppTab } from '../types';

interface HeaderProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onPrint }) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          weekday: 'short'
        }) + ' ' + now.toLocaleTimeString('th-TH')
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-indigo-950 text-white shadow-xl sticky top-0 z-40 border-b border-indigo-900/60 no-print">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          {/* Logo & System Titles */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2.5 rounded-2xl shadow-md border border-indigo-400/30 text-2xl flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Innerbox Hourly Request & Delivery Control
                </h1>
                <span className="text-xs bg-emerald-500/90 text-white px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  IE Professional
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                  <Factory className="w-3 h-3" />
                  Line Balancing & Heijunka
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5 font-normal">
                ระบบควบคุมรอบการจัดส่งชิ้นงาน & แก้ปัญหา Jig ฉีดโฟมไม่ทันรอบผลิต (Just-In-Time Pull System)
              </p>
            </div>
          </div>

          {/* Right Header: Clock & User Info */}
          <div className="flex items-center flex-wrap gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[11px] text-indigo-300 font-medium">วิศวกรผู้ควบคุมระบบ</span>
              <span className="text-xs font-semibold text-white tracking-wide">IE Production Control Engineering</span>
            </div>

            <div className="bg-indigo-900/90 px-3.5 py-2 rounded-xl border border-indigo-700/80 text-xs text-indigo-100 font-mono shadow-inner flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{timeString || '--/--/---- --:--:--'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-t border-indigo-900/80 mt-3 pt-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setCurrentTab('plan')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'plan'
                  ? 'bg-white text-indigo-950 shadow-md font-bold'
                  : 'text-indigo-200 hover:bg-indigo-900/60 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              แผนงาน & การคำนวณ UPH
            </button>
            <button
              onClick={() => setCurrentTab('wip')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap relative ${
                currentTab === 'wip'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-amber-200 hover:bg-indigo-900/60 hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-500" />
              <span>นับ WIP By Hr (ยอดคงเหลือรายชั่วโมง)</span>
              <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                New
              </span>
            </button>
            <button
              onClick={() => setCurrentTab('simulation')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'simulation'
                  ? 'bg-white text-indigo-950 shadow-md font-bold'
                  : 'text-indigo-200 hover:bg-indigo-900/60 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              วิเคราะห์คอขวด Jig ฉีดโฟม & Takt Time
            </button>
            <button
              onClick={() => setCurrentTab('kanban')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                currentTab === 'kanban'
                  ? 'bg-white text-indigo-950 shadow-md font-bold'
                  : 'text-indigo-200 hover:bg-indigo-900/60 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              บัตรจัดส่งกระเช้า (Kanban Cards)
            </button>
          </div>

          <button
            onClick={onPrint}
            className="text-xs bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 hover:text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 border border-indigo-700/50"
            title="พิมพ์เอกสารนำจ่ายงานประจำกะ"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">พิมพ์เอกสารประจำกะ (Print)</span>
          </button>
        </div>
      </div>
    </header>
  );
};

