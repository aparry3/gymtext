import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ParseResult {
  text: string;
  fileName: string;
  fileType: string;
  metadata: {
    pageCount?: number;
    rowCount?: number;
    sheetNames?: string[];
  };
}

const ALLOWED_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function parsePDF(buffer: Buffer): Promise<ParseResult['metadata'] & { text: string }> {
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
      // Extract text from all pages
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((t) => {
          const rawText = t.R.map((r) => r.T).join('');
          try {
            return decodeURIComponent(rawText);
          } catch {
            // If URI decoding fails, return the raw text
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

function parseCSV(text: string): ParseResult['metadata'] & { text: string } {
  const result = Papa.parse(text, {
    header: false,
    skipEmptyLines: true,
  });

  // Convert to readable text format
  const rows = result.data as string[][];
  const formattedText = rows
    .map((row) => row.join('\t'))
    .join('\n');

  return {
    text: formattedText,
    rowCount: rows.length,
  };
}

function parseXLSX(buffer: Buffer): ParseResult['metadata'] & { text: string } {
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

function parseTXT(buffer: Buffer): ParseResult['metadata'] & { text: string } {
  return {
    text: buffer.toString('utf-8'),
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Determine file type from MIME type or extension
    let fileType = file.type;

    // Handle cases where MIME type might not be set correctly
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

    // Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported file type: ${fileType}. Allowed types: PDF, CSV, XLSX, TXT`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let result: ParseResult['metadata'] & { text: string };

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
        return NextResponse.json(
          { success: false, message: 'Unsupported file type' },
          { status: 400 }
        );
    }

    const parseResult: ParseResult = {
      text: result.text,
      fileName: file.name,
      fileType,
      metadata: {
        pageCount: result.pageCount,
        rowCount: result.rowCount,
        sheetNames: result.sheetNames,
      },
    };

    return NextResponse.json({
      success: true,
      data: parseResult,
    });
  } catch (error) {
    console.error('Error parsing file:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to parse file',
      },
      { status: 500 }
    );
  }
}
