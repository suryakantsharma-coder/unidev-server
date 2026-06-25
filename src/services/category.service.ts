import { Category, ICategory } from '../models/Category.model';

export interface CategoryInput {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export async function createCategory(input: CategoryInput): Promise<ICategory> {
  const existing = await Category.findOne({ name: { $regex: `^${input.name}$`, $options: 'i' } });
  if (existing) {
    throw Object.assign(new Error('Category with this name already exists'), { statusCode: 409 });
  }
  return Category.create(input);
}

export async function listCategories(includeInactive = false) {
  const query = includeInactive ? {} : { isActive: true };
  return Category.find(query).sort({ name: 1 }).lean();
}

export async function getCategory(id: string): Promise<ICategory> {
  const cat = await Category.findById(id);
  if (!cat) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  return cat;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<ICategory> {
  if (input.name) {
    const conflict = await Category.findOne({
      name: { $regex: `^${input.name}$`, $options: 'i' },
      _id: { $ne: id },
    });
    if (conflict) {
      throw Object.assign(new Error('Category name already taken'), { statusCode: 409 });
    }
  }
  const cat = await Category.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!cat) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  return cat;
}

export async function deleteCategory(id: string): Promise<void> {
  const cat = await Category.findByIdAndDelete(id);
  if (!cat) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
}
