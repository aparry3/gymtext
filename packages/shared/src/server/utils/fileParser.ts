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
 * Groups PDF text items into rows based on Y position,
 * then sorts each row by X position to reconstruct reading order.
 * Detects table structures and formats as tab-separated rows.
 */
function reconstructTableStructure(items: PDFTextItem[], yTolerance = 5): string {
  if (items.length === 0) return '';

  // Sort items by y then x
  const sortedItems = [...items].sort((a, b) => a.y - b.y || a.x - b.x);

  // Group items into rows based on Y proximity
  const rows: PDFTextItem[][] = [];
  let currentRow: PDFTextItem[] = [];
  let currentY = sortedItems[0].y;

  for (const item of sortedItems) {
    if (Math.abs(item.y - currentY) > yTolerance) {
      // New row
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [item];
      currentY = item.y;
    } else {
      currentRow.push(item);
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  // Detect if this looks like a table (multiple rows with similar column counts)
  const columnCounts = rows.map(r => r.length);
  const avgColumns = columnCounts.reduce((a, b) => a + b, 0) / rows.length;
  const isLikelyTable = avgColumns >= 3 && rows.length >= 3;

  // Format output
  const lines: string[] = [];
  for (const row of rows) {
    // Sort row items by x position
    row.sort((a, b) => a.x - b.x);

    if (isLikelyTable) {
      // Use tab separation for table-like content
      lines.push(row.map(item => item.str.trim()).join('\t'));
    } else {
      // Use space separation for regular text
      lines.push(row.map(item => item.str).join(' '));
    }
  }

  return lines.join('\n');
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
