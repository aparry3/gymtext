import "server-only";

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { getDocumentProxy } from 'unpdf';

// PDF text item with layout coordinates
export interface PDFTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
}

// PDF page data with text and layout items
export interface PDFPageData {
  pageNumber: number;
  text: string;
  items: PDFTextItem[];
}

// Extended PDF data for rich processing
export interface PDFData {
  pages: PDFPageData[];
  heuristics: {
    likelyScanned: boolean;
  };
}

export interface ParseMetadata {
  pageCount?: number;
  rowCount?: number;
  sheetNames?: string[];
  pdfData?: PDFData;
}

export interface ParseResult {
  text: string;
  fileName: string;
  fileType: string;
  metadata: ParseMetadata;
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type ParsedContent = ParseMetadata & { text: string };

/**
 * Detect column boundaries by clustering X positions of text items.
 * Uses a simple clustering approach: items with X positions within tolerance
 * are considered part of the same column.
 */
function detectColumnBoundaries(items: PDFTextItem[], tolerance = 30): number[] {
  if (items.length === 0) return [];

  // Get unique X positions (use left edge of each item)
  const xPositions = items.map(i => i.x).sort((a, b) => a - b);

  // Cluster X positions
  const clusters: { center: number; count: number }[] = [];

  for (const x of xPositions) {
    const nearestCluster = clusters.find(c => Math.abs(c.center - x) < tolerance);
    if (nearestCluster) {
      // Update cluster center as weighted average
      nearestCluster.center = (nearestCluster.center * nearestCluster.count + x) / (nearestCluster.count + 1);
      nearestCluster.count++;
    } else {
      clusters.push({ center: x, count: 1 });
    }
  }

  // Sort clusters by position and filter out noise (clusters with very few items)
  const minClusterSize = Math.max(2, items.length * 0.02);
  const significantClusters = clusters
    .filter(c => c.count >= minClusterSize)
    .sort((a, b) => a.center - b.center);

  // Calculate boundaries as midpoints between clusters
  const boundaries: number[] = [0]; // Start boundary
  for (let i = 0; i < significantClusters.length - 1; i++) {
    boundaries.push((significantClusters[i].center + significantClusters[i + 1].center) / 2);
  }
  boundaries.push(Infinity); // End boundary

  return boundaries;
}

/**
 * Assign a column index to an item based on its X position and column boundaries.
 */
function getColumnIndex(x: number, boundaries: number[]): number {
  for (let i = 0; i < boundaries.length - 1; i++) {
    if (x >= boundaries[i] && x < boundaries[i + 1]) {
      return i;
    }
  }
  return boundaries.length - 2; // Last column
}

/**
 * Group items into logical rows based on Y-position proximity.
 * Items within yTolerance of each other are considered same row.
 */
function groupIntoRows(items: PDFTextItem[], yTolerance = 8): PDFTextItem[][] {
  if (items.length === 0) return [];

  // Sort by Y position
  const sortedItems = [...items].sort((a, b) => a.y - b.y);

  const rows: PDFTextItem[][] = [];
  let currentRow: PDFTextItem[] = [sortedItems[0]];
  let currentY = sortedItems[0].y;

  for (let i = 1; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    if (Math.abs(item.y - currentY) <= yTolerance) {
      currentRow.push(item);
    } else {
      rows.push(currentRow);
      currentRow = [item];
      currentY = item.y;
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Detect if text looks like a header (ALL CAPS, short, or common header patterns).
 */
function looksLikeHeader(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;

  // Check for ALL CAPS (with allowance for numbers and punctuation)
  const alphaChars = trimmed.replace(/[^a-zA-Z]/g, '');
  if (alphaChars.length > 2 && alphaChars === alphaChars.toUpperCase()) {
    return true;
  }

  // Common header patterns
  const headerPatterns = [
    /^(week|day|date|time|workout|exercise|session|phase|notes?|am|pm|rest)$/i,
    /^(mon|tue|wed|thu|fri|sat|sun)/i,
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
  ];

  return headerPatterns.some(p => p.test(trimmed));
}

/**
 * Format a table as markdown.
 */
function formatAsMarkdownTable(cells: string[][], columnCount: number): string {
  if (cells.length === 0) return '';

  const lines: string[] = [];

  // Normalize all rows to have the same number of columns
  const normalizedCells = cells.map(row => {
    const normalized = [...row];
    while (normalized.length < columnCount) {
      normalized.push('');
    }
    return normalized.slice(0, columnCount);
  });

  // Build header row
  const headerRow = normalizedCells[0];
  lines.push('| ' + headerRow.map(c => c.replace(/\|/g, '\\|').replace(/\n/g, ' ').trim() || ' ').join(' | ') + ' |');

  // Build separator row
  lines.push('|' + headerRow.map(() => '---').join('|') + '|');

  // Build data rows
  for (let i = 1; i < normalizedCells.length; i++) {
    const row = normalizedCells[i];
    lines.push('| ' + row.map(c => c.replace(/\|/g, '\\|').replace(/\n/g, ' ').trim() || ' ').join(' | ') + ' |');
  }

  return lines.join('\n');
}

/**
 * Reconstruct table structure from PDF text items using column-aware algorithm.
 *
 * Algorithm:
 * 1. Detect column boundaries by clustering X positions
 * 2. Group items into rows by Y position proximity
 * 3. Assign each item to a cell based on (row, column)
 * 4. Concatenate items in same cell
 * 5. Format as markdown table if table-like, otherwise as plain text
 */
function reconstructTableStructure(items: PDFTextItem[], yTolerance = 8): string {
  if (items.length === 0) return '';

  // First, group into rows to check if this looks like a table
  const rows = groupIntoRows(items, yTolerance);

  // Detect column boundaries
  const columnBoundaries = detectColumnBoundaries(items);
  const columnCount = columnBoundaries.length - 1;

  // Check if this looks like a table (multiple columns and rows)
  const isLikelyTable = columnCount >= 2 && rows.length >= 3;

  if (!isLikelyTable) {
    // Format as plain text
    const lines: string[] = [];
    for (const row of rows) {
      row.sort((a, b) => a.x - b.x);
      lines.push(row.map(item => item.str).join(' '));
    }
    return lines.join('\n');
  }

  // Build table cells
  const tableCells: string[][] = [];

  for (const row of rows) {
    // Sort items in row by X position
    row.sort((a, b) => a.x - b.x);

    // Initialize cell contents for this row
    const cellContents: string[] = new Array(columnCount).fill('');

    for (const item of row) {
      const colIndex = getColumnIndex(item.x, columnBoundaries);
      if (colIndex >= 0 && colIndex < columnCount) {
        // Append to cell, adding space if there's already content
        if (cellContents[colIndex]) {
          cellContents[colIndex] += ' ' + item.str.trim();
        } else {
          cellContents[colIndex] = item.str.trim();
        }
      }
    }

    tableCells.push(cellContents);
  }

  // Check if first row looks like headers
  const firstRowContent = tableCells[0] || [];
  const hasHeaderRow = firstRowContent.some(cell => looksLikeHeader(cell));

  if (hasHeaderRow) {
    return formatAsMarkdownTable(tableCells, columnCount);
  }

  // If no clear headers, still format as markdown but with generic headers
  const genericHeaders = new Array(columnCount).fill(0).map((_, i) => `Col ${i + 1}`);
  const withHeaders = [genericHeaders, ...tableCells];
  return formatAsMarkdownTable(withHeaders, columnCount);
}

async function parsePDF(buffer: Buffer): Promise<ParsedContent> {
  const data = new Uint8Array(buffer);
  const doc = await getDocumentProxy(data);

  const pages: PDFPageData[] = [];
  let fullText = '';
  let totalChars = 0;

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const items: PDFTextItem[] = [];
    let pageText = '';

    for (const item of textContent.items) {
      if ('str' in item && item.str) {
        const transform = item.transform as number[];
        const x = transform[4];
        // Flip Y to top-left origin (PDF uses bottom-left)
        const y = viewport.height - transform[5];

        items.push({
          str: item.str,
          x,
          y,
          width: item.width,
          height: item.height,
          fontName: item.fontName,
        });

        pageText += item.str + ' ';
        totalChars += item.str.length;
      }
    }

    // Reconstruct table structure from coordinates
    const structuredText = reconstructTableStructure(items);

    pages.push({
      pageNumber: i,
      text: structuredText,
      items,
    });

    fullText += `--- Page ${i} ---\n${structuredText}\n\n`;
  }

  // Heuristic: flag as likely scanned if < 50 chars/page average
  const avgCharsPerPage = totalChars / doc.numPages;
  const likelyScanned = avgCharsPerPage < 50;

  console.log('[FileParser] PDF parsed:', JSON.stringify({
    pageCount: doc.numPages,
    textLength: fullText.length,
    likelyScanned,
    pdfData: { pages, heuristics: { likelyScanned } },
  }, null, 2));

  return {
    text: fullText.trim(),
    pageCount: doc.numPages,
    pdfData: {
      pages,
      heuristics: { likelyScanned },
    },
  };
}

function parseCSV(text: string): ParsedContent {
  const result = Papa.parse(text, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data as string[][];
  const formattedText = rows.map((row) => row.join('\t')).join('\n');

  return {
    text: formattedText,
    rowCount: rows.length,
  };
}

function parseXLSX(buffer: Buffer): ParsedContent {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;

  let allText = '';
  let totalRows = 0;

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const lines = csv.split('\n').filter((line) => line.trim());

    if (sheetNames.length > 1) {
      allText += `--- Sheet: ${sheetName} ---\n`;
    }
    allText += csv + '\n';
    totalRows += lines.length;
  }

  return {
    text: allText.trim(),
    rowCount: totalRows,
    sheetNames,
  };
}

function parseTXT(buffer: Buffer): ParsedContent {
  return {
    text: buffer.toString('utf-8'),
  };
}

/**
 * Resolves the MIME type from a file, falling back to extension-based detection
 */
export function resolveFileType(file: File): string {
  let fileType = file.type;

  if (!fileType || fileType === 'application/octet-stream') {
    const ext = file.name.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        fileType = 'application/pdf';
        break;
      case 'csv':
        fileType = 'text/csv';
        break;
      case 'xlsx':
        fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'xls':
        fileType = 'application/vnd.ms-excel';
        break;
      case 'txt':
        fileType = 'text/plain';
        break;
    }
  }

  return fileType;
}

/**
 * Validates that a file meets size and type requirements
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  const fileType = resolveFileType(file);
  if (!ALLOWED_FILE_TYPES.includes(fileType as typeof ALLOWED_FILE_TYPES[number])) {
    return {
      valid: false,
      error: `Unsupported file type: ${fileType}. Allowed types: PDF, CSV, XLSX, TXT`,
    };
  }

  return { valid: true };
}

/**
 * Parses a file and extracts its text content
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileType = resolveFileType(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  let result: ParsedContent;

  switch (fileType) {
    case 'application/pdf':
      result = await parsePDF(buffer);
      break;
    case 'text/csv':
      result = parseCSV(buffer.toString('utf-8'));
      break;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      result = parseXLSX(buffer);
      break;
    case 'text/plain':
      result = parseTXT(buffer);
      break;
    default:
      throw new Error('Unsupported file type');
  }

  return {
    text: result.text,
    fileName: file.name,
    fileType,
    metadata: {
      pageCount: result.pageCount,
      rowCount: result.rowCount,
      sheetNames: result.sheetNames,
      pdfData: result.pdfData,
    },
  };
}
