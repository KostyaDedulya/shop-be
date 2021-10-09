import 'source-map-support/register';

import { middyfy } from '../../libs/lambda';
import { SQSHandler } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import { postProductToDB } from '../../db/postProduct';

export const catalogBatchProcess: SQSHandler = async (event): Promise<void> => {
  console.log(event.Records);

  const sns = new SNS({ region: 'eu-west-1' });

  let savedProduct;

  for (const r of event.Records) {
    try {
      const product = JSON.parse(r.body);
      console.log(`${product} will save to DB.`);
      [savedProduct] = await postProductToDB(product);
      console.log(`Product saved to DB. ${JSON.stringify(savedProduct)}`);
    } catch (e) {
      console.log("Product didn't save to DB");
    }

    try {
      if (savedProduct) {
        await sns
          .publish({
            Subject: `New product ${savedProduct.title}`,
            Message: JSON.stringify(savedProduct),
            TopicArn: process.env.TOPIC_ARN,
            MessageAttributes: {
              price: {
                DataType: 'Number',
                StringValue: `${savedProduct.price}`,
              },
            },
          })
          .promise();
        console.log('Email send');
      }
    } catch (e) {
      console.log(`Cannot send message. Error: ${e}`);
    }
  }
};

export const main = middyfy(catalogBatchProcess);
