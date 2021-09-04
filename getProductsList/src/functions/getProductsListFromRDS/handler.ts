import 'source-map-support/register';
import {Client, ClientConfig} from 'pg';

import {formatJSONResponse, responseInternalError} from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

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

export const getProductsListFromRDS = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(`getProductsListFromRDS, method: ${event.httpMethod}`);
  const client = new Client(DBOptions);

  try {
    await client.connect();
  } catch (e) {
    return responseInternalError();
  }

  try {
    const data = await client.query(`
      select id, title, description, s.count, price from products p
         inner join stocks s on p.id = s.product_id
    `)
    console.log(data);
    return formatJSONResponse({
      data: data.rows
    });
  } catch (e) {
    return formatJSONResponse({
      errorMessage: 'Something gone wrong'
    }, 400);
  } finally {
    client.end();
  }

};

export const main = middyfy(getProductsListFromRDS);
