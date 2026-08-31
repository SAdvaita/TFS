import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import * as authCtrl from '../controllers/authController.js';
import * as settingsCtrl from '../controllers/settingsController.js';
import * as customerCtrl from '../controllers/customerController.js';
import * as productCtrl from '../controllers/productController.js';
import * as invoiceCtrl from '../controllers/invoiceController.js';
import * as licenseCtrl from '../controllers/licenseController.js';
import * as dcCtrl from '../controllers/dcController.js';
import * as fireDrillCtrl from '../controllers/fireDrillController.js';
import * as reportsCtrl from '../controllers/reportsController.js';
import * as excelCtrl from '../controllers/excelController.js';
import * as auditCtrl from '../controllers/auditController.js';

const router = Router();

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for license files and company logos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

const uploadMemory = multer({ storage: multer.memoryStorage() });

// --- AUTH ---
router.post('/auth/login', authCtrl.login);
router.get('/auth/profile', authenticateToken as any, authCtrl.getProfile);
router.post('/auth/change-password', authenticateToken as any, authCtrl.changePassword);

// --- SETTINGS ---
router.get('/settings', authenticateToken as any, settingsCtrl.getSettings);
router.put('/settings', authenticateToken as any, settingsCtrl.updateSettings);

// --- CUSTOMERS ---
router.get('/customers', authenticateToken as any, customerCtrl.getCustomers);
router.get('/customers/check-duplicate', authenticateToken as any, customerCtrl.checkDuplicateCustomer);
router.get('/customers/:id', authenticateToken as any, customerCtrl.getCustomerById);
router.get('/customers/:id/history', authenticateToken as any, customerCtrl.getCustomerHistory);
router.post('/customers', authenticateToken as any, customerCtrl.createCustomer);
router.put('/customers/:id', authenticateToken as any, customerCtrl.updateCustomer);
router.delete('/customers/:id', authenticateToken as any, customerCtrl.deleteCustomer);

// --- PRODUCTS ---
router.get('/products', authenticateToken as any, productCtrl.getProducts);
router.get('/products/:id', authenticateToken as any, productCtrl.getProductById);
router.post('/products', authenticateToken as any, productCtrl.createProduct);
router.post('/products/:id/duplicate', authenticateToken as any, productCtrl.duplicateProduct);
router.put('/products/:id', authenticateToken as any, productCtrl.updateProduct);
router.delete('/products/:id', authenticateToken as any, productCtrl.deleteProduct);

// --- INVOICES & QUOTATIONS ---
router.get('/invoices', authenticateToken as any, invoiceCtrl.getInvoices);
router.get('/invoices/:id', authenticateToken as any, invoiceCtrl.getInvoiceById);
router.post('/invoices', authenticateToken as any, invoiceCtrl.createInvoice);
router.put('/invoices/:id', authenticateToken as any, invoiceCtrl.updateInvoice);
router.post('/invoices/:id/finalize', authenticateToken as any, invoiceCtrl.finalizeInvoice);
router.post('/invoices/:id/cancel', authenticateToken as any, invoiceCtrl.cancelInvoice);
router.post('/invoices/:id/clone', authenticateToken as any, invoiceCtrl.cloneInvoice);
router.get('/invoices/:id/download-word', authenticateToken as any, invoiceCtrl.downloadWordInvoice);

// --- LICENSES ---
router.get('/licenses', authenticateToken as any, licenseCtrl.getLicenses);
router.get('/licenses/alerts', authenticateToken as any, licenseCtrl.getLicenseAlerts);
router.post('/licenses', authenticateToken as any, licenseCtrl.createLicense);
router.put('/licenses/:id', authenticateToken as any, licenseCtrl.updateLicense);
router.delete('/licenses/:id', authenticateToken as any, licenseCtrl.deleteLicense);
router.post('/licenses/:id/files', authenticateToken as any, upload.array('files', 10), licenseCtrl.uploadLicenseFiles);
router.delete('/licenses/files/:fileId', authenticateToken as any, licenseCtrl.deleteLicenseFile);

// --- DC (DELIVERY CHALLAN) ---
router.get('/dc', authenticateToken as any, dcCtrl.getDcDocuments);
router.get('/dc/:id', authenticateToken as any, dcCtrl.getDcDocumentById);
router.post('/dc', authenticateToken as any, dcCtrl.createDcDocument);
router.put('/dc/:id', authenticateToken as any, dcCtrl.updateDcDocument);

// --- FIRE DRILL REPORTS ---
router.get('/fire-drills', authenticateToken as any, fireDrillCtrl.getFireDrillReports);
router.get('/fire-drills/:id', authenticateToken as any, fireDrillCtrl.getFireDrillReportById);
router.post('/fire-drills', authenticateToken as any, fireDrillCtrl.createFireDrillReport);
router.put('/fire-drills/:id', authenticateToken as any, fireDrillCtrl.updateFireDrillReport);

// --- REPORTS & DASHBOARD ---
router.get('/reports/dashboard', authenticateToken as any, reportsCtrl.getDashboardStats);
router.get('/reports/product-usage', authenticateToken as any, reportsCtrl.getProductUsageReport);

// --- EXCEL IMPORT / EXPORT ---
router.get('/excel/export', authenticateToken as any, excelCtrl.exportExcel);
router.post('/excel/import', authenticateToken as any, uploadMemory.single('file'), excelCtrl.importExcel);

// --- AUDIT LOGS ---
router.get('/audit-logs', authenticateToken as any, auditCtrl.getAuditLogs);

export default router;
