/**
 * Professional Government-Style PDF Report Generator
 * Reusable across all report types in the system.
 */
import type { AgencyProfile } from './store';
import autoTable from 'jspdf-autotable';

// Colors
const NAVY = [31, 58, 95] as const;        // #1F3A5F
const LIGHT_GRAY = [244, 246, 248] as const; // #F4F6F8
const SLATE = [71, 85, 105] as const;       // slate-600
const WHITE = [255, 255, 255] as const;
const DARK_TEXT = [30, 41, 59] as const;     // slate-800
const MID_TEXT = [100, 116, 139] as const;   // slate-400
const SUCCESS_GREEN = [34, 197, 94] as const;
const ACCENT_BLUE = [59, 130, 246] as const;

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

interface ChartBarData {
  label: string;
  value: number;
  maxValue?: number;
}

interface ChartPieSlice {
  label: string;
  value: number;
  color: readonly [number, number, number];
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

  // Logo placeholder circle
  doc.setFillColor(...LIGHT_GRAY);
  doc.circle(centerX, 18, 8, 'F');
  doc.setFillColor(...NAVY);
  doc.setFontSize(7);
  doc.setTextColor(...NAVY);
  doc.text('GOV', centerX, 19.5, { align: 'center' });

  // Office Name (bold, larger)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text(profile.officeName, centerX, 34, { align: 'center' });

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID_TEXT);
  doc.text(profile.agencyName, centerX, 40, { align: 'center' });

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
 * Draw demographics summary card-style table
 */
export function drawDemographics(doc: any, startY: number, data: DemographicsData): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const tableWidth = 140;

  // Section label
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Demographics Summary', margin, startY);

  (doc as any).autoTable({
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
    tableWidth,
  });

  return (doc as any).lastAutoTable?.finalY || startY + 50;
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

    // Signatory on last page
    if (i === pageCount && profile.reportSignatory) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK_TEXT);
      doc.text(profile.reportSignatory, pageWidth - 14, h - 38, { align: 'right' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MID_TEXT);
      doc.text(profile.reportSignatoryPosition, pageWidth - 14, h - 33, { align: 'right' });

      // Signature line
      doc.setDrawColor(...DARK_TEXT);
      doc.setLineWidth(0.3);
      doc.line(pageWidth - 80, h - 40, pageWidth - 14, h - 40);
    }
  }
}

/**
 * Add a new page for visualizations
 */
export function addVisualizationPage(doc: any, profile: AgencyProfile): number {
  doc.addPage();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top accent
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Page title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Data Visualizations', pageWidth / 2, 16, { align: 'center' });

  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, 20, pageWidth, 1, 'F');

  return 28;
}

export type { ReportConfig, TableConfig, SummaryMetric, DemographicsData, ChartBarData, ChartPieSlice };
