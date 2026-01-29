/**
 * Test script to parse a PDF file and output the reconstructed table structure.
 *
 * Usage:
 *   pnpm tsx scripts/test/pdf/parse-pdf.ts <path-to-pdf>
 *
 * Example:
 *   pnpm tsx scripts/test/pdf/parse-pdf.ts ./Marathon-Training-Plan-Advanced-DK.pdf
 *
 * Output:
 *   - Writes full JSON with items and reconstructed text to pdf_parsed_output.json
 *   - Writes just the reconstructed markdown tables to pdf_parsed_output.md
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// Dynamic import to handle ESM module
async function getDocumentProxyImport() {
  const { getDocumentProxy } = await import('unpdf');
  return getDocumentProxy;
}

interface PDFTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
}

interface PDFPageData {
  pageNumber: number;
  text: string;
  items: PDFTextItem[];
}

/**
 * Detect column boundaries by clustering X positions of text items.
 */
function detectColumnBoundaries(items: PDFTextItem[], tolerance = 30): number[] {
  if (items.length === 0) return [];

  const xPositions = items.map(i => i.x).sort((a, b) => a - b);
  const clusters: { center: number; count: number }[] = [];

  for (const x of xPositions) {
    const nearestCluster = clusters.find(c => Math.abs(c.center - x) < tolerance);
    if (nearestCluster) {
      nearestCluster.center = (nearestCluster.center * nearestCluster.count + x) / (nearestCluster.count + 1);
      nearestCluster.count++;
    } else {
      clusters.push({ center: x, count: 1 });
    }
  }

  const minClusterSize = Math.max(2, items.length * 0.02);
  const significantClusters = clusters
    .filter(c => c.count >= minClusterSize)
    .sort((a, b) => a.center - b.center);

  const boundaries: number[] = [0];
  for (let i = 0; i < significantClusters.length - 1; i++) {
    boundaries.push((significantClusters[i].center + significantClusters[i + 1].center) / 2);
  }
  boundaries.push(Infinity);

  return boundaries;
}

function getColumnIndex(x: number, boundaries: number[]): number {
  for (let i = 0; i < boundaries.length - 1; i++) {
    if (x >= boundaries[i] && x < boundaries[i + 1]) {
      return i;
    }
  }
  return boundaries.length - 2;
}

function groupIntoRows(items: PDFTextItem[], yTolerance = 8): PDFTextItem[][] {
  if (items.length === 0) return [];

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

function looksLikeHeader(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;

  const alphaChars = trimmed.replace(/[^a-zA-Z]/g, '');
  if (alphaChars.length > 2 && alphaChars === alphaChars.toUpperCase()) {
    return true;
  }

  const headerPatterns = [
    /^(week|day|date|time|workout|exercise|session|phase|notes?|am|pm|rest)$/i,
    /^(mon|tue|wed|thu|fri|sat|sun)/i,
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
  ];

  return headerPatterns.some(p => p.test(trimmed));
}

function formatAsMarkdownTable(cells: string[][], columnCount: number): string {
  if (cells.length === 0) return '';

  const lines: string[] = [];

  const normalizedCells = cells.map(row => {
    const normalized = [...row];
    while (normalized.length < columnCount) {
      normalized.push('');
    }
    return normalized.slice(0, columnCount);
  });

  const headerRow = normalizedCells[0];
  lines.push('| ' + headerRow.map(c => c.replace(/\|/g, '\\|').replace(/\n/g, ' ').trim() || ' ').join(' | ') + ' |');
  lines.push('|' + headerRow.map(() => '---').join('|') + '|');

  for (let i = 1; i < normalizedCells.length; i++) {
    const row = normalizedCells[i];
    lines.push('| ' + row.map(c => c.replace(/\|/g, '\\|').replace(/\n/g, ' ').trim() || ' ').join(' | ') + ' |');
  }

  return lines.join('\n');
}

function reconstructTableStructure(items: PDFTextItem[], yTolerance = 8): string {
  if (items.length === 0) return '';

  const rows = groupIntoRows(items, yTolerance);
  const columnBoundaries = detectColumnBoundaries(items);
  const columnCount = columnBoundaries.length - 1;
  const isLikelyTable = columnCount >= 2 && rows.length >= 3;

  if (!isLikelyTable) {
    const lines: string[] = [];
    for (const row of rows) {
      row.sort((a, b) => a.x - b.x);
      lines.push(row.map(item => item.str).join(' '));
    }
    return lines.join('\n');
  }

  const tableCells: string[][] = [];

  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    const cellContents: string[] = new Array(columnCount).fill('');

    for (const item of row) {
      const colIndex = getColumnIndex(item.x, columnBoundaries);
      if (colIndex >= 0 && colIndex < columnCount) {
        if (cellContents[colIndex]) {
          cellContents[colIndex] += ' ' + item.str.trim();
        } else {
          cellContents[colIndex] = item.str.trim();
        }
      }
    }

    tableCells.push(cellContents);
  }

  const firstRowContent = tableCells[0] || [];
  const hasHeaderRow = firstRowContent.some(cell => looksLikeHeader(cell));

  if (hasHeaderRow) {
    return formatAsMarkdownTable(tableCells, columnCount);
  }

  const genericHeaders = new Array(columnCount).fill(0).map((_, i) => `Col ${i + 1}`);
  const withHeaders = [genericHeaders, ...tableCells];
  return formatAsMarkdownTable(withHeaders, columnCount);
}

