import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AgentsModule } from './agents/agents.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { RecipesModule } from './recipes/recipes.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        const logger = new Logger('MongooseModule');

        if (!uri) {
          logger.error(
            'MONGODB_URI is not defined in environment variables',
          );
          throw new Error(
            'MONGODB_URI is not defined. Please check your .env file.',
          );
        }

        logger.log('Connecting to MongoDB Atlas...');

        return {
          uri,
          connectionFactory: (connection: any) => {
            connection.on('connected', () => {
              logger.log('✅ Successfully connected to MongoDB Atlas');
            });
            connection.on('error', (error: any) => {
              logger.error('❌ MongoDB connection error:', error.message);
            });
            connection.on('disconnected', () => {
              logger.warn('⚠️ MongoDB disconnected');
            });
            return connection;
          },
        };
      },
    }),

    AuthModule,
    UsersModule,
    AgentsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    RecipesModule,
    SettingsModule
  ],
})
export class AppModule {}
