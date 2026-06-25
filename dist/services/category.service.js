"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = createCategory;
exports.listCategories = listCategories;
exports.getCategory = getCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const Category_model_1 = require("../models/Category.model");
async function createCategory(input) {
    const existing = await Category_model_1.Category.findOne({ name: { $regex: `^${input.name}$`, $options: 'i' } });
    if (existing) {
        throw Object.assign(new Error('Category with this name already exists'), { statusCode: 409 });
    }
    return Category_model_1.Category.create(input);
}
async function listCategories(includeInactive = false) {
    const query = includeInactive ? {} : { isActive: true };
    return Category_model_1.Category.find(query).sort({ name: 1 }).lean();
}
async function getCategory(id) {
    const cat = await Category_model_1.Category.findById(id);
    if (!cat)
        throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    return cat;
}
async function updateCategory(id, input) {
    if (input.name) {
        const conflict = await Category_model_1.Category.findOne({
            name: { $regex: `^${input.name}$`, $options: 'i' },
            _id: { $ne: id },
        });
        if (conflict) {
            throw Object.assign(new Error('Category name already taken'), { statusCode: 409 });
        }
    }
    const cat = await Category_model_1.Category.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!cat)
        throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    return cat;
}
async function deleteCategory(id) {
    const cat = await Category_model_1.Category.findByIdAndDelete(id);
    if (!cat)
        throw Object.assign(new Error('Category not found'), { statusCode: 404 });
}
//# sourceMappingURL=category.service.js.map