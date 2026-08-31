# TRUE FIRE SOLUTION (TFS)
# Business Management & Invoicing Application (Web + Android Mobile)

## Overview
A comprehensive business management application for **TRUE FIRE SOLUTION (TFS)** to centralize customer records, manage product descriptions, automate consecutive bill numbers, issue Delivery Challans, store customer fire safety licenses, and generate print-ready invoices and quotations that **pixel-accurately match the official TFS reference document format**.

---

## Key Features & Modules

1. **Exact TFS Invoice Reproduction**:
   - Matches official TFS layout: TFS Red & Gold Badge Logo, Customer details grid, top-right `INVOICE` box with `BILL NO` & `DATE`, 7-column Product Table (`SI. No.`, `Product Description`, `Capacity`, `Refilling Price`, `New Price`, `Qty.`, `Total Rs.`).
   - Dynamic dashes (`---------`) automatically inserted into the opposite price column depending on whether "Refill" or "New" is chosen.
   - Auto arithmetic, Subtotal, Delivery/Installation/Other charges, optional GST (hidden when OFF), and Amount in Words in Indian English format (e.g. `TOTAL ( NINE HUNDRED ONLY )`).
   - Terms & Conditions and Bank Details in red (`State Bank of India, Alapakkam Branch`), `SURESH S` signature, and official footer.

2. **Quotations Module (PROFORMA)**:
   - Identical master document format, but heading dynamically changes to **`PROFORMA`** and the Bill No area remains blank.

3. **Split Data Entry & Live A4 Preview**:
   - When creating an invoice, entry controls are on the left and a live A4 preview updates in real-time on the right.

4. **Historical Invoice Immutability**:
   - Finalized invoices store frozen snapshots of customer, company, bank, and product data. Updating master records never modifies past invoices.

5. **Invoice Cloning**:
   - 1-click cloning of prior customer invoices for annual refilling repeat billing.

6. **Customer Master & Yearly History**:
   - Customer profile with duplicate detection and an invoice history hierarchy (`Year` -> `Month` -> `Invoices`).

7. **Product Description Master**:
   - Pre-saved reusable technical fire extinguisher chemical descriptions with default refill and new pricing.

8. **License Vault**:
   - Separate customer license section supporting multi-file uploads (PDF, DOCX, JPG, PNG) with dashboard expiry alerts (<7 days, <30 days, <90 days, expired).

9. **DC (Delivery Challan) Module**:
   - Dispatch slip generator with configurable items and customer fields.

10. **Fire Drill Report Module**:
    - Pre-built module to record mock evacuation drills, participant counts, observations, and safety recommendations.

11. **Excel Export & Migration Import**:
    - 5-Sheet Excel workbook export (`INVOICE SUMMARY`, `INVOICE ITEMS`, `CUSTOMERS`, `LICENSES`, `AUDIT LOG`).
    - Excel import wizard to migrate legacy `.xlsx` files.

12. **Permanent Audit Log**:
    - Immutable audit trail recording every login, invoice creation, finalization, clone, and export.

13. **TFS Android App**:
    - React Native / Expo app connecting to the same centralized backend database with touch-optimized invoice creation and PDF sharing.

---

## Quick Start (How to Run)

### 1. Start Both Backend & Web App (One-Click)
Double-click **`start.bat`** in the project root directory.

Or run manually:

#### Backend API (Port 5000):
```bash
cd backend
npm run dev
```

#### Web Frontend (Port 5173):
```bash
cd web
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Default Login Credentials
- **Email / Username**: `admin@truefiresolution.com` (or `admin`)
- **Password**: `admin123`

---

## Running the Android Mobile App
```bash
cd mobile
npm start
```
- Press `a` in the terminal to open on Android Emulator, or scan the QR code with **Expo Go** on your Android phone.
