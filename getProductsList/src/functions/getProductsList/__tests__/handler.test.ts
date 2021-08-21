import { data } from './../../data';
import { getProductsList } from '../handler';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Get product by id', () => {
  it('Get product by id', async () => {
    const response = await getProductsList();
    const result = JSON.parse(response.body).data;
    const { statusCode } = response;

    expect(result).toEqual(data);
    expect(statusCode).toEqual(200);
  });
});
