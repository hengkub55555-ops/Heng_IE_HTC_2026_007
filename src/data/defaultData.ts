import { ModelItem, ShiftSettings } from '../types';

export const DEFAULT_MODELS: ModelItem[] = [
  { id: 'm-1', name: '150', cycles: 8, pcsPerCycle: 5, notes: 'รุ่นหลัก Jig #1 & #2' },
  { id: 'm-2', name: '190', cycles: 4, pcsPerCycle: 5, notes: 'รุ่นมาตรฐาน' },
  { id: 'm-3', name: '212', cycles: 3, pcsPerCycle: 5, notes: 'ไลน์ประกอบ B' },
  { id: 'm-4', name: '350', cycles: 2, pcsPerCycle: 5, notes: 'รุ่นขนาดใหญ่ ตู้ 2 ประตู' },
  { id: 'm-5', name: 'TM12', cycles: 2, pcsPerCycle: 5, notes: 'รุ่นพรีเมียม' },
  { id: 'm-6', name: '320 Model', cycles: 2, pcsPerCycle: 5, notes: 'รุ่นประหยัดไฟ' },
  { id: 'm-7', name: '235 Model', cycles: 3, pcsPerCycle: 5, notes: 'รุ่นมาตรฐานพิเศษ' },
  { id: 'm-8', name: 'FUF-18', cycles: 5, pcsPerCycle: 5, notes: 'ตู้แช่แข็งแนวตั้ง' },
  { id: 'm-9', name: 'FUF-19', cycles: 5, pcsPerCycle: 5, notes: 'ตู้แช่แข็งพรีเมียม' }
];

export const DEFAULT_SETTINGS: ShiftSettings = {
  shiftHours: 10,
  deliveryInterval: 60,
  defaultPcsCycle: 5,
  targetUph: 170,
  shiftStartTime: '08:00',
  foamJigCycleTimeSec: 21.0,
  bufferTargetMinutes: 30
};
