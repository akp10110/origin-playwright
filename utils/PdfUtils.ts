import { Page, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

export class PdfUtils {
  private static readonly DOWNLOADS_DIR = path.join(process.cwd(), "downloads");

  /**
   * Downloads and parses a PDF, returning the text content
   */
  static async downloadAndParsePdf(pdfPage: Page, fileName: string): Promise<string> {
    // Download PDF
    if (!fs.existsSync(this.DOWNLOADS_DIR)) {
      fs.mkdirSync(this.DOWNLOADS_DIR);
    }

    const pdfUrl = pdfPage.url();
    console.log("Actual PDF URL:", pdfUrl);

    const response = await pdfPage.context().request.get(pdfUrl);
    const pdfBuffer = await response.body();

    const pdfPath = path.join(this.DOWNLOADS_DIR, fileName);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Passe PDF and extract text
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(pdfBuffer);
    return pdfData.text;
  }

  /**
   * Asserts that the PDF text matches the expected pattern
   */
  static assertPdfContains(pdfText: string, pattern: RegExp | string): void {
    expect(pdfText).toMatch(pattern);
  }
}
