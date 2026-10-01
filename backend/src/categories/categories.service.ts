
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().sort({ createdAt: -1 }).exec();
  }

  async create(data: any): Promise<CategoryDocument> {
    const created = new this.categoryModel(data);
    return created.save();
  }

  async update(id: string, data: any): Promise<CategoryDocument> {
    return this.categoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
