import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const pgConfig: PostgresConnectionOptions = {
  // url: process.env.DATA_BASE_URI!,
  url: 'postgresql://neondb_owner:npg_Fysf61mXjrSK@ep-shiny-mode-af1ivdg1-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  type: 'postgres',
  port: 3306,
  // entities: [User],
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  synchronize: true,
};
console.log(process.env.DATA_BASE_URI, "DATA_BASE_URI");
