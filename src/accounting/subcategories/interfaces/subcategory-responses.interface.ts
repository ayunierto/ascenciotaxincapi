import { ExceptionResponse } from 'src/common/interfaces';
import { Subcategory } from '../entities/subcategory.entity';

export type GetSubcategoryResponse = Subcategory | ExceptionResponse;
export type GetSubcategoriesResponse = Subcategory[] | ExceptionResponse;
export type CreateSubcategoryResponse = Subcategory | ExceptionResponse;
export type UpdateSubcategoryResponse = Subcategory | ExceptionResponse;
export type DeleteSubcategoryResponse = Subcategory | ExceptionResponse;
