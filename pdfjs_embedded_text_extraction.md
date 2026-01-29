# PDF Embedded Text Extraction (PDF.js → Arbitrary JSON)

## Purpose

This document explains how we extract **embedded text** from PDFs using **PDF.js** and convert it into an **arbitrary, schema-less JSON structure** suitable for downstream processing by an LLM.

This approach is designed to:
- Work in **Next.js + Vercel Serverless**
- Handle **many PDF formats** (reports, plans, brochures, layout-heavy documents)
- Preserve **layout information** (coordinates, font hints)
- Avoid OCR unless absolutely necessary

The output JSON is intentionally flexible and normalized later by an LLM.

---

## Why PDF.js (Not OCR)

Most modern PDFs contain **embedded text objects**, not images.

PDF.js allows us to:
- Extract text **losslessly**
- Preserve **layout and spatial position**
- Avoid OCR inaccuracies and cost
- Run entirely in **Node.js serverless environments**

OCR is only used as a fallback for scanned PDFs.

---

## High-Level Flow

1. Receive PDF (file upload or URL)
2. Load PDF using PDF.js (worker disabled for serverless)
3. Iterate page-by-page
4. Extract raw text items and layout data
5. Emit loose JSON
6. Send JSON to an LLM for interpretation and normalization

---

## What “Embedded Text” Means

PDF text is not stored as paragraphs or tables.

Instead, PDFs store:
- Individual **glyph runs**
- Positioned via a **transform matrix**
- Rendered visually by coordinates

PDF.js exposes these as `textContent.items[]`.

Each item typically includes:
- `str` – the rendered text
- `transform` – `[a, b, c, d, e, f]` matrix
- `width`, `height`
- `fontName` (optional)

Each item is treated as a **layout atom**.

---

## Coordinate System

Important details:
- PDF coordinate origin is **bottom-left**
- `transform[4]` → x position
- `transform[5]` → y position
- Viewport provides a consistent coordinate space

We preserve these coordinates **without interpretation**.

This enables later steps to:
- Reconstruct tables
- Group rows and columns
- Detect headers, weeks, or sections
- Infer layout-driven structure

---

## JSON Output Philosophy

### Goals
- Self-describing
- Schema-less
- Deterministic
- LLM-friendly

### Non-Goals
- Perfect semantics
- Domain assumptions
- Table reconstruction
- Normalization

All interpretation is deferred.

---

## Example Output Shape (Illustrative)

```json
{
  "meta": {
    "numPages": 3,
    "heuristics": {
      "likelyScanned": false
    }
  },
  "pages": [
    {
      "pageNumber": 1,
      "text": "This 16-week training plan is aimed at novice marathon runners...",
      "items": [
        {
          "str": "WEEK 1",
          "x": 42.1,
          "y": 780.4,
          "width": 48.2,
          "height": 12.0,
          "fontName": "Helvetica-Bold"
        }
      ]
    }
  ]
}
```

Notes:
- `text` is a convenience field for fast LLM ingestion
- `items` preserve spatial truth
- Consumers may ignore either

---

## Detecting Scanned PDFs

A simple heuristic is applied:
- Compute average characters per page
- If extremely low (e.g. < 50 chars/page), flag as scanned

```json
"heuristics": {
  "likelyScanned": true
}
```

Scanned PDFs can then be routed to:
- OCR
- Vision-based parsing
- Or a separate pipeline

---

## Why We Avoid a Schema at This Stage

Schemas encode **domain assumptions**.

At extraction time, we do not yet know:
- What constitutes a row or column
- What text is decorative vs meaningful
- What structure the document represents

LLMs are better suited to:
- Interpret layout
- Normalize meaning
- Map content into domain models

Our responsibility here is **faithful capture**, not interpretation.

---

## Where Interpretation Happens

Downstream:
- Cluster items by Y-axis → rows
- Cluster by X-axis → columns
- Detect repeating patterns → tables
- Normalize language → durations, enums, concepts

Usually via:
- An LLM prompt
- Or lightweight heuristics + LLM refinement

---

## Summary

- PDF.js extracts what the PDF actually contains
- We preserve text and layout, not assumptions
- Output JSON is flexible by design
- OCR is a fallback, not the default
- LLMs handle meaning and normalization

This separation keeps the pipeline robust, extensible, and easy to reason about.
