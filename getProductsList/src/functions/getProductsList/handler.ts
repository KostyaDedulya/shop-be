import 'source-map-support/register';

import { Client } from 'pg';
import {formatJSONResponse, responseInternalError} from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {DBOptions} from "../../config/dbconfig";



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
    return responseInternalError();
  } finally {
    client.end();
  }

};

export const main = middyfy(getProductsListFromRDS);
