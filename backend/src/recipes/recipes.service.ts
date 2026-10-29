import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recipe, RecipeDocument } from './schemas/recipe.schema';

@Injectable()
export class RecipesService implements OnModuleInit {
  constructor(@InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>) {}

  private cleanRecipeHtml(html?: string): string {
    if (!html) return '';
    return html
      .replace(/<div[^>]*>[\s\S]*?(?:Chef's Ingredients|Chef's Recipe Ingredients|Ingredients & Spices)[\s\S]*?<\/ul>[\s\S]*?<\/div>/gi, '')
      .replace(/<h[1-6][^>]*>[\s\S]*?(?:Chef's Ingredients|Chef's Recipe Ingredients|Ingredients & Spices)[\s\S]*?<\/h[1-6]>(\s*<ul[^>]*>[\s\S]*?<\/ul>)?/gi, '')
      .replace(/<p>\s*(<br\s*\/?>|&nbsp;|\s)*<\/p>/gi, '')
      .trim();
  }

  async onModuleInit() {
    try {
      const recipes = await this.recipeModel.find({ recipeHtml: /Chef's Ingredients/i }).exec();
      if (recipes && recipes.length > 0) {
        for (const recipe of recipes) {
          recipe.recipeHtml = this.cleanRecipeHtml(recipe.recipeHtml);
          await recipe.save();
        }
      }
    } catch (e) {}
  }

  async findAll(): Promise<RecipeDocument[]> {
    const recipes = await this.recipeModel.find().exec();
    for (const r of recipes) {
      if (r.recipeHtml) {
        r.recipeHtml = this.cleanRecipeHtml(r.recipeHtml);
      }
    }
    return recipes;
  }

  async findBySlug(slug: string): Promise<RecipeDocument> {
    const recipe = await this.recipeModel.findOne({ slug }).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with slug ${slug} not found`);
    }
    if (recipe.recipeHtml) {
      recipe.recipeHtml = this.cleanRecipeHtml(recipe.recipeHtml);
    }
    return recipe;
  }

  private normalizeArrayField(val: any): string[] {
    if (Array.isArray(val)) {
      return val.map((s: any) => String(s).trim()).filter((s: string) => s.length > 0);
    }
    if (typeof val === 'string') {
      return val.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    }
    return [];
  }

  async create(recipeData: any): Promise<RecipeDocument> {
    // Generate a unique numeric ID if none provided
    if (!recipeData.id) {
      const highestRecipe = await this.recipeModel.findOne().sort('-id').exec();
      recipeData.id = highestRecipe && highestRecipe.id ? highestRecipe.id + 1 : 1;
    }
    
    // Generate slug from title if missing
    if (!recipeData.slug && recipeData.title) {
      recipeData.slug = recipeData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (recipeData.recipeHtml !== undefined) {
      recipeData.recipeHtml = this.cleanRecipeHtml(recipeData.recipeHtml);
    }
    if (recipeData.ingredients !== undefined) {
      recipeData.ingredients = this.normalizeArrayField(recipeData.ingredients);
    }
    if (recipeData.instructions !== undefined) {
      recipeData.instructions = this.normalizeArrayField(recipeData.instructions);
    }
    if (recipeData.tips !== undefined) {
      recipeData.tips = this.normalizeArrayField(recipeData.tips);
    }

    const createdRecipe = new this.recipeModel(recipeData);
    return createdRecipe.save();
  }

  async update(id: string, updateData: any): Promise<RecipeDocument> {
    // Allow finding by MongoDB _id or numeric id
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { id: Number(id) };
    
    if (updateData.recipeHtml !== undefined) {
      updateData.recipeHtml = this.cleanRecipeHtml(updateData.recipeHtml);
    }
    if (updateData.ingredients !== undefined) {
      updateData.ingredients = this.normalizeArrayField(updateData.ingredients);
    }
    if (updateData.instructions !== undefined) {
      updateData.instructions = this.normalizeArrayField(updateData.instructions);
    }
    if (updateData.tips !== undefined) {
      updateData.tips = this.normalizeArrayField(updateData.tips);
    }

    const updatedRecipe = await this.recipeModel.findOneAndUpdate(
      filter,
      updateData,
      { new: true }
    ).exec();

    if (!updatedRecipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }
    return updatedRecipe;
  }

  async remove(id: string): Promise<any> {
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { id: Number(id) };
    const result = await this.recipeModel.deleteOne(filter).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }
    return { success: true, message: 'Recipe deleted' };
  }

  async toggleStock(id: string, inStock?: boolean): Promise<RecipeDocument> {
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { id: Number(id) };
    const recipe = await this.recipeModel.findOne(filter);
    if (!recipe) {
      throw new NotFoundException('Recipe with id ' + id + ' not found');
    }
    const newStock = inStock !== undefined ? inStock : (recipe.inStock === false ? true : false);
    recipe.inStock = newStock;
    return recipe.save();
  }
}
