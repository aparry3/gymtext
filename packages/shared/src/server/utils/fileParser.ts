import PDFParser from 'pdf2json';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParseMetadata {
  pageCount?: number;
  rowCount?: number;
  sheetNames?: string[];
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

async function parsePDF(buffer: Buffer): Promise<ParsedContent> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', (errData) => {
      const errorMessage =
        errData instanceof Error
          ? errData.message
          : errData.parserError?.message || 'PDF parse error';
      reject(new Error(errorMessage));
    });

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((t) => {
          const rawText = t.R.map((r) => r.T).join('');
          try {
            return decodeURIComponent(rawText);
          } catch {
            return rawText;
          }
        }).join(' ')
      ).join('\n\n');

      resolve({
        text,
        pageCount: pdfData.Pages.length,
      });
    });

    pdfParser.parseBuffer(buffer);
  });
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
    },
  };
}
