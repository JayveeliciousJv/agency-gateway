/**
 * Professional Government-Style PDF Report Generator
 * Enhanced with comprehensive demographics and visualizations
 */
import type { AgencyProfile, VisitorLog } from './store';
import autoTable from 'jspdf-autotable';

// Colors
const NAVY: [number, number, number] = [31, 58, 95];
const LIGHT_GRAY: [number, number, number] = [244, 246, 248];
const SLATE: [number, number, number] = [71, 85, 105];
const WHITE: [number, number, number] = [255, 255, 255];
const DARK_TEXT: [number, number, number] = [30, 41, 59];
const MID_TEXT: [number, number, number] = [100, 116, 139];
const SUCCESS_GREEN: [number, number, number] = [34, 197, 94];
const ACCENT_BLUE: [number, number, number] = [59, 130, 246];
const ACCENT_YELLOW: [number, number, number] = [234, 179, 8];
const ACCENT_PURPLE: [number, number, number] = [139, 92, 246];
const ACCENT_PINK: [number, number, number] = [236, 72, 153];

interface ReportConfig {
  doc: any;
  profile: AgencyProfile;
  title: string;
  filterLabel: string;
  orientation?: 'portrait' | 'landscape';
}

interface TableConfig {
  doc: any;
  startY: number;
  head: string[][];
  body: (string | number)[][];
  columnStyles?: Record<number, any>;
  styles?: Record<string, any>;
}

interface SummaryMetric {
  label: string;
  value: string;
}

interface DemographicsData {
  total: number;
  male: number;
  female: number;
  preferNotToSay: number;
}

interface ExtendedDemographicsData {
  total: number;
  sex: { male: number; female: number; preferNotToSay: number };
  sectors: Record<string, number>;
}

interface ChartBarData {
  label: string;
  value: number;
  maxValue?: number;
}

interface ChartPieSlice {
  label: string;
  value: number;
  color: [number, number, number];
}

/**
 * Draw the professional government-style header
 */
export function drawHeader(config: ReportConfig): number {
  const { doc, profile, title, filterLabel } = config;
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Top accent line
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Logo
  if (profile.logoPath) {
    try {
      doc.addImage(profile.logoPath, 'PNG', centerX - 8, 10, 16, 16);
    } catch {
      doc.setFillColor(...LIGHT_GRAY);
      doc.circle(centerX, 18, 8, 'F');
      doc.setFontSize(7);
      doc.setTextColor(...NAVY);
      doc.text('GOV', centerX, 19.5, { align: 'center' });
    }
  } else {
    doc.setFillColor(...LIGHT_GRAY);
    doc.circle(centerX, 18, 8, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    doc.text('GOV', centerX, 19.5, { align: 'center' });
  }

  // Agency Name (top, bold, larger)
  const nameWidth = doc.getTextWidth(profile.agencyName);
  const maxTextWidth = pageWidth * 0.85;
  const agencyFontSize = nameWidth > maxTextWidth ? 11 : 16;
  doc.setFontSize(agencyFontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text(profile.agencyName, centerX, 34, { align: 'center' });

  // Office Name (below, subtitle)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID_TEXT);
  doc.text(profile.officeName, centerX, 40, { align: 'center' });

  // Divider line
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.5);
  doc.line(pageWidth * 0.2, 44, pageWidth * 0.8, 44);

  // Report title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text(title, centerX, 52, { align: 'center' });

  // Filter / date range
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID_TEXT);
  doc.text(`Filter: ${filterLabel}`, centerX, 58, { align: 'center' });

  // Generation timestamp
  doc.text(`Generated: ${new Date().toLocaleString('en-PH')}`, centerX, 63, { align: 'center' });

  // Bottom accent line under header
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, 66, pageWidth, 1, 'F');

  return 72; // next Y position
}

/**
 * Draw a professional data table with zebra stripes
 */
export function drawTable(config: TableConfig): number {
  const { doc, startY, head, body, columnStyles, styles } = config;

  autoTable(doc, {
    startY,
    head,
    body,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      lineColor: [220, 225, 230],
      lineWidth: 0.3,
      textColor: DARK_TEXT,
      font: 'helvetica',
      ...styles,
    },
    headStyles: {
      fillColor: [...NAVY],
      textColor: [...WHITE],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [...LIGHT_GRAY],
    },
    bodyStyles: {
      fillColor: [...WHITE],
    },
    columnStyles: {
      ...columnStyles,
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        const val = data.cell.raw;
        if (typeof val === 'number' || (typeof val === 'string' && /^\d+(\.\d+)?%?$/.test(val.trim()))) {
          data.cell.styles.halign = 'right';
        }
      }
    },
  });

  return (doc as any).lastAutoTable?.finalY || startY + 40;
}

