import AWS from 'aws-sdk';
import { importProductsFile } from '../handler';
import { httpEventMock } from '../../../__mocks__/httpEventMock';

const defaultEvent = {
  ...httpEventMock,
  queryStringParameters: {
    name: 'test.csv',
  },
} as any;

beforeAll(() => {
  jest.spyOn(AWS.S3.prototype, 'getSignedUrl').mockImplementation(() => 'test.com');
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Test import product file', () => {
  it('AWS URL correct', async () => {
    const response = await importProductsFile(defaultEvent);
    expect(JSON.parse(response.body).url).toEqual('test.com');
    expect(response.statusCode).toEqual(200);
  });
});
