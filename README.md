# Origin Energy – Playwright Automation Exercise

## Overview

This repository contains an automated UI test for the Origin Energy pricing page, implemented using Playwright with TypeScript and Page Object Model (POM) pattern.

### Scenarios covered:

- Searching for an address and verifying the plan table is displayed
- Unchecking Electricity option and verifying the plan table is displayed with only Natural gas options
- Opening the first plan PDF in a new browser tab
- Downloading the PDF and confirming it is a Gas plan

### Scenarios not covered:

- Bonus Task - run test inside Docker or Rancher

---

## Tech Stack

- Node.js
- Playwright
- TypeScript
- pdf-parse (for PDF content validation)

---

## Project Structure

```text
origin-playwright/
├── tests/
│   └── origin-energy-gas-plans.spec.ts
│
├── pages/
│   └── PricingPage.ts
│
├── utils/
│   └── PdfUtils.ts
│
├── data/
│   └── testData.ts
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

---

## Prerequisites

Ensure the following are installed on your machine:

- Node.js (latest LTS version)
- npm (comes with Node.js)

### Verify installation:

```bash
node -v
npm -v
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/akp10110/origin-playwright.git
cd origin-playwright
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

### 4. Run the tests

```bash
npx playwright test --headed --project=chromium
```

### 5. View test report

```bash
npx playwright show-report
```
