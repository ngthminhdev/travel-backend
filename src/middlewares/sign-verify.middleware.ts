import { HttpStatus, Injectable } from "@nestjs/common";
import { NextFunction } from "express";
import { MRequest } from "../types/middleware";
import { ExceptionResponse } from "../exceptions/common.exception";
import * as crypto from "crypto";

@Injectable()
export class SignVerifyMiddleware {
  use(req: MRequest, res: Response, next: NextFunction) {
    const sign: string = req.headers.sign;
    const data: string = JSON.stringify({ query: req.query, params: req.params });
    console.log({ data });
    console.log({ query: req.query, params: req.params });
    if (!sign)
      throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, "Yêu cầu không hợp lệ!");

    //generate serverSign depend on params and query to compare
    const serverSign: string = crypto
      .createHmac("sha256", process.env.SECRET_SIGN_KEY)
      .update(data)
      .digest("hex");

    console.log({ serverSign });

    if (sign != serverSign)
      throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, "Yêu cầu không hợp lệ!");
    next();
  }
}
