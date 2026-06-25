import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as categoryService from '../services/category.service';

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = categorySchema.parse(req.body);
    const category = await categoryService.createCategory(input);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await categoryService.listCategories(includeInactive);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.getCategory(req.params.id);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = categorySchema.partial().parse(req.body);
    const category = await categoryService.updateCategory(req.params.id, input);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}
