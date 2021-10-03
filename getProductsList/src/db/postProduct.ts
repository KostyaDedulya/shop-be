import { Client } from 'pg';
import { DBOptions } from '../config/dbconfig';

interface IProduct {
  title: string;
  description: string;
  price: number;
  count: number;
}

export async function postProductToDB(data: IProduct) {
  console.log(`${data} will post to db`);
  const client = new Client(DBOptions);

  const { title, description, price, count } = data;

  if (!title || !description || !price || !count || +count < 0 || +price < 0) return null;

  try {
    await client.connect();
  } catch (e) {
    throw new Error('Trouble with connection to DB');
  }

  try {
    await client.query('BEGIN');
    const car = await client.query({
      text: `
        insert into products (title, description, price) values
            ($1, $2, $3)
            returning *
      `,
      values: [title, description, +price],
    });
    console.log(`${JSON.stringify(car)} posted to db`);
    const carId = car.rows[0].id;
    const stock = await client.query({
      text: `
        insert into stocks (product_id, count) values
            ($1, $2)
            returning *
      `,
      values: [carId, +count],
    });
    console.log(`${JSON.stringify(stock)} posted to db`);
    await client.query('COMMIT');
    car.rows[0].count = stock.rows[0].count;
    console.log(`Response from DB - ${car.rows}`);
    client.end();
    return car.rows;
  } catch (e) {
    await client.query('ROLLBACK');
    client.end();
    throw new Error('Trouble with connection to DB');
  }
}
