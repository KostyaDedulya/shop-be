import { SNS } from 'aws-sdk';
import { Context } from 'aws-lambda';
import { catalogBatchProcess } from '../handler';
import { postProductToDB } from '../../../db/postProduct';

jest.mock('../../../db/postProduct');
jest.mock('aws-sdk', () => ({
  SNS: jest.fn(() => ({ publish: jest.fn() })),
}));

const product = { title: 'test car', description: 'test car', count: '15', price: '35' };

describe('Test catalogBatchProcess', () => {
  let mockEvent;

  beforeEach(() => {
    mockEvent = {
      Records: [
        {
          body: JSON.stringify(product),
        },
      ],
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should invoke function', async () => {
    await catalogBatchProcess(mockEvent, {} as Context, () => {});
    expect(SNS).toHaveBeenCalled();
  });

  it('should call post db method', async () => {
    await catalogBatchProcess(mockEvent, {} as Context, () => {});
    expect(postProductToDB).toHaveBeenCalled();
    expect(postProductToDB).toHaveBeenCalledWith(product);
  });

  it('should call SNS method', async () => {
    await catalogBatchProcess(mockEvent, {} as Context, () => {});
    const mockSNSPublish = SNS['mock'].results[0].value.publish;
    expect(mockSNSPublish).toHaveBeenCalledWith({
      Subject: `New product ${product.title}`,
      Message: JSON.stringify(product),
      TopicArn: process.env.TOPIC_ARN,
      MessageAttributes: {
        price: {
          DataType: 'Number',
          StringValue: `${product.price}`,
        },
      },
    });
  });
});
