import { CacheModule, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModuleModule } from "../config-module/config-module.module";
import { ConfigServiceProvider } from "../config-module/config-module.service";
import { ConfigModule } from "@nestjs/config";
import { MacMiddleware } from "../middlewares/mac.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
      //ORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) => config.createUnitTestDBOptions(),
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
  ],
  exports: [UnitTestModule]
})
export class UnitTestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MacMiddleware)
      .forRoutes("*");
  }
}
