import 'source-map-support/register';

import type { HttpEventRequest } from '../../libs/apiGateway';
import {formatJSONResponse, responseBadRequest, responseInternalError} from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Client, ClientConfig } from 'pg';
import {checkUUID} from "../../utils/checkUUID";

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

export const getProductByIdFromRDS = async (event: HttpEventRequest<{ id: string }>): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters;
  const client = new Client(DBOptions);

  console.log('getProductById')

  if(!checkUUID(id)) return responseBadRequest();

  try {
    await client.connect();
  } catch (e) {
    return responseInternalError();
  }

  try {
    const data = await client.query(`
      select id, title, description, s.count, price from products p 
        inner join stocks s on p.id = s.product_id
        where id = ${id}
    `)
    if (data.rows.length === 0) throw new Error();
    return formatJSONResponse({
      data: data.rows[0],
    });
  } catch (e) {
    return formatJSONResponse(
      {
        errorMessage: 'Product not found',
      },
      404
    );
  }
};

export const main = middyfy(getProductByIdFromRDS);
