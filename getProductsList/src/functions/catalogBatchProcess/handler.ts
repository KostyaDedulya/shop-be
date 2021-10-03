import 'source-map-support/register';

import { middyfy } from '../../libs/lambda';
import { SQSHandler } from 'aws-lambda';
import { postProductToDB } from '../../db/postProduct';

export const catalogBatchProcess: SQSHandler = async (event): Promise<void> => {
  console.log(event.Records);
  for (const r of event.Records) {
    try {
      const product = JSON.parse(r.body);
      console.log(`${product} will save to DB.`);
      const savedProduct = await postProductToDB(product);
      console.log(`Product saved to DB. ${JSON.stringify(savedProduct)}`);
    } catch (e) {
      console.log("Product didn't save to DB");
    }
  }
};

export const main = middyfy(catalogBatchProcess);
