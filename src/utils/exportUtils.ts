import { ModelItem, ShiftSettings } from '../types';

export function exportToCSV(models: ModelItem[], settings: ShiftSettings) {
  const shiftHours = settings.shiftHours || 10;
  let csvContent = '\uFEFF'; // UTF-8 BOM for Thai language support in MS Excel

  // Title and metadata rows
  csvContent += `รายงานแผนจัดส่ง Innerbox และควบคุมรอบการผลิต (IE Control Plan)\n`;
  csvContent += `วันที่ออกรายงาน,${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}\n`;
  csvContent += `เวลาทำงานต่อกะ,${shiftHours} ชม.,รอบจัดส่งมาตรฐาน,${settings.deliveryInterval} นาที,เป้าหมาย UPH รวม,${settings.targetUph} ชิ้น/ชม.\n\n`;

  // Headers
  const header = ['ลำดับ', 'รุ่นสินค้า (Model Name)', 'รอบกระเช้าส่ง (รอบ/ชม.)', 'ชิ้นงาน/รอบกระเช้า', 'UPH คำนวณ (ชิ้น/ชม.)', 'เวลาต่อรอบ (นาที)'];
  for (let i = 1; i <= shiftHours; i++) {
    header.push(`ชม. ที่ ${i}`);
  }
  header.push('ยอดรวมทั้งกะ (ชิ้น)');
  csvContent += header.join(',') + '\n';

  let grandTotal = 0;
  const hourlySums = new Array(shiftHours).fill(0);

  // Model rows
  models.forEach((m, idx) => {
    const uph = Number(m.cycles) * Number(m.pcsPerCycle);
    const cycleTimeMins = m.cycles > 0 ? (60 / Number(m.cycles)).toFixed(1) : '0';
    const totalShift = uph * shiftHours;
    grandTotal += totalShift;

    const row = [
      idx + 1,
      `"${m.name.replace(/"/g, '""')}"`,
      m.cycles,
      m.pcsPerCycle,
      uph,
      cycleTimeMins
    ];

    for (let i = 1; i <= shiftHours; i++) {
      hourlySums[i - 1] += uph;
      row.push(uph.toString());
    }
    row.push(totalShift.toString());
    csvContent += row.join(',') + '\n';
  });

  // Summary row
  const summaryRow = ['รวมทั้งสิ้น', '-', models.reduce((acc, curr) => acc + curr.cycles, 0), '-', models.reduce((acc, curr) => acc + curr.cycles * curr.pcsPerCycle, 0), '-'];
  for (let i = 1; i <= shiftHours; i++) {
    summaryRow.push(hourlySums[i - 1].toString());
  }
  summaryRow.push(grandTotal.toString());
  csvContent += summaryRow.join(',') + '\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Innerbox_Hourly_Plan_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportWipToCSV(
  models: ModelItem[],
  settings: ShiftSettings,
  wipData: Record<string, { initialWip: number; minSafeWip: number; hours: Record<number, { inflow?: number; outflow?: number; manualEndingWip?: number }> }>,
  computedWip: Record<string, number[]>
) {
  const shiftHours = settings.shiftHours || 10;
  let csvContent = '\uFEFF'; // UTF-8 BOM

  csvContent += `รายงานยอดคงเหลือชิ้นงาน Innerbox รายชั่วโมง (WIP By Hour Control Report)\n`;
  csvContent += `วันที่ออกรายงาน,${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}\n`;
  csvContent += `เวลาทำงานต่อกะ,${shiftHours} ชม.,รอบส่งมาตรฐาน,${settings.deliveryInterval} นาที\n\n`;

  const header = ['ลำดับ', 'รุ่นสินค้า (Model)', 'UPH มาตรฐาน', 'สต็อกยกมา (Initial WIP)', 'จุดเตือนขั้นต่ำ (Min Safe)'];
  for (let i = 1; i <= shiftHours; i++) {
    header.push(`คงเหลือ ชม.${i} (WIP H${i})`);
  }
  csvContent += header.join(',') + '\n';

  models.forEach((m, idx) => {
    const uph = m.cycles * m.pcsPerCycle;
    const modelWip = wipData[m.id];
    const initial = modelWip?.initialWip ?? 15;
    const minSafe = modelWip?.minSafeWip ?? 5;
    const row = [
      idx + 1,
      `"${m.name.replace(/"/g, '""')}"`,
      uph,
      initial,
      minSafe
    ];

    const balances = computedWip[m.id] || [];
    for (let i = 1; i <= shiftHours; i++) {
      row.push((balances[i - 1] ?? initial).toString());
    }
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Innerbox_WIP_By_Hour_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

