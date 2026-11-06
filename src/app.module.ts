import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseOptions, validateEnvironment } from './config/environment';
import { AuthModule } from './auth/auth.module';
import { MusicModule } from './music/music.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        ...databaseOptions(process.env),
        synchronize: false,
        retryAttempts: 3,
        retryDelay: 1000,
      }),
    }),
    AuthModule,
    MusicModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
