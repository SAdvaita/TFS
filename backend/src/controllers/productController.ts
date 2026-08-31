import { Response } from 'express';
import prisma from '../prisma/client.js';
import { logAudit } from '../utils/audit.js';

export async function getProducts(req: any, res: Response): Promise<void> {
  try {
    const { search, activeOnly } = req.query;

    const where: any = {};
    if (activeOnly === 'true') {
      where.isActive = true;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { capacity: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProductById(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export async function createProduct(req: any, res: Response): Promise<void> {
  try {
    const data = req.body;

    if (!data.name || !data.description || !data.capacity) {
      res.status(400).json({ error: 'Name, capacity, and description are required' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        capacity: data.capacity.trim(),
        description: data.description.trim(),
        defaultRefillingPrice: data.defaultRefillingPrice ? Number(data.defaultRefillingPrice) : null,
        defaultNewPrice: data.defaultNewPrice ? Number(data.defaultNewPrice) : null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        notes: data.notes?.trim() || null,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'PRODUCT_CREATED',
      recordType: 'PRODUCT',
      recordId: product.id,
      newValue: product,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProduct(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    const previous = await prisma.product.findUnique({ where: { id } });
    if (!previous) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        capacity: data.capacity !== undefined ? data.capacity.trim() : undefined,
        description: data.description !== undefined ? data.description.trim() : undefined,
        defaultRefillingPrice: data.defaultRefillingPrice !== undefined ? (data.defaultRefillingPrice !== null ? Number(data.defaultRefillingPrice) : null) : undefined,
        defaultNewPrice: data.defaultNewPrice !== undefined ? (data.defaultNewPrice !== null ? Number(data.defaultNewPrice) : null) : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
        notes: data.notes !== undefined ? data.notes.trim() : undefined,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'PRODUCT_UPDATED',
      recordType: 'PRODUCT',
      recordId: id,
      previousValue: previous,
      newValue: updated,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

export async function duplicateProduct(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const duplicated = await prisma.product.create({
      data: {
        name: `${existing.name} (Copy)`,
        capacity: existing.capacity,
        description: existing.description,
        defaultRefillingPrice: existing.defaultRefillingPrice,
        defaultNewPrice: existing.defaultNewPrice,
        notes: existing.notes,
      },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'PRODUCT_DUPLICATED',
      recordType: 'PRODUCT',
      recordId: duplicated.id,
      newValue: duplicated,
    });

    res.status(201).json(duplicated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to duplicate product' });
  }
}

export async function deleteProduct(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    // We soft-deactivate by default so references in UI or history are clean
    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await logAudit({
      userName: req.user?.name || 'TFS Admin',
      action: 'PRODUCT_DEACTIVATED',
      recordType: 'PRODUCT',
      recordId: id,
      newValue: updated,
    });

    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate product' });
  }
}
