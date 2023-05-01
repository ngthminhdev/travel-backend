import { CacheModule, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModuleModule } from "./config-module/config-module.module";
import { ConfigServiceProvider } from "./config-module/config-module.service";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { DeviceIdMiddleware } from "./middlewares/device-id.middleware";
import { AhpModule } from "./ahp/ahp.module";
import { QueueModule } from "./queue/queue.module";
import { CityEntity } from "./models/city.entity";
import { DistrictEntity } from "./models/district.entity";
import { WardEntity } from "./models/ward.entity";

@Module({
  imports: [
    //env
    ConfigModule.forRoot({ isGlobal: true }),

    //ORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) =>
        config.createTypeOrmOptions(),
      inject: [ConfigServiceProvider]
    }),
    TypeOrmModule.forFeature([CityEntity, DistrictEntity, WardEntity]),

    //jwt
    JwtModule.registerAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) => config.createJwtOptions(),
      inject: [ConfigServiceProvider]
    }),

    //redis
    CacheModule.registerAsync({
      imports: [ConfigModuleModule],
      useFactory: async (config: ConfigServiceProvider) => {
        return await config.createRedisOptions();
      },
      isGlobal: true,
      inject: [ConfigServiceProvider]
    }),

    //application
    AuthModule,
    UserModule,
    AhpModule,
    QueueModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(DeviceIdMiddleware)
      .forRoutes("*")
      // .apply(SignVerifyMiddleware)
      // .forRoutes("*");
  }
}
