import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { OperationalGuideline } from './components/OperationalGuideline';
import { ParameterSettings } from './components/ParameterSettings';
import { KPICards } from './components/KPICards';
import { ModelTable } from './components/ModelTable';
import { HourlyMatrix } from './components/HourlyMatrix';
import { FoamJigSimulation } from './components/FoamJigSimulation';
import { KanbanCardsView } from './components/KanbanCardsView';
import { WipByHourSheet } from './components/WipByHourSheet';
import { ModelModal } from './components/ModelModal';
import { PrintDispatchSheet } from './components/PrintDispatchSheet';
import { DEFAULT_MODELS, DEFAULT_SETTINGS } from './data/defaultData';
import { ModelItem, ShiftSettings, HourlyLog, WipState, AppTab } from './types';
import { exportToCSV } from './utils/exportUtils';

export default function App() {
  // Load state from localStorage or use defaults
  const [models, setModels] = useState<ModelItem[]>(() => {
    try {
      const saved = localStorage.getItem('ie_innerbox_models');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_MODELS;
  });

  const [settings, setSettings] = useState<ShiftSettings>(() => {
    try {
      const saved = localStorage.getItem('ie_shift_settings');
      if (saved) return JSON.parse(saved);
      // Backwards compatibility with single values from user prototype
      const savedShiftHours = localStorage.getItem('ie_shift_hours');
      const savedDeliveryInterval = localStorage.getItem('ie_delivery_interval');
      if (savedShiftHours || savedDeliveryInterval) {
        return {
          ...DEFAULT_SETTINGS,
          shiftHours: savedShiftHours ? Number(savedShiftHours) : DEFAULT_SETTINGS.shiftHours,
          deliveryInterval: savedDeliveryInterval ? Number(savedDeliveryInterval) : DEFAULT_SETTINGS.deliveryInterval
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [hourlyLog, setHourlyLog] = useState<HourlyLog>(() => {
    try {
      const saved = localStorage.getItem('ie_hourly_log');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // WIP By Hour state
  const [wipState, setWipState] = useState<WipState>(() => {
    try {
      const saved = localStorage.getItem('ie_wip_by_hr_data');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    // Default WIP setup: 15-20 pcs initial buffer, 5 pcs min safe buffer
    const initialWipObj: WipState = {};
    DEFAULT_MODELS.forEach((m) => {
      const plannedUph = m.cycles * m.pcsPerCycle;
      initialWipObj[m.id] = {
        initialWip: plannedUph > 0 ? Math.max(10, Math.round(plannedUph * 0.5)) : 15,
        minSafeWip: 5,
        hours: {}
      };
    });
    return initialWipObj;
  });

  const [currentTab, setCurrentTab] = useState<AppTab>('plan');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ie_innerbox_models', JSON.stringify(models));
    localStorage.setItem('ie_shift_hours', settings.shiftHours.toString());
    localStorage.setItem('ie_delivery_interval', settings.deliveryInterval.toString());
    localStorage.setItem('ie_shift_settings', JSON.stringify(settings));
  }, [models, settings]);

  useEffect(() => {
    localStorage.setItem('ie_hourly_log', JSON.stringify(hourlyLog));
  }, [hourlyLog]);

  useEffect(() => {
    localStorage.setItem('ie_wip_by_hr_data', JSON.stringify(wipState));
  }, [wipState]);

  // Derived KPI Calculations
  const { totalUph, totalCycles, avgTaktTime, totalShiftPcs } = useMemo(() => {
    let uphSum = 0;
    let cycleSum = 0;

    models.forEach((m) => {
      uphSum += Number(m.cycles) * Number(m.pcsPerCycle);
      cycleSum += Number(m.cycles);
    });

    const takt = uphSum > 0 ? 3600 / uphSum : 0;
    const shiftTotal = uphSum * (settings.shiftHours || 10);

    return {
      totalUph: uphSum,
      totalCycles: cycleSum,
      avgTaktTime: takt,
      totalShiftPcs: shiftTotal
    };
  }, [models, settings.shiftHours]);

  // Sync targetUph with totalUph automatically if desired, or keep as setting
  useEffect(() => {
    if (totalUph > 0 && settings.targetUph !== totalUph) {
      setSettings((prev) => ({ ...prev, targetUph: totalUph }));
    }
  }, [totalUph]);

  // Jig Foaming capacity benchmark
  const foamJigCapacityUph = Math.round(3600 / (settings.foamJigCycleTimeSec || 21.0));
  const isBottleneckRisk = totalUph < foamJigCapacityUph * 0.9;

  // Handlers for parameters
  const handleSettingChange = (key: keyof ShiftSettings, value: number | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyPreset = (hours: number) => {
    setSettings((prev) => ({ ...prev, shiftHours: hours }));
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่? (All models and settings will be restored)')) {
      setModels(DEFAULT_MODELS);
      setSettings(DEFAULT_SETTINGS);
      setHourlyLog({});
      
      const resetWipObj: WipState = {};
      DEFAULT_MODELS.forEach((m) => {
        const plannedUph = m.cycles * m.pcsPerCycle;
        resetWipObj[m.id] = {
          initialWip: plannedUph > 0 ? Math.max(10, Math.round(plannedUph * 0.5)) : 15,
          minSafeWip: 5,
          hours: {}
        };
      });
      setWipState(resetWipObj);

      localStorage.removeItem('ie_innerbox_models');
      localStorage.removeItem('ie_shift_hours');
      localStorage.removeItem('ie_delivery_interval');
      localStorage.removeItem('ie_shift_settings');
      localStorage.removeItem('ie_hourly_log');
      localStorage.removeItem('ie_wip_by_hr_data');
    }
  };

  const handleResetWip = () => {
    if (window.confirm('คุณต้องการรีเซ็ตยอดตรวจนับ WIP ทุกชั่วโมงกลับสู่ค่าคำนวณมาตรฐานใช่หรือไม่?')) {
      const resetWipObj: WipState = {};
      models.forEach((m) => {
        const plannedUph = m.cycles * m.pcsPerCycle;
        resetWipObj[m.id] = {
          initialWip: plannedUph > 0 ? Math.max(10, Math.round(plannedUph * 0.5)) : 15,
          minSafeWip: 5,
          hours: {}
        };
      });
      setWipState(resetWipObj);
      localStorage.removeItem('ie_wip_by_hr_data');
    }
  };


  // Model CRUD
  const handleUpdateModelField = (id: string, field: 'cycles' | 'pcsPerCycle' | 'name', value: number | string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSaveModel = (data: { id?: string; name: string; cycles: number; pcsPerCycle: number; notes?: string }) => {
    if (data.id) {
      // Edit
      setModels((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? { ...m, name: data.name, cycles: data.cycles, pcsPerCycle: data.pcsPerCycle, notes: data.notes }
            : m
        )
      );
    } else {
      // Add
      const newModel: ModelItem = {
        id: `m-${Date.now()}`,
        name: data.name,
        cycles: data.cycles,
        pcsPerCycle: data.pcsPerCycle,
        notes: data.notes
      };
      setModels((prev) => [...prev, newModel]);
    }
    setEditingModel(null);
  };

  const handleDeleteModel = (id: string, name: string) => {
    if (window.confirm(`คุณต้องการลบรุ่น "${name}" ออกจากระบบใช่หรือไม่?`)) {
      setModels((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleDuplicateModel = (model: ModelItem) => {
    const duplicated: ModelItem = {
      ...model,
      id: `m-${Date.now()}`,
      name: `${model.name} (Copy)`
    };
    setModels((prev) => [...prev, duplicated]);
  };

  const handleOpenAddModal = () => {
    setEditingModel(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (model: ModelItem) => {
    setEditingModel(model);
    setIsModalOpen(true);
  };

  // Hourly tracking handlers
  const handleToggleHourDelivery = (hour: number, modelId: string) => {
    setHourlyLog((prev) => {
      const hourData = prev[hour] || {};
      const current = hourData[modelId];
      const isCurrentlyDelivered = current?.isDelivered || false;

      return {
        ...prev,
        [hour]: {
          ...hourData,
          [modelId]: {
            deliveredCycles: isCurrentlyDelivered ? 0 : 1,
            isDelivered: !isCurrentlyDelivered
          }
        }
      };
    });
  };

  const handleMarkHourComplete = (hour: number) => {
    setHourlyLog((prev) => {
      const updatedHour: Record<string, { deliveredCycles: number; isDelivered: boolean }> = {};
      models.forEach((m) => {
        updatedHour[m.id] = { deliveredCycles: m.cycles, isDelivered: true };
      });
      return {
        ...prev,
        [hour]: updatedHour
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-100/90 text-slate-800">
      {/* Header with live clock & navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onPrint={handlePrint}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 flex-1 w-full">
        {/* Operational Guideline Alert */}
        <OperationalGuideline
          onExportCSV={() => exportToCSV(models, settings)}
          onResetDefault={handleResetToDefault}
          isBottleneckRisk={isBottleneckRisk}
          totalUph={totalUph}
          jigCapacityUph={foamJigCapacityUph}
        />

        {/* Global Parameter Settings */}
        <ParameterSettings
          settings={settings}
          onChange={handleSettingChange}
          onApplyPreset={handleApplyPreset}
        />

        {/* KPI Summary Cards */}
        <KPICards
          totalUph={totalUph}
          totalModels={models.length}
          totalCycles={totalCycles}
          avgTaktTime={avgTaktTime}
          totalShiftPcs={totalShiftPcs}
          foamJigCapacityUph={foamJigCapacityUph}
        />

        {/* Tab 1: Standard Plan & Calculations */}
        {currentTab === 'plan' && (
          <div className="space-y-6">
            <ModelTable
              models={models}
              onUpdateModel={handleUpdateModelField}
              onEditModel={handleOpenEditModal}
              onDeleteModel={handleDeleteModel}
              onDuplicateModel={handleDuplicateModel}
              onOpenAddModal={handleOpenAddModal}
            />

            <HourlyMatrix
              models={models}
              settings={settings}
              hourlyLog={hourlyLog}
              onToggleHourDelivery={handleToggleHourDelivery}
              onMarkHourComplete={handleMarkHourComplete}
            />
          </div>
        )}

        {/* Tab 2: Hourly WIP Balance & Line Stock Control Sheet */}
        {currentTab === 'wip' && (
          <WipByHourSheet
            models={models}
            settings={settings}
            wipState={wipState}
            onUpdateWipState={setWipState}
            onResetWip={handleResetWip}
          />
        )}

        {/* Tab 3: Foam Jig Bottleneck & Line Balancing Simulation */}
        {currentTab === 'simulation' && (
          <FoamJigSimulation
            models={models}
            settings={settings}
            totalUph={totalUph}
          />
        )}

        {/* Tab 4: Printable Kanban Cards */}
        {currentTab === 'kanban' && (
          <KanbanCardsView
            models={models}
            settings={settings}
            onPrint={handlePrint}
          />
        )}

      </main>

      {/* Add / Edit Model Modal */}
      <ModelModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingModel(null);
        }}
        onSave={handleSaveModel}
        initialModel={editingModel}
        defaultPcs={settings.defaultPcsCycle}
      />

      {/* Hidden printable dispatch sheet for shift supervisors */}
      <PrintDispatchSheet
        models={models}
        settings={settings}
        totalUph={totalUph}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto no-print">
        <p>
          Innerbox Hourly Request & Delivery Control System • Designed for Industrial Engineering Production Efficiency © 2026
        </p>
      </footer>
    </div>
  );
}