async function parsePDF(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const data = new Uint8Array(buffer);
  const getDocumentProxy = await getDocumentProxyImport();
  const doc = await getDocumentProxy(data);

  const pages: PDFPageData[] = [];
  let fullMarkdown = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const items: PDFTextItem[] = [];

    for (const item of textContent.items) {
      if ('str' in item && item.str) {
        const transform = item.transform as number[];
        const x = transform[4];
        const y = viewport.height - transform[5];

        items.push({
          str: item.str,
          x,
          y,
          width: item.width,
          height: item.height,
          fontName: item.fontName,
        });
      }
    }

    const structuredText = reconstructTableStructure(items);

    pages.push({
      pageNumber: i,
      text: structuredText,
      items,
    });

    fullMarkdown += `## Page ${i}\n\n${structuredText}\n\n`;
  }

  return {
    fileName: path.basename(filePath),
    pageCount: doc.numPages,
    pages,
    fullMarkdown,
  };
}

async function main() {
  const pdfPath = process.argv[2];

  if (!pdfPath) {
    console.error('Usage: npx tsx scripts/test/pdf/parse-pdf.ts <path-to-pdf>');
    process.exit(1);
  }

  if (!fs.existsSync(pdfPath)) {
    console.error(`File not found: ${pdfPath}`);
    process.exit(1);
  }

  console.log(`Parsing PDF: ${pdfPath}`);

  const result = await parsePDF(pdfPath);

  // Write JSON output (includes items and reconstructed text)
  const jsonOutput = {
    fileName: result.fileName,
    pageCount: result.pageCount,
    pages: result.pages.map(p => ({
      pageNumber: p.pageNumber,
      reconstructedText: p.text,
      itemCount: p.items.length,
      items: p.items,
    })),
  };

  fs.writeFileSync('pdf_parsed_output.json', JSON.stringify(jsonOutput, null, 2));
  console.log('✓ Wrote pdf_parsed_output.json');

  // Write markdown output (just the reconstructed tables)
  fs.writeFileSync('pdf_parsed_output.md', `# ${result.fileName}\n\n${result.fullMarkdown}`);
  console.log('✓ Wrote pdf_parsed_output.md');

  // Also print the markdown to console
  console.log('\n--- Reconstructed Content ---\n');
  console.log(result.fullMarkdown);
}

main().catch(console.error);
