import 'source-map-support/register';

import type { HttpEventRequest } from '../../libs/apiGateway';
import {formatJSONResponse, responseBadRequest, responseInternalError} from '../../libs/apiGateway';
import { middyfy } from '../../libs/lambda';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Client } from 'pg';
import {checkUUID} from "../../utils/checkUUID";
import {DBOptions} from "../../config/dbconfig";


export const getProductByIdFromRDS = async (event: HttpEventRequest<{ id: string }>): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters;
  const client = new Client(DBOptions);

  console.log(`getProductById, method: ${event.httpMethod}, id: ${id}`)

  if(!checkUUID(id)) return responseBadRequest();

  try {
    await client.connect();
  } catch (e) {
    return responseInternalError();
  }

  try {
    const data = await client.query({
      text: `
        select id, title, description, s.count, price from products p
          inner join stocks s on p.id = s.product_id
          where id = $1
      `,
      values:[id]
    });
    console.log(data.rows);
    if (data.rows.length < 1) {
      return formatJSONResponse(
        {
          errorMessage: 'Product not found',
        },
        404
      );
    }
    return formatJSONResponse({
      data: data.rows[0],
    });
  } catch (e) {
    return responseInternalError();
  } finally {
    client.end();
  }
};

export const main = middyfy(getProductByIdFromRDS);
