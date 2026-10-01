const fs = require('fs');
const path = require('path');

const dir = 'backend/src/categories';
fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(path.join(dir, 'schemas'), { recursive: true });

// Schema
fs.writeFileSync(path.join(dir, 'schemas', 'category.schema.ts'), `
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true, toJSON: { transform: (doc: any, ret: any) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; } } })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
`);

// Service
fs.writeFileSync(path.join(dir, 'categories.service.ts'), `
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

  async remove(id: string): Promise<any> {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
`);

// Controller
fs.writeFileSync(path.join(dir, 'categories.controller.ts'), `
import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: any) {
    return this.categoriesService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
`);

// Module
fs.writeFileSync(path.join(dir, 'categories.module.ts'), `
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category, CategorySchema } from './schemas/category.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
`);

// Inject into AppModule
const appModulePath = 'backend/src/app.module.ts';
let appModule = fs.readFileSync(appModulePath, 'utf8');
appModule = appModule.replace(/import \{ AgentsModule \} from '\.\/agents\/agents\.module';/, `import { AgentsModule } from './agents/agents.module';\nimport { CategoriesModule } from './categories/categories.module';`);
appModule = appModule.replace(/AgentsModule,/, `AgentsModule,\n    CategoriesModule,`);
fs.writeFileSync(appModulePath, appModule);

