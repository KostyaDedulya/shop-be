create table products (
	id uuid primary key default uuid_generate_v4(),
	title text,
	description text,
	price integer
)

create table stocks (
	product_id uuid,
	count integer,
	foreign key ("product_id") references "products" ("id")
)

insert into products (title, description, price) values
	('Bentley', 'Bentley', 24),
	('Ferrari', 'Ferrari', 34),
	('Rolls Royce', 'Rolls Royce', 50),
	('BMW', 'BMW', 10),
	('Mercedes', 'Mercedes', 11),
	('Audi', 'Audi', 9),
	('Pagani', 'Pagani', 65),
	('Bugatti', 'Bugatti', 58);

insert into stocks (product_id, count) values
	('0011acbf-0531-4b36-b60e-8507e7a70902', 10),
	('08fbe45c-019b-4eee-9757-293686961c68', 6),
	('9abfee23-4e0b-4df9-9c75-3e9fc818de6b', 7),
	('200d196b-32e1-4533-af2c-f4086b0a9639', 22),
	('e9a2e017-76f9-4170-a9ba-b2adad1141b1', 20),
	('13179034-a8fc-42e6-a645-737f802ad4da', 30),
	('6522ff81-0b7f-485f-823b-f6ef5c9d4e5a', 2),
	('5b2aace8-49e1-4272-8f42-5eae2b394a79', 4);
