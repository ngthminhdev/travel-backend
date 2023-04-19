import {Injectable} from '@nestjs/common';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Injectable()
export class AhpService {

  constructor(
      @InjectDataSource()
      private readonly db: DataSource
  ) {
  }

  find(query: any) {
    const {q} = query;

    return this.db.query(`
      SELECT * FROM bag WHERE "Title" LIKE '%${q}%'
      UNION ALL
      SELECT * FROM bag WHERE "Href" LIKE '%${q}%'
      UNION ALL
      SELECT * FROM bag WHERE "Img" LIKE '%${q}%'
      UNION ALL
      SELECT * FROM bag WHERE "MaSp" LIKE '%${q}%'
    `)
  }
}