/**
 * Draw highlighted summary metrics box
 */
export function drawSummaryMetrics(doc: any, startY: number, metrics: SummaryMetric[]): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const boxWidth = (pageWidth - margin * 2 - (metrics.length - 1) * 6) / metrics.length;
  const boxHeight = 28;

  let x = margin;
  const y = startY + 4;

  // Section label
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Key Metrics', margin, startY);

  metrics.forEach((metric) => {
    // Box background
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'F');

    // Border accent
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.5);
    doc.line(x, y, x, y + boxHeight);

    // Value
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text(metric.value, x + boxWidth / 2, y + 12, { align: 'center' });

    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MID_TEXT);
    const lines = doc.splitTextToSize(metric.label, boxWidth - 6);
    doc.text(lines, x + boxWidth / 2, y + 19, { align: 'center' });

    x += boxWidth + 6;
  });

  return y + boxHeight + 8;
}

/**
 * Draw demographics summary card-style table (basic)
 */
export function drawDemographics(doc: any, startY: number, data: DemographicsData): number {
  const margin = 14;

  // Section label
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Demographics Summary', margin, startY);

  autoTable(doc, {
    startY: startY + 4,
    head: [['Category', 'Count', 'Percentage']],
    body: [
      ['Total Visitors / Respondents', data.total, '100%'],
      ['Male', data.male, data.total ? `${Math.round((data.male / data.total) * 100)}%` : '0%'],
      ['Female', data.female, data.total ? `${Math.round((data.female / data.total) * 100)}%` : '0%'],
      ['Prefer Not to Say', data.preferNotToSay, data.total ? `${Math.round((data.preferNotToSay / data.total) * 100)}%` : '0%'],
    ],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      lineColor: [220, 225, 230],
      lineWidth: 0.3,
      textColor: DARK_TEXT,
    },
    headStyles: {
      fillColor: [...SLATE],
      textColor: [...WHITE],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [...LIGHT_GRAY],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { halign: 'center', cellWidth: 35 },
      2: { halign: 'center', cellWidth: 35 },
    },
    margin: { left: margin },
    tableWidth: 140,
  });

  return (doc as any).lastAutoTable?.finalY || startY + 50;
}

/**
 * Calculate demographics from visitor data (sex and sector only)
 */
export function calculateExtendedDemographics(visitors: VisitorLog[]): ExtendedDemographicsData {
  const data: ExtendedDemographicsData = {
    total: visitors.length,
    sex: { male: 0, female: 0, preferNotToSay: 0 },
    sectors: {},
  };

  visitors.forEach((v) => {
    // Sex
    if (v.sex === 'Male') data.sex.male++;
    else if (v.sex === 'Female') data.sex.female++;
    else data.sex.preferNotToSay++;

    // Sectors
    if (v.sectorClassification) {
      data.sectors[v.sectorClassification] = (data.sectors[v.sectorClassification] || 0) + 1;
    }
  });

  return data;
}

/**
 * Draw comprehensive demographics page with all categories
 */
