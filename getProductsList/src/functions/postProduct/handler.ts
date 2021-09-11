import 'source-map-support/register';

import type { HttpEventPostRequest } from '../../libs/apiGateway';
import {formatJSONResponse, responseBadRequest, responseInternalError} from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Client } from 'pg';
import {DBOptions} from "../../config/dbconfig";

interface BodyRequest {
  title: string;
  description: string;
  price: number;
  count: number;
}

export const postProduct = async (event: HttpEventPostRequest<BodyRequest>): Promise<APIGatewayProxyResult> => {
  console.log(`postProductToRDS, method: ${event.httpMethod}, body: ${JSON.stringify(event.body)}`);

  const client = new Client(DBOptions);

  const { title, description, price, count } = event.body;

  if (!title || !description || !price || !count || count < 0 || price < 0) return responseBadRequest();

  try {
    await client.connect();
  } catch (e) {
    return responseInternalError();
  }

  try {
    await client.query('BEGIN');
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
    await client.query('COMMIT');
    car.rows[0].count = stock.rows[0].count;
    return formatJSONResponse(car.rows);
  } catch (e) {
    await client.query('ROLLBACK');
    return responseInternalError();
  } finally {
    client.end();
  }
};

export const main = middyfy(postProduct);
