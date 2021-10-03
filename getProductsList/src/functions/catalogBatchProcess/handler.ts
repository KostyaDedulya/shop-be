import 'source-map-support/register';

import { middyfy } from '../../libs/lambda';
import { SQSHandler } from 'aws-lambda';

export const catalogBatchProcess: SQSHandler = async (event): Promise<void> => {
  console.log(event.Records);
};

export const main = middyfy(catalogBatchProcess);
