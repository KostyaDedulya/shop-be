import 'source-map-support/register';

import type { HttpEventPostRequest } from '../../libs/apiGateway';
import {formatJSONResponse, responseBadRequest, responseInternalError} from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Client, ClientConfig } from 'pg';

interface BodyRequest {
  title: string;
  description: string;
  price: number;
  count: number;
}

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const DBOptions: ClientConfig = {
  host: PG_HOST,
  port: Number(PG_PORT),
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
}

export const postProductToRDS = async (event: HttpEventPostRequest<BodyRequest>): Promise<APIGatewayProxyResult> => {
  console.log(`postProductToRDS, method: ${event.httpMethod}, body: ${JSON.stringify(event.body)}`);

  const client = new Client(DBOptions);

  const { title, description, price, count } = event.body;

  if (!title || !description || !price || !count) return responseBadRequest();

  try {
    await client.connect();
  } catch (e) {
    return responseInternalError();
  }

  try {
    const car = await client.query({
      text: `
        insert into products (title, description, price) values
            ($1, $2, $3)
            returning *
      `,
      values:[title, description, price]
    });
    const carId = car.rows[0].id;
    const stock = await client.query({
      text: `
        insert into stocks (product_id, count) values
            ($1, $2)
            returning *
      `,
      values:[carId, count]
    });
    car.rows[0].count = stock.rows[0].count;
    return formatJSONResponse(car.rows);
  } catch (e) {
    return responseInternalError();
  } finally {
    client.end();
  }
};

export const main = middyfy(postProductToRDS);
