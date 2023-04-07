import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication, ValidationError, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AuthModule } from "./auth.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceEntity } from "./entities/device.entity";
import { UserEntity } from "../user/entities/user.entity";
import * as process from "process";
import { RegisterDto } from "./dto/register.dto";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { ExceptionResponse } from "../exceptions/common.exception";
import { UtilCommonTemplate } from "../utils/utils.common";
import * as cookieParser from "cookie-parser";
import { DeviceGuard } from "../guards/device.guard";
import { UserResponse } from "../user/responses/user.response";
import { RealIpMiddleware } from "../middlewares/real-ip.middleware";
import { UnitTestModule } from "../unit-test/unit-test.module";

describe("AuthModule", () => {
  let app: INestApplication;
  let deviceGuard: DeviceGuard;

  let authModule: AuthModule;
  let authController: AuthController;
  let authService: AuthService;

  let userService: UserService;
  let user: UserResponse;
  let refreshToken: string;

  const mockUser: RegisterDto = {
    account_name: "tentaikhoan",
    username: "Nguyễn Văn A",
    email: "example@email.com",
    phone: "0343892050",
    password: process.env.UNIT_TEST_PASSWORD,
    confirm_password: process.env.UNIT_TEST_PASSWORD
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UserModule,
        UnitTestModule,
        TypeOrmModule.forFeature([DeviceEntity, UserEntity])
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtService, RealIpMiddleware]
    })
      .overrideGuard(DeviceGuard)
      .useValue(deviceGuard)
      .compile();

    app = moduleRef.createNestApplication();

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      exceptionFactory(errors: ValidationError[]) {
        return new ExceptionResponse(
          HttpStatus.BAD_REQUEST,
          UtilCommonTemplate.getMessageValidator(errors)
        );
      }
    }));

    authController = app.get<AuthController>(AuthController);
    authModule = app.get<AuthModule>(AuthModule);
    authService = app.get<AuthService>(AuthService);

    userService = app.get<UserService>(UserService);
    await app.listen(parseInt(process.env.SERVER_PORT));
  });

  afterAll(async () => {
    await authService.delete();
    await userService.delete();
    await app.close();
  });

  it("authModule should be defined", (): void => {
    expect(authModule).toBeDefined();
  });

  it("authController should be defined", (): void => {
    expect(authController).toBeDefined();
  });

  it("authService should be defined", (): void => {
    expect(authService).toBeDefined();
  });

  describe("POST /auth/register", (): void => {
    it("should return error that validated input data failed", async () => {
      const validateData: RegisterDto = {
        account_name: "tentai khoan",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: process.env.UNIT_TEST_PASSWORD
      };
      const res: request.Response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(validateData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        status: HttpStatus.BAD_REQUEST,
        message: "account_name is not valid,email must be an email,phone not found,password too weak,confirm password must match the password",
        data: null
      });
    });

    it("should register a new user", async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post(`/auth/register`)
        .send(mockUser)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        status: HttpStatus.CREATED,
        message: "register successfully",
        data: null
      });
    });

    it("should return error that account registered", async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(mockUser)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toEqual({
        status: HttpStatus.BAD_REQUEST,
        message: "account_name is already registered",
        data: null
      });
    });
  });

  describe("POST /auth/login", (): void => {
    it("should be return error that account_name is not registered", async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post(`/auth/login`)
        .send({
          account_name: "not_registered_account",
          password: mockUser.password
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message", "account_name is not registered");
    });

    it("should be return error that account_name or password is not correct", async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post(`/auth/login`)
        .send({
          account_name: mockUser.account_name,
          password: mockUser.account_name
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message", "account_name or password is not correct");
    });

    it("should be return user info and access token, set refreshToken at cookie", async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post(`/auth/login`)
        .send({
          account_name: mockUser.account_name,
          password: mockUser.password
        })
        .expect(HttpStatus.OK);

      const expectedFields = {
        access_token: expect.any(String),
        user_id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        phone: expect.any(String),
        address: expect.any(String),
        date_of_birth: expect.any(String),
        role: expect.any(Number),
        is_verified: expect.any(Number)
      };


      expect(response.body.data).toEqual(expect.objectContaining(expectedFields));
      expect(response.headers["set-cookie"][0]).toEqual(expect.stringContaining("refreshToken"));

      user = response.body.data;
      refreshToken = response.headers["set-cookie"][0].split(";")[0].split("=")[1];
    });
  });

  describe("POST /auth/refresh-token", (): void => {
    it("should return an error that device is not valid", async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Authorization", "Bearer invalid_token")
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toHaveProperty("message", "device is not valid");
    });

    it("should return an error that refresh token not found", async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Authorization", "Bearer " + user.access_token)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("message", "refresh token not found");
    });

    it("should return new access token", async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .withCredentials(true)
        .set("Authorization", "Bearer " + user.access_token)
        .set("Cookie", "refreshToken=" + refreshToken)
        .expect(HttpStatus.OK);

      expect(response.body.data).toEqual(expect.objectContaining({
        access_token: expect.any(String)
      }));

      user.access_token = response.body.data.access_token;
    });
  });

  describe("POST /auth/logout", (): void => {
    it("should return an err that token is not valid", async (): Promise<void> => {
      const response: request.Response = await request(app.getHttpServer())
        .post("/auth/logout")
        .expect(HttpStatus.UNAUTHORIZED)

      expect(response.body).toHaveProperty("message", "token is not valid");
    });

    it("should return an err that device is not valid", async (): Promise<void> => {
      const response: request.Response = await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", "Bearer invalid_token")
        .expect(HttpStatus.UNAUTHORIZED)

      expect(response.body).toHaveProperty("message", "device is not valid");
    });

    it("should return logged out successfully", async (): Promise<void> => {
      const response: request.Response = await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", "Bearer " + user.access_token)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveProperty("message", "logged out successfully")
    })
  })

});
