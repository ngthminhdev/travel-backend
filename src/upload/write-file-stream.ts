import { HttpStatus, Logger } from "@nestjs/common";
import * as fs from "fs";
import { ExceptionResponse } from "../exceptions/common.exception";

export const writeFileStream = async (data: any, path: string, option?: any) => {
  const logger = new Logger("MoveFileDetectLogger");
  const wFile = fs.createWriteStream(path);

  new Promise((resolve, reject) => {
    wFile.on("error", reject);
    wFile.write(data);
    wFile.on("finish", resolve);
  }).catch((e) => {
      wFile.close();
      logger.error(e);
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "Write file error");
    }
  );
};
