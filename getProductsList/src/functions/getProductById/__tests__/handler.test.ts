import { getProductById } from '../handler';
import { httpEventMock } from '../../../__mocks__/httpEventMock';

const defaultEvent = {
  ...httpEventMock,
  pathParameters: {
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80a0',
  },
} as any;

const defaultEventNotFound = {
  ...httpEventMock,
  pathParameters: {
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80a01',
  },
} as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Get product by id', () => {
  it('Get product by id', async () => {
    const response = await getProductById(defaultEvent);
    const result = JSON.parse(response.body);
    const { data } = result;
    const { statusCode } = response;
    const expected = {
      count: 6,
      description: 'Ferrari',
      id: '7567ec4b-b10c-48c5-9345-fc73c48a80a0',
      price: 10,
      title: 'Ferrari',
    };

    expect(data).toEqual(expected);
    expect(statusCode).toEqual(200);
  });

  it('Get not found', async () => {
    const response = await getProductById(defaultEventNotFound);
    const result = JSON.parse(response.body);
    const { statusCode } = response;
    const expected = {
      errorMessage: 'Product not found',
    };
    expect(expected).toEqual(result);
    expect(statusCode).toEqual(404);
  });
});
