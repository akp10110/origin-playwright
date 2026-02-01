import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("Origin Test", async ({ page }) => {
  // Navigate to Origin Energy pricing page
  await page.goto("https://www.originenergy.com.au/pricing.html");
  await expect(page).toHaveTitle("Compare Electricity and Gas Prices - Origin Energy");

  // Search for address
  const addressInputField = page.locator("#address-lookup");
  await addressInputField.fill("17 Bolinda Road, Balwyn North, VIC 3104");

  // Wait for at least one suggestion and select the first option
  const firstOption = page.getByRole("option").first();
  await firstOption.waitFor({ state: "visible", timeout: 10000 });
  await firstOption.click();

  // Wait for green tick to be displayed in the address field
  const greenTickIcon = page.locator('[data-id="IconCheckCircle"]');
  await greenTickIcon.waitFor({ state: "visible", timeout: 10000 });

  // Verify that energy plan table is displayed
  const plansTable = page.locator('[data-id="plan-info-table-desktop"]');
  await expect(plansTable).toBeVisible();

  // Get all values from the Energy type column (2nd column)
  const energyTypeCells = plansTable.locator('tr[data-id^="row-"] td:nth-child(2)');
  let energyTypes = await energyTypeCells.allTextContents();

  // Verify that both "Natural gas" and "Electricity" are present
  expect(energyTypes.some((text) => text.includes("Natural gas"))).toBeTruthy();
  expect(energyTypes.some((text) => text.includes("Electricity"))).toBeTruthy();

  // Uncheck the "Electricity" checkbox
  const electricityCheckbox = page.getByRole("checkbox", { name: "Electricity" });
  await expect(electricityCheckbox).toBeChecked();
  await electricityCheckbox.uncheck();
  await greenTickIcon.waitFor({ state: "visible", timeout: 10000 });

  // Verify that energy plan table is displayed
  await expect(plansTable).toBeVisible();

  // Get all values from the Energy type column (2nd column)
  // and verify that only "Natural gas" plans are displayed
  energyTypes = await energyTypeCells.allTextContents();
  expect(energyTypes.some((text) => text.includes("Natural gas"))).toBeTruthy();
  expect(energyTypes.some((text) => text.includes("Electricity"))).toBeFalsy();

  // Find the total number of tabs before clicking the PDF link
  const context = page.context();
  const initialTabCount = context.pages().length;

  // Click on the PDF link of the first plan
  const firstPlanLink = plansTable.locator('tr[data-id^="row-"] td:nth-child(3) a').first();
  const [pdfPage] = await Promise.all([page.context().waitForEvent("page"), firstPlanLink.click()]);
  await pdfPage.waitForLoadState();

  // Verify that a new tab is opened with a PDF URL
  const pdfUrl = pdfPage.url();
  expect(pdfUrl).toMatch(/\.pdf$/);

  // Verify that the number of tabs has increased by 1
  const finalTabCount = context.pages().length;
  expect(finalTabCount).toBe(initialTabCount + 1);

  // Extract PDF href from the link
  const pdfHref = await firstPlanLink.getAttribute("href");
  expect(pdfHref).not.toBeNull();
  expect(pdfHref).toMatch(/\.pdf$/);

  await pdfPage.waitForLoadState("networkidle");

  // Download PDF
  const downloadsDir = path.join(process.cwd(), "downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
  }

  const response = await pdfPage.context().request.get(pdfUrl);
  const pdfBuffer = await response.body();

  const pdfPath = path.join(downloadsDir, "plan.pdf");
  fs.writeFileSync(pdfPath, pdfBuffer);

  // Parse the PDF
  const pdfParse = require("pdf-parse");
  const pdfData = await pdfParse(pdfBuffer);

  // Verify that the PDF content contains "Fuel Type Gas"
  expect(pdfData.text).toMatch(/Fuel Type\s*Gas/i);
});
