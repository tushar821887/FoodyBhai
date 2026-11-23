import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TiffinPlan, TiffinPlanDocument } from './schemas/tiffin-plan.schema';
import { TiffinOrder, TiffinOrderDocument } from './schemas/tiffin-order.schema';
import { TiffinConfig, TiffinConfigDocument } from './schemas/tiffin-config.schema';
import { CreateTiffinOrderDto } from './dto/create-tiffin-order.dto';
import { CreateTiffinPlanDto } from './dto/create-tiffin-plan.dto';

@Injectable()
export class TiffinService {
  private readonly logger = new Logger(TiffinService.name);

  constructor(
    @InjectModel(TiffinPlan.name) private planModel: Model<TiffinPlanDocument>,
    @InjectModel(TiffinOrder.name) private orderModel: Model<TiffinOrderDocument>,
    @InjectModel(TiffinConfig.name) private configModel: Model<TiffinConfigDocument>,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.planModel.countDocuments();
      if (count === 0) {
        this.logger.log('No tiffin plans found. Seeding initial plans...');
        await this.seedDefaultPlans();
      }
      const configCount = await this.configModel.countDocuments();
      if (configCount === 0) {
        this.logger.log('No tiffin config found. Seeding default config into database...');
        await this.seedDefaultConfig();
      }
    } catch (e) {
      this.logger.warn('Could not auto-seed tiffin:', e.message);
    }
  }

  // --- PLANS ---

  async findAllPlans(includeInactive: boolean = false): Promise<TiffinPlan[]> {
    const filter = includeInactive ? {} : { isActive: true };
    const plans = await this.planModel.find(filter).sort({ createdAt: -1 }).exec();
    if (plans.length === 0 && !includeInactive) {
      return this.seedDefaultPlans();
    }
    return plans;
  }

  async findPlanBySlug(slug: string): Promise<TiffinPlan> {
    const plan = await this.planModel.findOne({ slug }).exec();
    if (!plan) {
      throw new NotFoundException(`Tiffin plan with slug "${slug}" not found`);
    }
    return plan;
  }

  async createPlan(dto: CreateTiffinPlanDto): Promise<TiffinPlan> {
    let slug = dto.slug;
    if (!slug || slug.trim() === '') {
      slug = (dto.name || 'thali').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const existing = await this.planModel.findOne({ slug }).exec();
    if (existing) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }
    dto.slug = slug;

    if (!dto.weeklyPrice && dto.trialPrice) {
      dto.weeklyPrice = Math.round(dto.trialPrice * 6.5);
    }
    if (!dto.monthlyPrice && dto.trialPrice) {
      dto.monthlyPrice = Math.round(dto.trialPrice * 25);
    }

    const newPlan = new this.planModel({
      ...dto,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
    return newPlan.save();
  }

  async updatePlan(id: string, dto: Partial<CreateTiffinPlanDto>): Promise<TiffinPlan> {
    const updated = await this.planModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
    return updated;
  }

  async togglePlanStatus(id: string): Promise<TiffinPlan> {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
    plan.isActive = !plan.isActive;
    return plan.save();
  }

  async deletePlan(id: string): Promise<{ success: boolean }> {
    const deleted = await this.planModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
    return { success: true };
  }

  // --- ORDERS / SUBSCRIPTIONS ---

  async createOrder(dto: CreateTiffinOrderDto, userId?: string): Promise<TiffinOrder> {
    // Generate order ID: TF-YYMM-XXXX
    const now = new Date();
    const prefix = `TF-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `${prefix}-${randomSuffix}`;

    // Compute start & end date if not fully populated
    const startDateObj = new Date(dto.startDate || Date.now());
    let daysToAdd = 1;
    if (dto.subscriptionType === 'weekly') {
      daysToAdd = 7;
    } else if (dto.subscriptionType === 'monthly') {
      daysToAdd = 30;
    }
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + daysToAdd);

    const mealsCount = dto.subscriptionType === 'trial' 
      ? (dto.mealSlot === 'both' ? 2 : 1) 
      : (dto.subscriptionType === 'weekly' ? (dto.mealSlot === 'both' ? 14 : 7) : (dto.mealSlot === 'both' ? 60 : 30));

    const newOrder = new this.orderModel({
      ...dto,
      orderId,
      userId: userId || undefined,
      startDate: dto.startDate || startDateObj.toISOString().split('T')[0],
      endDate: dto.endDate || endDateObj.toISOString().split('T')[0],
      totalMeals: dto.totalMeals || mealsCount,
      paymentMethod: dto.paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'active',
    });

    return newOrder.save();
  }

  async findUserOrders(phone?: string, userId?: string, email?: string): Promise<TiffinOrder[]> {
    const conditions: any[] = [];
    if (userId) {
      conditions.push({ userId });
    }
    if (phone && phone.trim()) {
      const cleanPhone = phone.replace(/[\s\-\+]/g, '').slice(-10);
      conditions.push({ customerPhone: phone.trim() });
      if (cleanPhone) {
        conditions.push({ customerPhone: cleanPhone });
        conditions.push({ customerPhone: { $regex: cleanPhone, $options: 'i' } });
      }
    }
    if (email && email.trim()) {
      conditions.push({ customerEmail: { $regex: `^${email.trim()}$`, $options: 'i' } });
    }

    if (conditions.length === 0) {
      return [];
    }
    return this.orderModel.find({ $or: conditions }).sort({ createdAt: -1 }).exec();
  }

  async findAllOrders(): Promise<TiffinOrder[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).limit(100).exec();
  }

  async updateOrderStatus(id: string, status: 'active' | 'paused' | 'completed' | 'cancelled'): Promise<TiffinOrder> {
    const order = await this.orderModel.findOneAndUpdate(
      { $or: [{ _id: id }, { orderId: id }] },
      { status },
      { new: true }
    ).exec();
    if (!order) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }
    return order;
  }

  async updateOrderDetails(id: string, updates: any): Promise<TiffinOrder> {
    const allowed = ['mealSlot', 'deliveryAddress', 'specialInstructions', 'startDate', 'status', 'subscriptionType'];
    const updateObj: any = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        updateObj[key] = updates[key];
      }
    }
    const order = await this.orderModel.findOneAndUpdate(
      { $or: [{ _id: id }, { orderId: id }] },
      { $set: updateObj },
      { new: true }
    ).exec();
    if (!order) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }
    return order;
  }

  // --- SEED INITIAL PLANS ---

  async seedDefaultPlans(): Promise<TiffinPlan[]> {
    const defaultPlans = [
      {
        name: 'Rozana Mini Thali',
        slug: 'rozana-mini-thali',
        tagline: 'Light, healthy & pocket-friendly everyday meal',
        description: 'Ideal for students and light eaters looking for comforting homestyle food with minimal oil.',
        dietaryType: 'veg',
        mealType: 'both',
        trialPrice: 79,
        weeklyPrice: 499,
        monthlyPrice: 1899,
        perMealPrice: 65,
        items: [
          '3 Fresh Tawa Rotis (100% Whole Wheat)',
          'Dal Tadka / Homestyle Dal Fry',
          'Seasonal Sukhi Sabzi (Aloo Gobhi / Bhindi / Beans)',
          'Steamed Basmati Rice',
          'Fresh Green Salad & Pickle'
        ],
        features: [
          'Zero Preservatives & Low Oil',
          '100% Desi Homestyle Taste',
          'Sanitized 3-Compartment Dabba',
          'Daily Delivery on Time'
        ],
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isPopular: false,
        isBestValue: false,
        isActive: true,
        rating: 4.8,
        reviewsCount: 94,
        lunchDeliveryTime: '12:30 PM - 02:00 PM',
        dinnerDeliveryTime: '07:30 PM - 09:30 PM',
        weeklyMenu: [
          {
            day: 'Monday',
            lunch: { main: 'Aloo Methi', dal: 'Yellow Dal Tadka', breadRice: '3 Rotis + Steamed Rice', sides: 'Salad & Achar' },
            dinner: { main: 'Baingan Bharta', dal: 'Moong Dal', breadRice: '3 Rotis + Jeera Rice', sides: 'Salad' }
          },
          {
            day: 'Tuesday',
            lunch: { main: 'Mix Veg', dal: 'Dal Fry', breadRice: '3 Rotis + Steamed Rice', sides: 'Salad & Achar' },
            dinner: { main: 'Lauki Chana Dal', dal: 'Kadhi Pakora', breadRice: '3 Rotis + Rice', sides: 'Salad' }
          },
          {
            day: 'Wednesday',
            lunch: { main: 'Aloo Gobhi Masala', dal: 'Panchmel Dal', breadRice: '3 Rotis + Rice', sides: 'Salad & Achar' },
            dinner: { main: 'Matar Mushroom', dal: 'Arhar Dal', breadRice: '3 Rotis + Jeera Rice', sides: 'Salad' }
          },
          {
            day: 'Thursday',
            lunch: { main: 'Bhindi Masala', dal: 'Masoor Dal', breadRice: '3 Rotis + Rice', sides: 'Salad & Achar' },
            dinner: { main: 'Dum Aloo', dal: 'Moong Dal Chilka', breadRice: '3 Rotis + Rice', sides: 'Salad' }
          },
          {
            day: 'Friday',
            lunch: { main: 'Jeera Aloo', dal: 'Chole Gravy', breadRice: '3 Rotis + Steamed Rice', sides: 'Salad & Onion' },
            dinner: { main: 'Seasonal Greens (Saag/Palak)', dal: 'Dal Fry', breadRice: '3 Rotis + Rice', sides: 'Salad' }
          },
          {
            day: 'Saturday',
            lunch: { main: 'Kashmiri Rajma', dal: 'Yellow Dal', breadRice: '3 Rotis + Jeera Rice', sides: 'Salad & Achar' },
            dinner: { main: 'Kadhai Sabzi', dal: 'Dal Makhani', breadRice: '3 Rotis + Rice', sides: 'Salad' }
          },
          {
            day: 'Sunday',
            lunch: { main: 'Special Aloo Matar', dal: 'Dal Tadka', breadRice: '3 Rotis + Veg Pulao', sides: 'Sweet & Salad' },
            dinner: { main: 'Paneer Bhurji Gravy', dal: 'Yellow Dal', breadRice: '3 Rotis + Rice', sides: 'Salad' }
          }
        ]
      },
      {
        name: 'Ghar Jaisa Standard Thali',
        slug: 'ghar-jaisa-standard-thali',
        tagline: 'Meerut\'s Most Loved Homestyle Tiffin',
        description: 'A complete, balanced, nutritious meal prepared just like maa ke haath ka khana with pure desi ghee phulkas.',
        dietaryType: 'veg',
        mealType: 'both',
        trialPrice: 99,
        weeklyPrice: 649,
        monthlyPrice: 2399,
        perMealPrice: 80,
        items: [
          '4 Desi Ghee Soft Phulkas',
          'Rich Dal Fry / Dal Tadka',
          'Special Seasonal Sabzi (Paneer / Mix Veg / Gobhi)',
          'Fragrant Jeera Rice',
          'Fresh Cut Salad, Green Chutney & Pickle',
          'Curd / Raita (With Lunch)'
        ],
        features: [
          'Desi Ghee Basted Phulkas',
          '100% RO Water Cooking',
          'Daily Rotating Gourmet Menu',
          'Free Pause & Resume Anytime'
        ],
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        isPopular: true,
        isBestValue: true,
        isActive: true,
        rating: 4.9,
        reviewsCount: 312,
        lunchDeliveryTime: '12:30 PM - 02:00 PM',
        dinnerDeliveryTime: '07:30 PM - 09:30 PM',
        weeklyMenu: [
          {
            day: 'Monday',
            lunch: { main: 'Matar Paneer', dal: 'Arhar Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Boondi Raita + Salad + Achar' },
            dinner: { main: 'Aloo Shimla Mirch', dal: 'Dal Fry', breadRice: '4 Desi Ghee Phulkas + Steamed Rice', sides: 'Fresh Salad & Chutney' }
          },
          {
            day: 'Tuesday',
            lunch: { main: 'Delhi Style Rajma Masala', dal: 'Yellow Moong Dal', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Cucumber Raita + Sirka Onion' },
            dinner: { main: 'Lauki Kofta Curry', dal: 'Panchmel Dal', breadRice: '4 Desi Ghee Phulkas + Rice', sides: 'Fresh Salad & Pickle' }
          },
          {
            day: 'Wednesday',
            lunch: { main: 'Shahi Paneer', dal: 'Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Peas Pulao', sides: 'Mix Veg Raita + Salad' },
            dinner: { main: 'Methi Malai Matar', dal: 'Masoor Dal', breadRice: '4 Desi Ghee Phulkas + Steamed Rice', sides: 'Salad & Papad' }
          },
          {
            day: 'Thursday',
            lunch: { main: 'Punjabi Kadhi Pakora', dal: 'Arhar Dal Fry', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Papad + Salad + Pickle' },
            dinner: { main: 'Aloo Gobhi Adraki', dal: 'Chana Dal Fry', breadRice: '4 Desi Ghee Phulkas + Rice', sides: 'Fresh Green Salad' }
          },
          {
            day: 'Friday',
            lunch: { main: 'Amritsari Pindi Chole', dal: 'Dal Makhani', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Boondi Raita + Sirka Pyaz' },
            dinner: { main: 'Bhindi Do Pyaza', dal: 'Yellow Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Rice', sides: 'Salad & Achar' }
          },
          {
            day: 'Saturday',
            lunch: { main: 'Kadhai Paneer', dal: 'Moong Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Jeera Rice', sides: 'Veg Raita + Salad' },
            dinner: { main: 'Kashmiri Dum Aloo', dal: 'Dal Fry', breadRice: '4 Desi Ghee Phulkas + Steamed Rice', sides: 'Salad & Pickle' }
          },
          {
            day: 'Sunday',
            lunch: { main: 'Paneer Butter Masala', dal: 'Special Dal Makhani', breadRice: '4 Desi Ghee Phulkas + Matar Pulao', sides: 'Hot Gulab Jamun + Raita + Salad' },
            dinner: { main: 'Mix Vegetable Jalfrezi', dal: 'Dal Tadka', breadRice: '4 Desi Ghee Phulkas + Rice', sides: 'Salad & Chutney' }
          }
        ]
      },
      {
        name: 'Deluxe Shahi Thali',
        slug: 'deluxe-shahi-thali',
        tagline: 'The ultimate royal feast delivered daily',
        description: 'For those who want rich flavours every day. Includes double sabzi (one premium paneer dish), sweet, roasted papad, and gourmet raita.',
        dietaryType: 'veg',
        mealType: 'both',
        trialPrice: 139,
        weeklyPrice: 899,
        monthlyPrice: 3299,
        perMealPrice: 110,
        items: [
          '4 Desi Ghee Butter Phulkas',
          'Premium Paneer Dish (Paneer Lababdar / Butter Masala)',
          'Seasonal Special Dry Sabzi',
          'Special Dal (Dal Makhani / Panchmel Tadka)',
          'Gourmet Veg Biryani / Jeera Rice',
          'Flavoured Raita + Roasted Papad',
          'Daily Dessert (Gulab Jamun / Kheer / Halwa)'
        ],
        features: [
          'Double Sabzi with Daily Paneer',
          'Sweet Dish Included Every Meal',
          'Microwave-safe 5-compartment Dabba',
          'Priority VIP Express Delivery'
        ],
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        isPopular: false,
        isBestValue: false,
        isActive: true,
        rating: 5.0,
        reviewsCount: 178,
        lunchDeliveryTime: '12:30 PM - 02:00 PM',
        dinnerDeliveryTime: '07:30 PM - 09:30 PM',
        weeklyMenu: [
          {
            day: 'Monday',
            lunch: { main: 'Paneer Lababdar + Aloo Jeera', dal: 'Dal Makhani', breadRice: '4 Butter Phulkas + Veg Biryani', sides: 'Fruit Raita + Gulab Jamun + Papad' },
            dinner: { main: 'Kadhai Paneer + Mix Veg', dal: 'Dal Tadka', breadRice: '4 Butter Phulkas + Jeera Rice', sides: 'Boondi Raita + Rasgulla' }
          },
          {
            day: 'Tuesday',
            lunch: { main: 'Shahi Paneer + Bhindi Fry', dal: 'Dal Bukhara', breadRice: '4 Butter Phulkas + Peas Pulao', sides: 'Pineapple Raita + Gajar Halwa' },
            dinner: { main: 'Palak Paneer + Aloo Gobhi', dal: 'Dal Fry', breadRice: '4 Butter Phulkas + Steamed Rice', sides: 'Raita + Sweet' }
          },
          {
            day: 'Wednesday',
            lunch: { main: 'Paneer Butter Masala + Malai Kofta', dal: 'Panchmel Dal', breadRice: '4 Butter Phulkas + Shahi Pulao', sides: 'Dahi Bhalla + Kheer' },
            dinner: { main: 'Paneer Do Pyaza + Matar Mushroom', dal: 'Dal Tadka', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
          },
          {
            day: 'Thursday',
            lunch: { main: 'Paneer Pasanda + Dum Aloo', dal: 'Dal Makhani', breadRice: '4 Butter Phulkas + Jeera Rice', sides: 'Veg Raita + Moong Dal Halwa' },
            dinner: { main: 'Paneer Bhurji + Kashmiri Dum Aloo', dal: 'Dal Fry', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
          },
          {
            day: 'Friday',
            lunch: { main: 'Paneer Tikka Masala + Pindi Chole', dal: 'Yellow Dal Tadka', breadRice: '4 Butter Phulkas + Kashmiri Pulao', sides: 'Mint Raita + Gulab Jamun' },
            dinner: { main: 'Matar Paneer + Mushroom Masala', dal: 'Dal Makhani', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
          },
          {
            day: 'Saturday',
            lunch: { main: 'Handi Paneer + Soya Chaap Gravy', dal: 'Dal Tadka', breadRice: '4 Butter Phulkas + Jeera Rice', sides: 'Boondi Raita + Rasmalai' },
            dinner: { main: 'Paneer Makhani + Mix Veg Dry', dal: 'Dal Fry', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
          },
          {
            day: 'Sunday',
            lunch: { main: 'Royal Shahi Thali (Chef Special)', dal: 'Dal Makhani', breadRice: '4 Butter Phulkas + Special Biryani', sides: 'Double Sweet + Dahi Vada + Papad' },
            dinner: { main: 'Paneer Butter Masala + Aloo Shimla Mirch', dal: 'Dal Tadka', breadRice: '4 Butter Phulkas + Rice', sides: 'Raita + Sweet' }
          }
        ]
      },
      {
        name: 'High-Protein Fit Thali',
        slug: 'high-protein-fit-thali',
        tagline: 'Clean, macro-counted fuel for fitness enthusiasts',
        description: 'Specially crafted for gym-goers, athletes and conscious eaters. Packed with 35g+ pure vegetarian protein, low sodium, zero refined sugar.',
        dietaryType: 'veg',
        mealType: 'both',
        trialPrice: 129,
        weeklyPrice: 849,
        monthlyPrice: 3099,
        perMealPrice: 105,
        items: [
          '3 Multigrain / Oats Bran Phulkas',
          '120g Grilled Soya Chaap / High-Protein Paneer Bhurji',
          'Sprouted Moong & Chana Protein Bowl',
          'Thick Tadka Moong Dal (High Fiber)',
          'Organic Brown Rice / Quinoa Pulao',
          'Green Detox Salad with Lemon Dressing'
        ],
        features: [
          '35g+ Clean Vegetarian Protein',
          'Macro-friendly & Low Glycemic Index',
          'Cold Pressed Mustard / Olive Oil Cooking',
          'Detailed Macro-Nutrient Card Included'
        ],
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        isPopular: false,
        isBestValue: false,
        isActive: true,
        rating: 4.9,
        reviewsCount: 86,
        lunchDeliveryTime: '12:30 PM - 02:00 PM',
        dinnerDeliveryTime: '07:30 PM - 09:30 PM',
        weeklyMenu: [
          {
            day: 'Monday',
            lunch: { main: 'Low-Fat Paneer Bhurji (100g)', dal: 'Sprouted Moong Dal', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'Sprouts Salad + Lemon Wedge' },
            dinner: { main: 'Soya Chunk Masala', dal: 'Yellow Dal', breadRice: '3 Multigrain Rotis', sides: 'Cucumber Tomato Salad' }
          },
          {
            day: 'Tuesday',
            lunch: { main: 'Tofu / Paneer Stir Fry', dal: 'Black Chana Gravy', breadRice: '3 Multigrain Rotis + Quinoa Rice', sides: 'Boiled Chana Chaat' },
            dinner: { main: 'Mix Vegetable with Soya Grated', dal: 'Dal Tadka', breadRice: '3 Multigrain Rotis', sides: 'Green Salad' }
          },
          {
            day: 'Wednesday',
            lunch: { main: 'Grilled Paneer with Herbs', dal: 'Moong Chana Dal', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'Protein Sprouts Bowl' },
            dinner: { main: 'Soya Matar Gravy', dal: 'Masoor Dal', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
          },
          {
            day: 'Thursday',
            lunch: { main: 'Paneer Palak High Fiber', dal: 'Rajma Clean Gravy', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'High Protein Salad' },
            dinner: { main: 'Paneer Capsicum Saute', dal: 'Yellow Moong', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
          },
          {
            day: 'Friday',
            lunch: { main: 'Soya Chaap Tikka Roast', dal: 'Kabuli Chana (Low Salt)', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'Cucumber & Beetroot Salad' },
            dinner: { main: 'Paneer Bhurji with Methi', dal: 'Dal Tadka', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
          },
          {
            day: 'Saturday',
            lunch: { main: 'Tofu Paneer Veggie Medley', dal: 'Panchmel Dal', breadRice: '3 Multigrain Rotis + Brown Rice', sides: 'Sprouts + Lemon' },
            dinner: { main: 'Soya Chunks Curry', dal: 'Dal Fry', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
          },
          {
            day: 'Sunday',
            lunch: { main: 'High-Protein Paneer Tikka Feast', dal: 'Dal Tadka', breadRice: '3 Multigrain Rotis + Brown Pulao', sides: 'Protein Chaat + Fresh Fruits' },
            dinner: { main: 'Paneer Mushroom Saute', dal: 'Moong Dal', breadRice: '3 Multigrain Rotis', sides: 'Salad' }
          }
        ]
      }
    ];

    await this.planModel.deleteMany({});
    const created = await this.planModel.insertMany(defaultPlans);
    this.logger.log(`Successfully seeded ${created.length} tiffin plans.`);
    return created as unknown as TiffinPlan[];
  }

  // --- TIFFIN PAGE CMS & CONFIG ---

  async getTiffinConfig(): Promise<any> {
    let config: any = await this.configModel.findOne().exec();
    if (!config) {
      config = await this.seedDefaultConfig();
    }
    if (!config.weeklyMenu || !config.weeklyMenu.length) {
      if (config.weeklyMenuSection?.menu?.length) {
        config.weeklyMenu = config.weeklyMenuSection.menu;
      } else {
        config.weeklyMenu = this.getDefaultWeeklyMenu();
      }
    }
    return config;
  }

  async updateTiffinConfig(dto: any): Promise<any> {
    const existing = await this.configModel.findOne().exec();
    if (existing) {
      Object.assign(existing, dto);
      return existing.save();
    }
    const newConfig = new this.configModel(dto);
    return newConfig.save();
  }

  async seedDefaultConfig(): Promise<any> {
    await this.configModel.deleteMany({}).exec();
    const defaults = this.getDefaultTiffinConfig();
    const created = new this.configModel(defaults);
    return created.save();
  }

  getDefaultWeeklyMenu(): any[] {
    return [
      { day: 'Monday', lunch: { main: 'Shahi Paneer + Aloo Gobhi', dal: 'Dal Tadka', breadRice: '4 Phulkas + Jeera Rice', sides: 'Salad & Achar', price: 99, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Mix Veg Curry', dal: 'Moong Dal', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Tuesday', lunch: { main: 'Delhi Rajma Masala', dal: 'Yellow Moong Dal', breadRice: '4 Phulkas + Jeera Rice', sides: 'Boondi Raita', price: 99, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Lauki Kofta', dal: 'Panchmel Dal', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Wednesday', lunch: { main: 'Kadhai Paneer', dal: 'Dal Makhani', breadRice: '4 Phulkas + Peas Pulao', sides: 'Cucumber Raita', price: 109, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Aloo Methi', dal: 'Masoor Dal', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Thursday', lunch: { main: 'Punjabi Kadhi Pakora', dal: 'Arhar Dal', breadRice: '4 Phulkas + Jeera Rice', sides: 'Papad & Salad', price: 99, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Bhindi Masala', dal: 'Chana Dal', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Friday', lunch: { main: 'Amritsari Pindi Chole', dal: 'Dal Makhani', breadRice: '4 Phulkas + Kashmiri Pulao', sides: 'Mint Raita', price: 109, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Matar Mushroom', dal: 'Dal Tadka', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 99, time: '07:30 PM - 09:30 PM' } },
      { day: 'Saturday', lunch: { main: 'Paneer Butter Masala', dal: 'Moong Dal Tadka', breadRice: '4 Phulkas + Jeera Rice', sides: 'Veg Raita', price: 119, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Dum Aloo', dal: 'Dal Fry', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 89, time: '07:30 PM - 09:30 PM' } },
      { day: 'Sunday', lunch: { main: 'Chef Special Royal Thali', dal: 'Special Dal Makhani', breadRice: '4 Phulkas + Veg Biryani', sides: 'Gulab Jamun + Raita + Papad', price: 149, time: '12:30 PM - 02:00 PM' }, dinner: { main: 'Paneer Bhurji Gravy', dal: 'Dal Tadka', breadRice: '4 Phulkas + Rice', sides: 'Salad', price: 99, time: '07:30 PM - 09:30 PM' } }
    ];
  }

  getDefaultTiffinConfig(): any {
    const weekly = this.getDefaultWeeklyMenu();
    return {
      weeklyMenu: weekly,
      hero: {
        badge: "🍱 Meerut's #1 Homemade Tiffin Service",
        title: "Ghar Jaisa Swaad, <br><span class=\"highlight-text\">Delivered Fresh & Hot Daily!</span>",
        subtitle: "Say goodbye to greasy restaurant food and messy cooking. Enjoy nutritious, hygienic, and authentic home-style Indian meals prepared with pure desi ghee phulkas, 100% RO water, and zero artificial preservatives. Order once or subscribe daily with 1-click pause anytime.",
        usps: [
          "Desi Ghee Phulkas",
          "Free On-Time Delivery",
          "Order Once or Subscribe",
          "100% RO Cooking"
        ],
        heroImage: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
        ratingText: "4.9 / 5.0",
        ratingSubtitle: "Trusted by 1,500+ students & professionals in Meerut",
        lunchDeliveryTime: "Hot Lunch: 12:30 - 2 PM",
        startingPriceText: "₹79 / meal",
        orderBtnText: "Order Thali / Choose Plan",
        menuBtnText: "View Weekly Menu"
      },
      sectionHeader: {
        tag: "Instant Order & Subscriptions",
        title: "Our Handcrafted Thalis & Meal Plans",
        desc: "Add any thali directly to your cart for an instant meal, customize with extra items from our menu, or subscribe for weekly/monthly delivery."
      },
      weeklyMenuSection: {
        tag: "Chef's Special Rotation",
        title: "See What's Cooking This Week",
        desc: "We never repeat the same gravies back-to-back! Experience a diverse, authentic homestyle spread crafted fresh every single day.",
        jainNote: "Jain options (no onion, no garlic) available for all meals upon request during checkout.",
        menu: [
          {
            day: "Monday",
            lunch: { main: "Aloo Methi", dal: "Yellow Dal Tadka", breadRice: "3 Rotis + Steamed Rice", sides: "Salad & Achar", time: "12:30 PM - 02:00 PM" },
            dinner: { main: "Baingan Bharta", dal: "Moong Dal", breadRice: "3 Rotis + Jeera Rice", sides: "Salad", time: "07:30 PM - 09:30 PM" }
          },
          {
            day: "Tuesday",
            lunch: { main: "Mix Veg", dal: "Dal Fry", breadRice: "3 Rotis + Steamed Rice", sides: "Salad & Achar", time: "12:30 PM - 02:00 PM" },
            dinner: { main: "Lauki Chana Dal", dal: "Kadhi Pakora", breadRice: "3 Rotis + Rice", sides: "Salad", time: "07:30 PM - 09:30 PM" }
          },
          {
            day: "Wednesday",
            lunch: { main: "Aloo Gobhi Masala", dal: "Panchmel Dal", breadRice: "3 Rotis + Rice", sides: "Salad & Achar", time: "12:30 PM - 02:00 PM" },
            dinner: { main: "Matar Mushroom", dal: "Arhar Dal", breadRice: "3 Rotis + Jeera Rice", sides: "Salad", time: "07:30 PM - 09:30 PM" }
          },
          {
            day: "Thursday",
            lunch: { main: "Bhindi Masala", dal: "Masoor Dal", breadRice: "3 Rotis + Rice", sides: "Salad & Achar", time: "12:30 PM - 02:00 PM" },
            dinner: { main: "Paneer Bhurji", dal: "Dal Tadka", breadRice: "3 Rotis + Jeera Rice", sides: "Salad & Papad", time: "07:30 PM - 09:30 PM" }
          },
          {
            day: "Friday",
            lunch: { main: "Dum Aloo Kashmiri", dal: "Chana Dal Fry", breadRice: "3 Rotis + Rice", sides: "Salad & Chutney", time: "12:30 PM - 02:00 PM" },
            dinner: { main: "Chole Masala", dal: "Yellow Dal", breadRice: "3 Rotis + Steamed Rice", sides: "Onion Salad & Pickle", time: "07:30 PM - 09:30 PM" }
          },
          {
            day: "Saturday",
            lunch: { main: "Rajma Masala Special", dal: "Moong Dal", breadRice: "3 Rotis + Steamed Basmati Rice", sides: "Raita & Salad", time: "12:30 PM - 02:00 PM" },
            dinner: { main: "Kadhai Paneer", dal: "Dal Fry", breadRice: "3 Rotis + Jeera Rice", sides: "Salad & Dessert", time: "07:30 PM - 09:30 PM" }
          },
          {
            day: "Sunday",
            lunch: { main: "Shahi Paneer Weekend Feast", dal: "Dal Makhani", breadRice: "4 Butter Phulkas + Veg Pulao", sides: "Boondi Raita + Gulab Jamun", time: "12:30 PM - 02:00 PM" },
            dinner: { main: "Sev Tamatar / Malai Kofta", dal: "Panchmel Dal", breadRice: "3 Butter Phulkas + Rice", sides: "Salad", time: "07:30 PM - 09:30 PM" }
          }
        ]
      },
      howItWorks: {
        tag: "Hassle-Free Process",
        title: "How FoodyBhai Tiffin Works",
        desc: "Delicious home-cooked food delivered to your door in 3 simple steps",
        steps: [
          {
            stepNumber: 1,
            title: "Choose Plan or Thali",
            description: "Pick your favourite thali. Add directly to cart with extra menu add-ons, or subscribe for weekly/monthly delivery.",
            icon: "fa-solid fa-bowl-food"
          },
          {
            stepNumber: 2,
            title: "Select Address & Meal Time",
            description: "Enter your delivery address in Meerut and pick whether you want Lunch, Dinner, or Both delivered daily.",
            icon: "fa-solid fa-map-location-dot"
          },
          {
            stepNumber: 3,
            title: "Enjoy Piping Hot Food",
            description: "Our delivery partners drop hot, leak-proof food at your doorstep. Pause or skip anytime with zero penalty.",
            icon: "fa-solid fa-truck-fast"
          }
        ]
      },
      trustHighlights: [
        {
          title: "100% RO Water Cooking",
          description: "Every vegetable is sanitized and all cooking uses pure multi-stage RO water.",
          icon: "fa-solid fa-droplet"
        },
        {
          title: "Pure Desi Ghee Phulkas",
          description: "Warm phulkas made on traditional tawa, basted with genuine desi ghee, never palm oil.",
          icon: "fa-solid fa-fire-burner"
        },
        {
          title: "Spill-Proof Microwave Dabba",
          description: "Food-grade 5-compartment eco containers. Convenient, leak-proof, and easy to reheat.",
          icon: "fa-solid fa-box-open"
        },
        {
          title: "Pause Anytime Feature",
          description: "Going out for the weekend? Pause your subscription with 1 message. Meals are never wasted.",
          icon: "fa-solid fa-pause"
        }
      ],
      faqSection: {
        tag: "Got Questions?",
        title: "Frequently Asked Questions",
        desc: "Everything you need to know about our tiffin & thali service in Meerut",
        faqs: [
          {
            q: "How does the daily delivery schedule work?",
            a: "We deliver Lunch between 12:30 PM - 02:00 PM and Dinner between 07:30 PM - 09:30 PM hot in temperature-retaining sealed dabbas. Delivery is 100% free across covered zones in Meerut."
          },
          {
            q: "Can I pause or skip days if I am traveling?",
            a: "Yes! You can pause or resume your plan anytime directly or via WhatsApp with just 2 hours prior notice. Your skipped days are never lost—they are automatically credited and extended at the end of your billing cycle."
          },
          {
            q: "Can I order a single thali without subscribing?",
            a: "Yes! Click 'Add to Cart' on any thali card to order a single hot meal right away, and you can even customize it with extra breads, paneer curries, drinks, or sweets from our menu."
          },
          {
            q: "Is the food hygienic and prepared like ghar ka khana?",
            a: "Absolutely. We use 100% RO purified water, cold-pressed oils, pure Amul Desi Ghee for phulkas, zero MSG, and zero artificial preservatives. It tastes just like maa ke haath ka khana."
          },
          {
            q: "Do you offer pure Jain meals (no onion, no garlic)?",
            a: "Yes! We prepare authentic satvik / Jain meals on separate dedicated cookware. Simply select or mention 'Jain' during your booking."
          }
        ],
        supportBanner: {
          title: "Need a custom tiffin plan or corporate bulk catering?",
          desc: "Call or WhatsApp our kitchen team directly for special dietary arrangements or office orders.",
          phone: "+91 8218870579"
        }
      },
      addons: [
        { id: 'addon-roti-2', name: 'Extra Desi Ghee Phulkas (Set of 2)', category: 'Breads', price: 25, description: '100% whole wheat tawa rotis with pure desi ghee', icon: '🫓' },
        { id: 'addon-dal-cup', name: 'Extra Cup of Dal Tadka (250ml)', category: 'Curries & Dals', price: 49, description: 'Yellow arhar dal tempered with cumin, garlic & desi ghee', icon: '🥣' },
        { id: 'addon-paneer-cup', name: 'Extra Paneer Butter Masala (250ml)', category: 'Curries & Dals', price: 89, description: 'Rich creamy tomato gravy with fresh malai paneer cubes', icon: '🍛' },
        { id: 'addon-gulab-jamun', name: 'Hot Gulab Jamun (2 Pcs)', category: 'Desserts & Sweets', price: 35, description: 'Soft melt-in-mouth mawa jamuns in cardamom sugar syrup', icon: '🍨' },
        { id: 'addon-buttermilk', name: 'Masala Chaas / Buttermilk (300ml)', category: 'Sides & Drinks', price: 25, description: 'Chilled spiced digestive buttermilk with roasted jeera & mint', icon: '🥤' },
        { id: 'addon-raita', name: 'Boondi Raita (200ml)', category: 'Sides & Drinks', price: 30, description: 'Creamy spiced curd with crispy gram flour pearls', icon: '🥗' },
        { id: 'addon-papad', name: 'Roasted Lijjat Papad (2 Pcs)', category: 'Sides & Drinks', price: 15, description: 'Crispy urad dal spiced papad roasted on flame', icon: '🫓' }
      ]
    };
  }
}
