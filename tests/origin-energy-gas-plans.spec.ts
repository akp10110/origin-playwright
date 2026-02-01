import { test, expect, Page } from "@playwright/test";
import { PricingPage } from "../pages/PricingPage";
import { PdfUtils } from "../utils/PdfUtils";
import { TestData } from "../data/testData";

test.describe.serial("Origin Energy – Gas Plans", () => {
  let page: Page;
  let pricingPage: PricingPage;
  let pdfPage: Page;

  test("Load Origin pricing page and search for customer's address", async ({ browser }) => {
    page = await browser.newPage();
    pricingPage = new PricingPage(page);

    await pricingPage.goto();
    await pricingPage.searchAddress(TestData.address);
    await pricingPage.verifyPlansTableVisible();
  });

  test("should display energy plans for the given address", async () => {
    const energyTypes = await pricingPage.getEnergyTypes();
    expect(energyTypes).toContain(TestData.fuelTypes.gas);
    expect(energyTypes).toContain(TestData.fuelTypes.electricity);
  });

  test("should not display electricity plans when electricity checkbox is unchecked", async () => {
    await pricingPage.toggleElectricityCheckbox(true);

    const energyTypes = await pricingPage.getEnergyTypes();
    expect(energyTypes).toContain(TestData.fuelTypes.gas);
    expect(energyTypes).not.toContain(TestData.fuelTypes.electricity);
  });

  test("should open the selected plan PDF in a new tab", async () => {
    const context = page.context();
    const initialTabCount = context.pages().length;

    pdfPage = await pricingPage.openFirstPlanPdf();
    await expect(pdfPage).toHaveURL(/\.pdf$/);
    expect(context.pages().length).toBe(initialTabCount + 1);
  });

  test("should download the plan PDF and confirm it is a Gas plan", async () => {
    const pdfText = await PdfUtils.downloadAndParsePdf(pdfPage, "plan.pdf");

    PdfUtils.assertPdfContains(pdfText, TestData.pdfAssertions.gasPlan);
  });
});
