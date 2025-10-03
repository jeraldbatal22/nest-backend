import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
// import dbConfig from './config/db.config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes it available everywhere
      envFilePath: ['.env', '.env.development', '.env.production'],
      validationSchema: Joi.object({
        DATA_BASE_URI: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        PORT: Joi.number().default(3000),
      }),
      // load: [dbConfig],
    }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: (): TypeOrmModuleOptions => dbConfig(),
    // }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        url: configService.get<string>('DATA_BASE_URI'),
        port: configService.get<number>('DB_PORT', 5432),
        entities: [`${path.resolve(__dirname, '..')}/**/*.entity{.ts,.js}`],
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
