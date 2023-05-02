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
    const {q, size, price} = query;

    return this.db.query(`
      SELECT * FROM bag WHERE 
        "Title" LIKE '%${q}%' OR "Href" LIKE '%${q}%'
        and "KichCo" LIKE '%${size}%' and "Price" ${price}
    `)
  }
}
