import { Page, Locator, expect } from "@playwright/test";

export class PricingPage {
  readonly page: Page;

  // Locators - Address search section
  readonly addressInputField: Locator;
  readonly addressFirstSuggestionOption: Locator;
  readonly addressGreenTickIcon: Locator;
  readonly electricityCheckbox: Locator;

  // Locators - Energy plans table section
  readonly plansTable: Locator;
  readonly energyTypeColumn: Locator;
  readonly firstPlanPdfLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators for address search section
    this.addressInputField = page.locator("#address-lookup");
    this.addressFirstSuggestionOption = page.getByRole("option").first();
    this.addressGreenTickIcon = page.locator('[data-id="IconCheckCircle"]');
    this.electricityCheckbox = page.getByRole("checkbox", { name: "Electricity" });

    // Initialize locators for energy plans table section
    this.plansTable = page.locator('[data-id="plan-info-table-desktop"]');
    this.energyTypeColumn = this.plansTable.locator('tr[data-id^="row-"] td:nth-child(2)');
    this.firstPlanPdfLink = this.plansTable.locator('tr[data-id^="row-"] td:nth-child(3) a').first();
  }

  async goto() {
    await this.page.goto("https://www.originenergy.com.au/pricing.html");
    await expect(this.page).toHaveTitle("Compare Electricity and Gas Prices - Origin Energy");
  }

  async searchAddress(address: string) {
    await this.addressInputField.fill(address);
    await this.addressFirstSuggestionOption.waitFor({ state: "visible" });
    await this.addressFirstSuggestionOption.click();
    await this.addressGreenTickIcon.waitFor({ state: "visible" });
  }

  async toggleElectricityCheckbox(uncheck: boolean) {
    if (uncheck) {
      await expect(this.electricityCheckbox).toBeChecked();
      await this.electricityCheckbox.uncheck();
    } else {
      await expect(this.electricityCheckbox).not.toBeChecked();
      await this.electricityCheckbox.check();
    }
    await this.addressGreenTickIcon.waitFor({ state: "visible" });
  }

  async verifyPlansTableVisible() {
    await expect(this.plansTable).toBeVisible();
  }

  async getEnergyTypes(): Promise<string[]> {
    return await this.energyTypeColumn.allTextContents();
  }

  async openFirstPlanPdf(): Promise<Page> {
    const [pdfPage] = await Promise.all([this.page.context().waitForEvent("page"), this.firstPlanPdfLink.click()]);
    await pdfPage.waitForLoadState();
    return pdfPage;
  }
}
