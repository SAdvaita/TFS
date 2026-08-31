import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma/client.js';
import { logAudit } from '../utils/audit.js';

export async function getLicenses(req: any, res: Response): Promise<void> {
  try {
    const { customerId, status, search } = req.query;

    const where: any = {};
    if (customerId) where.customerId = String(customerId);
    if (status && status !== 'ALL') where.status = String(status);

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { licenseType: { contains: q } },
        { licenseNumber: { contains: q } },
        { customer: { name: { contains: q } } },
      ];
    }

    const licenses = await prisma.license.findMany({
      where,
      include: {
        customer: true,
        files: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    res.json(licenses);
  } catch (error) {
    console.error('Error fetching licenses:', error);
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
}

export async function getLicenseAlerts(req: any, res: Response): Promise<void> {
  try {
    const licenses = await prisma.license.findMany({
      include: { customer: true, files: true },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const expired: any[] = [];
    const expiringIn7Days: any[] = [];
    const expiringIn30Days: any[] = [];
    const expiringIn90Days: any[] = [];
    const active: any[] = [];

    for (const lic of licenses) {
      let expDate: Date | null = null;
      if (lic.rawExpiryDate) {
        expDate = new Date(lic.rawExpiryDate);
      } else if (lic.expiryDate) {
        const parts = lic.expiryDate.split('.');
        if (parts.length === 3) {
          expDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          expDate = new Date(lic.expiryDate);
        }
      }

      if (!expDate || isNaN(expDate.getTime())) {
        active.push(lic);
        continue;
      }

      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        expired.push({ ...lic, diffDays });
      } else if (diffDays <= 7) {
        expiringIn7Days.push({ ...lic, diffDays });
      } else if (diffDays <= 30) {
        expiringIn30Days.push({ ...lic, diffDays });
      } else if (diffDays <= 90) {
        expiringIn90Days.push({ ...lic, diffDays });
      } else {
        active.push({ ...lic, diffDays });
      }
    }

    res.json({
      counts: {
        expired: expired.length,
        expiringIn7Days: expiringIn7Days.length,
        expiringIn30Days: expiringIn30Days.length,
        expiringIn90Days: expiringIn90Days.length,
        active: active.length,
        total: licenses.length,
      },
      expired,
      expiringIn7Days,
      expiringIn30Days,
      expiringIn90Days,
    });
  } catch (error) {
    console.error('Error calculating license alerts:', error);
    res.status(500).json({ error: 'Failed to fetch license alerts' });
  }
}

export async function createLicense(req: any, res: Response): Promise<void> {
  try {
    const { customerId, licenseType, licenseNumber, issueDate, expiryDate, notes } = req.body;

    if (!customerId || !licenseType || !licenseNumber || !expiryDate) {
      res.status(400).json({ error: 'Customer, License Type, Number, and Expiry Date are required' });
      return;
    }

    let rawExpiryDate: Date | null = null;
    const parts = expiryDate.split('.');
    if (parts.length === 3) {
      rawExpiryDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }

    const license = await prisma.license.create({
      data: {
        customerId,
        licenseType: licenseType.trim(),
        licenseNumber: licenseNumber.trim(),
        issueDate: issueDate ? issueDate.trim() : null,
        expiryDate: expiryDate.trim(),
        rawExpiryDate,
        notes: notes?.trim() || null,
        status: 'ACTIVE',
      },
      include: {
        customer: true,
        files: true,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'LICENSE_CREATED',
      recordType: 'LICENSE',
      recordId: license.id,
      details: `License ${license.licenseType} (${license.licenseNumber}) created for ${license.customer.name}`,
      newValue: license,
    });

    res.status(201).json(license);
  } catch (error) {
    console.error('Error creating license:', error);
    res.status(500).json({ error: 'Failed to create license' });
  }
}

export async function updateLicense(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { licenseType, licenseNumber, issueDate, expiryDate, notes, status } = req.body;

    let rawExpiryDate: Date | undefined = undefined;
    if (expiryDate) {
      const parts = expiryDate.split('.');
      if (parts.length === 3) {
        rawExpiryDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }

    const updated = await prisma.license.update({
      where: { id },
      data: {
        licenseType: licenseType !== undefined ? licenseType.trim() : undefined,
        licenseNumber: licenseNumber !== undefined ? licenseNumber.trim() : undefined,
        issueDate: issueDate !== undefined ? issueDate.trim() : undefined,
        expiryDate: expiryDate !== undefined ? expiryDate.trim() : undefined,
        rawExpiryDate,
        notes: notes !== undefined ? notes.trim() : undefined,
        status: status !== undefined ? status : undefined,
      },
      include: { customer: true, files: true },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'LICENSE_UPDATED',
      recordType: 'LICENSE',
      recordId: id,
      newValue: updated,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update license' });
  }
}

export async function deleteLicense(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.license.delete({ where: { id } });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'LICENSE_DELETED',
      recordType: 'LICENSE',
      recordId: id,
    });

    res.json({ message: 'License deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete license' });
  }
}

export async function uploadLicenseFiles(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params; // licenseId
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const fileRecords = await Promise.all(
      files.map((file) =>
        prisma.licenseFile.create({
          data: {
            licenseId: id,
            fileName: file.filename,
            originalName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype,
            fileSize: file.size,
          },
        })
      )
    );

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'LICENSE_FILES_UPLOADED',
      recordType: 'LICENSE_FILE',
      recordId: id,
      details: `Uploaded ${files.length} files to license ${id}`,
    });

    res.status(201).json(fileRecords);
  } catch (error) {
    console.error('Error uploading license files:', error);
    res.status(500).json({ error: 'Failed to upload license files' });
  }
}

export async function deleteLicenseFile(req: any, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;
    const file = await prisma.licenseFile.findUnique({ where: { id: fileId } });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Attempt to remove from disk
    const filePath = path.join(process.cwd(), 'uploads', file.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting file from disk:', err);
      }
    }

    await prisma.licenseFile.delete({ where: { id: fileId } });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'LICENSE_FILE_DELETED',
      recordType: 'LICENSE_FILE',
      recordId: fileId,
      details: `Deleted file ${file.originalName}`,
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete license file' });
  }
}