export function drawExtendedDemographicsPage(doc: any, startY: number, data: ExtendedDemographicsData): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let curY = startY;

  // Executive Summary Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, curY, pageWidth - margin * 2, 35, 3, 3, 'F');
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.5);
  doc.line(margin, curY, margin, curY + 35);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Executive Summary', margin + 6, curY + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);
  const summaryText = `Total Respondents: ${data.total} | Male: ${data.sex.male} (${data.total ? Math.round((data.sex.male / data.total) * 100) : 0}%) | Female: ${data.sex.female} (${data.total ? Math.round((data.sex.female / data.total) * 100) : 0}%) | Prefer Not to Say: ${data.sex.preferNotToSay} (${data.total ? Math.round((data.sex.preferNotToSay / data.total) * 100) : 0}%)`;
  doc.text(summaryText, margin + 6, curY + 20);

  // Key insight
  const topSector = Object.entries(data.sectors).sort((a, b) => b[1] - a[1])[0];
  const topAge = Object.entries(data.ageGroups).sort((a, b) => b[1] - a[1])[0];
  let insightText = 'Key Insights: ';
  if (topSector) insightText += `Most common sector: ${topSector[0]} (${topSector[1]}). `;
  if (topAge) insightText += `Most common age group: ${topAge[0]} (${topAge[1]}).`;
  doc.text(insightText, margin + 6, curY + 28);

  curY += 45;

  // 1. Sex Distribution Table with Visual Bar
  curY = drawDemographicTableWithBar(doc, curY, 'Sex Distribution', [
    { label: 'Male', count: data.sex.male, color: ACCENT_BLUE },
    { label: 'Female', count: data.sex.female, color: ACCENT_YELLOW },
    { label: 'Prefer Not to Say', count: data.sex.preferNotToSay, color: SLATE },
  ], data.total);

  // Check page break
  if (curY > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    curY = 20;
  }

  // 2. Age Group Distribution
  const ageData = Object.entries(data.ageGroups)
    .map(([label, count]) => ({ label, count, color: ACCENT_BLUE as [number, number, number] }))
    .sort((a, b) => {
      const order = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
      return order.indexOf(a.label) - order.indexOf(b.label);
    });
  if (ageData.length > 0) {
    curY = drawDemographicTableWithBar(doc, curY, 'Age Group Distribution', ageData, data.total);
  }

  // Check page break
  if (curY > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    curY = 20;
  }

  // 3. Education Level Distribution
  const eduData = Object.entries(data.educationLevels)
    .map(([label, count]) => ({ label, count, color: SUCCESS_GREEN as [number, number, number] }))
    .sort((a, b) => b.count - a.count);
  if (eduData.length > 0) {
    curY = drawDemographicTableWithBar(doc, curY, 'Education Level Distribution', eduData, data.total);
  }

  // Check page break
  if (curY > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    curY = 20;
  }

  // 4. Occupation Distribution
  const occData = Object.entries(data.occupations)
    .map(([label, count]) => ({ label, count, color: ACCENT_PURPLE as [number, number, number] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8
  if (occData.length > 0) {
    curY = drawDemographicTableWithBar(doc, curY, 'Occupation Distribution (Top 8)', occData, data.total);
  }

  // Check page break
  if (curY > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    curY = 20;
  }

  // 5. Region/Location Distribution
  const regData = Object.entries(data.regions)
    .map(([label, count]) => ({ label, count, color: ACCENT_PINK as [number, number, number] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8
  if (regData.length > 0) {
    curY = drawDemographicTableWithBar(doc, curY, 'Region/Location Distribution (Top 8)', regData, data.total);
  }

  // Check page break
  if (curY > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    curY = 20;
  }

  // 6. Sector Classification Distribution
  const sectorData = Object.entries(data.sectors)
    .map(([label, count]) => ({ label, count, color: NAVY as [number, number, number] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10
  if (sectorData.length > 0) {
    curY = drawDemographicTableWithBar(doc, curY, 'Sector Classification Distribution', sectorData, data.total);
  }

  return curY;
}

/**
 * Draw a demographic category table with visual percentage bar
 */
function drawDemographicTableWithBar(
  doc: any,
  startY: number,
  title: string,
  items: { label: string; count: number; color: [number, number, number] }[],
  total: number
): number {
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = pageWidth - margin * 2;
  const barMaxWidth = 60;

  // Section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text(title, margin, startY);

  const tableBody = items.map((item) => {
    const pct = total ? Math.round((item.count / total) * 100) : 0;
    return [item.label, item.count, `${pct}%`];
  });

  // Add total row
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  tableBody.push(['TOTAL', totalCount, total ? `${Math.round((totalCount / total) * 100)}%` : '0%']);

  autoTable(doc, {
    startY: startY + 4,
    head: [['Category', 'Count', 'Percentage', 'Distribution']],
    body: tableBody.map((row, idx) => [...row, '']),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      lineColor: [220, 225, 230],
      lineWidth: 0.3,
      textColor: DARK_TEXT,
    },
    headStyles: {
      fillColor: [...NAVY],
      textColor: [...WHITE],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [...LIGHT_GRAY],
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'center', cellWidth: 30 },
      3: { cellWidth: barMaxWidth + 10 },
    },
    margin: { left: margin, right: margin },
    didDrawCell: (data: any) => {
      // Draw percentage bar in the last column
      if (data.section === 'body' && data.column.index === 3) {
        const rowIdx = data.row.index;
        if (rowIdx < items.length) {
          const item = items[rowIdx];
          const pct = total ? (item.count / total) : 0;
          const barWidth = pct * barMaxWidth;

          // Bar background
          doc.setFillColor(230, 233, 237);
          doc.rect(data.cell.x + 4, data.cell.y + 3, barMaxWidth, 8, 'F');

          // Bar fill
          if (barWidth > 0) {
            doc.setFillColor(...item.color);
            doc.rect(data.cell.x + 4, data.cell.y + 3, barWidth, 8, 'F');
          }
        }
      }
    },
    didParseCell: (data: any) => {
      // Bold the total row
      if (data.section === 'body' && data.row.index === items.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [220, 225, 230];
      }
    },
  });

  return (doc as any).lastAutoTable?.finalY + 10 || startY + 80;
}

/**
 * Draw bar chart (simple rectangles)
 */
export function drawBarChart(doc: any, startY: number, title: string, data: ChartBarData[], chartWidth?: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const width = chartWidth || pageWidth - margin * 2;
  const barHeight = 12;
  const gap = 4;
  const labelWidth = 80;
  const maxBarWidth = width - labelWidth - 40;

  // Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text(title, margin, startY);

  let y = startY + 8;
  const maxVal = data.reduce((max, d) => Math.max(max, d.value), 1);

  data.forEach((item, i) => {
    // Label
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);
    const truncLabel = item.label.length > 28 ? item.label.substring(0, 25) + '...' : item.label;
    doc.text(truncLabel, margin, y + barHeight * 0.65);

    // Bar background
    doc.setFillColor(230, 233, 237);
    doc.roundedRect(margin + labelWidth, y, maxBarWidth, barHeight, 1, 1, 'F');

    // Bar fill
    const barW = Math.max(2, (item.value / maxVal) * maxBarWidth);
    const colors = [NAVY, ACCENT_BLUE, SUCCESS_GREEN, [234, 179, 8], [239, 68, 68]] as const;
    const color = colors[i % colors.length];
    doc.setFillColor(...color);
    doc.roundedRect(margin + labelWidth, y, barW, barHeight, 1, 1, 'F');

    // Value
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_TEXT);
    doc.text(String(item.value), margin + labelWidth + barW + 3, y + barHeight * 0.65);

    y += barHeight + gap;
  });

  return y + 4;
}

/**
 * Draw pie chart (circle segments approximated as legend + proportional blocks)
 */
export function drawPieChart(doc: any, startY: number, title: string, slices: ChartPieSlice[]): number {
  const margin = 14;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return startY;

  // Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text(title, margin, startY);

  let y = startY + 8;

  // Draw proportional horizontal stacked bar
  const barWidth = 120;
  const barHeight = 14;
  let barX = margin;

  slices.forEach((slice) => {
    const w = (slice.value / total) * barWidth;
    if (w > 0) {
      doc.setFillColor(...slice.color);
      doc.rect(barX, y, w, barHeight, 'F');
      barX += w;
    }
  });

  y += barHeight + 6;

  // Legend
  slices.forEach((slice) => {
    const pct = total ? Math.round((slice.value / total) * 100) : 0;

    // Color swatch
    doc.setFillColor(...slice.color);
    doc.rect(margin, y, 6, 6, 'F');

    // Label
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);
    doc.text(`${slice.label}: ${slice.value} (${pct}%)`, margin + 9, y + 5);

    y += 10;
  });

  return y + 4;
}

/**
 * Draw the footer with page numbers, signatory, and system name
 */
export function drawFooter(doc: any, profile: AgencyProfile) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();

    // Footer separator line
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.5);
    doc.line(14, h - 22, pageWidth - 14, h - 22);

    // Page number (centered)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MID_TEXT);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, h - 8, { align: 'center' });

    // System name (left)
    doc.setFontSize(6.5);
    doc.text(`Generated by ${profile.systemTitle || 'Office Visitor Logbook System'}`, 14, h - 8);

    // Signatory on last page — centered block above footer
    if (i === pageCount && profile.reportSignatory) {
      const sigCenterX = pageWidth / 2;
      const sigLineWidth = 70;

      // "Prepared by" label
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MID_TEXT);
      doc.text('Prepared by:', sigCenterX, h - 62, { align: 'center' });

      // Signature line
      doc.setDrawColor(...DARK_TEXT);
      doc.setLineWidth(0.4);
      doc.line(sigCenterX - sigLineWidth / 2, h - 48, sigCenterX + sigLineWidth / 2, h - 48);

      // Name (bold, uppercase)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK_TEXT);
      doc.text(profile.reportSignatory.toUpperCase(), sigCenterX, h - 43, { align: 'center' });

      // Position / Title
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MID_TEXT);
      doc.text(profile.reportSignatoryPosition || '', sigCenterX, h - 38, { align: 'center' });
    }
  }
}

/**
 * Add a new page with a section title
 */
export function addSectionPage(doc: any, title: string): number {
  doc.addPage();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 3, 'F');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text(title, pageWidth / 2, 16, { align: 'center' });

  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, 20, pageWidth, 1, 'F');

  return 28;
}

export function addVisualizationPage(doc: any, _profile: AgencyProfile): number {
  return addSectionPage(doc, 'Data Visualizations');
}

export type { ReportConfig, TableConfig, SummaryMetric, DemographicsData, ExtendedDemographicsData, ChartBarData, ChartPieSlice };
