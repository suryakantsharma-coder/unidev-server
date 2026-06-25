import { ICategory } from '../models/Category.model';
export interface CategoryInput {
    name: string;
    description?: string;
    color?: string;
    isActive?: boolean;
}
export declare function createCategory(input: CategoryInput): Promise<ICategory>;
export declare function listCategories(includeInactive?: boolean): Promise<(import("mongoose").FlattenMaps<ICategory> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function getCategory(id: string): Promise<ICategory>;
export declare function updateCategory(id: string, input: Partial<CategoryInput>): Promise<ICategory>;
export declare function deleteCategory(id: string): Promise<void>;
//# sourceMappingURL=category.service.d.ts.map