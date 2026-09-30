import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async getCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
      await cart.save();
    }
    return cart;
  }

  async updateCart(userId: string, items: any[]): Promise<CartDocument> {
    const cart = await this.cartModel.findOneAndUpdate(
      { userId },
      { items },
      { new: true, upsert: true }
    );
    return cart;
  }
}
