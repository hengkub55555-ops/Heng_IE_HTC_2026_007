export interface ModelItem {
  id: string;
  name: string;
  cycles: number; // รอบกระเช้าต่อชั่วโมง (รอบ/ชม.)
  pcsPerCycle: number; // ชิ้นงานต่อรอบกระเช้า
  notes?: string;
}

export interface ShiftSettings {
  shiftHours: number;
  deliveryInterval: number; // นาที/รอบ
  defaultPcsCycle: number;
  targetUph: number;
  shiftStartTime: string; // e.g. "08:00"
  foamJigCycleTimeSec: number; // เวลาฉีดโฟมต่อตู้ (วินาที)
  bufferTargetMinutes: number; // สต็อกสำรองหน้าไลน์ (นาที)
}

export interface HourlyLog {
  [hourIndex: number]: {
    [modelId: string]: {
      deliveredCycles: number;
      isDelivered: boolean;
      notes?: string;
    };
  };
}

export interface ModelWipData {
  initialWip: number; // สต็อกยกมาต้นกะ (ชิ้น)
  minSafeWip: number; // จุดเตือนชิ้นงานต่ำสุด (ชิ้น)
  maxWipCap?: number; // จุดเตือนสต็อกล้น (ชิ้น)
  hours: {
    [hourIndex: number]: {
      inflow?: number; // รับเข้าจากกระเช้า (ชิ้น)
      outflow?: number; // จ่ายเข้า Jig โฟม/ประกอบ (ชิ้น)
      manualEndingWip?: number; // ยอดตรวจนับจริง (ถ้ามี)
      notes?: string;
    };
  };
}

export interface WipState {
  [modelId: string]: ModelWipData;
}

export type AppTab = 'plan' | 'wip' | 'simulation' | 'kanban';
